import { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye, Mail, Phone, Calendar, AlertCircle, Trash2, X, MapPin, FileText } from 'lucide-react';
import { useApi, apiPut, apiDelete } from '../../hooks/useApi';

interface ApplicationsAdminProps {
  isAdminJunior?: boolean;
}

export function ApplicationsAdmin({ isAdminJunior = false }: ApplicationsAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'interview_pending' | 'interview_confirmed' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [schedulingInterview, setSchedulingInterview] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const { data: applicationsData, loading, refetch } = useApi<any[]>('/applications');
  const { data: convocatoriasData } = useApi<any[]>('/convocatorias');

  const applications = applicationsData || [];
  const convocatorias = convocatoriasData || [];

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.convocatoriaTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openScheduleModal = (app: any) => {
    setSchedulingInterview(app);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewLocation('');
    setInterviewNotes('');
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      alert('Por favor completa la fecha y hora de la entrevista');
      return;
    }

    try {
      await apiPut(`/applications/${schedulingInterview.userEmail}/${schedulingInterview.id}`, {
        status: 'interview_pending',
        interviewDate,
        interviewTime,
        interviewLocation,
        interviewNotes,
      });
      alert(`Entrevista programada para ${schedulingInterview.userName}`);
      setSchedulingInterview(null);
      refetch();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert(`Error al programar la entrevista: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleConfirmInterview = async (app: any) => {
    if (window.confirm(`¿Confirmar entrevista realizada para ${app.userName}?`)) {
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'interview_confirmed',
          interviewConfirmedDate: new Date().toISOString().split('T')[0],
        });
        alert(`Entrevista confirmada para ${app.userName}`);
        refetch();
      } catch (err) {
        console.error('Error confirming interview:', err);
        alert(`Error al confirmar la entrevista: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleAccept = async (app: any) => {
    if (window.confirm(`¿Aceptar la postulación de ${app.userName}? Esto le dará el rol de voluntario.`)) {
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'accepted',
          acceptedDate: new Date().toISOString().split('T')[0],
        });
        alert(`Postulación aceptada. ${app.userName} ahora es voluntario.`);
        refetch();
      } catch (err) {
        console.error('Error accepting application:', err);
        alert(`Error al aceptar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleReject = async (app: any) => {
    if (window.confirm(`¿Rechazar la postulación de ${app.userName}?`)) {
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'rejected',
          rejectedDate: new Date().toISOString().split('T')[0],
        });
        alert('Postulación rechazada');
        refetch();
      } catch (err) {
        console.error('Error rejecting application:', err);
        alert(`Error al rechazar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (app: any) => {
    if (window.confirm(`¿Eliminar la postulación de ${app.userName}?`)) {
      try {
        await apiDelete(`/applications/${app.userEmail}/${app.id}`);
        alert(`Postulación eliminada para ${app.userName}`);
        refetch();
      } catch (err) {
        console.error('Error deleting application:', err);
        alert(`Error al eliminar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          text: 'Pendiente', 
          color: 'bg-blue-100 text-blue-700',
          step: 0
        };
      case 'interview_pending':
        return { 
          text: 'Entrevista Programada', 
          color: 'bg-orange-100 text-orange-700',
          step: 1
        };
      case 'interview_confirmed':
        return { 
          text: 'Entrevista Realizada', 
          color: 'bg-purple-100 text-purple-700',
          step: 2
        };
      case 'accepted':
        return { 
          text: 'Aceptado', 
          color: 'bg-green-100 text-green-700',
          step: 3
        };
      case 'rejected':
        return { 
          text: 'Rechazado', 
          color: 'bg-red-100 text-red-700',
          step: -1
        };
      default:
        return { 
          text: status, 
          color: 'bg-gray-100 text-gray-700',
          step: 0
        };
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const interviewPendingCount = applications.filter(a => a.status === 'interview_pending').length;
  const interviewConfirmedCount = applications.filter(a => a.status === 'interview_confirmed').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando postulaciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Postulaciones</h2>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            {pendingCount} Nuevas
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
            {interviewPendingCount} Entrevista Prog.
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
            {interviewConfirmedCount} Entrevista Conf.
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            {acceptedCount} Aceptados
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
            {rejectedCount} Rechazados
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o convocatoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'pending', label: 'Nuevas' },
              { value: 'interview_pending', label: 'Prog.' },
              { value: 'interview_confirmed', label: 'Conf.' },
              { value: 'accepted', label: 'Aceptados' },
              { value: 'rejected', label: 'Rechazados' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value as any)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  filterStatus === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const convocatoria = convocatorias.find(c => c.id === app.convocatoriaId);
            const statusInfo = getStatusInfo(app.status);
            
            return (
              <div
                key={app.id}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-900">{app.userName}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Postulando a: <span className="font-medium">{app.convocatoriaTitle}</span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>{app.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>{app.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{new Date(app.appliedDate).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Details (if scheduled) */}
                {app.status === 'interview_pending' && app.interviewDate && (
                  <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900 mb-2">📅 Entrevista Programada</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>{new Date(app.interviewDate).toLocaleDateString('es-ES')} - {app.interviewTime}</span>
                      </div>
                      {app.interviewLocation && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span>{app.interviewLocation}</span>
                        </div>
                      )}
                      {app.interviewNotes && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span>{app.interviewNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar for Active Applications */}
                {app.status !== 'rejected' && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">Estado del Proceso:</p>
                    <div className="flex items-center justify-between relative">
                      {['Postulación', 'Entrevista Prog.', 'Entrevista Conf.', 'Aceptado'].map((label, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            statusInfo.step >= idx 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {statusInfo.step > idx ? '✓' : idx + 1}
                          </div>
                          <p className={`text-xs mt-2 ${
                            statusInfo.step >= idx ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {label}
                          </p>
                        </div>
                      ))}
                      {/* Progress Lines */}
                      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-8">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className={`h-1 flex-1 ${
                            statusInfo.step > idx ? 'bg-blue-600' : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedApplication?.id === app.id ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <h5 className="text-gray-900 mb-2">Motivación</h5>
                      <p className="text-gray-700 text-sm">{app.motivation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-gray-900 mb-2">Disponibilidad</h5>
                        <p className="text-gray-700 text-sm">{app.availability}</p>
                      </div>
                      <div>
                        <h5 className="text-gray-900 mb-2">Área</h5>
                        <p className="text-gray-700 text-sm">
                          {convocatoria?.area || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {app.experience && (
                      <div>
                        <h5 className="text-gray-900 mb-2">Experiencia</h5>
                        <p className="text-gray-700 text-sm">{app.experience}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Ocultar detalles
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles completos
                  </button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openScheduleModal(app)}
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Programar Entrevista
                      </button>
                      <button
                        onClick={() => handleReject(app)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {app.status === 'interview_pending' && (
                    <>
                      <button
                        onClick={() => handleConfirmInterview(app)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirmar Entrevista Realizada
                      </button>
                      <button
                        onClick={() => handleReject(app)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {app.status === 'interview_confirmed' && (
                    <>
                      <button
                        onClick={() => handleAccept(app)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aceptar y Convertir en Voluntario
                      </button>
                      <button
                        onClick={() => handleReject(app)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {app.status === 'accepted' && app.acceptedDate && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Aceptado el {new Date(app.acceptedDate).toLocaleDateString('es-ES')}
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejectedDate && (
                    <div className="text-sm text-red-600 font-medium">
                      ✗ Rechazado el {new Date(app.rejectedDate).toLocaleDateString('es-ES')}
                    </div>
                  )}

                  {!isAdminJunior && (
                    <button
                      onClick={() => handleDelete(app)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'No se encontraron postulaciones con esos filtros'
              : 'No hay postulaciones aún'}
          </p>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-900">Programar Entrevista</h3>
              <button
                onClick={() => setSchedulingInterview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 mb-4">
                  Postulante: <span className="font-medium">{schedulingInterview.userName}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Fecha de Entrevista *</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Hora *</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="Ej: Oficina Principal, Sala de Reuniones 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notas Adicionales</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Instrucciones, documentos a traer, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSchedulingInterview(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={!interviewDate || !interviewTime}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Programar Entrevista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
