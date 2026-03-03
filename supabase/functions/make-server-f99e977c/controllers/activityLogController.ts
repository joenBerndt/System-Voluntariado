// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase } from '../utils/formatters.ts';

export const getActivityLogs = async (c: Context) => {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            // If table doesn't exist, generic error or empty
            return c.json({ success: true, data: [] });
        }
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching activity logs:', error);
        return c.json({ success: false, error: 'Failed to fetch activity logs' }, 500);
    }
};

export const createActivityLog = async (c: Context) => {
    try {
        const logData = await c.req.json();

        // Check if user info is present, if not try to fetch
        let { user_id, user_name, user_email, entity_type, action, description, details, metadata } = logData;

        // Ensure "details" is a string if it's an object/array, unless it's already stringified
        let processedDetails = details;
        if (metadata && !processedDetails) processedDetails = JSON.stringify(metadata);
        if (typeof processedDetails === 'object' && processedDetails !== null) {
            processedDetails = JSON.stringify(processedDetails);
        }

        // Default values
        if (!user_name) user_name = 'Usuario';
        if (!user_email) user_email = 'unknown@iiap.gob.pe';

        // If we only have user_id, verify user exists (optional, but good for data integrity)
        if (user_id && (!user_name || user_name === 'Usuario')) {
            const { data: u } = await supabase.from('users').select('name, email').eq('id', user_id).single();
            if (u) {
                user_name = u.name;
                user_email = u.email;
            }
        }

        const { error } = await supabase.from('activity_logs').insert({
            action: action || 'Acción desconocida',
            entity_type: entity_type || 'system',
            entity_id: user_id || null, // Default entity_id to user_id if not provided
            description: description || 'Sin descripción',
            details: processedDetails,
            user_id: user_id || null,
            user_name: user_name,
            user_email: user_email,
            timestamp: new Date().toISOString()
        });

        if (error) throw error;

        return c.json({ success: true });
    } catch (error) {
        console.log('Error creating activity log:', error);
        return c.json({ success: false, error: 'Failed to create activity log: ' + (error.message || error) }, 500);
    }
};
