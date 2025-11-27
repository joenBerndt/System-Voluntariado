import { Users, Calendar, MapPin, ArrowRight, LogIn, Heart, Target, Award, ChevronDown, Leaf, Globe, HandHeart, Mail, Phone, CheckCircle, Megaphone, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { AreasPage } from './AreasPage';
import { AboutPage } from './AboutPage';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ApplicationModal } from './ApplicationModal';
import logoIIAP from 'figma:asset/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface LandingPageProps {
  onLoginClick: () => void;
  onPostular?: (convocatoriaId: number) => void;
  currentUser?: any;
  onGoToIntranet?: () => void;
}

export function LandingPage({ onLoginClick, onPostular, currentUser, onGoToIntranet }: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'areas' | 'about' | 'projects'>('home');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b-2 border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoIIAP} alt="IIAP Logo" className="h-16 w-auto" />
              <div className="hidden sm:block border-l-2 border-emerald-600 pl-4">
                <h1 className="text-gray-900">IIAP</h1>
                <p className="text-gray-700 text-sm leading-tight max-w-xs">
                  Instituto de Investigaciones de la Amazonía Peruana
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-1">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'home'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setCurrentPage('areas')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'areas'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Áreas
                </button>
                <button
                  onClick={() => setCurrentPage('about')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'about'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Nosotros
                </button>
                <button
                  onClick={() => setCurrentPage('projects')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'projects'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Proyectos
                </button>
              </nav>
              {!currentUser ? (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-2.5 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-gray-900 font-semibold">{currentUser.name}</p>
                      <p className="text-gray-600 text-sm">
                        {currentUser.role === 'admin_master' ? 'Admin Master' : 
                         currentUser.role === 'admin' ? 'Administrador' :
                         currentUser.role === 'volunteer' ? 'Voluntario' : 'Usuario'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{currentUser.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  {onGoToIntranet && (
                    <button
                      onClick={onGoToIntranet}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                      <FolderOpen className="w-5 h-5" />
                      <span className="hidden sm:inline">
                        {currentUser.role === 'admin_master' || currentUser.role === 'admin' ? 'Panel Admin' :
                         currentUser.role === 'volunteer' ? 'Mi Intranet' : 'Mi Portal'}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden flex gap-2 mt-4">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentPage === 'home'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentPage('areas')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentPage === 'areas'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              Áreas
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentPage === 'about'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              Nosotros
            </button>
            <button
              onClick={() => setCurrentPage('projects')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                currentPage === 'projects'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-emerald-50'
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
          {/* Hero Section with Image */}
          <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1743430163568-645e576c1271?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwdm9sdW50ZWVyfGVufDF8fHx8MTc2NDIxMzk4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Amazonía Peruana"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-block mb-6">
                  <span className="bg-emerald-500/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border-2 border-emerald-400/50 font-semibold shadow-lg">
                    🌿 Programa de Voluntariado IIAP
                  </span>
                </div>
                <h2 className="text-white mb-6 drop-shadow-2xl">
                  Únete a Nuestro Equipo de Voluntarios
                </h2>
                <p className="text-emerald-50 text-xl md:text-2xl mb-10 leading-relaxed drop-shadow-lg">
                  Contribuye al desarrollo sostenible de la <span className="text-amber-300 font-semibold">Amazonía peruana</span>. 
                  Descubre oportunidades de voluntariado que impactan positivamente en nuestras comunidades y el medio ambiente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      const convocatoriasSection = document.getElementById('convocatorias');
                      if (convocatoriasSection) {
                        convocatoriasSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="group flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-2xl hover:shadow-emerald-500/50 font-semibold"
                  >
                    Ver Convocatorias
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setCurrentPage('about')}
                    className="flex items-center justify-center gap-2 bg-emerald-600/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-emerald-600/30 transition-all duration-200 shadow-2xl border-2 border-white/30 font-semibold"
                  >
                    Conoce más
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Megaphone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-4xl font-bold">{activeConvocatorias.length}</p>
                    <p className="text-gray-700 font-medium">Convocatorias</p>
                  </div>
                </div>
                <p className="text-gray-600">Oportunidades disponibles ahora</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-700 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-4xl font-bold">12+</p>
                    <p className="text-gray-700 font-medium">Programas</p>
                  </div>
                </div>
                <p className="text-gray-600">Proyectos activos en curso</p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-amber-100 hover:border-amber-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-amber-600 to-amber-700 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-4xl font-bold">50+</p>
                    <p className="text-gray-700 font-medium">Comunidades</p>
                  </div>
                </div>
                <p className="text-gray-600">Impacto en la Amazonía peruana</p>
              </div>
            </div>
          </section>

          {/* Why Volunteer Section with Images */}
          <section className="bg-gradient-to-br from-gray-50 to-emerald-50/30 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-gray-900 mb-4">¿Por qué ser voluntario en IIAP?</h3>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                  Forma parte de un equipo comprometido con la conservación y desarrollo sostenible de la Amazonía
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300">
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Heart className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h4 className="text-gray-900 mb-2">Impacto Real</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Contribuye directamente a proyectos que transforman comunidades amazónicas
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Target className="w-7 h-7 text-teal-700" />
                  </div>
                  <h4 className="text-gray-900 mb-2">Desarrollo Profesional</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Adquiere experiencia valiosa en investigación y conservación ambiental
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Users className="w-7 h-7 text-purple-700" />
                  </div>
                  <h4 className="text-gray-900 mb-2">Red de Contactos</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Conecta con profesionales y expertos en biodiversidad amazónica
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-300">
                  <div className="bg-gradient-to-br from-amber-100 to-amber-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Award className="w-7 h-7 text-amber-700" />
                  </div>
                  <h4 className="text-gray-900 mb-2">Certificación</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Recibe reconocimiento oficial por tu participación y compromiso
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Section with Image */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-teal-900/95"></div>
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1749006814203-3492cf3c2fe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtd29yayUyMGNvbW11bml0eSUyMGhlbHBpbmd8ZW58MXx8fHwxNzY0MjEzOTg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Trabajo en equipo"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white">
                <h3 className="text-white mb-6">Nuestro Impacto en la Amazonía</h3>
                <p className="text-emerald-100 text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
                  Juntos estamos construyendo un futuro sostenible para las comunidades amazónicas, 
                  protegiendo la biodiversidad y promoviendo el desarrollo responsable.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border-2 border-white/30">
                    <p className="text-5xl font-bold mb-2 text-amber-300">500+</p>
                    <p className="text-emerald-100">Voluntarios Activos</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border-2 border-white/30">
                    <p className="text-5xl font-bold mb-2 text-amber-300">25+</p>
                    <p className="text-emerald-100">Proyectos Completados</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border-2 border-white/30">
                    <p className="text-5xl font-bold mb-2 text-amber-300">15</p>
                    <p className="text-emerald-100">Años de Experiencia</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Convocatorias Section */}
          <section id="convocatorias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <h3 className="text-gray-900 mb-4">Convocatorias Disponibles</h3>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Explora nuestras oportunidades de voluntariado y encuentra la que mejor se ajuste a tus habilidades e intereses
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="text-gray-600 mt-4 font-medium">Cargando convocatorias...</p>
              </div>
            ) : activeConvocatorias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeConvocatorias.map((convocatoria) => (
                  <div 
                    key={convocatoria.id} 
                    className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300"
                  >
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3"></div>
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{convocatoria.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{convocatoria.description}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 rounded-full text-sm whitespace-nowrap ml-4 border-2 border-emerald-200 font-semibold">
                          ✓ Activa
                        </span>
                      </div>

                      <div className="space-y-3 mb-6 bg-gray-50 p-5 rounded-xl border-2 border-gray-100">
                        <div className="flex items-center gap-3 text-gray-800">
                          <div className="bg-emerald-100 p-2.5 rounded-lg shadow-sm">
                            <MapPin className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Área</p>
                            <p className="text-sm font-semibold">{convocatoria.area}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-800">
                          <div className="bg-teal-100 p-2.5 rounded-lg shadow-sm">
                            <Calendar className="w-4 h-4 text-teal-700" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Periodo</p>
                            <p className="text-sm font-semibold">
                              {new Date(convocatoria.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(convocatoria.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-800">
                          <div className="bg-purple-100 p-2.5 rounded-lg shadow-sm">
                            <Users className="w-4 h-4 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Vacantes disponibles</p>
                            <p className="text-sm font-semibold">{convocatoria.vacancies - (convocatoria.acceptedVolunteers || 0)} de {convocatoria.vacancies}</p>
                          </div>
                        </div>
                      </div>

                      {convocatoria.requirements && (
                        <div className="mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="text-amber-800 flex items-center gap-2 mb-2 font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Requisitos:
                            </span>
                            {convocatoria.requirements}
                          </p>
                        </div>
                      )}

                      <button 
                        onClick={() => {
                          // If user is not logged in, redirect to login
                          if (!currentUser) {
                            onLoginClick();
                            return;
                          }
                          // If user is logged in, show application modal
                          setSelectedConvocatoria(convocatoria);
                          setShowApplicationModal(true);
                        }}
                        className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                      >
                        <HandHeart className="w-5 h-5" />
                        {currentUser ? (
                          currentUser.role === 'admin' || currentUser.role === 'admin_master' 
                            ? 'Ver en Panel de Administración' 
                            : currentUser.role === 'volunteer' 
                            ? 'Ver en Mi Intranet'
                            : 'Postular Ahora'
                        ) : (
                          'Iniciar Sesión para Postular'
                        )}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-900 mb-2 font-semibold">No hay convocatorias activas en este momento</p>
                <p className="text-gray-600">Vuelve pronto para ver nuevas oportunidades de voluntariado</p>
              </div>
            )}
          </section>

          {/* About Section */}
          {about.published && (
            <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-emerald-100">
                  <div className="text-center mb-10">
                    <h3 className="text-gray-900 mb-4">Sobre el Programa de Voluntariado</h3>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto rounded-full"></div>
                  </div>
                  {loadingAbout ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {about.mission && (
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-emerald-100 p-3 rounded-lg shadow-md">
                              <Target className="w-6 h-6 text-emerald-700" />
                            </div>
                            <h4 className="text-gray-900">Nuestra Misión</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{about.mission}</p>
                        </div>
                      )}
                      {about.values && about.values.length > 0 && (
                        <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border-2 border-teal-200 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-teal-100 p-3 rounded-lg shadow-md">
                              <Leaf className="w-6 h-6 text-teal-700" />
                            </div>
                            <h4 className="text-gray-900">Nuestros Valores</h4>
                          </div>
                          <ul className="text-gray-700 space-y-3">
                            {about.values.slice(0, 4).map((value: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {about.vision && !about.values && (
                        <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border-2 border-teal-200 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-teal-100 p-3 rounded-lg shadow-md">
                              <Globe className="w-6 h-6 text-teal-700" />
                            </div>
                            <h4 className="text-gray-900">Nuestra Visión</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{about.vision}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
      
      {currentPage === 'projects' && (
        <>
          {/* Projects Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-4">Nuestros Proyectos</h2>
              <p className="text-gray-700 text-xl max-w-3xl mx-auto">
                Descubre los proyectos que impulsan el desarrollo sostenible de la Amazonía peruana
              </p>
            </div>

            {/* Projects Grid */}
            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="text-gray-600 mt-4 font-medium">Cargando proyectos...</p>
              </div>
            ) : publishedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedProjects.map((project) => (
                  <div key={project.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300">
                    <div className={`h-3 bg-gradient-to-r ${
                      project.status === 'activo'
                        ? 'from-emerald-600 to-teal-600'
                        : project.status === 'finalizado'
                        ? 'from-blue-600 to-blue-700'
                        : 'from-gray-400 to-gray-500'
                    }`}></div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-gray-900 flex-1 group-hover:text-emerald-700 transition-colors">{project.name}</h4>
                          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                            project.status === 'activo'
                              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200'
                              : project.status === 'finalizado'
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                          }`}>
                            {project.status === 'activo' ? '● Activo' : project.status === 'finalizado' ? '✓ Finalizado' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{project.description}</p>
                      </div>

                      <div className="mb-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-100">
                        <div className="flex items-center gap-3 text-gray-800">
                          <div className="bg-blue-100 p-2.5 rounded-lg shadow-sm">
                            <Calendar className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Duración</p>
                            <p className="text-sm font-semibold">
                              {new Date(project.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(project.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {project.objectives && (
                        <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="text-amber-800 flex items-center gap-2 mb-2 font-semibold">
                              <Target className="w-4 h-4" />
                              Objetivos:
                            </span>
                            {project.objectives}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-900 mb-2 font-semibold">No hay proyectos publicados en este momento</p>
                <p className="text-gray-600">Vuelve pronto para conocer nuestras iniciativas</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo y descripción */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoIIAP} alt="IIAP Logo" className="h-16 w-auto bg-white p-2 rounded-lg shadow-lg" />
                <div>
                  <h4 className="text-white">IIAP</h4>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Instituto de Investigaciones de la Amazonía Peruana. Comprometidos con el desarrollo sostenible de la Amazonía.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-white mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentPage('home')} className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                    Inicio
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage('areas')} className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                    Áreas de Trabajo
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage('about')} className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                    Nosotros
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage('projects')} className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                    Proyectos
                  </button>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-white mb-4">Contáctanos</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>voluntariado@iiap.gob.pe</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>+51 065 265515</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Iquitos, Loreto - Perú</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="text-center">
              {/* Botón de Intranet para usuarios autenticados */}
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'admin_master' || currentUser.role === 'volunteer') && onGoToIntranet && (
                <div className="mb-6">
                  <button
                    onClick={onGoToIntranet}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
                  >
                    <FolderOpen className="w-6 h-6" />
                    Ir a Mi Intranet
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-gray-400 text-sm mt-3">
                    {currentUser.role === 'admin' || currentUser.role === 'admin_master' 
                      ? 'Accede al panel de administración' 
                      : 'Accede a tu panel de voluntario'}
                  </p>
                </div>
              )}
              
              <p className="text-gray-400">
                © 2024 Instituto de Investigaciones de la Amazonía Peruana (IIAP). Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Sistema de Gestión de Voluntariado - Versión 1.0
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      {showApplicationModal && selectedConvocatoria && currentUser && (
        <ApplicationModal
          convocatoria={selectedConvocatoria}
          currentUser={currentUser}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedConvocatoria(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedConvocatoria(null);
          }}
        />
      )}
    </div>
  );
}