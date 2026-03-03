import { useState, useMemo } from 'react';
import { LogOut, User, FileText, Clock, CheckCircle, XCircle, Home, Briefcase, Video, History } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { ApplicationModal } from '../components/common/ApplicationModal';
import { UnifiedProfile } from '../components/common/UnifiedProfile';
import { VolunteerInterviews } from '../components/volunteer/VolunteerInterviews';
import logoIIAP from '../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

// New Components
import { MyApplications } from '../components/user/MyApplications';
import { AvailableConvocatorias } from '../components/user/AvailableConvocatorias';
import { ActivityHistory } from '../components/user/ActivityHistory';

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
  const { convocatorias: convocatoriasData, loading: loadingConvocatorias } = useConvocatorias();
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
    myApplications.forEach(app => {
      history.push({
        id: `app-${app.id}`,
        type: 'application',
        date: app.appliedDate,
        title: `Postulación a "${app.convocatoriaTitle}"`,
        status: app.status,
        description: `Enviaste una postulación a la convocatoria ${app.convocatoriaTitle}`
      });

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
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [myApplications]);

  // Filter available convocatorias
  const availableConvocatorias = useMemo(() => {
    let filtered = convocatoriasData?.filter(conv => conv.status === 'activa') || [];
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedArea !== 'all') {
      filtered = filtered.filter(conv => conv.area === selectedArea);
    }
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

        <main className="flex-1 p-8">
          {currentSection === 'applications' && (
            <MyApplications
              loadingApplications={loadingApplications}
              myApplications={myApplications}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              getStatusBadge={getStatusBadge}
              setCurrentSection={setCurrentSection}
            />
          )}

          {currentSection === 'convocatorias' && (
            <AvailableConvocatorias
              viewConvocatoriaDetail={viewConvocatoriaDetail}
              setViewConvocatoriaDetail={setViewConvocatoriaDetail}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              areasData={areasData || []}
              availableConvocatorias={availableConvocatorias}
              loadingConvocatorias={loadingConvocatorias}
              hasApplied={hasApplied}
              setSelectedConvocatoria={setSelectedConvocatoria}
              setShowApplicationModal={setShowApplicationModal}
            />
          )}

          {currentSection === 'interviews' && (
            <VolunteerInterviews
              interviews={myInterviews}
              convocatorias={convocatoriasData || []}
            />
          )}

          {currentSection === 'history' && (
            <ActivityHistory activityHistory={activityHistory} />
          )}

          {currentSection === 'profile' && (
            <UnifiedProfile
              user={currentUser}
              onUpdate={(updatedUser) => {
                if (onUserUpdate) onUserUpdate(updatedUser);
              }}
              applicationsData={applicationsData || []}
              showStats={true}
            />
          )}
        </main>
      </div>

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