import { useState } from 'react';
import { Search, Plus, Edit, Trash2, FolderOpen, Calendar, MapPin, Users, X, UserPlus, UserMinus } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';

export function ProjectsAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managingVolunteers, setManagingVolunteers] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const { data: projectsData, loading, refetch } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: volunteersData, refetch: refetchVolunteers } = useApi<any[]>('/volunteers');
  const { data: assignmentsData, refetch: refetchAssignments } = useApi<any[]>('/project-assignments');

  const projects = projectsData || [];
  const areas = areasData || [];
  const volunteers = volunteersData || [];
  const assignments = assignmentsData || [];

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
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject({ ...project });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingProject.id) {
        await apiPut(`/projects/${editingProject.id}`, editingProject);
        alert('Proyecto actualizado exitosamente');
      } else {
        await apiPost('/projects', editingProject);
        alert('Proyecto creado exitosamente');
      }
      setIsModalOpen(false);
      setEditingProject(null);
      refetch();
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error al guardar el proyecto');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        await apiDelete(`/projects/${id}`);
        alert('Proyecto eliminado exitosamente');
        refetch();
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Error al eliminar el proyecto');
      }
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

  const handleManageVolunteers = (project: any) => {
    setManagingVolunteers(project);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando proyectos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Proyectos</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900">{project.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{getAreaName(project.areaId)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString('es-ES')} - 
                    {new Date(project.endDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {project.objectives && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    <span className="font-medium">Objetivos:</span> {project.objectives}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManageVolunteers(project)}
                  className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterArea !== 'all'
              ? 'No se encontraron proyectos con esos filtros'
              : 'No hay proyectos aún'}
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900">
                {editingProject.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre del Proyecto *</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Conservación de Especies Amazónicas"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Descripción *</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el proyecto..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Área *</label>
                <select
                  value={editingProject.areaId}
                  onChange={(e) => setEditingProject({ ...editingProject, areaId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-gray-700 mb-2">Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={editingProject.startDate}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Fecha de Fin *</label>
                  <input
                    type="date"
                    value={editingProject.endDate}
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Objetivos</label>
                <textarea
                  value={editingProject.objectives}
                  onChange={(e) => setEditingProject({ ...editingProject, objectives: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objetivos del proyecto..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Estado</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingProject.published || false}
                  onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-gray-700 cursor-pointer">
                  <span className="font-medium">Publicar en el Landing</span>
                  <p className="text-sm text-gray-600">Al publicar, el proyecto será visible para usuarios públicos</p>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!editingProject.name || !editingProject.description || !editingProject.areaId || !editingProject.startDate || !editingProject.endDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Guardar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteers Management Modal */}
      {managingVolunteers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900">
                Gestión de Voluntarios para {managingVolunteers.name}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-700">Voluntarios Asignados</h4>
                <button
                  onClick={() => setManagingVolunteers(null)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {getVolunteersForProject(managingVolunteers.id).map((volunteer) => (
                  <div key={volunteer.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{volunteer.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveVolunteer(assignments.find((assignment) => assignment.projectId === managingVolunteers.id && assignment.volunteerId === volunteer.id)?.id || '')}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-gray-700">Agregar Voluntario</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedVolunteer}
                    onChange={(e) => handleAddVolunteer(managingVolunteers.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un voluntario</option>
                    {volunteers.filter((volunteer) => !getVolunteersForProject(managingVolunteers.id).map((v) => v.id).includes(volunteer.id)).map((volunteer) => (
                      <option key={volunteer.id} value={volunteer.id}>
                        {volunteer.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddVolunteer(managingVolunteers.id, '')}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
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