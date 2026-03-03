import { LogIn, Target, Leaf, Globe, CheckCircle, Mail, Phone, MapPin, FolderOpen, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useApi } from '../hooks/useApi';
import { AreasPage } from './AreasPage';
import { AboutPage } from './AboutPage';
import { ApplicationModal } from '../components/common/ApplicationModal';
import { AreaProjectsModal } from '../components/common/AreaProjectsModal';
import { ProjectTeamModal } from '../components/common/ProjectTeamModal';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useProjects } from '../hooks/useProjects';
import { Convocatoria, Project, AboutData, User, ProjectAssignment, Area, Application } from '../types';
import logoIIAP from '../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

// Components
import { HomeContent } from '../components/landing/HomeContent';
import { ProjectsContent } from '../components/landing/ProjectsContent';
import { ConvocatoriaPublicDetail } from '../components/landing/ConvocatoriaPublicDetail';

interface LandingPageProps {
  onLoginClick: () => void;
  onPostular?: (convocatoriaId: string) => void;
  currentUser?: any;
  onGoToIntranet?: () => void;
  onPostulationSuccess?: () => void;
}

export function LandingPage({ onLoginClick, onPostular, currentUser, onGoToIntranet, onPostulationSuccess }: LandingPageProps) {
  const [currentPage, setCurrentPage] = useState<'home' | 'areas' | 'about' | 'projects'>('home');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [currentConvocatoriaIndex, setCurrentConvocatoriaIndex] = useState(0);
  const [viewConvocatoriaDetail, setViewConvocatoriaDetail] = useState<Convocatoria | null>(null);

  // Area and Project Modals
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showAreaProjectsModal, setShowAreaProjectsModal] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<any>(null);

  // Project Team Modal State
  const [showProjectTeamModal, setShowProjectTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ managers: any[], volunteers: any[] }>({ managers: [], volunteers: [] });

  const { showWarning } = useNotifications();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { convocatorias, activeConvocatorias, loading } = useConvocatorias();
  const { data: aboutData, loading: loadingAbout } = useApi<AboutData>('/about');
  const { projects, publishedProjects, loading: loadingProjects } = useProjects();
  const { data: usersData } = useApi<User[]>('/users');
  const { data: assignmentsData } = useApi<ProjectAssignment[]>('/project-assignments');
  const { data: areasData } = useApi<Area[]>('/areas');

  // Fetch user applications to prevent duplicate postulations
  const { data: userApplicationsData } = useApi<Application[]>(
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

  const filteredProjects = publishedProjects.filter(project => {
    const matchesArea = selectedAreaId ? project.areaId === selectedAreaId : true;
    const matchesStatus = filterStatus === 'all' ? true : project.status === filterStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const about = aboutData || {};

  const handleOpenTeamModal = (project: Project) => {
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
          <HomeContent
            setCurrentPage={setCurrentPage}
            activeConvocatorias={activeConvocatorias}
            itemsPerView={itemsPerView}
            currentConvocatoriaIndex={currentConvocatoriaIndex}
            handlePrevSlide={handlePrevSlide}
            handleNextSlide={handleNextSlide}
            setCurrentConvocatoriaIndex={setCurrentConvocatoriaIndex}
            setViewConvocatoriaDetail={setViewConvocatoriaDetail}
            currentUser={currentUser}
            hasAlreadyApplied={hasAlreadyApplied}
            onLoginClick={onLoginClick}
            showWarning={showWarning}
            onGoToIntranet={onGoToIntranet}
            setSelectedConvocatoria={setSelectedConvocatoria}
            setShowApplicationModal={setShowApplicationModal}
            loading={loading}
          />

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
        <ProjectsContent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedAreaId={selectedAreaId}
          setSelectedAreaId={setSelectedAreaId}
          areasData={areasData || []}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          loadingProjects={loadingProjects}
          filteredProjects={filteredProjects}
          handleOpenTeamModal={handleOpenTeamModal}
        />
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
        <ConvocatoriaPublicDetail
          viewConvocatoriaDetail={viewConvocatoriaDetail}
          setViewConvocatoriaDetail={setViewConvocatoriaDetail}
          currentUser={currentUser}
          onLoginClick={onLoginClick}
          hasAlreadyApplied={hasAlreadyApplied}
          showWarning={showWarning}
          onGoToIntranet={onGoToIntranet || (() => { })}
          setSelectedConvocatoria={setSelectedConvocatoria}
          setShowApplicationModal={setShowApplicationModal}
        />
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