import { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onRegister: () => void;
  error?: string;
}

export function LoginPage({ onLogin, onBack, onRegister, error }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(error || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta IIAP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">💡 Credenciales de prueba:</p>
              <p className="text-xs">
                <span className="font-medium">Admin:</span> admin@iiap.org / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}