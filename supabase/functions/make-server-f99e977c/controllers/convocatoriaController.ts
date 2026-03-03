// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getConvocatorias = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('convocatorias').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching convocatorias:', error);
        return c.json({ success: false, error: 'Failed to fetch convocatorias' }, 500);
    }
};

export const createConvocatoria = async (c: Context) => {
    try {
        const convocatoriaData = await c.req.json();
        const dbData = toSnakeCase({
            ...convocatoriaData,
            applicantsCount: 0,
            acceptedCount: 0,
            createdDate: new Date().toISOString().split('T')[0],
        });

        // Validation: Unique Title (Case Insensitive)
        if (dbData.title) {
            const { data: existing } = await supabase
                .from('convocatorias')
                .select('id')
                .ilike('title', dbData.title.trim())
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe una convocatoria con este título.' }, 400);
            }
            dbData.title = dbData.title.trim();
        }

        // 1. Date Validation

        // 1. Date Validation
        if (dbData.start_date && dbData.end_date) {
            if (new Date(dbData.start_date) > new Date(dbData.end_date)) {
                return c.json({ success: false, error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, 400);
            }
        }

        // 2. Validate Project belongs to Area
        if (dbData.project_id && dbData.area) {
            const { data: project } = await supabase
                .from('projects')
                .select('area_id')
                .eq('id', dbData.project_id)
                .single();

            if (project) {
                // Get Area Name for the project
                const { data: area } = await supabase
                    .from('areas')
                    .select('name')
                    .eq('id', project.area_id)
                    .single();

                if (area && area.name !== dbData.area) {
                    return c.json({
                        success: false,
                        error: `El proyecto seleccionado pertenece al área "${area.name}", no a "${dbData.area}".`
                    }, 400);
                }
            }
        }

        const { data, error } = await supabase
            .from('convocatorias')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Creación de Convocatoria', 'convocatoria', data.id, `Convocatoria creada: ${data.title}`, data);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating convocatoria:', error);
        return c.json({ success: false, error: 'Failed to create convocatoria' }, 500);
    }
};

export const updateConvocatoria = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const updates = await c.req.json();
        const dbUpdates = toSnakeCase(updates);

        // Pre-fetch existing to validate consistency
        const { data: current } = await supabase.from('convocatorias').select('*').eq('id', id).single();
        if (!current) return c.json({ success: false, error: 'Convocatoria not found' }, 404);

        const merged = { ...current, ...dbUpdates };

        // Validation: Unique Title (Case Insensitive)
        if (dbUpdates.title) {
            const { data: existing } = await supabase
                .from('convocatorias')
                .select('id')
                .ilike('title', dbUpdates.title.trim())
                .neq('id', id)
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe una convocatoria con este título.' }, 400);
            }
            dbUpdates.title = dbUpdates.title.trim();
        }

        // 1. Date Validation
        if (merged.start_date && merged.end_date) {
            if (new Date(merged.start_date) > new Date(merged.end_date)) {
                return c.json({ success: false, error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, 400);
            }
        }

        // 2. Validate Project belongs to Area
        // Only if project_id or area changed (or both are present in merged state)
        if (merged.project_id && merged.area) {
            const { data: project } = await supabase
                .from('projects')
                .select('area_id')
                .eq('id', merged.project_id)
                .single();

            if (project) {
                const { data: area } = await supabase
                    .from('areas')
                    .select('name')
                    .eq('id', project.area_id)
                    .single();

                if (area && area.name !== merged.area) {
                    return c.json({
                        success: false,
                        error: `El proyecto seleccionado pertenece al área "${area.name}", no a "${merged.area}".`
                    }, 400);
                }
            }
        }

        const { data, error } = await supabase
            .from('convocatorias')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Actualización de Convocatoria', 'convocatoria', id, `Convocatoria actualizada: ${data.title}`, updates);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating convocatoria:', error);
        return c.json({ success: false, error: 'Failed to update convocatoria' }, 500);
    }
};

export const deleteConvocatoria = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const { data: conv } = await supabase.from('convocatorias').select('title').eq('id', id).single();

        // Check pending applications
        const { data: apps } = await supabase
            .from('applications')
            .select('status')
            .eq('convocatoria_id', id);

        const hasPending = apps?.some(a => ['pending', 'interview_pending', 'interview_confirmed'].includes(a.status));

        if (hasPending) {
            return c.json({
                success: false,
                error: 'No se puede eliminar una convocatoria con postulaciones en proceso.',
                cannotDelete: true
            }, 400);
        }

        // Mark as terminated instead of delete if no pending
        const { data, error } = await supabase
            .from('convocatorias')
            .update({ status: 'terminada' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Terminación de Convocatoria', 'convocatoria', id, `Convocatoria terminada: ${conv?.title || id}`, { action: 'terminate' });

        return c.json({ success: true, data: toCamelCase(data), terminated: true });
    } catch (error) {
        console.log('Error deleting convocatoria:', error);
        return c.json({ success: false, error: 'Failed to delete convocatoria' }, 500);
    }
};
