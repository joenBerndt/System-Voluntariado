// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';

// About Info
export const getAboutInfo = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('about_info').select('*').single();
        return c.json({ success: true, data: data ? toCamelCase(data) : null });
    } catch (error) {
        console.log('Error fetching about info:', error);
        return c.json({ success: false, error: 'Failed to fetch about info' }, 500);
    }
};

export const updateAboutInfo = async (c: Context) => {
    try {
        const updates = await c.req.json();
        const { data, error } = await supabase
            .from('about_info')
            .upsert({ id: 'info', ...toSnakeCase(updates) })
            .select()
            .single();

        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating about info:', error);
        return c.json({ success: false, error: 'Failed to update about info' }, 500);
    }
};

// Uploads
export const uploadImage = async (c: Context) => {
    try {
        const body = await c.req.parseBody();
        const image = body['image'];
        const type = body['type'] || 'general';

        if (!image || !(image instanceof File)) {
            return c.json({ success: false, error: 'No image file provided' }, 400);
        }

        const fileExt = image.name.split('.').pop();
        const fileName = `${type}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Ensure 'images' bucket exists or use 'public'
        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, image, {
                contentType: image.type,
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        return c.json({
            success: true,
            data: { url: publicUrl }
        });
    } catch (error) {
        console.log('Error uploading image:', error);
        return c.json({ success: false, error: 'Failed to upload image' }, 500);
    }
};

// Initialize
export const initialize = async (c: Context) => {
    try {
        // Check if admin exists
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'admin@iiap.org')
            .maybeSingle();

        if (existingAdmin) {
            return c.json({ success: true, message: 'System already initialized (Admin exists)' });
        }

        // Create Admin
        const adminData = {
            name: 'Administrador Master',
            email: 'admin@iiap.org',
            password: 'admin123', // TO DO: Implement password hashing
            role: 'admin_master',
            phone: '+51 065 265515',
            area: 'Administración General',
            status: 'activo',
            registered_date: new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
            .from('users')
            .insert(adminData)
            .select()
            .single();

        if (error) throw error;

        return c.json({ success: true, message: 'System initialized: Admin user created', data: toCamelCase(data) });
    } catch (error) {
        console.log('Error initializing system:', error);
        return c.json({ success: false, error: 'Failed to initialize system' }, 500);
    }
};
