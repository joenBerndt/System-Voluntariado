import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface ConvocatoriaModalProps {
  convocatoria: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function ConvocatoriaModal({ convocatoria, onClose, onSave }: ConvocatoriaModalProps) {
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: usersData } = useApi<any[]>('/users');
  
  const projects = projectsData || [];
  const areas = areasData || [];
  const users = usersData || [];
  
  // Filter only Admin and Admin Master users for the dropdown
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'admin_master');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    area: '',
    startDate: '',
    endDate: '',
    vacancies: '',
    requirements: '',
    status: 'activa',
    managerId: '',
  });

  useEffect(() => {
    if (convocatoria) {
      setFormData({
        title: convocatoria.title,
        description: convocatoria.description,
        projectId: convocatoria.projectId || '',
        area: convocatoria.area,
        startDate: convocatoria.startDate,
        endDate: convocatoria.endDate,
        vacancies: convocatoria.vacancies.toString(),
        requirements: convocatoria.requirements || '',
        status: convocatoria.status,
        managerId: convocatoria.managerId || '',
      });
    }
  }, [convocatoria]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const area = areas.find(a => a.id === project.areaId);
      setFormData({
        ...formData,
        projectId,
        area: area?.name || formData.area,
      });
    } else {
      setFormData({ ...formData, projectId, area: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      vacancies: parseInt(formData.vacancies),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">
            {convocatoria ? 'Editar Convocatoria' : 'Nueva Convocatoria'}
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
            <label className="block text-gray-700 mb-2">Título de la convocatoria</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Proyecto</label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Área</label>
              <select
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.name}>{area.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Vacantes</label>
              <input
                type="number"
                required
                min="1"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Fecha de inicio</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Fecha de fin</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Estado</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="activa">Activa</option>
              <option value="en_proceso">En Proceso</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Requisitos</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Ej: Disponibilidad de tiempo, conocimientos específicos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Responsable</label>
            <select
              required
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar responsable</option>
              {adminUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
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
              {convocatoria ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}