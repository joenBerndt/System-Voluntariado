import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Users, Award, Calendar, CheckCircle, XCircle, Briefcase } from 'lucide-react';
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

  // Get volunteer's active projects count
  const getVolunteerProjectsCount = (volunteerId: string) => {
    return assignments.filter((assignment) => assignment.volunteerId === volunteerId).length;
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
        alert('Voluntario eliminado exitosamente');
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
        alert('Voluntario actualizado exitosamente');
      } else {
        // When creating a new volunteer, set default password
        await apiPost('/volunteers', {
          ...volunteerData,
          password: '12345678' // Default password for admin-created volunteers
        });
        
        // Store default password in localStorage
        localStorage.setItem(`user_pass_${volunteerData.email}`, '12345678');
        alert('Voluntario creado exitosamente con contraseña: 12345678');
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
        <p className="text-gray-600 mt-4">Cargando voluntarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-12 text-center border-2 border-red-100">
        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-gray-900 mb-2">Error al cargar voluntarios</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Calculate statistics
  const activeVolunteers = volunteers.filter(v => isVolunteerActive(v.id)).length;
  const totalProjects = assignments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Gestión de Voluntarios</h2>
          <p className="text-gray-600">Administra a los voluntarios activos del IIAP</p>
        </div>
        {!isAdminJunior && (
          <button
            onClick={handleAddVolunteer}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Agregar Voluntario
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border-2 border-emerald-100 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-xl">
              <Users className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Total Voluntarios</p>
              <p className="text-3xl font-bold text-emerald-700">{volunteers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border-2 border-teal-100 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 p-4 rounded-xl">
              <CheckCircle className="w-8 h-8 text-teal-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Activos</p>
              <p className="text-3xl font-bold text-teal-700">{activeVolunteers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border-2 border-purple-100 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl">
              <Briefcase className="w-8 h-8 text-purple-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Asignaciones</p>
              <p className="text-3xl font-bold text-purple-700">{totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-lg border-2 border-emerald-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
          <input
            type="text"
            placeholder="Buscar voluntarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Volunteers Grid */}
      {filteredVolunteers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer) => {
            const projectsCount = getVolunteerProjectsCount(volunteer.id);
            const isActive = isVolunteerActive(volunteer.id);

            return (
              <div 
                key={volunteer.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className={`p-6 ${isActive ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className={`text-xl font-bold ${isActive ? 'text-emerald-600' : 'text-gray-600'}`}>
                          {volunteer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{volunteer.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white backdrop-blur-sm'
                              : 'bg-white/20 text-white backdrop-blur-sm'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Inactivo
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    {!isAdminJunior && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditVolunteer(volunteer)}
                          className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVolunteer(volunteer.id)}
                          className="p-2 bg-white/20 text-white hover:bg-red-500 rounded-lg transition-colors backdrop-blur-sm"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-teal-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium break-all">{volunteer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-purple-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{volunteer.phone || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-amber-700" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{volunteer.area || 'Sin área especificada'}</span>
                    </div>
                  </div>

                  {/* Projects Count */}
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border-2 border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Proyectos Asignados</p>
                        <p className="text-2xl font-bold text-emerald-700">{projectsCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {volunteer.skills && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-700 font-semibold text-sm">Habilidades</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {volunteer.skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">
                            {skill.trim()}
                          </span>
                        ))}
                        {volunteer.skills.split(',').length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                            +{volunteer.skills.split(',').length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Registrado: {new Date(volunteer.registeredDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No se encontraron voluntarios</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'Aún no hay voluntarios registrados'}
          </p>
        </div>
      )}

      {/* Modal */}
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
