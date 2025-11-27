import { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft, FileText, User, Calendar } from 'lucide-react';
import { apiPost } from '../../hooks/useApi';

interface ApplicationModalProps {
  convocatoria: any;
  volunteer: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationModal({ convocatoria, volunteer, onClose, onSuccess }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    motivation: '',
    availability: '',
    experience: '',
    acceptTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Info step
      case 2:
        return formData.motivation.length >= 50;
      case 3:
        return formData.availability !== '' && formData.experience !== '';
      case 4:
        return formData.acceptTerms;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await apiPost('/applications', {
        convocatoriaId: convocatoria.id,
        convocatoriaTitle: convocatoria.title,
        convocatoriaArea: convocatoria.area,
        userEmail: volunteer.email,
        userName: volunteer.name,
        userPhone: volunteer.phone,
        motivation: formData.motivation,
        availability: formData.availability,
        experience: formData.experience,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Error al enviar la postulación');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-gray-900 mb-2">¡Postulación Exitosa!</h3>
          <p className="text-gray-600">
            Tu postulación ha sido enviada correctamente. Recibirás una respuesta pronto al correo{' '}
            <span className="font-medium text-blue-600">{volunteer.email}</span>
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Postulación a Convocatoria</h3>
              <p className="text-gray-600 text-sm mt-1">{convocatoria.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Paso {currentStep} de {totalSteps}</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Información y Requisitos */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-gray-900">Información de la Convocatoria</h4>
                  <p className="text-gray-600 text-sm">Revisa los detalles antes de continuar</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-gray-900 mb-2">{convocatoria.title}</h5>
                <p className="text-gray-700 text-sm mb-3">{convocatoria.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      Inicio: {new Date(convocatoria.startDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      Fin: {new Date(convocatoria.endDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {convocatoria.requirements && (
                <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h5 className="text-gray-900">Requisitos</h5>
                  </div>
                  <ul className="space-y-2">
                    {convocatoria.requirements.split(/[.,;]/).filter((r: string) => r.trim()).map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-orange-600 mt-1">✓</span>
                        <span>{req.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-gray-900 mb-3">Tus Datos</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Nombre:</span>
                    <span>{volunteer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-4 h-4 text-gray-500">📧</span>
                    <span className="font-medium">Email:</span>
                    <span>{volunteer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-4 h-4 text-gray-500">📱</span>
                    <span className="font-medium">Teléfono:</span>
                    <span>{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-4 h-4 text-gray-500">🎯</span>
                    <span className="font-medium">Área:</span>
                    <span>{volunteer.area}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Motivación */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-gray-900">Carta de Motivación</h4>
                  <p className="text-gray-600 text-sm">Cuéntanos por qué te interesa esta convocatoria</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  ¿Por qué te interesa esta convocatoria? *
                </label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Describe tu motivación, cómo tus habilidades se ajustan a esta convocatoria, y qué esperas aportar al IIAP..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Mínimo 50 caracteres
                  </p>
                  <p className={`text-sm ${formData.motivation.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.motivation.length} / 50
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">💡 Consejos:</span>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• Sé específico sobre tu experiencia relevante</li>
                  <li>• Menciona habilidades que se alineen con los requisitos</li>
                  <li>• Explica qué te apasiona del área de trabajo</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Disponibilidad y Experiencia */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-gray-900">Disponibilidad y Experiencia</h4>
                  <p className="text-gray-600 text-sm">Información adicional sobre tu perfil</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Disponibilidad *</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Tiempo completo (40 horas/semana)">Tiempo completo (40 horas/semana)</option>
                  <option value="Medio tiempo (20 horas/semana)">Medio tiempo (20 horas/semana)</option>
                  <option value="Fines de semana">Fines de semana</option>
                  <option value="Flexible (a coordinar)">Flexible (a coordinar)</option>
                  <option value="10-15 horas/semana">10-15 horas/semana</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Experiencia Previa *
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Describe brevemente tu experiencia relevante en voluntariados, proyectos o trabajos relacionados con esta área..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Si no tienes experiencia previa, puedes mencionar habilidades relevantes o ganas de aprender.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-gray-900">Revisión Final</h4>
                  <p className="text-gray-600 text-sm">Verifica tu información antes de enviar</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h5 className="text-gray-900 mb-2">Convocatoria</h5>
                  <p className="text-gray-700 text-sm">{convocatoria.title}</p>
                </div>

                <div>
                  <h5 className="text-gray-900 mb-2">Motivación</h5>
                  <p className="text-gray-700 text-sm line-clamp-3">{formData.motivation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-gray-900 mb-2">Disponibilidad</h5>
                    <p className="text-gray-700 text-sm">{formData.availability}</p>
                  </div>
                  <div>
                    <h5 className="text-gray-900 mb-2">Email de contacto</h5>
                    <p className="text-gray-700 text-sm">{volunteer.email}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-gray-900 mb-2">Experiencia</h5>
                  <p className="text-gray-700 text-sm line-clamp-2">{formData.experience}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-900 font-medium">Acepto los términos y condiciones</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Confirmo que la información proporcionada es verídica y acepto que el IIAP 
                      contacte conmigo para el proceso de selección. Entiendo que proporcionar 
                      información falsa puede resultar en la descalificación de mi postulación.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
            
            <div className="flex-1" />

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Postulación'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}