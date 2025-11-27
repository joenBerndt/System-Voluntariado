import { useState } from 'react';
import { Plus, Search, Calendar, Users, MapPin, Edit2, Trash2, Eye } from 'lucide-react';
import { ConvocatoriaModal } from './ConvocatoriaModal';
import { ConvocatoriaDetail } from './ConvocatoriaDetail';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

export function Convocatorias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const { data: convocatoriasData, loading, error, refetch } = useApi<any[]>('/convocatorias');
  const { data: projectsData } = useApi<any[]>('/projects');
  const [viewDetail, setViewDetail] = useState<any>(null);

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

  const handleDeleteConvocatoria = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta convocatoria?')) {
      try {
        const response = await fetch(`${API_URL}/convocatorias/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        const result = await response.json();
        
        if (result.success) {
          if (result.terminated) {
            alert('La convocatoria ha sido marcada como terminada y ya no aparecerá en el landing.');
          } else {
            alert('Convocatoria eliminada exitosamente');
          }
          refetch();
        } else {
          if (result.cannotDelete) {
            alert(result.error);
          } else {
            throw new Error(result.error);
          }
        }
      } catch (err) {
        console.error('Error deleting convocatoria:', err);
        alert('Error al eliminar la convocatoria');
      }
    }
  };

  const handleSaveConvocatoria = async (convocatoriaData: any) => {
    try {
      if (selectedConvocatoria) {
        await apiPut(`/convocatorias/${selectedConvocatoria.id}`, convocatoriaData);
      } else {
        await apiPost('/convocatorias', convocatoriaData);
      }
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving convocatoria:', err);
      alert('Error al guardar la convocatoria');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando convocatorias...</div>
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
                  onClick={() => handleDeleteConvocatoria(convocatoria.id)}
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