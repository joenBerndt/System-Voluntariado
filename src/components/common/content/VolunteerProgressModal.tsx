import { X, Users } from 'lucide-react';

interface VolunteerProgressModalProps {
    viewingProgress: any; // Material
    selectedProject: any;
    setViewingProgress: (val: any) => void;
    getProjectVolunteers: (projectId: string) => any[];
    progress: any[];
}

export function VolunteerProgressModal({
    viewingProgress,
    selectedProject,
    setViewingProgress,
    getProjectVolunteers,
    progress
}: VolunteerProgressModalProps) {

    if (!viewingProgress || !selectedProject) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white mb-1">Progreso de Voluntarios</h3>
                            <p className="text-purple-100 text-sm">{viewingProgress.title}</p>
                        </div>
                        <button
                            onClick={() => setViewingProgress(null)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Volunteers List */}
                <div className="p-6">
                    <div className="space-y-3">
                        {getProjectVolunteers(selectedProject.id).map((volunteer: any) => {
                            const volunteerProgress = progress.find(
                                p => p.materialId === viewingProgress.id && p.volunteerId === volunteer.id
                            );
                            const progressValue = volunteerProgress?.progress || 0;
                            const viewed = volunteerProgress?.viewed || false;

                            return (
                                <div key={volunteer.id} className="p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-200 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-white font-bold">
                                                    {volunteer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold">{volunteer.name}</p>
                                                <p className="text-gray-600 text-sm">{volunteer.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {viewed ? (
                                                <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md">
                                                    ✓ Visto
                                                </span>
                                            ) : (
                                                <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold">
                                                    Sin ver
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-semibold">Progreso del video</span>
                                            <span className="text-gray-900 font-bold text-lg">{progressValue}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-md"
                                                style={{ width: `${progressValue}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {getProjectVolunteers(selectedProject.id).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No hay voluntarios asignados a este proyecto</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
