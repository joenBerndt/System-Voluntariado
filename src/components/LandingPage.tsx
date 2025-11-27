import { Users, Calendar, MapPin, ArrowRight, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AreasPage } from './AreasPage';
import { AboutPage } from './AboutPage';

interface LandingPageProps {
  onLoginClick: () => void;
  onPostular?: (convocatoriaId: number) => void;
}

export function LandingPage({ onLoginClick, onPostular }: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'areas' | 'about' | 'projects'>('home');
  const { data: convocatoriasData, loading } = useApi<any[]>('/convocatorias');
  const { data: aboutData, loading: loadingAbout } = useApi<any>('/about');
  const { data: projectsData, loading: loadingProjects } = useApi<any[]>('/projects');
  
  const convocatorias = convocatoriasData || [];
  const projects = projectsData || [];
  
  // Only show active convocatorias (exclude terminated ones)
  const activeConvocatorias = convocatorias.filter(c => c.status === 'activa');
  
  // Only show published projects
  const publishedProjects = projects.filter(p => p.published === true);
  
  const about = aboutData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">IIAP</h1>
                <p className="text-gray-600 text-sm">Instituto de Investigaciones de la Amazonía Peruana</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-2">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'home'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setCurrentPage('areas')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'areas'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Áreas
                </button>
                <button
                  onClick={() => setCurrentPage('about')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'about'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Nosotros
                </button>
                <button
                  onClick={() => setCurrentPage('projects')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'projects'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Proyectos
                </button>
              </nav>
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden flex gap-2 mt-4">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentPage('areas')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'areas'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Áreas
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'about'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Nosotros
            </button>
            <button
              onClick={() => setCurrentPage('projects')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Proyectos
            </button>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      {currentPage === 'areas' && <AreasPage onNavigate={setCurrentPage} />}
      {currentPage === 'about' && <AboutPage onNavigate={setCurrentPage} />}
      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-4">
                Únete a Nuestro Equipo de Voluntarios
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                Contribuye al desarrollo sostenible de la Amazonía peruana. Descubre oportunidades
                de voluntariado que impactan positivamente en nuestras comunidades y el medio ambiente.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-900 text-3xl mb-2">{activeConvocatorias.length}</p>
                <p className="text-gray-600">Convocatorias Activas</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-900 text-3xl mb-2">12+</p>
                <p className="text-gray-600">Programas en Curso</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-900 text-3xl mb-2">50+</p>
                <p className="text-gray-600">Comunidades Impactadas</p>
              </div>
            </div>

            {/* Convocatorias Section */}
            <div className="mb-8">
              <h3 className="text-gray-900 mb-6 text-center">Convocatorias Disponibles</h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Cargando convocatorias...</div>
                </div>
              ) : activeConvocatorias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeConvocatorias.map((convocatoria) => (
                    <div key={convocatoria.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-gray-900 flex-1">{convocatoria.title}</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm whitespace-nowrap ml-2">
                            Activa
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{convocatoria.description}</p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{convocatoria.area}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>
                            {new Date(convocatoria.startDate).toLocaleDateString('es-ES')} - {new Date(convocatoria.endDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>{convocatoria.vacancies - (convocatoria.acceptedVolunteers || 0)} vacantes disponibles</span>
                        </div>
                      </div>

                      {convocatoria.requirements && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">Requisitos:</span> {convocatoria.requirements}
                          </p>
                        </div>
                      )}

                      <button 
                        onClick={() => onPostular && onPostular(convocatoria.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Postular
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay convocatorias activas en este momento</p>
                  <p className="text-gray-500 text-sm mt-2">Vuelve pronto para ver nuevas oportunidades</p>
                </div>
              )}
            </div>

            {/* About Section */}
            {about.published && (
              <div className="bg-white p-8 rounded-xl shadow-lg mt-12">
                <h3 className="text-gray-900 mb-4 text-center">Sobre el Programa de Voluntariado</h3>
                {loadingAbout ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Cargando información...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {about.mission && (
                      <div>
                        <h4 className="text-gray-900 mb-3">Nuestra Misión</h4>
                        <p className="text-gray-600">{about.mission}</p>
                      </div>
                    )}
                    {about.values && about.values.length > 0 && (
                      <div>
                        <h4 className="text-gray-900 mb-3">Nuestros Valores</h4>
                        <ul className="text-gray-600 space-y-2">
                          {about.values.slice(0, 4).map((value: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {about.vision && !about.values && (
                      <div>
                        <h4 className="text-gray-900 mb-3">Nuestra Visión</h4>
                        <p className="text-gray-600">{about.vision}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
      
      {currentPage === 'projects' && (
        <>
          {/* Projects Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-4">
                Nuestros Proyectos
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                Descubre los proyectos que impulsan el desarrollo sostenible de la Amazonía peruana.
              </p>
            </div>

            {/* Projects Grid */}
            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Cargando proyectos...</div>
              </div>
            ) : publishedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedProjects.map((project) => (
                  <div key={project.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-4">
                      <h4 className="text-gray-900 mb-2">{project.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        project.status === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'finalizado'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status === 'activo' ? 'Activo' : project.status === 'finalizado' ? 'Finalizado' : 'Inactivo'}
                      </span>
                      <p className="text-gray-600 text-sm mt-3">{project.description}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString('es-ES')} - {new Date(project.endDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {project.objectives && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Objetivos:</span> {project.objectives}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay proyectos publicados en este momento</p>
                <p className="text-gray-500 text-sm mt-2">Vuelve pronto para conocer nuestras iniciativas</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Instituto de Investigaciones de la Amazonía Peruana (IIAP)
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Comprometidos con el desarrollo sostenible de la Amazonía
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}