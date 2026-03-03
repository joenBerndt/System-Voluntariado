import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Megaphone, Calendar, Globe, Heart, Target, Users, Award, MapPin, CheckCircle, BookOpen, X, HandHeart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

import { Convocatoria } from '../../types';

interface HomeContentProps {
    setCurrentPage: (page: any) => void;
    activeConvocatorias: Convocatoria[];
    itemsPerView: number;
    currentConvocatoriaIndex: number;
    handlePrevSlide: () => void;
    handleNextSlide: () => void;
    setCurrentConvocatoriaIndex: (idx: number) => void;
    setViewConvocatoriaDetail: (conv: Convocatoria) => void;
    currentUser: any;
    hasAlreadyApplied: (id: string) => boolean;
    onLoginClick: () => void;
    showWarning: (title: string, msg: string, time: number, actions?: any[]) => void;
    onGoToIntranet: () => void;
    setSelectedConvocatoria: (conv: Convocatoria) => void;
    setShowApplicationModal: (val: boolean) => void;
    loading: boolean;
}

export function HomeContent({
    setCurrentPage,
    activeConvocatorias,
    itemsPerView,
    currentConvocatoriaIndex,
    handlePrevSlide,
    handleNextSlide,
    setCurrentConvocatoriaIndex,
    setViewConvocatoriaDetail,
    currentUser,
    hasAlreadyApplied,
    onLoginClick,
    showWarning,
    onGoToIntranet,
    setSelectedConvocatoria,
    setShowApplicationModal,
    loading
}: HomeContentProps) {
    return (
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
        </>
    );
}
