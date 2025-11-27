import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  showLoading: (title: string, message?: string) => string;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove después del duration (excepto loading y persistent)
    if (!notification.persistent && notification.type !== 'loading') {
      setTimeout(() => {
        hideNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration: duration || 7000 });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showLoading = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'loading', title, message, persistent: true });
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        hideNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, hideNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const getConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle2,
          bgGradient: 'from-emerald-500 to-teal-500',
          iconBg: 'bg-emerald-600',
          emoji: '✅',
        };
      case 'error':
        return {
          icon: XCircle,
          bgGradient: 'from-red-500 to-rose-500',
          iconBg: 'bg-red-600',
          emoji: '❌',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgGradient: 'from-amber-500 to-orange-500',
          iconBg: 'bg-amber-600',
          emoji: '⚠️',
        };
      case 'info':
        return {
          icon: Info,
          bgGradient: 'from-cyan-500 to-blue-500',
          iconBg: 'bg-cyan-600',
          emoji: 'ℹ️',
        };
      case 'loading':
        return {
          icon: Loader2,
          bgGradient: 'from-purple-500 to-indigo-500',
          iconBg: 'bg-purple-600',
          emoji: '🔄',
          spinning: true,
        };
      default:
        return {
          icon: Info,
          bgGradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-600',
          emoji: 'ℹ️',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div 
      className="pointer-events-auto animate-slide-in-right-bounce"
      role="alert"
      aria-live="polite"
    >
      <div className={`bg-gradient-to-r ${config.bgGradient} rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${config.iconBg} p-2 rounded-lg shadow-lg flex-shrink-0`}>
              <Icon className={`w-6 h-6 text-white ${config.spinning ? 'animate-spin' : ''}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-white font-semibold text-base">
                  {config.emoji} {notification.title}
                </h4>
                {notification.type !== 'loading' && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                    aria-label="Cerrar notificación"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              {notification.message && (
                <p className="text-white/90 text-sm mt-1">{notification.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar para loading */}
        {notification.type === 'loading' && (
          <div className="h-1 bg-white/30">
            <div className="h-full bg-white/60 animate-progress-bar" />
          </div>
        )}
      </div>
    </div>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
}
