import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ isLoading, message = 'Cargando...', fullScreen = false }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={`${
        fullScreen ? 'fixed inset-0' : 'absolute inset-0'
      } bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in`}
    >
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl shadow-2xl border-2 border-emerald-200 animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          {/* Animated loader with gradient circle */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full shadow-lg">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-gray-900 font-semibold text-lg mb-1">{message}</p>
            <p className="text-gray-600 text-sm">Por favor espera un momento...</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-50 animate-pulse" />
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full shadow-lg">
          <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
        </div>
      </div>
      {message && (
        <p className="text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg animate-scale-in">
        <Icon className="w-12 h-12 text-emerald-600" />
      </div>
      <h3 className="text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
