import { useState, useMemo } from 'react';
import {
  Activity, Filter, Search, UserPlus, FileText, Key, BookOpen, Layers,
  Clock, CheckCircle, Briefcase, MapPin, ChevronLeft, ChevronRight, Calendar, Users
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';


export function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch real activity logs (Read-Only)
  const { data: logsData } = useApi<any[]>('/activity-logs');
  const logs = logsData || [];

  const getIconAndColor = (type: string, action: string) => {
    switch (type) {
      case 'user':
      case 'volunteer':
        return { icon: UserPlus, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' };
      case 'auth':
        const isFail = action.includes('Fallido');
        return {
          icon: Key,
          color: isFail ? 'text-red-700' : 'text-green-700',
          bg: isFail ? 'bg-red-100' : 'bg-green-100',
          border: isFail ? 'border-red-200' : 'border-green-200'
        };
      case 'project':
        return { icon: Briefcase, color: 'text-teal-700', bg: 'bg-teal-100', border: 'border-teal-200' };
      case 'assignment':
        return { icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' };
      case 'convocatoria':
        return { icon: Layers, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' };
      case 'application':
        return { icon: FileText, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' };
      case 'area':
        return { icon: MapPin, color: 'text-pink-700', bg: 'bg-pink-100', border: 'border-pink-200' };
      case 'training':
        return { icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' };
      default:
        return { icon: Activity, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  const parseDetails = (details: any) => {
    if (!details) return <span className="text-gray-400 italic text-xs">-</span>;
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      if (typeof parsed !== 'object') return String(parsed);

      return (
        <div className="flex flex-wrap gap-1 text-xs">
          {Object.entries(parsed).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) return null;
            const label = key === 'name' ? 'Nombre' :
              key === 'email' ? 'Email' :
                key === 'role' ? 'Rol' :
                  key === 'oldRole' ? 'Anterior' :
                    key === 'newRole' ? 'Nuevo' :
                      key === 'title' ? 'Título' : key;

            return (
              <span key={key} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 shadow-sm whitespace-nowrap">
                <span className="font-semibold text-gray-700">{label}:</span>
                <span className="truncate max-w-[100px]">{String(value)}</span>
              </span>
            );
          })}
        </div>
      );
    } catch (e) {
      return <span className="text-gray-500 italic text-xs truncate max-w-[200px]">{String(details)}</span>;
    }
  };

  const activities = useMemo(() => {
    return logs.map(log => {
      const { icon, color, bg, border } = getIconAndColor(log.entityType, log.action);
      return {
        id: log.id,
        type: log.entityType,
        action: log.action,
        description: log.description,
        user: log.userName || 'Sistema',
        userEmail: log.userEmail || '',
        timestamp: new Date(log.timestamp),
        icon,
        color,
        bg,
        border,
        details: log.details
      };
    });
  }, [logs]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.userEmail === filterUser;

    return matchesSearch && matchesType && matchesUser;
  });

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    activities.forEach(activity => {
      if (activity.userEmail && !userMap.has(activity.userEmail)) {
        userMap.set(activity.userEmail, activity.user);
      }
    });
    return Array.from(userMap.entries()).map(([email, name]) => ({ email, name }));
  }, [activities]);

  const typeOptions = [
    { value: 'all', label: 'Todas las actividades' },
    { value: 'auth', label: 'Autenticación' },
    { value: 'user', label: 'Usuarios' },
    { value: 'volunteer', label: 'Voluntarios' },
    { value: 'project', label: 'Proyectos' },
    { value: 'assignment', label: 'Asignaciones' },
    { value: 'convocatoria', label: 'Convocatorias' },
    { value: 'application', label: 'Postulaciones' },
    { value: 'area', label: 'Áreas' },
    { value: 'training', label: 'Capacitación' },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 -z-10 opacity-5 pointer-events-none">
        <Activity className="w-96 h-96 text-emerald-900" />
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Actividad</h2>
        <p className="text-gray-500 mt-1">Monitoreo y auditoría de todas las operaciones del sistema</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total', 'Postulaciones', 'Usuarios', 'Alertas'].map((label, i) => {
          let count = 0;
          let icon = Activity;
          let colorClass = 'text-gray-700';
          let bgClass = 'bg-white';
          let borderClass = 'border-gray-200';

          if (label === 'Total') {
            count = activities.length;
            colorClass = 'text-emerald-600';
            bgClass = 'bg-emerald-50';
            borderClass = 'border-emerald-100';
          } else if (label === 'Postulaciones') {
            count = activities.filter(a => a.type === 'application').length;
            icon = FileText;
            colorClass = 'text-purple-600';
            bgClass = 'bg-purple-50';
            borderClass = 'border-purple-100';
          } else if (label === 'Usuarios') {
            count = activities.filter(a => a.type === 'user' || a.type === 'volunteer').length;
            icon = Users;
            colorClass = 'text-blue-600';
            bgClass = 'bg-blue-50';
            borderClass = 'border-blue-100';
          } else {
            // Alerts = Failed auth
            count = activities.filter(a => a.action.includes('Fallido')).length;
            icon = Key;
            colorClass = 'text-amber-600';
            bgClass = 'bg-amber-50';
            borderClass = 'border-amber-100';
          }

          const Icon = icon;

          return (
            <div key={label} className={`${bgClass} p-5 rounded-xl border ${borderClass} shadow-sm transition-transform hover:-translate-y-1 duration-300`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{label}</p>
                  <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
                </div>
                <div className={`p-2 rounded-lg bg-white/60 backdrop-blur-sm`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar actividad..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-gray-50/50 focus:bg-white"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer hover:border-emerald-400 transition-colors appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer hover:border-emerald-400 transition-colors appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="all">Todos los usuarios</option>
            {uniqueUsers.map(user => (
              <option key={user.email} value={user.email}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 w-1/5">Actividad</th>
                <th className="px-6 py-4 w-1/5">Usuario</th>
                <th className="px-6 py-4 w-2/5">Descripción</th>
                <th className="px-6 py-4 w-1/6">Detalles</th>
                <th className="px-6 py-4 w-24 text-center">Fecha</th>
                <th className="px-6 py-4 w-24 text-center">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  const itemIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={activity.id} className="hover:bg-emerald-50/30 transition-colors group duration-150">

                      {/* # Index */}
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-400">
                        {String(itemIndex).padStart(2, '0')}
                      </td>

                      {/* Activity Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${activity.bg} ${activity.border} border shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{activity.action}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 ring-1 ring-gray-100 shadow-sm">
                            {activity.user.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 leading-none">{activity.user}</span>
                            <span className="text-[10px] text-gray-400">{activity.userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">{activity.description}</p>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4">
                        {parseDetails(activity.details)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 rounded-md bg-white border border-gray-100 text-xs font-medium text-gray-500 shadow-sm">
                          {activity.timestamp.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-mono text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          {activity.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3 opacity-60">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Layers className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="font-medium text-lg">Sin resultados</p>
                      <p className="text-sm">No se encontraron actividades en esta vista.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">
              Página <span className="font-bold text-gray-800">{currentPage}</span> de <span className="font-bold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm flex items-center gap-1"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
