import { useState } from 'react';
import { LogOut, LayoutDashboard, FolderOpen, User, Home, Video, FileText, Megaphone, Briefcase, Calendar, History } from 'lucide-react';
import { UnifiedProfile } from '../common/UnifiedProfile';
import { VolunteerDashboard } from '../volunteer/VolunteerDashboard';
import { VolunteerProjects } from '../volunteer/VolunteerProjects';
import { ContentManagement } from '../common/ContentManagement';
import { ApplicationModal } from '../common/ApplicationModal';
import { VolunteerConvocatorias } from '../volunteer/VolunteerConvocatorias';
import { VolunteerApplications } from '../volunteer/VolunteerApplications';
import { VolunteerInterviews } from '../volunteer/VolunteerInterviews';
import { VolunteerHistory } from '../volunteer/VolunteerHistory';
import { useApi } from '../../hooks/useApi';
import logoIIAP from '../../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface VolunteerLayoutProps {
  onLogout: () => void;
  currentUser?: any;
  onUserUpdate?: (updatedUser: any) => void;
  onBackToLanding?: () => void;
}

type Section = 'dashboard' | 'projects' | 'convocatorias' | 'applications' | 'interviews' | 'history' | 'profile' | 'content';

export function VolunteerLayout({ onLogout, currentUser, onUserUpdate, onBackToLanding }: VolunteerLayoutProps) {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [user, setUser] = useState(currentUser);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);

  // Fetch projects to check if user is a manager
  const { data: projectsData } = useApi<any[]>('/projects');
  const { data: applicationsData, refetch: refetchApplications } = useApi<any[]>('/applications');
  const { data: convocatoriasData } = useApi<any[]>('/convocatorias');

  const projects = projectsData || [];
  const applications = applicationsData || [];
  const convocatorias = convocatoriasData || [];

  // Filter applications for current user
  const myApplications = applications.filter(app => app.userEmail === currentUser?.email);

  // Filter interviews
  const myInterviews = myApplications.filter(app =>
    app.status === 'interview_pending' ||
    app.status === 'interview_confirmed' ||
    (app.interviewDate && app.interviewDate !== '')
  );

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // Check if volunteer is manager of any project
  const isProjectManager = projects.some(p =>
    p.managers && p.managers.includes(currentUser?.id)
  );

  const menuItems = [
    { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as Section, label: 'Mis Proyectos', icon: FolderOpen },
    { id: 'convocatorias' as Section, label: 'Convocatorias', icon: Megaphone },
    { id: 'applications' as Section, label: 'Mis Postulaciones', icon: FileText, badge: myApplications.length },
    { id: 'interviews' as Section, label: 'Entrevistas', icon: Calendar, badge: myInterviews.length },
    // { id: 'history' as Section, label: 'Historial', icon: History },
    // Only show Asignaciones if volunteer is a project manager
    ...(isProjectManager ? [{ id: 'content' as Section, label: 'Asignaciones', icon: Video }] : []),
    { id: 'profile' as Section, label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-emerald-100 px-8 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoIIAP} alt="IIAP Logo" className="h-14 w-auto" />
            <div className="border-l-2 border-emerald-600 pl-4">
              <h1 className="text-gray-900">Intranet Voluntarios - IIAP</h1>
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
              <div className="flex items-center justify-end gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
                  Voluntario
                </span>
              </div>
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
                    <span>{item.label}</span>
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
          {currentSection === 'dashboard' && <VolunteerDashboard currentUser={currentUser} applications={myApplications} onNavigate={setCurrentSection} />}
          {currentSection === 'projects' && <VolunteerProjects currentUser={currentUser} />}
          {currentSection === 'convocatorias' && (
            <VolunteerConvocatorias
              onSelectConvocatoria={setSelectedConvocatoria}
              currentUser={currentUser}
            />
          )}
          {currentSection === 'applications' && (
            <VolunteerApplications
              applications={myApplications}
              convocatorias={convocatorias}
              refetchApplications={refetchApplications}
            />
          )}
          {currentSection === 'interviews' && (
            <VolunteerInterviews
              interviews={myInterviews}
              convocatorias={convocatorias}
            />
          )}
          {currentSection === 'history' && (
            <VolunteerHistory
              applications={myApplications}
              convocatorias={convocatorias}
            />
          )}
          {currentSection === 'profile' && user && <UnifiedProfile user={user} onUpdate={handleProfileUpdate} applicationsData={myApplications} />}
          {currentSection === 'content' && <ContentManagement currentUser={currentUser} />}
        </main>
      </div>

      {/* Application Modal */}
      {selectedConvocatoria && (
        <ApplicationModal
          convocatoria={selectedConvocatoria}
          currentUser={currentUser}
          onClose={() => setSelectedConvocatoria(null)}
          onSuccess={() => {
            setSelectedConvocatoria(null);
            refetchApplications();
          }}
        />
      )}
    </div>
  );
}