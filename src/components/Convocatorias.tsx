import { useState } from 'react';
import { Plus, Search, Calendar, Users, MapPin, Edit2, Trash2, Eye, Layers, Filter, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, EyeOff, BookOpen, FolderOpen } from 'lucide-react';
import { ConvocatoriaModal } from './ConvocatoriaModal';
import { ConvocatoriaDetail } from './ConvocatoriaDetail';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import { useNotifications } from '../contexts/NotificationContext';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { LoadingSpinner } from './LoadingOverlay';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

interface ConvocatoriasProps {
  currentUser?: any;
}

export function Convocatorias({ currentUser }: ConvocatoriasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const { data: convocatoriasData, loading, error, refetch } = useApi<any[]>('/convocatorias');
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: applicationsData } = useApi<any[]>('/applications');
  const [viewDetail, setViewDetail] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const convocatorias = convocatoriasData || [];
  const projects = projectsData || [];
  const applications = applicationsData || [];

  // derive unique areas for filter
  const uniqueAreas = Array.from(new Set(convocatorias.map(c => c.area))).filter(Boolean);

  const filteredConvocatorias = convocatorias.filter((c) => {
    const matchesSearch =
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.area || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesArea = filterArea === 'all' || c.area === filterArea;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConvocatorias.length / itemsPerPage);
  const paginatedConvocatorias = filteredConvocatorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddConvocatoria = () => {
    setSelectedConvocatoria(null);
    setIsModalOpen(true);
  };

  const handleEditConvocatoria = (convocatoria: any) => {
    setSelectedConvocatoria(convocatoria);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (convocatoria: any) => {
    const isVisible = convocatoria.status === 'activa';
    // Logic change: When hiding, go to 'en_proceso' (Sin Publicar) instead of 'cerrada'.
    // If it's closed, publishing makes it active.
    const newStatus = isVisible ? 'en_proceso' : 'activa';
    const confirmMessage = isVisible
      ? '¿Deseas ocultar esta convocatoria del landing? Pasará a estado "Sin Publicar".'
      : '¿Deseas publicar esta convocatoria en el landing?';

    if (window.confirm(confirmMessage)) {
      const loadingId = showLoading(
        isVisible ? 'Ocultando...' : 'Publicando...',
        'Actualizando estado'
      );
      try {
        await apiPut(`/convocatorias/${convocatoria.id}`, {
          ...convocatoria,
          status: newStatus
        });
        hideNotification(loadingId);
        showSuccess(
          isVisible ? 'Convocatoria oculta' : 'Convocatoria publicada',
          `Estado actualizado a: ${newStatus === 'activa' ? 'Activa' : 'Sin Publicar'}`
        );
        refetch();
      } catch (error: any) {
        hideNotification(loadingId);
        showError('Error', error.message || 'No se pudo actualizar el estado');
      }
    }
  };

  const handleDeleteConvocatoria = async (id: string, title: string) => {
    if (window.confirm('¿Está seguro de eliminar esta convocatoria permanentemente? Esta acción no se puede deshacer.')) {
      const loadingId = showLoading('Eliminando convocatoria...', 'Espera un momento');
      try {
        await apiDelete(`/convocatorias/${id}`);
        hideNotification(loadingId);
        showSuccess('Convocatoria eliminada', `La convocatoria "${title}" ha sido eliminada permanentemente.`);
        refetch();
      } catch (err: any) {
        hideNotification(loadingId);
        showError('Error al eliminar', err.message || 'No se pudo eliminar la convocatoria.');
      }
    }
  };

  const handleSaveConvocatoria = async (convocatoriaData: any) => {
    const loadingId = showLoading(
      selectedConvocatoria ? 'Actualizando convocatoria...' : 'Creando convocatoria...',
      'Por favor espera un momento'
    );

    try {
      if (selectedConvocatoria) {
        await apiPut(`/convocatorias/${selectedConvocatoria.id}`, convocatoriaData);
        hideNotification(loadingId);
        showSuccess(
          '¡Convocatoria actualizada!',
          `La convocatoria "${convocatoriaData.title}" se actualizó correctamente`
        );
      } else {
        await apiPost('/convocatorias', convocatoriaData);
        hideNotification(loadingId);
        showSuccess(
          '¡Convocatoria creada exitosamente!',
          `La convocatoria "${convocatoriaData.title}" está lista para recibir postulaciones`
        );
      }
      refetch();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving convocatoria:', err);
      hideNotification(loadingId);
      showError(
        'Error al guardar convocatoria',
        err?.message || 'No se pudo guardar la convocatoria. Por favor intenta nuevamente.'
      );
    }
  };

  if (loading) {
    return (
      <div className="h-64">
        <LoadingSpinner size="lg" message="Cargando convocatorias disponibles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (viewDetail) {
    return <ConvocatoriaDetail convocatoria={viewDetail} onBack={() => setViewDetail(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 -z-10 opacity-5 pointer-events-none">
        <Layers className="w-96 h-96 text-emerald-900" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Convocatorias</h2>
          <p className="text-gray-500 mt-1">Administra las oportunidades de voluntariado y sus postulantes</p>
        </div>
        <button
          onClick={handleAddConvocatoria}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva Convocatoria
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total', 'Activas', 'Sin Publicar', 'Cerradas'].map((label, i) => {
          let count = 0;
          let icon = Layers;
          let colorClass = 'text-gray-700';
          let bgClass = 'bg-white';
          let borderClass = 'border-gray-200';

          if (label === 'Total') {
            count = convocatorias.length;
            colorClass = 'text-emerald-600';
            bgClass = 'bg-emerald-50';
            borderClass = 'border-emerald-100';
          } else if (label === 'Activas') {
            count = convocatorias.filter(c => c.status === 'activa').length;
            colorClass = 'text-blue-600';
            bgClass = 'bg-blue-50';
            borderClass = 'border-blue-100';
          } else if (label === 'Sin Publicar') {
            // Now counting 'en_proceso' as 'Sin Publicar'
            count = convocatorias.filter(c => c.status === 'en_proceso').length;
            colorClass = 'text-amber-600';
            bgClass = 'bg-amber-50';
            borderClass = 'border-amber-100';
          } else {
            count = convocatorias.filter(c => c.status === 'cerrada').length;
            colorClass = 'text-gray-600';
            bgClass = 'bg-gray-50';
            borderClass = 'border-gray-200';
          }

          const Icon = icon;

          return (
            <div key={label} className={`${bgClass} p-5 rounded-xl border ${borderClass} shadow-sm transition-transform hover:-translate-y-1 duration-300`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{label}</p>
                  <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/60 backdrop-blur-sm`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar convocatorias..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-gray-50/50 focus:bg-white"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer hover:border-emerald-400 transition-colors appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="all">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="en_proceso">Sin Publicar</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>
        <div>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer hover:border-emerald-400 transition-colors appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="all">Todas las áreas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Convocatorias Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 w-1/4">Título / Proyecto</th>
                <th className="px-6 py-4 w-1/6">Área</th>
                <th className="px-6 py-4 w-1/6">Periodo</th>
                <th className="px-6 py-4 w-1/6 text-center">Vacantes</th>
                <th className="px-6 py-4 w-1/6 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedConvocatorias.length > 0 ? (
                paginatedConvocatorias.map((convocatoria, index) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const isActiva = convocatoria.status === 'activa';
                  const isCerrada = convocatoria.status === 'cerrada';
                  // Treat 'en_proceso' as generic 'unpublished' if it's neither active nor closed in a final sense,
                  // but visually distinguish it.
                  const isSinPublicar = convocatoria.status === 'en_proceso'; // using 'en_proceso' backend value for 'Sin Publicar'
                  const project = projects.find(p => p.id === convocatoria.projectId);

                  // Calculate accepted count from applications
                  const acceptedCount = applications.filter(a => a.convocatoriaId === convocatoria.id && a.status === 'accepted').length;

                  return (
                    <tr key={convocatoria.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* # Index */}
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-400">
                        {String(itemIndex).padStart(2, '0')}
                      </td>

                      {/* Title / Project */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900 line-clamp-1" title={convocatoria.title}>
                            {convocatoria.title}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1" title={project ? project.name : 'Sin proyecto asignado'}>
                            <FolderOpen className="w-3 h-3 text-gray-400" />
                            {project ? project.name : 'Sin proyecto asignado'}
                          </span>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-gray-100 text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-gray-700 truncate max-w-[150px]">{convocatoria.area}</span>
                        </div>
                      </td>

                      {/* Periodo */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <span className="font-semibold w-8">Inicio:</span>
                            <span>{new Date(convocatoria.startDate).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-red-500">
                            <span className="font-semibold w-8">Fin:</span>
                            <span>{new Date(convocatoria.endDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vacantes */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700">
                            {acceptedCount} / {convocatoria.vacancies}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActiva ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          isCerrada ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-amber-50 text-amber-700 border-amber-100' // Sin Publicar
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActiva ? 'bg-emerald-500' :
                            isCerrada ? 'bg-gray-500' :
                              'bg-amber-500'
                            }`}></span>
                          {isActiva ? 'Activa' : isCerrada ? 'Cerrada' : 'Sin Publicar'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Detail Button - BookOpen */}
                          <button
                            onClick={() => setViewDetail(convocatoria)}
                            className="group flex items-center justify-center p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                            title="Ver detalles"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                              Ver
                            </span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditConvocatoria(convocatoria)}
                            className="group flex items-center justify-center p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                              Editar
                            </span>
                          </button>

                          {/* Toggle Visibility Button */}
                          <button
                            onClick={() => handleToggleVisibility(convocatoria)}
                            className={`group flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md ${isActiva
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100' // Published = Emerald Theme
                              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' // Hidden = Gray Theme
                              }`}
                            title={isActiva ? "Ocultar en landing" : "Publicar en landing"}
                          >
                            {isActiva ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                              {isActiva ? "Ocultar" : "Publicar"}
                            </span>
                          </button>

                          {/* Delete Button - Only for Super Admin */}
                          {currentUser?.role === 'admin_master' && (
                            <button
                              onClick={() => handleDeleteConvocatoria(convocatoria.id, convocatoria.title)}
                              className="group flex items-center justify-center p-2 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                                Eliminar
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3 opacity-60">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Layers className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="font-medium text-lg">Sin convocatorias</p>
                      <p className="text-sm">No se encontraron convocatorias que coincidan con los filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">
              Página <span className="font-bold text-gray-800">{currentPage}</span> de <span className="font-bold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm flex items-center gap-1"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ConvocatoriaModal
          convocatoria={selectedConvocatoria}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveConvocatoria}
        />
      )}
    </div>
  );
}