import { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { apiPost } from '../hooks/useApi';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await apiPost('/users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        area: formData.area,
        skills: formData.skills,
      });

      // Store password in localStorage (in production use proper auth)
      localStorage.setItem(`user_pass_${formData.email}`, formData.password);

      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      onSuccess();
    } catch (err) {
      console.error('Error registering:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al registrar';
      
      // Show specific error message from server
      if (errorMessage.includes('Email already registered')) {
        setError('Este email ya está registrado. Por favor, inicia sesión o usa otro email.');
      } else {
        setError(`Error al registrar: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio de sesión
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
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
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}