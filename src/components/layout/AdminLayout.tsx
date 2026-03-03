import { LayoutDashboard, Users, UserCircle, Megaphone, FolderOpen, MapPin, Info, User, FileText, UserCheck, LogOut, Home, Video, Activity, BarChart2, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Dashboard } from '../../pages/Dashboard';
import { VolunteersAdmin } from '../admin/VolunteersAdmin';
import { ConvocatoriasAdmin } from '../admin/ConvocatoriasAdmin';
import { UnifiedProfile } from '../common/UnifiedProfile';
import { ProjectsAdmin } from '../admin/ProjectsAdmin';
import { AreasAdmin } from '../admin/AreasAdmin';
import { AboutAdmin } from '../admin/AboutAdmin';
import { ApplicationsAdmin } from '../admin/ApplicationsAdmin';
import { ContentManagement } from '../common/ContentManagement';
import { UsersAdmin } from '../admin/UsersAdmin';
import { ActivityLog } from '../admin/ActivityLog';
import { ReportsAdmin } from '../admin/ReportsAdmin';
import { VolunteerProjects } from '../volunteer/VolunteerProjects';
import logoIIAP from '../../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface AdminLayoutProps {
  onLogout: () => void;
  currentUser?: any;
  onUserUpdate?: (updatedUser: any) => void;
  onBackToLanding?: () => void;
}

type Section = 'dashboard' | 'users' | 'volunteers' | 'convocatorias' | 'applications' | 'projects' | 'my-projects' | 'areas' | 'about' | 'profile' | 'content' | 'activity' | 'reports';

export function AdminLayout({ onLogout, currentUser, onUserUpdate, onBackToLanding }: AdminLayoutProps) {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [user, setUser] = useState(currentUser);

  const isAdminMaster = currentUser?.role === 'admin_master';

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // Menu items filtered based on role
  const menuItems = [
    { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports' as Section, label: 'Reportes', icon: BarChart2, masterOnly: true },
    { id: 'applications' as Section, label: 'Postulaciones', icon: FileText },
    { id: 'volunteers' as Section, label: 'Voluntarios', icon: UserCheck },
    { id: 'convocatorias' as Section, label: 'Convocatorias', icon: Megaphone },
    { id: 'projects' as Section, label: 'Gestionar Proyectos', icon: FolderOpen, masterOnly: true }, // Global Proj Mgmt
    { id: 'my-projects' as Section, label: 'Mis Proyectos', icon: Briefcase }, // Assigned Proj View
    { id: 'content' as Section, label: 'Asignaciones', icon: Video },
    { id: 'areas' as Section, label: 'Áreas', icon: MapPin, masterOnly: true },
    { id: 'about' as Section, label: 'Nosotros', icon: Info, masterOnly: true },
    { id: 'users' as Section, label: 'Usuarios', icon: User, masterOnly: true },
    { id: 'profile' as Section, label: 'Perfil', icon: UserCircle },
    { id: 'activity' as Section, label: 'Actividad', icon: Activity, masterOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-left">
      {/* Header - Sticky */}
      <header className="bg-white border-b-2 border-emerald-100 px-8 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoIIAP} alt="IIAP Logo" className="h-14 w-auto" />
            <div className="border-l-2 border-emerald-600 pl-4">
              <h1 className="text-gray-900 leading-tight">Panel de Administración</h1>
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
            <div className="text-right border-r-2 border-gray-200 pr-4 hidden sm:block">
              <p className="text-gray-900 font-semibold">{currentUser?.name}</p>
              <p className="text-gray-600 text-sm">
                {currentUser?.role === 'admin_master' ? 'Admin Master' :
                  currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
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
        <aside className="w-64 bg-white border-r-2 border-emerald-100 min-h-[calc(100vh-90px)] shadow-sm">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // If item is masterOnly, current user MUST be master
              if (item.masterOnly && !isAdminMaster) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${currentSection === item.id
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {currentSection === 'dashboard' && <Dashboard currentUser={currentUser} onNavigate={setCurrentSection} />}
          {currentSection === 'reports' && <ReportsAdmin currentUser={currentUser} />}
          {currentSection === 'applications' && <ApplicationsAdmin currentUser={currentUser} />}
          {currentSection === 'volunteers' && <VolunteersAdmin currentUser={currentUser} />}
          {currentSection === 'projects' && <ProjectsAdmin />}
          {currentSection === 'my-projects' && <VolunteerProjects currentUser={currentUser} />}
          {currentSection === 'convocatorias' && <ConvocatoriasAdmin currentUser={currentUser} />}
          {currentSection === 'areas' && <AreasAdmin />}
          {currentSection === 'about' && <AboutAdmin />}
          {currentSection === 'users' && <UsersAdmin currentUser={currentUser} />}
          {currentSection === 'profile' && user && <UnifiedProfile user={user} onUpdate={handleProfileUpdate} />}
          {currentSection === 'content' && <ContentManagement currentUser={currentUser} />}
          {currentSection === 'activity' && <ActivityLog />}
        </main>
      </div>
    </div>
  );
}