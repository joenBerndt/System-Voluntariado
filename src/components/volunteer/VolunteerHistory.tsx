import { useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, FileText, Video } from 'lucide-react';

interface VolunteerHistoryProps {
  applications: any[];
  convocatorias: any[];
}

export function VolunteerHistory({ applications, convocatorias }: VolunteerHistoryProps) {
  const activityHistory = useMemo(() => {
    const history: any[] = [];
    
    // Add applications to history
    applications.forEach(app => {
      history.push({
        id: `app-${app.id}`,
        type: 'application',
        date: app.appliedDate,
        title: `Postulación a "${app.convocatoriaTitle}"`,
        status: app.status,
        description: `Enviaste una postulación a la convocatoria ${app.convocatoriaTitle}`,
        convocatoriaId: app.convocatoriaId
      });

      // Add interview events
      if (app.interviewDate) {
        history.push({
          id: `interview-${app.id}`,
          type: 'interview',
          date: app.interviewDate,
          title: `Entrevista programada para "${app.convocatoriaTitle}"`,
          status: app.status,
          description: `Entrevista programada el ${new Date(app.interviewDate).toLocaleDateString('es-ES')} a las ${app.interviewTime || 'N/A'}`,
          convocatoriaId: app.convocatoriaId
        });
      }

      // Add status changes
      if (app.status === 'accepted') {
        history.push({
          id: `accepted-${app.id}`,
          type: 'accepted',
          date: app.acceptedDate || app.appliedDate,
          title: `Postulación aceptada: "${app.convocatoriaTitle}"`,
          status: 'accepted',
          description: `¡Felicitaciones! Tu postulación fue aceptada`,
          convocatoriaId: app.convocatoriaId
        });
      } else if (app.status === 'rejected') {
        history.push({
          id: `rejected-${app.id}`,
          type: 'rejected',
          date: app.rejectedDate || app.appliedDate,
          title: `Postulación rechazada: "${app.convocatoriaTitle}"`,
          status: 'rejected',
          description: app.rejectionReason || 'Tu postulación no fue aceptada en esta ocasión',
          convocatoriaId: app.convocatoriaId
        });
      }
    });

    // Sort by date (most recent first)
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [applications]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return { Icon: FileText, color: 'bg-emerald-100 text-emerald-700' };
      case 'interview':
        return { Icon: Video, color: 'bg-purple-100 text-purple-700' };
      case 'accepted':
        return { Icon: CheckCircle, color: 'bg-green-100 text-green-700' };
      case 'rejected':
        return { Icon: XCircle, color: 'bg-red-100 text-red-700' };
      default:
        return { Icon: Clock, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Historial de Actividad</h2>
        <p className="text-gray-600">Todas tus actividades relacionadas con postulaciones y entrevistas</p>
      </div>

      {activityHistory.length > 0 ? (
        <div className="space-y-4">
          {activityHistory.map((activity) => {
            const { Icon, color } = getActivityIcon(activity.type);
            
            return (
              <div
                key={activity.id}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900">{activity.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">
                          {new Date(activity.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600">{activity.description}</p>
                    
                    {/* Status Badge */}
                    <div className="mt-3">
                      {activity.type === 'application' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 font-semibold">
                          <FileText className="w-3 h-3" />
                          Postulación enviada
                        </span>
                      )}
                      {activity.type === 'interview' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200 font-semibold">
                          <Video className="w-3 h-3" />
                          Entrevista programada
                        </span>
                      )}
                      {activity.type === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Aceptado
                        </span>
                      )}
                      {activity.type === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-semibold">
                          <XCircle className="w-3 h-3" />
                          No aceptado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Clock className="w-12 h-12 text-emerald-700" />
          </div>
          <h3 className="text-gray-900 mb-3">No hay actividad registrada</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Cuando realices postulaciones o tengas entrevistas, tu actividad aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}
