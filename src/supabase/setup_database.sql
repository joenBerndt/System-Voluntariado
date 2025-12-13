-- 1. Crear el bucket 'images' para almacenamiento de imágenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images', 
    'images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Server Function Upload" ON storage.objects;

-- 3. Crear política para acceso público (Lectura)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- 4. Crear política para permitir subidas (Insertar)
-- Nota: La función del servidor usa Service Role key que se salta estas políticas,
-- pero esto es bueno tenerlo configurado correctamente.
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

-- 5. Estructura de la Tabla KV Store (Ya debería existir, pero por seguridad)
CREATE TABLE IF NOT EXISTS kv_store_f99e977c (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar permisos
GRANT ALL ON TABLE kv_store_f99e977c TO anon, authenticated, service_role;
