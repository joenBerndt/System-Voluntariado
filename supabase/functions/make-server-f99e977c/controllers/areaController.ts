// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getAreas = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('areas').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching areas:', error);
        return c.json({ success: false, error: 'Failed to fetch areas' }, 500);
    }
};

export const createArea = async (c: Context) => {
    try {
        const areaData = await c.req.json();
        const dbData = toSnakeCase(areaData);

        // Validation: Unique Name (Case Insensitive)
        if (dbData.name) {
            const { data: existing } = await supabase
                .from('areas')
                .select('id')
                .ilike('name', dbData.name.trim()) // Case insensitive search
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe un área con este nombre.' }, 400);
            }
            dbData.name = dbData.name.trim(); // Ensure stored value is trimmed
        }

        const { data, error } = await supabase.from('areas').insert(dbData).select().single();
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error: any) {
        console.log('Error creating area:', error);
        return c.json({ success: false, error: error.message || 'Failed to create area' }, 500);
    }
};

export const updateArea = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const updates = await c.req.json();
        const dbUpdates = toSnakeCase(updates);

        // Validation: Unique Name (Case Insensitive)
        if (dbUpdates.name) {
            const { data: existing } = await supabase
                .from('areas')
                .select('id')
                .ilike('name', dbUpdates.name.trim())
                .neq('id', id) // Exclude self
                .maybeSingle();

            if (existing) {
                return c.json({ success: false, error: 'Ya existe un área con este nombre.' }, 400);
            }
            dbUpdates.name = dbUpdates.name.trim();
        }

        const { data, error } = await supabase.from('areas').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;

        await logActivity('Actualización de Área', 'area', id, `Área actualizada: ${data.name}`, updates);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error: any) {
        console.log('Error updating area:', error);
        return c.json({ success: false, error: error.message || 'Failed to update area' }, 500);
    }
};

export const deleteArea = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const { data: area } = await supabase.from('areas').select('name').eq('id', id).single();
        const { error } = await supabase.from('areas').delete().eq('id', id);
        if (error) throw error;

        await logActivity('Eliminación de Área', 'area', id, `Área eliminada: ${area?.name || id}`, { deletedArea: area });

        return c.json({ success: true });
    } catch (error: any) {
        console.log('Error deleting area:', error);
        return c.json({ success: false, error: error.message || 'Failed to delete area' }, 500);
    }
};
