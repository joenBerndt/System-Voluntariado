import { useState, useEffect } from 'react';
import { X, Camera, Image as ImageIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';

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
    imageUrl: '',
    published: true,
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        description: area.description,
        icon: area.icon,
        imageUrl: area.imageUrl || '',
        published: area.published !== undefined ? area.published : true,
      });
      setImagePreview(area.imageUrl || '');
    }
  }, [area]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      formDataUpload.append('type', 'area');

      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, imageUrl: result.data.url });
        setImagePreview(result.data.url);
        alert('Imagen subida exitosamente');
      } else {
        alert('Error al subir la imagen: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              Imagen del Área (Opcional)
            </label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-emerald-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, imageUrl: '' });
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer bg-emerald-50 hover:bg-emerald-100 transition-colors">
                  <div className="flex flex-col items-center justify-center py-6">
                    <ImageIcon className="w-12 h-12 text-emerald-600 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      Haz clic para subir una imagen
                    </p>
                    <p className="text-gray-500 text-sm">
                      PNG, JPG hasta 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
              {uploading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
                  <p className="text-gray-600 text-sm mt-2">Subiendo imagen...</p>
                </div>
              )}
              <p className="text-gray-500 text-sm">
                Si no subes una imagen, se mostrará un ícono con gradiente de color
              </p>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nombre del área
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej: Biodiversidad Amazónica"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Descripción
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={4}
              placeholder="Describe las actividades y objetivos de esta área de investigación..."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Icono (Se usa si no hay imagen)
            </label>
            <select
              required
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-gray-900 font-semibold block mb-1">
                  Publicar en la landing page
                </span>
                <span className="text-gray-600 text-sm">
                  Al publicar, esta área será visible para todos los visitantes del sitio web
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg font-medium disabled:from-gray-400 disabled:to-gray-500"
            >
              {area ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
