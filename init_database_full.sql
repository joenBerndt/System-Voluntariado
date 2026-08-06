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
CREATE TABLE kv_store_f99e977c (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Optional: Enable RLS but allow public access for now since logic is handled in Edge Function
ALTER TABLE kv_store_f99e977c ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for service role" ON kv_store_f99e977c
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
-- Run this command in your Supabase SQL Editor to fix both projects and convocatorias tables

-- ==========================================
-- 1. Fix PROJECTS table
-- ==========================================

-- Rename title to name if it exists (and name doesn't)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'name') THEN
    ALTER TABLE public.projects RENAME COLUMN title TO name;
  END IF;
END $$;

-- Add missing columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS area_id text references public.areas(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objectives text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published boolean default false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS managers text[];

-- ==========================================
-- 2. Fix CONVOCATORIAS table
-- ==========================================

-- Add missing columns to convocatorias
ALTER TABLE public.convocatorias ADD COLUMN IF NOT EXISTS manager_id text references public.users(id);

-- Check if 'area' column exists, if not add it (it should exist based on schema, but just in case)
ALTER TABLE public.convocatorias ADD COLUMN IF NOT EXISTS area text;
-- Add photo_url column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url text;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Policy to allow authenticated uploads
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );
-- Run this command in your Supabase SQL Editor to fix the projects table

-- Rename title to name if it exists
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') THEN
    ALTER TABLE public.projects RENAME COLUMN title TO name;
  END IF;
END $$;

-- Add missing columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS area_id text references public.areas(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objectives text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published boolean default false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS managers text[];
-- Run this command in your Supabase SQL Editor to fix the areas table
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS image_url text;
-- Run this command in your Supabase SQL Editor to fix the applications table

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS motivation text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS convocatoria_title text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_phone text;
-- Run this command in your Supabase SQL Editor to fix the applications table for interviews

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_time text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_location text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_notes text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_confirmed_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS accepted_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS rejected_date date;
-- 1. Actualizar el conteo de aceptados (accepted_count) en la tabla convocatorias
-- basado en las aplicaciones reales que tienen estado 'accepted'
UPDATE public.convocatorias c
SET accepted_count = (
    SELECT count(*)
    FROM public.applications a
    WHERE a.convocatoria_id = c.id AND a.status = 'accepted'
);

-- 2. Actualizar el estado a 'cerrada' si las vacantes están llenas
UPDATE public.convocatorias
SET status = 'cerrada'
WHERE accepted_count >= vacancies AND status = 'activa';

-- 3. Asegurar que accepted_count no sea nulo
UPDATE public.convocatorias
SET accepted_count = 0
WHERE accepted_count IS NULL;
-- Script para asegurar la base de datos y corregir los warnings de "RLS Disabled"
-- Habilitar Row Level Security (RLS) en todas las tablas

-- 1. Tabla about_info
ALTER TABLE public.about_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.about_info FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.about_info FOR SELECT TO anon USING (true);

-- 2. Tabla kv_store_f99e977c
ALTER TABLE public.kv_store_f99e977c ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.kv_store_f99e977c FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Tabla areas
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.areas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.areas FOR SELECT TO anon USING (true); -- Permitir ver áreas en landing

-- 4. Tabla convocatorias
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.convocatorias FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.convocatorias FOR SELECT TO anon USING (true); -- Permitir ver convocatorias en landing

-- 5. Tabla applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.applications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Tabla training_materials
ALTER TABLE public.training_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.training_materials FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. Tabla projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.projects FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Si los proyectos se ven en la landing page directamente desde supabase storage o similar, necesitarían read. 
-- Pero el código usa fetch a la Edge Function, así que anon NO necesita acceso directo.
-- SIN EMBARGO, si hay imágenes o algo público, lo manejaremos con policies de Storage, no de tabla.

-- 9. Tabla material_progress
ALTER TABLE public.material_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.material_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 10. Tabla project_assignments
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.project_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 11. Tabla activity_logs (si existe y tiene warning)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servidor function access" ON public.activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Nota: Como tu aplicación usa una Edge Function (make-server) para todo el acceso a datos,
-- la clave 'service_role' (que usa la Edge Function) tendrá acceso total gracias a las políticas creadas arriba.
-- La clave 'anon' (que tiene el navegador) ya NO tendrá acceso directo a las tablas (excepto lectura en areas/convocatorias si se configuró explícitamente),
-- forzando así que todo pase por tu API segura.

-- ==============================================================================
-- ACTUALIZACIONES DE ESQUEMA Y DATOS (SEMILLA)
-- ==============================================================================

-- 1. Asegurar columnas para Entrevistas en tabla 'applications'
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "interview_date" date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "interview_time" time;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "interview_location" text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "interview_notes" text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "interview_confirmed_date" date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "accepted_date" date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS "rejected_date" date;

-- 2. Insertar Usuario Administrador por defecto (si no existe)
-- Nota: La contraseña 'admin123' se almacena en texto plano por compatibilidad con el sistema actual.
-- Se recomienda migrar a hashing en el futuro.
INSERT INTO public.users (id, name, email, password, role, phone, area, status, registered_date)
VALUES (
  'admin-master-001',
  'Administrador Master',
  'admin@iiap.org',
  'admin123',
  'admin_master',
  '+51 065 265515',
  'Administración General',
  'activo',
  CURRENT_DATE
)
ON CONFLICT (email) DO NOTHING;

-- CLEANUP
-- TRUNCATE TABLE public.project_assignments, public.applications, public.convocatorias, public.projects, public.areas, public.users CASCADE;

-- 1. AREAS (6 Areas)
INSERT INTO public.areas (id, name, description, icon, published) VALUES
('a0000000-0000-0000-0000-000000000001', 'Educación Ambiental', 'Fomento de la conciencia ambiental.', 'BookOpen', true),
('a0000000-0000-0000-0000-000000000002', 'Restauración Ecológica', 'Recuperación de ecosistemas.', 'Leaf', true),
('a0000000-0000-0000-0000-000000000003', 'Tecnología e Innovación', 'Herramientas tech para conservación.', 'Cpu', true),
('a0000000-0000-0000-0000-000000000004', 'Investigación Científica', 'Estudios de biodiversidad.', 'Microscope', true),
('a0000000-0000-0000-0000-000000000005', 'Gestión de Residuos', 'Reciclaje y economía circular.', 'Trash2', true),
('a0000000-0000-0000-0000-000000000006', 'Turismo Sostenible', 'Ecoturismo comunitario.', 'Map', true)
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (10 Admins + 15 Volunteers + 10 Applicants/Users)
-- Using 'created_at' and 'registered_date' if available, but staying safe with created_at which is usually present
INSERT INTO public.users (id, email, name, role, phone, created_at, status) VALUES
-- 10 ADMINS
('b0000000-0000-0000-0000-000000000001', 'admin.ana@iiap.gob.pe', 'Ana García', 'admin', '900000001', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000002', 'admin.beto@iiap.gob.pe', 'Beto Torres', 'admin', '900000002', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000003', 'admin.carla@iiap.gob.pe', 'Carla Méndez', 'admin', '900000003', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000004', 'admin.daniel@iiap.gob.pe', 'Daniel Ruiz', 'admin', '900000004', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000005', 'admin.elena@iiap.gob.pe', 'Elena Paz', 'admin', '900000005', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000006', 'admin.felipe@iiap.gob.pe', 'Felipe Castro', 'admin', '900000006', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000007', 'admin.gabriela@iiap.gob.pe', 'Gabriela Sol', 'admin', '900000007', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000008', 'admin.hugo@iiap.gob.pe', 'Hugo Chavez', 'admin', '900000008', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000009', 'admin.ines@iiap.gob.pe', 'Ines Velez', 'admin', '900000009', NOW(), 'active'),
('b0000000-0000-0000-0000-000000000010', 'admin.javier@iiap.gob.pe', 'Javier Luna', 'admin', '900000010', NOW(), 'active'),

-- 15 VOLUNTEERS
('c0000000-0000-0000-0000-000000000001', 'vol.karen@gmail.com', 'Karen Silva', 'volunteer', '990000001', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000002', 'vol.luis@gmail.com', 'Luis Perea', 'volunteer', '990000002', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000003', 'vol.maria@gmail.com', 'Maria Cruz', 'volunteer', '990000003', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000004', 'vol.nelson@gmail.com', 'Nelson Diaz', 'volunteer', '990000004', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000005', 'vol.olga@gmail.com', 'Olga Rios', 'volunteer', '990000005', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000006', 'vol.pedro@gmail.com', 'Pedro Vega', 'volunteer', '990000006', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000007', 'vol.quique@gmail.com', 'Quique Mar', 'volunteer', '990000007', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000008', 'vol.rosa@gmail.com', 'Rosa Luz', 'volunteer', '990000008', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000009', 'vol.sara@gmail.com', 'Sara Tello', 'volunteer', '990000009', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000010', 'vol.tito@gmail.com', 'Tito Alba', 'volunteer', '990000010', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000011', 'vol.ursula@gmail.com', 'Ursula Pons', 'volunteer', '990000011', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000012', 'vol.victor@gmail.com', 'Victor Jara', 'volunteer', '990000012', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000013', 'vol.wendy@gmail.com', 'Wendy Sulca', 'volunteer', '990000013', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000014', 'vol.xavi@gmail.com', 'Xavi Hernandez', 'volunteer', '990000014', NOW(), 'active'),
('c0000000-0000-0000-0000-000000000015', 'vol.yola@gmail.com', 'Yola Polastri', 'volunteer', '990000015', NOW(), 'active'),

-- 10 APPLICANTS (Role 'user')
('f0000000-0000-0000-0000-000000000001', 'user.alex@gmail.com', 'Alex Campos', 'user', '980000001', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000002', 'user.bianca@gmail.com', 'Bianca Flor', 'user', '980000002', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000003', 'user.carlos@gmail.com', 'Carlos Vives', 'user', '980000003', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000004', 'user.diana@gmail.com', 'Diana Prince', 'user', '980000004', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000005', 'user.edgar@gmail.com', 'Edgar Allan', 'user', '980000005', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000006', 'user.fanny@gmail.com', 'Fanny Lu', 'user', '980000006', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000007', 'user.gino@gmail.com', 'Gino Pesaressi', 'user', '980000007', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000008', 'user.hilda@gmail.com', 'Hilda Gadea', 'user', '980000008', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000009', 'user.ivan@gmail.com', 'Ivan Cruz', 'user', '980000009', NOW(), 'active'),
('f0000000-0000-0000-0000-000000000010', 'user.julia@gmail.com', 'Julia Roberts', 'user', '980000010', NOW(), 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. PROJECTS (30 Projects)
INSERT INTO public.projects (id, name, description, area_id, start_date, end_date, objectives, status, published) VALUES
-- Area 1
('d0000000-0000-0000-0000-000000000001', 'Escuelas Verdes I', 'Educación primaria.', 'a0000000-0000-0000-0000-000000000001', '2025-01-01', '2025-06-01', 'Educar.', 'activo', true),
('d0000000-0000-0000-0000-000000000002', 'Escuelas Verdes II', 'Educación secundaria.', 'a0000000-0000-0000-0000-000000000001', '2025-02-01', '2025-07-01', 'Educar.', 'activo', true),
('d0000000-0000-0000-0000-000000000003', 'Talleres de Reciclaje', 'Manejo de residuos.', 'a0000000-0000-0000-0000-000000000001', '2025-03-01', '2025-08-01', 'Reciclar.', 'activo', true),
('d0000000-0000-0000-0000-000000000004', 'Club Científico', 'Ciencia para niños.', 'a0000000-0000-0000-0000-000000000001', '2025-04-01', '2025-09-01', 'Ciencia.', 'activo', true),
('d0000000-0000-0000-0000-000000000005', 'Huertos Escolares', 'Agricultura escolar.', 'a0000000-0000-0000-0000-000000000001', '2025-05-01', '2025-10-01', 'Sembrar.', 'activo', true),
-- Area 2
('d0000000-0000-0000-0000-000000000006', 'Reforestación Norte', 'Zona norte.', 'a0000000-0000-0000-0000-000000000002', '2025-01-01', '2025-06-01', 'Reforestar.', 'activo', true),
('d0000000-0000-0000-0000-000000000007', 'Reforestación Sur', 'Zona sur.', 'a0000000-0000-0000-0000-000000000002', '2025-02-01', '2025-07-01', 'Reforestar.', 'activo', true),
('d0000000-0000-0000-0000-000000000008', 'Vivero Central', 'Producción plantas.', 'a0000000-0000-0000-0000-000000000002', '2025-03-01', '2025-08-01', 'Producir.', 'activo', true),
('d0000000-0000-0000-0000-000000000009', 'Recuperación Suelos', 'Suelos degradados.', 'a0000000-0000-0000-0000-000000000002', '2025-04-01', '2025-09-01', 'Recuperar.', 'activo', true),
('d0000000-0000-0000-0000-000000000010', 'Corredor Biológico', 'Conexión áreas.', 'a0000000-0000-0000-0000-000000000002', '2025-05-01', '2025-10-01', 'Conectar.', 'activo', true),
-- Area 3
('d0000000-0000-0000-0000-000000000011', 'Drones Vigilancia', 'Monitoreo aéreo.', 'a0000000-0000-0000-0000-000000000003', '2025-01-01', '2025-06-01', 'Vigilar.', 'activo', true),
('d0000000-0000-0000-0000-000000000012', 'App Ciudadana', 'Reporte denuncias.', 'a0000000-0000-0000-0000-000000000003', '2025-02-01', '2025-07-01', 'Desarrollar.', 'activo', true),
('d0000000-0000-0000-0000-000000000013', 'Sensores Agua', 'Calidad agua.', 'a0000000-0000-0000-0000-000000000003', '2025-03-01', '2025-08-01', 'Medir.', 'activo', true),
('d0000000-0000-0000-0000-000000000014', 'Mapa Digital', 'Cartografía.', 'a0000000-0000-0000-0000-000000000003', '2025-04-01', '2025-09-01', 'Mapear.', 'activo', true),
('d0000000-0000-0000-0000-000000000015', 'Base Datos Bio', 'Big data.', 'a0000000-0000-0000-0000-000000000003', '2025-05-01', '2025-10-01', 'Analizar.', 'activo', true),
-- Area 4
('d0000000-0000-0000-0000-000000000016', 'Estudio Fauna', 'Inventario.', 'a0000000-0000-0000-0000-000000000004', '2025-01-01', '2025-06-01', 'Investigar.', 'activo', true),
('d0000000-0000-0000-0000-000000000017', 'Estudio Flora', 'Catálogo.', 'a0000000-0000-0000-0000-000000000004', '2025-02-01', '2025-07-01', 'Investigar.', 'activo', true),
('d0000000-0000-0000-0000-000000000018', 'Calidad Aire', 'Muestreo.', 'a0000000-0000-0000-0000-000000000004', '2025-03-01', '2025-08-01', 'Investigar.', 'activo', true),
('d0000000-0000-0000-0000-000000000019', 'Impacto Ambiental', 'Evaluación.', 'a0000000-0000-0000-0000-000000000004', '2025-04-01', '2025-09-01', 'Evaluar.', 'activo', true),
('d0000000-0000-0000-0000-000000000020', 'Especies Invasoras', 'Control.', 'a0000000-0000-0000-0000-000000000004', '2025-05-01', '2025-10-01', 'Controlar.', 'activo', true),
-- Area 5
('d0000000-0000-0000-0000-000000000021', 'Reciclaje Urbano', 'Ciudad.', 'a0000000-0000-0000-0000-000000000005', '2025-01-01', '2025-06-01', 'Reciclar.', 'activo', true),
('d0000000-0000-0000-0000-000000000022', 'Compostaje Comunal', 'Barrios.', 'a0000000-0000-0000-0000-000000000005', '2025-02-01', '2025-07-01', 'Compostar.', 'activo', true),
('d0000000-0000-0000-0000-000000000023', 'Limpieza Ríos', 'Riveras.', 'a0000000-0000-0000-0000-000000000005', '2025-03-01', '2025-08-01', 'Limpiar.', 'activo', true),
('d0000000-0000-0000-0000-000000000024', 'Economía Circular', 'Empresas.', 'a0000000-0000-0000-0000-000000000005', '2025-04-01', '2025-09-01', 'Capacitar.', 'activo', true),
('d0000000-0000-0000-0000-000000000025', 'Puntos Limpios', 'Instalación.', 'a0000000-0000-0000-0000-000000000005', '2025-05-01', '2025-10-01', 'Instalar.', 'activo', true),
-- Area 6
('d0000000-0000-0000-0000-000000000026', 'Ruta del Cacao', 'Tour.', 'a0000000-0000-0000-0000-000000000006', '2025-01-01', '2025-06-01', 'Guiar.', 'activo', true),
('d0000000-0000-0000-0000-000000000027', 'Avistamiento Aves', 'Birdwatching.', 'a0000000-0000-0000-0000-000000000006', '2025-02-01', '2025-07-01', 'Observar.', 'activo', true),
('d0000000-0000-0000-0000-000000000028', 'Turismo Vivencial', 'Comunidades.', 'a0000000-0000-0000-0000-000000000006', '2025-03-01', '2025-08-01', 'Visitar.', 'activo', true),
('d0000000-0000-0000-0000-000000000029', 'Senderismo Ecológico', 'Rutas.', 'a0000000-0000-0000-0000-000000000006', '2025-04-01', '2025-09-01', 'Caminar.', 'activo', true),
('d0000000-0000-0000-0000-000000000030', 'Artesanía Local', 'Talleres.', 'a0000000-0000-0000-0000-000000000006', '2025-05-01', '2025-10-01', 'Crear.', 'activo', true)
ON CONFLICT (id) DO NOTHING;

-- 4. ASSIGNMENTS
INSERT INTO public.project_assignments (id, volunteer_id, project_id, status, assigned_at) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000009', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000010', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000013', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000014', 'active', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000015', 'active', NOW());

-- 5. CONVOCATORIAS
INSERT INTO public.convocatorias (id, title, description, project_id, start_date, end_date, status, vacancies) VALUES
('e0000000-0000-0000-0000-000000000001', 'Voluntarios Escuelas', 'Enseñanza.', 'd0000000-0000-0000-0000-000000000001', '2025-01-01', '2025-02-01', 'abierta', 5),
('e0000000-0000-0000-0000-000000000002', 'Voluntarios Reforestación', 'Campo.', 'd0000000-0000-0000-0000-000000000006', '2025-01-01', '2025-02-01', 'abierta', 10),
('e0000000-0000-0000-0000-000000000003', 'Voluntarios Digital', 'App.', 'd0000000-0000-0000-0000-000000000012', '2025-01-01', '2025-02-01', 'abierta', 3),
('e0000000-0000-0000-0000-000000000004', 'Voluntarios Fauna', 'Conteo.', 'd0000000-0000-0000-0000-000000000016', '2025-01-01', '2025-02-01', 'abierta', 4),
('e0000000-0000-0000-0000-000000000005', 'Voluntarios Limpieza', 'Ríos.', 'd0000000-0000-0000-0000-000000000023', '2025-01-01', '2025-02-01', 'abierta', 15)
ON CONFLICT (id) DO NOTHING;

-- 6. APPLICATIONS (USERS -> CONVOCATORIAS)
-- Reference by user_email as per schema
INSERT INTO public.applications (id, convocatoria_id, user_email, user_name, user_phone, status, applied_date) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'user.alex@gmail.com', 'Alex Campos', '980000001', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'user.bianca@gmail.com', 'Bianca Flor', '980000002', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', 'user.carlos@gmail.com', 'Carlos Vives', '980000003', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', 'user.diana@gmail.com', 'Diana Prince', '980000004', 'accepted', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'user.edgar@gmail.com', 'Edgar Allan', '980000005', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'user.fanny@gmail.com', 'Fanny Lu', '980000006', 'rejected', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', 'user.gino@gmail.com', 'Gino Pesaressi', '980000007', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', 'user.hilda@gmail.com', 'Hilda Gadea', '980000008', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', 'user.ivan@gmail.com', 'Ivan Cruz', '980000009', 'pending', NOW()),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', 'user.julia@gmail.com', 'Julia Roberts', '980000010', 'accepted', NOW());
