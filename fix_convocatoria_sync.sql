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
