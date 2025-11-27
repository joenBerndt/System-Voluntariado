# 🔍 Verificación del Servidor Supabase

## Estado del Despliegue

El servidor Supabase se despliega automáticamente cuando se realizan cambios. Este proceso puede tardar **1-2 minutos**.

---

## ✅ Endpoints Implementados

### 1. **Health Check**
```
GET /make-server-f99e977c/health
```
**Propósito:** Verificar que el servidor esté activo  
**Respuesta esperada:** `{ "status": "ok" }`

---

### 2. **Training Materials**

#### Obtener todos los materiales
```
GET /make-server-f99e977c/training-materials
```

#### Crear material
```
POST /make-server-f99e977c/training-materials
Body: {
  "title": "Título del material",
  "description": "Descripción",
  "type": "pdf|youtube|image|link|document|video",
  "url": "https://...",
  "projectId": "id-del-proyecto",
  "published": true|false,
  "order": 0
}
```

#### Actualizar material
```
PUT /make-server-f99e977c/training-materials/:id
Body: { campos a actualizar }
```

#### Eliminar material
```
DELETE /make-server-f99e977c/training-materials/:id
```

---

### 3. **Material Progress (NUEVO)**

#### Obtener todo el progreso
```
GET /make-server-f99e977c/material-progress
```

#### Obtener progreso de un voluntario
```
GET /make-server-f99e977c/material-progress/volunteer/:volunteerId
```

#### Crear/Actualizar progreso
```
POST /make-server-f99e977c/material-progress
Body: {
  "materialId": "id-del-material",
  "userId": "id-del-usuario",
  "volunteerId": "id-del-voluntario",  // opcional, usa userId si no está
  "viewed": true|false,
  "progress": 0-100,
  "viewedAt": "ISO timestamp",
  "completedAt": "ISO timestamp"
}
```

#### Actualizar progreso por ID
```
PUT /make-server-f99e977c/material-progress/:id
Body: { campos a actualizar }
```
**Nota:** El ID debe estar en formato `userId-materialId`

#### Actualizar progreso por voluntario y material
```
PUT /make-server-f99e977c/material-progress/:volunteerId/:materialId
Body: { campos a actualizar }
```

---

## 🔧 Solución de Problemas

### Error 404: Endpoint not found

**Causa:** El servidor aún se está desplegando

**Solución:**
1. Espera 1-2 minutos
2. El componente `ServerStatus` mostrará un mensaje en la esquina inferior derecha
3. Puedes hacer click en el botón de refresh para verificar manualmente
4. Cuando el servidor esté listo, el mensaje desaparecerá automáticamente

---

### Error: Non-JSON response

**Causa:** El servidor devolvió una respuesta HTML (probablemente un error de Supabase)

**Solución:**
1. Verifica que el proyecto de Supabase esté activo
2. Revisa los logs en: https://supabase.com/dashboard/project/spodtzalxletrigrevtk/logs
3. El servidor se redesplega automáticamente, espera unos minutos

---

### Material no se marca como visto

**Verificar:**
1. ✅ El servidor está respondiendo (sin error 404)
2. ✅ El usuario tiene un ID válido (`currentUser?.id`)
3. ✅ El material tiene un ID válido
4. ✅ El navegador tiene consola abierta para ver logs

**Debug:**
- Abre la consola del navegador (F12)
- Ve a la pestaña "Console"
- Busca mensajes que empiecen con "Error marking material as viewed"
- Si ves "404", espera a que el servidor se despliegue

---

## 📊 Cómo Verificar Manualmente

### Usando el navegador:

1. **Abrir DevTools:** Presiona F12
2. **Ir a Network:** Pestaña "Network" / "Red"
3. **Realizar una acción:** Por ejemplo, marcar un material como visto
4. **Ver la petición:** Busca la llamada a `/material-progress`
5. **Verificar respuesta:**
   - ✅ Status 200: Todo bien
   - ❌ Status 404: Servidor no desplegado
   - ❌ Status 500: Error en el servidor

---

## 🚀 Estado Esperado

Cuando todo funcione correctamente:

1. ✅ No aparece mensaje de "Servidor desplegándose"
2. ✅ Los materiales se cargan sin errores en consola
3. ✅ Al hacer click en enlaces, se marcan como vistos automáticamente
4. ✅ El porcentaje de progreso se actualiza inmediatamente
5. ✅ El dashboard muestra las estadísticas correctamente

---

## 📞 Información Técnica

**Proyecto ID:** `spodtzalxletrigrevtk`  
**Base URL:** `https://spodtzalxletrigrevtk.supabase.co/functions/v1/make-server-f99e977c`  
**Región:** us-east-1  
**KV Storage:** Supabase Database

---

## ⏱️ Tiempos Esperados

- **Primer despliegue:** 2-3 minutos
- **Redespliegues:** 1-2 minutos
- **Health check:** 500ms - 2s
- **API calls:** 200ms - 1s

---

**Última actualización:** Noviembre 2024  
**Versión del servidor:** 2.0 (con Material Progress)
