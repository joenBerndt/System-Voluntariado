import { Filter, Calendar, FileText, Briefcase, Video, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { ApplicationProgressBar } from '../common/ApplicationProgressBar';

interface MyApplicationsProps {
    loadingApplications: boolean;
    myApplications: any[];
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    getStatusBadge: (status: string) => React.ReactNode;
    setCurrentSection: (section: any) => void;
}

export function MyApplications({
    loadingApplications,
    myApplications,
    selectedStatus,
    setSelectedStatus,
    getStatusBadge,
    setCurrentSection
}: MyApplicationsProps) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Mis Postulaciones</h2>
                <p className="text-gray-600">Revisa el estado de tus postulaciones a convocatorias</p>
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg border-2 border-emerald-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                        <Filter className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                        <label className="text-gray-700 font-semibold mb-2 block">Filtrar por estado</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="interview_pending">Con entrevista</option>
                            <option value="accepted">Aceptadas</option>
                            <option value="rejected">Rechazadas</option>
                        </select>
                    </div>
                </div>
            </div>

            {loadingApplications ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <p className="text-gray-600 mt-4">Cargando postulaciones...</p>
                </div>
            ) : myApplications.filter(app => selectedStatus === 'all' || app.status === selectedStatus).length > 0 ? (
                <div className="space-y-6">
                    {myApplications.filter(app => selectedStatus === 'all' || app.status === selectedStatus).map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-xl"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-100">
                                <div className="flex-1">
                                    <h3 className="text-gray-900 mb-3">{application.convocatoriaTitle}</h3>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="bg-teal-100 p-2 rounded-lg">
                                            <Calendar className="w-4 h-4 text-teal-700" />
                                        </div>
                                        <span className="font-medium">
                                            Postulado el {new Date(application.appliedDate).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(application.status)}
                            </div>

                            {/* Content */}
                            <div className="space-y-4 mb-6">
                                {/* Progress Bar */}
                                <ApplicationProgressBar status={application.status} />

                                <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border-2 border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <FileText className="w-4 h-4 text-purple-700" />
                                        </div>
                                        <p className="text-gray-800 font-semibold">Motivación</p>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{application.motivation}</p>
                                </div>
                                {application.experience && (
                                    <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border-2 border-amber-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-amber-100 p-2 rounded-lg">
                                                <Briefcase className="w-4 h-4 text-amber-700" />
                                            </div>
                                            <p className="text-gray-800 font-semibold">Experiencia</p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{application.experience}</p>
                                    </div>
                                )}
                            </div>

                            {/* Interview Info */}
                            {(application.status === 'interview_pending' || application.status === 'interview_confirmed') && application.interviewDate && (
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <Video className="w-6 h-6 text-purple-700" />
                                        </div>
                                        <p className="text-purple-900 font-semibold">Entrevista Programada</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-lg">
                                                <Calendar className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-purple-900 font-medium text-sm mb-1">Fecha</p>
                                                <p className="text-purple-800">{new Date(application.interviewDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        {application.interviewTime && (
                                            <div className="flex items-start gap-3">
                                                <div className="bg-white p-2 rounded-lg">
                                                    <Clock className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-purple-900 font-medium text-sm mb-1">Hora</p>
                                                    <p className="text-purple-800">{application.interviewTime}</p>
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
                                </div>
                            )}

                            {application.status === 'accepted' && (
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-emerald-100 p-3 rounded-lg">
                                            <CheckCircle className="w-6 h-6 text-emerald-700" />
                                        </div>
                                        <p className="text-emerald-900 font-semibold">🎉 ¡Felicitaciones!</p>
                                    </div>
                                    <p className="text-emerald-800 leading-relaxed">
                                        Tu postulación ha sido aceptada. Pronto serás contactado con más información.
                                    </p>
                                </div>
                            )}

                            {application.status === 'rejected' && application.rejectionReason && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-red-100 p-3 rounded-lg">
                                            <XCircle className="w-6 h-6 text-red-700" />
                                        </div>
                                        <p className="text-red-900 font-semibold">Motivo del rechazo</p>
                                    </div>
                                    <p className="text-red-800 leading-relaxed">{application.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg p-12 text-center border-2 border-emerald-100">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FileText className="w-12 h-12 text-emerald-700" />
                    </div>
                    <h3 className="text-gray-900 mb-3">No tienes postulaciones</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        Aún no has postulado a ninguna convocatoria. Explora las oportunidades disponibles y comienza tu camino como voluntario.
                    </p>
                    <button
                        onClick={() => setCurrentSection('convocatorias')}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg font-medium hover:shadow-xl inline-flex items-center gap-2"
                    >
                        <Briefcase className="w-5 h-5" />
                        Ver Convocatorias Disponibles
                    </button>
                </div>
            )}
        </div>
    );
}
