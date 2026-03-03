// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getProjects = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching projects:', error);
        return c.json({ success: false, error: 'Failed to fetch projects' }, 500);
    }
};

export const createProject = async (c: Context) => {
    try {
        const projectData = await c.req.json();
        const dbData = toSnakeCase({
            ...projectData,
            status: 'activo',
            createdDate: new Date().toISOString().split('T')[0],
        });

        // Validation: Unique Name (Case Insensitive)
        if (dbData.name) {
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .ilike('name', dbData.name.trim())
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe un proyecto con este nombre.' }, 400);
            }
            dbData.name = dbData.name.trim();
        }

        // Date Validation

        // Date Validation
        if (dbData.start_date && dbData.end_date) {
            if (new Date(dbData.start_date) > new Date(dbData.end_date)) {
                return c.json({ success: false, error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, 400);
            }
        }

        const { data, error } = await supabase
            .from('projects')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Creación de Proyecto', 'project', data.id, `Proyecto creado: ${data.name}`, data);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating project:', error);
        return c.json({ success: false, error: 'Failed to create project' }, 500);
    }
};

export const updateProject = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const updates = await c.req.json();
        const dbUpdates = toSnakeCase(updates);

        // Validation: Unique Name (Case Insensitive)
        if (dbUpdates.name) {
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .ilike('name', dbUpdates.name.trim())
                .neq('id', id)
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe un proyecto con este nombre.' }, 400);
            }
            dbUpdates.name = dbUpdates.name.trim();
        }

        // Date Validation
        if (dbUpdates.start_date && dbUpdates.end_date) {
            if (new Date(dbUpdates.start_date) > new Date(dbUpdates.end_date)) {
                return c.json({ success: false, error: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }, 400);
            }
        }

        const { data, error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Actualización de Proyecto', 'project', id, `Proyecto actualizado: ${data.name}`, updates);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating project:', error);
        return c.json({ success: false, error: 'Failed to update project' }, 500);
    }
};

export const deleteProject = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const { data: project } = await supabase.from('projects').select('name').eq('id', id).single();
        const { error } = await supabase.from('projects').delete().eq('id', id);

        if (error) throw error;

        await logActivity('Eliminación de Proyecto', 'project', id, `Proyecto eliminado: ${project?.name || id}`, { deletedProject: project });

        return c.json({ success: true });
    } catch (error) {
        console.log('Error deleting project:', error);
        return c.json({ success: false, error: 'Failed to delete project' }, 500);
    }
};
