import { Search, ChevronLeft, ChevronRight, Video, Users } from 'lucide-react';
import { LoadingSpinner } from '../LoadingOverlay';

interface ProjectSelectorProps {
    projectSearch: string;
    setProjectSearch: (value: string) => void;
    managerFilter: string;
    setManagerFilter: (value: string) => void;
    setProjectPage: (value: number | ((prev: number) => number)) => void;
    admins: any[];
    loadingProjects: boolean;
    filteredProjects: any[];
    projectPage: number;
    itemsPerPage: number;
    totalPages: number;
    selectedProject: any;
    setSelectedProject: (project: any) => void;
    getProjectVolunteers: (projectId: string) => any[];
    materials: any[];
}

export function ProjectSelector({
    projectSearch,
    setProjectSearch,
    managerFilter,
    setManagerFilter,
    setProjectPage,
    admins,
    loadingProjects,
    filteredProjects,
    projectPage,
    itemsPerPage,
    totalPages,
    selectedProject,
    setSelectedProject,
    getProjectVolunteers,
    materials
}: ProjectSelectorProps) {

    return (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
            <div className="mb-6">
                <h3 className="text-gray-900 font-semibold mb-4">Selecciona un Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar proyecto..."
                            value={projectSearch}
                            onChange={(e) => {
                                setProjectSearch(e.target.value);
                                setProjectPage(0);
                            }}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <select
                        value={managerFilter}
                        onChange={(e) => {
                            setManagerFilter(e.target.value);
                            setProjectPage(0);
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                        <option value="">Todos los encargados</option>
                        {admins.map((admin: any) => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loadingProjects ? (
                <LoadingSpinner size="lg" message="Cargando proyectos disponibles..." />
            ) : filteredProjects.length > 0 ? (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.slice(projectPage * itemsPerPage, (projectPage + 1) * itemsPerPage).map((project) => {
                            const volunteerCount = getProjectVolunteers(project.id).length;
                            const projectMaterialsCount = materials.filter(m => m.projectId === project.id).length;

                            return (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className={`text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 animate-fade-in ${selectedProject?.id === project.id
                                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg scale-105'
                                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`p-3 rounded-lg transition-colors ${project.status === 'activo' ? 'bg-emerald-100' : 'bg-gray-100'
                                            }`}>
                                            <Video className={`w-6 h-6 ${project.status === 'activo' ? 'text-emerald-700' : 'text-gray-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-gray-900 mb-1">{project.name}</h4>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${project.status === 'activo'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                }`}>
                                                {project.status === 'activo' ? '● Activo' : '○ Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{volunteerCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Video className="w-4 h-4" />
                                            <span>{projectMaterialsCount}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Carousel Navigation */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 px-2 animate-fade-in">
                            <button
                                onClick={() => setProjectPage(prev => Math.max(0, prev - 1))}
                                disabled={projectPage === 0}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setProjectPage(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${projectPage === idx ? 'bg-emerald-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setProjectPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={projectPage >= totalPages - 1}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                        {projectSearch ? 'No se encontraron proyectos con ese nombre' : 'No tienes proyectos asignados'}
                    </p>
                </div>
            )}
        </div>
    );
}
