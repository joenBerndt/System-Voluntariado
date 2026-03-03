import { Search, Briefcase, Calendar, MapPin, User } from 'lucide-react';
import { ConvocatoriaDetail } from '../common/ConvocatoriaDetail';

interface AvailableConvocatoriasProps {
    viewConvocatoriaDetail: any;
    setViewConvocatoriaDetail: (val: any) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedArea: string;
    setSelectedArea: (val: string) => void;
    selectedDateRange: string;
    setSelectedDateRange: (val: string) => void;
    areasData: any[];
    availableConvocatorias: any[];
    loadingConvocatorias: boolean;
    hasApplied: (id: string) => boolean;
    setSelectedConvocatoria: (val: any) => void;
    setShowApplicationModal: (val: boolean) => void;
}

export function AvailableConvocatorias({
    viewConvocatoriaDetail,
    setViewConvocatoriaDetail,
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    selectedDateRange,
    setSelectedDateRange,
    areasData,
    availableConvocatorias,
    loadingConvocatorias,
    hasApplied,
    setSelectedConvocatoria,
    setShowApplicationModal
}: AvailableConvocatoriasProps) {

    if (viewConvocatoriaDetail) {
        return (
            <ConvocatoriaDetail
                convocatoria={viewConvocatoriaDetail}
                onBack={() => setViewConvocatoriaDetail(null)}
            />
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Convocatorias Disponibles</h2>
                <p className="text-gray-600">Explora y postula a las convocatorias activas</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar convocatorias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    {/* Area Filter */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Briefcase className="text-gray-500 w-5 h-5" />
                        </div>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white appearance-none"
                        >
                            <option value="all">Todas las áreas</option>
                            {areasData?.filter(a => a.published).map(area => (
                                <option key={area.id} value={area.name}>{area.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Calendar className="text-gray-500 w-5 h-5" />
                        </div>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white appearance-none"
                        >
                            <option value="all">Cualquier fecha</option>
                            <option value="week">Próximos 7 días</option>
                            <option value="month">Próximos 30 días</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">
                        {availableConvocatorias.length} convocatoria{availableConvocatorias.length !== 1 ? 's' : ''} encontrada{availableConvocatorias.length !== 1 ? 's' : ''}
                    </p>
                    {(searchTerm || selectedArea !== 'all' || selectedDateRange !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedArea('all');
                                setSelectedDateRange('all');
                            }}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Convocatorias List */}
            {loadingConvocatorias ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <p className="text-gray-600 mt-4">Cargando convocatorias...</p>
                </div>
            ) : availableConvocatorias.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableConvocatorias.map((convocatoria) => {
                        const alreadyApplied = hasApplied(convocatoria.id);
                        const daysLeft = Math.ceil((new Date(convocatoria.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isClosingSoon = daysLeft <= 7 && daysLeft > 0;

                        return (
                            <div
                                key={convocatoria.id}
                                className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 h-full flex flex-col ${isClosingSoon ? 'border-amber-300' : 'border-gray-100 hover:border-emerald-300'}`}
                            >
                                <div className={`h-3 shrink-0 ${isClosingSoon ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}></div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-gray-900 mb-2 font-bold text-lg group-hover:text-emerald-700 transition-colors line-clamp-2">{convocatoria.title}</h3>
                                            <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 mb-3">{convocatoria.description}</p>
                                        </div>
                                        {isClosingSoon ? (
                                            <span className="shrink-0 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 ml-2 whitespace-nowrap">
                                                ¡Cierra pronto!
                                            </span>
                                        ) : (
                                            <span className="shrink-0 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 ml-2 whitespace-nowrap">
                                                Activa
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 flex-grow">
                                        <div className="flex items-start gap-3 text-gray-800">
                                            <div className="bg-emerald-100 p-2 rounded-lg shadow-sm shrink-0">
                                                <MapPin className="w-4 h-4 text-emerald-700" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 font-medium">Área</p>
                                                <p className="text-sm font-semibold truncate" title={convocatoria.area}>{convocatoria.area}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-gray-800">
                                            <div className="bg-teal-100 p-2 rounded-lg shadow-sm shrink-0">
                                                <Calendar className="w-4 h-4 text-teal-700" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 font-medium">Cierre</p>
                                                <p className={`text-sm font-semibold truncate ${isClosingSoon ? 'text-amber-700' : ''}`}>
                                                    {new Date(convocatoria.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-gray-800">
                                            <div className="bg-purple-100 p-2 rounded-lg shadow-sm shrink-0">
                                                <User className="w-4 h-4 text-purple-700" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500 font-medium">Vacantes</p>
                                                <p className="text-sm font-semibold">{convocatoria.vacancies - (convocatoria.acceptedCount || 0)} disponibles</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setViewConvocatoriaDetail(convocatoria)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-all font-bold text-sm"
                                        >
                                            Ver más
                                        </button>

                                        {alreadyApplied ? (
                                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm cursor-default border-2 border-gray-200">
                                                Ya postulaste
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedConvocatoria(convocatoria);
                                                    setShowApplicationModal(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all font-bold text-sm"
                                            >
                                                Postular
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 mb-2">No se encontraron convocatorias</h3>
                    <p className="text-gray-600">
                        {searchTerm || selectedArea !== 'all' || selectedDateRange !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay convocatorias activas en este momento'}
                    </p>
                </div>
            )}
        </div>
    );
}
