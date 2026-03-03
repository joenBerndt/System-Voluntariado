import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ImageOff, FolderOpen } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { AreaModal } from './AreaModal';
import { AreaProjectsModal } from './AreaProjectsModal';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminTableSkeleton } from '../common/Skeletons';
import { ConfirmationModal } from '../common/ConfirmationModal';

export function AreasAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  const [viewingProjectsArea, setViewingProjectsArea] = useState<any>(null);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => { },
  });
  const { data: areasData, loading, error, refetch } = useApi<any[]>('/areas');

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

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
    const loadingId = showLoading('Actualizando estado...', 'Por favor espere');
    try {
      await apiPut(`/areas/${area.id}`, {
        ...area,
        published: !area.published,
      });
      hideNotification(loadingId);
      refetch();
      showSuccess('Estado actualizado', `El área ha sido ${!area.published ? 'publicada' : 'ocultada'} exitosamente`);
    } catch (err) {
      hideNotification(loadingId);
      console.error('Error toggling publish:', err);
      showError('Error', 'No se pudo cambiar el estado de publicación');
    }
  };

  const handleDeleteArea = (id: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar Área',
      description: '¿Está seguro de eliminar esta área?',
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const loadingId = showLoading('Eliminando área...', 'Por favor espere');
        try {
          await apiDelete(`/areas/${id}`);
          hideNotification(loadingId);
          refetch();
          showSuccess('Área eliminada', 'El área ha sido eliminada exitosamente');
        } catch (err) {
          hideNotification(loadingId);
          console.error('Error deleting area:', err);
          showError('Error', 'No se pudo eliminar el área');
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSaveArea = async (areaData: any) => {
    const loadingId = showLoading('Guardando área...', 'Por favor espere');
    try {
      if (selectedArea) {
        await apiPut(`/areas/${selectedArea.id}`, areaData);
        hideNotification(loadingId);
        showSuccess('Área actualizada', 'Los cambios se han guardado exitosamente');
      } else {
        await apiPost('/areas', areaData);
        hideNotification(loadingId);
        showSuccess('Área creada', 'La nueva área se ha creado exitosamente');
      }
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      hideNotification(loadingId);
      console.error('Error saving area:', err);
      showError('Error', 'No se pudo guardar el área');
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <AdminTableSkeleton rows={4} />
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Áreas</h2>
          <p className="text-gray-500 mt-1">Administra las áreas temáticas del voluntariado</p>
        </div>
        <button
          onClick={handleAddArea}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Agregar Área
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar áreas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Areas Table */}
      {filteredAreas.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 w-20 text-center">Icono</th>
                <th className="px-6 py-4 w-64">Nombre</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 w-32 text-center">Estado</th>
                <th className="px-6 py-4 w-48 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredAreas.map((area, index) => (
                <tr key={area.id} className="hover:bg-gray-50/60 transition-colors group">
                  {/* Index */}
                  <td className="px-6 py-4 text-center font-mono text-xs text-gray-400">
                    {String(index + 1).padStart(2, '0')}
                  </td>

                  {/* Thumbnail / Icon */}
                  <td className="px-6 py-4 text-center">
                    {(area.imageUrl || area.image_url || area.image) ? (
                      <div className="w-12 h-12 mx-auto rounded-lg border border-gray-200 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                        <img
                          src={area.imageUrl || area.image_url || area.image}
                          alt={area.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors" title="No posee imagen">
                        <ImageOff className="w-5 h-5 mb-0.5" />
                        <span className="text-[9px] font-medium leading-none">Sin img</span>
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 text-base tracking-tight">
                      {area.name}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {area.description || <span className="italic text-gray-400">Sin descripción</span>}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${area.published
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${area.published ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                      {area.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* View Projects Button */}
                      <button
                        onClick={() => setViewingProjectsArea(area)}
                        className="group flex items-center justify-center p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                        title="Ver Proyectos"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                          Proyectos
                        </span>
                      </button>

                      {/* Toggle Publish Button */}
                      <button
                        onClick={() => handleTogglePublish(area)}
                        className={`group flex items-center justify-center p-2 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md ${area.published
                          ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        title={area.published ? "Ocultar Área" : "Publicar Área"}
                      >
                        {area.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                          {area.published ? "Ocultar" : "Publicar"}
                        </span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditArea(area)}
                        className="group flex items-center justify-center p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:justify-start shadow-sm hover:shadow-md"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap text-xs font-bold">
                          Editar
                        </span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteArea(area.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Search className="w-10 h-10 text-emerald-600" />
          </div>
          <h4 className="text-gray-900 mb-2">No se encontraron áreas</h4>
          <p className="text-gray-600 text-sm">Prueba ajustando los términos de búsqueda o agrega una nueva área</p>
        </div>
      )}

      {isModalOpen && (
        <AreaModal
          area={selectedArea}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveArea}
        />
      )}

      {viewingProjectsArea && (
        <AreaProjectsModal
          area={viewingProjectsArea}
          onClose={() => setViewingProjectsArea(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
      />
    </div>
  );
}