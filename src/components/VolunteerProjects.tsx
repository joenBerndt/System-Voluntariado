import { useState } from 'react';
import { FolderOpen, Calendar, FileText, Video, Download, ExternalLink, PlayCircle, File, Image as ImageIcon, Link, CheckCircle, Circle, TrendingUp, Award, Eye } from 'lucide-react';
import { useApi, apiPost, apiPut } from '../hooks/useApi';
import { LoadingSpinner } from './LoadingOverlay';
import { useNotifications } from '../contexts/NotificationContext';

interface VolunteerProjectsProps {
  currentUser?: any;
}

export function VolunteerProjects({ currentUser }: VolunteerProjectsProps) {
  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();
  
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: materialsData } = useApi<any[]>('/training-materials', { fallbackOnError: true, autoRetry: true });
  const { data: applicationsData } = useApi<any[]>('/applications');
  const { data: convocatoriasData } = useApi<any[]>('/convocatorias');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');
  const { data: progressData, refetch: refetchProgress } = useApi<any[]>('/material-progress', { 
    fallbackOnError: true,
    autoRetry: true
  });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [viewingMaterial, setViewingMaterial] = useState<any>(null);
  
  const projects = projectsData || [];
  const materials = materialsData || [];
  const applications = applicationsData || [];
  const convocatorias = convocatoriasData || [];
  const assignments = assignmentsData || [];
  const progress = progressData || [];
  
  // Get accepted applications for current user
  const acceptedApplications = applications.filter(app => 
    app.userEmail === currentUser?.email && app.status === 'accepted'
  );

  // Get project IDs from accepted applications via convocatorias
  const projectIdsFromApplications = acceptedApplications.map(app => {
    const conv = convocatorias.find(c => c.id === app.convocatoriaId);
    return conv?.projectId;
  }).filter(id => id); // Remove undefined values

  // Get project IDs from direct assignments
  const myAssignments = assignments.filter(a => a.volunteerId === currentUser?.id);
  const projectIdsFromAssignments = myAssignments.map(a => a.projectId);

  // Filter projects: assigned directly OR from project-assignments OR from accepted convocatorias
  const myProjects = projects.filter(p => {
    // Check if in project-assignments (this is the main way to be a member)
    const isMember = projectIdsFromAssignments.includes(p.id);
    
    // Check if directly assigned (legacy method)
    const isDirectlyAssigned = p.assignedVolunteers && 
      Array.isArray(p.assignedVolunteers) && 
      p.assignedVolunteers.includes(currentUser?.id);
    
    // Check if project is from an accepted convocatoria
    const isFromAcceptedConvocatoria = projectIdsFromApplications.includes(p.id);
    
    return isMember || isDirectlyAssigned || isFromAcceptedConvocatoria;
  });

  console.log('Current User ID:', currentUser?.id);
  console.log('Current User Email:', currentUser?.email);
  console.log('My Assignments:', myAssignments);
  console.log('Project IDs from Assignments:', projectIdsFromAssignments);
  console.log('Accepted Applications:', acceptedApplications);
  console.log('Project IDs from Applications:', projectIdsFromApplications);
  console.log('All Projects:', projects);
  console.log('My Projects:', myProjects);

  // Filter only published materials for the selected project
  const projectMaterials = selectedProject
    ? materials
        .filter(m => m.projectId === selectedProject.id && m.published === true)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Get progress for current user
  const myProgress = progress.filter(p => p.userId === currentUser?.id);

  // Calculate project completion
  const getProjectCompletion = (projectId: string) => {
    const projectMats = materials.filter(m => m.projectId === projectId && m.published === true);
    if (projectMats.length === 0) return 0;
    
    const completedMats = projectMats.filter(m => {
      const matProgress = myProgress.find(p => p.materialId === m.id);
      return matProgress?.viewed === true;
    });
    
    return Math.round((completedMats.length / projectMats.length) * 100);
  };

  // Get material progress
  const getMaterialProgress = (materialId: string) => {
    return myProgress.find(p => p.materialId === materialId);
  };

  // Mark material as viewed
  const markAsViewed = async (materialId: string) => {
    const loadingId = showLoading('Registrando progreso...', 'Actualizando tu avance en la capacitación');
    
    try {
      const existingProgress = getMaterialProgress(materialId);
      
      if (existingProgress) {
        // Update existing progress
        await apiPut(`/material-progress/${existingProgress.id}`, {
          ...existingProgress,
          viewed: true,
          progress: 100,
          viewedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
      } else {
        // Create new progress entry
        await apiPost('/material-progress', {
          materialId,
          userId: currentUser?.id,
          volunteerId: currentUser?.id,
          viewed: true,
          progress: 100,
          viewedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
      }
      
      hideNotification(loadingId);
      showSuccess('¡Material completado!', 'Tu progreso ha sido registrado exitosamente');
      
      // Refetch progress after a short delay to ensure server has updated
      setTimeout(() => {
        refetchProgress();
      }, 500);
    } catch (err: any) {
      // Manejo silencioso de errores durante inicio del servidor
      const errorMsg = err?.message || '';
      if (errorMsg.includes('iniciando') || errorMsg.includes('404') || errorMsg.includes('not found')) {
        hideNotification(loadingId);
        console.log('⏳ El progreso se guardará cuando el servidor esté listo');
        // Intentar de nuevo después de un delay
        setTimeout(() => {
          markAsViewed(materialId).catch(() => {
            // Fallo silencioso en el reintento
          });
        }, 5000);
      } else {
        hideNotification(loadingId);
        console.error('Error marking material as viewed:', err);
        showError('Error al registrar progreso', 'No se pudo actualizar tu avance. Intenta nuevamente.');
      }
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'youtube':
        return Video;
      case 'document':
      case 'pdf':
        return FileText;
      case 'image':
        return ImageIcon;
      case 'link':
        return Link;
      default:
        return File;
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  };

  // Check if URL is a Google Drive PDF
  const getGoogleDrivePdfUrl = (url: string) => {
    // Convert Google Drive share links to preview links
    const driveIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (driveIdMatch) {
      return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    }
    // Check if it's already a preview link
    if (url.includes('drive.google.com') && url.includes('/preview')) {
      return url;
    }
    return null;
  };

  // Check if URL is a direct image
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('imgur.com') || url.includes('photos.google.com');
  };

  // Check if URL is a PDF
  const isPdfUrl = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.includes('drive.google.com');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Mis Proyectos y Capacitaciones</h2>
        <p className="text-gray-600">Accede a los recursos y materiales de capacitación de tus proyectos</p>
      </div>

      {myProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-gray-900">Tus Proyectos</h3>
            {myProjects.map((project) => {
              // Check how the volunteer got into this project
              const isDirectlyAssigned = project.assignedVolunteers && 
                Array.isArray(project.assignedVolunteers) && 
                project.assignedVolunteers.includes(currentUser?.id);
              const isFromConvocatoria = projectIdsFromApplications.includes(project.id);
              const completionPercentage = getProjectCompletion(project.id);
              const projectMatsCount = materials.filter(m => m.projectId === project.id && m.published === true).length;
              
              return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedProject?.id === project.id
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-emerald-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    project.status === 'activo' 
                      ? 'bg-emerald-100' 
                      : 'bg-blue-100'
                  }`}>
                    <FolderOpen className={`w-5 h-5 ${
                      project.status === 'activo'
                        ? 'text-emerald-700'
                        : 'text-blue-700'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{project.name}</h4>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'activo'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {project.status === 'activo' ? '● Activo' : '✓ Finalizado'}
                      </span>
                      {isFromConvocatoria && !isDirectlyAssigned && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          📋 Por convocatoria
                        </span>
                      )}
                      {isDirectlyAssigned && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                          ✓ Asignación directa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>
                
                {/* Progress Indicator */}
                {projectMatsCount > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progreso de capacitación
                      </span>
                      <span className={`font-bold ${
                        completionPercentage === 100 ? 'text-emerald-600' : 'text-gray-900'
                      }`}>
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          completionPercentage === 100 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    {completionPercentage === 100 && (
                      <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                        <Award className="w-3 h-3" />
                        ¡Curso completado!
                      </div>
                    )}
                  </div>
                )}
              </button>
              );
            })}
          </div>

          {/* Project Details and Materials */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-white p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900 mb-2">{selectedProject.name}</h3>
                      <p className="text-gray-700">{selectedProject.description}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      selectedProject.status === 'activo'
                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                    }`}>
                      {selectedProject.status === 'activo' ? '● Activo' : '✓ Finalizado'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500">Inicio</p>
                        <p className="font-semibold">{new Date(selectedProject.startDate).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500">Fin</p>
                        <p className="font-semibold">{new Date(selectedProject.endDate).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>

                  {selectedProject.objectives && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <p className="text-amber-900 font-semibold mb-2">Objetivos del Proyecto</p>
                      <p className="text-gray-700">{selectedProject.objectives}</p>
                    </div>
                  )}
                </div>

                {/* Training Materials */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Materiales de Capacitación</h3>
                    {projectMaterials.length > 0 && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg">
                        <Award className="w-5 h-5 text-emerald-600" />
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Progreso del Curso</p>
                          <p className="font-bold text-gray-900">{getProjectCompletion(selectedProject.id)}%</p>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getProjectCompletion(selectedProject.id)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {projectMaterials.length > 0 ? (
                    <div className="space-y-4">
                      {projectMaterials.map((material, index) => {
                        const Icon = getMaterialIcon(material.type);
                        const youtubeUrl = material.type === 'youtube' ? getYouTubeEmbedUrl(material.url) : null;
                        const matProgress = getMaterialProgress(material.id);
                        const isCompleted = matProgress?.viewed === true;

                        return (
                          <div key={material.id} className={`border-2 rounded-xl overflow-hidden transition-all ${
                            isCompleted 
                              ? 'border-emerald-300 bg-emerald-50/30' 
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}>
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50">
                              <div className="flex items-start gap-3">
                                {/* Completion Indicator */}
                                <div className="flex-shrink-0 pt-1">
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="bg-emerald-100 p-3 rounded-lg">
                                  <Icon className="w-5 h-5 text-emerald-700" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                                        <h4 className="text-gray-900">{material.title}</h4>
                                      </div>
                                      {material.description && (
                                        <p className="text-gray-600 text-sm mb-2">{material.description}</p>
                                      )}
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                          material.type === 'youtube' || material.type === 'video'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : material.type === 'pdf' || material.type === 'document'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : material.type === 'image'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                                        }`}>
                                          {material.type === 'youtube' && '▶ Video YouTube'}
                                          {material.type === 'video' && '▶ Video'}
                                          {material.type === 'pdf' && '📄 PDF'}
                                          {material.type === 'document' && '📄 Documento'}
                                          {material.type === 'image' && '🖼️ Imagen'}
                                          {material.type === 'link' && '🔗 Enlace'}
                                          {!['youtube', 'video', 'pdf', 'document', 'image', 'link'].includes(material.type) && '📎 Archivo'}
                                        </span>
                                        {isCompleted && (
                                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ✓ Completado
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* YouTube Embed */}
                            {youtubeUrl && (
                              <div className="aspect-video">
                                <iframe
                                  src={youtubeUrl}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  onLoad={() => {
                                    // Auto-mark as viewed when iframe loads
                                    if (!isCompleted) {
                                      markAsViewed(material.id);
                                    }
                                  }}
                                />
                              </div>
                            )}

                            {/* Image Preview */}
                            {material.type === 'image' && material.url && !youtubeUrl && (
                              <div className="bg-gray-900 p-4">
                                <img
                                  src={material.url}
                                  alt={material.title}
                                  className="w-full max-h-96 object-contain rounded-lg"
                                  onLoad={() => {
                                    if (!isCompleted) {
                                      markAsViewed(material.id);
                                    }
                                  }}
                                  onError={(e) => {
                                    // If image fails to load, hide it
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* PDF Preview (Google Drive) */}
                            {material.type === 'pdf' && getGoogleDrivePdfUrl(material.url) && (
                              <div className="aspect-[3/4] bg-gray-100">
                                <iframe
                                  src={getGoogleDrivePdfUrl(material.url)!}
                                  className="w-full h-full"
                                  onLoad={() => {
                                    if (!isCompleted) {
                                      markAsViewed(material.id);
                                    }
                                  }}
                                />
                              </div>
                            )}

                            {/* Link/Document Message */}
                            {material.type === 'link' && material.url && !youtubeUrl && (
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-t-2 border-purple-200">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <Link className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-700 font-semibold mb-1">Enlace externo disponible</p>
                                    <p className="text-gray-600 text-sm mb-3">
                                      Haz click en el botón de abajo para acceder al contenido y marcar esta capacitación como completada.
                                    </p>
                                    <div className="bg-white px-4 py-3 rounded-lg border border-purple-200 break-all">
                                      <p className="text-xs text-gray-500 mb-1">URL:</p>
                                      <a 
                                        href={material.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
                                        onClick={() => {
                                          if (!isCompleted) {
                                            markAsViewed(material.id);
                                          }
                                        }}
                                      >
                                        {material.url}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                              <div className="flex gap-2 flex-wrap">
                                {material.url && material.type !== 'youtube' && material.type !== 'link' && (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      if (!isCompleted) {
                                        markAsViewed(material.id);
                                      }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                  >
                                    {material.type === 'pdf' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    {material.type === 'pdf' || material.type === 'document' ? 'Ver/Descargar Documento' : 'Ver Archivo'}
                                  </a>
                                )}
                                {material.url && material.type === 'link' && (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      if (!isCompleted) {
                                        markAsViewed(material.id);
                                      }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir Enlace y Marcar como Visto
                                  </a>
                                )}
                                {material.url && material.type !== 'link' && (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      if (!isCompleted) {
                                        markAsViewed(material.id);
                                      }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir en nueva pestaña
                                  </a>
                                )}
                                {!isCompleted && (
                                  <button
                                    onClick={() => markAsViewed(material.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium ml-auto"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Marcar como completado
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-lg border-2 border-gray-200">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay materiales de capacitación disponibles aún</p>
                      <p className="text-gray-500 text-sm mt-1">Los administradores subirán recursos próximamente</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-12 rounded-xl border-2 border-emerald-200 text-center h-full flex items-center justify-center">
                <div>
                  <PlayCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Selecciona un proyecto</h3>
                  <p className="text-gray-600">
                    Elige un proyecto de la lista para ver sus detalles y materiales de capacitación
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 p-12 rounded-xl border-2 border-gray-200 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No tienes proyectos asignados</h3>
          <p className="text-gray-600 mb-4">
            Aún no tienes proyectos disponibles. Puedes acceder a proyectos de dos formas:
          </p>
          <div className="max-w-md mx-auto text-left space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-gray-900 font-semibold mb-1">Postula a convocatorias</p>
                <p className="text-gray-600 text-sm">Si eres aceptado en una convocatoria, automáticamente tendrás acceso al proyecto asociado</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-2xl">✓</span>
              <div>
                <p className="text-gray-900 font-semibold mb-1">Asignación directa</p>
                <p className="text-gray-600 text-sm">Los administradores pueden asignarte directamente a un proyecto</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}