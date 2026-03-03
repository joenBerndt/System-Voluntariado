import { X, FileText, Phone, Mail, Clock, MapPin, Calendar, CheckCircle, UserCheck, XCircle } from 'lucide-react';

interface ApplicationDetailModalProps {
    application: any;
    onClose: () => void;
}

export function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
    if (!application) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-0 relative shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Detalles de la Postulación</h3>
                        <p className="text-gray-500 text-sm mt-1">{application.userName}</p>
                    </div>
                    <button
                        onClick={onClose}
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
                            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{application.motivation}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Teléfono
                                </h5>
                                <p className="text-gray-900 font-medium">{application.userPhone}</p>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email
                                </h5>
                                <p className="text-gray-900 font-medium break-all">{application.userEmail}</p>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Disponibilidad</h5>
                                <p className="text-gray-900 font-medium">{application.availability}</p>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Área de Interés</h5>
                                <p className="text-gray-900 font-medium">{application.convocatoriaTitle}</p>
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
                                                {new Date(application.appliedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-xs text-gray-400 font-mono w-12 text-right">
                                                {new Date(application.appliedDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interview Pending */}
                                {application.interviewDate && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-14 flex justify-center">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center ring-4 ring-white border border-orange-200 text-orange-600 shadow-sm z-10">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-orange-100 transition-colors">
                                            <div className="flex flex-col max-w-[50%]">
                                                <span className="text-sm font-bold text-gray-900">Entrevista Programada</span>
                                                {application.interviewLocation && (
                                                    <span className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                                                        <MapPin className="w-3 h-3" /> {application.interviewLocation}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full font-medium w-32 text-center">
                                                    {new Date(application.interviewDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="w-12 text-right">
                                                    <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                                        {application.interviewTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Interview Confirmed */}
                                {application.interviewConfirmedDate && (
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
                                                    {new Date(application.interviewConfirmedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-gray-200 w-12 text-right">--:--</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Accepted */}
                                {application.acceptedDate && (
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
                                                    {new Date(application.acceptedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-gray-200 w-12 text-right">--:--</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rejected */}
                                {application.rejectedDate && (
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
                                                    {new Date(application.rejectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
