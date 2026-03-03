import { FolderOpen, Calendar, MapPin, Users, Edit, Eye, EyeOff, Crown, Trash2 } from 'lucide-react';

interface ProjectDetailCardProps {
    project: any;
    users: any[];
    areas: any[];
    volunteerCount: number;
    onEdit: (project: any) => void;
    onTogglePublish: (project: any) => void;
    onManageManagers: (project: any) => void;
    onManageVolunteers: (project: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function ProjectDetailCard({
    project,
    users,
    areas,
    volunteerCount,
    onEdit,
    onTogglePublish,
    onManageManagers,
    onManageVolunteers,
    onDelete,
}: ProjectDetailCardProps) {

    if (!project) return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles del Proyecto</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                Selecciona un proyecto de la lista para ver sus detalles, encargados y gestionar sus voluntarios.
            </p>
        </div>
    );

    const getAreaName = (areaId: string) => {
        const area = areas.find((a) => a.id === areaId);
        return area ? area.name : 'Sin área asignada';
    };

    const getManagersForProject = (proj: any) => {
        if (!proj.managers || !Array.isArray(proj.managers)) return [];
        return proj.managers.map((managerId: string) => {
            const manager = users.find((u) => u.id === managerId);
            return manager || { id: managerId, name: 'Usuario no encontrado', role: 'unknown' };
        });
    };

    const managers = getManagersForProject(project);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            {/* Top Section: Header & Info */}
            <div className="p-6 pb-0">
                {/* Header */}
                <div className="flex items-start gap-4 mb-3">
                    <div className="bg-emerald-50 rounded-xl p-2.5 shrink-0">
                        <FolderOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{project.name}</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'activo' ? 'bg-emerald-100 text-emerald-800' :
                                project.status === 'finalizado' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {project.status === 'activo' ? '● Activo' : project.status === 'finalizado' ? '✓ Finalizado' : 'Inactivo'}
                            </span>
                            {project.published && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                    👁️ Público
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {project.description}
                </p>

                {/* Managers Section */}
                {managers.length > 0 ? (
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-6 transition-colors hover:border-yellow-300">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Encargados</span>
                        </div>
                        <div className="space-y-3">
                            {managers.map((manager: any) => (
                                <div key={manager.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold text-xs shadow-sm ring-2 ring-white">
                                        {manager.name?.charAt(0)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">{manager.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${manager.role === 'admin_master' ? 'bg-purple-100 text-purple-700' :
                                            manager.role === 'admin' ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {manager.role === 'admin_master' ? 'Master' : manager.role === 'admin' ? 'Admin' : 'Voluntario'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 mb-6 transition-colors hover:border-red-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-4 h-4 text-red-700" />
                            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Encargado</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-red-800">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-200 text-red-900 text-xs shadow-sm ring-2 ring-white">!</span>
                            Sin encargado asignado
                        </div>
                    </div>
                )}

                {/* Details List */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm font-medium text-gray-700">{getAreaName(project.areaId)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
                        <p className="text-sm font-medium text-gray-700">
                            {new Date(project.startDate).toLocaleDateString('es-ES')} - {new Date(project.endDate).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Users className="w-5 h-5 text-purple-600 shrink-0" />
                        <p className="text-sm font-medium text-gray-700">{volunteerCount} voluntarios</p>
                    </div>
                </div>

                {/* Objectives Box */}
                {project.objectives && (
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            <span className="font-bold text-gray-700">Objetivos:</span> {project.objectives}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Actions - Horizontal Button Row RESTORED */}
            <div className="p-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                    onClick={() => onEdit(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 font-bold text-sm"
                >
                    <Edit className="w-4 h-4" /> Editar
                </button>

                <button
                    onClick={() => onTogglePublish(project)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-colors ${project.published
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' // Active: Colored
                        : 'bg-purple-50 text-purple-400 border-purple-100 hover:bg-purple-100' // Inactive: Faded but visible
                        }`}
                    title={project.published ? "Ocultar" : "Publicar"}
                >
                    {project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                    onClick={() => onManageManagers(project)}
                    disabled={project.status === 'finalizado'}
                    className={`flex items-center justify-center px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 transition-colors ${project.status === 'finalizado' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-100'
                        }`}
                    title={project.status === 'finalizado' ? "Reinicia el proyecto para gestionar encargados" : "Gestionar Encargados"}
                >
                    <Crown className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onManageVolunteers(project)}
                    disabled={project.status === 'finalizado'}
                    className={`flex items-center justify-center px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 transition-colors ${project.status === 'finalizado' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-100'
                        }`}
                    title={project.status === 'finalizado' ? "Reinicia el proyecto para gestionar voluntarios" : "Gestionar Voluntarios"}
                >
                    <Users className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onDelete(project.id, project.name)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    title="Eliminar"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
