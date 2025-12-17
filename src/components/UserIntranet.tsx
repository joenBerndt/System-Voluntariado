import { useState, useEffect, useMemo } from 'react';
import { LogOut, User, Mail, Phone, MapPin, FileText, Clock, CheckCircle, XCircle, Calendar, Home, LayoutDashboard, Filter, Search, Briefcase, History, Video } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { ApplicationModal } from './ApplicationModal';
import { UnifiedProfile } from './UnifiedProfile';
import { ConvocatoriaDetail } from './ConvocatoriaDetail';
import { VolunteerInterviews } from './volunteer/VolunteerInterviews';
import { ApplicationProgressBar } from './ApplicationProgressBar';
import logoIIAP from '../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface UserIntranetProps {
  currentUser: any;
  onLogout: () => void;
  onBack?: () => void;
  onUserUpdate?: (user: any) => void;
  onBackToLanding?: () => void;
}

type SectionType = 'applications' | 'convocatorias' | 'interviews' | 'history' | 'profile';

export function UserIntranet({ currentUser, onLogout, onBackToLanding, onUserUpdate }: UserIntranetProps) {
  const [currentSection, setCurrentSection] = useState<SectionType>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const [viewConvocatoriaDetail, setViewConvocatoriaDetail] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: applicationsData, loading: loadingApplications, refetch: refetchApplications } = useApi<any[]>('/applications');
  const { data: convocatoriasData, loading: loadingConvocatorias } = useApi<any[]>('/convocatorias');
  const { data: areasData } = useApi<any[]>('/areas');

  // Filter applications for current user
  const myApplications = applicationsData?.filter(app => app.userEmail === currentUser.email) || [];

  // Filter interviews (applications with interview scheduled)
  const myInterviews = myApplications.filter(app =>
    app.status === 'interview_pending' ||
    app.status === 'interview_confirmed' ||
    (app.interviewDate && app.interviewDate !== '')
  );

  // Get activity history
  const activityHistory = useMemo(() => {
    const history: any[] = [];

    // Add applications to history
    myApplications.forEach(app => {
      history.push({
        id: `app-${app.id}`,
        type: 'application',
        date: app.appliedDate,
        title: `Postulación a "${app.convocatoriaTitle}"`,
        status: app.status,
        description: `Enviaste una postulación a la convocatoria ${app.convocatoriaTitle}`
      });

      // Add interview events
      if (app.interviewDate) {
        history.push({
          id: `interview-${app.id}`,
          type: 'interview',
          date: app.interviewDate,
          title: `Entrevista programada para "${app.convocatoriaTitle}"`,
          status: app.status,
          description: `Entrevista programada el ${new Date(app.interviewDate).toLocaleDateString('es-ES')} a las ${app.interviewTime || 'N/A'}`
        });
      }

      // Add status changes
      if (app.status === 'accepted') {
        history.push({
          id: `accepted-${app.id}`,
          type: 'accepted',
          date: app.acceptedDate || app.appliedDate,
          title: `Postulación aceptada: "${app.convocatoriaTitle}"`,
          status: 'accepted',
          description: `¡Felicitaciones! Tu postulación fue aceptada`
        });
      } else if (app.status === 'rejected') {
        history.push({
          id: `rejected-${app.id}`,
          type: 'rejected',
          date: app.rejectedDate || app.appliedDate,
          title: `Postulación rechazada: "${app.convocatoriaTitle}"`,
          status: 'rejected',
          description: app.rejectionReason || 'Tu postulación no fue aceptada en esta ocasión'
        });
      }
    });

    // Sort by date (most recent first)
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [myApplications]);

  // Filter available convocatorias
  const availableConvocatorias = useMemo(() => {
    let filtered = convocatoriasData?.filter(conv => conv.status === 'activa') || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Area filter
    if (selectedArea !== 'all') {
      filtered = filtered.filter(conv => conv.area === selectedArea);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(conv => {
        const endDate = new Date(conv.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (selectedDateRange === 'week') return diffDays <= 7 && diffDays >= 0;
        if (selectedDateRange === 'month') return diffDays <= 30 && diffDays >= 0;
        return true;
      });
    }

    return filtered;
  }, [convocatoriasData, searchTerm, selectedArea, selectedDateRange]);

  // Check if user already applied to a convocatoria
  const hasApplied = (convocatoriaId: string) => {
    return myApplications.some(app => app.convocatoriaId === convocatoriaId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm border-2 border-amber-200 font-semibold">
            <Clock className="w-4 h-4" />
            Pendiente
          </span>
        );
      case 'interview_pending':
      case 'interview_confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm border-2 border-purple-200 font-semibold">
            <Video className="w-4 h-4" />
            Entrevista Programada
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm border-2 border-emerald-200 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Aceptada
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm border-2 border-red-200 font-semibold">
            <XCircle className="w-4 h-4" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { id: 'applications' as const, label: 'Mis Postulaciones', icon: FileText },
    { id: 'convocatorias' as const, label: 'Convocatorias Disponibles', icon: Briefcase },
    { id: 'interviews' as const, label: 'Mis Entrevistas', icon: Video, badge: myInterviews.length },
    // { id: 'history' as const, label: 'Historial', icon: History },
    { id: 'profile' as const, label: 'Mi Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-emerald-100 px-8 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoIIAP} alt="IIAP Logo" className="h-14 w-auto" />
            <div className="border-l-2 border-emerald-600 pl-4">
              <h1 className="text-gray-900">Mi Portal - IIAP</h1>
              <p className="text-gray-600 text-sm">Sistema de Gestión de Voluntariado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium border-2 border-emerald-200 hover:border-emerald-300"
              >
                <Home className="w-5 h-5" />
                <span>Volver al Landing</span>
              </button>
            )}
            <div className="text-right border-r-2 border-gray-200 pr-4">
              <p className="text-gray-900 font-semibold">{currentUser?.name}</p>
              <p className="text-gray-600 text-sm">Usuario Registrado</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border-2 border-transparent hover:border-red-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-emerald-100 min-h-[calc(100vh-73px)] shadow-sm">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${currentSection === item.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentSection === item.id
                      ? 'bg-white text-emerald-700'
                      : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* MIS POSTULACIONES */}
          {currentSection === 'applications' && (
            <div>
              <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Mis Postulaciones</h2>
                <p className="text-gray-600">Revisa el estado de tus postulaciones a convocatorias</p>
              </div>

              {/* Filters */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg border-2 border-emerald-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Filter className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-700 font-semibold mb-2 block">Filtrar por estado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="pending">Pendiente</option>
                      <option value="interview_pending">Con entrevista</option>
                      <option value="accepted">Aceptadas</option>
                      <option value="rejected">Rechazadas</option>
                    </select>
                  </div>
                </div>
              </div>

              {loadingApplications ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="text-gray-600 mt-4">Cargando postulaciones...</p>
                </div>
              ) : myApplications.filter(app => selectedStatus === 'all' || app.status === selectedStatus).length > 0 ? (
                <div className="space-y-6">
                  {myApplications.filter(app => selectedStatus === 'all' || app.status === selectedStatus).map((application) => (
                    <div
                      key={application.id}
                      className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-xl"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-100">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-3">{application.convocatoriaTitle}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="bg-teal-100 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-teal-700" />
                            </div>
                            <span className="font-medium">
                              Postulado el {new Date(application.appliedDate).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      {/* Content */}
                      <div className="space-y-4 mb-6">
                        {/* Progress Bar */}
                        <ApplicationProgressBar status={application.status} />

                        <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border-2 border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <FileText className="w-4 h-4 text-purple-700" />
                            </div>
                            <p className="text-gray-800 font-semibold">Motivación</p>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{application.motivation}</p>
                        </div>
                        {application.experience && (
                          <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border-2 border-amber-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <Briefcase className="w-4 h-4 text-amber-700" />
                              </div>
                              <p className="text-gray-800 font-semibold">Experiencia</p>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{application.experience}</p>
                          </div>
                        )}
                      </div>

                      {/* Interview Info */}
                      {(application.status === 'interview_pending' || application.status === 'interview_confirmed') && application.interviewDate && (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 mb-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                              <Video className="w-6 h-6 text-purple-700" />
                            </div>
                            <p className="text-purple-900 font-semibold">Entrevista Programada</p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-white p-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-purple-900 font-medium text-sm mb-1">Fecha</p>
                                <p className="text-purple-800">{new Date(application.interviewDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                            </div>
                            {application.interviewTime && (
                              <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded-lg">
                                  <Clock className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-purple-900 font-medium text-sm mb-1">Hora</p>
                                  <p className="text-purple-800">{application.interviewTime}</p>
                                </div>
                              </div>
                            )}
                            {application.interviewLocation && (
                              <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded-lg">
                                  <MapPin className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-purple-900 font-medium text-sm mb-1">Lugar</p>
                                  <p className="text-purple-800">{application.interviewLocation}</p>
                                </div>
                              </div>
                            )}
                            {application.interviewNotes && (
                              <div className="bg-white p-4 rounded-lg mt-3">
                                <p className="text-purple-900 font-medium mb-2">Notas adicionales:</p>
                                <p className="text-purple-800">{application.interviewNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {application.status === 'accepted' && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                              <CheckCircle className="w-6 h-6 text-emerald-700" />
                            </div>
                            <p className="text-emerald-900 font-semibold">🎉 ¡Felicitaciones!</p>
                          </div>
                          <p className="text-emerald-800 leading-relaxed">
                            Tu postulación ha sido aceptada. Pronto serás contactado con más información.
                          </p>
                        </div>
                      )}

                      {application.status === 'rejected' && application.rejectionReason && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-red-100 p-3 rounded-lg">
                              <XCircle className="w-6 h-6 text-red-700" />
                            </div>
                            <p className="text-red-900 font-semibold">Motivo del rechazo</p>
                          </div>
                          <p className="text-red-800 leading-relaxed">{application.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg p-12 text-center border-2 border-emerald-100">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileText className="w-12 h-12 text-emerald-700" />
                  </div>
                  <h3 className="text-gray-900 mb-3">No tienes postulaciones</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Aún no has postulado a ninguna convocatoria. Explora las oportunidades disponibles y comienza tu camino como voluntario.
                  </p>
                  <button
                    onClick={() => setCurrentSection('convocatorias')}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg font-medium hover:shadow-xl inline-flex items-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    Ver Convocatorias Disponibles
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CONVOCATORIAS DISPONIBLES */}
          {currentSection === 'convocatorias' && (
            viewConvocatoriaDetail ? (
              <ConvocatoriaDetail
                convocatoria={viewConvocatoriaDetail}
                onBack={() => setViewConvocatoriaDetail(null)}
              />
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-gray-900 mb-2">Convocatorias Disponibles</h2>
                  <p className="text-gray-600">Explora y postula a las convocatorias activas</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm mb-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar convocatorias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    {/* Area Filter */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Briefcase className="text-gray-500 w-5 h-5" />
                      </div>
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white appearance-none"
                      >
                        <option value="all">Todas las áreas</option>
                        {areasData?.filter(a => a.published).map(area => (
                          <option key={area.id} value={area.name}>{area.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Calendar className="text-gray-500 w-5 h-5" />
                      </div>
                      <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white appearance-none"
                      >
                        <option value="all">Cualquier fecha</option>
                        <option value="week">Próximos 7 días</option>
                        <option value="month">Próximos 30 días</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">
                      {availableConvocatorias.length} convocatoria{availableConvocatorias.length !== 1 ? 's' : ''} encontrada{availableConvocatorias.length !== 1 ? 's' : ''}
                    </p>
                    {(searchTerm || selectedArea !== 'all' || selectedDateRange !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedArea('all');
                          setSelectedDateRange('all');
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                {/* Convocatorias List */}
                {loadingConvocatorias ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <p className="text-gray-600 mt-4">Cargando convocatorias...</p>
                  </div>
                ) : availableConvocatorias.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableConvocatorias.map((convocatoria) => {
                      const alreadyApplied = hasApplied(convocatoria.id);
                      const daysLeft = Math.ceil((new Date(convocatoria.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isClosingSoon = daysLeft <= 7 && daysLeft > 0;

                      return (
                        <div
                          key={convocatoria.id}
                          className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 h-full flex flex-col ${isClosingSoon ? 'border-amber-300' : 'border-gray-100 hover:border-emerald-300'}`}
                        >
                          <div className={`h-3 shrink-0 ${isClosingSoon ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}></div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-gray-900 mb-2 font-bold text-lg group-hover:text-emerald-700 transition-colors line-clamp-2">{convocatoria.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 mb-3">{convocatoria.description}</p>
                              </div>
                              {isClosingSoon ? (
                                <span className="shrink-0 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 ml-2 whitespace-nowrap">
                                  ¡Cierra pronto!
                                </span>
                              ) : (
                                <span className="shrink-0 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 ml-2 whitespace-nowrap">
                                  Activa
                                </span>
                              )}
                            </div>

                            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 flex-grow">
                              <div className="flex items-start gap-3 text-gray-800">
                                <div className="bg-emerald-100 p-2 rounded-lg shadow-sm shrink-0">
                                  <MapPin className="w-4 h-4 text-emerald-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Área</p>
                                  <p className="text-sm font-semibold truncate" title={convocatoria.area}>{convocatoria.area}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 text-gray-800">
                                <div className="bg-teal-100 p-2 rounded-lg shadow-sm shrink-0">
                                  <Calendar className="w-4 h-4 text-teal-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Cierre</p>
                                  <p className={`text-sm font-semibold truncate ${isClosingSoon ? 'text-amber-700' : ''}`}>
                                    {new Date(convocatoria.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 text-gray-800">
                                <div className="bg-purple-100 p-2 rounded-lg shadow-sm shrink-0">
                                  <User className="w-4 h-4 text-purple-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Vacantes</p>
                                  <p className="text-sm font-semibold">{convocatoria.vacancies - (convocatoria.acceptedCount || 0)} disponibles</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setViewConvocatoriaDetail(convocatoria)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-all font-bold text-sm"
                              >
                                Ver más
                              </button>

                              {alreadyApplied ? (
                                <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm cursor-default border-2 border-gray-200">
                                  Ya postulaste
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedConvocatoria(convocatoria);
                                    setShowApplicationModal(true);
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all font-bold text-sm"
                                >
                                  Postular
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 mb-2">No se encontraron convocatorias</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedArea !== 'all' || selectedDateRange !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'No hay convocatorias activas en este momento'}
                    </p>
                  </div>
                )}
              </div>
            )
          )}

          {/* MIS ENTREVISTAS */}
          {currentSection === 'interviews' && (
            <VolunteerInterviews
              interviews={myInterviews}
              convocatorias={convocatoriasData || []}
            />
          )}

          {/* HISTORIAL */}
          {currentSection === 'history' && (
            <div>
              <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Historial de Actividad</h2>
                <p className="text-gray-600">Revisa todas tus acciones en el sistema</p>
              </div>

              {activityHistory.length > 0 ? (
                <div className="space-y-4">
                  {activityHistory.map((activity) => {
                    let icon, bgColor, borderColor, textColor;

                    switch (activity.type) {
                      case 'application':
                        icon = <FileText className="w-5 h-5" />;
                        bgColor = 'bg-emerald-100';
                        borderColor = 'border-emerald-200';
                        textColor = 'text-emerald-700';
                        break;
                      case 'interview':
                        icon = <Video className="w-5 h-5" />;
                        bgColor = 'bg-purple-100';
                        borderColor = 'border-purple-200';
                        textColor = 'text-purple-700';
                        break;
                      case 'accepted':
                        icon = <CheckCircle className="w-5 h-5" />;
                        bgColor = 'bg-emerald-100';
                        borderColor = 'border-emerald-200';
                        textColor = 'text-emerald-700';
                        break;
                      case 'rejected':
                        icon = <XCircle className="w-5 h-5" />;
                        bgColor = 'bg-red-100';
                        borderColor = 'border-red-200';
                        textColor = 'text-red-700';
                        break;
                      default:
                        icon = <Clock className="w-5 h-5" />;
                        bgColor = 'bg-gray-100';
                        borderColor = 'border-gray-200';
                        textColor = 'text-gray-700';
                    }

                    return (
                      <div
                        key={activity.id}
                        className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`${bgColor} p-3 rounded-lg ${textColor}`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-gray-900">{activity.title}</h3>
                              <span className="text-sm text-gray-500">
                                {new Date(activity.date).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 mb-2">Sin actividad registrada</h3>
                  <p className="text-gray-600">
                    Tu historial de actividades aparecerá aquí
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MI PERFIL */}
          {currentSection === 'profile' && (
            <UnifiedProfile
              user={currentUser}
              onUpdate={(updatedUser) => {
                // Update current user in parent component if needed
                if (onUserUpdate) {
                  onUserUpdate(updatedUser);
                }
              }}
              applicationsData={applicationsData || []}
              showStats={true}
            />
          )}
        </main>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedConvocatoria && (
        <ApplicationModal
          convocatoria={selectedConvocatoria}
          currentUser={currentUser}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedConvocatoria(null);
          }}
          onSuccess={() => {
            refetchApplications();
            setShowApplicationModal(false);
            setSelectedConvocatoria(null);
          }}
        />
      )}
    </div>
  );
}