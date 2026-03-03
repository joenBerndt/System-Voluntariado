import { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../../hooks/useApi';
import { useNotifications } from '../../contexts/NotificationContext';
// Components
import { VideoMaterialModal } from './content/VideoMaterialModal';
import { ProjectSelector } from './content/ProjectSelector';
import { MaterialList } from './content/MaterialList';
import { VolunteerProgressModal } from './content/VolunteerProgressModal';

interface ContentManagementProps {
  currentUser: any;
}

export function ContentManagement({ currentUser }: ContentManagementProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [viewingProgress, setViewingProgress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [projectPage, setProjectPage] = useState(0);
  const [projectSearch, setProjectSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState('');

  const { showSuccess, showError, showLoading, hideNotification } = useNotifications();

  // API Hooks
  const { data: projectsData, isLoading: loadingProjects } = useApi<any[]>('/projects');
  const { data: assignmentsData } = useApi<any[]>('/project-assignments');
  const { data: volunteersData } = useApi<any[]>('/volunteers');
  const { data: usersData } = useApi<any[]>('/users');
  const { data: materialsData, refetch: refetchMaterials, isLoading: loadingMaterials } = useApi<any[]>('/training-materials');
  const { data: progressData } = useApi<any[]>('/material-progress');

  const projects = projectsData || [];
  const assignments = assignmentsData || [];
  const volunteers = volunteersData || [];
  const materials = materialsData || [];
  const progress = progressData || [];
  const admins = usersData?.filter(u => u.role === 'admin') || [];

  // Filter projects
  const myProjects = projects.filter(p => {
    if (currentUser?.role === 'admin_master') return true;
    const isManager = p.managers && p.managers.includes(currentUser?.id);
    const isAssigned = currentUser?.role === 'volunteer' &&
      assignments.some(a => a.projectId === p.id && a.volunteerId === currentUser?.id);
    return isManager || isAssigned;
  });

  const filteredProjects = myProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesManager = managerFilter ? p.managers && p.managers.includes(managerFilter) : true;
    return matchesSearch && matchesManager;
  });

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Helper functions
  const projectMaterials = selectedProject
    ? materials.filter(m => m.projectId === selectedProject.id).sort((a, b) => a.order - b.order)
    : [];

  const getProjectVolunteers = (projectId: string) => {
    const projectAssignments = assignments.filter(a => a.projectId === projectId);
    return projectAssignments
      .map(a => volunteers.find(v => v.id === a.volunteerId))
      .filter(Boolean);
  };

  const getMaterialProgress = (materialId: string) => {
    return progress.filter(p => p.materialId === materialId);
  };

  const getViewCount = (materialId: string) => {
    return getMaterialProgress(materialId).filter(p => p.viewed).length;
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Handlers
  const handleCreateMaterial = () => {
    if (!selectedProject) {
      showError('Proyecto no seleccionado', 'Por favor selecciona un proyecto primero');
      return;
    }
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async (materialData: any) => {
    const loadingId = showLoading(
      materialData.id ? 'Actualizando video...' : 'Creando video...',
      'Por favor espera un momento'
    );
    setIsSaving(true);
    try {
      if (materialData.id) {
        await apiPut(`/training-materials/${materialData.id}`, materialData);
        hideNotification(loadingId);
        showSuccess('¡Video actualizado!', `El video "${materialData.title}" se actualizó correctamente`);
      } else {
        await apiPost('/training-materials', materialData);
        hideNotification(loadingId);
        showSuccess('¡Video creado exitosamente!', `El video "${materialData.title}" está listo para ser usado`);
      }
      setIsModalOpen(false);
      setEditingMaterial(null);
      setTimeout(() => refetchMaterials(), 300);
    } catch (err: any) {
      hideNotification(loadingId);
      showError('Error al guardar video', err?.message || 'No se pudo guardar el video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string, materialTitle: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este video?\n\nSe eliminará también el progreso de los voluntarios.')) {
      return;
    }
    const loadingId = showLoading('Eliminando video...', 'Espera un momento');
    try {
      await apiDelete(`/training-materials/${materialId}`);
      hideNotification(loadingId);
      showSuccess('¡Video eliminado!', `El video "${materialTitle}" fue eliminado correctamente`);
      refetchMaterials();
    } catch (err: any) {
      hideNotification(loadingId);
      showError('Error al eliminar video', err?.message || 'No se pudo eliminar el video.');
    }
  };

  const handleTogglePublish = async (material: any) => {
    const newStatus = !material.published;
    const actionText = newStatus ? 'Publicando' : 'Ocultando';
    const loadingId = showLoading(`${actionText} video...`, 'Actualizando visibilidad');
    try {
      await apiPut(`/training-materials/${material.id}`, { ...material, published: newStatus });
      hideNotification(loadingId);
      showSuccess(
        newStatus ? '¡Video publicado!' : 'Video ocultado',
        newStatus ? 'El video ahora es visible para los voluntarios' : 'El video ya no es visible para los voluntarios'
      );
      refetchMaterials();
    } catch (err: any) {
      hideNotification(loadingId);
      showError('Error', 'No se pudo actualizar el estado del video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Materiales de Capacitación</h2>
        <p className="text-gray-500 mt-1">Administra videos de capacitación y monitorea el progreso de tus voluntarios</p>
      </div>

      <ProjectSelector
        projectSearch={projectSearch}
        setProjectSearch={setProjectSearch}
        managerFilter={managerFilter}
        setManagerFilter={setManagerFilter}
        setProjectPage={setProjectPage}
        admins={admins}
        loadingProjects={loadingProjects}
        filteredProjects={filteredProjects}
        projectPage={projectPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalPages={totalPages}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        getProjectVolunteers={getProjectVolunteers}
        materials={materials}
      />

      <MaterialList
        selectedProject={selectedProject}
        loadingMaterials={loadingMaterials}
        projectMaterials={projectMaterials}
        getViewCount={getViewCount}
        getYouTubeVideoId={getYouTubeVideoId}
        setViewingProgress={setViewingProgress}
        handleEditMaterial={handleEditMaterial}
        handleTogglePublish={handleTogglePublish}
        handleDeleteMaterial={handleDeleteMaterial}
        handleCreateMaterial={handleCreateMaterial}
        isSaving={isSaving}
      />

      {/* Modal para crear/editar material */}
      {isModalOpen && selectedProject && (
        <VideoMaterialModal
          material={editingMaterial}
          projectId={selectedProject.id}
          onClose={() => {
            if (!isSaving) {
              setIsModalOpen(false);
              setEditingMaterial(null);
            }
          }}
          onSave={handleSaveMaterial}
          isSaving={isSaving}
        />
      )}

      {/* Modal de progreso de voluntarios */}
      <VolunteerProgressModal
        viewingProgress={viewingProgress}
        selectedProject={selectedProject}
        setViewingProgress={setViewingProgress}
        getProjectVolunteers={getProjectVolunteers}
        progress={progress}
      />
    </div>
  );
}
