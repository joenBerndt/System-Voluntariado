import { X, MapPin, Calendar, Users, FolderOpen, CheckCircle } from 'lucide-react';

import { Convocatoria } from '../../types';

interface ConvocatoriaPublicDetailProps {
    viewConvocatoriaDetail: Convocatoria;
    setViewConvocatoriaDetail: (val: Convocatoria | null) => void;
    currentUser: any;
    onLoginClick: () => void;
    hasAlreadyApplied: (id: string) => boolean;
    showWarning: (title: string, msg: string, time: number, actions?: any[]) => void;
    onGoToIntranet: () => void;
    setSelectedConvocatoria: (val: Convocatoria) => void;
    setShowApplicationModal: (val: boolean) => void;
}

export function ConvocatoriaPublicDetail({
    viewConvocatoriaDetail,
    setViewConvocatoriaDetail,
    currentUser,
    onLoginClick,
    hasAlreadyApplied,
    showWarning,
    onGoToIntranet,
    setSelectedConvocatoria,
    setShowApplicationModal
}: ConvocatoriaPublicDetailProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900 pr-8">{viewConvocatoriaDetail.title}</h3>
                    <button
                        onClick={() => setViewConvocatoriaDetail(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-1 text-emerald-800 font-semibold">
                                <MapPin className="w-4 h-4" /> Área
                            </div>
                            <p className="text-emerald-900 pl-6">{viewConvocatoriaDetail.area}</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                            <div className="flex items-center gap-2 mb-1 text-teal-800 font-semibold">
                                <Calendar className="w-4 h-4" /> Periodo
                            </div>
                            <p className="text-teal-900 pl-6">
                                {new Date(viewConvocatoriaDetail.startDate).toLocaleDateString('es-ES')} - {new Date(viewConvocatoriaDetail.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 mb-1 text-purple-800 font-semibold">
                                <Users className="w-4 h-4" /> Vacantes
                            </div>
                            <p className="text-purple-900 pl-6">
                                {viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)} disponibles
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                            <FolderOpen className="w-5 h-5 text-gray-400" />
                            Descripción
                        </h4>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                            {viewConvocatoriaDetail.description}
                        </p>
                    </div>

                    {viewConvocatoriaDetail.requirements && (
                        <div>
                            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                Requisitos
                            </h4>
                            <p className="text-gray-700 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-200">
                                {viewConvocatoriaDetail.requirements}
                            </p>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={() => setViewConvocatoriaDetail(null)}
                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={() => {
                                // Check vacanties
                                if ((viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0) return;

                                if (!currentUser) {
                                    localStorage.setItem('pendingPostulationId', viewConvocatoriaDetail.id);
                                    onLoginClick();
                                    return;
                                }

                                // Check if already applied
                                if (hasAlreadyApplied(viewConvocatoriaDetail.id)) {
                                    showWarning('Ya estás participando', 'Ya te encuentras participando en esta convocatoria.', 15000, [
                                        { label: 'Ir a mi Intranet', onClick: () => onGoToIntranet && onGoToIntranet() },
                                        { label: 'Quedarme aquí', onClick: () => { }, variant: 'secondary' }
                                    ]);
                                    return;
                                }

                                setViewConvocatoriaDetail(null);
                                setSelectedConvocatoria(viewConvocatoriaDetail);
                                setShowApplicationModal(true);
                            }}
                            disabled={(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0}
                            className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all ${(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 hover:translate-y-0.5'
                                }`}
                        >
                            {(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0 ? 'Convocatoria Completa' : 'Postular Ahora'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
