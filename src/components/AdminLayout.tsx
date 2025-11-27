import { useState } from 'react';
import { Users, Megaphone, MapPin, Info, LogOut, LayoutDashboard, UserCheck, FileText, UserCircle, FolderOpen, User } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Volunteers } from './Volunteers';
import { Convocatorias } from './Convocatorias';
import { AreasAdmin } from './admin/AreasAdmin';
import { AboutAdmin } from './admin/AboutAdmin';
import { ApplicationsAdmin } from './admin/ApplicationsAdmin';
import { UsersAdmin } from './admin/UsersAdmin';
import { ProjectsAdmin } from './admin/ProjectsAdmin';
import { ProfileView } from './ProfileView';

interface AdminLayoutProps {
  onLogout: () => void;
  currentUser?: any;
  onUserUpdate?: (updatedUser: any) => void;
}

type Section = 'dashboard' | 'users' | 'volunteers' | 'convocatorias' | 'applications' | 'projects' | 'areas' | 'about' | 'profile';

export function AdminLayout({ onLogout, currentUser, onUserUpdate }: AdminLayoutProps) {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [user, setUser] = useState(currentUser);
  
  const isAdmin = currentUser?.role === 'admin';
  const isAdminMaster = currentUser?.role === 'admin_master';

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // Menu items filtered based on role
  const allMenuItems = [
    { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'admin_master'] },
    { id: 'applications' as Section, label: 'Postulaciones', icon: FileText, allowedRoles: ['admin', 'admin_master'] },
    { id: 'users' as Section, label: 'Usuarios', icon: UserCircle, allowedRoles: ['admin_master'] },
    { id: 'volunteers' as Section, label: 'Voluntarios', icon: UserCheck, allowedRoles: ['admin', 'admin_master'] },
    { id: 'projects' as Section, label: 'Proyectos', icon: FolderOpen, allowedRoles: ['admin', 'admin_master'] },
    { id: 'convocatorias' as Section, label: 'Convocatorias', icon: Megaphone, allowedRoles: ['admin', 'admin_master'] },
    { id: 'areas' as Section, label: 'Áreas', icon: MapPin, allowedRoles: ['admin_master'] },
    { id: 'about' as Section, label: 'Nosotros', icon: Info, allowedRoles: ['admin_master'] },
    { id: 'profile' as Section, label: 'Perfil', icon: User, allowedRoles: ['admin', 'admin_master'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    item.allowedRoles.includes(currentUser?.role || 'admin_master')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Panel de Administración - IIAP</h1>
              <p className="text-gray-500 text-sm">Sistema de Gestión de Voluntariado</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
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
          {currentSection === 'dashboard' && <Dashboard currentUser={currentUser} />}
          {currentSection === 'applications' && <ApplicationsAdmin isAdminJunior={isAdmin} />}
          {currentSection === 'users' && <UsersAdmin />}
          {currentSection === 'volunteers' && <Volunteers isAdminJunior={isAdmin} />}
          {currentSection === 'projects' && <ProjectsAdmin />}
          {currentSection === 'convocatorias' && <Convocatorias />}
          {currentSection === 'areas' && <AreasAdmin />}
          {currentSection === 'about' && <AboutAdmin />}
          {currentSection === 'profile' && user && <ProfileView user={user} onUpdate={handleProfileUpdate} />}
        </main>
      </div>
    </div>
  );
}