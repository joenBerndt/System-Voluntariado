import { Leaf, Droplet, Fish, Cloud, Users as UsersIcon, TestTube } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface AreasPageProps {
  onNavigate: (page: 'home' | 'areas' | 'about') => void;
}

const iconMap: Record<string, any> = {
  leaf: Leaf,
  droplet: Droplet,
  fish: Fish,
  cloud: Cloud,
  users: UsersIcon,
  flask: TestTube,
};

export function AreasPage({ onNavigate }: AreasPageProps) {
  const { data: areasData, loading } = useApi<any[]>('/areas');
  const areas = areasData || [];
  const publishedAreas = areas.filter(a => a.published);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">Nuestras Áreas de Investigación</h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            El IIAP desarrolla investigación científica y tecnológica en diversas áreas,
            todas enfocadas en el desarrollo sostenible de la Amazonía peruana.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Cargando áreas...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedAreas.map((area) => {
              const Icon = iconMap[area.icon] || Leaf;
              return (
                <div
                  key={area.id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-gray-900 mb-3">{area.name}</h3>
                  <p className="text-gray-600">{area.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {!loading && publishedAreas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">No hay áreas publicadas en este momento</p>
          </div>
        )}
      </section>
    </>
  );
}