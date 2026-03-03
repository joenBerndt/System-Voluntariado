// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getApplications = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('applications').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching applications:', error);
        return c.json({ success: false, error: 'Failed to fetch applications' }, 500);
    }
};

export const getUserApplications = async (c: Context) => {
    try {
        const email = c.req.param('userEmail');
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_email', email);

        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching user applications:', error);
        return c.json({ success: false, error: 'Failed to fetch user applications' }, 500);
    }
};

export const createApplication = async (c: Context) => {
    try {
        const appData = await c.req.json();
        const dbData = toSnakeCase({
            ...appData, // Ensure all fields are included in dbData
            status: 'pending',
            appliedDate: new Date().toISOString().split('T')[0],
        });

        // 1. Validar carta de presentación (mínimo 50 caracteres)
        const motivation = appData.motivation || '';
        if (motivation.trim().length < 50) {
            return c.json({ success: false, error: 'La carta de presentación debe tener al menos 50 caracteres para detallar tu motivación.' }, 400);
        }

        // 2. Validar postulación única (usuario + convocatoria)
        const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('convocatoria_id', dbData.convocatoria_id)
            .eq('user_id', dbData.user_id)
            .maybeSingle();

        if (existingApp) {
            return c.json({ success: false, error: 'Ya tienes una postulación registrada para esta convocatoria.' }, 400);
        }

        const { data, error } = await supabase
            .from('applications')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Nueva Postulación', 'application', data.id, `Nueva postulación de ${data.user_name} para ${data.convocatoria_title}`, data, null, data.user_name, data.user_email);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating application:', error);
        return c.json({ success: false, error: 'Failed to create application' }, 500);
    }
};

export const updateApplicationStatus = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const updates = await c.req.json();
        const dbUpdates = toSnakeCase(updates);

        const { data: existing, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existing) return c.json({ success: false, error: 'Application not found' }, 404);

        const { data, error } = await supabase
            .from('applications')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Cambio de Estado Postulación', 'application', id, `Estado de postulación cambiado a ${updates.status}`, { oldStatus: existing.status, newStatus: updates.status, applicant: existing.user_name });

        // If accepted, promote user to volunteer
        if (updates.status === 'accepted') {
            await supabase
                .from('users')
                .update({ role: 'volunteer' })
                .eq('email', existing.user_email);

            // Get convocatoria details
            const { data: convocatoria } = await supabase
                .from('convocatorias')
                .select('*')
                .eq('id', existing.convocatoria_id)
                .single();

            if (convocatoria) {
                // Update accepted count and check for closure
                const newAcceptedCount = (convocatoria.accepted_count || 0) + 1;
                const newStatus = newAcceptedCount >= convocatoria.vacancies ? 'cerrada' : convocatoria.status;

                await supabase
                    .from('convocatorias')
                    .update({
                        accepted_count: newAcceptedCount,
                        status: newStatus
                    })
                    .eq('id', convocatoria.id);

                // Create assignment if project linked
                if (convocatoria.project_id) {
                    const { data: user } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', existing.user_email)
                        .single();

                    if (user) {
                        await supabase.from('project_assignments').insert({
                            volunteer_id: user.id,
                            project_id: convocatoria.project_id,
                            convocatoria_id: convocatoria.id,
                            assigned_at: new Date().toISOString(),
                            status: 'active'
                        });
                    }
                }
            }
        }

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating application:', error);
        return c.json({ success: false, error: 'Failed to update application' }, 500);
    }
};

export const deleteApplication = async (c: Context) => {
    try {
        const email = c.req.param('email');
        const id = c.req.param('id');

        console.log(`Attempting to delete application: email=${email}, id=${id}`);

        // Get application to log details before deletion
        const { data: appData, error: fetchError } = await supabase
            .from('applications')
            .select('user_name, convocatoria_title, convocatoria_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.log('Application not found during delete fetch:', fetchError);
            return c.json({ success: false, error: 'Application not found' }, 404);
        }

        // Delete the application
        const { error: deleteError } = await supabase
            .from('applications')
            .delete()
            .eq('id', id); // ID should be sufficient, but we can verify email if needed.

        if (deleteError) throw deleteError;

        // Decrease applicants count in convocatoria if applicable
        if (appData && appData.convocatoria_id) {
            // Note: accepted_count is handled on acceptance. Applicants count is usually a count(*) or stored. 
            // If stored, we should decrement. 
            // The schema showed 'applicants_count'. Let's decrement it.
            const { data: conv } = await supabase.from('convocatorias').select('applicants_count').eq('id', appData.convocatoria_id).single();
            if (conv && conv.applicants_count > 0) {
                await supabase.from('convocatorias')
                    .update({ applicants_count: conv.applicants_count - 1 })
                    .eq('id', appData.convocatoria_id);
            }
        }

        await logActivity('Eliminación de Postulación', 'application', id, `Postulación eliminada: ${appData?.user_name}`, { deletedApp: appData });

        return c.json({ success: true });
    } catch (error) {
        console.log('Error deleting application:', error);
        return c.json({ success: false, error: 'Failed to delete application' }, 500);
    }
};
