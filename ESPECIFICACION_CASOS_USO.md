# Especificación Detallada de Casos de Uso

Este documento detalla los requisitos funcionales del sistema siguiendo la estructura estándar de ingeniería de software.

---

## 1. ACTOR: VISITANTE

### CU-01: Consultar Áreas de Investigación
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | El sistema deberá permitir a cualquier visitante visualizar el catálogo de áreas temáticas de la institución para conocer sus líneas de acción estratégica. |
| **Actor** | Visitante |
| **Flujo Básico** | 1. El Visitante navega a la sección "Áreas" desde el menú principal.<br>2. El Sistema consulta y muestra las áreas activas con su imagen e icono.<br>3. El Visitante hace clic en el botón "Proyectos" de una tarjeta de área.<br>4. El Sistema despliega una ventana modal con los proyectos asociados a dicha área. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Deben existir áreas registradas y marcadas como "Publicadas" por el Admin. |
| **Postcondiciones** | El visitante visualiza la información categorizada. |
| **Puntos de Extensión** | CU-03 (Explorar Catálogo de Proyectos). |
| **Req. Especiales** | Interfaz responsiva (Mobile/Desktop). |
| **Excepciones** | Si no hay áreas publicadas, mostrar mensaje "No se encontraron áreas". |

### CU-02: Consultar Convocatorias Vigentes
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir visualizar las oportunidades de voluntariado disponibles actualmente para inscripción. |
| **Actor** | Visitante |
| **Flujo Básico** | 1. El Visitante accede a la sección "Convocatorias" en la página de inicio.<br>2. El Sistema muestra un carrusel o lista de convocatorias con estado "Activa".<br>3. El Visitante revisa los detalles: título, vacantes, fechas y requisitos.<br>4. El Visitante selecciona "Ver más" o intenta postular. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Existencia de convocatorias dentro del rango de fechas válido. |
| **Postcondiciones** | N/A |
| **Puntos de Extensión** | CU-04 (Registrar Cuenta), CU-07 (Postular). |
| **Req. Especiales** | Mostrar contador de vacantes disponibles en tiempo real. |
| **Excepciones** | Si no hay convocatorias, mostrar indicador visual de "Sin convocatorias activas". |

### CU-03: Explorar Catálogo de Proyectos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Mostrar públicamente los proyectos que la institución está llevando a cabo, permitiendo ver sus objetivos y alcance. |
| **Actor** | Visitante |
| **Flujo Básico** | 1. El Visitante navega a la pestaña "Proyectos".<br>2. El Sistema lista los proyectos con estado "Publicado", permitiendo filtrar por Área o búsqueda de texto.<br>3. El Visitante solicita ver el detalle de un proyecto específico.<br>4. El Sistema presenta una vista ampliada con la descripción, objetivos y equipo responsable. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | **Filtrar Proyectos:** El usuario aplica un filtro por Área Temática y el sistema actualiza la lista. |
| **Precondiciones** | Proyectos creados y marcados como `published = true`. |
| **Postcondiciones** | N/A |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | Rendimiento óptimo en la carga de imágenes. |
| **Excepciones** | Lista vacía si no coinciden filtros. |

### CU-04: Registrar Cuenta de Usuario
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir a nuevas personas crear una cuenta de usuario para poder postular a las convocatorias. |
| **Actor** | Visitante |
| **Flujo Básico** | 1. El Visitante solicita "Iniciar Sesión" y selecciona la opción "¿No tienes cuenta? Regístrate".<br>2. El Sistema presenta el formulario de inscripción.<br>3. El Visitante ingresa Nombre, Correo y Contraseña.<br>4. El Sistema valida que el correo no exista previamente.<br>5. El Sistema crea la cuenta con el rol inicial de `user` (Candidato).<br>6. El Sistema inicia la sesión automáticamente. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | No tener una sesión activa. |
| **Postcondiciones** | Nuevo registro en la tabla `users`. |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | La contraseña debe ser almacenada de forma segura (hashing gestionado por Supabase Auth). |
| **Excepciones** | "El correo ya está registrado". |

### CU-05: Iniciar Sesión
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Autenticar a los usuarios registrados para permitirles el acceso a funciones privadas según su rol. |
| **Actor** | Visitante |
| **Flujo Básico** | 1. El Visitante ingresa correo y contraseña en el modal de Login.<br>2. El Sistema valida las credenciales contra el proveedor de identidad (Supabase).<br>3. El Sistema recupera el perfil del usuario para identificar su rol (`user`, `volunteer`, `admin`, `admin_master`).<br>4. El Sistema redirige al usuario a la vista correspondiente o actualiza la interfaz principal. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Usuario registrado previamente. |
| **Postcondiciones** | Token de sesión activo. |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | Registro del evento en `activity_logs` (Login Exitoso/Fallido). |
| **Excepciones** | Credenciales incorrectas: Mostrar mensaje de error. |

---

## 2. ACTOR: CANDIDATO (Usuario Autenticado)

### CU-06: Gestionar Perfil Personal
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir al usuario mantener actualizada su información personal básica. |
| **Actor** | Usuario Autenticado |
| **Flujo Básico** | 1. El Usuario accede a la sección "Perfil".<br>2. El Sistema muestra los datos actuales (Nombre, Teléfono, Bio).<br>3. El Usuario modifica los campos permitidos.<br>4. El Usuario confirma la actualización.<br>5. El Sistema guarda los cambios en la base de datos. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Sesión iniciada. |
| **Postcondiciones** | Información actualizada en tabla `users`. |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | N/A |
| **Excepciones** | Error de conexión al guardar. |

### CU-07: Postular a una Convocatoria
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir a los candidatos enviar su solicitud formal para participar en una convocatoria. |
| **Actor** | Candidato |
| **Flujo Básico** | 1. El Candidato selecciona "Postular Ahora" en una convocatoria activa.<br>2. El Sistema muestra el formulario de postulación (Carta de Motivación, Disponibilidad).<br>3. El Candidato completa los campos y confirma el envío.<br>4. El Sistema registra una nueva entrada en `applications` con estado `pending`.<br>5. El Sistema confirma el éxito de la operación. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Rol `user` y convocatoria `status='activa'`. |
| **Postcondiciones** | Registro creado en tabla `applications`. Vacante reservada (opcional según lógica de negocio). |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | Validar que el usuario no haya postulado previamente a la misma convocatoria. |
| **Excepciones** | "Ya has postulado a esta convocatoria". |

### CU-08: Consultar Estado de Postulaciones
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir al candidato conocer en qué etapa se encuentran sus solicitudes enviadas. |
| **Actor** | Candidato |
| **Flujo Básico** | 1. El Candidato accede a "Mis Postulaciones" o "Dashboard".<br>2. El Sistema lista las postulaciones históricas del usuario.<br>3. El Sistema muestra el estado actual mediante etiquetas visuales (Pendiente, Entrevista, Aceptado, Rechazado). |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Haber realizado al menos una postulación. |
| **Postcondiciones** | N/A |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | N/A |
| **Excepciones** | N/A |

---

## 3. ACTOR: VOLUNTARIO

### CU-09: Acceder a Mis Proyectos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Proveer un espacio de trabajo digital exclusivo para los voluntarios asignados a proyectos activos. |
| **Actor** | Voluntario |
| **Flujo Básico** | 1. El Voluntario ingresa a "Mi Intranet".<br>2. El Sistema identifica los proyectos donde el usuario tiene una asignación activa en `project_assignments`.<br>3. El Sistema presenta las tarjetas de acceso a dichos proyectos.<br>4. El Voluntario entra al detalle de un proyecto para ver recursos y capacitaciones. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Rol `volunteer` y registro en `project_assignments`. |
| **Postcondiciones** | Acceso a vista privada del proyecto. |
| **Puntos de Extensión** | CU-10 (Realizar Capacitación). |
| **Req. Especiales** | Seguridad: Verificar siempre que la asignación corresponda al usuario de la sesión. |
| **Excepciones** | Si el voluntario fue desasignado, el proyecto desaparece de su vista. |

### CU-10: Realizar Capacitación Virtual
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Facilitar materiales educativos y registrar el avance formativo del voluntario. |
| **Actor** | Voluntario |
| **Flujo Básico** | 1. Dentro de un Proyecto, el Voluntario navega a la pestaña "Capacitación".<br>2. El Sistema lista los videos asignados al proyecto.<br>3. El Voluntario reproduce un video.<br>4. El Voluntario marca el contenido como "Completado".<br>5. El Sistema actualiza el registro en `volunteer_progress`. |
| **Subflujos** | N/A |
| **Flujos Alternativos** | N/A |
| **Precondiciones** | Materiales cargados por un Admin. |
| **Postcondiciones** | Progreso actualizado (ej. 50% -> 75%). |
| **Puntos de Extensión** | N/A |
| **Req. Especiales** | N/A |
| **Excepciones** | N/A |

---

## 4. ACTOR: ADMIN JUNIOR (Gestor)

### CU-11: Publicar Nueva Convocatoria
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Permitir a los administradores crear y difundir nuevas vacantes de voluntariado. |
| **Actor** | Admin Junior |
| **Flujo Básico** | 1. El Admin accede a la sección "Convocatorias".<br>2. Selecciona "Nueva Convocatoria".<br>3. Define Título, Proyecto asociado, Fechas, Vacantes y Requisitos.<br>4. El Sistema valida los datos.<br>5. El Sistema guarda la convocatoria y la hace visible públicamente. |
| **Precondiciones** | Permisos de administración. El proyecto base debe existir. |
| **Excepciones** | Fechas inválidas (Fecha Fin anterior a Fecha Inicio). |

### CU-12: Evaluar y Seleccionar Candidatos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Gestionar el flujo de postulaciones: revisión, entrevista y aceptación. |
| **Actor** | Admin Junior |
| **Flujo Básico** | 1. El Admin revisa la lista de postulantes en estado `pending`.<br>2. Cambia el estado a `interview` para agendar cita.<br>3. Tras la entrevista, selecciona "Aceptar Candidato".<br>4. El Sistema actualiza la postulación a `accepted`.<br>5. El Sistema cambia automáticamente el rol del usuario a `volunteer` si es su primer proyecto. |
| **Flujos Alternativos** | **Rechazar:** El Admin marca la postulación como `rejected`. |
| **Req. Especiales** | Al aceptar, el sistema debe disparar automáticamente la creación de la asignación (`project_assignments`). |

### CU-13: Gestionar Recursos Educativos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Enriquecer los proyectos con contenido educativo digital (videos, guías). |
| **Actor** | Admin Junior |
| **Flujo Básico** | 1. El Admin selecciona un Proyecto.<br>2. Accede a "Materiales" y agrega un nuevo recurso (URL de video, Título).<br>3. El Sistema guarda el recurso en `training_materials`. |

---

## 5. ACTOR: ADMIN MASTER

### CU-15: Gestionar Usuarios y Roles
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Administración global de cuentas, incluyendo asignación de roles privilegiados. |
| **Actor** | Admin Master |
| **Flujo Básico** | 1. El Master busca un usuario en el directorio global.<br>2. Edita su perfil y modifica el campo `role` (ej. de `volunteer` a `admin`).<br>3. El Sistema actualiza los permisos inmediatamente. |
| **Req. Especiales** | Auditoría obligatoria de cambios de rol (CU-19). |
| **Excepciones** | No se permite degradar el rol del propio usuario Master activo (auto-bloqueo). |

### CU-19: Auditar Historial de Actividad
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Mantener un registro inmutable de acciones críticas. |
| **Actor** | Admin Master |
| **Flujo Básico** | 1. El Master accede al "Log de Actividad".<br>2. El Sistema consulta la tabla `activity_logs`.<br>3. Se visualiza: Quién, Qué hizo, Cuándo y Detalles técnicos. |
| **Req. Especiales** | El registro debe ser de solo lectura (inmutable). |

### CU-20: Administrar Cartera de Proyectos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Gestión del ciclo de vida completo de los proyectos institucionales. |
| **Actor** | Admin Master |
| **Flujo Básico** | 1. El Master crea un proyecto definiendo Nombre, Fechas, Presupuesto y Área.<br>2. El Sistema registra el proyecto.<br>3. Posteriormente, el Master puede marcar el proyecto como "Finalizado". |

### CU-21: Designar Responsables de Proyecto
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Delegar la gestión operativa de un proyecto a administradores específicos. |
| **Actor** | Admin Master |
| **Flujo Básico** | 1. En la edición de Proyecto, el Master selecciona usuarios con rol `admin`.<br>2. Los asigna como "Managers" del proyecto.<br>3. El Sistema actualiza el array `managers` del proyecto. |

### CU-22: Asignar Voluntarios a Equipos
| Campo | Descripción |
| :--- | :--- |
| **Descripción** | Facilitar la conformación de equipos asignando voluntarios manualmente. |
| **Actor** | Admin Master / Admin |
| **Flujo Básico** | 1. El Admin selecciona un proyecto y busca un usuario voluntario.<br>2. Confirma la asignación.<br>3. El Sistema crea el registro en `project_assignments` habilitando el acceso al voluntario. |
| **Req. Especiales** | Validar que el voluntario no esté ya asignado al mismo proyecto. |
