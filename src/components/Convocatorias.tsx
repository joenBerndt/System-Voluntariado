import { useState } from 'react';
import { Plus, Search, Calendar, Users, MapPin, Edit2, Trash2, Eye } from 'lucide-react';
import { ConvocatoriaModal } from './ConvocatoriaModal';
import { ConvocatoriaDetail } from './ConvocatoriaDetail';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { LoadingSpinner } from './LoadingOverlay';
import { useNotifications } from '../contexts/NotificationContext';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

export function Convocatorias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const { data: convocatoriasData, loading, error, refetch } = useApi<any[]>('/convocatorias');
  const { data: projectsData } = useApi<any[]>('/projects');
  const [viewDetail, setViewDetail] = useState<any>(null);
  
  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  const convocatorias = convocatoriasData || [];
  const projects = projectsData || [];

  const filteredConvocatorias = convocatorias.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddConvocatoria = () => {
    setSelectedConvocatoria(null);
    setIsModalOpen(true);
  };

  const handleEditConvocatoria = (convocatoria: any) => {
    setSelectedConvocatoria(convocatoria);
    setIsModalOpen(true);
  };

  const handleDeleteConvocatoria = async (id: string, title: string) => {
    if (window.confirm('¿Está seguro de eliminar esta convocatoria?')) {
      const loadingId = showLoading('Eliminando convocatoria...', 'Espera un momento');
      
      try {
        const response = await fetch(`${API_URL}/convocatorias/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        const result = await response.json();
        hideNotification(loadingId);
        
        if (result.success) {
          if (result.terminated) {
            showSuccess(
              'Convocatoria terminada',
              `La convocatoria "${title}" ha sido marcada como finalizada y ya no aparecerá en el landing`
            );
          } else {
            showSuccess(
              '¡Convocatoria eliminada!',
              `La convocatoria "${title}" fue eliminada exitosamente`
            );
          }
          refetch();
        } else {
          if (result.cannotDelete) {
            showError('No se puede eliminar', result.error);
          } else {
            throw new Error(result.error);
          }
        }
      } catch (err: any) {
        console.error('Error deleting convocatoria:', err);
        hideNotification(loadingId);
        showError(
          'Error al eliminar',
          err?.message || 'No se pudo eliminar la convocatoria. Por favor intenta nuevamente.'
        );
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Convocatorias</h2>
        <button
          onClick={handleAddConvocatoria}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Convocatoria
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar convocatorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Convocatorias List */}
      <div className="space-y-4">
        {filteredConvocatorias.map((convocatoria) => (
          <div key={convocatoria.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-gray-900">{convocatoria.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      convocatoria.status === 'activa'
                        ? 'bg-green-100 text-green-700'
                        : convocatoria.status === 'cerrada'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {convocatoria.status === 'activa' ? 'Activa' : convocatoria.status === 'cerrada' ? 'Cerrada' : 'En Proceso'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{convocatoria.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewDetail(convocatoria)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditConvocatoria(convocatoria)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteConvocatoria(convocatoria.id, convocatoria.title)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{convocatoria.area}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Inicio: {new Date(convocatoria.startDate).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Fin: {new Date(convocatoria.endDate).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{convocatoria.acceptedVolunteers || 0} / {convocatoria.vacancies} voluntarios</span>
              </div>
            </div>

            {convocatoria.requirements && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Requisitos:</span> {convocatoria.requirements}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredConvocatorias.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron convocatorias</p>
        </div>
      )}

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