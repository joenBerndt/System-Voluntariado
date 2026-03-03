// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

// Materials
export const getMaterials = async (c: Context) => {
    try {
        const { data, error } = await supabase
            .from('training_materials')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching materials:', error);
        return c.json({ success: false, error: 'Failed to fetch materials' }, 500);
    }
};

export const createMaterial = async (c: Context) => {
    try {
        const materialData = await c.req.json();
        const dbData = toSnakeCase(materialData);

        const { data, error } = await supabase
            .from('training_materials')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Creación de Material', 'training', data.id, `Material de capacitación creado: ${data.title}`, data);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating material:', error);
        return c.json({ success: false, error: 'Failed to create material' }, 500);
    }
};

export const updateMaterial = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const updates = await c.req.json();
        const dbUpdates = toSnakeCase(updates);

        const { data, error } = await supabase
            .from('training_materials')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Actualización de Material', 'training', id, `Material de capacitación actualizado: ${data.title}`, updates);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating material:', error);
        return c.json({ success: false, error: 'Failed to update material' }, 500);
    }
};

export const deleteMaterial = async (c: Context) => {
    try {
        const id = c.req.param('id');

        const { data: mat } = await supabase.from('training_materials').select('title').eq('id', id).single();

        const { error } = await supabase
            .from('training_materials')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await logActivity('Eliminación de Material', 'training', id, `Material eliminado: ${mat?.title || id}`, { deletedMaterial: mat });

        return c.json({ success: true });
    } catch (error) {
        console.log('Error deleting material:', error);
        return c.json({ success: false, error: 'Failed to delete material' }, 500);
    }
};

// Progress
export const getProgress = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('material_progress').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching progress:', error);
        return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
    }
};

export const updateProgress = async (c: Context) => {
    try {
        const progressData = await c.req.json();
        const dbData = toSnakeCase({
            ...progressData,
            lastAccessed: new Date().toISOString()
        });

        // Check if exists first to decide insert vs update (or use upsert)
        const { data, error } = await supabase
            .from('material_progress')
            .upsert(dbData, { onConflict: 'material_id, volunteer_id' })
            .select()
            .single();

        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating progress:', error);
        return c.json({ success: false, error: 'Failed to update progress' }, 500);
    }
};
