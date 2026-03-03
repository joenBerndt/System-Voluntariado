import { X, User, Users, Crown, Mail, FolderOpen, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Member {
    id: string;
    name: string;
    role?: string;
    email?: string;
}

interface ProjectTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    managers: Member[];
    volunteers: Member[];
}



export function ProjectTeamModal({ isOpen, onClose, projectName, managers, volunteers }: ProjectTeamModalProps) {
    const [showAllVolunteers, setShowAllVolunteers] = useState(false);

    if (!isOpen) return null;

    const visibleVolunteers = showAllVolunteers ? volunteers : volunteers.slice(0, 6);
    const hasMore = volunteers.length > 6;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Custom Scrollbar Styles */}
            <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #d1d5db; 
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #9ca3af; 
            }
            `}</style>

            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-emerald-100/50 overflow-hidden"
                style={{ maxHeight: '85vh' }}
            >

                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 shrink-0 flex justify-between items-start z-10">
                    <div>
                        <h3 className="text-white text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-100" />
                            Equipo del Proyecto
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1 font-medium truncate max-w-[280px]">
                            {projectName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 bg-gray-50 custom-scrollbar min-h-0">

                    {/* Managers Section */}
                    <div className="mb-6 shrink-0">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            Encargado(s) del Proyecto
                        </h4>
                        {managers.length > 0 ? (
                            <div className="space-y-2">
                                {managers.map(manager => (
                                    <div key={manager.id} className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold shadow-sm">
                                            {manager.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-sm">{manager.name}</p>
                                            <p className="text-amber-700 text-xs font-medium">{manager.role || 'Coordinador'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-center">
                                <p className="text-gray-500 text-xs">Sin encargado asignado</p>
                            </div>
                        )}
                    </div>

                    {/* Volunteers Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-500" />
                                Voluntarios ({volunteers.length})
                            </h4>
                        </div>

                        {volunteers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {visibleVolunteers.map(volunteer => (
                                    <div key={volunteer.id} className="bg-white border border-gray-100 p-2.5 rounded-xl flex items-center gap-3 hover:border-emerald-200 transition-colors shadow-sm">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                                            {volunteer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-gray-900 font-semibold text-sm truncate">{volunteer.name}</p>
                                            {volunteer.email && <p className="text-gray-400 text-xs truncate">{volunteer.email}</p>}
                                        </div>
                                    </div>
                                ))}
                                {hasMore && !showAllVolunteers && (
                                    <button
                                        onClick={() => setShowAllVolunteers(true)}
                                        className="w-full py-2 bg-gray-50 text-emerald-600 font-semibold text-xs rounded-xl hover:bg-emerald-50 border border-dashed border-emerald-200 transition-colors mt-1"
                                    >
                                        + {volunteers.length - 6} voluntarios más (Ver todos)
                                    </button>
                                )}
                                {showAllVolunteers && hasMore && (
                                    <button
                                        onClick={() => setShowAllVolunteers(false)}
                                        className="w-full py-2 bg-gray-50 text-gray-500 font-semibold text-xs rounded-xl hover:bg-gray-100 border border-dashed border-gray-200 transition-colors mt-1"
                                    >
                                        Ver menos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No hay voluntarios asignados aún</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer - Fixed */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
