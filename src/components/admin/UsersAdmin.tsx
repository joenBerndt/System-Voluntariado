import { useState } from 'react';
import { Search, UserCircle, UserCheck, Crown, Users as UsersIcon, Shield, ChevronUp, ChevronDown, Trash2, Mail, Phone, MapPin, AlertTriangle, X, FolderOpen, Megaphone } from 'lucide-react';
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
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra roles y permisos de todos los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg">
          <UsersIcon className="w-5 h-5 text-purple-700" />
          <span className="font-bold text-purple-900">{users.length} Usuarios</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos los roles</option>
            <option value="user">Usuarios</option>
            <option value="volunteer">Voluntarios</option>
            <option value="admin">Administradores</option>
            <option value="admin_master">Admin Master</option>
          </select>
        </div>
      </div>

      {/* Role Hierarchy Info */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h4 className="text-amber-900 font-bold mb-1">Jerarquía de Roles</h4>
            <p className="text-amber-800 text-sm mb-2">
              Los usuarios pueden ser promovidos o degradados siguiendo esta jerarquía:
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold">
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

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            const RoleIcon = roleInfo.icon;
            const isCurrentUser = user.id === currentUser?.id;

            return (
              <div
                key={user.id}
                className={`${roleInfo.bgColor} p-6 rounded-xl border-2 ${roleInfo.borderColor} shadow-md hover:shadow-lg transition-all ${
                  isCurrentUser ? 'ring-4 ring-amber-300' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${roleInfo.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className={`${roleInfo.textColor} font-bold`}>{user.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${roleInfo.badgeColor}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  {isCurrentUser && (
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 text-xs rounded-full font-bold border border-amber-300">
                      TÚ
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  {user.area && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">{user.area}</span>
                    </div>
                  )}
                </div>

                {/* Role Icon */}
                <div className="mb-4 p-3 bg-white/50 rounded-lg border border-white flex items-center justify-center">
                  <RoleIcon className={`w-8 h-8 ${roleInfo.textColor}`} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t-2 border-white">
                  <button
                    onClick={() => handlePromote(user.id, user.role)}
                    disabled={user.role === 'admin_master' || isCurrentUser}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    title="Promover usuario"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs">Promover</span>
                  </button>
                  <button
                    onClick={() => handleDemote(user.id, user.role)}
                    disabled={user.role === 'user' || isCurrentUser}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    title="Degradar usuario"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-xs">Degradar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={isCurrentUser}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isCurrentUser && (
                  <p className="mt-3 text-xs text-amber-800 text-center font-semibold">
                    No puedes modificar tu propia cuenta
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterRole !== 'all'
              ? 'No se encontraron usuarios con esos filtros'
              : 'No hay usuarios registrados'}
          </p>
        </div>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 text-center">
          <UserCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'user').length}</p>
          <p className="text-sm text-gray-700 font-medium">Usuarios</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 text-center">
          <UserCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-900">{users.filter(u => u.role === 'volunteer').length}</p>
          <p className="text-sm text-emerald-700 font-medium">Voluntarios</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-lg p-4 text-center">
          <Shield className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-teal-900">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-sm text-teal-700 font-medium">Admins</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 text-center">
          <Crown className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.role === 'admin_master').length}</p>
          <p className="text-sm text-purple-700 font-medium">Admin Master</p>
        </div>
      </div>

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