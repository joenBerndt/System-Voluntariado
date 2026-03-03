/// <reference lib="deno.ns" />
// @deno-types="npm:@types/hono"
// @ts-nocheck

import { Hono, type Context } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { supabase } from './utils/supabaseClient.ts';
import { toCamelCase, toSnakeCase } from './utils/formatters.ts';
import { logActivity } from './utils/logger.ts';
import * as ActivityController from './controllers/activityLogController.ts';
import * as ProjectController from './controllers/projectController.ts';
import * as UserController from './controllers/userController.ts';
import * as AuthController from './controllers/authController.ts';
import * as AreaController from './controllers/areaController.ts';
import * as ConvocatoriaController from './controllers/convocatoriaController.ts';
import * as ApplicationController from './controllers/applicationController.ts';
import * as ProjectAssignmentController from './controllers/projectAssignmentController.ts';
import * as TrainingController from './controllers/trainingController.ts';
import * as SystemController from './controllers/systemController.ts';

const app = new Hono();

declare const Deno: any;

app.use('*', cors());
app.use('*', logger(console.log));




// Health check
app.get('/make-server-f99e977c/health', (c: Context) => {
  return c.json({ status: 'ok' });
});

// ============ ACTIVITY LOGS ENDPOINT ============
app.get('/make-server-f99e977c/activity-logs', ActivityController.getActivityLogs);

// Create activity log (manual from frontend)
app.post('/make-server-f99e977c/activity-logs', ActivityController.createActivityLog);

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
app.post('/make-server-f99e977c/login', AuthController.login);

// Register endpoint
app.post('/make-server-f99e977c/register', AuthController.register);


// ============ VOLUNTEERS ENDPOINTS ============
// Note: Volunteers are managed as users with role='volunteer'
// We might want to move specific volunteer logic to UserController or keep it separate if complex.
// For now, reusing UserController logic or keeping custom endpoints if they differ significantly from generic user ones?
// Actually, the original implementation had specific volunteer endpoints. Let's redirect them to specialized or generic user controller functions if possible,
// or keep them as is if they are unique.
// The original implementation had:
// GET /volunteers -> fetch users where role='volunteer'
// POST /volunteers -> create user with role='volunteer'
// These can be served by UserController too, or we can add specific exports to UserController.
// Let's assume for now we keep the original paths but delegate logic (or keep inline if simple wrappers).

// Let's refactor them to be clean:

// Get all volunteers
app.get('/make-server-f99e977c/volunteers', async (c: Context) => {
  // This is simple enough to keep inline or move to UserController.getVolunteers
  // Let's keep it consistent and use UserController if we add a getVolunteers method,
  // or just rely on query params? The original was specific.
  // Ideally we'd have UserController.getVolunteers.
  // For now, let's leave it inline to avoid breaking changes if I didn't add it to UserController yet.
  // Wait, I didn't add getVolunteers to UserController.
  // Let's use the generic logic inline for now to save time, or better, add it to UserController.
  // I will stick to what I have for UserController.
  // The original code:
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
  // Similar to createUser but forces role='volunteer'
  // Inline for now until we expand UserController
  try {
    const volunteerData = await c.req.json();
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
app.put('/make-server-f99e977c/volunteers/:id', UserController.updateUser); // Can reuse generic update

// Delete volunteer
app.delete('/make-server-f99e977c/volunteers/:id', UserController.deleteUser); // Can reuse generic delete


// ============ USERS ENDPOINTS ============

// Get all users
app.get('/make-server-f99e977c/users', UserController.getUsers);

// Create user (legacy/admin)
app.post('/make-server-f99e977c/users', UserController.createUser);

// Get user by email
app.get('/make-server-f99e977c/users/by-email/:email', UserController.getUserByEmail);

// Update user role
app.put('/make-server-f99e977c/users/:id/role', UserController.updateUserRole);

// Update user (general)
app.put('/make-server-f99e977c/users/:id', UserController.updateUser);

// Delete user
app.delete('/make-server-f99e977c/users/:id', UserController.deleteUser);


// ============ PROJECTS ENDPOINTS ============

// Get all projects
app.get('/make-server-f99e977c/projects', ProjectController.getProjects);

// Create project
app.post('/make-server-f99e977c/projects', ProjectController.createProject);

// Update project
app.put('/make-server-f99e977c/projects/:id', ProjectController.updateProject);

// Delete project
app.delete('/make-server-f99e977c/projects/:id', ProjectController.deleteProject);


// ============ PROJECT ASSIGNMENTS ENDPOINTS ============

// Get all assignments
app.get('/make-server-f99e977c/project-assignments', ProjectAssignmentController.getAssignments);

// Create assignment
app.post('/make-server-f99e977c/project-assignments', ProjectAssignmentController.createAssignment);

// Delete assignment
app.delete('/make-server-f99e977c/project-assignments/:id', ProjectAssignmentController.deleteAssignment);


// ============ CONVOCATORIAS ENDPOINTS ============

// Get all convocatorias
app.get('/make-server-f99e977c/convocatorias', ConvocatoriaController.getConvocatorias);

// Create convocatoria
app.post('/make-server-f99e977c/convocatorias', ConvocatoriaController.createConvocatoria);

// Update convocatoria
app.put('/make-server-f99e977c/convocatorias/:id', ConvocatoriaController.updateConvocatoria);

// Delete convocatoria
app.delete('/make-server-f99e977c/convocatorias/:id', ConvocatoriaController.deleteConvocatoria);


// ============ APPLICATIONS ENDPOINTS ============

// Get all applications
app.get('/make-server-f99e977c/applications', ApplicationController.getApplications);

// Delete single activity log (Moved up by mistake? No, it was here in original text but poorly placed)
// Keeping ActivityController calls consistent
app.delete('/make-server-f99e977c/activity-logs/:id', async (c: Context) => {
  // This wasn't in ActivityController? Let's check.
  // I didn't add deleteActivityLog to ActivityController.
  // Inline for now.
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
  // Inline for now
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
app.get('/make-server-f99e977c/applications/user/:userEmail', ApplicationController.getUserApplications);

// Create application
app.post('/make-server-f99e977c/applications', ApplicationController.createApplication);


// Update application status
app.put('/make-server-f99e977c/applications/:email/:id', ApplicationController.updateApplicationStatus);

// Delete application
// We support both email/id path (legacy) or just id if we wanted, but let's stick to the route used by frontend
app.delete('/make-server-f99e977c/applications/:email/:id', ApplicationController.deleteApplication);


// ============ AREAS ENDPOINTS ============

app.get('/make-server-f99e977c/areas', AreaController.getAreas);

app.post('/make-server-f99e977c/areas', AreaController.createArea);

app.put('/make-server-f99e977c/areas/:id', AreaController.updateArea);

app.delete('/make-server-f99e977c/areas/:id', AreaController.deleteArea);

// ============ ABOUT ENDPOINTS ============

app.get('/make-server-f99e977c/about', SystemController.getAboutInfo);

app.put('/make-server-f99e977c/about', SystemController.updateAboutInfo);

// ============ UPLOAD ENDPOINTS ============

app.post('/make-server-f99e977c/upload/image', SystemController.uploadImage);

// ============ INITIALIZE ENDPOINT ============

app.post('/make-server-f99e977c/initialize', SystemController.initialize);


// ============ TRAINING MATERIALS ENDPOINTS ============

// Get all materials
app.get('/make-server-f99e977c/training-materials', TrainingController.getMaterials);

// Create material
app.post('/make-server-f99e977c/training-materials', TrainingController.createMaterial);

// Update material
app.put('/make-server-f99e977c/training-materials/:id', TrainingController.updateMaterial);

// Delete material
app.delete('/make-server-f99e977c/training-materials/:id', TrainingController.deleteMaterial);

// ============ MATERIAL PROGRESS ENDPOINTS ============

// Get all progress
app.get('/make-server-f99e977c/material-progress', TrainingController.getProgress);

// Update progress (upsert)
app.post('/make-server-f99e977c/material-progress', TrainingController.updateProgress);

Deno.serve(app.fetch);