import { Users, LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">IIAP - Sistema de Voluntariado</h1>
            <p className="text-gray-500 text-sm">Gestión de voluntarios y convocatorias</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-gray-900">Administrador</p>
            <p className="text-gray-500 text-sm">admin@iiap.org</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600">A</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}