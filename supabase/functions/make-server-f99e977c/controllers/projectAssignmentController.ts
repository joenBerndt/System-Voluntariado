// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getAssignments = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('project_assignments').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching assignments:', error);
        return c.json({ success: false, error: 'Failed to fetch assignments' }, 500);
    }
};

export const createAssignment = async (c: Context) => {
    try {
        const { projectId, volunteerId, convocatoriaId } = await c.req.json();
        const dbData = {
            volunteer_id: volunteerId,
            project_id: projectId,
            convocatoria_id: convocatoriaId || null,
            assigned_at: new Date().toISOString(),
            status: 'active',
        };

        const { data, error } = await supabase
            .from('project_assignments')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        // Fetch details for log
        const { data: vol } = await supabase.from('users').select('name').eq('id', volunteerId).single();
        const { data: proj } = await supabase.from('projects').select('name').eq('id', projectId).single();

        await logActivity('Asignación de Proyecto', 'assignment', data.id, `Voluntario ${vol?.name || volunteerId} asignado a ${proj?.name || projectId}`, dbData);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating assignment:', error);
        return c.json({ success: false, error: 'Failed to create assignment' }, 500);
    }
};

export const deleteAssignment = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const { error } = await supabase.from('project_assignments').delete().eq('id', id);
        if (error) throw error;
        return c.json({ success: true });
    } catch (error) {
        console.log('Error deleting assignment:', error);
        return c.json({ success: false, error: 'Failed to delete assignment' }, 500);
    }
};
