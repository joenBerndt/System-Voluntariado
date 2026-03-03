import { Target, Eye, History, Heart, Award, Users, Sparkles } from 'lucide-react';
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-gray-600 mt-4">Cargando información...</p>
        </div>
      </section>
    );
  }

  // Si no está publicado, mostrar mensaje
  if (!about.published) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg p-12 text-center border-2 border-emerald-100">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Contenido en preparación</h3>
          <p className="text-gray-600">Esta sección estará disponible próximamente</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMnYxMmgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-white mb-6">Sobre Nosotros</h1>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
            Conoce más sobre el Instituto de Investigaciones de la Amazonía Peruana
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mission */}
          {about.mission && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white">Misión</h3>
                </div>
                <p className="text-emerald-50 leading-relaxed">
                  {about.mission}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-white">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Compromiso con la excelencia</span>
                </div>
              </div>
            </div>
          )}

          {/* Vision */}
          {about.vision && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-teal-200 transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 text-white">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white">Visión</h3>
                </div>
                <p className="text-teal-50 leading-relaxed">
                  {about.vision}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-teal-50 to-white">
                <div className="flex items-center gap-2 text-teal-700">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Liderazgo en investigación</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {about.history && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <History className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white">Nuestra Historia</h3>
              </div>
              <p className="text-purple-50 text-lg leading-relaxed">
                {about.history}
              </p>
            </div>
            <div className="h-2 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500"></div>
          </div>
        )}

        {/* Values */}
        {about.values && about.values.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-amber-200 transition-all duration-300 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Nuestros Valores</h3>
                <p className="text-gray-600">Los principios que guían nuestro trabajo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {about.values.map((value: string, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border-2 border-amber-100 hover:border-amber-300 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg mt-0.5">
                      <div className="w-3 h-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-800 font-medium leading-relaxed">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 mb-2">Equipo Multidisciplinario</h3>
              <p className="text-gray-600">
                Investigadores de diversas especialidades trabajando juntos
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100 text-center">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 mb-2">Excelencia Científica</h3>
              <p className="text-gray-600">
                Reconocimiento nacional e internacional en investigación
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 text-center">
              <div className="bg-gradient-to-br from-emerald-600 to-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-gray-900 mb-2">Compromiso Amazónico</h3>
              <p className="text-gray-600">
                Dedicados al desarrollo sostenible de la región
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
