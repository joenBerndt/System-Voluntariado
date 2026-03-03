import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

export function ServerStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${API_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      setIsConnected(response.ok);
    } catch (err) {
      console.error('Server connection check failed:', err);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if connected
  if (isConnected === true) {
    return null;
  }

  // Don't show on initial load
  if (isConnected === null) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-amber-300 max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            {isChecking ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-1">
              {isChecking ? 'Verificando conexión...' : 'Servidor desplegándose'}
            </p>
            <p className="text-amber-50 text-sm">
              El servidor Supabase se está desplegando. Por favor espera 1-2 minutos.
            </p>
          </div>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
