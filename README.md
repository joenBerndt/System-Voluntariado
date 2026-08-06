# Sistema de Voluntariado

Este es el repositorio del Sistema de Voluntariado, desarrollado con React, Vite y Supabase.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **Node.js** (versión recomendada 18+).
* Cuenta activa en **Supabase** (para la base de datos y backend).
* **Supabase CLI** (para el despliegue de Edge Functions).

---

## 🚀 Pasos para levantar el sistema

### 1. Instalación Local
Clona el repositorio e instala las dependencias del proyecto:
```bash
npm install
```

### 2. Configuración de Base de Datos en Supabase
Si es un proyecto nuevo de Supabase o se ha reseteado, necesitas crear las tablas.

1. Abre el panel de tu proyecto en Supabase y dirígete al **SQL Editor**.
2. Abre el archivo `init_database_full.sql` que se encuentra en la raíz de este proyecto. Este archivo contiene todas las tablas, parches, reglas de seguridad (RLS) y datos semilla.
3. Copia todo el contenido del archivo, pégalo en el editor de Supabase y ejecútalo.

### 3. Configuración de Variables de Entorno

El sistema necesita las llaves de conexión a Supabase. Debes configurar esto en dos lugares:

**A. Archivo `.env`**
Crea o modifica el archivo `.env` en la raíz del proyecto agregando la URL y tu llave de `service_role` (la encuentras en Supabase > Settings > API):
```env
SUPABASE_URL=https://[TU_PROYECTO_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...[TU_LLAVE_SERVICE_ROLE]
```

**B. Archivo de Frontend (`info.tsx`)**
Abre el archivo `src/utils/supabase/info.tsx` y asegúrate de que tiene tu `projectId` y tu llave pública `anon`:
```typescript
export const projectId = "[TU_PROYECTO_ID]"
export const publicAnonKey = "eyJhbGc...[TU_LLAVE_ANON_PUBLIC]"
```

### 4. Despliegue del Backend (Edge Functions)

El proyecto incluye funciones en el servidor que manejan lógica crítica y requieren acceso a la base de datos.
1. Inicia sesión en la consola de Supabase desde tu terminal:
```bash
npx supabase login
```
2. Asegúrate que en `package.json` el comando `"deploy"` tenga tu `project-ref` correcto.
3. Envía las variables de entorno de tu archivo `.env` para que el backend tenga acceso como administrador:
```bash
npx supabase secrets set SERVICE_ROLE_KEY="[TU_LLAVE_SERVICE_ROLE]" --project-ref [TU_PROYECTO_ID]
```
4. Despliega las funciones:
```bash
npm run deploy
```

### 5. Ejecutar la Aplicación
Una vez que la base de datos, las variables y las edge functions estén listas, arranca el frontend:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🔒 Consideraciones Adicionales
* **Seguridad (Git):** NUNCA hagas commit del archivo `.env` ni del archivo `src/utils/supabase/info.tsx` si tienen tus llaves reales. Agrega ambos a tu `.gitignore` para prevenir exponer tu base de datos públicamente.
* **Reseteo del Servidor:** Si agregas nuevas funcionalidades al backend (Edge Functions), recuerda siempre correr `npm run deploy` para que se apliquen en la nube.