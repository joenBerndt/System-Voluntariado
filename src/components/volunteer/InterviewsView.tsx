import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';

interface Interview {
  id: string;
  userName: string;
  userEmail: string;
  convocatoriaTitle: string;
  status: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewNotes?: string;
  appliedDate: string;
}

interface InterviewsViewProps {
  volunteer: any;
  onBack: () => void;
}

export function InterviewsView({ volunteer, onBack }: InterviewsViewProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('all');

  // Fetch interviews on mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c/applications/user/${volunteer.email}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        // Filter only applications with scheduled interviews
        const scheduledInterviews = result.data.filter(
          (app: any) => app.status === 'interview_pending' && app.interviewDate
        );
        setInterviews(scheduledInterviews);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filterDate === 'all') return true;
    if (filterDate === 'upcoming') {
      return new Date(interview.interviewDate!) >= new Date();
    }
    if (filterDate === 'past') {
      return new Date(interview.interviewDate!) < new Date();
    }
    return true;
  });

  const upcomingCount = interviews.filter(i => new Date(i.interviewDate!) >= new Date()).length;
  const pastCount = interviews.filter(i => new Date(i.interviewDate!) < new Date()).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando entrevistas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Portal
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Mis Entrevistas Programadas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona tus entrevistas y revisa los detalles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <span className="font-medium">{upcomingCount}</span> Próximas
            </div>
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
              <span className="font-medium">{pastCount}</span> Pasadas
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterDate('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterDate === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({interviews.length})
            </button>
            <button
              onClick={() => setFilterDate('upcoming')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterDate === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximas ({upcomingCount})
            </button>
            <button
              onClick={() => setFilterDate('past')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterDate === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pasadas ({pastCount})
            </button>
          </div>
        </div>

        {/* Interviews List */}
        {filteredInterviews.length > 0 ? (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => {
              const interviewDate = new Date(interview.interviewDate!);
              const isPast = interviewDate < new Date();
              const isToday = interviewDate.toDateString() === new Date().toDateString();
              const isSoon = !isPast && !isToday && interviewDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={interview.id}
                  className={`bg-white p-6 rounded-xl border-2 transition-all ${
                    isToday
                      ? 'border-orange-300 bg-orange-50'
                      : isSoon
                      ? 'border-blue-300'
                      : isPast
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-gray-900">{interview.convocatoriaTitle}</h4>
                        {isToday && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            ¡Hoy!
                          </span>
                        )}
                        {isSoon && !isToday && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Próximamente
                          </span>
                        )}
                        {isPast && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            Finalizada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interview Details */}
                  <div className={`p-4 rounded-lg border mb-4 ${
                    isToday
                      ? 'bg-orange-100 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Detalles de la Entrevista
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {interviewDate.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{interview.interviewTime}</span>
                      </div>
                      {interview.interviewLocation && (
                        <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{interview.interviewLocation}</span>
                        </div>
                      )}
                      {interview.interviewNotes && (
                        <div className="flex items-start gap-2 text-gray-700 md:col-span-2">
                          <FileText className="w-4 h-4 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium mb-1">Instrucciones:</p>
                            <p className="text-gray-600">{interview.interviewNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Date */}
                  <div className="text-sm text-gray-600">
                    Postulación enviada el {new Date(interview.appliedDate).toLocaleDateString('es-ES')}
                  </div>

                  {/* Reminder for upcoming interviews */}
                  {(isToday || isSoon) && !isPast && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                      isToday
                        ? 'bg-orange-100 border border-orange-300'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        isToday ? 'text-orange-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isToday ? 'text-orange-900' : 'text-blue-900'
                        }`}>
                          {isToday
                            ? '¡Recuerda tu entrevista hoy!'
                            : 'Prepárate para tu entrevista'}
                        </p>
                        <p className={`text-sm mt-1 ${
                          isToday ? 'text-orange-700' : 'text-blue-700'
                        }`}>
                          {isToday
                            ? 'Asegúrate de llegar 10 minutos antes. Revisa la ubicación y trae los documentos necesarios.'
                            : 'Revisa los detalles de tu entrevista y prepara tus documentos con anticipación.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {filterDate === 'upcoming'
                ? 'No tienes entrevistas próximas'
                : filterDate === 'past'
                ? 'No tienes entrevistas pasadas'
                : 'No tienes entrevistas programadas'}
            </p>
            <p className="text-gray-500 text-sm">
              Las entrevistas programadas aparecerán aquí una vez que el administrador las agende.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}