import { useState } from 'react';
import { Plus, Edit, Trash2, Video, X, Users, Eye, TrendingUp, Play } from 'lucide-react';
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
  
  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const { data: projectsData, isLoading: loadingProjects } = useApi<any[]>('/projects');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: materialsData, refetch: refetchMaterials, isLoading: loadingMaterials } = useApi<any[]>('/training-materials');
  const { data: progressData } = useApi<any[]>('/material-progress');

  const projects = projectsData || [];
  const assignments = assignmentsData || [];
  const volunteers = volunteersData || [];
  const materials = materialsData || [];
  const progress = progressData || [];

  // Filtrar proyectos del usuario
  const myProjects = projects.filter(p => {
    if (currentUser?.role === 'admin_master') return true;
    
    const isManager = p.managers && p.managers.includes(currentUser?.id);
    const isAssigned = currentUser?.role === 'volunteer' && 
      assignments.some(a => a.projectId === p.id && a.volunteerId === currentUser?.id);
    
    return isManager || isAssigned;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Materiales de Capacitación</h2>
        <p className="text-gray-600">Administra videos de capacitación y monitorea el progreso de tus voluntarios</p>
      </div>

      {/* Projects Grid */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
        <h3 className="text-gray-900 mb-4">Selecciona un Proyecto</h3>
        
        {loadingProjects ? (
          <LoadingSpinner size="lg" message="Cargando proyectos disponibles..." />
        ) : myProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProjects.map((project) => {
              const volunteerCount = getProjectVolunteers(project.id).length;
              const projectMaterialsCount = materials.filter(m => m.projectId === project.id).length;
              
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedProject?.id === project.id
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg scale-105'
                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-3 rounded-lg transition-colors ${
                      project.status === 'activo' ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Video className={`w-6 h-6 ${
                        project.status === 'activo' ? 'text-emerald-700' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{project.name}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'activo'
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
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tienes proyectos asignados</p>
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
            <div className="space-y-4">
              {projectMaterials.map((material, index) => {
                const viewCount = getViewCount(material.id);
                const progressPercentage = getProgressPercentage(material.id);
                const totalVolunteers = getProjectVolunteers(selectedProject.id).length;
                const embedUrl = getYouTubeEmbedUrl(material.url);

                return (
                  <div key={material.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-gray-50 to-emerald-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-lg shadow-md">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                                #{index + 1}
                              </span>
                              <h4 className="text-gray-900">{material.title}</h4>
                            </div>
                            {material.description && (
                              <p className="text-gray-600 text-sm mb-2">{material.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                ▶ YouTube
                              </span>
                              {material.published ? (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✓ Publicado
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  ○ Borrador
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMaterial(material)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id, material.title)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Stats - Solo para materiales publicados */}
                      {material.published && totalVolunteers > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Eye className="w-5 h-5 text-emerald-600" />
                              <span className="text-2xl font-bold text-gray-900">{viewCount}</span>
                            </div>
                            <p className="text-xs text-gray-600">de {totalVolunteers} vieron</p>
                          </div>
                          <div className="text-center border-l-2 border-r-2 border-gray-200">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <TrendingUp className="w-5 h-5 text-teal-600" />
                              <span className="text-2xl font-bold text-gray-900">{progressPercentage}%</span>
                            </div>
                            <p className="text-xs text-gray-600">Progreso promedio</p>
                          </div>
                          <div className="text-center">
                            <button
                              onClick={() => setViewingProgress(material)}
                              className="text-purple-600 hover:text-purple-800 transition-colors"
                            >
                              <Users className="w-7 h-7 mx-auto mb-1" />
                              <p className="text-xs font-semibold">Ver Detalles</p>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Embed */}
                    {embedUrl && (
                      <div className="aspect-video bg-black">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={material.title}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
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
