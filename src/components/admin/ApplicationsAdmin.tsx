import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useApi, apiPut, apiDelete } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { ApplicationDetailModal } from './applications/ApplicationDetailModal';
import { ScheduleInterviewModal } from './applications/ScheduleInterviewModal';
import { ApplicationDetailPanel } from './applications/ApplicationDetailPanel';
import { AdminTableSkeleton, DetailPanelSkeleton, StatsSkeleton } from '../common/Skeletons';
import { ConfirmationModal } from '../common/ConfirmationModal';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => { },
  });

  // Resize logic for responsiveness
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (window.innerHeight > 900) return 8;
      if (selectedApplication) {
        if (selectedApplication.status === 'pending') return 7;
        if (['accepted', 'rejected'].includes(selectedApplication.status)) return 5;
      }
      return 5;
    };

    const handleResize = () => setItemsPerPage(calculateItemsPerPage());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedApplication]);

  const { data: applicationsData, loading, refetch } = useApi<any[]>('/applications');
  const { refetch: refetchConvocatorias } = useApi<any[]>('/convocatorias');

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const applications = applicationsData || [];

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.convocatoriaTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesDate = !filterDate || new Date(app.appliedDate).toISOString().split('T')[0] === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleScheduleInterview = async (app: any, data: { date: string; time: string; location: string; notes: string }) => {
    if (!data.date || !data.time) {
      showError('Error', 'Por favor completa la fecha y hora de la entrevista');
      return;
    }

    const loadingId = showLoading('Programando entrevista...', 'Por favor espere');

    try {
      await apiPut(`/applications/${app.userEmail}/${app.id}`, {
        status: 'interview_pending',
        interviewDate: data.date,
        interviewTime: data.time,
        interviewLocation: data.location,
        interviewNotes: data.notes,
      });
      hideNotification(loadingId);
      showSuccess('Entrevista programada', `Entrevista programada para ${app.userName}`);

      if (selectedApplication && selectedApplication.id === app.id) {
        setSelectedApplication({
          ...app,
          status: 'interview_pending',
          interviewDate: data.date,
          interviewTime: data.time,
          interviewLocation: data.location,
          interviewNotes: data.notes
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

  const handleConfirmInterview = (app: any) => {
    setConfirmation({
      isOpen: true,
      title: 'Confirmar entrevista',
      description: `¿Confirmar entrevista realizada para ${app.userName}?`,
      confirmText: 'Confirmar',
      variant: 'default',
      onConfirm: async () => {
        const loadingId = showLoading('Confirmando entrevista...', 'Por favor espere');
        try {
          await apiPut(`/applications/${app.userEmail}/${app.id}`, {
            status: 'interview_confirmed',
            interviewConfirmedDate: new Date().toISOString().split('T')[0],
          });
          hideNotification(loadingId);
          showSuccess('Entrevista confirmada', `Entrevista confirmada para ${app.userName}`);
          if (selectedApplication && selectedApplication.id === app.id) {
            setSelectedApplication({ ...selectedApplication, status: 'interview_confirmed', interviewConfirmedDate: new Date().toISOString().split('T')[0] });
          }
          refetch();
        } catch (err) {
          hideNotification(loadingId);
          showError('Error', `Error al confirmar la entrevista: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleAccept = (app: any) => {
    setConfirmation({
      isOpen: true,
      title: 'Aceptar postulación',
      description: `¿Aceptar la postulación de ${app.userName}? Esto le dará el rol de voluntario.`,
      confirmText: 'Aceptar',
      variant: 'default',
      onConfirm: async () => {
        const loadingId = showLoading('Aceptando postulación...', 'Por favor espere');
        try {
          await apiPut(`/applications/${app.userEmail}/${app.id}`, {
            status: 'accepted',
            acceptedDate: new Date().toISOString().split('T')[0],
          });
          hideNotification(loadingId);
          showSuccess('Postulación aceptada', `${app.userName} ahora es voluntario.`);
          if (selectedApplication && selectedApplication.id === app.id) {
            setSelectedApplication({ ...selectedApplication, status: 'accepted', acceptedDate: new Date().toISOString().split('T')[0] });
          }
          refetch();
          refetchConvocatorias();
        } catch (err) {
          hideNotification(loadingId);
          showError('Error', `Error al aceptar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleReject = (app: any) => {
    setConfirmation({
      isOpen: true,
      title: 'Rechazar postulación',
      description: `¿Rechazar la postulación de ${app.userName}?`,
      confirmText: 'Rechazar',
      variant: 'danger',
      onConfirm: async () => {
        const loadingId = showLoading('Rechazando postulación...', 'Por favor espere');
        try {
          await apiPut(`/applications/${app.userEmail}/${app.id}`, {
            status: 'rejected',
            rejectedDate: new Date().toISOString().split('T')[0],
          });
          hideNotification(loadingId);
          showSuccess('Postulación rechazada', 'La postulación ha sido rechazada');
          if (selectedApplication && selectedApplication.id === app.id) {
            setSelectedApplication({ ...selectedApplication, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0] });
          }
          refetch();
        } catch (err) {
          hideNotification(loadingId);
          showError('Error', `Error al rechazar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDelete = (app: any) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar postulación',
      description: `¿Eliminar la postulación de ${app.userName}?`,
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const loadingId = showLoading('Eliminando postulación...', 'Por favor espere');
        try {
          await apiDelete(`/applications/${app.userEmail}/${app.id}`);
          hideNotification(loadingId);
          showSuccess('Postulación eliminada', `Postulación eliminada para ${app.userName}`);
          refetch();
          setSelectedApplication(null); // Clear selection after delete
        } catch (err) {
          hideNotification(loadingId);
          showError('Error', `Error al eliminar la postulación: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'Pendiente', color: 'bg-blue-100 text-blue-700' };
      case 'interview_pending': return { text: 'Entrevista Programada', color: 'bg-orange-100 text-orange-700' };
      case 'interview_confirmed': return { text: 'Entrevista Realizada', color: 'bg-purple-100 text-purple-700' };
      case 'accepted': return { text: 'Aceptado', color: 'bg-green-100 text-green-700' };
      case 'rejected': return { text: 'Rechazado', color: 'bg-red-100 text-red-700' };
      default: return { text: status, color: 'bg-gray-100 text-gray-700' };
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <StatsSkeleton />
          <AdminTableSkeleton rows={5} />
        </div>
        <div className="lg:sticky lg:top-6 w-full">
          <DetailPanelSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Postulaciones</h2>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{pendingCount} Nuevas</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">{interviewPendingCount} Entrevista Prog.</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">{interviewConfirmedCount} Entrevista Conf.</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">{acceptedCount} Aceptados</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">{rejectedCount} Rechazados</span>
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
            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white min-h-[500px] flex flex-col">
              <table className="w-full text-left text-sm text-gray-600 h-full">
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
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                  {paginatedApplications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No se encontraron resultados en esta página.
                      </td>
                    </tr>
                  )}
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
                <span className="text-sm font-medium text-gray-600">
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

          {/* Right Column: Detail Panel */}
          <div className="lg:sticky lg:top-6 w-full">
            <ApplicationDetailPanel
              application={selectedApplication}
              onViewDetails={() => setShowDetailsModal(true)}
              onScheduleInterview={(app) => setSchedulingInterview(app)}
              onConfirmInterview={handleConfirmInterview}
              onAccept={handleAccept}
              onReject={handleReject}
              onDelete={handleDelete}
              currentUser={currentUser}
            />
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

      {/* Modals */}
      <ScheduleInterviewModal
        isOpen={!!schedulingInterview}
        application={schedulingInterview}
        onClose={() => setSchedulingInterview(null)}
        onSchedule={handleScheduleInterview}
      />

      {showDetailsModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
      />
    </div>
  );
}
