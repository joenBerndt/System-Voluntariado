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
