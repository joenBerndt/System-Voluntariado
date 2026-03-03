// @ts-nocheck
import { supabase } from './supabaseClient.ts';

export const logActivity = async (
    action: string,
    entityType: string,
    entityId: string | null,
    description: string,
    details: any = null,
    userId: string | null = null,
    userName: string = 'Sistema',
    userEmail: string = 'sistema@iiap.gob.pe'
) => {
    try {
        const logData = {
            action,
            entity_type: entityType,
            entity_id: entityId,
            description,
            details: details ? JSON.stringify(details) : null,
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            timestamp: new Date().toISOString()
        };

        await supabase.from('activity_logs').insert(logData);
    } catch (err) {
        console.warn('Failed to log activity:', err);
        // Don't throw, just warn, so we don't break the main flow
    }
};
