// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';

export const getUsers = async (c: Context) => {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error fetching users:', error);
        return c.json({ success: false, error: 'Failed to fetch users' }, 500);
    }
};

export const createUser = async (c: Context) => {
    try {
        const userData = await c.req.json();
        const dbData = toSnakeCase({
            ...userData,
            role: 'user',
            registeredDate: new Date().toISOString().split('T')[0],
        });

        const { data, error } = await supabase
            .from('users')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Creación de Usuario', 'user', data.id, `Usuario creado: ${data.name}`, data);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error creating user:', error);
        return c.json({ success: false, error: 'Failed to create user' }, 500);
    }
};

export const getUserByEmail = async (c: Context) => {
    try {
        const email = c.req.param('email');
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) throw error;
        return c.json({ success: true, data: data ? toCamelCase(data) : null });
    } catch (error) {
        console.log('Error fetching user:', error);
        return c.json({ success: false, error: 'Failed to fetch user' }, 500);
    }
};

export const updateUserRole = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const { role } = await c.req.json();

        // Get user info before update
        const { data: currentUser } = await supabase.from('users').select('name, role').eq('id', id).single();

        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // If downgrading from volunteer/admin to user, clean up assignments and manager roles
        if (role === 'user' && currentUser && (currentUser.role === 'volunteer' || currentUser.role === 'admin' || currentUser.role === 'admin_master')) {
            console.log(`Cleaning up assignments for downgraded user ${id}`);

            // 1. Delete from project_assignments
            await supabase.from('project_assignments').delete().eq('volunteer_id', id);

            // 2. Remove from project managers array
            // First find projects managed by this user
            const { data: managedProjects } = await supabase
                .from('projects')
                .select('id, managers')
                .contains('managers', [id]);

            if (managedProjects && managedProjects.length > 0) {
                for (const project of managedProjects) {
                    const newManagers = (project.managers || []).filter((m: string) => m !== id);
                    await supabase
                        .from('projects')
                        .update({ managers: newManagers })
                        .eq('id', project.id);
                }
            }
        }

        await logActivity('Cambio de Rol', 'user', id, `Rol de ${currentUser?.name || id} actualizado a ${role}`, { oldRole: currentUser?.role, newRole: role });

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating user role:', error);
        return c.json({ success: false, error: 'Failed to update user role' }, 500);
    }
};

export const updateUser = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const userData = await c.req.json();
        const dbData = toSnakeCase(userData);

        // 1. Validar Teléfono (9 dígitos)
        if (userData.phone) {
            const phoneRegex = /^\d{9}$/;
            if (!phoneRegex.test(userData.phone.replace(/\D/g, ''))) {
                return c.json({ success: false, error: 'El número de teléfono debe tener exactamente 9 dígitos.' }, 400);
            }
        }

        // 2. Validar Unicidad (DNI y Teléfono, excluyendo al usuario actual)
        if (userData.dni) {
            const { data: dniExists } = await supabase
                .from('users')
                .select('id')
                .eq('dni', userData.dni)
                .neq('id', id) // Exclude self
                .maybeSingle();

            if (dniExists) {
                return c.json({ success: false, error: 'El DNI ya se encuentra registrado por otro usuario.' }, 400);
            }
        }

        if (userData.phone) {
            const { data: phoneExists } = await supabase
                .from('users')
                .select('id')
                .eq('phone', userData.phone)
                .neq('id', id) // Exclude self
                .maybeSingle();

            if (phoneExists) {
                return c.json({ success: false, error: 'El número de teléfono ya se encuentra registrado por otro usuario.' }, 400);
            }
        }

        // Handle hardcoded admin migration: Create in DB if not exists
        if (id === 'admin-master-001') {
            const { data: existing } = await supabase.from('users').select('id').eq('id', id).maybeSingle();

            if (!existing) {
                // Create the admin record with defaults
                const adminDefaults = {
                    id: 'admin-master-001',
                    name: 'Administrador Master',
                    email: 'admin@iiap.org',
                    role: 'admin_master',
                    phone: '+51 065 265515',
                    area: 'Administración General',
                    password: 'admin123',
                    status: 'activo',
                    registeredDate: new Date().toISOString().split('T')[0],
                };

                const fullData = { ...toSnakeCase(adminDefaults), ...dbData };

                const { data, error } = await supabase
                    .from('users')
                    .insert(fullData)
                    .select()
                    .single();

                if (error) throw error;

                await logActivity('Actualización de Usuario', 'user', id, `Usuario Admin migrado/actualizado: ${data.name}`, userData);
                return c.json({ success: true, data: toCamelCase(data) });
            }
        }

        const { data, error } = await supabase
            .from('users')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Actualización de Usuario', 'user', id, `Usuario actualizado: ${data.name}`, userData);

        return c.json({ success: true, data: toCamelCase(data) });
    } catch (error) {
        console.log('Error updating user:', error);
        return c.json({ success: false, error: 'Failed to update user' }, 500);
    }
};

export const deleteUser = async (c: Context) => {
    try {
        const id = c.req.param('id');

        // Check if admin
        const { data: user } = await supabase.from('users').select('name, email, role').eq('id', id).single();
        if (user && (user.role === 'admin' || user.role === 'admin_master')) {
            return c.json({ success: false, error: 'No se puede eliminar cuentas de administrador. Degrádelo primero.' }, 403);
        }

        const userEmail = user?.email;

        console.log(`Starting cleanup for user deletion: ${id} (${userEmail})`);

        // 1. Clean up project managers (Text array)
        const { data: managedProjects } = await supabase
            .from('projects')
            .select('id, managers')
            .contains('managers', [id]);

        if (managedProjects && managedProjects.length > 0) {
            console.log(`Removing user ${id} from managers of ${managedProjects.length} projects`);
            for (const project of managedProjects) {
                const newManagers = (project.managers || []).filter((m: string) => m !== id);
                await supabase
                    .from('projects')
                    .update({ managers: newManagers })
                    .eq('id', project.id);
            }
        }

        // 2. Clean up Convocatorias Manager (FK usually non-cascading)
        // Set manager_id to NULL to preserve the convocatoria but remove the link
        await supabase
            .from('convocatorias')
            .update({ manager_id: null })
            .eq('manager_id', id);

        // 3. Clean up Activity Logs (FK usually non-cascading)
        // Set user_id to NULL. Name/Email are denormalized so history remains readable.
        await supabase
            .from('activity_logs')
            .update({ user_id: null })
            .eq('user_id', id);

        // 4. Clean up Applications
        // Schema says CASCADE on email, but let's be safe in case of DB mismatch
        if (userEmail) {
            await supabase
                .from('applications')
                .delete()
                .eq('user_email', userEmail);
        }

        // 5. Clean up Material Progress (Safe delete)
        await supabase
            .from('material_progress')
            .delete()
            .eq('volunteer_id', id);

        // 6. Clean up Project Assignments
        // Schema says CASCADE on id, but let's be safe
        await supabase
            .from('project_assignments')
            .delete()
            .eq('volunteer_id', id);

        // Finally delete the user
        const { error } = await supabase.from('users').delete().eq('id', id);

        if (error) {
            console.error('Database error deleting user:', error);
            // Check for specific FK codes
            if (error.code === '23503') { // ForeignKeyViolation
                throw new Error(`No se pudo eliminar: El usuario está referenciado en otras tablas (Código 23503). Detalles: ${error.details}`);
            }
            throw error;
        }

        await logActivity('Eliminación de Usuario', 'user', id, `Usuario eliminado: ${user?.name || id}`, { deletedUser: user });

        return c.json({ success: true });
    } catch (error) {
        console.log('Error deleting user:', error);
        return c.json({ success: false, error: error.message || 'Failed to delete user' }, 500);
    }
};
