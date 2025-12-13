import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2, Users, CheckCircle, XCircle, Briefcase, ChevronLeft, ChevronRight, Award, Calendar, UserX } from 'lucide-react';
import { VolunteerModal } from './VolunteerModal';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';

interface VolunteersProps {
  isAdminJunior?: boolean;
  currentUser?: any;
}

export function Volunteers({ isAdminJunior = false, currentUser }: VolunteersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7); // Increased default to match reference density

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null); // For the modal (editing)
  const [activeVolunteer, setActiveVolunteer] = useState<any>(null); // For the right panel display

  const { data: volunteersData, loading, error, refetch } = useApi<any[]>('/volunteers');
  // Ensure we can refetch assignments
  const { data: assignmentsData, refetch: refetchAssignments } = useApi<any[]>('/project-assignments');

  const volunteers = volunteersData || [];
  const assignments = assignmentsData || [];

  // Responsive: Adjust itemsPerPage
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 1280 ? 8 : 6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helpers
  const isVolunteerActive = (volunteerId: string) => {
    return assignments.some((assignment) => assignment.volunteerId === volunteerId);
  };

  const getVolunteerProjectsCount = (volunteerId: string) => {
    return assignments.filter((assignment) => assignment.volunteerId === volunteerId).length;
  };

  // Filtering
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = isVolunteerActive(v.id);
    const matchesStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'active' ? isActive : !isActive;

    const matchesArea = filterArea === 'all' || v.area === filterArea;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Calculate pages
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);

  // Slice data
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterArea, itemsPerPage]);

  const handleAddVolunteer = () => {
    setSelectedVolunteer(null);
    setIsModalOpen(true);
  };

  const handleEditActiveVolunteer = () => {
    if (!activeVolunteer) return;
    setSelectedVolunteer(activeVolunteer);
    setIsModalOpen(true);
  };

  const handleDeactivateActiveVolunteer = async () => {
    if (!activeVolunteer) return;

    const volunteerAssignments = assignments.filter(a => a.volunteerId === activeVolunteer.id);

    if (volunteerAssignments.length === 0) {
      alert('Este voluntario ya está inactivo (no tiene proyectos asignados).');
      return;
    }

    if (window.confirm(`¿Está seguro de desactivar a ${activeVolunteer.name}? Este usuario PERMANECERÁ en el sistema, pero será retirado de todos sus proyectos (${volunteerAssignments.length}) y pasará a estado Inactivo.`)) {
      try {
        await Promise.all(volunteerAssignments.map(a => apiDelete(`/project-assignments/${a.id}`)));
        refetchAssignments(); // Refresh assignments to update status
        // We don't need to nullify activeVolunteer, they just become inactive in view
      } catch (err) {
        console.error('Error deactivating volunteer:', err);
        alert('Error al desactivar el voluntario');
      }
    }
  };

  const handleSaveVolunteer = async (volunteerData: any) => {
    try {
      if (selectedVolunteer) {
        await apiPut(`/volunteers/${selectedVolunteer.id}`, volunteerData);
        // Update active view if we just edited it
        if (activeVolunteer?.id === selectedVolunteer.id) {
          setActiveVolunteer({ ...activeVolunteer, ...volunteerData });
        }
      } else {
        await apiPost('/volunteers', {
          ...volunteerData,
          password: '12345678'
        });
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

  // Stats
  const activeVolunteersCount = volunteers.filter(v => isVolunteerActive(v.id)).length;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500">Error al cargar datos</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Voluntarios</h2>
          <p className="text-gray-500 mt-1">Administra la base de datos de voluntarios y sus estados</p>
        </div>
        {!isAdminJunior && (
          <button
            onClick={handleAddVolunteer}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nuevo Voluntario
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-900 font-bold text-2xl">{volunteers.length}</p>
            <p className="text-gray-500 text-xs font-semibold uppercase">Total</p>
          </div>
          <Users className="w-8 h-8 text-gray-200" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-emerald-700 font-bold text-2xl">{activeVolunteersCount}</p>
            <p className="text-emerald-600 text-xs font-semibold uppercase">Activos</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-100" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-amber-700 font-bold text-2xl">{volunteers.length - activeVolunteersCount}</p>
            <p className="text-amber-600 text-xs font-semibold uppercase">Inactivos</p>
          </div>
          <XCircle className="w-8 h-8 text-amber-100" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-purple-700 font-bold text-2xl">{assignments.length}</p>
            <p className="text-purple-600 text-xs font-semibold uppercase">Asignaciones</p>
          </div>
          <Briefcase className="w-8 h-8 text-purple-100" />
        </div>
      </div>

      {/* Filters - Visual correction to match reference */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="md:col-span-1">
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-600 bg-white"
            >
              <option value="all">Todas las áreas</option>
              <option value="Educación">Educación</option>
              <option value="Medio Ambiente">Medio Ambiente</option>
              <option value="Salud">Salud</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Comunicación">Comunicación</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-600 bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left: Table List */}
        <div className="space-y-4">
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white min-h-[500px] flex flex-col">
            <table className="w-full text-left text-sm text-gray-600 h-full">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Voluntario</th>
                  <th className="px-4 py-3">Área</th>
                  <th className="px-4 py-3 text-center">Proyectos</th>
                  <th className="px-4 py-3 text-center w-[20%]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedVolunteers.map((volunteer, index) => {
                  const isActive = isVolunteerActive(volunteer.id);
                  const projectCount = assignments.filter(a => a.volunteerId === volunteer.id).length;
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const isSelected = activeVolunteer?.id === volunteer.id;

                  return (
                    <tr
                      key={volunteer.id}
                      onClick={() => setActiveVolunteer(volunteer)}
                      className={`
                                 cursor-pointer transition-colors
                                 ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                            `}
                    >
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                        {globalIndex.toString().padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm mb-0.5">{volunteer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{volunteer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{volunteer.area || 'Sin área'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-xs font-bold text-gray-500">
                          {projectCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                          {isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {paginatedVolunteers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <button
                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-gray-600">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-gray-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Detail Card */}
        <div className="lg:sticky lg:top-6 w-full">
          {activeVolunteer ? (
            /* Active Card State */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header Green */}
              <div className="bg-emerald-500 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-emerald-600">
                        {activeVolunteer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl leading-snug">{activeVolunteer.name}</h3>
                      <div className="mt-1.5">
                        {isVolunteerActive(activeVolunteer.id) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/30 border border-emerald-400/50 text-white text-xs font-semibold backdrop-blur-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                            <XCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isAdminJunior && (
                      <button
                        onClick={handleEditActiveVolunteer}
                        className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {currentUser?.role === 'admin_master' && (
                      <button
                        onClick={handleDeactivateActiveVolunteer}
                        className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                        title="Desactivar (Remover Asignaciones)"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-8">
                {/* Contact Info Rows */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 break-all">{activeVolunteer.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{activeVolunteer.phone || 'No registrado'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{activeVolunteer.area || 'Sin área'}</span>
                  </div>
                </div>

                {/* Projects Box */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-0.5">Proyectos Asignados</p>
                    <p className="text-3xl font-bold text-gray-900 leading-none">{getVolunteerProjectsCount(activeVolunteer.id)}</p>
                  </div>
                </div>

                {/* Skills */}
                {activeVolunteer.skills && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-gray-400">
                      <Award className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Habilidades</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeVolunteer.skills.split(',').map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Date */}
                <div className="pt-6 border-t border-gray-100 flex items-center gap-3 text-gray-400 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>Registrado: {new Date(activeVolunteer.registeredDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State - Matching the visual reference "ApplicationsAdmin" */
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles del Voluntario</h3>
              <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                Selecciona un voluntario de la lista para ver su información completa, habilidades y gestionar su estado.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Volunteer Modal */}
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
