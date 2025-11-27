import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Calendar, Users, CheckCircle, Clock, Briefcase, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface VolunteerConvocatoriasProps {
  onSelectConvocatoria: (convocatoria: any) => void;
  currentUser?: any;
}

export function VolunteerConvocatorias({ onSelectConvocatoria, currentUser }: VolunteerConvocatoriasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const { data: convocatoriasData, loading: loadingConvocatorias } = useApi<any[]>('/convocatorias');
  const { data: applicationsData } = useApi<any[]>('/applications');
  const { data: areasData } = useApi<any[]>('/areas');

  const convocatorias = convocatoriasData || [];
  const applications = applicationsData || [];
  const areas = areasData || [];

  // Filter applications for current user
  const myApplications = applications.filter(app => app.userEmail === currentUser?.email);

  // Filter available convocatorias
  const availableConvocatorias = useMemo(() => {
    let filtered = convocatorias.filter(conv => conv.status === 'activa');

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Area filter
    if (selectedArea !== 'all') {
      filtered = filtered.filter(conv => conv.area === selectedArea);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(conv => {
        const endDate = new Date(conv.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (selectedDateRange === 'week') return diffDays <= 7 && diffDays >= 0;
        if (selectedDateRange === 'month') return diffDays <= 30 && diffDays >= 0;
        return true;
      });
    }

    return filtered;
  }, [convocatorias, searchTerm, selectedArea, selectedDateRange]);

  // Check if user already applied to a convocatoria
  const hasApplied = (convocatoriaId: string) => {
    return myApplications.some(app => app.convocatoriaId === convocatoriaId);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Convocatorias Disponibles</h2>
        <p className="text-gray-600">Explora y postula a las convocatorias activas</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar convocatorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Área</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las áreas</option>
              {areas.filter(a => a.published).map(area => (
                <option key={area.id} value={area.name}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Fecha de cierre</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="week">Próximos 7 días</option>
              <option value="month">Próximos 30 días</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-600">
            {availableConvocatorias.length} convocatoria{availableConvocatorias.length !== 1 ? 's' : ''} encontrada{availableConvocatorias.length !== 1 ? 's' : ''}
          </p>
          {(searchTerm || selectedArea !== 'all' || selectedDateRange !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('all');
                setSelectedDateRange('all');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all duration-200 hover:shadow-lg ${
                  isClosingSoon ? 'border-amber-300 bg-amber-50' : 'border-gray-100 hover:border-emerald-200'
                }`}
              >
                {isClosingSoon && (
                  <div className="mb-3 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    ¡Cierra en {daysLeft} día{daysLeft !== 1 ? 's' : ''}!
                  </div>
                )}

                <h3 className="text-gray-900 mb-3">{convocatoria.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">{convocatoria.area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Hasta: {new Date(convocatoria.endDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{convocatoria.vacancies - (convocatoria.acceptedVolunteers || 0)} vacantes disponibles</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{convocatoria.description}</p>

                {convocatoria.requirements && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Requisitos:</span> {convocatoria.requirements}
                    </p>
                  </div>
                )}

                {alreadyApplied ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg border-2 border-emerald-200 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Ya postulaste
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectConvocatoria(convocatoria)}
                    disabled={convocatoria.vacancies - (convocatoria.acceptedVolunteers || 0) <= 0}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    {convocatoria.vacancies - (convocatoria.acceptedVolunteers || 0) <= 0
                      ? 'Sin Vacantes'
                      : 'Postular Ahora'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
