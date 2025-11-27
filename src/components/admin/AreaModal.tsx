import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AreaModalProps {
  area: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AreaModal({ area, onClose, onSave }: AreaModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'leaf',
    published: true,
  });

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        description: area.description,
        icon: area.icon,
        published: area.published !== undefined ? area.published : true,
      });
    }
  }, [area]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const iconOptions = [
    { value: 'leaf', label: 'Hoja (Biodiversidad)' },
    { value: 'droplet', label: 'Gota (Recursos Hídricos)' },
    { value: 'fish', label: 'Pez (Acuicultura)' },
    { value: 'cloud', label: 'Nube (Cambio Climático)' },
    { value: 'users', label: 'Personas (Comunidades)' },
    { value: 'flask', label: 'Tubo de ensayo (Biotecnología)' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">
            {area ? 'Editar Área' : 'Agregar Área'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Nombre del área</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Descripción</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Icono</label>
            <select
              required
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Publicar en la landing page</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {area ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}