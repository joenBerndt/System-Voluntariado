import { Calendar, FolderOpen, Award, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface VolunteerDashboardProps {
  currentUser?: any;
  applications?: any[];
  onNavigate?: (section: any) => void;
}

export function VolunteerDashboard({ currentUser, applications = [], onNavigate }: VolunteerDashboardProps) {
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: materialsData } = useApi<any[]>('/training-materials', { fallbackOnError: true, autoRetry: true });
  const { data: progressData } = useApi<any[]>('/material-progress', { fallbackOnError: true, autoRetry: true });
  const { data: convocatoriasData } = useApi<any[]>('/convocatorias');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');

  const projects = projectsData || [];
  const materials = materialsData || [];
  const progress = progressData || [];
  const convocatorias = convocatoriasData || [];
  const assignments = assignmentsData || [];

  // Get accepted applications for current user
  const acceptedApplications = applications.filter(app =>
    app.userEmail === currentUser?.email && app.status === 'accepted'
  );

  // Get project IDs from accepted applications via convocatorias
  const projectIdsFromApplications = acceptedApplications.map(app => {
    const conv = convocatorias.find(c => c.id === app.convocatoriaId);
    return conv?.projectId;
  }).filter(id => id); // Remove undefined values

  // Get project assignments for this volunteer
  const myAssignments = assignments.filter(a => a.volunteerId === currentUser?.id);
  const projectIdsFromAssignments = myAssignments.map(a => a.projectId);

  // Filter projects: assigned directly via project-assignments OR from accepted convocatorias
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

  // Filter applications for current user
  const myApplications = applications.filter(app => app.userEmail === currentUser?.email);

  const activeProjects = myProjects.filter(p => p.status === 'activo');
  const completedProjects = myProjects.filter(p => p.status === 'finalizado');

  // Get progress for current user - Robust check for userId OR volunteerId
  const myProgress = progress.filter(p => p.userId === currentUser?.id || p.volunteerId === currentUser?.id);

  // Calculate total training completion
  const getTotalTrainingCompletion = () => {
    // Get all published materials for user's projects
    const myProjectIds = myProjects.map(p => p.id);
    const myMaterials = materials.filter(m =>
      myProjectIds.includes(m.projectId) && m.published === true
    );

    if (myMaterials.length === 0) return 0;

    const completedMaterials = myMaterials.filter(m => {
      const matProgress = myProgress.find(p => p.materialId === m.id);
      return matProgress?.viewed === true;
    });

    return Math.round((completedMaterials.length / myMaterials.length) * 100);
  };

  // Count total completed trainings
  const completedTrainings = myProgress.filter(p => p.viewed === true).length;
  const totalTrainings = materials.filter(m => {
    const myProjectIds = myProjects.map(p => p.id);
    return myProjectIds.includes(m.projectId) && m.published === true;
  }).length;

  const stats = [
    {
      label: 'Proyectos Activos',
      value: activeProjects.length,
      icon: FolderOpen,
      color: 'from-emerald-600 to-emerald-700',
      description: 'Proyectos en los que participas',
      action: () => onNavigate?.('projects')
    },
    {
      label: 'Postulaciones',
      value: myApplications.length,
      icon: Calendar,
      color: 'from-purple-600 to-purple-700',
      description: 'Postulaciones enviadas',
      action: () => onNavigate?.('applications')
    },
    {
      label: 'Proyectos Completados',
      value: completedProjects.length,
      icon: Award,
      color: 'from-teal-600 to-teal-700',
      description: 'Proyectos finalizados',
      action: () => onNavigate?.('projects')
    },
    {
      label: 'Capacitaciones Completadas',
      value: `${completedTrainings}/${totalTrainings}`,
      icon: BookOpen,
      color: 'from-amber-600 to-amber-700',
      description: 'Materiales revisados',
      action: () => onNavigate?.('projects')
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-900 mb-2">Bienvenido, {currentUser?.name}</h2>
        <p className="text-gray-600">Aquí puedes ver tus proyectos asignados y capacitaciones</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.action}
              className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl text-left w-full group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-900 text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-900 mb-1 font-semibold">{stat.label}</p>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
          <h3 className="text-gray-900 mb-4">Mis Proyectos Activos</h3>
          <div className="space-y-4">
            {activeProjects.map((project) => {
              // Calculate project completion
              const projectMats = materials.filter(m => m.projectId === project.id && m.published === true);
              const completedMats = projectMats.filter(m => {
                const matProgress = myProgress.find(p => p.materialId === m.id);
                return matProgress?.viewed === true;
              });
              const completionPercentage = projectMats.length > 0
                ? Math.round((completedMats.length / projectMats.length) * 100)
                : 0;

              // Check assignment source
              const isFromAssignment = projectIdsFromAssignments.includes(project.id);
              const isFromConvocatoria = projectIdsFromApplications.includes(project.id);
              const assignmentSource = isFromAssignment
                ? 'Asignación Directa'
                : isFromConvocatoria
                  ? 'Convocatoria Aceptada'
                  : 'Asignación Legacy';

              return (
                <div key={project.id} className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{project.name}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-300">
                          ● Activo
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-300">
                          {assignmentSource}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{project.description}</p>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-emerald-100">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500">Período</p>
                        <p className="font-semibold text-gray-700">
                          {new Date(project.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(project.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-emerald-100">
                      <FolderOpen className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500">Materiales Disponibles</p>
                        <p className="font-semibold text-gray-700">
                          {projectMats.length} {projectMats.length === 1 ? 'material' : 'materiales'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Training Progress */}
                  {projectMats.length > 0 && (
                    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-emerald-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            Progreso de Capacitación
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${completionPercentage === 100 ? 'text-emerald-600' : 'text-gray-900'
                          }`}>
                          {completedMats.length}/{projectMats.length} ({completionPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 shadow-sm ${completionPercentage === 100
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      {completionPercentage === 100 && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-2 bg-emerald-50 p-2 rounded">
                          <Award className="w-4 h-4" />
                          ¡Capacitación completada!
                        </div>
                      )}
                      {projectMats.length > 0 && completionPercentage < 100 && (
                        <p className="text-xs text-gray-600 mt-2">
                          Te faltan {projectMats.length - completedMats.length} {projectMats.length - completedMats.length === 1 ? 'material' : 'materiales'} por completar
                        </p>
                      )}
                    </div>
                  )}

                  {projectMats.length === 0 && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Aún no hay materiales de capacitación disponibles para este proyecto
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Training Overview */}
      {totalTrainings > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-900 mb-1">Resumen de Capacitaciones</h3>
              <p className="text-gray-600 text-sm">Tu progreso global en todos los proyectos</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-amber-200">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <p className="text-gray-600 text-sm mb-1">Total de Materiales</p>
              <p className="text-gray-900 text-2xl font-bold">{totalTrainings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <p className="text-gray-600 text-sm mb-1">Completados</p>
              <p className="text-emerald-600 text-2xl font-bold">{completedTrainings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <p className="text-gray-600 text-sm mb-1">Pendientes</p>
              <p className="text-purple-600 text-2xl font-bold">{totalTrainings - completedTrainings}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progreso General</span>
              <span className="text-sm font-bold text-gray-900">{getTotalTrainingCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getTotalTrainingCompletion()}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications Status */}
      {myApplications.length > 0 && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
          <h3 className="text-gray-900 mb-4">Estado de mis Postulaciones</h3>
          <div className="space-y-3">
            {myApplications.slice(0, 5).map((app) => {
              const conv = convocatorias.find(c => c.id === app.convocatoriaId);
              const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                accepted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                rejected: 'bg-red-100 text-red-800 border-red-300'
              };
              const statusLabels = {
                pending: 'Pendiente',
                accepted: 'Aceptada',
                rejected: 'Rechazada'
              };

              return (
                <div key={app.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{conv?.title || 'Convocatoria'}</p>
                    <p className="text-sm text-gray-600">
                      Postulado el {new Date(app.appliedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[app.status as keyof typeof statusColors]}`}>
                    {statusLabels[app.status as keyof typeof statusLabels]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {activeProjects.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border-2 border-emerald-200 text-center">
          <FolderOpen className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No tienes proyectos activos aún</h3>
          <p className="text-gray-600 mb-4">
            {myApplications.length > 0
              ? 'Tus postulaciones están siendo revisadas. Pronto serás asignado a proyectos donde podrás contribuir.'
              : 'Postula a convocatorias abiertas para comenzar a participar en proyectos de voluntariado.'}
          </p>
          {completedProjects.length > 0 && (
            <p className="text-emerald-700 font-semibold">
              Has completado {completedProjects.length} {completedProjects.length === 1 ? 'proyecto' : 'proyectos'}. ¡Excelente trabajo!
            </p>
          )}
        </div>
      )}
    </div>
  );
}