import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { apiPost } from '../../hooks/useApi';

interface ApplicationModalProps {
  convocatoria: any;
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationModal({ convocatoria, currentUser, onClose, onSuccess }: ApplicationModalProps) {
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiPost('/applications', {
        convocatoriaId: convocatoria.id,
        convocatoriaTitle: convocatoria.title,
        userEmail: currentUser.email,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        motivation,
        experience,
        status: 'pending',
        appliedDate: new Date().toISOString().split('T')[0],
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Error al enviar la postulación. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-gray-900 mb-3">¡Postulación Enviada!</h3>
          <p className="text-gray-600 mb-6">
            Tu postulación ha sido recibida exitosamente. Te contactaremos pronto.
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Postular a Convocatoria</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
          <h4 className="text-gray-900 mb-2">{convocatoria.title}</h4>
          <p className="text-gray-600 text-sm">{convocatoria.description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Nombre Completo</label>
              <p className="text-gray-900 font-medium">{currentUser.name}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1">Email</label>
              <p className="text-gray-900 font-medium">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1">Teléfono</label>
              <p className="text-gray-900 font-medium">{currentUser.phone}</p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1">Área de Interés</label>
              <p className="text-gray-900 font-medium">{currentUser.area}</p>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              ¿Por qué quieres participar en esta convocatoria? *
            </label>
            <textarea
              required
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Describe tu motivación y qué esperas aportar al proyecto..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              minLength={50}
            />
            <p className="text-gray-500 text-sm mt-1">Mínimo 50 caracteres</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Experiencia relevante (opcional)
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Describe tu experiencia previa relacionada con esta convocatoria..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Postulación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
