import { useState, useEffect } from 'react';
import { FolderOpen, Calendar, FileText, Video, Download, ExternalLink, PlayCircle, File, Image as ImageIcon, Link, CheckCircle, Circle, TrendingUp, Award, Eye } from 'lucide-react';
import { useApi, apiPost, apiPut } from '../../hooks/useApi';
import { LoadingSpinner } from '../common/LoadingOverlay';
import { useNotifications } from '../../contexts/NotificationContext';

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



  // Filter only published materials for the selected project
  const projectMaterials = selectedProject
    ? materials
      .filter(m => m.projectId === selectedProject.id && m.published === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Get progress for current user (filtered from API) and manage optimistic state
  const myProgress = progress.filter(p => p.userId === currentUser?.id || p.volunteerId === currentUser?.id);
  const [optimisticProgress, setOptimisticProgress] = useState<any[]>([]);

  // Sync optimistic progress with server data when it loads/changes
  useEffect(() => {
    if (myProgress.length > 0) {
      setOptimisticProgress(myProgress);
    }
  }, [JSON.stringify(myProgress)]); // Simple comparison to avoid loops

  // Calculate project completion using optimistic data
  const getProjectCompletion = (projectId: string) => {
    const projectMats = materials.filter(m => m.projectId === projectId && m.published === true);
    if (projectMats.length === 0) return 0;

    const completedMats = projectMats.filter(m => {
      // Check both local optimistic state and server state
      const matProgress = optimisticProgress.find(p => p.materialId === m.id) || myProgress.find(p => p.materialId === m.id);
      return matProgress?.viewed === true;
    });

    return Math.round((completedMats.length / projectMats.length) * 100);
  };

  // Get material progress using optimistic data
  const getMaterialProgress = (materialId: string) => {
    return optimisticProgress.find(p => p.materialId === materialId) || myProgress.find(p => p.materialId === materialId);
  };

  // Mark material as viewed
  const markAsViewed = async (materialId: string) => {
    // Check if already viewed to facilitate idempotent calls
    const existing = getMaterialProgress(materialId);
    if (existing?.viewed) return;

    // Optimistic Update
    const newProgressItem = {
      materialId,
      userId: currentUser?.id,
      volunteerId: currentUser?.id,
      viewed: true,
      progress: 100,
      updatedAt: new Date().toISOString()
    };

    setOptimisticProgress(prev => {
      // Avoid duplicates
      if (prev.find(p => p.materialId === materialId)) return prev;
      return [...prev, newProgressItem];
    });

    try {
      // Silent update in bg, or show minimal toast
      // We rely on optimistic UI, so we don't need a blocking loader

      await apiPost('/material-progress', {
        materialId,
        volunteerId: currentUser?.id,
        // Removed userId to avoid potential DB column mismatch if table only has volunteer_id
        viewed: true,
        progress: 100,
      });

      // Refetch progress to sync server state eventually
      setTimeout(() => {
        refetchProgress();
      }, 1000);

    } catch (err: any) {
      console.error('Error marking material as viewed:', err);
      // We don't revert optimistic update here to avoid jarring UX if it's just a network blip.
      // The Next sync with server will correct it if it truly failed.

      // Manejo silencioso de errores durante inicio del servidor
      const errorMsg = err?.message || '';
      if (errorMsg.includes('iniciando') || errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.log('⏳ El progreso se guardará cuando el servidor esté listo (reintentando en fondo)');
        // Check if we need retry logic here or if useApi handles it. 
        // Since we used apiPost, it has retry logic.
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
          {/* Projects List - Sticky Header */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto pr-1 custom-scrollbar">
            <h3 className="text-gray-900 px-1">Tus Proyectos</h3>
            {myProjects.map((project) => {
              const isDirectlyAssigned = project.assignedVolunteers &&
                Array.isArray(project.assignedVolunteers) &&
                project.assignedVolunteers.includes(currentUser?.id);
              const isFromConvocatoria = projectIdsFromApplications.includes(project.id);
              const completionPercentage = getProjectCompletion(project.id);
              const projectMatsCount = materials.filter(m => m.projectId === project.id && m.published === true).length;
              const isSelected = selectedProject?.id === project.id;

              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-md ring-1 ring-emerald-100'
                    : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                >
                  {/* Header: Icon + Name + Status */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl shadow-sm transition-colors ${project.status === 'activo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-lg font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-gray-900'}`}>{project.name}</h4>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${project.status === 'activo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {project.status === 'activo' ? 'Activo' : 'Finalizado'}
                        </span>
                        {isFromConvocatoria && !isDirectlyAssigned && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-purple-100 text-purple-700">
                            Convocatoria
                          </span>
                        )}
                        {isDirectlyAssigned && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-teal-100 text-teal-700">
                            Asignado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description & Details */}
                  <div className="pl-1 space-y-3 mb-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Inicio: <span className="font-semibold text-gray-700">{new Date(project.startDate).toLocaleDateString('es-ES')}</span></span>
                      </div>
                      <div className="w-px h-3 bg-gray-300"></div>
                      <div className="flex items-center gap-1.5">
                        <span>Fin: <span className="font-semibold text-gray-700">{new Date(project.endDate).toLocaleDateString('es-ES')}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  {projectMatsCount > 0 ? (
                    <div className="space-y-2 pt-2 border-t border-gray-100/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Avance del curso
                        </span>
                        <span className={`font-bold text-sm ${completionPercentage === 100 ? 'text-emerald-600' : 'text-emerald-700'
                          }`}>
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ring-1 ring-gray-50">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${completionPercentage === 100
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      {completionPercentage === 100 && (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 py-1 rounded-md animate-fade-in">
                          <Award className="w-3.5 h-3.5" />
                          ¡Completado!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-100/50 text-xs text-gray-400 italic text-center">
                      Sin materiales disponibles
                    </div>
                  )}
                </button>
              );
            })}

            {/* Selected Project Info Card (Moved to Left Column) */}
            {selectedProject && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <FolderOpen className="w-24 h-24 text-emerald-900 transform rotate-12" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedProject.name}</h3>
                    <p className="text-gray-600 text-xs text-justify">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Dates Compact */}
                  <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 whitespace-nowrap overflow-x-auto">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Inicio</p>
                      <p className="font-medium text-gray-700">{new Date(selectedProject.startDate).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Fin</p>
                      <p className="font-medium text-gray-700">{new Date(selectedProject.endDate).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>

                  {selectedProject.objectives && (
                    <details className="group/details">
                      <summary className="cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 select-none">
                        <span className="group-open/details:hidden">Ver objetivos</span>
                        <span className="hidden group-open/details:block">Ocultar objetivos</span>
                        <Award className="w-3 h-3" />
                      </summary>
                      <div className="mt-2 text-xs text-gray-600 bg-emerald-50/50 p-2 rounded border border-emerald-100 text-justify">
                        {selectedProject.objectives}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Project Details and Materials */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProject ? (
              <>


                {/* Training Materials Section */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      Materiales de Capacitación
                    </h3>
                    {projectMaterials.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium text-gray-500">Progreso</p>
                          <p className="text-sm font-bold text-emerald-700 leading-none">{getProjectCompletion(selectedProject.id)}%</p>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getProjectCompletion(selectedProject.id)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {projectMaterials.length > 0 ? (
                    <div className="space-y-6">
                      {/* --- MAIN ACTIVE MATERIAL VIEWER --- */}
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        {(() => {
                          const uncompletedMaterial = projectMaterials.find(m => {
                            const prog = getMaterialProgress(m.id);
                            return !prog || !prog.viewed;
                          });

                          const activeMaterial = viewingMaterial || uncompletedMaterial || projectMaterials[0];

                          const Icon = getMaterialIcon(activeMaterial.type);
                          const youtubeUrl = activeMaterial.type === 'youtube' ? getYouTubeEmbedUrl(activeMaterial.url) : null;
                          const matProgress = getMaterialProgress(activeMaterial.id);
                          const isCompleted = matProgress?.viewed === true;

                          return (
                            <div className="flex flex-col">
                              {/* Active Content Header */}
                              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                    <Icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-700' : 'text-blue-700'}`} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-xl leading-tight">{selectedProject.name}</h4>
                                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                      Ahora viendo:
                                      <span className="text-gray-600 font-normal">{activeMaterial.title}</span>
                                    </p>
                                  </div>
                                </div>
                                {isCompleted ? (
                                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-100">
                                    <CheckCircle className="w-4 h-4" />
                                    Completado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100">
                                    <PlayCircle className="w-4 h-4" />
                                    En curso
                                  </span>
                                )}
                              </div>

                              {/* Active Content Body */}
                              <div className="bg-black/5 min-h-[300px] flex items-center justify-center relative group">
                                {/* YouTube */}
                                {youtubeUrl && (
                                  <div className="aspect-video w-full h-full">
                                    <iframe
                                      src={youtubeUrl}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      onLoad={() => {
                                        if (!isCompleted) markAsViewed(activeMaterial.id);
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Image */}
                                {activeMaterial.type === 'image' && activeMaterial.url && !youtubeUrl && (
                                  <img
                                    src={activeMaterial.url}
                                    alt={activeMaterial.title}
                                    className="w-full h-auto max-h-[500px] object-contain"
                                    onLoad={() => {
                                      if (!isCompleted) markAsViewed(activeMaterial.id);
                                    }}
                                  />
                                )}

                                {/* Documents / Links (Placeholders) */}
                                {!youtubeUrl && activeMaterial.type !== 'image' && (
                                  <div className="p-8 text-center max-w-lg mx-auto">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 inline-flex flex-col items-center">
                                      {activeMaterial.type === 'pdf' ? (
                                        <FileText className="w-16 h-16 text-red-500 mb-4" />
                                      ) : activeMaterial.type === 'link' ? (
                                        <ExternalLink className="w-16 h-16 text-blue-500 mb-4" />
                                      ) : (
                                        <Download className="w-16 h-16 text-emerald-500 mb-4" />
                                      )}
                                      <p className="text-gray-900 font-bold mb-2">Contenido Externo</p>
                                      <div className="flex gap-2">
                                        <a
                                          href={activeMaterial.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={() => {
                                            if (!isCompleted) markAsViewed(activeMaterial.id);
                                          }}
                                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                                        >
                                          {activeMaterial.type === 'link' ? 'Abrir Enlace' : 'Descargar / Ver'}
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                        {!isCompleted && (
                                          <button
                                            onClick={() => markAsViewed(activeMaterial.id)}
                                            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 font-medium transition-colors"
                                          >
                                            Marcar visto
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                      Este material es un recurso externo. Haz clic en el botón para acceder a él y registrar tu progreso.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* --- CAROUSEL / COMPRESSED LIST --- */}
                      <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <h4 className="text-gray-700 font-semibold ml-1">Lista de Contenidos</h4>
                          <span className="text-xs text-gray-500">Desliza para ver más</span>
                        </div>
                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                          {projectMaterials.map((material, index) => {
                            const Icon = getMaterialIcon(material.type);
                            const matProgress = getMaterialProgress(material.id);
                            const isCompleted = matProgress?.viewed === true;

                            const uncompleted = projectMaterials.find(m => {
                              const p = getMaterialProgress(m.id);
                              return !p || !p.viewed;
                            });
                            const activeId = (viewingMaterial?.id) || (uncompleted?.id) || (projectMaterials[0].id);
                            const isActive = activeId === material.id;

                            return (
                              <button
                                key={material.id}
                                onClick={() => {
                                  setViewingMaterial(material);
                                }}
                                className={`flex-shrink-0 w-64 snap-start text-left bg-white rounded-xl border transition-all duration-200 group relative overflow-hidden ${isActive
                                  ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md scale-[1.02]'
                                  : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                                  }`}
                              >
                                <div className="absolute top-2 right-2 z-10 transition-opacity duration-300">
                                  {isCompleted ? (
                                    <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                                      <CheckCircle className="w-3 h-3" />
                                    </div>
                                  ) : (
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-black/30 backdrop-blur-sm text-white'}`}>
                                      #{index + 1}
                                    </div>
                                  )}
                                </div>

                                {/* Thumbnail Placeholder */}
                                <div className={`h-32 w-full flex items-center justify-center relative ${isActive ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                  {material.type === 'youtube' ? (
                                    <img
                                      src={`https://img.youtube.com/vi/${(material.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/) || [])[1]}/mqdefault.jpg`}
                                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                  ) : (
                                    <Icon className={`w-10 h-10 ${isActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                                  )}

                                  {/* Highlight Active Badge */}
                                  {isActive && (
                                    <div className="absolute inset-x-0 bottom-0 top-auto h-1 bg-emerald-500"></div>
                                  )}
                                </div>

                                <div className="p-3">
                                  <h5 className={`text-sm font-semibold line-clamp-2 mb-1 ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                                    {material.title}
                                  </h5>
                                  <p className="text-xs text-gray-500 line-clamp-1">{material.type === 'youtube' ? 'Video' : material.type === 'pdf' ? 'Documento PDF' : 'Recurso'}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                        <Video className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-gray-900 font-medium text-sm">Sin materiales asignados</p>
                      <p className="text-gray-500 text-xs">Este proyecto aún no tiene contenido.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FolderOpen className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Selecciona un proyecto</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Elige uno de tus proyectos asignados a la izquierda para ver su contenido y progreso.
                </p>
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