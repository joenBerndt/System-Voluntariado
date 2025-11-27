import { useState, useMemo } from 'react';
import { Activity, Filter, Search, UserPlus, UserMinus, Edit, Trash2, FileText, Video, CheckCircle, XCircle, Calendar, User, Users, Briefcase, MapPin, Info, Clock, ArrowUpCircle, ArrowDownCircle, Plus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  
  // Fetch all data to construct activity log
  const { data: usersData } = useApi<any[]>('/users');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: convocatoriasData } = useApi<any[]>('/convocatorias');
  const { data: applicationsData } = useApi<any[]>('/applications');
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: aboutData } = useApi<any>('/about');
  const { data: interviewsData } = useApi<any[]>('/interviews');

  const users = usersData || [];
  const volunteers = volunteersData || [];
  const convocatorias = convocatoriasData || [];
  const applications = applicationsData || [];
  const projects = projectsData || [];
  const areas = areasData || [];
  const interviews = interviewsData || [];

  // Construct activity log from all data
  const activities = useMemo(() => {
    const allActivities: any[] = [];

    // User registrations and role changes
    users.forEach(user => {
      if (user.createdAt) {
        allActivities.push({
          id: `user-create-${user.id}`,
          type: 'user_create',
          action: 'Usuario Registrado',
          description: `${user.name} se registró en el sistema`,
          user: user.name,
          userEmail: user.email,
          timestamp: new Date(user.createdAt),
          icon: UserPlus,
          color: 'emerald',
        });
      }

      if (user.roleChangedAt) {
        allActivities.push({
          id: `user-role-${user.id}`,
          type: 'user_role_change',
          action: 'Cambio de Rol',
          description: `${user.name} fue promovido/degradado a ${user.role === 'admin_master' ? 'Admin Master' : user.role === 'admin' ? 'Administrador' : user.role === 'volunteer' ? 'Voluntario' : 'Usuario'}`,
          user: user.name,
          userEmail: user.email,
          timestamp: new Date(user.roleChangedAt),
          icon: user.role === 'admin_master' || user.role === 'admin' || user.role === 'volunteer' ? ArrowUpCircle : ArrowDownCircle,
          color: user.role === 'admin_master' || user.role === 'admin' || user.role === 'volunteer' ? 'teal' : 'amber',
        });
      }
    });

    // Applications
    applications.forEach(app => {
      allActivities.push({
        id: `app-${app.id}`,
        type: 'application',
        action: 'Nueva Postulación',
        description: `${app.userName} postuló a "${app.convocatoriaTitle}"`,
        user: app.userName,
        userEmail: app.userEmail,
        timestamp: new Date(app.appliedDate),
        icon: FileText,
        color: 'purple',
        details: `Estado: ${app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Aceptada' : app.status === 'rejected' ? 'Rechazada' : 'En proceso'}`,
      });

      // Application status changes
      if (app.statusChangedAt && app.status !== 'pending') {
        allActivities.push({
          id: `app-status-${app.id}`,
          type: 'application_status',
          action: `Postulación ${app.status === 'accepted' ? 'Aceptada' : app.status === 'rejected' ? 'Rechazada' : 'Actualizada'}`,
          description: `La postulación de ${app.userName} fue ${app.status === 'accepted' ? 'aceptada' : app.status === 'rejected' ? 'rechazada' : 'actualizada'}`,
          user: app.userName,
          userEmail: app.userEmail,
          timestamp: new Date(app.statusChangedAt),
          icon: app.status === 'accepted' ? CheckCircle : app.status === 'rejected' ? XCircle : Edit,
          color: app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'amber',
        });
      }
    });

    // Interviews
    interviews.forEach(interview => {
      if (interview.createdAt) {
        allActivities.push({
          id: `interview-${interview.id}`,
          type: 'interview',
          action: 'Entrevista Programada',
          description: `Entrevista programada para ${interview.applicantName}`,
          user: interview.applicantName,
          userEmail: interview.applicantEmail,
          timestamp: new Date(interview.createdAt),
          icon: Video,
          color: 'indigo',
          details: `Fecha: ${new Date(interview.date).toLocaleDateString('es-ES')} - ${interview.time || 'Hora no especificada'}`,
        });
      }
    });

    // Convocatorias
    convocatorias.forEach(conv => {
      if (conv.createdAt) {
        allActivities.push({
          id: `conv-create-${conv.id}`,
          type: 'convocatoria_create',
          action: 'Convocatoria Creada',
          description: `"${conv.title}" fue creada`,
          user: 'Sistema',
          userEmail: 'sistema@iiap.com',
          timestamp: new Date(conv.createdAt),
          icon: Plus,
          color: 'emerald',
          details: `Vacantes: ${conv.vacancies}`,
        });
      }

      if (conv.updatedAt && conv.updatedAt !== conv.createdAt) {
        allActivities.push({
          id: `conv-edit-${conv.id}-${conv.updatedAt}`,
          type: 'convocatoria_edit',
          action: 'Convocatoria Editada',
          description: `"${conv.title}" fue editada`,
          user: 'Sistema',
          userEmail: 'sistema@iiap.com',
          timestamp: new Date(conv.updatedAt),
          icon: Edit,
          color: 'amber',
        });
      }
    });

    // Projects
    projects.forEach(project => {
      if (project.createdAt) {
        allActivities.push({
          id: `project-create-${project.id}`,
          type: 'project_create',
          action: 'Proyecto Creado',
          description: `"${project.name}" fue creado`,
          user: 'Sistema',
          userEmail: 'sistema@iiap.com',
          timestamp: new Date(project.createdAt),
          icon: Briefcase,
          color: 'teal',
        });
      }

      if (project.publishedAt && project.published) {
        allActivities.push({
          id: `project-publish-${project.id}`,
          type: 'project_publish',
          action: 'Proyecto Publicado',
          description: `"${project.name}" fue publicado en el landing`,
          user: 'Sistema',
          userEmail: 'sistema@iiap.com',
          timestamp: new Date(project.publishedAt),
          icon: CheckCircle,
          color: 'green',
        });
      }
    });

    // Areas
    areas.forEach(area => {
      if (area.createdAt) {
        allActivities.push({
          id: `area-create-${area.id}`,
          type: 'area_create',
          action: 'Área Creada',
          description: `"${area.name}" fue creada`,
          user: 'Sistema',
          userEmail: 'sistema@iiap.com',
          timestamp: new Date(area.createdAt),
          icon: MapPin,
          color: 'purple',
        });
      }
    });

    // Sort by timestamp (most recent first)
    return allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [users, applications, interviews, convocatorias, projects, areas]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type.startsWith(filterType);
    const matchesUser = filterUser === 'all' || activity.userEmail === filterUser;

    return matchesSearch && matchesType && matchesUser;
  });

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    activities.forEach(activity => {
      if (!userMap.has(activity.userEmail)) {
        userMap.set(activity.userEmail, activity.user);
      }
    });
    return Array.from(userMap.entries()).map(([email, name]) => ({ email, name }));
  }, [activities]);

  // Activity type options
  const typeOptions = [
    { value: 'all', label: 'Todas las actividades' },
    { value: 'user', label: 'Usuarios' },
    { value: 'application', label: 'Postulaciones' },
    { value: 'interview', label: 'Entrevistas' },
    { value: 'convocatoria', label: 'Convocatorias' },
    { value: 'project', label: 'Proyectos' },
    { value: 'area', label: 'Áreas' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'teal':
        return {
          bg: 'bg-teal-100',
          text: 'text-teal-700',
          border: 'border-teal-200',
          gradient: 'from-teal-500 to-cyan-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-200',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          gradient: 'from-amber-500 to-orange-600',
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          gradient: 'from-green-500 to-emerald-600',
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          gradient: 'from-red-500 to-red-600',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          gradient: 'from-indigo-500 to-purple-600',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          gradient: 'from-gray-500 to-gray-600',
        };
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Historial de Actividad</h2>
        <p className="text-gray-600">Registro completo de todas las actividades del sistema</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border-2 border-emerald-100 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Total</p>
              <p className="text-2xl font-bold text-emerald-700">{activities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border-2 border-purple-100 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Postulaciones</p>
              <p className="text-2xl font-bold text-purple-700">
                {activities.filter(a => a.type.startsWith('application')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border-2 border-teal-100 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Usuarios</p>
              <p className="text-2xl font-bold text-teal-700">
                {activities.filter(a => a.type.startsWith('user')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border-2 border-indigo-100 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Video className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Entrevistas</p>
              <p className="text-2xl font-bold text-indigo-700">
                {activities.filter(a => a.type === 'interview').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border-2 border-emerald-100 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-gray-700 font-semibold mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar actividad..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipo de Actividad</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                <option value="all">Todos los usuarios</option>
                {uniqueUsers.map(user => (
                  <option key={user.email} value={user.email}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = activity.icon;
              const colors = getColorClasses(activity.color);

              return (
                <div
                  key={activity.id}
                  className="flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Icon */}
                  <div className={`${colors.bg} p-3 rounded-xl h-fit`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-gray-900 font-semibold">{activity.action}</h4>
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                        {activity.details && (
                          <p className="text-gray-500 text-sm mt-2">{activity.details}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">
                          {activity.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{activity.user}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 text-sm">
                        {activity.timestamp.toLocaleString('es-ES', { 
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No hay actividades</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterUser !== 'all'
                ? 'No se encontraron actividades con los filtros aplicados'
                : 'Aún no hay actividades registradas en el sistema'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
