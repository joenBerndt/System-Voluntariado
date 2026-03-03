import { useState, useEffect } from 'react';
import { Search, Plus, FolderOpen, CheckCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { ProjectFormModal } from './projects/ProjectFormModal';
import { ManagerManagementModal } from './projects/ManagerManagementModal';
import { VolunteerManagementModal } from './projects/VolunteerManagementModal';
import { ProjectDetailCard } from './projects/ProjectDetailCard';
import { AdminTableSkeleton, DetailPanelSkeleton, StatsSkeleton } from '../common/Skeletons';
import { ConfirmationModal } from '../common/ConfirmationModal';

export function ProjectsAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7); // Default

  const [activeProject, setActiveProject] = useState<any>(null); // Right panel selection

  // Modals state
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managingVolunteers, setManagingVolunteers] = useState<any>(null);

  const [managingManagers, setManagingManagers] = useState<any>(null);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => { },
  });

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  // Data fetching
  const { data: projectsData, loading, refetch } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: usersData } = useApi<any[]>('/users');
  const { data: assignmentsData, refetch: refetchAssignments } = useApi<any[]>('/project-assignments');
  const { data: convocatoriasData, refetch: refetchConvocatorias } = useApi<any[]>('/convocatorias');

  const projects = projectsData || [];
  const areas = areasData || [];
  const volunteers = volunteersData || [];
  const users = usersData || [];
  const assignments = assignmentsData || [];
  const convocatorias = convocatoriasData || [];

  // Responsive: Adjust itemsPerPage
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 1280 ? 8 : 6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter eligible managers: volunteers, admins, and admin_master
  const eligibleManagers = users.filter(u =>
    u.role === 'volunteer' || u.role === 'admin' || u.role === 'admin_master'
  );

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = filterArea === 'all' || project.areaId === filterArea;

    const matchesManager = managerFilter === 'all' ||
      (managerFilter === 'unassigned'
        ? (!project.managers || project.managers.length === 0)
        : (project.managers && project.managers.includes(managerFilter)));

    return matchesSearch && matchesArea && matchesManager;
  });

  // Calculate pages
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper Functions
  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    return area ? area.name : 'Sin área asignada';
  };

  const getVolunteersForProject = (projectId: string) => {
    return assignments
      .filter((assignment) => assignment.projectId === projectId)
      .map((assignment) => {
        const volunteer = volunteers.find((v) => v.id === assignment.volunteerId);
        return volunteer || { id: assignment.volunteerId, name: 'Voluntario no encontrado' };
      });
  };

  // Stats
  const activeProjectsCount = projects.filter(p => p.status === 'activo').length;
  const completedProjectsCount = projects.filter(p => p.status === 'finalizado').length;
  const totalAssignments = assignments.length;

  // Handlers
  const handleCreate = () => {
    setEditingProject(null); // The modal handles default state for null
    setIsModalOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject({ ...project, managers: project.managers || [] });
    setIsModalOpen(true);
  };

  const handleSave = async (projectData: any) => {
    const loadingId = showLoading(
      projectData.id ? 'Actualizando proyecto...' : 'Creando proyecto...',
      'Por favor espera un momento'
    );

    try {
      // Logic to unpublish if inactive
      const finalProjectData = { ...projectData };
      const originalProject = projects.find(p => p.id === projectData.id);

      // 1. If becoming Inactive
      if (finalProjectData.status === 'inactivo') {
        // Auto-unpublish
        if (finalProjectData.published) {
          finalProjectData.published = false;
          showError('Aviso', 'El proyecto se ha despublicado automáticamente por estar inactivo.');
        }

        // Close associated Convocatoria
        if (projectData.id) {
          const linkedConvocatoria = convocatorias.find(c => c.projectId === projectData.id);
          if (linkedConvocatoria && linkedConvocatoria.status !== 'cerrada') {
            await apiPut(`/convocatorias/${linkedConvocatoria.id}`, { ...linkedConvocatoria, status: 'cerrada' });
            refetchConvocatorias();
            showSuccess('Información', 'La convocatoria asociada se ha cerrado automáticamente.');
          }
        }
      }

      // 2. If becoming Active (Transition from non-active)
      if (originalProject && originalProject.status !== 'activo' && finalProjectData.status === 'activo') {
        // "si se activa el proyecto se vuelve sin publicar"
        finalProjectData.published = false;

        // Auto-update associated Convocatoria to 'Sin Publicar'
        if (projectData.id) {
          const linkedConvocatoria = convocatorias.find(c => c.projectId === projectData.id);
          if (linkedConvocatoria) {
            await apiPut(`/convocatorias/${linkedConvocatoria.id}`, { ...linkedConvocatoria, status: 'en_proceso' });
            refetchConvocatorias();
            showSuccess('Información', 'La convocatoria asociada ha pasado a estado "Sin Publicar".');
          }
        }
      }

      if (projectData.id) {
        await apiPut(`/projects/${projectData.id}`, finalProjectData);
        hideNotification(loadingId);
        showSuccess('¡Proyecto actualizado!', `"${finalProjectData.name}" se actualizó correctamente`);
        // Update active project if needed
        if (activeProject?.id === finalProjectData.id) {
          setActiveProject({ ...activeProject, ...finalProjectData });
        }
      } else {
        await apiPost('/projects', finalProjectData);
        hideNotification(loadingId);
        showSuccess('¡Proyecto creado!', `"${finalProjectData.name}" listo para asignar voluntarios`);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      refetch();
    } catch (err: any) {
      console.error('Error saving project:', err);
      hideNotification(loadingId);
      showError('Error al guardar', err?.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar Proyecto',
      description: '¿Estás seguro de que deseas eliminar este proyecto?',
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const loadingId = showLoading('Eliminando proyecto...', 'Espera un momento');
        try {
          await apiDelete(`/projects/${id}`);
          hideNotification(loadingId);
          showSuccess('¡Proyecto eliminado!', `"${name}" fue eliminado exitosamente`);
          refetch();
          setActiveProject(null);
        } catch (err: any) {
          console.error('Error deleting:', err);
          hideNotification(loadingId);
          showError('Error al eliminar', err?.message);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleTogglePublish = async (project: any) => {
    if (!project.published && !project.areaId) {
      showError('Acción requerida', 'Debes asignar un área al proyecto antes de publicarlo.');
      setEditingProject(project);
      setIsModalOpen(true);
      return;
    }

    if (!project.published && project.status !== 'activo' && project.status !== 'finalizado') {
      showError('Acción requerida', `No puedes publicar un proyecto con estado "${project.status}". Actívalo o finalízalo primero.`);
      return;
    }

    const loadingId = showLoading(project.published ? 'Ocultando...' : 'Publicando...', 'Espera un momento');
    try {
      const updatedProject = { ...project, published: !project.published };
      await apiPut(`/projects/${project.id}`, updatedProject);
      hideNotification(loadingId);
      showSuccess(updatedProject.published ? '¡Proyecto publicado!' : 'Proyecto ocultado', '');
      refetch();
      if (activeProject?.id === project.id) {
        setActiveProject(updatedProject);
      }
    } catch (err: any) {
      console.error('Error toggling publish:', err);
      hideNotification(loadingId);
      showError('Error al cambiar visibilidad', err?.message);
    }
  };

  // Manager/Volunteer Handlers
  const handleManageManagers = (project: any) => setManagingManagers(project);
  const handleManageVolunteers = (project: any) => {
    setManagingVolunteers(project);
  };

  const handleAddManager = async (managerId: string) => {
    if (!managingManagers) return;
    const updatedManagers = [...(managingManagers.managers || []), managerId];
    try {
      await apiPut(`/projects/${managingManagers.id}`, { ...managingManagers, managers: updatedManagers });
      showSuccess('Éxito', 'Encargado agregado exitosamente');
      const updatedProject = { ...managingManagers, managers: updatedManagers };
      setManagingManagers(updatedProject);
      if (activeProject?.id === managingManagers.id) setActiveProject(updatedProject);
      refetch();
    } catch (err) { showError('Error', 'Error al agregar el encargado'); }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!managingManagers) return;
    const updatedManagers = (managingManagers.managers || []).filter((id: string) => id !== managerId);
    try {
      await apiPut(`/projects/${managingManagers.id}`, { ...managingManagers, managers: updatedManagers });
      showSuccess('Éxito', 'Encargado eliminado exitosamente');
      const updatedProject = { ...managingManagers, managers: updatedManagers };
      setManagingManagers(updatedProject);
      if (activeProject?.id === managingManagers.id) setActiveProject(updatedProject);
      refetch();
    } catch (err) { showError('Error', 'Error al eliminar el encargado'); }
  };

  const handleAddVolunteer = async (projectId: string, volunteerId: string) => {
    try {
      await apiPost('/project-assignments', { projectId, volunteerId });
      showSuccess('Éxito', 'Voluntario agregado exitosamente');
      refetchAssignments();
    } catch (err) { showError('Error', 'Error al agregar el voluntario'); }
  };

  const handleRemoveVolunteer = async (assignmentId: string) => {
    try {
      await apiDelete(`/project-assignments/${assignmentId}`);
      showSuccess('Éxito', 'Voluntario eliminado exitosamente');
      refetchAssignments();
    } catch (err) { showError('Error', 'Error al eliminar el voluntario'); }
  };



  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
        </div>
        {/* Stats Skeleton */}
        <StatsSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AdminTableSkeleton rows={7} />
          <div className="lg:sticky lg:top-6 w-full">
            <DetailPanelSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Proyectos</h2>
          <p className="text-gray-500 mt-1">Coordina los proyectos y asigna equipos de trabajo</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-900 font-bold text-2xl">{projects.length}</p>
            <p className="text-gray-500 text-xs font-semibold uppercase">Total Proyectos</p>
          </div>
          <FolderOpen className="w-8 h-8 text-gray-200" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-emerald-700 font-bold text-2xl">{activeProjectsCount}</p>
            <p className="text-emerald-600 text-xs font-semibold uppercase">Activos</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-100" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-teal-700 font-bold text-2xl">{completedProjectsCount}</p>
            <p className="text-teal-600 text-xs font-semibold uppercase">Finalizados</p>
          </div>
          <CheckCircle className="w-8 h-8 text-teal-100" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-purple-700 font-bold text-2xl">{totalAssignments}</p>
            <p className="text-purple-600 text-xs font-semibold uppercase">Voluntarios Asignados</p>
          </div>
          <Users className="w-8 h-8 text-purple-100" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="md:col-span-1">
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-600 bg-white"
            >
              <option value="all">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <select
              value={managerFilter}
              onChange={e => setManagerFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-600 bg-white"
            >
              <option value="all">Todos los encargados</option>
              <option value="unassigned">Sin encargado</option>
              {eligibleManagers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Table */}
        <div className="space-y-4">
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white min-h-[500px] flex flex-col">
            <table className="w-full text-left text-sm text-gray-600 h-full">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Área</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProjects.map((project, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const isSelected = activeProject?.id === project.id;
                  return (
                    <tr
                      key={project.id}
                      onClick={() => setActiveProject(project)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                        {globalIndex.toString().padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm mb-0.5">{project.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{project.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{getAreaName(project.areaId)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${project.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : project.status === 'finalizado'
                            ? 'bg-teal-50 text-teal-700 border-teal-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                          {project.status === 'activo' ? 'ACTIVO' : project.status === 'finalizado' ? 'FINALIZADO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {paginatedProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <button
                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-gray-600">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Detail Card */}
        <div className="lg:sticky lg:top-6 w-full">
          <ProjectDetailCard
            project={activeProject}
            users={users}
            areas={areas}
            volunteerCount={activeProject ? getVolunteersForProject(activeProject.id).length : 0}
            onEdit={handleEdit}
            onTogglePublish={handleTogglePublish}
            onManageManagers={handleManageManagers}
            onManageVolunteers={handleManageVolunteers}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSave={handleSave}
        areas={areas}
      />

      {managingManagers && (
        <ManagerManagementModal
          project={managingManagers}
          onClose={() => setManagingManagers(null)}
          eligibleManagers={eligibleManagers}
          users={users}
          onAddManager={handleAddManager}
          onRemoveManager={handleRemoveManager}
        />
      )}

      {managingVolunteers && (
        <VolunteerManagementModal
          project={managingVolunteers}
          onClose={() => setManagingVolunteers(null)}
          assignments={assignments}
          allVolunteers={volunteers}
          onAddVolunteer={handleAddVolunteer}
          onRemoveVolunteer={handleRemoveVolunteer}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
      />
    </div>
  );
}
