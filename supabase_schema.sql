-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- 1. Tabla de Usuarios (Users)
-- Nota: Idealmente deberías usar Supabase Auth (tabla auth.users), pero crearemos una tabla pública para mantener la lógica actual.
create table if not exists public.users (
    id text primary key default uuid_generate_v4()::text,
    email text unique not null,
    name text,
    phone text,
    area text,
    skills text,
    status text default 'activo',
    role text default 'user', -- 'user', 'volunteer', 'admin', 'admin_master'
    registered_date date default current_date,
    password text, -- ADVERTENCIA: Almacenar contraseñas en texto plano es inseguro. Se recomienda usar Supabase Auth.
    created_at timestamp with time zone default now()
);

-- 2. Tabla de Proyectos (Projects)
create table if not exists public.projects (
    id text primary key default uuid_generate_v4()::text,
    name text not null,
    description text,
    status text default 'activo',
    image text,
    location text,
    area_id text references public.areas(id),
    start_date date,
    end_date date,
    objectives text,
    published boolean default false,
    managers text[], -- Array of user IDs
    created_date date default current_date,
    created_at timestamp with time zone default now()
);

-- 3. Tabla de Áreas (Areas)
create table if not exists public.areas (
    id text primary key default uuid_generate_v4()::text,
    name text not null,
    description text,
    icon text,
    image_url text,
    published boolean default true,
    created_at timestamp with time zone default now()
);

-- 4. Tabla de Convocatorias
create table if not exists public.convocatorias (
    id text primary key default uuid_generate_v4()::text,
    title text not null,
    description text,
    area text, -- Podría ser FK a areas.id si se desea normalizar
    start_date date,
    end_date date,
    vacancies integer default 0,
    applicants_count integer default 0, -- Se puede calcular con count(*), pero mantenemos el campo por compatibilidad
    accepted_count integer default 0,
    requirements text,
    status text default 'activa',
    project_id text references public.projects(id) on delete set null,
    manager_id text references public.users(id),
    created_date date default current_date,
    created_at timestamp with time zone default now()
);

-- 5. Tabla de Postulaciones (Applications)
create table if not exists public.applications (
    id text primary key default uuid_generate_v4()::text,
    user_email text references public.users(email) on delete cascade, -- Enlazamos por email según tu lógica actual
    convocatoria_id text references public.convocatorias(id) on delete cascade,
    convocatoria_title text,
    user_name text,
    user_phone text,
    motivation text,
    experience text,
    interview_date date,
    interview_time text,
    interview_location text,
    interview_notes text,
    interview_confirmed_date date,
    accepted_date date,
    rejected_date date,
    status text default 'pending', -- 'pending', 'accepted', 'rejected', etc.
    applied_date date default current_date,
    created_at timestamp with time zone default now()
);

-- 6. Tabla de Asignaciones de Proyecto (Project Assignments)
create table if not exists public.project_assignments (
    id text primary key default uuid_generate_v4()::text,
    volunteer_id text references public.users(id) on delete cascade,
    project_id text references public.projects(id) on delete cascade,
    convocatoria_id text references public.convocatorias(id) on delete set null,
    assigned_at timestamp with time zone default now(),
    status text default 'active'
);

-- 7. Tabla de Información General (About Info)
create table if not exists public.about_info (
    id text primary key default 'info',
    mission text,
    vision text,
    history text,
    values jsonb, -- Array de valores almacenado como JSON
    published boolean default true,
    updated_at timestamp with time zone default now()
);

-- Políticas de Seguridad (RLS) - Opcional pero recomendado
-- alter table public.users enable row level security;
-- create policy "Lectura pública" on public.users for select using (true);
