import { useState } from 'react';
import { Plus, Edit, Trash2, Video, X, Users, Eye, TrendingUp, Play, CheckCircle, Clock, EyeOff, BarChart2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import { VideoMaterialModal } from './VideoMaterialModal';
import { LoadingSpinner } from './LoadingOverlay';
import { useNotifications } from '../contexts/NotificationContext';

interface ContentManagementProps {
  currentUser: any;
}

export function ContentManagement({ currentUser }: ContentManagementProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [viewingProgress, setViewingProgress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [projectPage, setProjectPage] = useState(0);
  const [projectSearch, setProjectSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState('');

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const { data: projectsData, isLoading: loadingProjects } = useApi<any[]>('/projects');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: usersData } = useApi<any[]>('/users');
  const { data: materialsData, refetch: refetchMaterials, isLoading: loadingMaterials } = useApi<any[]>('/training-materials');
  const { data: progressData } = useApi<any[]>('/material-progress');

  const projects = projectsData || [];
  const assignments = assignmentsData || [];
  const volunteers = volunteersData || [];
  const materials = materialsData || [];
  const progress = progressData || [];
  const admins = usersData?.filter(u => u.role === 'admin') || [];

  // Filtrar proyectos del usuario
  const myProjects = projects.filter(p => {
    if (currentUser?.role === 'admin_master') return true;

    const isManager = p.managers && p.managers.includes(currentUser?.id);
    const isAssigned = currentUser?.role === 'volunteer' &&
      assignments.some(a => a.projectId === p.id && a.volunteerId === currentUser?.id);

    return isManager || isAssigned;
  });

  const filteredProjects = myProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesManager = managerFilter ? p.managers && p.managers.includes(managerFilter) : true;
    return matchesSearch && matchesManager;
  });

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Obtener materiales del proyecto seleccionado
  const projectMaterials = selectedProject
    ? materials.filter(m => m.projectId === selectedProject.id).sort((a, b) => a.order - b.order)
    : [];

  // Obtener voluntarios del proyecto
  const getProjectVolunteers = (projectId: string) => {
    const projectAssignments = assignments.filter(a => a.projectId === projectId);
    return projectAssignments
      .map(a => volunteers.find(v => v.id === a.volunteerId))
      .filter(Boolean);
  };

  // Obtener progreso de un material
  const getMaterialProgress = (materialId: string) => {
    return progress.filter(p => p.materialId === materialId);
  };

  // Contar cuántos voluntarios vieron el material
  const getViewCount = (materialId: string) => {
    return getMaterialProgress(materialId).filter(p => p.viewed).length;
  };

  // Obtener porcentaje promedio de progreso
  const getProgressPercentage = (materialId: string) => {
    const materialProgress = getMaterialProgress(materialId);
    if (materialProgress.length === 0) return 0;

    const totalProgress = materialProgress.reduce((sum, p) => sum + (p.progress || 0), 0);
    return Math.round(totalProgress / materialProgress.length);
  };

  // Extraer ID de video de YouTube
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Obtener URL de embed de YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Abrir modal para crear nuevo material
  const handleCreateMaterial = () => {
    if (!selectedProject) {
      showError('Proyecto no seleccionado', 'Por favor selecciona un proyecto primero');
      return;
    }

    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar material
  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  // Guardar material (crear o actualizar)
  const handleSaveMaterial = async (materialData: any) => {
    const loadingId = showLoading(
      materialData.id ? 'Actualizando video...' : 'Creando video...',
      'Por favor espera un momento'
    );

    setIsSaving(true);
    try {
      console.log('💾 Guardando material:', materialData);

      if (materialData.id) {
        // Actualizar material existente
        console.log('📝 Actualizando material:', materialData.id);
        await apiPut(`/training-materials/${materialData.id}`, materialData);
        hideNotification(loadingId);
        showSuccess(
          '¡Video actualizado!',
          `El video "${materialData.title}" se actualizó correctamente`
        );
      } else {
        // Crear nuevo material
        console.log('➕ Creando nuevo material');
        const result = await apiPost('/training-materials', materialData);
        console.log('✅ Material creado:', result);
        hideNotification(loadingId);
        showSuccess(
          '¡Video creado exitosamente!',
          `El video "${materialData.title}" está listo para ser usado`
        );
      }

      setIsModalOpen(false);
      setEditingMaterial(null);

      // Recargar materiales
      setTimeout(() => {
        refetchMaterials();
      }, 300);

    } catch (err: any) {
      console.error('❌ Error guardando material:', err);
      hideNotification(loadingId);
      showError(
        'Error al guardar video',
        err?.message || 'No se pudo guardar el video. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar material
  const handleDeleteMaterial = async (materialId: string, materialTitle: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este video?\n\nSe eliminará también el progreso de los voluntarios.')) {
      return;
    }

    const loadingId = showLoading('Eliminando video...', 'Espera un momento');

    try {
      console.log('🗑️ Eliminando material:', materialId);
      await apiDelete(`/training-materials/${materialId}`);
      hideNotification(loadingId);
      showSuccess(
        '¡Video eliminado!',
        `El video "${materialTitle}" fue eliminado correctamente`
      );
      refetchMaterials();
    } catch (err: any) {
      console.error('❌ Error eliminando material:', err);
      hideNotification(loadingId);
      showError(
        'Error al eliminar video',
        err?.message || 'No se pudo eliminar el video. Por favor intenta nuevamente.'
      );
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (material: any) => {
    const newStatus = !material.published;
    const actionText = newStatus ? 'Publicando' : 'Ocultando';
    const loadingId = showLoading(
      `${actionText} video...`,
      'Actualizando visibilidad'
    );

    try {
      await apiPut(`/training-materials/${material.id}`, {
        ...material,
        published: newStatus
      });

      hideNotification(loadingId);
      showSuccess(
        newStatus ? '¡Video publicado!' : 'Video ocultado',
        newStatus ? 'El video ahora es visible para los voluntarios' : 'El video ya no es visible para los voluntarios'
      );
      refetchMaterials();
    } catch (err: any) {
      hideNotification(loadingId);
      showError('Error', 'No se pudo actualizar el estado del video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Materiales de Capacitación</h2>
        <p className="text-gray-500 mt-1">Administra videos de capacitación y monitorea el progreso de tus voluntarios</p>
      </div>

      {/* Projects Grid */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
        <div className="mb-6">
          <h3 className="text-gray-900 font-semibold mb-4">Selecciona un Proyecto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={projectSearch}
                onChange={(e) => {
                  setProjectSearch(e.target.value);
                  setProjectPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <select
              value={managerFilter}
              onChange={(e) => {
                setManagerFilter(e.target.value);
                setProjectPage(0);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">Todos los encargados</option>
              {admins.map((admin: any) => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingProjects ? (
          <LoadingSpinner size="lg" message="Cargando proyectos disponibles..." />
        ) : filteredProjects.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.slice(projectPage * ITEMS_PER_PAGE, (projectPage + 1) * ITEMS_PER_PAGE).map((project) => {
                const volunteerCount = getProjectVolunteers(project.id).length;
                const projectMaterialsCount = materials.filter(m => m.projectId === project.id).length;

                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 animate-fade-in ${selectedProject?.id === project.id
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg scale-105'
                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-3 rounded-lg transition-colors ${project.status === 'activo' ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                        <Video className={`w-6 h-6 ${project.status === 'activo' ? 'text-emerald-700' : 'text-gray-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{project.name}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${project.status === 'activo'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                          {project.status === 'activo' ? '● Activo' : '○ Inactivo'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{volunteerCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Video className="w-4 h-4" />
                        <span>{projectMaterialsCount}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Carousel Navigation */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 px-2 animate-fade-in">
                <button
                  onClick={() => setProjectPage(prev => Math.max(0, prev - 1))}
                  disabled={projectPage === 0}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setProjectPage(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${projectPage === idx ? 'bg-emerald-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setProjectPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={projectPage >= totalPages - 1}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {projectSearch ? 'No se encontraron proyectos con ese nombre' : 'No tienes proyectos asignados'}
            </p>
          </div>
        )}
      </div>

      {/* Materials List */}
      {selectedProject && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg animate-slide-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900">Videos de Capacitación</h3>
              <p className="text-gray-600 text-sm">Proyecto: {selectedProject.name}</p>
            </div>
            <button
              onClick={handleCreateMaterial}
              disabled={isSaving || loadingMaterials}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Agregar Video
            </button>
          </div>

          {loadingMaterials ? (
            <LoadingSpinner size="lg" message="Cargando videos de capacitación..." />
          ) : projectMaterials.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-4 w-12 text-center">#</th>
                    <th className="px-4 py-4 w-24 text-center">Miniatura</th>
                    <th className="px-4 py-4 w-48">Título</th>
                    <th className="px-4 py-4">Descripción</th>
                    <th className="px-4 py-4 w-32 text-center">Fecha</th>
                    <th className="px-4 py-4 w-24 text-center">Vistas</th>
                    <th className="px-4 py-4 w-28 text-center">Estado</th>
                    <th className="px-4 py-4 w-48 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {projectMaterials.map((material, index) => {
                    const viewCount = getViewCount(material.id);
                    const isPublished = material.published;
                    const videoId = getYouTubeVideoId(material.url);
                    const thumbnailUrl = videoId
                      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                      : null;

                    return (
                      <tr key={material.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Index */}
                        <td className="px-4 py-4 text-center font-mono text-xs text-gray-400">
                          {String(index + 1).padStart(2, '0')}
                        </td>

                        {/* Thumbnail */}
                        <td className="px-4 py-4">
                          {thumbnailUrl ? (
                            <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group-hover:scale-105 transition-transform">
                              <img
                                src={thumbnailUrl}
                                alt={material.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                              <Video className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-4 py-4">
                          <span className="font-bold text-gray-900 line-clamp-2" title={material.title}>
                            {material.title}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-4">
                          <span className="text-gray-500 text-xs line-clamp-2" title={material.description}>
                            {material.description || 'Sin descripción'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                          {material.createdAt ? new Date(material.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>

                        {/* View Count */}
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{viewCount}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                            {isPublished ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Stats Button */}
                            <button
                              onClick={() => setViewingProgress(material)}
                              className="group flex items-center justify-center p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                              title="Ver Estadísticas"
                            >
                              <BarChart2 className="w-4 h-4" />
                              <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                Ver
                              </span>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditMaterial(material)}
                              className="group flex items-center justify-center p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                Editar
                              </span>
                            </button>

                            {/* Toggle Publish Button */}
                            <button
                              onClick={() => handleTogglePublish(material)}
                              className={`group flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md ${isPublished
                                ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100' // Published = Emerald Theme
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' // Draft = Gray Theme
                                }`}
                              title={isPublished ? "Ocultar Video" : "Publicar Video"}
                            >
                              {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                {isPublished ? "Ocultar" : "Publicar"}
                              </span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMaterial(material.id, material.title)}
                              className="group flex items-center justify-center p-2 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                Eliminar
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Video className="w-10 h-10 text-emerald-600" />
              </div>
              <h4 className="text-gray-900 mb-2">No hay videos aún</h4>
              <p className="text-gray-600 text-sm mb-4">Comienza agregando tu primer video de capacitación</p>
              <button
                onClick={handleCreateMaterial}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Agregar Video
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar material */}
      {isModalOpen && selectedProject && (
        <VideoMaterialModal
          material={editingMaterial}
          projectId={selectedProject.id}
          onClose={() => {
            if (!isSaving) {
              setIsModalOpen(false);
              setEditingMaterial(null);
            }
          }}
          onSave={handleSaveMaterial}
          isSaving={isSaving}
        />
      )}

      {/* Modal de progreso de voluntarios */}
      {viewingProgress && selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white mb-1">Progreso de Voluntarios</h3>
                  <p className="text-purple-100 text-sm">{viewingProgress.title}</p>
                </div>
                <button
                  onClick={() => setViewingProgress(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Volunteers List */}
            <div className="p-6">
              <div className="space-y-3">
                {getProjectVolunteers(selectedProject.id).map((volunteer: any) => {
                  const volunteerProgress = progress.find(
                    p => p.materialId === viewingProgress.id && p.volunteerId === volunteer.id
                  );
                  const progressValue = volunteerProgress?.progress || 0;
                  const viewed = volunteerProgress?.viewed || false;

                  return (
                    <div key={volunteer.id} className="p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-200 animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold">
                              {volunteer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold">{volunteer.name}</p>
                            <p className="text-gray-600 text-sm">{volunteer.email}</p>
                          </div>
                        </div>
                        <div>
                          {viewed ? (
                            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md">
                              ✓ Visto
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold">
                              Sin ver
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-semibold">Progreso del video</span>
                          <span className="text-gray-900 font-bold text-lg">{progressValue}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-md"
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getProjectVolunteers(selectedProject.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay voluntarios asignados a este proyecto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
