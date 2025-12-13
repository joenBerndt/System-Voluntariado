import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, AlertCircle, Search, FolderOpen } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface VolunteerInterviewsProps {
  interviews: any[];
  convocatorias: any[];
}

export function VolunteerInterviews({ interviews, convocatorias }: VolunteerInterviewsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');

  const projects = projectsData || [];
  const areas = areasData || [];

  const getConvocatoria = (convocatoriaId: string) => {
    return convocatorias.find(c => c.id === convocatoriaId);
  };

  const filteredInterviews = interviews.filter(app => {
    const convocatoria = getConvocatoria(app.convocatoriaId);
    if (!convocatoria) return false;

    // Search Filter
    const matchesSearch = !searchTerm ||
      convocatoria.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.interviewLocation && app.interviewLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    // Date Filter
    let matchesDate = true;
    if (filterDate && app.interviewDate) {
      const d = new Date(app.interviewDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const itemDate = `${year}-${month}-${day}`;
      matchesDate = itemDate === filterDate;
    } else if (filterDate) {
      matchesDate = false;
    }

    // Area Filter
    let matchesArea = true;
    if (filterArea) {
      const project = projects.find(p => p.id === convocatoria.projectId);
      if (!project || project.areaId !== filterArea) {
        matchesArea = false;
      }
    }

    return matchesSearch && matchesDate && matchesArea;
  });

  const upcomingInterviews = filteredInterviews.filter(app => {
    if (!app.interviewDate) return false;
    const interviewDate = new Date(app.interviewDate);
    const now = new Date();
    return interviewDate >= now;
  });

  const pastInterviews = filteredInterviews.filter(app => {
    if (!app.interviewDate) return false;
    const interviewDate = new Date(app.interviewDate);
    const now = new Date();
    return interviewDate < now;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Mis Entrevistas</h2>
        <p className="text-gray-600">Revisa tus entrevistas programadas y pasadas</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por convocatoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="text-gray-500 w-5 h-5" />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <FolderOpen className="text-gray-500 w-5 h-5" />
            </div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white appearance-none"
            >
              <option value="">Todas las Áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-700" />
            </div>
            Próximas Entrevistas
          </h3>
          <div className="space-y-4">
            {upcomingInterviews.map((application) => {
              const convocatoria = getConvocatoria(application.convocatoriaId);
              const daysUntil = Math.ceil((new Date(application.interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={application.id}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">{convocatoria?.title || 'Convocatoria no disponible'}</h4>
                      {daysUntil <= 3 && daysUntil > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold border border-amber-200 mb-3">
                          <AlertCircle className="w-4 h-4" />
                          En {daysUntil} día{daysUntil !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Video className="w-6 h-6 text-purple-700" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-purple-900 font-medium text-sm mb-1">Fecha</p>
                        <p className="text-purple-800 font-semibold">
                          {new Date(application.interviewDate).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {application.interviewTime && (
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-purple-900 font-medium text-sm mb-1">Hora</p>
                          <p className="text-purple-800 font-semibold">{application.interviewTime}</p>
                        </div>
                      </div>
                    )}

                    {application.interviewLocation && (
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-purple-900 font-medium text-sm mb-1">Lugar</p>
                          <p className="text-purple-800">{application.interviewLocation}</p>
                        </div>
                      </div>
                    )}

                    {application.interviewNotes && (
                      <div className="bg-white p-4 rounded-lg mt-3">
                        <p className="text-purple-900 font-medium mb-2">Notas adicionales:</p>
                        <p className="text-purple-800">{application.interviewNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900">
                      <span className="font-semibold">Estado:</span>{' '}
                      {application.status === 'interview_pending' && 'Entrevista programada'}
                      {application.status === 'interview_confirmed' && 'Entrevista confirmada'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-gray-700" />
            </div>
            Entrevistas Pasadas
          </h3>
          <div className="space-y-4">
            {pastInterviews.map((application) => {
              const convocatoria = getConvocatoria(application.convocatoriaId);

              return (
                <div
                  key={application.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">{convocatoria?.title || 'Convocatoria no disponible'}</h4>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(application.interviewDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {application.interviewTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{application.interviewTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Estado:</span>{' '}
                      {application.status === 'interview_confirmed' && 'Entrevista completada - En evaluación'}
                      {application.status === 'accepted' && 'Postulación aceptada'}
                      {application.status === 'rejected' && 'Postulación no aceptada'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No interviews */}
      {interviews.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Video className="w-12 h-12 text-purple-700" />
          </div>
          <h3 className="text-gray-900 mb-3">No tienes entrevistas programadas</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Cuando tus postulaciones avancen al proceso de entrevista, aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  );
}
