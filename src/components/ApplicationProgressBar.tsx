import { CheckCircle, Clock, FileText, Video, Award } from 'lucide-react';

interface ApplicationProgressBarProps {
  status: string;
}

export function ApplicationProgressBar({ status }: ApplicationProgressBarProps) {
  const stages = [
    { id: 'pending', label: 'Postulación', icon: FileText },
    { id: 'interview', label: 'Entrevista', icon: Video },
    { id: 'evaluation', label: 'Evaluación', icon: Clock },
    { id: 'accepted', label: 'Aceptado', icon: Award },
  ];

  // Determine current stage index
  let currentStageIndex = 0;
  if (status === 'pending') currentStageIndex = 0;
  else if (status === 'interview_pending' || status === 'interview_confirmed') currentStageIndex = 1;
  else if (status === 'under_evaluation') currentStageIndex = 2;
  else if (status === 'accepted') currentStageIndex = 3;
  else if (status === 'rejected') currentStageIndex = -1; // Special case

  // If rejected, show different UI
  if (status === 'rejected') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <CheckCircle className="w-6 h-6 text-red-700" />
          </div>
          <div className="text-center">
            <p className="text-red-900 font-semibold">Postulación Rechazada</p>
            <p className="text-red-700 text-sm">El proceso ha finalizado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border-2 border-emerald-100">
      <div className="mb-4">
        <p className="text-gray-900 font-semibold mb-1">Progreso de tu Postulación</p>
        <p className="text-gray-600 text-sm">Seguimiento del proceso de selección</p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full" style={{ marginLeft: '32px', marginRight: '32px' }} />
        <div 
          className="absolute top-8 left-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-500"
          style={{ 
            marginLeft: '32px',
            width: `calc(${(currentStageIndex / (stages.length - 1)) * 100}% - 32px)`
          }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Icon Circle */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg scale-100'
                      : isCurrent
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl scale-110 ring-4 ring-amber-100'
                      : 'bg-gray-200 scale-90'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Icon className={`w-8 h-8 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`mt-3 font-semibold text-center transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {stage.label}
                </p>

                {/* Status Text */}
                {isCurrent && (
                  <p className="text-amber-600 text-sm mt-1 font-medium animate-pulse">
                    En proceso
                  </p>
                )}
                {isCompleted && (
                  <p className="text-emerald-600 text-sm mt-1 font-medium">
                    ✓ Completado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Description */}
      <div className="mt-6 p-4 bg-white rounded-lg border-2 border-emerald-100">
        {currentStageIndex === 0 && (
          <div>
            <p className="text-gray-900 font-semibold mb-2">📋 Revisión de Postulación</p>
            <p className="text-gray-600 text-sm">
              Tu postulación está siendo revisada por nuestro equipo. Te notificaremos sobre los próximos pasos.
            </p>
          </div>
        )}
        {currentStageIndex === 1 && (
          <div>
            <p className="text-gray-900 font-semibold mb-2">🎥 Fase de Entrevista</p>
            <p className="text-gray-600 text-sm">
              Has sido seleccionado para una entrevista. Revisa los detalles de tu entrevista y prepárate adecuadamente.
            </p>
          </div>
        )}
        {currentStageIndex === 2 && (
          <div>
            <p className="text-gray-900 font-semibold mb-2">⚖️ Evaluación Final</p>
            <p className="text-gray-600 text-sm">
              Tu entrevista está siendo evaluada. Pronto recibirás una respuesta sobre el resultado del proceso.
            </p>
          </div>
        )}
        {currentStageIndex === 3 && (
          <div>
            <p className="text-gray-900 font-semibold mb-2">🎉 ¡Felicidades!</p>
            <p className="text-gray-600 text-sm">
              Has sido aceptado. Pronto serás contactado con información sobre los siguientes pasos y tu incorporación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
