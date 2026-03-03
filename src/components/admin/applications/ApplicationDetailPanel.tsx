import { FileText, Calendar, MapPin, Clock, Eye, CheckCircle, Trash2 } from 'lucide-react';

interface ApplicationDetailPanelProps {
    application: any;
    onViewDetails: () => void;
    onScheduleInterview: (app: any) => void;
    onConfirmInterview: (app: any) => void;
    onAccept: (app: any) => void;
    onReject: (app: any) => void;
    onDelete: (app: any) => void;
    currentUser: any;
}

export function ApplicationDetailPanel({
    application,
    onViewDetails,
    onScheduleInterview,
    onConfirmInterview,
    onAccept,
    onReject,
    onDelete,
    currentUser
}: ApplicationDetailPanelProps) {

    if (!application) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles de la Postulación</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Selecciona una postulación de la lista para ver su información completa, progreso y gestionar su estado.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full sticky top-6">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{application.userName}</h3>
                        <p className="text-gray-500 text-sm mt-1">{application.convocatoriaTitle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${application.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        application.status === 'interview_pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            application.status === 'interview_confirmed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                application.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {application.status === 'pending' ? 'Pendiente' :
                            application.status === 'interview_pending' ? 'Entrevista Programada' :
                                application.status === 'interview_confirmed' ? 'Entrevista Realizada' :
                                    application.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Next Step Card */}
                {application.status === 'interview_pending' && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-5 mb-6">
                        <h4 className="text-orange-900 font-bold mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Próxima Entrevista
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-orange-800 bg-white/60 p-3 rounded-lg">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold capitalize">
                                    {new Date(application.interviewDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-orange-800 bg-white/60 p-3 rounded-lg">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold">{application.interviewTime}</span>
                            </div>
                            {application.interviewLocation && (
                                <div className="flex items-center gap-3 text-orange-800 bg-white/60 p-3 rounded-lg">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="font-semibold">{application.interviewLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Info */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Resumen</h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                                {application.motivation}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Disponibilidad</h4>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 text-sm font-medium">{application.availability}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <button
                            onClick={onViewDetails}
                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold transition-colors"
                        >
                            <Eye className="w-4 h-4" /> Ver Detalles Completos
                        </button>

                        {/* Workflow Actions */}
                        {(application.status === 'pending' || application.status === 'rejected') && (
                            <button
                                onClick={() => onScheduleInterview(application)}
                                className="w-full flex justify-center items-center gap-2 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                            >
                                <Clock className="w-4 h-4" /> Programar Entrevista
                            </button>
                        )}
                        {application.status === 'interview_pending' && (
                            <button
                                onClick={() => onConfirmInterview(application)}
                                className="w-full flex justify-center items-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" /> Confirmar Entrevista Realizada
                            </button>
                        )}
                        {application.status === 'interview_confirmed' && (
                            <button
                                onClick={() => onAccept(application)}
                                className="w-full flex justify-center items-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" /> Aceptar como Voluntario
                            </button>
                        )}

                        {/* Reject Action - Visible unless already accepted or rejected */}
                        {application.status !== 'accepted' && application.status !== 'rejected' && (
                            <button
                                onClick={() => onReject(application)}
                                className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
                            >
                                Rechazar Postulación
                            </button>
                        )}

                        {/* Delete Action - Super Admin Only */}
                        {currentUser?.role === 'admin_master' && (
                            <button
                                onClick={() => onDelete(application)}
                                className="w-full flex justify-center items-center gap-2 py-2.5 bg-white text-red-600 border-2 border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 font-medium transition-colors mt-2"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar Postulación
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
