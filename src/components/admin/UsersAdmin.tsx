import { useState, useEffect } from 'react';
import { Search, UserCircle, UserCheck, Crown, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi, apiPut, apiDelete } from '../../hooks/useApi';
import { LoadingSpinner } from '../common/LoadingOverlay';
import { useNotifications } from '../../contexts/NotificationContext';
import { UserDetailCard } from './users/UserDetailCard';
import { UserAssignmentsModal } from './users/UserAssignmentsModal';
import { RoleLegend } from './users/RoleLegend';
import { AdminTableSkeleton, DetailPanelSkeleton } from '../common/Skeletons';
import { ConfirmationModal } from '../common/ConfirmationModal';

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

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => { },
  });

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

  const handlePromote = (userId: string, currentRole: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Confirmar promoción',
      description: '¿Estás seguro de que deseas promover a este usuario?',
      confirmText: 'Promover',
      variant: 'default',
      onConfirm: async () => {
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
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser({ ...selectedUser, role: newRole });
          }
        } catch (err) {
          console.error('Error promoting user:', err);
          hideNotification(loadingId);
          showError('Error al promover', err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDemote = (userId: string, currentRole: string) => {
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
      setAssignmentsData({
        user,
        projects: userProjects,
        convocatorias: userConvocatorias,
        action: 'demote',
        newRole
      });
      setShowAssignmentsModal(true);
    } else {
      setConfirmation({
        isOpen: true,
        title: 'Confirmar degradación',
        description: '¿Estás seguro de que deseas degradar a este usuario?',
        confirmText: 'Degradar',
        variant: 'default', // Or danger if considered destructive
        onConfirm: async () => {
          const loadingId = showLoading('Degradando usuario...', 'Actualizando rol en el sistema');
          try {
            await apiPut(`/users/${userId}/role`, { role: newRole });
            hideNotification(loadingId);
            showSuccess(
              'Usuario degradado',
              `El rol ha sido actualizado a ${newRole === 'user' ? 'Usuario' : newRole === 'volunteer' ? 'Voluntario' : 'Administrador'}`
            );
            refetch();
            if (selectedUser && selectedUser.id === userId) {
              setSelectedUser({ ...selectedUser, role: newRole });
            }
          } catch (err: any) {
            console.error('Error demoting user:', err);
            hideNotification(loadingId);
            showError('Error al degradar', err?.message || 'No se pudo actualizar el rol del usuario');
          } finally {
            setConfirmation(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    }
  };

  const handleDelete = (userId: string) => {
    // Prevent deleting self
    if (userId === currentUser?.id) {
      showError('Acción no permitida', 'No puedes eliminar tu propia cuenta');
      return;
    }

    const user = users.find(u => u.id === userId);
    const userProjects = projects.filter(p =>
      p.managers && Array.isArray(p.managers) && p.managers.includes(userId)
    );
    const userConvocatorias = convocatorias.filter(c => c.responsable === user?.email);

    if (userProjects.length > 0 || userConvocatorias.length > 0) {
      setAssignmentsData({
        user,
        projects: userProjects,
        convocatorias: userConvocatorias,
        action: 'delete'
      });
      setShowAssignmentsModal(true);
    } else {
      setConfirmation({
        isOpen: true,
        title: 'Eliminar usuario',
        description: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        variant: 'danger',
        onConfirm: async () => {
          const loadingId = showLoading('Eliminando usuario...', 'Removiendo datos del sistema');
          try {
            await apiDelete(`/users/${userId}`);
            hideNotification(loadingId);
            showSuccess('Usuario eliminado', 'El usuario ha sido eliminado del sistema exitosamente');
            refetch();
            setSelectedUser(null);
          } catch (err: any) {
            console.error('Error deleting user:', err);
            hideNotification(loadingId);
            showError('Error al eliminar', err?.message || 'No se pudo eliminar el usuario');
          } finally {
            setConfirmation(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    }
  };

  const handleResetPassword = (user: any) => {
    if (currentUser?.role !== 'admin_master') {
      showWarning('Acceso denegado', 'Solo el Administrador Maestro puede restablecer contraseñas.');
      return;
    }

    let defaultPassword = 'user123';
    if (user.role === 'admin') defaultPassword = 'admin123';
    else if (user.role === 'volunteer') defaultPassword = 'volunteer123';

    setConfirmation({
      isOpen: true,
      title: 'Restablecer contraseña',
      description: `¿Estás seguro de restablecer la contraseña para ${user.name}?\n\nLa nueva contraseña será: ${defaultPassword}`,
      confirmText: 'Restablecer',
      variant: 'default',
      onConfirm: async () => {
        const loadingId = showLoading('Restableciendo contraseña...', 'Por favor espera');
        try {
          await apiPut(`/users/${user.id}`, { password: defaultPassword });
          hideNotification(loadingId);
          showSuccess('Contraseña restablecida', `La contraseña se ha actualizado a: ${defaultPassword}`);
        } catch (err) {
          hideNotification(loadingId);
          showError('Error', 'No se pudo restablecer la contraseña');
          console.error(err);
        } finally {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRemoveAndProceed = async () => {
    if (!assignmentsData) return;
    const { user, projects: userProjects, convocatorias: userConvocatorias, action, newRole } = assignmentsData;

    const loadingId = showLoading('Procesando cambios...', 'Removiendo asignaciones y actualizando usuario');

    try {
      for (const project of userProjects) {
        const updatedManagers = (project.managers || []).filter((managerId: string) => managerId !== user.id);
        await apiPut(`/projects/${project.id}`, { ...project, managers: updatedManagers });
      }

      for (const convocatoria of userConvocatorias) {
        await apiPut(`/convocatorias/${convocatoria.id}`, { ...convocatoria, responsable: null });
      }

      await refetchProjects();
      await refetchConvocatorias();

      if (action === 'demote') {
        const user = users.find(u => u.id === assignmentsData.user.id);
        if (user && (user.role === 'admin' || user.role === 'admin_master') && newRole === 'user') {
          // Backend handles cleanup for downgrade
        }
        await apiPut(`/users/${user.id}/role`, { role: newRole });
        hideNotification(loadingId);
        showSuccess('Operación completada', 'Usuario removido de sus asignaciones y degradado exitosamente');
        if (selectedUser && selectedUser.id === user.id) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      } else if (action === 'delete') {
        await apiDelete(`/users/${user.id}`);
        hideNotification(loadingId);
        showSuccess('Usuario eliminado', 'Usuario removido de sus asignaciones y eliminado del sistema');
      }

      refetch();
      setShowAssignmentsModal(false);
      setAssignmentsData(null);
    } catch (err: any) {
      console.error('Error removing assignments:', err);
      hideNotification(loadingId);
      showError('Error al procesar', err?.message || 'No se pudieron remover las asignaciones del usuario');
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin_master':
        return { label: 'Admin Master', icon: Crown, color: 'from-purple-600 to-purple-700', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-900', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'admin':
        return { label: 'Administrador', icon: Shield, color: 'from-teal-600 to-teal-700', bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100', borderColor: 'border-teal-300', textColor: 'text-teal-900', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'volunteer':
        return { label: 'Voluntario', icon: UserCheck, color: 'from-emerald-600 to-emerald-700', bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100', borderColor: 'border-emerald-300', textColor: 'text-emerald-900', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Usuario', icon: UserCircle, color: 'from-gray-600 to-gray-700', bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100', borderColor: 'border-gray-300', textColor: 'text-gray-900', badgeColor: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };



  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <AdminTableSkeleton rows={7} />
        </div>
        <div className="lg:sticky lg:top-6 w-full">
          <DetailPanelSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Usuarios</h2>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 rounded-full font-medium shadow-sm">{users.filter(u => u.role === 'user').length} Usuarios</span>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 rounded-full font-medium shadow-sm">{users.filter(u => u.role === 'volunteer').length} Voluntarios</span>
          <span className="px-3 py-1 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 text-teal-800 rounded-full font-medium shadow-sm">{users.filter(u => u.role === 'admin').length} Admins</span>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-800 rounded-full font-medium shadow-sm">{users.filter(u => u.role === 'admin_master').length} Admin Master</span>
        </div>
      </div>

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

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                        <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">{String(globalIndex).padStart(2, '0')}</td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleInfo.badgeColor}`}>{roleInfo.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 px-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <span className="text-sm text-gray-600 font-medium">Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-6">
            <UserDetailCard
              selectedUser={selectedUser}
              currentUser={currentUser}
              onClose={() => setSelectedUser(null)}
              onPromote={handlePromote}
              onDemote={handleDemote}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
              getRoleInfo={getRoleInfo}
            />
            <RoleLegend />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{searchTerm || filterRole !== 'all' ? 'No se encontraron usuarios con esos filtros' : 'No hay usuarios registrados'}</p>
        </div>
      )}

      {showAssignmentsModal && assignmentsData && (
        <UserAssignmentsModal
          assignmentsData={assignmentsData}
          onClose={() => { setShowAssignmentsModal(false); setAssignmentsData(null); }}
          onProceed={handleRemoveAndProceed}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        isLoading={confirmation.isLoading}
      />
    </div>
  );
}