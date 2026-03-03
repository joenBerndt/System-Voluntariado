import { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { apiPost } from '../hooks/useApi';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { useNotifications } from '../contexts/NotificationContext';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function RegisterPage({ onBack, onSuccess }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    skills: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showError, showSuccess } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Las contraseñas no coinciden';
      setError(errorMsg);
      showError('Error de validación', errorMsg);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      setError(errorMsg);
      showError('Error de validación', errorMsg);
      return;
    }

    setLoading(true);

    try {
      await apiPost('/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        area: formData.area,
        skills: formData.skills,
        password: formData.password,
      });

      showSuccess(
        '¡Registro exitoso!',
        `Bienvenido ${formData.name}. Ahora puedes iniciar sesión con tu cuenta`
      );

      // Delay to show the success notification
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error registering:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al registrar';

      // Show specific error message from server
      if (errorMessage.includes('Email already registered')) {
        const msg = 'Este email ya está registrado. Por favor, inicia sesión o usa otro email.';
        setError(msg);
        showError('Email duplicado', msg);
      } else {
        const msg = `Error al registrar: ${errorMessage}`;
        setError(msg);
        showError('Error en el registro', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay message="Creando tu cuenta..." subtitle="Registrando tus datos en el sistema" />}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-emerald-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-lg shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-gray-900 text-center mb-2">Registro de Voluntario</h2>
            <p className="text-gray-600 text-center mb-6">
              Crea tu cuenta para postular a convocatorias
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+51 999999999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Área de interés *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar área</option>
                    <option value="Educación">Educación</option>
                    <option value="Medio Ambiente">Medio Ambiente</option>
                    <option value="Salud">Salud</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Comunicación">Comunicación</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Habilidades (separadas por coma)</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Ej: Diseño gráfico, Programación, Idiomas"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Confirmar contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg font-medium"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}