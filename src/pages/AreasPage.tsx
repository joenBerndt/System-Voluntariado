import { Leaf, Droplet, Fish, Cloud, Users as UsersIcon, TestTube, ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface AreasPageProps {
  onNavigate: (page: 'home' | 'areas' | 'about' | 'projects') => void;
  onSelectArea?: (areaId: string) => void;
}

const iconMap: Record<string, any> = {
  leaf: Leaf,
  droplet: Droplet,
  fish: Fish,
  cloud: Cloud,
  users: UsersIcon,
  flask: TestTube,
};

// Color schemes for areas
const colorSchemes = [
  { from: 'from-emerald-500', to: 'to-teal-600', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { from: 'from-teal-500', to: 'to-cyan-600', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { from: 'from-green-500', to: 'to-emerald-600', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { from: 'from-lime-500', to: 'to-green-600', bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
  { from: 'from-cyan-500', to: 'to-teal-600', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { from: 'from-emerald-600', to: 'to-green-700', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
];

export function AreasPage({ onNavigate, onSelectArea }: AreasPageProps) {
  const { data: areasData, loading } = useApi<any[]>('/areas');
  const areas = areasData || [];
  const publishedAreas = areas.filter(a => a.published);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMnYxMmgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-white mb-6">Nuestras Áreas de Investigación</h1>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
            El IIAP desarrolla investigación científica y tecnológica en diversas áreas,
            todas enfocadas en el desarrollo sostenible de la Amazonía peruana.
          </p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="text-gray-600 mt-4">Cargando áreas...</p>
          </div>
        ) : publishedAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedAreas.map((area, index) => {
              const Icon = iconMap[area.icon] || Leaf;
              const colorScheme = colorSchemes[index % colorSchemes.length];

              return (
                <div
                  key={area.id}
                  onClick={() => {
                    if (onSelectArea) {
                      onSelectArea(area.id);
                    }
                  }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-200 cursor-pointer"
                >
                  {/* Image Header */}
                  {(area.imageUrl || area.image_url) ? (
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={area.imageUrl || area.image_url}
                        alt={area.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className={`absolute bottom-4 left-4 ${colorScheme.bg} p-3 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90`}>
                        <Icon className={`w-6 h-6 ${colorScheme.text}`} />
                      </div>
                    </div>
                  ) : (
                    <div className={`relative h-48 bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMnYxMmgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                      <Icon className="w-20 h-20 text-white opacity-90 relative z-10" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {area.description}
                    </p>

                    <div className={`mt-4 w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${colorScheme.bg} ${colorScheme.text} group-hover:scale-[1.02]`}>
                      <span>Ver detalles del área</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-100">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No hay áreas publicadas</h3>
            <p className="text-gray-600">
              Las áreas de investigación aparecerán aquí una vez sean publicadas
            </p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-gray-900 mb-4">¿Te interesa participar?</h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            Únete a nuestro equipo de voluntarios y contribuye al desarrollo sostenible de la Amazonía
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium inline-flex items-center gap-2"
          >
            Ver Convocatorias Activas
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
}
