# 🧪 Guía de Prueba - Sistema de Materiales

## Pre-requisitos

Antes de probar, asegúrate de:
- ✅ Servidor backend corriendo
- ✅ Usuario con rol admin o admin_master
- ✅ Al menos un proyecto creado
- ✅ Consola del navegador abierta (F12)

## 📋 Plan de Prueba

### Prueba 1: Crear un Video

**Objetivo**: Verificar que se puede crear un nuevo material de video

**Pasos**:
1. Inicia sesión como admin/admin_master
2. Ve a "Asignaciones"
3. Selecciona un proyecto
4. Click en "Agregar Video"
5. Completa el formulario:
   - Título: "Video de Prueba 1"
   - Descripción: "Este es un video de prueba"
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Estado: Publicado
6. Click en "Crear Video"

**Resultado Esperado**:
```
✅ Alert: "Video creado exitosamente"
✅ Modal se cierra
✅ Video aparece en la lista
✅ Console logs:
   💾 Guardando material: {...}
   ➕ Creando nuevo material...
   📤 POST Request: /training-materials {...}
   📥 POST Response: { success: true, data: {...} }
   ✅ Material creado: {...}
```

**Si falla**:
- Busca en console: logs con ❌
- Verifica que projectId esté en el objeto
- Revisa la respuesta del servidor

---

### Prueba 2: Editar un Video

**Objetivo**: Verificar que se puede editar un material existente

**Pasos**:
1. En la lista de videos, click en el botón de editar (lápiz)
2. Cambia el título a: "Video de Prueba Editado"
3. Cambia el estado a "Borrador"
4. Click en "Actualizar Video"

**Resultado Esperado**:
```
✅ Alert: "Video actualizado exitosamente"
✅ Modal se cierra
✅ Cambios visibles en la lista
✅ Badge cambia a "○ Borrador"
✅ Console logs:
   💾 Guardando material: {...}
   📝 Actualizando material existente...
   ✅ Resultado actualización: {...}
```

---

### Prueba 3: Ver Estadísticas

**Objetivo**: Verificar que las estadísticas se muestran correctamente

**Pasos**:
1. Cambia el estado del video a "Publicado"
2. Observa la sección de estadísticas

**Resultado Esperado**:
```
✅ Se muestra: "X de Y vieron"
✅ Se muestra: "Z% Progreso promedio"
✅ Botón "Ver Detalles" disponible
```

---

### Prueba 4: Ver Progreso Detallado

**Objetivo**: Verificar el modal de progreso de voluntarios

**Pasos**:
1. Click en "Ver Detalles" en un video publicado
2. Observa la lista de voluntarios

**Resultado Esperado**:
```
✅ Modal se abre
✅ Lista de voluntarios del proyecto
✅ Para cada voluntario:
   - Nombre y email
   - Badge "✓ Visto" o "Sin ver"
   - Barra de progreso con porcentaje
```

---

### Prueba 5: Eliminar un Video

**Objetivo**: Verificar que se puede eliminar un material

**Pasos**:
1. Click en el botón de eliminar (papelera)
2. Confirma en el diálogo
3. Espera la respuesta

**Resultado Esperado**:
```
✅ Diálogo de confirmación aparece
✅ Alert: "Video eliminado exitosamente"
✅ Video desaparece de la lista
✅ Console logs:
   🗑️ Eliminando material: [id]
   ✅ (sin errores)
```

---

### Prueba 6: Voluntario Ve el Video

**Objetivo**: Verificar que voluntarios pueden ver materiales publicados

**Pasos**:
1. Cierra sesión del admin
2. Inicia sesión como voluntario
3. Ve a "Mis Proyectos"
4. Selecciona un proyecto con materiales
5. Scroll a "Materiales de Capacitación"
6. Observa el video

**Resultado Esperado**:
```
✅ Video se muestra con título y descripción
✅ Badge "▶ YouTube" visible
✅ Reproductor de YouTube cargado
✅ Al cargar, se marca como "visto" automáticamente
✅ Badge "✓ Completado" aparece
```

---

### Prueba 7: Estado Borrador

**Objetivo**: Verificar que borradores no son visibles para voluntarios

**Pasos**:
1. Como admin, cambia un video a "Borrador"
2. Cierra sesión
3. Inicia sesión como voluntario
4. Ve al proyecto

**Resultado Esperado**:
```
✅ Video en borrador NO aparece en la lista del voluntario
✅ Solo videos publicados son visibles
```

---

## 🔍 Checklist de Verificación

### Datos del Material
- [ ] `id` se genera automáticamente
- [ ] `title` se guarda correctamente
- [ ] `description` se guarda correctamente
- [ ] `url` se guarda correctamente
- [ ] `projectId` corresponde al proyecto seleccionado
- [ ] `published` se guarda como booleano
- [ ] `type` es siempre "youtube"
- [ ] `order` se inicializa en 0
- [ ] `createdAt` tiene timestamp válido

### Funcionalidad Admin
- [ ] Puede crear videos
- [ ] Puede editar videos
- [ ] Puede eliminar videos
- [ ] Puede cambiar estado publicado/borrador
- [ ] Ve estadísticas correctas
- [ ] Ve progreso de voluntarios
- [ ] Solo ve proyectos asignados (si es admin)
- [ ] Ve todos los proyectos (si es admin_master)

### Funcionalidad Voluntario
- [ ] Ve solo videos publicados
- [ ] Ve solo de proyectos asignados
- [ ] Video se reproduce correctamente
- [ ] Se marca como visto automáticamente
- [ ] Ve su progreso en dashboard
- [ ] No puede editar/eliminar

### UI/UX
- [ ] Colores verde esmeralda consistentes
- [ ] Gradientes aplicados correctamente
- [ ] Badges con colores apropiados
- [ ] Modales se abren/cierran correctamente
- [ ] Alerts son claros y en español
- [ ] Botones responden al hover
- [ ] Responsive en móvil

### Backend
- [ ] POST /training-materials funciona
- [ ] PUT /training-materials/:id funciona
- [ ] DELETE /training-materials/:id funciona
- [ ] GET /training-materials devuelve todos
- [ ] GET /material-progress devuelve todos
- [ ] POST /material-progress guarda visto

### Logging
- [ ] Logs con emojis en console
- [ ] Request/response logs visibles
- [ ] Errores se capturan y muestran
- [ ] Sin logs confusos o spam

## 🐛 Problemas Comunes

### "No se crea el material"

**Síntomas**: Click en "Crear Video" pero no pasa nada

**Posibles causas**:
1. `projectId` no se está enviando
   - Solución: Verificar que hay un proyecto seleccionado
   
2. Servidor no responde
   - Solución: Verificar que el servidor esté corriendo
   
3. Error de validación
   - Solución: Verificar que título y URL estén completos

**Debug**:
```javascript
// En console, antes de guardar:
console.log('Material data:', materialData);

// Debe mostrar:
{
  title: "...",
  description: "...",
  url: "https://youtube.com/...",
  projectId: "1234567890",  // ⚠️ IMPORTANTE
  published: true/false,
  type: "youtube",
  order: 0
}
```

---

### "Material se crea pero no aparece"

**Síntomas**: Alert de éxito pero lista no se actualiza

**Posibles causas**:
1. No se está refrescando la lista
   - Solución: Verificar que `refetchMaterials()` se llama
   
2. Filtro de proyecto incorrecto
   - Solución: Verificar que `projectId` coincide

**Debug**:
```javascript
// Verificar que refetch se llama:
setTimeout(() => {
  refetchMaterials();
}, 500);
```

---

### "Voluntario no ve el video"

**Síntomas**: Material publicado pero voluntario no lo ve

**Posibles causas**:
1. Material no está publicado
   - Solución: Cambiar a "Publicado"
   
2. Voluntario no está asignado al proyecto
   - Solución: Verificar project-assignments

**Debug**:
```javascript
// Verificar asignación:
console.log('My projects:', myProjects);
console.log('Project materials:', projectMaterials);
```

---

## 📊 Métricas de Éxito

Una prueba exitosa debe cumplir:
- ✅ 100% de las pruebas pasan
- ✅ 0 errores en console
- ✅ Todos los alerts son apropiados
- ✅ UI responde en < 1 segundo
- ✅ Videos se reproducen correctamente
- ✅ Progreso se guarda correctamente

## 🎯 Próximos Pasos

Después de completar estas pruebas:
1. Probar con múltiples proyectos
2. Probar con múltiples voluntarios
3. Probar con URLs de YouTube variadas
4. Probar casos edge (URLs inválidas, etc.)
5. Probar en diferentes navegadores
6. Probar en dispositivos móviles
