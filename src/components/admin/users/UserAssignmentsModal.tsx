import { AlertTriangle, X, FolderOpen, Megaphone } from 'lucide-react';

interface UserAssignmentsModalProps {
    assignmentsData: {
        user: any;
        projects: any[];
        convocatorias: any[];
        action: 'demote' | 'delete';
        newRole?: string;
    };
    onClose: () => void;
    onProceed: () => void;
}

export function UserAssignmentsModal({ assignmentsData, onClose, onProceed }: UserAssignmentsModalProps) {
    if (!assignmentsData) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">⚠️ Usuario con Asignaciones</h3>
                                <p className="text-red-100 text-sm">Se requiere acción antes de continuar</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-900 font-semibold mb-1">
                                    No se puede {assignmentsData.action === 'demote' ? 'degradar' : 'eliminar'} al usuario directamente
                                </p>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    El usuario <span className="font-bold">{assignmentsData.user.name}</span> está asignado como encargado de {assignmentsData.projects.length} proyecto(s) y {assignmentsData.convocatorias.length} convocatoria(s).
                                    Debe ser removido de todas sus asignaciones antes de continuar.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Projects */}
                        {assignmentsData.projects.length > 0 && (
                            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-300 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-teal-100 p-2 rounded-lg">
                                        <FolderOpen className="w-5 h-5 text-teal-700" />
                                    </div>
                                    <h4 className="font-bold text-teal-900">
                                        Proyectos Asignados ({assignmentsData.projects.length})
                                    </h4>
                                </div>
                                <ul className="space-y-2">
                                    {assignmentsData.projects.map(project => (
                                        <li key={project.id} className="flex items-start gap-2 text-teal-800 bg-white/60 p-3 rounded-lg">
                                            <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                            <div>
                                                <p className="font-semibold">{project.name}</p>
                                                <p className="text-sm text-teal-700">Estado: {project.status}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Convocatorias */}
                        {assignmentsData.convocatorias.length > 0 && (
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Megaphone className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <h4 className="font-bold text-emerald-900">
                                        Convocatorias Asignadas ({assignmentsData.convocatorias.length})
                                    </h4>
                                </div>
                                <ul className="space-y-2">
                                    {assignmentsData.convocatorias.map(convocatoria => (
                                        <li key={convocatoria.id} className="flex items-start gap-2 text-emerald-800 bg-white/60 p-3 rounded-lg">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                            <div>
                                                <p className="font-semibold">{convocatoria.title}</p>
                                                <p className="text-sm text-emerald-700">Estado: {convocatoria.status}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                        <p className="text-gray-700 text-sm">
                            <span className="font-bold">¿Qué sucederá?</span> Si continúas, el usuario será removido automáticamente como encargado de todos los proyectos y convocatorias listados arriba, dejándolos sin encargado asignado.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onProceed}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Remover de Asignaciones y {assignmentsData.action === 'demote' ? 'Degradar' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
