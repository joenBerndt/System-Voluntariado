import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ServerConnectionStatusProps {
  isConnected: boolean;
  isRetrying?: boolean;
}

export function ServerConnectionStatus({ isConnected, isRetrying }: ServerConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Solo mostrar cuando hay un problema de conexión
    if (!isConnected || isRetrying) {
      setShowStatus(true);
    } else {
      // Ocultar después de un pequeño delay cuando se reconecta
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isRetrying]);

  if (!showStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border
        ${isConnected && !isRetrying
          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-800'
          : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 text-amber-800'
        }
      `}>
        {isConnected && !isRetrying ? (
          <>
            <Wifi className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium">Conexión restaurada</p>
              <p className="text-xs opacity-75">El servidor está funcionando correctamente</p>
            </div>
          </>
        ) : (
          <>
            {isRetrying ? (
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium">Reconectando al servidor</p>
              <p className="text-xs opacity-75">Reintentando automáticamente...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Hook para monitorear el estado de conexión
export function useServerConnection() {
  const [isConnected, setIsConnected] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [failedEndpoints, setFailedEndpoints] = useState<Set<string>>(new Set());

  const markEndpointFailed = (endpoint: string) => {
    setFailedEndpoints(prev => new Set(prev).add(endpoint));
    setIsConnected(false);
    setIsRetrying(true);
  };

  const markEndpointSuccess = (endpoint: string) => {
    setFailedEndpoints(prev => {
      const newSet = new Set(prev);
      newSet.delete(endpoint);
      return newSet;
    });
    
    // Si todos los endpoints están funcionando, marcar como conectado
    if (failedEndpoints.size === 0) {
      setIsConnected(true);
      setIsRetrying(false);
    }
  };

  return {
    isConnected,
    isRetrying,
    markEndpointFailed,
    markEndpointSuccess,
  };
}
