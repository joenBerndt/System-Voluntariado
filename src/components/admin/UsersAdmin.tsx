import { useState, useEffect } from 'react';
import { Search, UserCircle, UserCheck, Crown, Users as UsersIcon, Shield, ChevronUp, ChevronDown, Trash2, Mail, Phone, MapPin, AlertTriangle, X, FolderOpen, Megaphone, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi, apiPut, apiDelete } from '../../hooks/useApi';
import { LoadingSpinner } from '../LoadingOverlay';
import { useNotifications } from '../../contexts/NotificationContext';

interface UsersAdminProps {
  currentUser?: any;
}

export function UsersAdmin({ currentUser }: UsersAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [assignmentsData, setAssignmentsData] = useState<{
    user: any;
    projects: any[];
    convocatorias: any[];
    action: 'demote' | 'delete';
    newRole?: string;
  } | null>(null);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight > 900) setItemsPerPage(9);
      else setItemsPerPage(7);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { showSuccess, showError, showWarning, showLoading, hideNotification } = useNotifications();

  const { data: usersData, loading, refetch } = useApi<any[]>('/users');
  const { data: projectsData, refetch: refetchProjects } = useApi<any[]>('/projects');
  const { data: convocatoriasData, refetch: refetchConvocatorias } = useApi<any[]>('/convocatorias');

  const users = usersData || [];
  const projects = projectsData || [];
  const convocatorias = convocatoriasData || [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.area?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePromote = async (userId: string, currentRole: string) => {
    if (!window.confirm('¿Estás seguro de que deseas promover a este usuario?')) return;

    let newRole = currentRole;

    // Promotion hierarchy: user → volunteer → admin → admin_master
    if (currentRole === 'user') newRole = 'volunteer';
    else if (currentRole === 'volunteer') newRole = 'admin';
    else if (currentRole === 'admin') newRole = 'admin_master';

    const loadingId = showLoading('Promoviendo usuario...', 'Actualizando rol en el sistema');

    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        hideNotification(loadingId);
        showError('Error', 'Usuario no encontrado');
        return;
      }
      await apiPut(`/users/${userId}/role`, { role: newRole });
      hideNotification(loadingId);
      showSuccess(
        '¡Usuario promovido!',
        `${user.name} ahora es ${newRole === 'volunteer' ? 'Voluntario' : newRole === 'admin' ? 'Administrador' : 'Administrador Master'}`
      );
      refetch();
      // Update selectedUser if it's the one being modified
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error('Error promoting user:', err);
      hideNotification(loadingId);
      showError('Error al promover', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleDemote = async (userId: string, currentRole: string) => {
    let newRole = currentRole;

    // Demotion hierarchy: admin_master → admin → volunteer → user
    if (currentRole === 'admin_master') newRole = 'admin';
    else if (currentRole === 'admin') newRole = 'volunteer';
    else if (currentRole === 'volunteer') newRole = 'user';
    else {
      showWarning('Acción no permitida', 'Este usuario ya tiene el rol mínimo');
      return;
    }

    // Check if user has assigned projects or convocatorias
    const user = users.find(u => u.id === userId);
    const userProjects = projects.filter(p =>
      p.managers && Array.isArray(p.managers) && p.managers.includes(userId)
    );
    const userConvocatorias = convocatorias.filter(c => c.responsable === user?.email);

    if (userProjects.length > 0 || userConvocatorias.length > 0) {
      // Show modal with assignments
      setAssignmentsData({
        user,
        projects: userProjects,
        convocatorias: userConvocatorias,
        action: 'demote',
        newRole
      });
      setShowAssignmentsModal(true);
    } else {
      // No assignments, proceed with demotion
      if (!window.confirm('¿Estás seguro de que deseas degradar a este usuario?')) return;

      const loadingId = showLoading('Degradando usuario...', 'Actualizando rol en el sistema');

      try {
        await apiPut(`/users/${userId}/role`, { role: newRole });
        hideNotification(loadingId);
        showSuccess(
          'Usuario degradado',
          `El rol ha sido actualizado a ${newRole === 'user' ? 'Usuario' : newRole === 'volunteer' ? 'Voluntario' : 'Administrador'}`
        );
        refetch();
        // Update selectedUser if it's the one being modified
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      } catch (err) {
        console.error('Error demoting user:', err);
        hideNotification(loadingId);
        showError('Error al degradar', 'No se pudo actualizar el rol del usuario');
      }
    }
  };

  const handleDelete = async (userId: string) => {
    // Prevent deleting self
    if (userId === currentUser?.id) {
      showError('Acción no permitida', 'No puedes eliminar tu propia cuenta');
      return;
    }

    // Check if user has assigned projects or convocatorias
    const user = users.find(u => u.id === userId);
    const userProjects = projects.filter(p =>
      p.managers && Array.isArray(p.managers) && p.managers.includes(userId)
    );
    const userConvocatorias = convocatorias.filter(c => c.responsable === user?.email);

    if (userProjects.length > 0 || userConvocatorias.length > 0) {
      // Show modal with assignments
      setAssignmentsData({
        user,
        projects: userProjects,
        convocatorias: userConvocatorias,
        action: 'delete'
      });
      setShowAssignmentsModal(true);
    } else {
      // No assignments, proceed with deletion
      if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;

      const loadingId = showLoading('Eliminando usuario...', 'Removiendo datos del sistema');

      try {
        await apiDelete(`/users/${userId}`);
        hideNotification(loadingId);
        showSuccess('Usuario eliminado', 'El usuario ha sido eliminado del sistema exitosamente');
        refetch();
      } catch (err) {
        console.error('Error deleting user:', err);
        hideNotification(loadingId);
        showError('Error al eliminar', 'No se pudo eliminar el usuario');
      }
    }
  };

  const handleResetPassword = async (user: any) => {
    if (currentUser?.role !== 'admin_master') {
      showWarning('Acceso denegado', 'Solo el Administrador Maestro puede restablecer contraseñas.');
      return;
    }

    let defaultPassword = 'user123';
    if (user.role === 'admin') defaultPassword = 'admin123';
    else if (user.role === 'volunteer') defaultPassword = 'volunteer123';

    if (!window.confirm(`¿Estás seguro de restablecer la contraseña para ${user.name}?\n\nLa nueva contraseña será: ${defaultPassword}`)) {
      return;
    }

    const loadingId = showLoading('Restableciendo contraseña...', 'Por favor espera');
    try {
      await apiPut(`/users/${user.id}`, { password: defaultPassword });
      hideNotification(loadingId);
      showSuccess('Contraseña restablecida', `La contraseña se ha actualizado a: ${defaultPassword}`);
    } catch (err) {
      hideNotification(loadingId);
      showError('Error', 'No se pudo restablecer la contraseña');
      console.error(err);
    }
  };

  const handleRemoveAndProceed = async () => {
    if (!assignmentsData) return;

    const { user, projects: userProjects, convocatorias: userConvocatorias, action, newRole } = assignmentsData;

    if (!user) {
      showError('Error', 'Usuario no encontrado');
      setShowAssignmentsModal(false);
      setAssignmentsData(null);
      return;
    }

    const loadingId = showLoading(
      'Procesando cambios...',
      'Removiendo asignaciones y actualizando usuario'
    );

    try {
      // Remove user from all projects (filter out user.id from managers array)
      for (const project of userProjects) {
        const updatedManagers = (project.managers || []).filter((managerId: string) => managerId !== user.id);
        await apiPut(`/projects/${project.id}`, { ...project, managers: updatedManagers });
      }

      // Remove user from all convocatorias
      for (const convocatoria of userConvocatorias) {
        await apiPut(`/convocatorias/${convocatoria.id}`, { ...convocatoria, responsable: null });
      }

      // Refresh projects and convocatorias
      await refetchProjects();
      await refetchConvocatorias();

      // Now proceed with the action
      if (action === 'demote') {
        await apiPut(`/users/${user.id}/role`, { role: newRole });
        hideNotification(loadingId);
        showSuccess(
          'Operación completada',
          'Usuario removido de sus asignaciones y degradado exitosamente'
        );
        // Update selectedUser role
        if (selectedUser && selectedUser.id === user.id) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      } else if (action === 'delete') {
        await apiDelete(`/users/${user.id}`);
        hideNotification(loadingId);
        showSuccess(
          'Usuario eliminado',
          'Usuario removido de sus asignaciones y eliminado del sistema'
        );
      }

      refetch();
      setShowAssignmentsModal(false);
      setAssignmentsData(null);
    } catch (err) {
      console.error('Error removing assignments:', err);
      hideNotification(loadingId);
      showError('Error al procesar', 'No se pudieron remover las asignaciones del usuario');
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin_master':
        return {
          label: 'Admin Master',
          icon: Crown,
          color: 'from-purple-600 to-purple-700',
          bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-900',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'admin':
        return {
          label: 'Administrador',
          icon: Shield,
          color: 'from-teal-600 to-teal-700',
          bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100',
          borderColor: 'border-teal-300',
          textColor: 'text-teal-900',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        };
      case 'volunteer':
        return {
          label: 'Voluntario',
          icon: UserCheck,
          color: 'from-emerald-600 to-emerald-700',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-900',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      default:
        return {
          label: 'Usuario',
          icon: UserCircle,
          color: 'from-gray-600 to-gray-700',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-900',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Usuarios</h2>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {/* Stats Chips */}
          <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 rounded-full font-medium shadow-sm">
            {users.filter(u => u.role === 'user').length} Usuarios
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 rounded-full font-medium shadow-sm">
            {users.filter(u => u.role === 'volunteer').length} Voluntarios
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 text-teal-800 rounded-full font-medium shadow-sm">
            {users.filter(u => u.role === 'admin').length} Admins
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-800 rounded-full font-medium shadow-sm">
            {users.filter(u => u.role === 'admin_master').length} Admin Master
          </span>
        </div>
      </div>

      {/* Filters (Adapted style) */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuarios</option>
            <option value="volunteer">Voluntarios</option>
            <option value="admin">Administradores</option>
            <option value="admin_master">Admin Master</option>
          </select>
        </div>
      </div>

      {/* Split View */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: List */}
          <div className="space-y-4">
            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3 text-center">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user, index) => {
                    const roleInfo = getRoleInfo(user.role);
                    const isSelected = selectedUser?.id === user.id;
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                          {String(globalIndex).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleInfo.badgeColor}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 px-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Details (User Card) */}
          <div className="lg:sticky lg:top-6">
            {selectedUser ? (
              (() => {
                const user = selectedUser;
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <div className={`${roleInfo.bgColor} p-6 rounded-xl border-2 ${roleInfo.borderColor} shadow-xl relative overflow-hidden`}>
                    {/* Original Card Content logic here */}
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 bg-gradient-to-br ${roleInfo.color} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                          <span className="text-white font-bold text-xl">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className={`${roleInfo.textColor} font-bold text-lg`}>{user.name}</h4>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${roleInfo.badgeColor} mt-1 inline-block`}>
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs rounded-full font-bold border border-amber-300 shadow-sm">
                          TÚ
                        </span>
                      )}
                      <button onClick={() => setSelectedUser(null)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3 mb-6 bg-white/60 p-4 rounded-xl backdrop-blur-sm relative z-10">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <Mail className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-teal-100 p-2 rounded-lg">
                            <Phone className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="text-sm font-medium">{user.phone}</span>
                        </div>
                      )}
                      {user.area && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">{user.area}</span>
                        </div>
                      )}
                    </div>

                    {/* Role Icon Watermark */}
                    <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
                      <RoleIcon className={`w-48 h-48 ${roleInfo.textColor}`} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4 border-t-2 border-white/50 relative z-10">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePromote(user.id, user.role)}
                          disabled={user.role === 'admin_master' || isCurrentUser}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                          title="Promover usuario"
                        >
                          <ChevronUp className="w-5 h-5" />
                          <span className="text-sm">Promover</span>
                        </button>
                        <button
                          onClick={() => handleDemote(user.id, user.role)}
                          disabled={user.role === 'user' || isCurrentUser}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                          title="Degradar usuario"
                        >
                          <ChevronDown className="w-5 h-5" />
                          <span className="text-sm">Degradar</span>
                        </button>
                      </div>

                      {currentUser?.role === 'admin_master' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-md active:scale-95 transform transition-transform"
                            title="Restablecer contraseña a valor por defecto"
                          >
                            <Key className="w-4 h-4" />
                            <span className="text-xs">Nueva Contraseña</span>
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isCurrentUser}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md active:scale-95 transform transition-transform"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">Eliminar Usuario</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isCurrentUser && (
                      <p className="mt-4 text-xs text-amber-900/70 text-center font-bold uppercase tracking-wider">
                        No puedes modificar tu propia cuenta
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <UserCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Detalles del Usuario</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Selecciona un usuario de la lista para ver su información, rol y gestionar permisos.</p>
              </div>
            )}

            {/* Role Hierarchy Info (Below Card) */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                  <Shield className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-amber-900 font-bold mb-1">Jerarquía de Roles</h4>
                  <p className="text-amber-800 text-sm mb-2">
                    Los usuarios pueden ser promovidos o degradados siguiendo esta jerarquía:
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg">Usuario</span>
                    <span className="text-amber-600">→</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg">Voluntario</span>
                    <span className="text-amber-600">→</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-lg">Admin</span>
                    <span className="text-amber-600">→</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-lg">Admin Master</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterRole !== 'all'
              ? 'No se encontraron usuarios con esos filtros'
              : 'No hay usuarios registrados'}
          </p>
        </div>
      )}

      {/* Assignments Modal */}
      {showAssignmentsModal && assignmentsData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">⚠️ Usuario con Asignaciones</h3>
                    <p className="text-red-100 text-sm">Se requiere acción antes de continuar</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAssignmentsModal(false);
                    setAssignmentsData(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-semibold mb-1">
                      No se puede {assignmentsData.action === 'demote' ? 'degradar' : 'eliminar'} al usuario directamente
                    </p>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      El usuario <span className="font-bold">{assignmentsData.user.name}</span> está asignado como encargado de {assignmentsData.projects.length} proyecto(s) y {assignmentsData.convocatorias.length} convocatoria(s).
                      Debe ser removido de todas sus asignaciones antes de continuar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Projects */}
                {assignmentsData.projects.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-300 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-teal-700" />
                      </div>
                      <h4 className="font-bold text-teal-900">
                        Proyectos Asignados ({assignmentsData.projects.length})
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {assignmentsData.projects.map(project => (
                        <li key={project.id} className="flex items-start gap-2 text-teal-800 bg-white/60 p-3 rounded-lg">
                          <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          <div>
                            <p className="font-semibold">{project.name}</p>
                            <p className="text-sm text-teal-700">Estado: {project.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Convocatorias */}
                {assignmentsData.convocatorias.length > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <Megaphone className="w-5 h-5 text-emerald-700" />
                      </div>
                      <h4 className="font-bold text-emerald-900">
                        Convocatorias Asignadas ({assignmentsData.convocatorias.length})
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {assignmentsData.convocatorias.map(convocatoria => (
                        <li key={convocatoria.id} className="flex items-start gap-2 text-emerald-800 bg-white/60 p-3 rounded-lg">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          <div>
                            <p className="font-semibold">{convocatoria.title}</p>
                            <p className="text-sm text-emerald-700">Estado: {convocatoria.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <p className="text-gray-700 text-sm">
                  <span className="font-bold">¿Qué sucederá?</span> Si continúas, el usuario será removido automáticamente como encargado de todos los proyectos y convocatorias listados arriba, dejándolos sin encargado asignado.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowAssignmentsModal(false);
                  setAssignmentsData(null);
                }}
                className="px-6 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveAndProceed}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Remover de Asignaciones y {assignmentsData.action === 'demote' ? 'Degradar' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}