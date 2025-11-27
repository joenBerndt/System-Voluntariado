import { useState } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Calendar, MapPin, Users, X, UserPlus, UserMinus, Crown, Eye, EyeOff } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { LoadingSpinner } from '../LoadingOverlay';
import { useNotifications } from '../../contexts/NotificationContext';

export function ProjectsAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managingVolunteers, setManagingVolunteers] = useState<any>(null);
  const [managingManagers, setManagingManagers] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  
  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();
  
  const { data: projectsData, loading, refetch } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: usersData } = useApi<any[]>('/users');
  const { data: assignmentsData, refetch: refetchAssignments } = useApi<any[]>('/project-assignments');

  const projects = projectsData || [];
  const areas = areasData || [];
  const volunteers = volunteersData || [];
  const users = usersData || [];
  const assignments = assignmentsData || [];

  // Filter eligible managers: volunteers, admins, and admin_master
  const eligibleManagers = users.filter(u => 
    u.role === 'volunteer' || u.role === 'admin' || u.role === 'admin_master'
  );

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = filterArea === 'all' || project.areaId === filterArea;
    
    return matchesSearch && matchesArea;
  });

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
      if (editingProject.id) {
        await apiPut(`/projects/${editingProject.id}`, editingProject);
        hideNotification(loadingId);
        showSuccess(
          '¡Proyecto actualizado!',
          `El proyecto "${editingProject.name}" se actualizó correctamente`
        );
      } else {
        await apiPost('/projects', editingProject);
        hideNotification(loadingId);
        showSuccess(
          '¡Proyecto creado exitosamente!',
          `El proyecto "${editingProject.name}" está listo para asignar voluntarios`
        );
      }
      setIsModalOpen(false);
      setEditingProject(null);
      refetch();
    } catch (err: any) {
      console.error('Error saving project:', err);
      hideNotification(loadingId);
      showError(
        'Error al guardar proyecto',
        err?.message || 'No se pudo guardar el proyecto. Por favor intenta nuevamente.'
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      const loadingId = showLoading('Eliminando proyecto...', 'Espera un momento');
      
      try {
        await apiDelete(`/projects/${id}`);
        hideNotification(loadingId);
        showSuccess(
          '¡Proyecto eliminado!',
          `El proyecto "${name}" fue eliminado exitosamente`
        );
        refetch();
      } catch (err: any) {
        console.error('Error deleting project:', err);
        hideNotification(loadingId);
        showError(
          'Error al eliminar proyecto',
          err?.message || 'No se pudo eliminar el proyecto. Por favor intenta nuevamente.'
        );
      }
    }
  };

  const handleTogglePublish = async (project: any) => {
    const loadingId = showLoading(
      project.published ? 'Ocultando proyecto...' : 'Publicando proyecto...',
      'Espera un momento'
    );
    
    try {
      await apiPut(`/projects/${project.id}`, { ...project, published: !project.published });
      hideNotification(loadingId);
      showSuccess(
        project.published ? 'Proyecto ocultado' : '¡Proyecto publicado!',
        project.published 
          ? `El proyecto "${project.name}" ya no será visible en el landing`
          : `El proyecto "${project.name}" ahora es visible en el landing`
      );
      refetch();
    } catch (err: any) {
      console.error('Error toggling publish:', err);
      hideNotification(loadingId);
      showError(
        'Error al cambiar visibilidad',
        err?.message || 'No se pudo cambiar la visibilidad del proyecto.'
      );
    }
  };

  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area?.name || 'Sin área';
  };

  const getVolunteersForProject = (projectId: string) => {
    return assignments.filter((assignment) => assignment.projectId === projectId).map((assignment) => {
      const volunteer = volunteers.find((volunteer) => volunteer.id === assignment.volunteerId);
      return volunteer || { id: assignment.volunteerId, name: 'Voluntario no encontrado' };
    });
  };

  const getManagersForProject = (project: any) => {
    if (!project.managers || !Array.isArray(project.managers)) return [];
    return project.managers.map((managerId: string) => {
      // First try to find in users (includes all roles)
      const manager = users.find(u => u.id === managerId);
      // Fallback to volunteers for backward compatibility
      const fallback = volunteers.find(v => v.id === managerId);
      return manager || fallback || { id: managerId, name: 'Usuario no encontrado', role: 'unknown' };
    });
  };

  const handleManageVolunteers = (project: any) => {
    setManagingVolunteers(project);
  };

  const handleManageManagers = (project: any) => {
    setManagingManagers(project);
  };

  const handleAddVolunteer = async (projectId: string, volunteerId: string) => {
    try {
      await apiPost('/project-assignments', { projectId, volunteerId });
      alert('Voluntario agregado exitosamente');
      refetchAssignments();
    } catch (err) {
      console.error('Error adding volunteer:', err);
      alert('Error al agregar el voluntario');
    }
  };

  const handleRemoveVolunteer = async (assignmentId: string) => {
    try {
      await apiDelete(`/project-assignments/${assignmentId}`);
      alert('Voluntario eliminado exitosamente');
      refetchAssignments();
    } catch (err) {
      console.error('Error removing volunteer:', err);
      alert('Error al eliminar el voluntario');
    }
  };

  const handleAddManager = async (managerId: string) => {
    if (!managingManagers) return;
    
    const updatedManagers = [...(managingManagers.managers || []), managerId];
    try {
      await apiPut(`/projects/${managingManagers.id}`, { 
        ...managingManagers, 
        managers: updatedManagers 
      });
      alert('Encargado agregado exitosamente');
      setManagingManagers({ ...managingManagers, managers: updatedManagers });
      refetch();
    } catch (err) {
      console.error('Error adding manager:', err);
      alert('Error al agregar el encargado');
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!managingManagers) return;
    
    const updatedManagers = (managingManagers.managers || []).filter((id: string) => id !== managerId);
    try {
      await apiPut(`/projects/${managingManagers.id}`, { 
        ...managingManagers, 
        managers: updatedManagers 
      });
      alert('Encargado eliminado exitosamente');
      setManagingManagers({ ...managingManagers, managers: updatedManagers });
      refetch();
    } catch (err) {
      console.error('Error removing manager:', err);
      alert('Error al eliminar el encargado');
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" message="Cargando proyectos disponibles..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Proyectos</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const managers = getManagersForProject(project);
            
            return (
              <div
                key={project.id}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-2 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-gray-900">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          project.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : project.status === 'finalizado'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {project.status === 'activo' ? '● Activo' : project.status === 'finalizado' ? '✓ Finalizado' : 'Inactivo'}
                        </span>
                        {project.published && (
                          <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            👁️ Público
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Manager Badge */}
                {managers.length > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-900">ENCARGADO{managers.length > 1 ? 'S' : ''}</span>
                    </div>
                    <div className="space-y-1">
                      {managers.map((manager: any) => (
                        <div key={manager.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
                            <span className="text-amber-800 text-xs font-semibold">{manager.name?.charAt(0)}</span>
                          </div>
                          <span className="text-sm text-amber-900 font-semibold">{manager.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            manager.role === 'admin_master' 
                              ? 'bg-purple-100 text-purple-700'
                              : manager.role === 'admin'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {manager.role === 'admin_master' ? 'Admin Master' : manager.role === 'admin' ? 'Admin' : 'Voluntario'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{getAreaName(project.areaId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span className="text-xs">
                      {new Date(project.startDate).toLocaleDateString('es-ES')} - 
                      {new Date(project.endDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>{getVolunteersForProject(project.id).length} voluntarios</span>
                  </div>
                </div>

                {project.objectives && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      <span className="font-semibold">Objetivos:</span> {project.objectives}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-xs font-semibold">Editar</span>
                  </button>
                  <button
                    onClick={() => handleTogglePublish(project)}
                    className={`px-3 py-2 rounded-lg transition-colors border ${
                      project.published
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title={project.published ? 'Ocultar del landing' : 'Publicar en landing'}
                  >
                    {project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleManageManagers(project)}
                    className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                    title="Gestionar encargados"
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleManageVolunteers(project)}
                    className="px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
                    title="Gestionar voluntarios"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterArea !== 'all'
              ? 'No se encontraron proyectos con esos filtros'
              : 'No hay proyectos aún'}
          </p>
        </div>
      )}

      {/* Project Edit Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-gray-900">
                {editingProject.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Nombre del Proyecto *</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ej: Conservación de Especies Amazónicas"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Descripción *</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe el proyecto..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Área *</label>
                <select
                  value={editingProject.areaId}
                  onChange={(e) => setEditingProject({ ...editingProject, areaId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={editingProject.startDate}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Fecha de Fin *</label>
                  <input
                    type="date"
                    value={editingProject.endDate}
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Objetivos</label>
                <textarea
                  value={editingProject.objectives}
                  onChange={(e) => setEditingProject({ ...editingProject, objectives: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Objetivos del proyecto..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Estado</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingProject.published || false}
                  onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="published" className="text-gray-700 cursor-pointer">
                  <span className="font-bold text-purple-900">Publicar en el Landing</span>
                  <p className="text-sm text-purple-800">Al publicar, el proyecto será visible para usuarios públicos</p>
                </label>
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-200 flex gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!editingProject.name || !editingProject.description || !editingProject.areaId || !editingProject.startDate || !editingProject.endDate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                Guardar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Managers Management Modal */}
      {managingManagers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-200 p-2 rounded-lg">
                    <Crown className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">Gestión de Encargados</h3>
                    <p className="text-amber-800 text-sm font-semibold">{managingManagers.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setManagingManagers(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Managers */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Encargados Actuales</h4>
                {getManagersForProject(managingManagers).length > 0 ? (
                  <div className="space-y-2">
                    {getManagersForProject(managingManagers).map((manager: any) => (
                      <div key={manager.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                            <span className="text-amber-800 font-bold">{manager.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold">{manager.name}</p>
                            <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                              manager.role === 'admin_master' 
                                ? 'bg-purple-100 text-purple-700'
                                : manager.role === 'admin'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {manager.role === 'admin_master' ? 'Admin Master' : manager.role === 'admin' ? 'Admin' : 'Voluntario'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveManager(manager.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Crown className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No hay encargados asignados</p>
                  </div>
                )}
              </div>

              {/* Add Manager */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Agregar Encargado</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Solo voluntarios, admins y admin masters pueden ser encargados de proyectos
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Selecciona un encargado</option>
                    {eligibleManagers
                      .filter(v => !(managingManagers.managers || []).includes(v.id))
                      .map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name} - {person.role === 'admin_master' ? 'Admin Master' : person.role === 'admin' ? 'Admin' : 'Voluntario'}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedManager) {
                        handleAddManager(selectedManager);
                        setSelectedManager('');
                      }
                    }}
                    disabled={!selectedManager}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                  >
                    <UserPlus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteers Management Modal */}
      {managingVolunteers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-200 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-teal-800" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">Gestión de Voluntarios</h3>
                    <p className="text-teal-800 text-sm font-semibold">{managingVolunteers.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setManagingVolunteers(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Volunteers */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Voluntarios Asignados</h4>
                {getVolunteersForProject(managingVolunteers.id).length > 0 ? (
                  <div className="space-y-2">
                    {getVolunteersForProject(managingVolunteers.id).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center">
                            <span className="text-teal-800 font-bold">{volunteer.name?.charAt(0)}</span>
                          </div>
                          <span className="text-gray-900 font-semibold">{volunteer.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveVolunteer(assignments.find((assignment) => assignment.projectId === managingVolunteers.id && assignment.volunteerId === volunteer.id)?.id || '')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No hay voluntarios asignados</p>
                  </div>
                )}
              </div>

              {/* Add Volunteer */}
              <div>
                <h4 className="text-gray-900 mb-3 font-semibold">Agregar Voluntario</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedVolunteer}
                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Selecciona un voluntario</option>
                    {volunteers
                      .filter((volunteer) => !getVolunteersForProject(managingVolunteers.id).map((v) => v.id).includes(volunteer.id))
                      .map((volunteer) => (
                        <option key={volunteer.id} value={volunteer.id}>
                          {volunteer.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedVolunteer) {
                        handleAddVolunteer(managingVolunteers.id, selectedVolunteer);
                        setSelectedVolunteer('');
                      }
                    }}
                    disabled={!selectedVolunteer}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                  >
                    <UserPlus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}