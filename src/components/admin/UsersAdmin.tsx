import { useState } from 'react';
import { Search, Mail, Phone, Calendar, User, Shield, UserCheck, Trash2, AlertTriangle, ArrowUp, Plus, X, ArrowDown } from 'lucide-react';
import { useApi, apiDelete, apiPut, apiPost } from '../../hooks/useApi';

export function UsersAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'volunteer' | 'admin' | 'admin_master'>('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    skills: '',
    password: '',
  });
  const { data: usersData, loading, refetch } = useApi<any[]>('/users');

  // Get current logged admin email from localStorage
  const currentAdminEmail = localStorage.getItem('iiap_volunteer_email');

  const users = usersData || [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.area?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Count users by role
  const userCount = users.filter(u => u.role === 'user').length;
  const volunteerCount = users.filter(u => u.role === 'volunteer').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const adminMasterCount = users.filter(u => u.role === 'admin_master').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Gestión de Usuarios</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Usuario
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {userCount} Usuarios
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {volunteerCount} Voluntarios
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {adminCount} Admins
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
              {adminMasterCount} Admins Master
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'user', 'volunteer', 'admin', 'admin_master'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role === 'all' ? 'Todos' : role === 'user' ? 'Usuarios' : role === 'volunteer' ? 'Voluntarios' : role === 'admin' ? 'Admin' : 'Admin Master'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            
            return (
              <div
                key={user.id}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-gray-900">{user.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDeletingUserId(user.id);
                      setUserToDelete(user);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.area && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="w-4 h-4 text-blue-600 flex items-center justify-center">🎯</span>
                      <span>{user.area}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{new Date(user.registeredDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                {user.skills && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Habilidades:</span> {user.skills}
                    </p>
                  </div>
                )}
                
                {/* Role Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {/* Can't edit yourself */}
                  {user.email === currentAdminEmail ? (
                    <div className="text-center py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      🔒 No puedes editar tu propio rol
                    </div>
                  ) : (
                    <>
                      {/* User Role - Can promote to Volunteer */}
                      {user.role === 'user' && (
                        <button
                          onClick={async () => {
                            if (confirm(`¿Promover a ${user.name} a Voluntario?`)) {
                              try {
                                await apiPut(`/users/${user.id}/role`, { role: 'volunteer' });
                                alert('Usuario promovido a Voluntario exitosamente');
                                refetch();
                              } catch (err) {
                                alert('Error al promover usuario');
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Promover a Voluntario
                        </button>
                      )}
                      
                      {/* Volunteer Role - Can promote to Admin or degrade to User */}
                      {user.role === 'volunteer' && (
                        <>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Promover a ${user.name} a Admin?`)) {
                                try {
                                  await apiPut(`/users/${user.id}/role`, { role: 'admin' });
                                  alert('Voluntario promovido a Admin exitosamente');
                                  refetch();
                                } catch (err) {
                                  alert('Error al promover voluntario');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                          >
                            <ArrowUp className="w-4 h-4" />
                            Promover a Admin
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Degradar a ${user.name} a Usuario?`)) {
                                try {
                                  await apiPut(`/users/${user.id}/role`, { role: 'user' });
                                  alert('Voluntario degradado a Usuario exitosamente');
                                  refetch();
                                } catch (err) {
                                  alert('Error al degradar voluntario');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                          >
                            <ArrowDown className="w-4 h-4" />
                            Degradar a Usuario
                          </button>
                        </>
                      )}
                      
                      {/* Admin Role - Can promote to Admin Master or degrade to Volunteer */}
                      {user.role === 'admin' && (
                        <>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Promover a ${user.name} a Admin Master?`)) {
                                try {
                                  await apiPut(`/users/${user.id}/role`, { role: 'admin_master' });
                                  alert('Admin promovido a Admin Master exitosamente');
                                  refetch();
                                } catch (err) {
                                  alert('Error al promover admin');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors text-sm"
                          >
                            <ArrowUp className="w-4 h-4" />
                            Promover a Admin Master
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`¿Degradar a ${user.name} a Voluntario?`)) {
                                try {
                                  await apiPut(`/users/${user.id}/role`, { role: 'volunteer' });
                                  alert('Admin degradado a Voluntario exitosamente');
                                  refetch();
                                } catch (err) {
                                  alert('Error al degradar admin');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                          >
                            <ArrowDown className="w-4 h-4" />
                            Degradar a Voluntario
                          </button>
                        </>
                      )}
                      
                      {/* Admin Master Role - Can only degrade to Admin */}
                      {user.role === 'admin_master' && (
                        <button
                          onClick={async () => {
                            if (confirm(`¿Degradar a ${user.name} a Admin?`)) {
                              try {
                                await apiPut(`/users/${user.id}/role`, { role: 'admin' });
                                alert('Admin Master degradado a Admin exitosamente');
                                refetch();
                              } catch (err) {
                                alert('Error al degradar admin master');
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                          <ArrowDown className="w-4 h-4" />
                          Degradar a Admin
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterRole !== 'all'
              ? 'No se encontraron usuarios con esos filtros'
              : 'No hay usuarios registrados aún'}
          </p>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-gray-900">Confirmar Eliminación</h3>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.name}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {userToDelete.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Rol:</strong> {getRoleText(userToDelete.role)}
              </p>
              
              {userToDelete.role === 'admin' || userToDelete.role === 'admin_master' ? (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>⚠️ No se puede eliminar cuentas de administrador</strong>
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    <strong>Advertencia:</strong> Esta acción eliminará:
                  </p>
                  <ul className="text-sm text-orange-700 list-disc list-inside mt-2">
                    <li>La cuenta del usuario</li>
                    <li>Todas sus postulaciones</li>
                    <li>Su registro de voluntario (si existe)</li>
                  </ul>
                  <p className="text-sm text-orange-700 mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setDeletingUserId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              {userToDelete.role !== 'admin' && userToDelete.role !== 'admin_master' && (
                <button
                  onClick={async () => {
                    try {
                      await apiDelete(`/users/${deletingUserId}`);
                      alert(`Usuario ${userToDelete.name} eliminado exitosamente`);
                      refetch();
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                      setDeletingUserId(null);
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
                      alert(errorMessage);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar Usuario
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-gray-900">Crear Nuevo Usuario</h3>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Nombre</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Teléfono</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Área</label>
                <input
                  type="text"
                  value={newUser.area}
                  onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Habilidades</label>
                <input
                  type="text"
                  value={newUser.skills}
                  onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUser({
                    name: '',
                    email: '',
                    phone: '',
                    area: '',
                    skills: '',
                    password: '',
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiPost('/users', newUser);
                    
                    // Store password in localStorage (same as RegisterPage)
                    localStorage.setItem(`user_pass_${newUser.email}`, newUser.password);
                    
                    alert('Usuario creado exitosamente');
                    refetch();
                    setShowCreateModal(false);
                    setNewUser({
                      name: '',
                      email: '',
                      phone: '',
                      area: '',
                      skills: '',
                      password: '',
                    });
                  } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
                    alert(errorMessage);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'admin_master':
      return Shield;
    case 'admin':
      return Shield;
    case 'volunteer':
      return UserCheck;
    default:
      return User;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin_master':
      return 'bg-orange-100 text-orange-700';
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'volunteer':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

function getRoleText(role: string) {
  switch (role) {
    case 'admin_master':
      return 'Admin Master';
    case 'admin':
      return 'Admin';
    case 'volunteer':
      return 'Voluntario';
    case 'user':
      return 'Usuario';
    default:
      return role;
  }
}