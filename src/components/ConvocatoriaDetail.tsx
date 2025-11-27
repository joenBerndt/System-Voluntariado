import { ArrowLeft, Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface ConvocatoriaDetailProps {
  convocatoria: any;
  onBack: () => void;
}

export function ConvocatoriaDetail({ convocatoria, onBack }: ConvocatoriaDetailProps) {
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');
  const volunteers = volunteersData || [];
  const assignments = assignmentsData || [];
  
  // Get volunteers assigned to the convocatoria's project
  const assignedVolunteers = volunteers.filter((volunteer) => {
    return assignments.some(
      (assignment) => 
        assignment.volunteerId === volunteer.id && 
        assignment.convocatoriaId === convocatoria.id
    );
  });

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a convocatorias
      </button>

      <div className="bg-white p-8 rounded-xl border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">{convocatoria.title}</h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                convocatoria.status === 'activa'
                  ? 'bg-green-100 text-green-700'
                  : convocatoria.status === 'cerrada'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {convocatoria.status === 'activa' ? 'Activa' : convocatoria.status === 'cerrada' ? 'Cerrada' : 'En Proceso'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-gray-600 text-sm">Área</p>
              <p className="text-gray-900">{convocatoria.area}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-gray-600 text-sm">Periodo</p>
              <p className="text-gray-900">
                {new Date(convocatoria.startDate).toLocaleDateString('es-ES')} -{' '}
                {new Date(convocatoria.endDate).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-gray-600 text-sm">Voluntarios</p>
              <p className="text-gray-900">{convocatoria.acceptedVolunteers || 0} / {convocatoria.vacancies}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-600">{convocatoria.description}</p>
          </div>

          {convocatoria.requirements && (
            <div>
              <h3 className="text-gray-900 mb-3">Requisitos</h3>
              <p className="text-gray-600">{convocatoria.requirements}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Volunteers */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-gray-900 mb-4">Voluntarios Asignados</h3>
        
        {assignedVolunteers.length > 0 ? (
          <div className="space-y-3">
            {assignedVolunteers.map((volunteer) => (
              <div key={volunteer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">{volunteer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-gray-900">{volunteer.name}</p>
                    <p className="text-gray-500 text-sm">{volunteer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Asignado</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay voluntarios asignados aún
          </div>
        )}
      </div>
    </div>
  );
}