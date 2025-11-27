import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { useApi, apiPut } from '../../hooks/useApi';

export function AboutAdmin() {
  const { data: aboutData, loading, error, refetch } = useApi<any>('/about');
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    history: '',
    values: [] as string[],
    published: true,
  });
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (aboutData) {
      setFormData({
        mission: aboutData.mission || '',
        vision: aboutData.vision || '',
        history: aboutData.history || '',
        values: aboutData.values || [],
        published: aboutData.published !== undefined ? aboutData.published : true,
      });
    }
  }, [aboutData]);

  const handleAddValue = () => {
    if (newValue.trim()) {
      setFormData({
        ...formData,
        values: [...formData.values, newValue.trim()],
      });
      setNewValue('');
    }
  };

  const handleRemoveValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPut('/about', formData);
      alert('Información actualizada correctamente');
      refetch();
    } catch (err) {
      console.error('Error saving about:', err);
      alert('Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando información...</div>
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
        <h2 className="text-gray-900">Gestión de Contenido "Nosotros"</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Misión</h3>
          <textarea
            required
            value={formData.mission}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe la misión del IIAP..."
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Visión</h3>
          <textarea
            required
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe la visión del IIAP..."
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Historia</h3>
          <textarea
            required
            value={formData.history}
            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Describe la historia del IIAP..."
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Valores</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agregar un valor..."
            />
            <button
              type="button"
              onClick={handleAddValue}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Agregar
            </button>
          </div>

          <div className="space-y-2">
            {formData.values.map((value, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {formData.values.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No hay valores agregados
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Estado de Publicación</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-900">Publicar en la landing page</span>
              <p className="text-gray-500 text-sm">
                Cuando está publicado, el contenido será visible en la sección "Nosotros" de la página pública
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}