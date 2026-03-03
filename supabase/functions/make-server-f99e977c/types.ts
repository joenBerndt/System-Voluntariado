export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'admin_master' | 'admin_junior' | 'volunteer' | 'user';
    phone?: string;
    area?: string;
    photo_url?: string;
    status?: string;
    registered_date?: string;
    cv_url?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
}

export interface ActivityLog {
    id?: string;
    action_type: string;
    entity_type: string;
    entity_id?: string;
    details: string;
    metadata?: any;
    performer_id?: string;
    performer_name?: string;
    performer_email?: string;
    created_at?: string;
}
