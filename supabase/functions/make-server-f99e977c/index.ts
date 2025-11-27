import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.ts';
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Helper function to get applications with their keys
const getApplicationsWithKeys = async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const { data, error } = await supabase
    .from("kv_store_f99e977c")
    .select("key, value")
    .like("key", "application:%");

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((d) => ({ key: d.key, value: d.value })) ?? [];
};

app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-f99e977c/health', (c) => {
  return c.json({ status: 'ok' });
});

// ============ INITIALIZATION ENDPOINT ============

app.post('/make-server-f99e977c/initialize', async (c) => {
  try {
    // Check if data already exists
    const volunteers = await kv.getByPrefix('volunteer:');
    const convocatorias = await kv.getByPrefix('convocatoria:');
    const areas = await kv.getByPrefix('area:');
    const aboutInfo = await kv.get('about:info');

    // Initialize volunteers if empty
    if (volunteers.length === 0) {
      const mockVolunteers = [
        {
          id: '1',
          name: 'María García',
          email: 'maria@example.com',
          phone: '+51 987654321',
          area: 'Educación',
          skills: 'Enseñanza, Pedagogía',
          status: 'activo',
          registeredDate: '2024-01-15',
        },
        {
          id: '2',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+51 987654322',
          area: 'Medio Ambiente',
          skills: 'Biología, Conservación',
          status: 'activo',
          registeredDate: '2024-02-10',
        },
      ];

      for (const volunteer of mockVolunteers) {
        await kv.set(`volunteer:${volunteer.id}`, volunteer);
      }
    }

    // Initialize convocatorias if empty
    if (convocatorias.length === 0) {
      const mockConvocatorias = [
        {
          id: '1',
          title: 'Voluntariado en Conservación de Biodiversidad',
          description: 'Únete a nuestro equipo para contribuir en la investigación y conservación de especies amazónicas.',
          area: 'Medio Ambiente',
          startDate: '2024-12-01',
          endDate: '2025-03-31',
          vacancies: 10,
          applicants: 3,
          acceptedVolunteers: 0,
          requirements: 'Estudiantes o profesionales en biología, ecología o carreras afines.',
          status: 'activa',
          createdDate: '2024-11-01',
          projectId: '1', // Add projectId to link to a project
        },
        {
          id: '2',
          title: 'Apoyo en Educación Ambiental',
          description: 'Participa en programas educativos para comunidades locales sobre sostenibilidad y recursos naturales.',
          area: 'Educación',
          startDate: '2024-12-15',
          endDate: '2025-04-15',
          vacancies: 8,
          applicants: 2,
          acceptedVolunteers: 0,
          requirements: 'Habilidades de comunicación y conocimientos básicos en medio ambiente.',
          status: 'activa',
          createdDate: '2024-11-05',
          projectId: '2', // Add projectId to link to a project
        },
      ];

      for (const convocatoria of mockConvocatorias) {
        await kv.set(`convocatoria:${convocatoria.id}`, convocatoria);
      }
    }

    // Initialize areas if empty
    if (areas.length === 0) {
      const mockAreas = [
        {
          id: '1',
          name: 'Biodiversidad Amazónica',
          description: 'Investigación y conservación de la flora y fauna amazónica, contribuyendo al conocimiento científico de uno de los ecosistemas más diversos del planeta.',
          icon: 'leaf',
          published: true,
        },
        {
          id: '2',
          name: 'Recursos Hídricos',
          description: 'Gestión sostenible de recursos acuáticos, monitoreo de calidad del agua y estudios hidrológicos en la cuenca amazónica.',
          icon: 'droplet',
          published: true,
        },
        {
          id: '3',
          name: 'Acuicultura y Pesca',
          description: 'Desarrollo de tecnologías para la acuicultura sostenible y gestión responsable de recursos pesqueros amazónicos.',
          icon: 'fish',
          published: true,
        },
        {
          id: '4',
          name: 'Cambio Climático',
          description: 'Estudios sobre el impacto del cambio climático en la Amazonía y estrategias de adaptación y mitigación.',
          icon: 'cloud',
          published: true,
        },
        {
          id: '5',
          name: 'Comunidades Indígenas',
          description: 'Apoyo al desarrollo sostenible de comunidades indígenas amazónicas, rescatando conocimientos tradicionales.',
          icon: 'users',
          published: true,
        },
        {
          id: '6',
          name: 'Biotecnología',
          description: 'Investigación biotecnológica aplicada a productos naturales amazónicos con potencial medicinal e industrial.',
          icon: 'flask',
          published: true,
        },
      ];

      for (const area of mockAreas) {
        await kv.set(`area:${area.id}`, area);
      }
    }

    // Initialize about info if empty
    if (!aboutInfo) {
      const mockAbout = {
        id: 'info',
        mission: 'Realizar investigación científica y tecnológica de manera integral y sostenible en la Amazonía peruana, generando conocimientos y tecnologías para el aprovechamiento responsable de la biodiversidad y los recursos naturales, contribuyendo al desarrollo sostenible de la región amazónica.',
        vision: 'Ser la institución líder en investigación amazónica, reconocida nacional e internacionalmente por la excelencia científica y tecnológica, y por su contribución al desarrollo sostenible de la Amazonía peruana.',
        history: 'El Instituto de Investigaciones de la Amazonía Peruana (IIAP) fue creado mediante Ley N° 23374 el 30 de diciembre de 1981. Desde entonces, ha sido la entidad rectora de la investigación científica y tecnológica en la Amazonía peruana, contribuyendo al conocimiento y desarrollo sostenible de esta región estratégica.',
        values: [
          'Excelencia científica',
          'Sostenibilidad ambiental',
          'Compromiso social',
          'Integridad y transparencia',
          'Innovación y creatividad',
        ],
        published: true,
      };

      await kv.set('about:info', mockAbout);
    }

    return c.json({ success: true, message: 'Data initialized successfully' });
  } catch (error) {
    console.log('Error initializing data:', error);
    return c.json({ success: false, error: 'Failed to initialize data' }, 500);
  }
});

// ============ VOLUNTEERS ENDPOINTS ============

// Get all volunteers
app.get('/make-server-f99e977c/volunteers', async (c) => {
  try {
    // Get users with volunteer role
    const users = await kv.getByPrefix('user:');
    const volunteers = users.filter(user => user.role === 'volunteer');
    return c.json({ success: true, data: volunteers });
  } catch (error) {
    console.log('Error fetching volunteers:', error);
    return c.json({ success: false, error: 'Failed to fetch volunteers' }, 500);
  }
});

// Create volunteer
app.post('/make-server-f99e977c/volunteers', async (c) => {
  try {
    const volunteerData = await c.req.json();

    // Check if email already exists
    const users = await kv.getByPrefix('user:');
    const existingUser = users.find(u => u.email === volunteerData.email);
    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 400);
    }

    const id = Date.now().toString();

    // Remove password from volunteer data (will be stored separately in localStorage on client)
    const { password, ...dataWithoutPassword } = volunteerData;

    const volunteer = {
      id,
      ...dataWithoutPassword,
      role: 'volunteer',
      status: 'activo',
      registeredDate: new Date().toISOString().split('T')[0],
    };

    // Create user with volunteer role
    await kv.set(`user:${id}`, volunteer);
    return c.json({ success: true, data: volunteer });
  } catch (error) {
    console.log('Error creating volunteer:', error);
    return c.json({ success: false, error: 'Failed to create volunteer' }, 500);
  }
});

// Update volunteer
app.put('/make-server-f99e977c/volunteers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`user:${id}`);

    if (!existing || existing.role !== 'volunteer') {
      return c.json({ success: false, error: 'Volunteer not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`user:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating volunteer:', error);
    return c.json({ success: false, error: 'Failed to update volunteer' }, 500);
  }
});

// Delete volunteer
app.delete('/make-server-f99e977c/volunteers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await kv.get(`user:${id}`);

    if (!user || user.role !== 'volunteer') {
      return c.json({ success: false, error: 'Volunteer not found' }, 404);
    }

    // Delete all user's applications
    const applications = await kv.getByPrefix(`application:${user.email}:`);
    for (const app of applications) {
      await kv.del(`application:${user.email}:${app.id}`);

      // Decrease applicants count in convocatoria
      if (app.status !== 'cancelled') {
        const convocatoria = await kv.get(`convocatoria:${app.convocatoriaId}`);
        if (convocatoria && convocatoria.applicants > 0) {
          await kv.set(`convocatoria:${app.convocatoriaId}`, {
            ...convocatoria,
            applicants: convocatoria.applicants - 1,
          });
        }
      }
    }

    // Delete user
    await kv.del(`user:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting volunteer:', error);
    return c.json({ success: false, error: 'Failed to delete volunteer' }, 500);
  }
});

// ============ USERS ENDPOINTS ============

// Get all users
app.get('/make-server-f99e977c/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    return c.json({ success: true, data: users });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// Create user (register)
app.post('/make-server-f99e977c/users', async (c) => {
  try {
    const userData = await c.req.json();

    // Check if email already exists
    const users = await kv.getByPrefix('user:');
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 400);
    }

    const id = Date.now().toString();
    const user = {
      id,
      ...userData,
      role: 'user', // Default role: user
      registeredDate: new Date().toISOString().split('T')[0],
    };

    await kv.set(`user:${id}`, user);
    return c.json({ success: true, data: user });
  } catch (error) {
    console.log('Error creating user:', error);
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

// Get user by email
app.get('/make-server-f99e977c/users/by-email/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const users = await kv.getByPrefix('user:');
    const user = users.find(u => u.email === email);
    return c.json({ success: true, data: user || null });
  } catch (error) {
    console.log('Error fetching user:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// Update user role
app.put('/make-server-f99e977c/users/:id/role', async (c) => {
  try {
    const id = c.req.param('id');
    const { role } = await c.req.json();
    const existing = await kv.get(`user:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const updated = { ...existing, role };
    await kv.set(`user:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating user role:', error);
    return c.json({ success: false, error: 'Failed to update user role' }, 500);
  }
});

// Update user (general endpoint)
app.put('/make-server-f99e977c/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userData = await c.req.json();
    const existing = await kv.get(`user:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const updated = { ...existing, ...userData, id }; // Preserve ID
    await kv.set(`user:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating user:', error);
    return c.json({ success: false, error: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete('/make-server-f99e977c/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await kv.get(`user:${id}`);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Prevent deletion of admin accounts
    if (user.role === 'admin' || user.role === 'admin_master') {
      return c.json({
        success: false,
        error: 'No se puede eliminar cuentas de administrador'
      }, 403);
    }

    // Delete all user's applications
    const applications = await kv.getByPrefix(`application:${user.email}:`);
    for (const app of applications) {
      await kv.del(`application:${user.email}:${app.id}`);

      // Decrease applicants count in convocatoria
      if (app.status !== 'cancelled') {
        const convocatoria = await kv.get(`convocatoria:${app.convocatoriaId}`);
        if (convocatoria && convocatoria.applicants > 0) {
          await kv.set(`convocatoria:${app.convocatoriaId}`, {
            ...convocatoria,
            applicants: convocatoria.applicants - 1,
          });
        }
      }
    }

    // Delete user
    await kv.del(`user:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting user:', error);
    return c.json({ success: false, error: 'Failed to delete user' }, 500);
  }
});

// ============ PROJECTS ENDPOINTS ============

// Get all projects
app.get('/make-server-f99e977c/projects', async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    return c.json({ success: true, data: projects });
  } catch (error) {
    console.log('Error fetching projects:', error);
    return c.json({ success: false, error: 'Failed to fetch projects' }, 500);
  }
});

// Create project
app.post('/make-server-f99e977c/projects', async (c) => {
  try {
    const projectData = await c.req.json();
    const id = Date.now().toString();
    const project = {
      id,
      ...projectData,
      status: 'activo',
      createdDate: new Date().toISOString().split('T')[0],
    };

    await kv.set(`project:${id}`, project);
    return c.json({ success: true, data: project });
  } catch (error) {
    console.log('Error creating project:', error);
    return c.json({ success: false, error: 'Failed to create project' }, 500);
  }
});

// Update project
app.put('/make-server-f99e977c/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`project:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`project:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating project:', error);
    return c.json({ success: false, error: 'Failed to update project' }, 500);
  }
});

// Delete project
app.delete('/make-server-f99e977c/projects/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`project:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting project:', error);
    return c.json({ success: false, error: 'Failed to delete project' }, 500);
  }
});

// ============ PROJECT ASSIGNMENTS ENDPOINTS ============

// Get all project assignments
app.get('/make-server-f99e977c/project-assignments', async (c) => {
  try {
    const assignments = await kv.getByPrefix('project-assignment:');
    return c.json({ success: true, data: assignments });
  } catch (error) {
    console.log('Error fetching project assignments:', error);
    return c.json({ success: false, error: 'Failed to fetch project assignments' }, 500);
  }
});

// Create project assignment
app.post('/make-server-f99e977c/project-assignments', async (c) => {
  try {
    const { projectId, volunteerId, convocatoriaId } = await c.req.json();
    const assignmentId = `${volunteerId}:${projectId}`;
    const assignment = {
      id: assignmentId,
      volunteerId,
      projectId,
      convocatoriaId: convocatoriaId || null,
      assignedAt: new Date().toISOString(),
      status: 'active',
    };

    await kv.set(`project-assignment:${assignmentId}`, assignment);
    return c.json({ success: true, data: assignment });
  } catch (error) {
    console.log('Error creating project assignment:', error);
    return c.json({ success: false, error: 'Failed to create project assignment' }, 500);
  }
});

// Delete project assignment
app.delete('/make-server-f99e977c/project-assignments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`project-assignment:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting project assignment:', error);
    return c.json({ success: false, error: 'Failed to delete project assignment' }, 500);
  }
});

// ============ CONVOCATORIAS ENDPOINTS ============

// Get all convocatorias
app.get('/make-server-f99e977c/convocatorias', async (c) => {
  try {
    const convocatorias = await kv.getByPrefix('convocatoria:');
    return c.json({ success: true, data: convocatorias });
  } catch (error) {
    console.log('Error fetching convocatorias:', error);
    return c.json({ success: false, error: 'Failed to fetch convocatorias' }, 500);
  }
});

// Create convocatoria
app.post('/make-server-f99e977c/convocatorias', async (c) => {
  try {
    const convocatoriaData = await c.req.json();
    const id = Date.now().toString();
    const convocatoria = {
      id,
      ...convocatoriaData,
      applicants: 0,
      acceptedVolunteers: 0,
      createdDate: new Date().toISOString().split('T')[0],
    };

    await kv.set(`convocatoria:${id}`, convocatoria);
    return c.json({ success: true, data: convocatoria });
  } catch (error) {
    console.log('Error creating convocatoria:', error);
    return c.json({ success: false, error: 'Failed to create convocatoria' }, 500);
  }
});

// Update convocatoria
app.put('/make-server-f99e977c/convocatorias/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`convocatoria:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'Convocatoria not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`convocatoria:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating convocatoria:', error);
    return c.json({ success: false, error: 'Failed to update convocatoria' }, 500);
  }
});

// Delete convocatoria
app.delete('/make-server-f99e977c/convocatorias/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Check if there are pending applications
    const applications = await kv.getByPrefix('application:');
    const hasPendingApplications = applications.some(
      (app: any) => app.convocatoriaId === id &&
        ['pending', 'interview_pending', 'interview_confirmed'].includes(app.status)
    );

    if (hasPendingApplications) {
      return c.json({
        success: false,
        error: 'No se puede eliminar una convocatoria con postulaciones en proceso. Márquela como terminada en su lugar.',
        cannotDelete: true
      }, 400);
    }

    // If no pending applications, mark as terminated instead of deleting
    const existing = await kv.get(`convocatoria:${id}`);
    if (existing) {
      const updated = { ...existing, status: 'terminada' };
      await kv.set(`convocatoria:${id}`, updated);
      return c.json({ success: true, data: updated, terminated: true });
    }

    return c.json({ success: false, error: 'Convocatoria not found' }, 404);
  } catch (error) {
    console.log('Error deleting convocatoria:', error);
    return c.json({ success: false, error: 'Failed to delete convocatoria' }, 500);
  }
});

// ============ APPLICATIONS ENDPOINTS ============

// Get all applications (for admin)
app.get('/make-server-f99e977c/applications', async (c) => {
  try {
    // Get all applications with their keys
    const applicationsWithKeys = await getApplicationsWithKeys();

    console.log('GET /applications - Found applications:', applicationsWithKeys.length);

    // Clean up and validate applications
    const validApplications = [];
    const keysToDelete = [];

    for (const item of applicationsWithKeys) {
      const { key, value } = item;
      let app = { ...value };
      let needsUpdate = false;
      let shouldDelete = false;

      console.log('GET /applications - Processing:', { key, hasEmail: !!app.userEmail, hasId: !!app.id });

      // Try to extract email and id from the key if missing
      // Key format: application:email:id
      const keyParts = key.split(':');

      if (keyParts.length !== 3) {
        console.log('GET /applications - Invalid key format, marking for deletion:', key);
        keysToDelete.push(key);
        shouldDelete = true;
      } else {
        const [, keyEmail, keyId] = keyParts;

        // Check and fix missing email
        if (!app.userEmail && keyEmail) {
          console.log('GET /applications - Missing userEmail, extracting from key:', keyEmail);
          app.userEmail = keyEmail;
          needsUpdate = true;
        }

        // Check and fix missing id
        if (!app.id && keyId) {
          console.log('GET /applications - Missing id, extracting from key:', keyId);
          app.id = keyId;
          needsUpdate = true;
        }

        // If still missing critical data, mark for deletion
        if (!app.userEmail || !app.id) {
          console.log('GET /applications - Still missing critical data after extraction, marking for deletion');
          keysToDelete.push(key);
          shouldDelete = true;
        }

        // Update the application in the database if we fixed it
        if (needsUpdate && !shouldDelete) {
          console.log('GET /applications - Updating application with fixed data:', app);
          await kv.set(key, app);
        }
      }

      // Only add to valid applications if not marked for deletion
      if (!shouldDelete) {
        validApplications.push(app);
      }
    }

    // Delete corrupted applications
    if (keysToDelete.length > 0) {
      console.log('GET /applications - Deleting corrupted applications:', keysToDelete);
      await kv.mdel(keysToDelete);
    }

    console.log('GET /applications - Valid applications:', validApplications.length);
    if (validApplications.length > 0) {
      console.log('GET /applications - Sample application:', validApplications[0]);
    }

    return c.json({ success: true, data: validApplications });
  } catch (error) {
    console.log('Error fetching all applications:', error);
    return c.json({ success: false, error: 'Failed to fetch applications' }, 500);
  }
});

// Get applications for a user
app.get('/make-server-f99e977c/applications/user/:userEmail', async (c) => {
  try {
    const email = c.req.param('userEmail');
    const applications = await kv.getByPrefix(`application:${email}:`);
    return c.json({ success: true, data: applications });
  } catch (error) {
    console.log('Error fetching applications:', error);
    return c.json({ success: false, error: 'Failed to fetch applications' }, 500);
  }
});

// Create application
app.post('/make-server-f99e977c/applications', async (c) => {
  try {
    const applicationData = await c.req.json();
    const id = Date.now().toString();
    const application = {
      id,
      ...applicationData,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    await kv.set(`application:${applicationData.userEmail}:${id}`, application);

    // Update convocatoria applicants count
    const convocatoria = await kv.get(`convocatoria:${applicationData.convocatoriaId}`);
    if (convocatoria) {
      await kv.set(`convocatoria:${applicationData.convocatoriaId}`, {
        ...convocatoria,
        applicants: (convocatoria.applicants || 0) + 1,
      });
    }

    return c.json({ success: true, data: application });
  } catch (error) {
    console.log('Error creating application:', error);
    return c.json({ success: false, error: 'Failed to create application' }, 500);
  }
});

// Update application status (accept/reject)
app.put('/make-server-f99e977c/applications/:email/:id', async (c) => {
  try {
    const email = c.req.param('email');
    const id = c.req.param('id');
    const updates = await c.req.json();

    console.log('PUT /applications - Params:', { email, id });
    console.log('PUT /applications - Looking for key:', `application:${email}:${id}`);

    let existing = await kv.get(`application:${email}:${id}`);
    let actualKey = `application:${email}:${id}`;

    // If not found, try to find it by ID in all applications
    if (!existing) {
      console.log('PUT /applications - Application not found with email, trying to find by ID...');
      const allApps = await kv.getByPrefix(`application:`);
      const matchingApp = allApps.find((a: any) => a.id === id);

      if (matchingApp) {
        console.log('PUT /applications - Found application by ID:', matchingApp);
        existing = matchingApp;
        actualKey = `application:${matchingApp.userEmail}:${id}`;
      } else {
        console.log('PUT /applications - Application not found even by ID');
        return c.json({ success: false, error: 'Application not found' }, 404);
      }
    }

    const updated = { ...existing, ...updates };
    await kv.set(actualKey, updated);

    // If accepted, create volunteer and update user role
    if (updates.status === 'accepted') {
      // Update user role to 'volunteer'
      const users = await kv.getByPrefix('user:');
      const user = users.find((u: any) => u.email === existing.userEmail);
      if (user) {
        await kv.set(`user:${user.id}`, { ...user, role: 'volunteer' });

        // Auto-assign volunteer to the convocatoria's project
        const convocatoria = await kv.get(`convocatoria:${existing.convocatoriaId}`);
        if (convocatoria && convocatoria.projectId) {
          const assignmentId = `${user.id}:${convocatoria.projectId}`;
          const assignment = {
            id: assignmentId,
            volunteerId: user.id,
            projectId: convocatoria.projectId,
            convocatoriaId: convocatoria.id,
            assignedAt: new Date().toISOString(),
            status: 'active',
          };
          await kv.set(`project-assignment:${assignmentId}`, assignment);
        }

        // Increment acceptedVolunteers count in convocatoria
        if (convocatoria) {
          await kv.set(`convocatoria:${existing.convocatoriaId}`, {
            ...convocatoria,
            acceptedVolunteers: (convocatoria.acceptedVolunteers || 0) + 1,
          });
        }
      }
    }

    // If cancelled by user, decrease applicants count
    if (updates.status === 'cancelled') {
      const convocatoria = await kv.get(`convocatoria:${existing.convocatoriaId}`);
      if (convocatoria && convocatoria.applicants > 0) {
        await kv.set(`convocatoria:${existing.convocatoriaId}`, {
          ...convocatoria,
          applicants: convocatoria.applicants - 1,
        });
      }
    }

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating application:', error);
    return c.json({ success: false, error: 'Failed to update application' }, 500);
  }
});

// Delete application (admin only)
app.delete('/make-server-f99e977c/applications/:email/:id', async (c) => {
  try {
    const email = c.req.param('email');
    const id = c.req.param('id');

    const existing = await kv.get(`application:${email}:${id}`);
    if (!existing) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }

    // Decrease applicants count
    const convocatoria = await kv.get(`convocatoria:${existing.convocatoriaId}`);
    if (convocatoria && convocatoria.applicants > 0) {
      await kv.set(`convocatoria:${existing.convocatoriaId}`, {
        ...convocatoria,
        applicants: convocatoria.applicants - 1,
      });
    }

    await kv.del(`application:${email}:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting application:', error);
    return c.json({ success: false, error: 'Failed to delete application' }, 500);
  }
});

// Check if user already applied to convocatoria
app.get('/make-server-f99e977c/check-application/:email/:convocatoriaId', async (c) => {
  try {
    const email = c.req.param('email');
    const convocatoriaId = c.req.param('convocatoriaId');
    const applications = await kv.getByPrefix(`application:${email}:`);
    const applied = applications.some(app => app.convocatoriaId === convocatoriaId);
    return c.json({ success: true, data: { applied } });
  } catch (error) {
    console.log('Error checking application:', error);
    return c.json({ success: false, error: 'Failed to check application' }, 500);
  }
});

// ============ USER AUTH ENDPOINTS ============

// Get user by email (for auth)
app.get('/make-server-f99e977c/user-auth/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const users = await kv.getByPrefix('user:');
    const user = users.find(u => u.email === email);
    return c.json({ success: true, data: user || null });
  } catch (error) {
    console.log('Error fetching user:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// ============ AREAS ENDPOINTS ============

// Get all areas
app.get('/make-server-f99e977c/areas', async (c) => {
  try {
    const areas = await kv.getByPrefix('area:');
    return c.json({ success: true, data: areas });
  } catch (error) {
    console.log('Error fetching areas:', error);
    return c.json({ success: false, error: 'Failed to fetch areas' }, 500);
  }
});

// Create area
app.post('/make-server-f99e977c/areas', async (c) => {
  try {
    const areaData = await c.req.json();
    const id = Date.now().toString();
    const area = {
      id,
      ...areaData,
    };

    await kv.set(`area:${id}`, area);
    return c.json({ success: true, data: area });
  } catch (error) {
    console.log('Error creating area:', error);
    return c.json({ success: false, error: 'Failed to create area' }, 500);
  }
});

// Update area
app.put('/make-server-f99e977c/areas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`area:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'Area not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`area:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating area:', error);
    return c.json({ success: false, error: 'Failed to update area' }, 500);
  }
});

// Delete area
app.delete('/make-server-f99e977c/areas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`area:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting area:', error);
    return c.json({ success: false, error: 'Failed to delete area' }, 500);
  }
});

// ============ ABOUT ENDPOINTS ============

// Get about info
app.get('/make-server-f99e977c/about', async (c) => {
  try {
    const about = await kv.get('about:info');
    return c.json({ success: true, data: about || null });
  } catch (error) {
    console.log('Error fetching about info:', error);
    return c.json({ success: false, error: 'Failed to fetch about info' }, 500);
  }
});

// Update about info
app.put('/make-server-f99e977c/about', async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('about:info');

    const updated = {
      id: 'info',
      ...(existing || {}),
      ...updates,
    };

    await kv.set('about:info', updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating about info:', error);
    return c.json({ success: false, error: 'Failed to update about info' }, 500);
  }
});

// ============ TRAINING MATERIALS ENDPOINTS ============

// Get all training materials
app.get('/make-server-f99e977c/training-materials', async (c) => {
  try {
    const materials = await kv.getByPrefix('training-material:');
    return c.json({ success: true, data: materials });
  } catch (error) {
    console.error('Error fetching training materials:', error);
    return c.json({ success: false, error: 'Failed to fetch training materials' }, 500);
  }
});

// Create training material
app.post('/make-server-f99e977c/training-materials', async (c) => {
  try {
    const materialData = await c.req.json();
    const id = Date.now().toString();
    const material = {
      id,
      ...materialData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`training-material:${id}`, material);
    return c.json({ success: true, data: material });
  } catch (error) {
    console.error('Error creating training material:', error);
    return c.json({ success: false, error: 'Failed to create training material' }, 500);
  }
});

// Update training material
app.put('/make-server-f99e977c/training-materials/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`training-material:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'Training material not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`training-material:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating training material:', error);
    return c.json({ success: false, error: 'Failed to update training material' }, 500);
  }
});

// Delete training material
app.delete('/make-server-f99e977c/training-materials/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`training-material:${id}`);

    if (!existing) {
      return c.json({ success: false, error: 'Training material not found' }, 404);
    }

    // Delete the material
    await kv.del(`training-material:${id}`);

    // Delete all progress records associated with this material
    const allProgress = await kv.getByPrefix('material-progress:');
    const materialProgress = allProgress.filter((p: any) => p.materialId === id);
    for (const progress of materialProgress) {
      await kv.del(`material-progress:${progress.volunteerId}:${id}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting training material:', error);
    return c.json({ success: false, error: 'Failed to delete training material' }, 500);
  }
});

// ============ MATERIAL PROGRESS ENDPOINTS ============

// Get all material progress
app.get('/make-server-f99e977c/material-progress', async (c) => {
  try {
    const progress = await kv.getByPrefix('material-progress:');
    return c.json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching material progress:', error);
    return c.json({ success: false, error: 'Failed to fetch material progress' }, 500);
  }
});

// Get progress for a specific volunteer
app.get('/make-server-f99e977c/material-progress/volunteer/:volunteerId', async (c) => {
  try {
    const volunteerId = c.req.param('volunteerId');
    const progress = await kv.getByPrefix(`material-progress:${volunteerId}:`);
    return c.json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching volunteer progress:', error);
    return c.json({ success: false, error: 'Failed to fetch volunteer progress' }, 500);
  }
});

// Create or update material progress
app.post('/make-server-f99e977c/material-progress', async (c) => {
  try {
    const progressData = await c.req.json();
    const { volunteerId, materialId, userId, progress, viewed } = progressData;

    // Use either volunteerId or userId
    const id = volunteerId || userId;

    if (!id || !materialId) {
      return c.json({ success: false, error: 'volunteerId/userId and materialId are required' }, 400);
    }

    const key = `material-progress:${id}:${materialId}`;
    const existing = await kv.get(key);

    const progressRecord = {
      id: existing?.id || `${id}-${materialId}`,
      volunteerId: id,
      userId: id,
      materialId,
      progress: progress !== undefined ? progress : (existing?.progress || 0),
      viewed: viewed !== undefined ? viewed : (existing?.viewed || false),
      viewedAt: progressData.viewedAt || existing?.viewedAt,
      completedAt: progressData.completedAt || existing?.completedAt,
      lastUpdated: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    await kv.set(key, progressRecord);
    return c.json({ success: true, data: progressRecord });
  } catch (error) {
    console.error('Error saving material progress:', error);
    return c.json({ success: false, error: 'Failed to save material progress' }, 500);
  }
});

// Update material progress by ID
app.put('/make-server-f99e977c/material-progress/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    // ID format is "volunteerId-materialId"
    const [volunteerId, materialId] = id.split('-');

    if (!volunteerId || !materialId) {
      return c.json({ success: false, error: 'Invalid progress ID format' }, 400);
    }

    const key = `material-progress:${volunteerId}:${materialId}`;
    const existing = await kv.get(key);

    const progressRecord = {
      id,
      volunteerId,
      userId: volunteerId,
      materialId,
      ...(existing || {}),
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    await kv.set(key, progressRecord);
    return c.json({ success: true, data: progressRecord });
  } catch (error) {
    console.error('Error updating material progress:', error);
    return c.json({ success: false, error: 'Failed to update material progress' }, 500);
  }
});

// Update material progress
app.put('/make-server-f99e977c/material-progress/:volunteerId/:materialId', async (c) => {
  try {
    const volunteerId = c.req.param('volunteerId');
    const materialId = c.req.param('materialId');
    const updates = await c.req.json();

    const key = `material-progress:${volunteerId}:${materialId}`;
    const existing = await kv.get(key);

    const progressRecord = {
      id: `${volunteerId}-${materialId}`,
      volunteerId,
      userId: volunteerId,
      materialId,
      ...(existing || {}),
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    await kv.set(key, progressRecord);
    return c.json({ success: true, data: progressRecord });
  } catch (error) {
    console.error('Error updating material progress:', error);
    return c.json({ success: false, error: 'Failed to update material progress' }, 500);
  }
});

Deno.serve(app.fetch);