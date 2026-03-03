import { LayoutDashboard, Users, Megaphone, Briefcase, Info } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'volunteers' | 'convocatorias' | 'areas' | 'about';
  setCurrentView: (view: 'dashboard' | 'volunteers' | 'convocatorias' | 'areas' | 'about') => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'volunteers' as const, label: 'Voluntarios', icon: Users },
    { id: 'convocatorias' as const, label: 'Convocatorias', icon: Megaphone },
    { id: 'areas' as const, label: 'Áreas', icon: Briefcase },
    { id: 'about' as const, label: 'Nosotros', icon: Info },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}