import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface VolunteerModalProps {
  volunteer: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function VolunteerModal({ volunteer, onClose, onSave }: VolunteerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    skills: '',
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        area: volunteer.area,
        skills: volunteer.skills || '',
      });
    }
  }, [volunteer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">
            {volunteer ? 'Editar Voluntario' : 'Agregar Voluntario'}
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
            <label className="block text-gray-700 mb-2">Nombre completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Área de interés</label>
            <select
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar área</option>
              <option value="Educación">Educación</option>
              <option value="Medio Ambiente">Medio Ambiente</option>
              <option value="Salud">Salud</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Comunicación">Comunicación</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Habilidades (separadas por coma)</label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Ej: Diseño gráfico, Programación, Idiomas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
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
              {volunteer ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
