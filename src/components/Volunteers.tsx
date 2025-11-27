import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Users } from 'lucide-react';
import { VolunteerModal } from './VolunteerModal';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';

interface VolunteersProps {
  isAdminJunior?: boolean;
}

export function Volunteers({ isAdminJunior = false }: VolunteersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const { data: volunteersData, loading, error, refetch } = useApi<any[]>('/volunteers');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');

  const volunteers = volunteersData || [];
  const assignments = assignmentsData || [];

  // Helper function to check if volunteer is active (has project assignments)
  const isVolunteerActive = (volunteerId: string) => {
    return assignments.some((assignment) => assignment.volunteerId === volunteerId);
  };

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVolunteer = () => {
    setSelectedVolunteer(null);
    setIsModalOpen(true);
  };

  const handleEditVolunteer = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setIsModalOpen(true);
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este voluntario?')) {
      try {
        await apiDelete(`/volunteers/${id}`);
        refetch();
      } catch (err) {
        console.error('Error deleting volunteer:', err);
        alert('Error al eliminar el voluntario');
      }
    }
  };

  const handleSaveVolunteer = async (volunteerData: any) => {
    try {
      if (selectedVolunteer) {
        await apiPut(`/volunteers/${selectedVolunteer.id}`, volunteerData);
      } else {
        await apiPost('/volunteers', volunteerData);
      }
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving volunteer:', err);
      alert('Error al guardar el voluntario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando voluntarios...</div>
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
        <h2 className="text-gray-900">Gestión de Voluntarios</h2>
        {!isAdminJunior && (
          <button
            onClick={handleAddVolunteer}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Voluntario
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar voluntarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">{volunteer.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-gray-900">{volunteer.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      isVolunteerActive(volunteer.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isVolunteerActive(volunteer.id) ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              {!isAdminJunior && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditVolunteer(volunteer)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVolunteer(volunteer.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4" />
                <span>{volunteer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4" />
                <span>{volunteer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{volunteer.area}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Registrado: {new Date(volunteer.registeredDate).toLocaleDateString('es-ES')}
              </p>
              {volunteer.skills && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {volunteer.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron voluntarios</p>
        </div>
      )}

      {isModalOpen && (
        <VolunteerModal
          volunteer={selectedVolunteer}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVolunteer}
        />
      )}
    </div>
  );
}