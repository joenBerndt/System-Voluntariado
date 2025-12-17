import { Users, Calendar, MapPin, ArrowRight, LogIn, Heart, Target, Award, ChevronDown, Leaf, Globe, HandHeart, Mail, Phone, CheckCircle, Megaphone, FolderOpen, ChevronLeft, ChevronRight, X, Search, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useApi } from '../hooks/useApi';
import { AreasPage } from './AreasPage';
import { AboutPage } from './AboutPage';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ApplicationModal } from './ApplicationModal';
import { AreaProjectsModal } from './AreaProjectsModal';
import { ProjectTeamModal } from './ProjectTeamModal';
import logoIIAP from '../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface LandingPageProps {
  onLoginClick: () => void;
  onPostular?: (convocatoriaId: string) => void;
  currentUser?: any;
  onGoToIntranet?: () => void;
  onPostulationSuccess?: () => void;
}

export function LandingPage({ onLoginClick, onPostular, currentUser, onGoToIntranet, onPostulationSuccess }: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'areas' | 'about' | 'projects'>('home');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<any>(null);
  const [viewConvocatoriaDetail, setViewConvocatoriaDetail] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showAreaProjectsModal, setShowAreaProjectsModal] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<any>(null);
  const [showProjectTeamModal, setShowProjectTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ managers: any[], volunteers: any[] }>({ managers: [], volunteers: [] });

  const { showWarning } = useNotifications();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { data: convocatoriasData, loading } = useApi<any[]>('/convocatorias');
  const { data: aboutData, loading: loadingAbout } = useApi<any>('/about');
  const { data: projectsData, loading: loadingProjects } = useApi<any[]>('/projects');
  const { data: areasData } = useApi<any[]>('/areas');
  const { data: usersData } = useApi<any[]>('/users');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');

  const convocatorias = convocatoriasData || [];
  const projects = projectsData || [];

  // Only show active convocatorias (exclude terminated ones)
  const activeConvocatorias = convocatorias.filter(c => c.status === 'activa');

  // Fetch user applications to prevent duplicate postulations
  const { data: userApplicationsData } = useApi<any[]>(
    `/applications/user/${currentUser?.email || 'guest'}`,
    { fallbackOnError: true },
    [currentUser]
  );
  const userApplications = userApplicationsData || [];

  const hasAlreadyApplied = (convocatoriaId: string) => {
    // Check if there is any application that is NOT cancelled
    // We allow re-applying if the previous one was cancelled by the user
    return userApplications.some(app => app.convocatoriaId === convocatoriaId && app.status !== 'cancelled');
  };

  // Check for pending postulation on mount or when data loads
  useEffect(() => {
    const pendingId = localStorage.getItem('pendingPostulationId');
    if (pendingId && currentUser && activeConvocatorias.length > 0 && userApplicationsData) {
      const pendingConv = activeConvocatorias.find(c => c.id === pendingId);

      if (pendingConv) {
        // Check if already applied
        if (hasAlreadyApplied(pendingId)) {
          localStorage.removeItem('pendingPostulationId');
          showWarning('Ya estás participando', 'Ya te encuentras participando en esta convocatoria.', 15000, [
            { label: 'Ir a mi Intranet', onClick: () => onGoToIntranet && onGoToIntranet() },
            { label: 'Quedarme aquí', onClick: () => { }, variant: 'secondary' }
          ]);
        } else {
          // Open modal if not applied
          setSelectedConvocatoria(pendingConv);
          setShowApplicationModal(true);
          localStorage.removeItem('pendingPostulationId');
        }
      }
    }
  }, [currentUser, activeConvocatorias, userApplicationsData]); // Run when user or convocatorias load

  // Carousel State
  const [currentConvocatoriaIndex, setCurrentConvocatoriaIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Mobile: 1, Desktop: 2 (User requested 2)
      setItemsPerView(window.innerWidth < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextSlide = () => {
    if (activeConvocatorias.length <= itemsPerView) return;
    setCurrentConvocatoriaIndex(prev =>
      prev >= activeConvocatorias.length - itemsPerView ? 0 : prev + 1
    );
  };

  const handlePrevSlide = () => {
    if (activeConvocatorias.length <= itemsPerView) return;
    setCurrentConvocatoriaIndex(prev =>
      prev === 0 ? activeConvocatorias.length - itemsPerView : prev - 1
    );
  };

  useEffect(() => {
    if (activeConvocatorias.length <= itemsPerView) return;
    const interval = setInterval(handleNextSlide, 5000);
    return () => clearInterval(interval);
  }, [itemsPerView, activeConvocatorias.length]);

  // Only show published projects
  const getAreaName = (id: string) => {
    const area = areasData?.find(a => a.id === id);
    return area ? area.name : '';
  };

  const publishedProjects = projects.filter(p => p.published);

  const filteredProjects = publishedProjects.filter(project => {
    const matchesArea = selectedAreaId ? project.areaId === selectedAreaId : true;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const about = aboutData || {};

  const handleOpenTeamModal = (project: any) => {
    // Resolve Managers
    const managers = (project.managers || []).map((managerId: string) => {
      const user = usersData?.find(u => u.id === managerId);
      return user || { id: managerId, name: 'Usuario no encontrado' };
    });

    // Resolve Volunteers
    const projectAssignments = assignmentsData?.filter(a => a.projectId === project.id) || [];
    const volunteers = projectAssignments.map(assignment => {
      const user = usersData?.find(u => u.id === assignment.volunteerId);
      return user || { id: assignment.volunteerId, name: 'Voluntario no encontrado' };
    });

    setTeamMembers({ managers, volunteers });
    setSelectedProjectForTeam(project);
    setShowProjectTeamModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-lg shadow-md relative z-50 border-b-2 border-emerald-100">
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
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentPage === 'home'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => setCurrentPage('areas')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentPage === 'areas'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  Áreas
                </button>
                <button
                  onClick={() => setCurrentPage('about')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentPage === 'about'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                >
                  Nosotros
                </button>
                <button
                  onClick={() => setCurrentPage('projects')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentPage === 'projects'
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
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${currentPage === 'home'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-50'
                }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentPage('areas')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${currentPage === 'areas'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-50'
                }`}
            >
              Áreas
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${currentPage === 'about'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                : 'text-gray-700 hover:bg-emerald-50'
                }`}
            >
              Nosotros
            </button>
            <button
              onClick={() => setCurrentPage('projects')}
              className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${currentPage === 'projects'
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
      {/* Page Content */}
      {currentPage === 'areas' && (
        <AreasPage
          onNavigate={setCurrentPage}
          onSelectArea={(areaId) => {
            setSelectedAreaId(areaId);
            setShowAreaProjectsModal(true);
          }}
        />
      )}
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
              src="https://images.unsplash.com/photo-1749006814203-3492cf3c2fe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtd29yayUyMGNvbW11bml0eSUyMGhlbHBpbngfZW58MXx8fHwxNzY0MjEzOTg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden relative py-4 -mx-4 px-4 bg-transparent shadow-none border-none">
                  {/* Slides */}
                  <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentConvocatoriaIndex * (100 / itemsPerView)}%)` }}
                  >
                    {activeConvocatorias.map((convocatoria) => (
                      <div
                        key={convocatoria.id}
                        className="flex-shrink-0 px-3 transition-all duration-300"
                        style={{ width: `${100 / itemsPerView}%` }}
                      >
                        <div
                          className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300 h-full flex flex-col"
                        >
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 shrink-0"></div>
                          <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem]">{convocatoria.title}</h4>
                                <p className="text-gray-600 leading-relaxed line-clamp-3 min-h-[4.5rem]">{convocatoria.description}</p>
                              </div>
                              <span className="shrink-0 px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 rounded-full text-sm whitespace-nowrap ml-4 border-2 border-emerald-200 font-semibold">
                                ✓ Activa
                              </span>
                            </div>

                            <div className="space-y-3 mb-6 bg-gray-50 p-5 rounded-xl border-2 border-gray-100 flex-grow">
                              <div className="flex items-center gap-3 text-gray-800">
                                <div className="bg-emerald-100 p-2.5 rounded-lg shadow-sm shrink-0">
                                  <MapPin className="w-4 h-4 text-emerald-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Área</p>
                                  <p className="text-sm font-semibold truncate" title={convocatoria.area}>{convocatoria.area}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-gray-800">
                                <div className="bg-teal-100 p-2.5 rounded-lg shadow-sm shrink-0">
                                  <Calendar className="w-4 h-4 text-teal-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Periodo</p>
                                  <p className="text-sm font-semibold truncate">
                                    {new Date(convocatoria.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(convocatoria.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-gray-800">
                                <div className="bg-purple-100 p-2.5 rounded-lg shadow-sm shrink-0">
                                  <Users className="w-4 h-4 text-purple-700" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium">Vacantes disponibles</p>
                                  <p className="text-sm font-semibold">{convocatoria.vacancies - (convocatoria.acceptedCount || 0)} de {convocatoria.vacancies}</p>
                                </div>
                              </div>
                            </div>

                            {convocatoria.requirements && (
                              <div className="mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                                <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
                                  <span className="text-amber-800 inline-flex items-center gap-2 mb-1 font-semibold mr-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Requisitos:
                                  </span>
                                  {convocatoria.requirements}
                                </p>
                              </div>
                            )}

                            <div className="mt-auto pt-4 flex flex-col gap-3">
                              {/* View Detail Button */}
                              <button
                                onClick={() => setViewConvocatoriaDetail(convocatoria)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-all duration-200 font-semibold"
                              >
                                <BookOpen className="w-5 h-5" />
                                Ver Detalle
                              </button>

                              <button
                                disabled={(convocatoria.vacancies - (convocatoria.acceptedCount || 0)) <= 0}
                                onClick={() => {
                                  // If full, do nothing (disabled)
                                  if ((convocatoria.vacancies - (convocatoria.acceptedCount || 0)) <= 0) return;

                                  // If user is not logged in, redirect to login
                                  if (!currentUser) {
                                    localStorage.setItem('pendingPostulationId', convocatoria.id);
                                    onLoginClick();
                                    return;
                                  }
                                  // If user is logged in, check if already applied
                                  if (hasAlreadyApplied(convocatoria.id)) {
                                    showWarning('Ya estás participando', 'Ya te encuentras participando en esta convocatoria.', 15000, [
                                      { label: 'Ir a mi Intranet', onClick: () => onGoToIntranet && onGoToIntranet() },
                                      { label: 'Quedarme aquí', onClick: () => { }, variant: 'secondary' }
                                    ]);
                                    return;
                                  }

                                  // Show application modal
                                  setSelectedConvocatoria(convocatoria);
                                  setShowApplicationModal(true);
                                }}
                                className={`group/btn w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl transition-all duration-200 shadow-lg font-semibold ${(convocatoria.vacancies - (convocatoria.acceptedCount || 0)) <= 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl'
                                  }`}
                              >
                                {(convocatoria.vacancies - (convocatoria.acceptedCount || 0)) <= 0 ? (
                                  <>
                                    <X className="w-5 h-5" />
                                    Convocatoria Completa
                                  </>
                                ) : (
                                  <>
                                    <HandHeart className="w-5 h-5" />
                                    {currentUser ? (
                                      currentUser.role === 'admin' || currentUser.role === 'admin_master'
                                        ? 'Ver Admin'
                                        : currentUser.role === 'volunteer'
                                          ? 'Ver Mi Intranet'
                                          : 'Postular Ahora'
                                    ) : (
                                      'Iniciar Sesión para Postular'
                                    )}
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  {activeConvocatorias.length > itemsPerView && (
                    <>
                      <button
                        onClick={handlePrevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-100 transition-all z-10 hover:scale-110 ml-1"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-100 transition-all z-10 hover:scale-110 mr-1"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Dots / Indicators */}
                  {activeConvocatorias.length > itemsPerView && (
                    <div className="flex justify-center gap-2 mt-6">
                      {Array.from({ length: activeConvocatorias.length - itemsPerView + 1 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentConvocatoriaIndex(idx)}
                          className={`rounded-full transition-all duration-300 ${idx === currentConvocatoriaIndex ? 'bg-emerald-600 w-8 h-2.5' : 'bg-gray-300 hover:bg-emerald-400 w-2.5 h-2.5'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
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
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 font-display">
                Explora Nuestros <span className="text-emerald-600">Proyectos</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Proyectos reales que transforman comunidades
              </p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  />
                </div>

                {/* Area Filter */}
                <div className="sm:w-64 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FolderOpen className="text-gray-400 w-5 h-5" />
                  </div>
                  <select
                    value={selectedAreaId || ''}
                    onChange={(e) => setSelectedAreaId(e.target.value || null)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                  >
                    <option value="">Todas las Áreas</option>
                    {areasData?.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div className="sm:w-48 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar className="text-gray-400 w-5 h-5" />
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto">
              {selectedAreaId
                ? 'Explora las iniciativas específicas de esta área de investigación'
                : 'Descubre los proyectos que impulsan el desarrollo sostenible de la Amazonía peruana'}
            </p>
            {selectedAreaId && (
              <button
                onClick={() => setSelectedAreaId(null)}
                className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium border border-gray-200 inline-flex items-center gap-2"
              >
                <X size={16} /> Ver todos los proyectos
              </button>
            )}


            {/* Projects Grid */}
            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="text-gray-600 mt-4 font-medium">Cargando proyectos...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-300">
                    <div className={`h-3 bg-gradient-to-r ${project.status === 'activo'
                      ? 'from-emerald-600 to-teal-600'
                      : project.status === 'finalizado'
                        ? 'from-blue-600 to-blue-700'
                        : 'from-gray-400 to-gray-500'
                      }`}></div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-gray-900 flex-1 group-hover:text-emerald-700 transition-colors">{project.name}</h4>
                          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${project.status === 'activo'
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

                      <button
                        onClick={() => handleOpenTeamModal(project)}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <Users className="w-4 h-4" />
                        Ver Equipo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-900 mb-2 font-semibold">No hay proyectos publicados {selectedAreaId ? 'en esta área' : 'en este momento'}</p>
                <p className="text-gray-600">Vuelve pronto para conocer nuestras iniciativas {selectedAreaId && <button onClick={() => setSelectedAreaId(null)} className="text-emerald-600 font-semibold hover:underline">o ver todos los proyectos</button>}</p>
              </div>
            )}
          </section>
        </>
      )
      }

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

      {/* Area Projects Modal */}
      {
        selectedAreaId && showAreaProjectsModal && (
          <AreaProjectsModal
            isOpen={showAreaProjectsModal}
            onClose={() => setShowAreaProjectsModal(false)}
            areaName={getAreaName(selectedAreaId)}
            projects={filteredProjects}
            onViewAll={() => {
              setShowAreaProjectsModal(false);
              setCurrentPage('projects');
              setTimeout(() => {
                const element = document.getElementById('projects-section-top');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )
      }



      {/* Public Detail Modal */}
      {viewConvocatoriaDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900 pr-8">{viewConvocatoriaDetail.title}</h3>
              <button
                onClick={() => setViewConvocatoriaDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1 text-emerald-800 font-semibold">
                    <MapPin className="w-4 h-4" /> Área
                  </div>
                  <p className="text-emerald-900 pl-6">{viewConvocatoriaDetail.area}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2 mb-1 text-teal-800 font-semibold">
                    <Calendar className="w-4 h-4" /> Periodo
                  </div>
                  <p className="text-teal-900 pl-6">
                    {new Date(viewConvocatoriaDetail.startDate).toLocaleDateString('es-ES')} - {new Date(viewConvocatoriaDetail.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-1 text-purple-800 font-semibold">
                    <Users className="w-4 h-4" /> Vacantes
                  </div>
                  <p className="text-purple-900 pl-6">
                    {viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)} disponibles
                  </p>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                  Descripción
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {viewConvocatoriaDetail.description}
                </p>
              </div>

              {viewConvocatoriaDetail.requirements && (
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Requisitos
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-200">
                    {viewConvocatoriaDetail.requirements}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setViewConvocatoriaDetail(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Check vacanties
                    if ((viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0) return;

                    if (!currentUser) {
                      localStorage.setItem('pendingPostulationId', viewConvocatoriaDetail.id);
                      onLoginClick();
                      return;
                    }

                    // Check if already applied
                    if (hasAlreadyApplied(viewConvocatoriaDetail.id)) {
                      showWarning('Ya estás participando', 'Ya te encuentras participando en esta convocatoria.', 15000, [
                        { label: 'Ir a mi Intranet', onClick: () => onGoToIntranet && onGoToIntranet() },
                        { label: 'Quedarme aquí', onClick: () => { }, variant: 'secondary' }
                      ]);
                      return;
                    }

                    setViewConvocatoriaDetail(null);
                    setSelectedConvocatoria(viewConvocatoriaDetail);
                    setShowApplicationModal(true);
                  }}
                  disabled={(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all ${(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:translate-y-0.5'
                    }`}
                >
                  {(viewConvocatoriaDetail.vacancies - (viewConvocatoriaDetail.acceptedCount || 0)) <= 0 ? 'Convocatoria Completa' : 'Postular Ahora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {
        showApplicationModal && selectedConvocatoria && currentUser && (
          <ApplicationModal
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedConvocatoria(null);
              // If user cancels, we must clear the pending state so it doesn't reopen on refresh
              localStorage.removeItem('pendingPostulationId');
            }}
            convocatoria={selectedConvocatoria}
            currentUser={currentUser}
            onSuccess={() => {
              setShowApplicationModal(false);
              setSelectedConvocatoria(null);
              localStorage.removeItem('pendingPostulationId'); // Clear on success too
              if (onPostulationSuccess) onPostulationSuccess();
            }}
          />
        )
      }

      {/* Project Team Modal */}
      <ProjectTeamModal
        isOpen={showProjectTeamModal}
        onClose={() => setShowProjectTeamModal(false)}
        projectName={selectedProjectForTeam?.name || ''}
        managers={teamMembers.managers}
        volunteers={teamMembers.volunteers}
      />
    </div >
  );
}