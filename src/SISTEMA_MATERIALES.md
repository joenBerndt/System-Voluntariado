# 📹 Sistema de Materiales de Capacitación

## Descripción General

Sistema completamente rediseñado para la gestión de videos de capacitación en proyectos de voluntariado. Enfocado en simplicidad, claridad y funcionalidad robusta.

## 🎯 Características Principales

### Para Administradores (admin/admin_master)

1. **Gestión de Videos**
   - Agregar videos de YouTube a proyectos
   - Editar información de videos existentes
   - Eliminar videos (con confirmación)
   - Publicar/Despublicar videos (control de visibilidad)

2. **Seguimiento de Progreso**
   - Ver cuántos voluntarios vieron cada video
   - Monitorear progreso promedio de visualización
   - Detalles individuales de cada voluntario
   - Estado de visualización (visto/sin ver)

### Para Voluntarios

1. **Visualización de Videos**
   - Ver videos asignados a sus proyectos
   - Reproducción directa desde YouTube
   - Marcado automático como "visto" al cargar el video
   - Seguimiento de progreso personal

## 📁 Estructura de Archivos

```
/components/
├── ContentManagement.tsx        # Gestión de materiales (admins)
├── VideoMaterialModal.tsx       # Modal para crear/editar videos
├── VolunteerProjects.tsx        # Vista de materiales (voluntarios)
└── VolunteerDashboard.tsx       # Dashboard con estadísticas
```

## 🔧 Componentes Clave

### 1. VideoMaterialModal.tsx
Modal simplificado para crear/editar videos:
- Campo: Título del video (requerido)
- Campo: Descripción (opcional)
- Campo: URL de YouTube (requerido)
- Toggle: Publicado/Borrador

### 2. ContentManagement.tsx
Panel de administración con:
- Selección de proyecto
- Lista de videos del proyecto
- Botones de acción (editar, eliminar)
- Estadísticas de visualización
- Modal de progreso de voluntarios

## 🔄 Flujo de Datos

### Crear Material
```
1. Admin selecciona proyecto
2. Click en "Agregar Video"
3. Completa formulario en modal
4. Submit → POST /training-materials
5. Material guardado en KV store
6. Lista se actualiza automáticamente
```

### Ver Material (Voluntario)
```
1. Voluntario entra a "Mis Proyectos"
2. Ve materiales publicados del proyecto
3. Carga video de YouTube
4. onLoad → POST /material-progress
5. Marca automáticamente como "visto"
```

## 📊 Estructura de Datos

### Training Material
```typescript
{
  id: string;              // Timestamp generado
  title: string;           // Título del video
  description: string;     // Descripción opcional
  url: string;             // URL de YouTube
  projectId: string;       // ID del proyecto
  published: boolean;      // ¿Visible para voluntarios?
  type: 'youtube';         // Tipo fijo
  order: number;           // Orden de visualización
  createdAt: string;       // ISO timestamp
}
```

### Material Progress
```typescript
{
  id: string;              // volunteerId:materialId
  volunteerId: string;     // ID del voluntario
  materialId: string;      // ID del material
  viewed: boolean;         // ¿Visto?
  progress: number;        // Porcentaje (0-100)
  lastViewedAt: string;    // ISO timestamp
}
```

## 🎨 Diseño Visual

### Paleta de Colores
- **Principal**: Emerald/Teal (verde esmeralda)
- **Publicado**: Verde esmeralda
- **Borrador**: Ámbar/Naranja
- **YouTube**: Rojo
- **Completado**: Verde con checkmark

### Estados Visuales
- **Publicado**: Badge verde con "✓ Publicado"
- **Borrador**: Badge ámbar con "○ Borrador"
- **Visto**: Badge verde con "✓ Visto"
- **Sin ver**: Badge gris con "Sin ver"

## 🔍 Sistema de Logging

Todos los componentes incluyen logging detallado:

```javascript
// Antes de guardar
console.log('💾 Guardando material:', materialData);

// Al crear
console.log('➕ Creando nuevo material...');

// Al actualizar
console.log('📝 Actualizando material existente...');

// Resultado exitoso
console.log('✅ Material creado:', result);

// Error
console.error('❌ Error guardando material:', err);
```

## 🚀 Cómo Usar

### Como Administrador

1. **Agregar Video**
   ```
   1. Ve a "Asignaciones"
   2. Selecciona un proyecto
   3. Click "Agregar Video"
   4. Completa título y URL de YouTube
   5. Marca como "Publicado" para hacerlo visible
   6. Click "Crear Video"
   ```

2. **Monitorear Progreso**
   ```
   1. En la lista de videos, cada uno muestra:
      - Cuántos lo vieron
      - Progreso promedio
   2. Click "Ver Detalles" para ver progreso individual
   ```

### Como Voluntario

1. **Ver Videos**
   ```
   1. Ve a "Mis Proyectos"
   2. Selecciona un proyecto
   3. Scroll a "Materiales de Capacitación"
   4. Click en cualquier video para reproducir
   5. Se marca automáticamente como visto
   ```

## 🔐 Permisos

### Admin Master
- Ver todos los proyectos
- Crear/editar/eliminar materiales de cualquier proyecto
- Ver progreso de todos los voluntarios

### Admin
- Ver proyectos donde es encargado
- Crear/editar/eliminar materiales de sus proyectos
- Ver progreso de voluntarios de sus proyectos

### Voluntario
- Ver materiales publicados de sus proyectos
- Marcar materiales como vistos
- Ver su propio progreso

## 🐛 Debugging

Si un material no se crea:

1. **Verifica la consola del navegador**
   - Busca logs con emojis (💾, ➕, ✅, ❌)
   - Revisa qué datos se están enviando
   - Verifica la respuesta del servidor

2. **Checklist de datos**
   - ¿Título está completo?
   - ¿URL de YouTube es válida?
   - ¿projectId está presente?
   - ¿El proyecto está seleccionado?

3. **Verificar backend**
   - Endpoint: POST /make-server-f99e977c/training-materials
   - Debe devolver: `{ success: true, data: {...} }`
   - Error 500: Problema con KV store
   - Error 404: Servidor iniciando

## 📝 Notas Importantes

- ✅ Solo se soportan videos de YouTube
- ✅ Los materiales en "Borrador" NO son visibles para voluntarios
- ✅ Al eliminar un material, se elimina también el progreso asociado
- ✅ El marcado como "visto" es automático al cargar el video
- ✅ Los reintentos automáticos manejan problemas temporales del servidor
- ✅ Todos los mensajes están en español

## 🔄 Sistema de Reintentos

El hook `useApi` incluye reintentos automáticos:
- 3 intentos totales (1 inicial + 2 reintentos)
- Espera de 3 segundos entre intentos
- Solo reintenta errores del servidor (404, 503, etc.)
- Mensajes silenciosos durante reintentos

## 💡 Mejoras Futuras

1. Soporte para más plataformas (Vimeo, etc.)
2. Upload directo de videos
3. Progreso manual por parte del voluntario
4. Certificados al completar todos los videos
5. Orden personalizado de videos (drag & drop)
6. Comentarios en videos
7. Quiz después de cada video
