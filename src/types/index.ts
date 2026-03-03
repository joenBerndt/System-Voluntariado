export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin_master' | 'admin' | 'volunteer' | 'candidate' | 'guest';
    status: 'active' | 'inactive' | 'pending';
    phone?: string;
    dni?: string;
    profileImage?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    areaId: string;
    status: 'activo' | 'inactivo' | 'finalizado';
    startDate: string;
    endDate: string;
    imageUrl?: string;
    managers?: string[]; // Array of User IDs
    published?: boolean;
    objectives?: string; // Added based on usage in ProjectsContent
    createdAt?: string;
    updatedAt?: string;
}

export interface Convocatoria {
    id: string;
    title: string;
    description: string;
    area: string; // This seems to be a string name, not an ID in some contexts, but let's check
    status: 'activa' | 'cerrada' | 'borrador';
    startDate: string;
    endDate: string;
    vacancies: number;
    projectId?: string;
    requirements?: string[];
    benefits?: string[];
    imageUrl?: string;
    acceptedCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Area {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    published?: boolean;
}

export interface Application {
    id: string;
    convocatoriaId: string;
    userId: string; // helper or candidate
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'entrevista' | 'cancelled';
    appliedAt: string;
    cvUrl?: string;
    motivation?: string;
}

export interface ProjectAssignment {
    id: string;
    projectId: string;
    volunteerId: string;
    role: string;
    assignedAt: string;
    status: 'active' | 'inactive';
}

export interface AboutData {
    mission?: string;
    vision?: string;
    values?: string[];
    history?: string;
    published?: boolean;
}
