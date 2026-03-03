import { Calendar, MapPin, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ApplicationHistoryProps {
  applications: any[];
  onBack: () => void;
}

export function ApplicationHistory({ applications, onBack }: ApplicationHistoryProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'En Revisión',
          color: 'bg-blue-100 text-blue-700',
          iconColor: 'text-blue-600'
        };
      case 'interview_pending':
        return {
          icon: Clock,
          text: 'Entrevista Programada',
          color: 'bg-orange-100 text-orange-700',
          iconColor: 'text-orange-600'
        };
      case 'interview_confirmed':
        return {
          icon: CheckCircle,
          text: 'Entrevista Realizada',
          color: 'bg-purple-100 text-purple-700',
          iconColor: 'text-purple-600'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          text: '¡Aceptado!',
          color: 'bg-green-100 text-green-700',
          iconColor: 'text-green-600'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'No Seleccionado',
          color: 'bg-red-100 text-red-700',
          iconColor: 'text-red-600'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          text: 'Cancelada',
          color: 'bg-gray-100 text-gray-700',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          icon: FileText,
          text: status,
          color: 'bg-gray-100 text-gray-700',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getProgressStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'interview_pending':
        return 1;
      case 'interview_confirmed':
        return 2;
      case 'accepted':
        return 3;
      case 'rejected':
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  // Sort applications by date (most recent first)
  const sortedApplications = [...applications].sort((a, b) => {
    return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
  });

  const activeApplications = sortedApplications.filter(
    app => !['rejected', 'cancelled', 'accepted'].includes(app.status)
  );
  
  const completedApplications = sortedApplications.filter(
    app => ['rejected', 'cancelled', 'accepted'].includes(app.status)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Volver al Dashboard
          </button>
          <h2 className="text-gray-900 mb-2">Historial de Postulaciones</h2>
          <p className="text-gray-600">
            Revisa el estado de tus postulaciones actuales y anteriores
          </p>
        </div>

        {/* Active Applications */}
        {activeApplications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Postulaciones Activas ({activeApplications.length})
            </h3>
            <div className="space-y-4">
              {activeApplications.map((app) => {
                const statusInfo = getStatusInfo(app.status);
                const StatusIcon = statusInfo.icon;
                const step = getProgressStep(app.status);

                return (
                  <div
                    key={app.id}
                    className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-2">{app.convocatoriaTitle}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${statusInfo.color}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.iconColor}`} />
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Postulado: {new Date(app.appliedDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{app.convocatoriaArea}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-3">Progreso de Selección:</p>
                      <div className="flex items-center justify-between relative">
                        {['Postulación', 'Entrevista Prog.', 'Entrevista Conf.', 'Aceptado'].map((label, idx) => (
                          <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              step >= idx
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-400'
                            }`}>
                              {step > idx ? '✓' : idx + 1}
                            </div>
                            <p className={`text-xs mt-2 text-center max-w-[80px] ${
                              step >= idx ? 'text-blue-600 font-medium' : 'text-gray-400'
                            }`}>
                              {label}
                            </p>
                          </div>
                        ))}
                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}>
                          <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {app.interviewScheduledDate && (
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800">
                          <strong>Entrevista programada:</strong> {new Date(app.interviewScheduledDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}

                    {app.interviewConfirmedDate && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800">
                          <strong>Entrevista realizada:</strong> {new Date(app.interviewConfirmedDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Applications */}
        {completedApplications.length > 0 && (
          <div>
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-600" />
              Historial Completo ({completedApplications.length})
            </h3>
            <div className="space-y-4">
              {completedApplications.map((app) => {
                const statusInfo = getStatusInfo(app.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={app.id}
                    className="bg-white p-6 rounded-xl shadow border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-2">{app.convocatoriaTitle}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${statusInfo.color}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.iconColor}`} />
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Postulado: {new Date(app.appliedDate).toLocaleDateString('es-ES')}</span>
                      </div>
                      {app.acceptedDate && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Aceptado: {new Date(app.acceptedDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {app.rejectedDate && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span>Finalizado: {new Date(app.rejectedDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {app.cancelledDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Cancelado: {new Date(app.cancelledDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">Sin postulaciones aún</h3>
            <p className="text-gray-600">
              Comienza a postular a las convocatorias disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}