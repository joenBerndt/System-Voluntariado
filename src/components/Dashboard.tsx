import { Users, Megaphone, CheckCircle, Clock, UserCircle, UserCheck, FileText, Briefcase, FolderOpen, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface DashboardProps {
  currentUser?: any;
  onNavigate: (section: any) => void;
}

export function Dashboard({ currentUser, onNavigate }: DashboardProps) {
  const { data: volunteersData, loading: loadingVolunteers } = useApi<any[]>('/volunteers');
  const { data: convocatoriasData, loading: loadingConvocatorias } = useApi<any[]>('/convocatorias');
  const { data: usersData, loading: loadingUsers } = useApi<any[]>('/users');
  const { data: applicationsData, loading: loadingApplications } = useApi<any[]>('/applications');
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');

  const volunteers = volunteersData || [];
  const convocatorias = convocatoriasData || [];
  const users = usersData || [];
  const applications = applicationsData || [];
  const projects = projectsData || [];
  const areas = areasData || [];

  const isAdminMaster = currentUser?.role === 'admin_master';
  const isAdmin = currentUser?.role === 'admin';

  // Total users count (all users in the system)
  const totalUsers = users.length;

  // Separate users by role
  const regularUsers = users.filter(u => u.role === 'user'); // Users who can apply
  const volunteerUsers = users.filter(u => u.role === 'volunteer'); // Active volunteers
  const adminUsers = users.filter(u => u.role === 'admin'); // Admins
  const adminMasterUsers = users.filter(u => u.role === 'admin_master'); // Admin masters

  // Application stats
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const interviewPendingApplications = applications.filter(a => a.status === 'interview_pending').length;
  const interviewConfirmedApplications = applications.filter(a => a.status === 'interview_confirmed').length;

  // Active convocatorias
  const activeConvocatorias = convocatorias.filter(c => c.status === 'activa').length;

  // Admin Master Stats (Full Access)
  const adminMasterStats = [
    {
      label: 'Usuarios Totales',
      value: totalUsers,
      icon: Users,
      color: 'from-gray-600 to-gray-700',
      description: 'Todos los usuarios del sistema',
      action: 'users'
    },
    {
      label: 'Usuarios Registrados',
      value: regularUsers.length,
      icon: UserCircle,
      color: 'from-blue-600 to-blue-700',
      description: 'Pueden postular a convocatorias',
      action: 'users'
    },
    {
      label: 'Voluntarios Activos',
      value: volunteerUsers.length,
      icon: UserCheck,
      color: 'from-emerald-600 to-emerald-700',
      description: 'Postulantes aceptados',
      action: 'volunteers'
    },
    {
      label: 'Postulaciones Pendientes',
      value: pendingApplications,
      icon: FileText,
      color: 'from-amber-600 to-amber-700',
      description: 'Esperando revisión',
      action: 'applications'
    },
    {
      label: 'Entrevistas Pendientes',
      value: interviewPendingApplications,
      icon: Calendar,
      color: 'from-orange-600 to-orange-700',
      description: 'Entrevistas programadas',
      action: 'applications'
    },
    {
      label: 'Convocatorias Activas',
      value: activeConvocatorias,
      icon: Megaphone,
      color: 'from-teal-600 to-teal-700',
      description: 'Abiertas para postular',
      action: 'convocatorias'
    },
    {
      label: 'Proyectos Totales',
      value: projects.length,
      icon: FolderOpen,
      color: 'from-indigo-600 to-indigo-700',
      description: 'Proyectos registrados',
      action: 'projects'
    },
    {
      label: 'Áreas Totales',
      value: areas.length,
      icon: Briefcase,
      color: 'from-purple-600 to-purple-700',
      description: 'Áreas de trabajo',
      action: 'areas'
    },
  ];

  // Admin Stats (Limited Access)
  const adminStats = [
    {
      label: 'Postulaciones Pendientes',
      value: pendingApplications,
      icon: FileText,
      color: 'from-amber-600 to-amber-700',
      description: 'Esperando revisión',
      action: 'applications'
    },
    {
      label: 'Voluntarios Activos',
      value: volunteerUsers.length,
      icon: UserCheck,
      color: 'from-emerald-600 to-emerald-700',
      description: 'Postulantes aceptados',
      action: 'volunteers'
    },
    {
      label: 'Entrevistas Pendientes',
      value: interviewPendingApplications,
      icon: Calendar,
      color: 'from-orange-600 to-orange-700',
      description: 'Entrevistas programadas',
      action: 'applications'
    },
    {
      label: 'Convocatorias Activas',
      value: activeConvocatorias,
      icon: Megaphone,
      color: 'from-teal-600 to-teal-700',
      description: 'Abiertas para postular',
      action: 'convocatorias'
    },
  ];

  const stats = isAdminMaster ? adminMasterStats : adminStats;

  const recentConvocatorias = convocatorias.slice(0, 5);
  const recentUsers = users.slice(-5).reverse();

  if (loadingVolunteers || loadingConvocatorias || loadingUsers || loadingApplications) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h2>
        <p className="text-gray-500 mt-1">Vista general del sistema de voluntariado</p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdminMaster ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-6`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => onNavigate(stat.action)}
              className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl text-left w-full group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-900 text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-900 mb-1 font-semibold">{stat.label}</p>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Application Process Stats */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-lg">
        <h3 className="text-gray-900 mb-4">Estado del Proceso de Postulaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border-2 border-orange-200">
            <p className="text-orange-900 text-3xl mb-1 font-bold">{interviewPendingApplications}</p>
            <p className="text-orange-800 font-medium">Entrevistas Programadas</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200">
            <p className="text-purple-900 text-3xl mb-1 font-bold">{interviewConfirmedApplications}</p>
            <p className="text-purple-800 font-medium">Entrevistas Confirmadas</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200">
            <p className="text-blue-900 text-3xl mb-1 font-bold">{projects.length}</p>
            <p className="text-blue-800 font-medium">Proyectos Activos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Convocatorias */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Convocatorias Recientes</h3>
          <div className="space-y-3">
            {recentConvocatorias.length > 0 ? (
              recentConvocatorias.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-900">{conv.title}</p>
                    <p className="text-gray-500 text-sm">{conv.area}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${conv.status === 'activa'
                      ? 'bg-green-100 text-green-700'
                      : conv.status === 'cerrada'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}
                  >
                    {conv.status === 'activa' ? 'Activa' : conv.status === 'cerrada' ? 'Cerrada' : 'En Proceso'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay convocatorias aún</p>
            )}
          </div>
        </div>

        {/* Recent Users/Volunteers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-gray-900 mb-4">Usuarios Recientes</h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'volunteer' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                      <span className={user.role === 'volunteer' ? 'text-green-600' : 'text-blue-600'}>
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${user.role === 'volunteer'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}
                  >
                    {user.role === 'volunteer' ? 'Voluntario' : 'Usuario'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay usuarios aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}