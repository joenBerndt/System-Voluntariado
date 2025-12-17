/// <reference lib="deno.ns" />
// @deno-types="npm:@types/hono"
// @ts-nocheck
import { Hono, type Context } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
declare const Deno: any;

app.use('*', cors());
app.use('*', logger(console.log));

// Helper to map snake_case DB objects to camelCase for frontend
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper to map camelCase frontend objects to snake_case for DB
const toSnakeCase = (obj: any): any => {
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = obj[key];
      return acc;
    }, {} as any);
  }
  return obj;
};

// --- ACTIVITY LOGGING HELPER ---
const logActivity = async (
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

// Health check
app.get('/make-server-f99e977c/health', (c: Context) => {
  return c.json({ status: 'ok' });
});

// ============ ACTIVITY LOGS ENDPOINT ============
app.get('/make-server-f99e977c/activity-logs', async (c: Context) => {
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
});

// Create activity log (manual from frontend)
app.post('/make-server-f99e977c/activity-logs', async (c: Context) => {
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
});

// Upload profile photo
app.post('/make-server-f99e977c/profile/upload-photo', async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const file = body['photo'];
    const userId = body['userId'];

    if (!file || !userId) {
      return c.json({ success: false, error: 'Missing file or userId' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user with new photo url
    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return c.json({ success: true, data: { url: publicUrl } });
  } catch (error) {
    console.log('Error uploading photo:', error);
    return c.json({ success: false, error: 'Failed to upload photo: ' + (error.message || error) }, 500);
  }
});

// ============ AUTH ENDPOINTS ============

// Login endpoint
// Login endpoint
app.post('/make-server-f99e977c/login', async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    // 1. Check DB user FIRST
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (user) {
      // Verify password (simple comparison for now)
      if (user.password !== password) {
        await logActivity('Intento de Acceso Fallido', 'auth', null, `Intento fallido para: ${email}`, null, null, 'Desconocido', email);
        return c.json({ success: false, error: 'Contraseña incorrecta' }, 401);
      }

      await logActivity('Inicio de Sesión', 'auth', user.id, `${user.name} inició sesión`, null, user.id, user.name, user.email);

      // Return user without password
      const { password: _, ...userWithoutPass } = user;
      return c.json({ success: true, data: toCamelCase(userWithoutPass) });
    }

    // 2. Check for hardcoded admin if not in DB
    if (email === 'admin@iiap.org' && password === 'admin123') {
      const adminData = {
        id: 'admin-master-001',
        name: 'Administrador Master',
        email: 'admin@iiap.org',
        role: 'admin_master',
        phone: '+51 065 265515',
        area: 'Administración General',
      };

      await logActivity('Inicio de Sesión', 'auth', adminData.id, 'Administrador Master inició sesión', null, adminData.id, adminData.name, adminData.email);

      return c.json({
        success: true,
        data: adminData
      });
    }

    return c.json({ success: false, error: 'Usuario no encontrado' }, 404);

  } catch (error) {
    console.log('Error logging in:', error);
    return c.json({ success: false, error: 'Error al iniciar sesión' }, 500);
  }
});

// Register endpoint
app.post('/make-server-f99e977c/register', async (c: Context) => {
  try {
    const userData = await c.req.json();

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();

    if (existing) {
      return c.json({ success: false, error: 'Email already registered' }, 400);
    }

    const dbData = toSnakeCase({
      ...userData,
      role: 'user', // Default role
      status: 'activo',
      registeredDate: new Date().toISOString().split('T')[0],
    });

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
});


// ============ VOLUNTEERS ENDPOINTS ============

// Get all volunteers
app.get('/make-server-f99e977c/volunteers', async (c: Context) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'volunteer');

    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching volunteers:', error);
    return c.json({ success: false, error: 'Failed to fetch volunteers' }, 500);
  }
});

// Create volunteer (admin)
app.post('/make-server-f99e977c/volunteers', async (c: Context) => {
  try {
    const volunteerData = await c.req.json();

    // Prepare data for DB
    const dbData = toSnakeCase({
      ...volunteerData,
      role: 'volunteer',
      status: 'activo',
      registeredDate: new Date().toISOString().split('T')[0],
    });

    const { data, error } = await supabase
      .from('users')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    await logActivity('Creación de Voluntario', 'volunteer', data.id, `Voluntario creado: ${data.name}`, data);

    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error creating volunteer:', error);
    return c.json({ success: false, error: 'Failed to create volunteer' }, 500);
  }
});

// Update volunteer
app.put('/make-server-f99e977c/volunteers/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const dbUpdates = toSnakeCase(updates);

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity('Actualización de Voluntario', 'volunteer', id, `Voluntario actualizado: ${data.name}`, updates);

    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error updating volunteer:', error);
    return c.json({ success: false, error: 'Failed to update volunteer' }, 500);
  }
});

// Delete volunteer
app.delete('/make-server-f99e977c/volunteers/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');

    // Get info before delete for log
    const { data: vol } = await supabase.from('users').select('name, email').eq('id', id).single();

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;

    await logActivity('Eliminación de Voluntario', 'volunteer', id, `Voluntario eliminado: ${vol?.name || 'ID ' + id}`, { deletedId: id, name: vol?.name, email: vol?.email });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting volunteer:', error);
    return c.json({ success: false, error: 'Failed to delete volunteer' }, 500);
  }
});

// ============ USERS ENDPOINTS ============

// Get all users
app.get('/make-server-f99e977c/users', async (c: Context) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// Create user (legacy/admin)
app.post('/make-server-f99e977c/users', async (c: Context) => {
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
});

// Get user by email
app.get('/make-server-f99e977c/users/by-email/:email', async (c: Context) => {
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
});

// Update user role
app.put('/make-server-f99e977c/users/:id/role', async (c: Context) => {
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
});

// Update user (general)
app.put('/make-server-f99e977c/users/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const userData = await c.req.json();
    const dbData = toSnakeCase(userData);

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
});

// Delete user
app.delete('/make-server-f99e977c/users/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');

    const { data: user } = await supabase.from('users').select('name, email').eq('id', id).single();

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;

    await logActivity('Eliminación de Usuario', 'user', id, `Usuario eliminado: ${user?.name || id}`, { deletedUser: user });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting user:', error);
    return c.json({ success: false, error: 'Failed to delete user' }, 500);
  }
});

// ============ PROJECTS ENDPOINTS ============

// Get all projects
app.get('/make-server-f99e977c/projects', async (c: Context) => {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching projects:', error);
    return c.json({ success: false, error: 'Failed to fetch projects' }, 500);
  }
});

// Create project
app.post('/make-server-f99e977c/projects', async (c: Context) => {
  try {
    const projectData = await c.req.json();
    const dbData = toSnakeCase({
      ...projectData,
      status: 'activo',
      createdDate: new Date().toISOString().split('T')[0],
    });

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
});

// Update project
app.put('/make-server-f99e977c/projects/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const dbUpdates = toSnakeCase(updates);

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
});

// Delete project
app.delete('/make-server-f99e977c/projects/:id', async (c: Context) => {
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
});

// ============ PROJECT ASSIGNMENTS ENDPOINTS ============

// Get all assignments
app.get('/make-server-f99e977c/project-assignments', async (c: Context) => {
  try {
    const { data, error } = await supabase.from('project_assignments').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching assignments:', error);
    return c.json({ success: false, error: 'Failed to fetch assignments' }, 500);
  }
});

// Create assignment
app.post('/make-server-f99e977c/project-assignments', async (c: Context) => {
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
});

// Delete assignment
app.delete('/make-server-f99e977c/project-assignments/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { error } = await supabase.from('project_assignments').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting assignment:', error);
    return c.json({ success: false, error: 'Failed to delete assignment' }, 500);
  }
});

// ============ CONVOCATORIAS ENDPOINTS ============

// Get all convocatorias
app.get('/make-server-f99e977c/convocatorias', async (c: Context) => {
  try {
    const { data, error } = await supabase.from('convocatorias').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching convocatorias:', error);
    return c.json({ success: false, error: 'Failed to fetch convocatorias' }, 500);
  }
});

// Create convocatoria
app.post('/make-server-f99e977c/convocatorias', async (c: Context) => {
  try {
    const convocatoriaData = await c.req.json();
    const dbData = toSnakeCase({
      ...convocatoriaData,
      applicantsCount: 0,
      acceptedCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
    });

    const { data, error } = await supabase
      .from('convocatorias')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    await logActivity('Creación de Convocatoria', 'convocatoria', data.id, `Convocatoria creada: ${data.title}`, data);

    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error creating convocatoria:', error);
    return c.json({ success: false, error: 'Failed to create convocatoria' }, 500);
  }
});

// Update convocatoria
app.put('/make-server-f99e977c/convocatorias/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const dbUpdates = toSnakeCase(updates);

    const { data, error } = await supabase
      .from('convocatorias')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity('Actualización de Convocatoria', 'convocatoria', id, `Convocatoria actualizada: ${data.title}`, updates);

    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error updating convocatoria:', error);
    return c.json({ success: false, error: 'Failed to update convocatoria' }, 500);
  }
});

// Delete convocatoria
app.delete('/make-server-f99e977c/convocatorias/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { data: conv } = await supabase.from('convocatorias').select('title').eq('id', id).single();

    // Check pending applications
    const { data: apps } = await supabase
      .from('applications')
      .select('status')
      .eq('convocatoria_id', id);

    const hasPending = apps?.some(a => ['pending', 'interview_pending', 'interview_confirmed'].includes(a.status));

    if (hasPending) {
      return c.json({
        success: false,
        error: 'No se puede eliminar una convocatoria con postulaciones en proceso.',
        cannotDelete: true
      }, 400);
    }

    // Mark as terminated instead of delete if no pending
    const { data, error } = await supabase
      .from('convocatorias')
      .update({ status: 'terminada' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity('Terminación de Convocatoria', 'convocatoria', id, `Convocatoria terminada: ${conv?.title || id}`, { action: 'terminate' });

    return c.json({ success: true, data: toCamelCase(data), terminated: true });
  } catch (error) {
    console.log('Error deleting convocatoria:', error);
    return c.json({ success: false, error: 'Failed to delete convocatoria' }, 500);
  }
});

// ============ APPLICATIONS ENDPOINTS ============

// Get all applications
app.get('/make-server-f99e977c/applications', async (c: Context) => {
  try {
    const { data, error } = await supabase.from('applications').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching applications:', error);
    return c.json({ success: false, error: 'Failed to fetch applications' }, 500);
  }
});

// Delete single activity log
app.delete('/make-server-f99e977c/activity-logs/:id', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { error } = await supabase.from('activity_logs').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting activity log:', error);
    return c.json({ success: false, error: 'Failed to delete activity log' }, 500);
  }
});

// Clear all activity logs
app.delete('/make-server-f99e977c/activity-logs', async (c: Context) => {
  try {
    const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.log('Error clearing activity logs:', error);
    return c.json({ success: false, error: 'Failed to clear activity logs' }, 500);
  }
});

// Get applications for user
app.get('/make-server-f99e977c/applications/user/:userEmail', async (c: Context) => {
  try {
    const email = c.req.param('userEmail');
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_email', email);

    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error updating project:', error);
    return c.json({ success: false, error: 'Failed to update project' }, 500);
  }
});



// Create application
app.post('/make-server-f99e977c/applications', async (c: Context) => {
  try {
    const appData = await c.req.json();
    const dbData = toSnakeCase({
      ...appData,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    });

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
});

// Update application status
app.put('/make-server-f99e977c/applications/:email/:id', async (c) => {
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
});

// ============ AREAS ENDPOINTS ============

app.get('/make-server-f99e977c/areas', async (c) => {
  try {
    const { data, error } = await supabase.from('areas').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching areas:', error);
    return c.json({ success: false, error: 'Failed to fetch areas' }, 500);
  }
});

app.post('/make-server-f99e977c/areas', async (c) => {
  try {
    const areaData = await c.req.json();
    const { data, error } = await supabase.from('areas').insert(toSnakeCase(areaData)).select().single();
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error: any) {
    console.log('Error creating area:', error);
    return c.json({ success: false, error: error.message || 'Failed to create area' }, 500);
  }
});

app.put('/make-server-f99e977c/areas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const { data, error } = await supabase.from('areas').update(toSnakeCase(updates)).eq('id', id).select().single();
    if (error) throw error;

    await logActivity('Actualización de Área', 'area', id, `Área actualizada: ${data.name}`, updates);

    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error: any) {
    console.log('Error updating area:', error);
    return c.json({ success: false, error: error.message || 'Failed to update area' }, 500);
  }
});

app.delete('/make-server-f99e977c/areas/:id', async (c) => {
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
});

// ============ ABOUT ENDPOINTS ============

app.get('/make-server-f99e977c/about', async (c) => {
  try {
    const { data, error } = await supabase.from('about_info').select('*').single();
    return c.json({ success: true, data: data ? toCamelCase(data) : null });
  } catch (error) {
    console.log('Error fetching about info:', error);
    return c.json({ success: false, error: 'Failed to fetch about info' }, 500);
  }
});

app.put('/make-server-f99e977c/about', async (c) => {
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
});

// ============ UPLOAD ENDPOINTS ============

app.post('/make-server-f99e977c/upload/image', async (c) => {
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
});

// ============ INITIALIZE ENDPOINT ============

app.post('/make-server-f99e977c/initialize', (c) => {
  return c.json({ success: true, message: 'Initialization not required or already done' });
});


// ============ TRAINING MATERIALS ENDPOINTS ============

// Get all materials
app.get('/make-server-f99e977c/training-materials', async (c) => {
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
});

// Create material
app.post('/make-server-f99e977c/training-materials', async (c) => {
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
});

// Update material
app.put('/make-server-f99e977c/training-materials/:id', async (c) => {
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
});

// Delete material
app.delete('/make-server-f99e977c/training-materials/:id', async (c) => {
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
});

// ============ MATERIAL PROGRESS ENDPOINTS ============

// Get all progress
app.get('/make-server-f99e977c/material-progress', async (c) => {
  try {
    const { data, error } = await supabase.from('material_progress').select('*');
    if (error) throw error;
    return c.json({ success: true, data: toCamelCase(data) });
  } catch (error) {
    console.log('Error fetching progress:', error);
    return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
  }
});

// Update progress (upsert)
app.post('/make-server-f99e977c/material-progress', async (c) => {
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
});

Deno.serve(app.fetch);