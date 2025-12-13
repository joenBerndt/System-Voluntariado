import { useState } from 'react';
import { LogOut, User, Calendar, MapPin, Users, CheckCircle, Clock, AlertCircle, XCircle, FileText, History, UserCircle } from 'lucide-react';
import { useApi, apiPut } from '../../hooks/useApi';
import { ApplicationModal } from './ApplicationModal';
import { ApplicationHistory } from '../ApplicationHistory';
import { InterviewsView } from './InterviewsView';
import { ProfileView } from '../ProfileView';

interface VolunteerIntranetProps {
  volunteer: any;
  onLogout: () => void;
  onVolunteerUpdate?: (updatedVolunteer: any) => void;
}

export function VolunteerIntranet({ volunteer, onLogout, onVolunteerUpdate }: VolunteerIntranetProps) {
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showInterviews, setShowInterviews] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(volunteer);
  const { data: convocatoriasData, loading } = useApi<any[]>('/convocatorias');
  const { data: applicationsData, refetch: refetchApplications } = useApi<any[]>(
    `/applications/user/${currentVolunteer.email}`
  );

  const convocatorias = convocatoriasData || [];
  const applications = applicationsData || [];

  // Filter active convocatorias
  const activeConvocatorias = convocatorias.filter((c) => c.status === 'activa');

  // Check if already applied to a convocatoria
  const hasApplied = (convocatoriaId: string) => {
    return applications.some((app) => app.convocatoriaId === convocatoriaId);
  };

  const getApplicationStatus = (convocatoriaId: string) => {
    const app = applications.find((a) => a.convocatoriaId === convocatoriaId);
    return app?.status || null;
  };

  // Check if user is volunteer (role = 'volunteer')
  const isVolunteer = volunteer.role === 'volunteer';

  const handleCancelApplication = async (app: any) => {
    if (window.confirm(`¿Estás seguro de cancelar tu postulación a "${app.convocatoriaTitle}"? Esta acción no se puede deshacer.`)) {
      try {
        console.log('Cancelling application with data:', {
          email: app.userEmail,
          id: app.id,
          fullApp: app
        });

        if (!app.userEmail || !app.id) {
          throw new Error('Application data incomplete - missing email or id');
        }

        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'cancelled',
          cancelledDate: new Date().toISOString().split('T')[0],
        });
        alert('Postulación cancelada exitosamente');
        refetchApplications();
      } catch (err) {
        console.error('Error cancelling application:', err);
        alert('Error al cancelar la postulación: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentVolunteer(updatedUser);
    if (onVolunteerUpdate) {
      onVolunteerUpdate(updatedUser);
    }
  };

  // Show history view if requested
  if (showHistory) {
    return <ApplicationHistory applications={applications} onBack={() => setShowHistory(false)} />;
  }

  // Show interviews view if requested
  if (showInterviews) {
    return <InterviewsView volunteer={volunteer} onBack={() => setShowInterviews(false)} />;
  }

  // Show profile view if requested
  if (showProfile) {
    return <ProfileView user={currentVolunteer} onBack={() => setShowProfile(false)} onUpdate={handleProfileUpdate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Intranet de Voluntarios - IIAP</h1>
              <p className="text-gray-500 text-sm">Portal de Convocatorias</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-gray-900">{volunteer.name}</p>
              <p className="text-gray-500 text-sm">{volunteer.email}</p>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              title="Ver perfil"
            >
              {currentVolunteer.photoUrl ? (
                <img src={currentVolunteer.photoUrl} alt={volunteer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-blue-600">{volunteer.name.charAt(0)}</span>
              )}
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-xl text-white mb-8">
          <h2 className="text-white mb-2">¡Bienvenido, {volunteer.name}!</h2>
          <p className="text-blue-50">
            Explora las convocatorias disponibles y postula a las que más se ajusten a tu perfil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 text-2xl">{activeConvocatorias.length}</p>
                <p className="text-gray-600 text-sm">Convocatorias Activas</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 text-2xl">{applications.length}</p>
                <p className="text-gray-600 text-sm">Mis Postulaciones</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-900">{volunteer.area}</p>
                <p className="text-gray-600 text-sm">Área de Interés</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Button */}
        {applications.length > 0 && (
          <div className="mb-8 flex gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <History className="w-5 h-5" />
              Ver Historial Completo de Postulaciones
            </button>
            <button
              onClick={() => setShowInterviews(true)}
              className="flex items-center gap-2 bg-white border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Mis Entrevistas Programadas
            </button>
          </div>
        )}

        {/* Convocatorias Section */}
        <div className="mb-8">
          <h3 className="text-gray-900 mb-4">Convocatorias Disponibles</h3>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-500">Cargando convocatorias...</div>
            </div>
          ) : activeConvocatorias.length > 0 ? (
            <div className="space-y-4">
              {activeConvocatorias.map((convocatoria) => {
                const applied = hasApplied(convocatoria.id);
                const status = getApplicationStatus(convocatoria.id);

                return (
                  <div
                    key={convocatoria.id}
                    className={`bg-white p-6 rounded-xl border-2 transition-all ${applied ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-gray-900">{convocatoria.title}</h4>
                          {applied && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Ya postulaste
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{convocatoria.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{convocatoria.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {new Date(convocatoria.startDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay convocatorias activas en este momento</p>
            </div>
          )}
        </div>

        {/* My Applications Section */}
        {applications.length > 0 && (
          <div>
            <h3 className="text-gray-900 mb-4">Mis Postulaciones</h3>
            <div className="space-y-4">
              {applications.map((app) => {
                const conv = convocatorias.find(c => c.id === app.convocatoriaId);

                // Get status info
                const getStatusDisplay = (status: string) => {
                  switch (status) {
                    case 'pending':
                      return { text: 'En Revisión', color: 'bg-blue-100 text-blue-700', icon: Clock };
                    case 'interview_pending':
                      return { text: 'Entrevista Programada', color: 'bg-orange-100 text-orange-700', icon: Calendar };
                    case 'interview_confirmed':
                      return { text: 'Entrevista Realizada', color: 'bg-purple-100 text-purple-700', icon: CheckCircle };
                    case 'accepted':
                      return { text: 'Aceptado - ¡Eres Voluntario!', color: 'bg-green-100 text-green-700', icon: CheckCircle };
                    case 'rejected':
                      return { text: 'No Seleccionado', color: 'bg-red-100 text-red-700', icon: XCircle };
                    default:
                      return { text: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
                  }
                };

                const statusInfo = getStatusDisplay(app.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={app.id} className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-2">{conv?.title || 'Convocatoria no disponible'}</h4>
                        <p className="text-gray-600 text-sm mb-3">{conv?.area || '-'}</p>
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Postulado el</p>
                        <p className="font-medium">{new Date(app.appliedDate).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    {/* Progress indicator for non-rejected applications */}
                    {app.status !== 'rejected' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">Progreso:</p>
                        <div className="flex items-center justify-between relative">
                          {[
                            { step: 0, label: 'Postulación', status: 'pending' },
                            { step: 1, label: 'Entrevista', status: 'interview_pending' },
                            { step: 2, label: 'Evaluación', status: 'interview_confirmed' },
                            { step: 3, label: 'Aceptado', status: 'accepted' },
                          ].map(({ step, label, status }) => {
                            const isComplete = app.status === 'accepted' ||
                              (status === 'pending' && ['pending', 'interview_pending', 'interview_confirmed', 'accepted'].includes(app.status)) ||
                              (status === 'interview_pending' && ['interview_pending', 'interview_confirmed', 'accepted'].includes(app.status)) ||
                              (status === 'interview_confirmed' && ['interview_confirmed', 'accepted'].includes(app.status)) ||
                              (status === 'accepted' && app.status === 'accepted');

                            const isCurrent = app.status === status;

                            return (
                              <div key={step} className="flex flex-col items-center flex-1 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isComplete
                                  ? 'bg-blue-600 text-white'
                                  : isCurrent
                                    ? 'bg-orange-500 text-white animate-pulse'
                                    : 'bg-gray-200 text-gray-400'
                                  }`}>
                                  {isComplete ? '✓' : step + 1}
                                </div>
                                <p className={`text-xs mt-2 text-center ${isComplete || isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'
                                  }`}>
                                  {label}
                                </p>
                              </div>
                            );
                          })}
                          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0" style={{ margin: '0 2rem' }}>
                            <div
                              className="h-full bg-blue-600 transition-all duration-500"
                              style={{
                                width: app.status === 'accepted' ? '100%' :
                                  app.status === 'interview_confirmed' ? '66%' :
                                    app.status === 'interview_pending' ? '33%' :
                                      '0%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Messages based on status */}
                    {app.status === 'interview_pending' && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800 text-sm">
                          📅 <span className="font-medium">Entrevista programada.</span> El equipo del IIAP se pondrá en contacto contigo pronto con más detalles.
                        </p>
                      </div>
                    )}

                    {app.status === 'interview_confirmed' && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-800 text-sm">
                          ⏳ <span className="font-medium">Entrevista completada.</span> Estamos evaluando tu perfil. Te notificaremos pronto sobre la decisión final.
                        </p>
                      </div>
                    )}

                    {app.status === 'accepted' && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                          🎉 <span className="font-medium">¡Felicitaciones!</span> Has sido aceptado como voluntario. Tu cuenta ahora tiene permisos de voluntario activo.
                        </p>
                      </div>
                    )}

                    {app.status === 'rejected' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">
                          Lamentablemente, en esta ocasión no has sido seleccionado. Te invitamos a postular a futuras convocatorias.
                        </p>
                      </div>
                    )}

                    {/* Cancel application button - Only for pending status */}
                    {app.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleCancelApplication(app)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancelar mi postulación
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          Solo puedes cancelar antes de que se programe la entrevista
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {selectedConvocatoria && (
        <ApplicationModal
          convocatoria={selectedConvocatoria}
          volunteer={volunteer}
          onClose={() => setSelectedConvocatoria(null)}
          onSuccess={() => {
            setSelectedConvocatoria(null);
            refetchApplications();
          }}
        />
      )}
    </div>
  );
}