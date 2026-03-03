// @ts-nocheck
import { Context } from 'npm:hono';
import { supabase } from '../utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from '../utils/formatters.ts';
import { logActivity } from '../utils/logger.ts';
import { User } from '../types.ts';

export const login = async (c: Context) => {
    try {
        const { email, password } = await c.req.json();

        // 1. Check DB user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (user) {
            // Verify password (simple comparison for now)
            // TODO: Implement bcrypt hash verification
            if (user.password !== password) {
                await logActivity('Intento de Acceso Fallido', 'auth', null, `Intento fallido para: ${email}`, null, null, 'Desconocido', email);
                return c.json({ success: false, error: 'Contraseña incorrecta' }, 401);
            }

            await logActivity('Inicio de Sesión', 'auth', user.id, `${user.name} inició sesión`, null, user.id, user.name, user.email);

            // Return user without password
            const { password: _, ...userWithoutPass } = user;
            return c.json({ success: true, data: toCamelCase(userWithoutPass) });
        }

        return c.json({ success: false, error: 'Usuario no encontrado. Si es el administrador, asegúrese de haber ejecutado el script de inicialización de base de datos.' }, 404);

    } catch (error) {
        console.log('Error logging in:', error);
        return c.json({ success: false, error: 'Error al iniciar sesión' }, 500);
    }
};

export const register = async (c: Context) => {
    try {
        const userData = await c.req.json();

        // Check if email exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();

        if (existing) {
            return c.json({ success: false, error: 'El correo electrónico ya se encuentra registrado' }, 400);
        }

        const dbData = toSnakeCase({
            ...userData,
            role: 'user', // Default role
            status: 'activo',
            registeredDate: new Date().toISOString().split('T')[0],
        });

        // 1. Validar Teléfono (9 dígitos)
        if (userData.phone) {
            const phoneRegex = /^\d{9}$/;
            if (!phoneRegex.test(userData.phone.replace(/\D/g, ''))) {
                return c.json({ success: false, error: 'El número de teléfono debe tener exactamente 9 dígitos.' }, 400);
            }
        }

        // 2. Validar Unicidad (DNI y Teléfono)
        // Validar unique DNI
        if (userData.dni) {
            const { data: dniExists } = await supabase
                .from('users')
                .select('id')
                .eq('dni', userData.dni)
                .maybeSingle();

            if (dniExists) {
                return c.json({ success: false, error: 'El DNI ya se encuentra registrado.' }, 400);
            }
        }

        // Validar unique Phone
        if (userData.phone) {
            const { data: phoneExists } = await supabase
                .from('users')
                .select('id')
                .eq('phone', userData.phone)
                .maybeSingle();

            if (phoneExists) {
                return c.json({ success: false, error: 'El número de teléfono ya se encuentra registrado.' }, 400);
            }
        }

        const { data, error } = await supabase
            .from('users')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        await logActivity('Registro de Usuario', 'user', data.id, `Nuevo usuario registrado: ${data.name}`, data, data.id, data.name, data.email);

        const { password: _, ...userWithoutPass } = data;
        return c.json({ success: true, data: toCamelCase(userWithoutPass) });
    } catch (error) {
        console.log('Error registering:', error);
        return c.json({ success: false, error: 'Failed to register user' }, 500);
    }
};
