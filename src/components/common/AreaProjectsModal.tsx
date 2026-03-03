import { X, ArrowRight, Calendar, FolderOpen, ExternalLink } from 'lucide-react';
import { Project } from '../../types';

interface AreaProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    areaName: string;
    projects: Project[];
    onViewAll: () => void;
}

export function AreaProjectsModal({ isOpen, onClose, areaName, projects, onViewAll }: AreaProjectsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] animate-scale-in border border-emerald-100/50 overflow-hidden flex flex-col">

                {/* Custom Scrollbar Styles */}
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db; 
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af; 
                    }
                `}</style>

                {/* Header - Compact */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shrink-0 flex justify-between items-start">
                    <div>
                        <h3 className="text-white text-lg font-bold flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-emerald-100" />
                            Proyectos de {areaName}
                        </h3>
                        <p className="text-emerald-100 text-xs mt-1">
                            Explora las iniciativas actuales en esta área
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable List with min-h-0 for flex fix */}
                <div className="overflow-y-auto min-h-0 flex-grow-0 p-4 bg-gray-50 custom-scrollbar" style={{ maxHeight: '320px' }}>
                    {projects.length > 0 ? (
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                            {project.name}
                                        </h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${project.status === 'activo'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {project.status === 'activo' ? 'Activo' : project.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(project.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 flex flex-col items-center justify-center text-gray-500">
                            <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="font-medium text-sm">No hay proyectos activos en esta área.</p>
                        </div>
                    )}
                </div>

                {/* Footer - Compact */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={onViewAll}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-200 transition-all font-semibold text-sm"
                    >
                        Saber más
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
