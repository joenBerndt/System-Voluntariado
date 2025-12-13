import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye, Mail, Phone, Calendar, AlertCircle, Trash2, X, MapPin, FileText, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { useApi, apiPut, apiDelete } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';

interface ApplicationsAdminProps {
  isAdminJunior?: boolean;
  currentUser?: any;
}

export function ApplicationsAdmin({ isAdminJunior = false, currentUser }: ApplicationsAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'interview_pending' | 'interview_confirmed' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [schedulingInterview, setSchedulingInterview] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      // Priority 1: Large screens always show 8 items
      if (window.innerHeight > 900) {
        return 8;
      }

      // Priority 2: Status-based overrides for standard/smaller screens
      if (selectedApplication) {
        if (selectedApplication.status === 'pending') return 7;
        if (['accepted', 'rejected'].includes(selectedApplication.status)) return 5;
      }

      // Default
      return 5;
    };

    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedApplication]);


  const { data: applicationsData, loading, refetch } = useApi<any[]>('/applications');
  const { data: convocatoriasData, refetch: refetchConvocatorias } = useApi<any[]>('/convocatorias');

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const applications = applicationsData || [];
  const convocatorias = convocatoriasData || [];


  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.convocatoriaTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesDate = !filterDate || new Date(app.appliedDate).toISOString().split('T')[0] === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
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
      showError('Error', 'Por favor completa la fecha y hora de la entrevista');
      return;
    }

    const loadingId = showLoading('Programando entrevista...', 'Por favor espere');

    try {
      await apiPut(`/applications/${schedulingInterview.userEmail}/${schedulingInterview.id}`, {
        status: 'interview_pending',
        interviewDate,
        interviewTime,
        interviewLocation,
        interviewNotes,
      });
      hideNotification(loadingId);
      showSuccess('Entrevista programada', `Entrevista programada para ${schedulingInterview.userName}`);

      // Update selectedApplication if open
      if (selectedApplication && selectedApplication.id === schedulingInterview.id) {
        setSelectedApplication({
          ...schedulingInterview,
          status: 'interview_pending',
          interviewDate,
          interviewTime,
          interviewLocation,
          interviewNotes
        });
      }

      setSchedulingInterview(null);
      refetch();
    } catch (err) {
      hideNotification(loadingId);
      console.error('Error scheduling interview:', err);
      showError('Error al programar', `No se pudo programar la entrevista: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleConfirmInterview = async (app: any) => {
    if (window.confirm(`¿Confirmar entrevista realizada para ${app.userName}?`)) {
      const loadingId = showLoading('Confirmando entrevista...', 'Por favor espere');
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'interview_confirmed',
          interviewConfirmedDate: new Date().toISOString().split('T')[0],
        });
        hideNotification(loadingId);
        showSuccess('Entrevista confirmada', `Entrevista confirmada para ${app.userName}`);
        // Update selectedApplication
        if (selectedApplication && selectedApplication.id === app.id) {
          setSelectedApplication({ ...selectedApplication, status: 'interview_confirmed', interviewConfirmedDate: new Date().toISOString().split('T')[0] });
        }
        refetch();
      } catch (err) {
        hideNotification(loadingId);
        console.error('Error confirming interview:', err);
        showError('Error', `Error al confirmar la entrevista: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleAccept = async (app: any) => {
    if (window.confirm(`¿Aceptar la postulación de ${app.userName}? Esto le dará el rol de voluntario.`)) {
      const loadingId = showLoading('Aceptando postulación...', 'Por favor espere');
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'accepted',
          acceptedDate: new Date().toISOString().split('T')[0],
        });
        hideNotification(loadingId);
        showSuccess('Postulación aceptada', `${app.userName} ahora es voluntario.`);
        // Update selectedApplication
        if (selectedApplication && selectedApplication.id === app.id) {
          setSelectedApplication({ ...selectedApplication, status: 'accepted', acceptedDate: new Date().toISOString().split('T')[0] });
        }
        refetch();
        refetchConvocatorias();
      } catch (err) {
        hideNotification(loadingId);
        console.error('Error accepting application:', err);
        showError('Error', `Error al aceptar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleReject = async (app: any) => {
    if (window.confirm(`¿Rechazar la postulación de ${app.userName}?`)) {
      const loadingId = showLoading('Rechazando postulación...', 'Por favor espere');
      try {
        await apiPut(`/applications/${app.userEmail}/${app.id}`, {
          status: 'rejected',
          rejectedDate: new Date().toISOString().split('T')[0],
        });
        hideNotification(loadingId);
        showSuccess('Postulación rechazada', 'La postulación ha sido rechazada');
        // Update selectedApplication
        if (selectedApplication && selectedApplication.id === app.id) {
          setSelectedApplication({ ...selectedApplication, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0] });
        }
        refetch();
      } catch (err) {
        hideNotification(loadingId);
        console.error('Error rejecting application:', err);
        showError('Error', `Error al rechazar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (app: any) => {
    if (window.confirm(`¿Eliminar la postulación de ${app.userName}?`)) {
      const loadingId = showLoading('Eliminando postulación...', 'Por favor espere');
      try {
        await apiDelete(`/applications/${app.userEmail}/${app.id}`);
        hideNotification(loadingId);
        showSuccess('Postulación eliminada', `Postulación eliminada para ${app.userName}`);
        refetch();
      } catch (err) {
        hideNotification(loadingId);
        console.error('Error deleting application:', err);
        showError('Error', `Error al eliminar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o convocatoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-1">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600"
            />
          </div>

          <div className="md:col-span-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600 bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Nuevas</option>
              <option value="interview_pending">Entrevista Programada</option>
              <option value="interview_confirmed">Entrevista Confirmada</option>
              <option value="accepted">Aceptados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: List */}
          <div className="space-y-4">
            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Candidato</th>
                    <th className="px-4 py-3 w-24">Fecha</th>
                    <th className="px-4 py-3 w-[25%]">Convocatoria</th>
                    <th className="px-4 py-3 w-[20%] text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedApplications.map((app, index) => {
                    const statusInfo = getStatusInfo(app.status);
                    const isSelected = selectedApplication?.id === app.id;
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                      >
                        <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                          {String(globalIndex).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{app.userName}</p>
                            <p className="text-xs text-gray-500 truncate">{app.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {new Date(app.appliedDate).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-600 line-clamp-2" title={app.convocatoriaTitle}>
                            {app.convocatoriaTitle}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.color.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-')}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 px-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>



          {/* Right Column: Details Panel */}
          <div className="lg:sticky lg:top-6">
            {selectedApplication ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedApplication.userName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                      <Mail className="w-3.5 h-3.5" /> {selectedApplication.userEmail}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                      <Phone className="w-3.5 h-3.5" /> {selectedApplication.userPhone}
                    </div>
                  </div>
                  <button onClick={() => setSelectedApplication(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {/* Progress Bar */}
                  {selectedApplication.status !== 'rejected' && (
                    <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100">
                      <h4 className="text-xs font-semibold text-blue-900 mb-4 uppercase tracking-wider">Progreso de la Postulación</h4>
                      <div className="relative flex justify-between px-2">
                        <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
                        <div
                          className="absolute top-3 left-0 h-0.5 bg-blue-500 transition-all duration-500 -z-10"
                          style={{ width: `${Math.max(0, getStatusInfo(selectedApplication.status).step) * 33.33}%` }}
                        ></div>

                        {['Postulación', 'Entrevista', 'Confirmada', 'Aceptado'].map((step, idx) => {
                          const currentStep = getStatusInfo(selectedApplication.status).step;
                          const isCompleted = currentStep >= idx;
                          const isCurrent = currentStep === idx;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 w-1/4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? 'bg-blue-600 text-white ring-4 ring-white' : 'bg-gray-200 text-gray-400 ring-4 ring-white'}`}>
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-tight text-center leading-none mt-1 ${isCurrent ? 'text-blue-700' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* Interview Details if Scheduled */}
                  {selectedApplication.status === 'interview_pending' && selectedApplication.interviewDate && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                      <h5 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Entrevista Programada
                      </h5>
                      <div className="text-sm text-orange-800 space-y-1">
                        <p>{new Date(selectedApplication.interviewDate).toLocaleDateString()} - {selectedApplication.interviewTime}</p>
                        {selectedApplication.interviewLocation && <p>{selectedApplication.interviewLocation}</p>}
                      </div>
                    </div>
                  )}

                  {/* Details Data */}
                  {/* Details Button */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowDetailsModal(true)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium group border-2 border-transparent hover:border-blue-100"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        Ver Detalles Completos
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                    {selectedApplication.status === 'pending' && (
                      <button onClick={() => openScheduleModal(selectedApplication)} className="w-full flex justify-center items-center gap-2 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors">
                        <Clock className="w-4 h-4" /> Programar Entrevista
                      </button>
                    )}
                    {selectedApplication.status === 'interview_pending' && (
                      <button onClick={() => handleConfirmInterview(selectedApplication)} className="w-full flex justify-center items-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                        <CheckCircle className="w-4 h-4" /> Confirmar Entrevista Realizada
                      </button>
                    )}
                    {selectedApplication.status === 'interview_confirmed' && (
                      <button onClick={() => handleAccept(selectedApplication)} className="w-full flex justify-center items-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                        <CheckCircle className="w-4 h-4" /> Aceptar como Voluntario
                      </button>
                    )}

                    {/* Reject Action - Visible unless already accepted or rejected */}
                    {selectedApplication.status !== 'accepted' && selectedApplication.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(selectedApplication)}
                        className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
                      >
                        Rechazar Postulación
                      </button>
                    )}

                    {/* Delete Action - Super Admin Only */}
                    {currentUser?.role === 'admin_master' && (
                      <button
                        onClick={() => handleDelete(selectedApplication)}
                        className="w-full flex justify-center items-center gap-2 py-2.5 bg-white text-red-600 border-2 border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 font-medium transition-colors mt-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar Postulación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles de la Postulación</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Selecciona una postulación de la lista para ver su información completa, progreso y gestionar su estado.</p>
              </div>
            )}
          </div>
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

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-0 relative shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detalles de la Postulación</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedApplication.userName}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {/* Motivation */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Motivación para el voluntariado
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{selectedApplication.motivation}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Teléfono
                    </h5>
                    <p className="text-gray-900 font-medium">{selectedApplication.userPhone}</p>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </h5>
                    <p className="text-gray-900 font-medium break-all">{selectedApplication.userEmail}</p>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Disponibilidad</h5>
                    <p className="text-gray-900 font-medium">{selectedApplication.availability}</p>
                  </div>
                  <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Área de Interés</h5>
                    <p className="text-gray-900 font-medium">{selectedApplication.convocatoriaTitle}</p>
                  </div>
                </div>

                {/* Timeline */}
                <h5 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Cronología de Eventos
                </h5>

                <div className="relative px-2">
                  {/* Continuous Vertical Line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-200 -z-10"></div>

                  <div className="space-y-6">
                    {/* Applied */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white border border-blue-200 text-blue-600 shadow-sm z-10">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-blue-100 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">Postulación Recibida</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                            {new Date(selectedApplication.appliedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-400 font-mono w-12 text-right">
                            {new Date(selectedApplication.appliedDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interview Pending */}
                    {selectedApplication.interviewDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 flex justify-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center ring-4 ring-white border border-orange-200 text-orange-600 shadow-sm z-10">
                            <Calendar className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-orange-100 transition-colors">
                          <div className="flex flex-col max-w-[50%]">
                            <span className="text-sm font-bold text-gray-900">Entrevista Programada</span>
                            {selectedApplication.interviewLocation && (
                              <span className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" /> {selectedApplication.interviewLocation}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                              {new Date(selectedApplication.interviewDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <div className="w-12 text-right">
                              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                {selectedApplication.interviewTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interview Confirmed */}
                    {selectedApplication.interviewConfirmedDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 flex justify-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center ring-4 ring-white border border-purple-200 text-purple-600 shadow-sm z-10">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-purple-100 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">Entrevista Realizada</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                              {new Date(selectedApplication.interviewConfirmedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-200 w-12 text-right">--:--</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Accepted */}
                    {selectedApplication.acceptedDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 flex justify-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white border border-green-200 text-green-600 shadow-sm z-10">
                            <UserCheck className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-green-100 bg-green-50/10 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">Aceptado como Voluntario</span>
                            <span className="text-xs text-green-600 mt-0.5">¡Aprobado!</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                              {new Date(selectedApplication.acceptedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-200 w-12 text-right">--:--</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejected */}
                    {selectedApplication.rejectedDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 flex justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center ring-4 ring-white border border-red-200 text-red-600 shadow-sm z-10">
                            <XCircle className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-red-100 bg-red-50/10 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">Postulación Rechazada</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                              {new Date(selectedApplication.rejectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-200 w-12 text-right">--:--</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
