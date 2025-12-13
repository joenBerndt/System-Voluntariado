-- Tabla de Materiales de Capacitación
create table if not exists public.training_materials (
    id text primary key default uuid_generate_v4()::text,
    project_id text references public.projects(id) on delete cascade,
    title text not null,
    description text,
    type text default 'youtube', -- 'youtube', 'pdf', 'link'
    url text not null,
    "order" integer default 0,
    published boolean default false,
    created_at timestamp with time zone default now()
);

-- Tabla de Progreso de Materiales (para voluntarios)
create table if not exists public.material_progress (
    id text primary key default uuid_generate_v4()::text,
    material_id text references public.training_materials(id) on delete cascade,
    volunteer_id text references public.users(id) on delete cascade,
    viewed boolean default false,
    progress integer default 0, -- Porcentaje 0-100
    last_accessed timestamp with time zone default now(),
    unique(material_id, volunteer_id)
);
