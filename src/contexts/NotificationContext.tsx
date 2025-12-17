import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number, actions?: NotificationAction[]) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  showLoading: (title: string, message?: string) => string;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (except loading, persistent)
    if (!notification.persistent && notification.type !== 'loading') {
      // Give more time if actionable
      const autoHideDuration = notification.duration || (notification.actions ? 10000 : 5000);

      setTimeout(() => {
        hideNotification(id);
      }, autoHideDuration);
    }

    return id;
  }, [hideNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration: duration || 7000 });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, duration?: number, actions?: NotificationAction[]) => {
    return addNotification({ type: 'warning', title, message, duration, actions });
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none w-full px-4 sm:px-0">
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
      className="pointer-events-auto animate-slide-in-right-bounce w-full"
      role="alert"
      aria-live="polite"
    >
      <div className={`bg-gradient-to-r ${config.bgGradient} rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${config.iconBg} p-2 rounded-lg shadow-lg flex-shrink-0`}>
              <Icon className={`w-6 h-6 text-white ${config.spinning ? 'animate-spin' : ''}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-white font-semibold text-base leading-tight pt-0.5">
                  {config.emoji} {notification.title}
                </h4>
                {notification.type !== 'loading' && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 -mt-1 -mr-1"
                    aria-label="Cerrar notificación"
                  >
                    <X className="w-5 h-5 text-white/90" />
                  </button>
                )}
              </div>

              {notification.message && (
                <p className="text-white/95 text-sm mt-2 leading-relaxed">{notification.message}</p>
              )}

              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/20">
                  {notification.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        action.onClick();
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${action.variant === 'secondary'
                          ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm ring-1 ring-white/40'
                          : 'bg-white text-gray-900 hover:bg-gray-50 hover:shadow-md'
                        }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
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

