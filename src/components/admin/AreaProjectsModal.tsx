import { useState } from 'react';
import { X, FolderOpen, Calendar, Users, Clock, Crown, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useApi, apiPut } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';

interface AreaProjectsModalProps {
    area: any;
    onClose: () => void;
}

export function AreaProjectsModal({ area, onClose }: AreaProjectsModalProps) {
    const { data: projectsData, loading, refetch } = useApi<any[]>('/projects');
    const { data: usersData } = useApi<any[]>('/users');
    const { data: assignmentsData } = useApi<any[]>('/project-assignments');
    const { showSuccess, showError, showLoading, hideNotification } = useNotifications();
    const [expandedVolunteersId, setExpandedVolunteersId] = useState<string | null>(null);
    const [showAllProjects, setShowAllProjects] = useState(false);

    // Filter projects that belong to this area
    const areaProjects = projectsData?.filter(
        (project) => (project.areaId === area.id || project.area_id === area.id)
    ) || [];

    const handleRemoveFromArea = async (project: any) => {
        if (!window.confirm(`¿Estás seguro de desvincular el proyecto "${project.name}" de esta área? Pasará a estar "Sin Área" y pasará a estado BORRADOR (no publicado).`)) {
            return;
        }

        const loadingId = showLoading('Desvinculando proyecto...', 'Por favor espere');
        try {
            await apiPut(`/projects/${project.id}`, {
                ...project,
                areaId: null,
                area_id: null,
                published: false
            });
            hideNotification(loadingId);
            showSuccess('Proyecto desvinculado', 'El proyecto está ahora "Sin Área" y en modo borrador.');
            refetch();
        } catch (error) {
            hideNotification(loadingId);
            console.error('Error removing project from area:', error);
            showError('Error', 'No se pudo desvincular el proyecto');
        }
    };

    const toggleVolunteers = (projectId: string) => {
        setExpandedVolunteersId(prev => prev === projectId ? null : projectId);
    };

    const getProjectTeam = (project: any) => {
        const managers = (project.managers || []).map((managerId: string) =>
            usersData?.find(u => u.id === managerId)
        ).filter(Boolean);

        const volunteers = (assignmentsData || [])
            .filter((a: any) => a.projectId === project.id || a.project_id === project.id)
            .map((a: any) => usersData?.find(u => u.id === (a.volunteerId || a.volunteer_id)))
            .filter(Boolean);

        return { managers, volunteers };
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-scale-in"
                style={{ maxHeight: '70vh' }}
            >

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex-shrink-0">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Proyectos del Área</h3>
                                <p className="text-purple-100 text-sm opacity-90">{area.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1 min-h-0">
                    {loading ? (
                        <div className="py-12 flex justify-center items-center flex-col gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                            <span className="text-gray-500 text-sm">Cargando proyectos...</span>
                        </div>
                    ) : areaProjects.length > 0 ? (
                        <div className="grid gap-4">
                            {areaProjects.slice(0, showAllProjects ? undefined : 2).map((project) => {
                                const { managers, volunteers } = getProjectTeam(project);
                                const isVolunteersExpanded = expandedVolunteersId === project.id;

                                return (
                                    <div
                                        key={project.id}
                                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-lg">
                                                        {project.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => handleRemoveFromArea(project)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                                                        title="Desvincular proyecto del área"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${project.status === 'activo'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {project.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                    {project.published ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-100">
                                                            Publicado
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-gray-50 text-gray-500 border-gray-200">
                                                            Borrador
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {project.description || <span className="italic text-gray-400">Sin descripción</span>}
                                        </p>

                                        {/* Team Section */}
                                        <div className="mb-4 space-y-3">
                                            {/* Managers - Always Visible */}
                                            {managers.length > 0 && (
                                                <div>
                                                    <h6 className="text-[10px] uppercase font-bold text-amber-600 mb-2 flex items-center gap-1.5">
                                                        <Crown className="w-3 h-3" />
                                                        Encargados
                                                    </h6>
                                                    <div className="flex flex-wrap gap-2">
                                                        {managers.map((m: any) => (
                                                            <div
                                                                key={m.id}
                                                                className="group/avatar relative"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold shadow-sm cursor-help">
                                                                    {m.name.charAt(0)}
                                                                </div>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    {m.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Volunteers - Collapsible */}
                                            <div>
                                                <button
                                                    onClick={() => toggleVolunteers(project.id)}
                                                    className={`flex items-center gap-2 text-xs font-bold uppercase transition-colors ${isVolunteersExpanded ? 'text-indigo-700' : 'text-gray-400 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    Voluntarios ({volunteers.length})
                                                    {isVolunteersExpanded ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    )}
                                                </button>


                                                {isVolunteersExpanded && (
                                                    <div className="mt-2 animate-fade-in-down">
                                                        {volunteers.length > 0 ? (
                                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                                {volunteers.map((v: any) => (
                                                                    <div
                                                                        key={v.id}
                                                                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                            {v.name.charAt(0)}
                                                                        </div>
                                                                        <span className="text-sm text-gray-700 font-medium truncate">
                                                                            {v.name}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-400 italic pl-1 py-1">
                                                                No hay voluntarios asignados
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3 mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-purple-400" />
                                                <div>
                                                    <span className="block text-[10px] text-gray-400 uppercase font-bold">Creación</span>
                                                    <span>{project.createdDate || project.created_at?.split('T')[0] || '-'}</span>
                                                </div>
                                            </div>

                                            {(project.startDate || project.endDate) && (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                    <div>
                                                        <span className="block text-[10px] text-gray-400 uppercase font-bold">Duración</span>
                                                        <span>
                                                            {project.startDate ? new Date(project.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '?'}
                                                            {' - '}
                                                            {project.endDate ? new Date(project.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {areaProjects.length > 2 && (
                                <button
                                    onClick={() => setShowAllProjects(!showAllProjects)}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                                >
                                    {showAllProjects ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Ver menos
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Ver más ({areaProjects.length - 2} restantes)
                                        </>
                                    )}
                                </button>
                            )}


                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <h4 className="text-gray-900 font-medium mb-1">Sin proyectos asignados</h4>
                            <p className="text-gray-500 text-sm">Esta área aún no tiene proyectos registrados.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-200 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div >
    );
}
