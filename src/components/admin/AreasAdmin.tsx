import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { AreaModal } from './AreaModal';

export function AreasAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const { data: areasData, loading, error, refetch } = useApi<any[]>('/areas');

  const areas = areasData || [];

  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArea = () => {
    setSelectedArea(null);
    setIsModalOpen(true);
  };

  const handleEditArea = (area: any) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (area: any) => {
    try {
      await apiPut(`/areas/${area.id}`, {
        ...area,
        published: !area.published,
      });
      refetch();
    } catch (err) {
      console.error('Error toggling publish:', err);
      alert('Error al cambiar el estado de publicación');
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta área?')) {
      try {
        await apiDelete(`/areas/${id}`);
        refetch();
      } catch (err) {
        console.error('Error deleting area:', err);
        alert('Error al eliminar el área');
      }
    }
  };

  const handleSaveArea = async (areaData: any) => {
    try {
      if (selectedArea) {
        await apiPut(`/areas/${selectedArea.id}`, areaData);
      } else {
        await apiPost('/areas', areaData);
      }
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving area:', err);
      alert('Error al guardar el área');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando áreas...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Áreas</h2>
        <button
          onClick={handleAddArea}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Área
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar áreas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className={`bg-white p-6 rounded-xl border-2 transition-all ${
              area.published 
                ? 'border-green-200 shadow-sm' 
                : 'border-gray-200 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-gray-900">{area.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      area.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {area.published ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{area.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTogglePublish(area)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  area.published
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title={area.published ? 'Despublicar' : 'Publicar'}
              >
                {area.published ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm">Ocultar</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Publicar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleEditArea(area)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteArea(area.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No se encontraron áreas</p>
        </div>
      )}

      {isModalOpen && (
        <AreaModal
          area={selectedArea}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveArea}
        />
      )}
    </div>
  );
}