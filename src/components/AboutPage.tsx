import { Target, Eye, History, Heart } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface AboutPageProps {
  onNavigate: (page: 'home' | 'areas' | 'about') => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { data: aboutData, loading } = useApi<any>('/about');
  const about = aboutData || {};

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando información...</div>
        </div>
      </section>
    );
  }

  // Si no está publicado, mostrar mensaje
  if (!about.published) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Esta sección estará disponible próximamente</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-gray-900 mb-4">Sobre Nosotros</h2>
        <p className="text-gray-600 text-xl max-w-3xl mx-auto">
          Conoce más sobre el Instituto de Investigaciones de la Amazonía Peruana
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission */}
        {about.mission && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3">Misión</h3>
                <p className="text-gray-600">{about.mission}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vision */}
        {about.vision && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3">Visión</h3>
                <p className="text-gray-600">{about.vision}</p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {about.history && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                <History className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3">Historia</h3>
                <p className="text-gray-600">{about.history}</p>
              </div>
            </div>
          </div>
        )}

        {/* Values */}
        {about.values && about.values.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-3">Nuestros Valores</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {about.values.map((value: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}