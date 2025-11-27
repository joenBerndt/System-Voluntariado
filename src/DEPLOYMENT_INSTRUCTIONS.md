# Instrucciones de Despliegue del Servidor

## ⚠️ Error 403 al Desplegar el Servidor

Si recibes un error 403 al intentar desplegar el servidor Supabase, sigue estos pasos:

### Solución 1: Redespliega el Servidor Manualmente

1. Abre el panel de Supabase en tu navegador
2. Ve a **Edge Functions**
3. Busca la función `make-server-f99e977c`
4. Haz clic en **Deploy** o **Redeploy**
5. Espera a que el despliegue se complete

### Solución 2: Verifica los Permisos

El error 403 generalmente significa que:
- No tienes permisos suficientes en el proyecto de Supabase
- El token de autenticación ha expirado
- Hay un problema temporal con los servicios de Supabase

**Verifica:**
1. Que tu sesión de Supabase esté activa
2. Que tengas permisos de administrador en el proyecto
3. Que no haya problemas de red o firewall

### Solución 3: Reconecta Supabase

1. Desconecta el proyecto de Supabase actual
2. Vuelve a conectarlo desde cero
3. Intenta desplegar nuevamente

## 📡 Endpoints Disponibles

Una vez que el servidor esté desplegado correctamente, estos endpoints estarán disponibles:

### Training Materials
- `GET /training-materials` - Obtener todos los materiales
- `GET /training-materials/project/:projectId` - Materiales por proyecto
- `POST /training-materials` - Crear material
- `PUT /training-materials/:id` - Actualizar material
- `DELETE /training-materials/:id` - Eliminar material

### Projects
- `GET /projects` - Obtener todos los proyectos
- `POST /projects` - Crear proyecto
- `PUT /projects/:id` - Actualizar proyecto
- `DELETE /projects/:id` - Eliminar proyecto

### Assignments
- `GET /project-assignments` - Obtener asignaciones
- `POST /project-assignments` - Asignar voluntario a proyecto
- `DELETE /project-assignments/:id` - Eliminar asignación

### Users & Volunteers
- `GET /users` - Obtener usuarios
- `GET /volunteers` - Obtener voluntarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario

## 🔧 Verificar que el Servidor Funciona

Después de desplegar, verifica que el servidor funciona correctamente:

1. Abre la consola del navegador (F12)
2. Busca errores relacionados con `404` o `403`
3. Si ves "Error fetching data: Error: HTTP error! status: 404", el servidor no está desplegado
4. Si los datos cargan correctamente, el servidor está funcionando ✅

## 💡 Notas Importantes

- Los errores 404 desaparecerán automáticamente una vez que el servidor esté desplegado
- El error de JSON parsing está relacionado con el error 404
- Todos los endpoints están configurados correctamente en el código
- El problema es solo de despliegue, no de implementación

## 🆘 Soporte

Si el problema persiste:
1. Revisa los logs de Supabase Edge Functions
2. Verifica que el proyecto ID sea correcto en `/utils/supabase/info.tsx`
3. Asegúrate de que la función `make-server-f99e977c` exista en tu proyecto
