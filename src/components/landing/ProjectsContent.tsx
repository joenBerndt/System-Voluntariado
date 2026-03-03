import { Search, FolderOpen, Calendar, CheckCircle, X, Target, Users } from 'lucide-react';

import { Project, Area } from '../../types';

interface ProjectsContentProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedAreaId: string | null;
    setSelectedAreaId: (value: string | null) => void;
    areasData: Area[];
    sortOrder: 'newest' | 'oldest';
    setSortOrder: (value: 'newest' | 'oldest') => void;
    filterStatus: string;
    setFilterStatus: (value: string) => void;
    loadingProjects: boolean;
    filteredProjects: Project[];
    handleOpenTeamModal: (project: Project) => void;
}

export function ProjectsContent({
    searchTerm,
    setSearchTerm,
    selectedAreaId,
    setSelectedAreaId,
    areasData,
    sortOrder,
    setSortOrder,
    filterStatus,
    setFilterStatus,
    loadingProjects,
    filteredProjects,
    handleOpenTeamModal
}: ProjectsContentProps) {
    return (
        <>
            {/* Projects Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 font-display">
                        Explora Nuestros <span className="text-emerald-600">Proyectos</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Proyectos reales que transforman comunidades
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            />
                        </div>

                        {/* Area Filter */}
                        <div className="sm:w-64 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <FolderOpen className="text-gray-400 w-5 h-5" />
                            </div>
                            <select
                                value={selectedAreaId || ''}
                                onChange={(e) => setSelectedAreaId(e.target.value || null)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                            >
                                <option value="">Todas las Áreas</option>
                                {areasData?.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="sm:w-48 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Calendar className="text-gray-400 w-5 h-5" />
                            </div>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                            >
                                <option value="newest">Más recientes</option>
                                <option value="oldest">Más antiguos</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <CheckCircle className="text-gray-400 w-5 h-5" />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="finalizado">Finalizados</option>
                            </select>
                        </div>
                    </div>
                </div>
                <p className="text-gray-700 text-xl max-w-3xl mx-auto">
                    {selectedAreaId
                        ? 'Explora las iniciativas específicas de esta área de investigación'
                        : 'Descubre los proyectos que impulsan el desarrollo sostenible de la Amazonía peruana'}
                </p>
                {selectedAreaId && (
                    <button
                        onClick={() => setSelectedAreaId(null)}
                        className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium border border-gray-200 inline-flex items-center gap-2"
                    >
                        <X size={16} /> Ver todos los proyectos
                    </button>
                )}


                {/* Projects Grid */}
                {loadingProjects ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="text-gray-600 mt-4 font-medium">Cargando proyectos...</p>
                    </div>
                ) : filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300">
                                <div className={`h-3 bg-gradient-to-r ${project.status === 'activo'
                                    ? 'from-emerald-600 to-teal-600'
                                    : project.status === 'finalizado'
                                        ? 'from-blue-600 to-blue-700'
                                        : 'from-gray-400 to-gray-500'
                                    }`}></div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="text-gray-900 flex-1 group-hover:text-emerald-700 transition-colors">{project.name}</h4>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${project.status === 'activo'
                                                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200'
                                                : project.status === 'finalizado'
                                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                                                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                                                }`}>
                                                {project.status === 'activo' ? '● Activo' : project.status === 'finalizado' ? '✓ Finalizado' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{project.description}</p>
                                    </div>

                                    <div className="mb-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-800">
                                            <div className="bg-blue-100 p-2.5 rounded-lg shadow-sm">
                                                <Calendar className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Duración</p>
                                                <p className="text-sm font-semibold">
                                                    {new Date(project.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(project.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {project.objectives && (
                                        <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                                            <p className="text-sm text-gray-800 leading-relaxed">
                                                <span className="text-amber-800 flex items-center gap-2 mb-2 font-semibold">
                                                    <Target className="w-4 h-4" />
                                                    Objetivos:
                                                </span>
                                                {project.objectives}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleOpenTeamModal(project)}
                                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                                    >
                                        <Users className="w-4 h-4" />
                                        Ver Equipo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl shadow-lg border-2 border-gray-200">
                        <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FolderOpen className="w-10 h-10 text-gray-500" />
                        </div>
                        <p className="text-gray-900 mb-2 font-semibold">No hay proyectos publicados {selectedAreaId ? 'en esta área' : 'en este momento'}</p>
                        <p className="text-gray-600">Vuelve pronto para conocer nuestras iniciativas {selectedAreaId && <button onClick={() => setSelectedAreaId(null)} className="text-emerald-600 font-semibold hover:underline">o ver todos los proyectos</button>}</p>
                    </div>
                )}
            </section>
        </>
    );
}
