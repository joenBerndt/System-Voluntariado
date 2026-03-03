import { Plus, Eye, Video, Edit, Trash2, EyeOff, BarChart2 } from 'lucide-react';
import { LoadingSpinner } from '../LoadingOverlay';

interface MaterialListProps {
    selectedProject: any;
    loadingMaterials: boolean;
    projectMaterials: any[];
    getViewCount: (id: string) => number;
    getYouTubeVideoId: (url: string) => string | null;
    setViewingProgress: (material: any) => void;
    handleEditMaterial: (material: any) => void;
    handleTogglePublish: (material: any) => void;
    handleDeleteMaterial: (id: string, title: string) => void;
    handleCreateMaterial: () => void;
    isSaving: boolean;
}

export function MaterialList({
    selectedProject,
    loadingMaterials,
    projectMaterials,
    getViewCount,
    getYouTubeVideoId,
    setViewingProgress,
    handleEditMaterial,
    handleTogglePublish,
    handleDeleteMaterial,
    handleCreateMaterial,
    isSaving
}: MaterialListProps) {

    if (!selectedProject) return null;

    return (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-900">Videos de Capacitación</h3>
                    <p className="text-gray-600 text-sm">Proyecto: {selectedProject.name}</p>
                </div>
                <button
                    onClick={handleCreateMaterial}
                    disabled={isSaving || loadingMaterials}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Video
                </button>
            </div>

            {loadingMaterials ? (
                <LoadingSpinner size="lg" message="Cargando videos de capacitación..." />
            ) : projectMaterials.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center">#</th>
                                <th className="px-4 py-4 w-24 text-center">Miniatura</th>
                                <th className="px-4 py-4 w-48">Título</th>
                                <th className="px-4 py-4">Descripción</th>
                                <th className="px-4 py-4 w-32 text-center">Fecha</th>
                                <th className="px-4 py-4 w-24 text-center">Vistas</th>
                                <th className="px-4 py-4 w-28 text-center">Estado</th>
                                <th className="px-4 py-4 w-48 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {projectMaterials.map((material, index) => {
                                const viewCount = getViewCount(material.id);
                                const isPublished = material.published;
                                const videoId = getYouTubeVideoId(material.url);
                                const thumbnailUrl = videoId
                                    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                                    : null;

                                return (
                                    <tr key={material.id} className="hover:bg-gray-50/60 transition-colors group">
                                        {/* Index */}
                                        <td className="px-4 py-4 text-center font-mono text-xs text-gray-400">
                                            {String(index + 1).padStart(2, '0')}
                                        </td>

                                        {/* Thumbnail */}
                                        <td className="px-4 py-4">
                                            {thumbnailUrl ? (
                                                <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group-hover:scale-105 transition-transform">
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt={material.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                    <Video className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Title */}
                                        <td className="px-4 py-4">
                                            <span className="font-bold text-gray-900 line-clamp-2" title={material.title}>
                                                {material.title}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-4">
                                            <span className="text-gray-500 text-xs line-clamp-2" title={material.description}>
                                                {material.description || 'Sin descripción'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                                            {material.createdAt ? new Date(material.createdAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '-'}
                                        </td>

                                        {/* View Count */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{viewCount}</span>
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isPublished
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                                                {isPublished ? 'Publicado' : 'Borrador'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* View Stats Button */}
                                                <button
                                                    onClick={() => setViewingProgress(material)}
                                                    className="group flex items-center justify-center p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                                                    title="Ver Estadísticas"
                                                >
                                                    <BarChart2 className="w-4 h-4" />
                                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                                        Ver
                                                    </span>
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEditMaterial(material)}
                                                    className="group flex items-center justify-center p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                                        Editar
                                                    </span>
                                                </button>

                                                {/* Toggle Publish Button */}
                                                <button
                                                    onClick={() => handleTogglePublish(material)}
                                                    className={`group flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md ${isPublished
                                                        ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100'
                                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    title={isPublished ? "Ocultar Video" : "Publicar Video"}
                                                >
                                                    {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                                        {isPublished ? "Ocultar" : "Publicar"}
                                                    </span>
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteMaterial(material.id, material.title)}
                                                    className="group flex items-center justify-center p-2 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                                        Eliminar
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Video className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h4 className="text-gray-900 mb-2">No hay videos aún</h4>
                    <p className="text-gray-600 text-sm mb-4">Comienza agregando tu primer video de capacitación</p>
                    <button
                        onClick={handleCreateMaterial}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Video
                    </button>
                </div>
            )}
        </div>
    );
}
