import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Calendar, MapPin, Users, X, UserPlus, UserMinus, Crown, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';

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
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [showAllVolunteersInAdmin, setShowAllVolunteersInAdmin] = useState(false);

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

  const getManagersForProject = (project: any) => {
    if (!project.managers || !Array.isArray(project.managers)) return [];
    return project.managers.map((managerId: string) => {
      const manager = users.find((u) => u.id === managerId);
      return manager || { id: managerId, name: 'Usuario no encontrado', role: 'unknown' };
    });
  };

  // Stats
  const activeProjectsCount = projects.filter(p => p.status === 'activo').length;
  const completedProjectsCount = projects.filter(p => p.status === 'finalizado').length;
  const totalAssignments = assignments.length;

  // Handlers
  const handleCreate = () => {
    setEditingProject({
      name: '',
      description: '',
      areaId: '',
      startDate: '',
      endDate: '',
      objectives: '',
      status: 'activo',
      published: false,
      managers: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject({ ...project, managers: project.managers || [] });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const loadingId = showLoading(
      editingProject.id ? 'Actualizando proyecto...' : 'Creando proyecto...',
      'Por favor espera un momento'
    );

    try {
      // Logic to unpublish if inactive
      const finalProjectData = { ...editingProject };
      const originalProject = projects.find(p => p.id === editingProject.id);

      // 1. If becoming Inactive
      if (finalProjectData.status === 'inactivo') {
        // Auto-unpublish
        if (finalProjectData.published) {
          finalProjectData.published = false;
          showError('Aviso', 'El proyecto se ha despublicado automáticamente por estar inactivo.');
        }

        // Close associated Convocatoria
        if (editingProject.id) {
          const linkedConvocatoria = convocatorias.find(c => c.projectId === editingProject.id);
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
        if (editingProject.id) {
          const linkedConvocatoria = convocatorias.find(c => c.projectId === editingProject.id);
          if (linkedConvocatoria) {
            await apiPut(`/convocatorias/${linkedConvocatoria.id}`, { ...linkedConvocatoria, status: 'en_proceso' });
            refetchConvocatorias();
            showSuccess('Información', 'La convocatoria asociada ha pasado a estado "Sin Publicar".');
          }
        }
      }

      if (editingProject.id) {
        await apiPut(`/projects/${editingProject.id}`, finalProjectData);
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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
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
      }
    }
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
    setShowAllVolunteersInAdmin(false);
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

  // Render Detail Card
  const renderDetailCard = () => {
    if (!activeProject) return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles del Proyecto</h3>
        <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
          Selecciona un proyecto de la lista para ver sus detalles, encargados y gestionar sus voluntarios.
        </p>
      </div>
    );

    const managers = getManagersForProject(activeProject);
    const volunteerCount = getVolunteersForProject(activeProject.id).length;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        {/* Top Section: Header & Info */}
        <div className="p-6 pb-0">
          {/* Header */}
          <div className="flex items-start gap-4 mb-3">
            <div className="bg-emerald-50 rounded-xl p-2.5 shrink-0">
              <FolderOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{activeProject.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${activeProject.status === 'activo' ? 'bg-emerald-100 text-emerald-800' :
                  activeProject.status === 'finalizado' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {activeProject.status === 'activo' ? '● Activo' : activeProject.status === 'finalizado' ? '✓ Finalizado' : 'Inactivo'}
                </span>
                {activeProject.published && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    👁️ Público
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-2">
            {activeProject.description}
          </p>

          {/* Managers Section */}
          {managers.length > 0 ? (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-6 transition-colors hover:border-yellow-300">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Encargados</span>
              </div>
              <div className="space-y-3">
                {managers.map((manager: any) => (
                  <div key={manager.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold text-xs shadow-sm ring-2 ring-white">
                      {manager.name?.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{manager.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${manager.role === 'admin_master' ? 'bg-purple-100 text-purple-700' :
                        manager.role === 'admin' ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {manager.role === 'admin_master' ? 'Master' : manager.role === 'admin' ? 'Admin' : 'Voluntario'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 mb-6 transition-colors hover:border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-red-700" />
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Encargado</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-red-800">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-200 text-red-900 text-xs shadow-sm ring-2 ring-white">!</span>
                Sin encargado asignado
              </div>
            </div>
          )}

          {/* Details List */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-gray-700">{getAreaName(activeProject.areaId)}</p>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
              <p className="text-sm font-medium text-gray-700">
                {new Date(activeProject.startDate).toLocaleDateString('es-ES')} - {new Date(activeProject.endDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-purple-600 shrink-0" />
              <p className="text-sm font-medium text-gray-700">{volunteerCount} voluntarios</p>
            </div>
          </div>

          {/* Objectives Box */}
          {activeProject.objectives && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-700">Objetivos:</span> {activeProject.objectives}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions - Horizontal Button Row RESTORED */}
        <div className="p-4 pt-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => handleEdit(activeProject)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 font-bold text-sm"
          >
            <Edit className="w-4 h-4" /> Editar
          </button>

          <button
            onClick={() => handleTogglePublish(activeProject)}
            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-colors ${activeProject.published
              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' // Active: Colored
              : 'bg-purple-50 text-purple-400 border-purple-100 hover:bg-purple-100' // Inactive: Faded but visible
              }`}
            title={activeProject.published ? "Ocultar" : "Publicar"}
          >
            {activeProject.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleManageManagers(activeProject)}
            disabled={activeProject.status === 'finalizado'}
            className={`flex items-center justify-center px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 transition-colors ${activeProject.status === 'finalizado' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-100'
              }`}
            title={activeProject.status === 'finalizado' ? "Reinicia el proyecto para gestionar encargados" : "Gestionar Encargados"}
          >
            <Crown className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleManageVolunteers(activeProject)}
            disabled={activeProject.status === 'finalizado'}
            className={`flex items-center justify-center px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 transition-colors ${activeProject.status === 'finalizado' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-100'
              }`}
            title={activeProject.status === 'finalizado' ? "Reinicia el proyecto para gestionar voluntarios" : "Gestionar Voluntarios"}
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(activeProject.id, activeProject.name)}
            className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

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
                      className={`
                                 cursor-pointer transition-colors
                                 ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                            `}
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
          {renderDetailCard()}
        </div>
      </div>

      {/* MODALS */}
      {/* Edit Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-gray-900 font-bold text-lg">
                {editingProject.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Form Elements */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Nombre del Proyecto *</label>
                <input type="text" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Conservación de Especies Amazónicas" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Descripción *</label>
                <textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} rows={4} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Describe el proyecto..." />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Área *</label>
                <select value={editingProject.areaId} onChange={(e) => setEditingProject({ ...editingProject, areaId: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecciona un área</option>
                  {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Fecha de Inicio *</label>
                  <input type="date" value={editingProject.startDate} onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Fecha de Fin *</label>
                  <input type="date" value={editingProject.endDate} onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Objetivos</label>
                <textarea value={editingProject.objectives} onChange={(e) => setEditingProject({ ...editingProject, objectives: e.target.value })} rows={3} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Objetivos del proyecto..." />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Estado</label>
                <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg">
                <input type="checkbox" id="published" checked={editingProject.published || false} onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })} className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <label htmlFor="published" className="text-gray-700 cursor-pointer">
                  <span className="font-bold text-purple-900">Publicar en el Landing</span>
                  <p className="text-sm text-purple-800">Al publicar, el proyecto será visible para usuarios públicos</p>
                </label>
              </div>
            </div>
            <div className="p-6 border-t-2 border-gray-200 flex gap-3 bg-gray-50">
              <button onClick={() => { setIsModalOpen(false); setEditingProject(null); }} className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">Cancelar</button>
              <button onClick={handleSave} disabled={!editingProject.name || !editingProject.description || !editingProject.areaId} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold">Guardar Proyecto</button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Management Modal */}
      {managingManagers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-200 p-2 rounded-lg"><Crown className="w-6 h-6 text-amber-800" /></div>
                  <div><h3 className="text-gray-900 font-bold">Gestión de Encargados</h3><p className="text-amber-800 text-sm font-semibold">{managingManagers.name}</p></div>
                </div>
                <button onClick={() => setManagingManagers(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Existing Managers */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Encargados Actuales</h4>
                {getManagersForProject(managingManagers).length > 0 ? (
                  <div className="space-y-2">
                    {getManagersForProject(managingManagers).map((manager: any) => (
                      <div key={manager.id} className="flex items-center justify-between p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-800">{manager.name?.charAt(0)}</div>
                          <span className="text-gray-900 font-semibold">{manager.name} ({manager.role})</span>
                        </div>
                        <button onClick={() => handleRemoveManager(manager.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"><UserMinus className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500">No hay encargados asignados</div>}
              </div>
              {/* Add Manager */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Agregar Encargado</h4>
                <div className="flex items-center gap-3">
                  <select value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg">
                    <option value="">Selecciona un encargado</option>
                    {eligibleManagers.filter(v => !(managingManagers.managers || []).includes(v.id)).map(person => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
                  </select>
                  <button onClick={() => { if (selectedManager) { handleAddManager(selectedManager); setSelectedManager(''); } }} disabled={!selectedManager} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Agregar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Management Modal */}
      {managingVolunteers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-200 p-2 rounded-lg"><Users className="w-6 h-6 text-teal-800" /></div>
                  <div><h3 className="text-gray-900 font-bold">Gestión de Voluntarios</h3><p className="text-teal-800 text-sm font-semibold">{managingVolunteers.name}</p></div>
                </div>
                <button onClick={() => setManagingVolunteers(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Voluntarios Asignados</h4>
                {getVolunteersForProject(managingVolunteers.id).length > 0 ? (
                  <div className="space-y-2">
                    {(showAllVolunteersInAdmin ? getVolunteersForProject(managingVolunteers.id) : getVolunteersForProject(managingVolunteers.id).slice(0, 6)).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 bg-teal-50 border-2 border-teal-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center font-bold text-teal-800">{volunteer.name?.charAt(0)}</div>
                          <span className="text-gray-900 font-semibold">{volunteer.name}</span>
                        </div>
                        <button onClick={() => {
                          const assignment = assignments.find(a => a.projectId === managingVolunteers.id && a.volunteerId === volunteer.id);
                          if (assignment) handleRemoveVolunteer(assignment.id);
                        }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"><UserMinus className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {getVolunteersForProject(managingVolunteers.id).length > 6 && !showAllVolunteersInAdmin && (
                      <button
                        onClick={() => setShowAllVolunteersInAdmin(true)}
                        className="w-full py-2 bg-gray-50 text-emerald-600 font-semibold text-sm rounded-lg hover:bg-emerald-50 border-2 border-dashed border-emerald-200 transition-colors mt-2"
                      >
                        Ver todos ({getVolunteersForProject(managingVolunteers.id).length} voluntarios)
                      </button>
                    )}
                    {getVolunteersForProject(managingVolunteers.id).length > 6 && showAllVolunteersInAdmin && (
                      <button
                        onClick={() => setShowAllVolunteersInAdmin(false)}
                        className="w-full py-2 bg-gray-50 text-gray-500 font-semibold text-sm rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-200 transition-colors mt-2"
                      >
                        Ocultar
                      </button>
                    )}
                  </div>
                ) : <div className="text-center py-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500">No hay voluntarios asignados</div>}
              </div>
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Agregar Voluntario</h4>
                <div className="flex items-center gap-3">
                  <select value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg">
                    <option value="">Selecciona un voluntario</option>
                    {volunteers.filter(v => !getVolunteersForProject(managingVolunteers.id).find(ev => ev.id === v.id)).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <button onClick={() => { if (selectedVolunteer) { handleAddVolunteer(managingVolunteers.id, selectedVolunteer); setSelectedVolunteer(''); } }} disabled={!selectedVolunteer} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Agregar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
