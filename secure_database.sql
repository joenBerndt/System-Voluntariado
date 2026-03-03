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

