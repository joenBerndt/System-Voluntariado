# Especificación Técnica Completa de los 24 Casos de Uso

---

## 1. ACTOR: VISITANTE

### CU-01: Consultar Áreas de Investigación
* **Descripción:** El sistema deberá permitir al Visitante visualizar el catálogo de áreas temáticas de la institución para conocer las líneas de acción estratégica y organización temática.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante accede a la sección de Áreas.
  2. El Sistema consulta las áreas publicadas en la base de datos.
  3. El Sistema muestra un listado visual con nombre e icono de cada área.
  4. El Visitante selecciona un área para ver más detalles.
  5. El Sistema despliega la descripción completa del área.
* **Subflujos:**
  1. **Ver Área en Modo Detallado:** Si el Visitante hace clic en "Ver Más", el Sistema abre una vista expandida con fotos, proyectos asociados y documentos descargables.
* **Flujos Alternativos:**
  1. **Área sin Imagen:** Si el registro no tiene imagen, el Sistema muestra un placeholder genérico.
* **Precondiciones:** Existencia de registros en la tabla `areas` con estado `published`.
* **Postcondiciones:** El visitante obtiene la información solicitada.
* **Puntos de Extensión:**
  - **CU-03 (Explorar Catálogo de Proyectos):** Desde la vista de detalle del área, el Visitante puede acceder a los proyectos vinculados.
  - **CU-24 (Consultar Información Institucional):** El Visitante puede consultar la misión/visión de la institución antes de explorar áreas.
* **Requerimientos Especiales:** RF-02 (Interfaz adaptable a móviles).
* **Excepciones:** Si no hay áreas, el sistema muestra el mensaje "No se encontraron áreas de investigación".

### CU-02: Consultar Convocatorias Vigentes
* **Descripción:** El sistema deberá permitir al Visitante consultar las convocatorias activas para identificar oportunidades de voluntariado disponibles a las cuales pueda postular.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante navega a la sección de Convocatorias.
  2. El Sistema filtra las convocatorias activas cuya fecha de cierre sea futura.
  3. El Sistema presenta las tarjetas de convocatoria con título, vacantes y fechas.
  4. El Visitante selecciona una convocatoria.
  5. El Sistema muestra los requisitos detallados.
* **Subflujos:**
  1. **Ver Detalle de Convocatoria:** Al pulsar "Ver Detalle", el Sistema muestra una página con descripción completa, requisitos, y botón "Postular".
* **Flujos Alternativos:**
  1. **Convocatoria Sin Vacantes:** Si `vacantes = 0`, el Sistema muestra "Convocatoria completa" y desactiva el botón de postulación.
* **Precondiciones:** Existencia de convocatorias con estado `activa`.
* **Postcondiciones:** Ninguna.
* **Puntos de Extensión:**
  - **CU-07 (Postular a una Convocatoria):** Desde el detalle, el Visitante puede iniciar la postulación.
  - **CU-08 (Consultar Estado de Postulaciones):** Tras postular, el Visitante puede seguir el estado.
* **Requerimientos Especiales:** Mostrar contador de cupos disponibles en tiempo real.
* **Excepciones:** Si no hay ofertas, mostrar "No hay convocatorias vigentes por el momento".

### CU-03: Explorar Catálogo de Proyectos
* **Descripción:** El sistema deberá permitir al Visitante explorar el catálogo de proyectos públicos para informarse sobre las iniciativas institucionales en curso, sus objetivos y su impacto.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante ingresa al menú de Proyectos.
  2. El Sistema lista todos los proyectos marcados como públicos.
  3. El Visitante utiliza el buscador o filtros por área.
  4. El Sistema actualiza la lista según los criterios.
  5. El Visitante abre la ficha de un proyecto.
* **Subflujos:**
  1. **Filtrar por Estado:** El Visitante puede filtrar por proyectos "En ejecución", "Finalizados" o "Planificados".
* **Flujos Alternativos:**
  1. **Sin Resultados de Búsqueda:** Si la búsqueda no devuelve resultados, el Sistema muestra "No se encontraron proyectos con los filtros seleccionados".
* **Precondiciones:** Proyectos registrados y publicados.
* **Postcondiciones:** Ninguna.
* **Puntos de Extensión:**
  - **CU-09 (Acceder a Mis Proyectos):** Si el Visitante se registra y se convierte en Voluntario, puede acceder a la intranet del proyecto.
  - **CU-10 (Realizar Capacitación Virtual):** Desde la ficha del proyecto, el Voluntario puede iniciar la capacitación.
* **Requerimientos Especiales:** Carga eficiente de imágenes (Lazy Loading).
* **Excepciones:** "No se encontraron proyectos con los filtros seleccionados".

### CU-04: Registrar Cuenta de Usuario
* **Descripción:** El sistema deberá permitir al Visitante registrar una nueva cuenta de usuario personal para obtener credenciales de acceso y poder postular a las convocatorias.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante selecciona la opción de Registro.
  2. El Sistema muestra el formulario de datos básicos.
  3. El Visitante ingresa Nombre, Correo y Contraseña.
  4. El Sistema valida que el correo sea único y el formato correcto.
  5. El Sistema crea el registro del usuario y su perfil.
  6. El Sistema inicia la sesión automáticamente.
* **Subflujos:**
  1. **Validación de Contraseña:** Si la contraseña no cumple con la política (mínimo 6 caracteres, al menos un número), el Sistema muestra mensaje de error y solicita corrección.
* **Flujos Alternativos:**
  1. **Correo ya Registrado:** El Sistema muestra "El correo electrónico ya se encuentra registrado" y permite intentar con otro correo.
* **Precondiciones:** El usuario no debe tener sesión activa.
* **Postcondiciones:** Nuevo registro en tabla `users` con rol `user`.
* **Puntos de Extensión:**
  - **CU-05 (Iniciar Sesión):** Después del registro, el usuario puede iniciar sesión.
  - **CU-06 (Gestionar Perfil Personal):** El nuevo usuario puede editar su perfil.
* **Requerimientos Especiales:** RF-01 (Encriptación de contraseñas), RF-02 (Redirección a sección principal).
* **Excepciones:** "El correo electrónico ya se encuentra registrado".

### CU-05: Iniciar Sesión
* **Descripción:** El sistema deberá permitir al Usuario Registrado autenticarse mediante sus credenciales para acceder a las funcionalidades privadas correspondientes a su rol.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante ingresa sus credenciales (Correo y Contraseña).
  2. El Sistema verifica la validez de las credenciales.
  3. El Sistema genera un token de sesión seguro.
  4. El Sistema consulta el rol del usuario.
  5. El Sistema redirige al panel correspondiente al rol.
* **Subflujos:**
  1. **Recuperación de Contraseña:** Si el usuario hace clic en "¿Olvidó su contraseña?", el Sistema envía un email con enlace de restablecimiento.
* **Flujos Alternativos:**
  1. **Credenciales Incorrectas:** El Sistema muestra "Credenciales incorrectas, por favor intente nuevamente".
* **Precondiciones:** Usuario registrado previamente.
* **Postcondiciones:** Sesión activa en el navegador.
* **Puntos de Extensión:**
  - **CU-09 (Acceder a Mis Proyectos):** Una vez autenticado como Voluntario, el usuario accede a su intranet.
  - **CU-07 (Postular a una Convocatoria):** Un usuario autenticado puede postular.
* **Requerimientos Especiales:** RF-10 (Registro de log de acceso).
* **Excepciones:** "Credenciales incorrectas, por favor intente nuevamente".

---

## 2. ACTOR: CANDIDATO

### CU-06: Gestionar Perfil Personal
* **Descripción:** El sistema deberá permitir al Candidato gestionar su información personal para mantener actualizados sus datos de contacto y perfil ante la institución.
* **Actor:** Candidato.
* **Flujo Básico:**
  1. El Candidato accede a su perfil.
  2. El Sistema carga los datos actuales.
  3. El Candidato edita campos permitidos (Teléfono, Bio, Foto).
  4. El Candidato guarda los cambios.
  5. El Sistema valida y actualiza la base de datos.
* **Subflujos:**
  1. **Cambio de Foto:** Si el Candidato sube una nueva foto, el Sistema verifica formato (JPG/PNG) y tamaño (<2 MB) antes de guardarla.
* **Flujos Alternativos:**
  1. **Cancelación:** El Candidato presiona "Cancelar" y se descartan los cambios.
* **Precondiciones:** Usuario autenticado.
* **Postcondiciones:** Datos de usuario actualizados.
* **Puntos de Extensión:**
  - **CU-07 (Postular a una Convocatoria):** El perfil actualizado se utiliza al postular.
  - **CU-08 (Consultar Estado de Postulaciones):** El candidato puede ver el estado de sus postulaciones.
* **Requerimientos Especiales:** RF-06 (Validación de tipos de datos), RF-07 (Perfil activo).
* **Excepciones:** Error de servidor al intentar guardar.

### CU-07: Postular a una Convocatoria
* **Descripción:** El sistema deberá permitir al Candidato enviar una solicitud formal a una convocatoria activa para participar en el proceso de selección de voluntarios.
* **Actor:** Candidato.
* **Flujo Básico:**
  1. El Candidato en una convocatoria activa presiona "Postular".
  2. El Sistema solicita confirmación y carta de motivación opcional.
  3. El Candidato confirma el envío.
  4. El Sistema verifica que no exista postulación previa.
  5. El Sistema registra la postulación en estado `pending`.
* **Subflujos:**
  1. **Adjuntar Documentos:** El Candidato puede adjuntar CV o certificaciones; el Sistema valida tipo y tamaño.
* **Flujos Alternativos:**
  1. **Postulación Duplicada:** Si ya existe una postulación, el Sistema muestra "Ya tienes una postulación activa para esta convocatoria".
  2. **Convocatoria Cerrada:** Si la fecha límite pasó, el Sistema muestra "Lo sentimos, la convocatoria está cerrada".
* **Precondiciones:** Rol de Candidato y convocatoria abierta.
* **Postcondiciones:** Registro creado en tabla `applications`.
* **Puntos de Extensión:**
  - **CU-08 (Consultar Estado de Postulaciones):** El candidato puede seguir el proceso.
  - **CU-12 (Evaluar y Seleccionar Candidatos):** El administrador junior procesa la postulación.
* **Requerimientos Especiales:** RF-03 (Unicidad de postulación), RF-07 (Perfil activo).
* **Excepciones:** "Ya tienes una postulación activa para esta convocatoria".

### CU-08: Consultar Estado de Postulaciones
* **Descripción:** El sistema deberá permitir al Candidato consultar el historial y estado de sus postulaciones enviadas para realizar el seguimiento de sus procesos de selección.
* **Actor:** Candidato.
* **Flujo Básico:**
  1. El Candidato ingresa a "Mis Postulaciones".
  2. El Sistema recupera el historial del usuario.
  3. El Sistema muestra lista con estado (Pendiente, Entrevista, Aceptado, Rechazado).
* **Subflujos:**
  1. **Ver Detalle de Postulación:** Al hacer clic en una postulación, el Sistema muestra fecha de envío, documentos adjuntos y comentarios del evaluador.
* **Flujos Alternativos:**
  1. **Sin Postulaciones:** Si el historial está vacío, el Sistema muestra "No tienes postulaciones registradas".
* **Precondiciones:** Haber realizado al menos una postulación.
* **Postcondiciones:** Ninguna.
* **Puntos de Extensión:**
  - **CU-12 (Evaluar y Seleccionar Candidatos):** El administrador utiliza la información para decidir.
* **Requerimientos Especiales:** RF-07 (Perfil activo).
* **Excepciones:** Mostrar mensaje "No tienes postulaciones registradas".

---

## 3. ACTOR: VOLUNTARIO

### CU-09: Acceder a Mis Proyectos
* **Descripción:** El sistema deberá permitir al Voluntario acceder a la intranet de sus proyectos asignados para visualizar información confidencial, materiales y datos del equipo.
* **Actor:** Voluntario.
* **Flujo Básico:**
  1. El Voluntario accede a su Intranet.
  2. El Sistema busca asignaciones activas en `project_assignments`.
  3. El Sistema muestra únicamente los proyectos vinculados.
  4. El Voluntario ingresa al detalle privado de un proyecto.
* **Subflujos:**
  1. **Cambiar de Proyecto:** El Voluntario puede cambiar de proyecto mediante un selector de proyecto en la barra lateral.
* **Flujos Alternativos:**
  1. **Sin Asignaciones:** Si no existen asignaciones, el Sistema muestra "No tienes proyectos asignados".
* **Precondiciones:** Tener rol `volunteer` y asignación activa.
* **Postcondiciones:** Acceso a materiales y datos del proyecto.
* **Puntos de Extensión:**
  - **CU-10 (Realizar Capacitación Virtual):** Desde la intranet, el Voluntario accede a la capacitación.
  - **CU-22 (Asignar Voluntarios a Equipos):** Un administrador puede asignar nuevos proyectos que aparecerán aquí.
* **Requerimientos Especiales:** RF-07 (Control de acceso estricto), RF-08 (Seguimiento de progreso).
* **Excepciones:** Si la asignación es eliminada, el acceso se revoca inmediatamente.

### CU-10: Realizar Capacitación Virtual
* **Descripción:** El sistema deberá permitir al Voluntario consumir materiales educativos y registrar su progreso para cumplir con los requisitos formativos del proyecto asignado.
* **Actor:** Voluntario.
* **Flujo Básico:**
  1. El Voluntario selecciona la pestaña "Capacitación".
  2. El Sistema lista los videos del proyecto.
  3. El Voluntario reproduce un video.
  4. El Voluntario marca el contenido como "Visto".
  5. El Sistema guarda el progreso en `volunteer_progress`.
* **Subflujos:**
  1. **Repetir Video:** El Voluntario puede volver a reproducir el video; el Sistema no vuelve a contarlo como nuevo progreso.
* **Flujos Alternativos:**
  1. **Error de Carga:** Si el video no se carga, el Sistema muestra "Error al cargar el recurso multimedia" y permite reintentar.
* **Precondiciones:** Existencia de materiales cargados.
* **Postcondiciones:** Indicador de % completado actualizado.
* **Puntos de Extensión:**
  - **CU-13 (Gestionar Recursos Educativos):** Los administradores pueden añadir o actualizar los materiales que el Voluntario consume.
  - **CU-18 (Generar Reportes de Gestión):** El progreso de capacitación se incluye en los reportes.
* **Requerimientos Especiales:** RF-04 (Seguimiento educativo), RF-07 (Perfil activo).
* **Excepciones:** Error al cargar el recurso multimedia.

---

## 4. ACTOR: ADMIN JUNIOR

### CU-11: Publicar Nueva Convocatoria
* **Descripción:** El sistema deberá permitir al Administrador Junior crear y publicar nuevas convocatorias para difundir las oportunidades de voluntariado y captar talento.
* **Actor:** Admin Junior.
* **Flujo Básico:**
  1. El Admin selecciona "Nueva Convocatoria".
  2. El Admin selecciona el proyecto base y completa detalles (fechas, vacantes).
  3. El Admin guarda la convocatoria.
  4. El Sistema valida coherencia de datos.
  5. El Sistema publica la oferta en el portal.
* **Subflujos:**
  1. **Guardar como Borrador:** El Admin puede guardar la convocatoria sin publicar; el Sistema la marca como `draft` y no la muestra al público.
* **Flujos Alternativos:**
  1. **Fechas Inválidas:** Si la fecha de fin es anterior a la de inicio, el Sistema muestra "La fecha de fin debe ser posterior a la de inicio" y no guarda.
  2. **Vacantes = 0:** El Sistema muestra advertencia "Debe definir al menos una vacante".
* **Precondiciones:** Permisos de administración sobre el proyecto.
* **Postcondiciones:** Convocatoria visible públicamente (o guardada como borrador).
* **Puntos de Extensión:**
  - **CU-07 (Postular a una Convocatoria):** Los candidatos pueden postular a la convocatoria recién creada.
  - **CU-18 (Generar Reportes de Gestión):** La convocatoria aparece en los reportes de actividad.
* **Requerimientos Especiales:** RF-02.
* **Excepciones:** "La fecha de fin debe ser posterior a la de inicio".

### CU-12: Evaluar y Seleccionar Candidatos
* **Descripción:** El sistema deberá permitir al Administrador Junior gestionar las postulaciones (evaluar, entrevistar y aceptar) para seleccionar a los candidatos idóneos para el proyecto.
* **Actor:** Admin Junior.
* **Flujo Básico:**
  1. El Admin lista postulantes pendientes.
  2. El Admin agenda entrevista (cambia estado a `interview`).
  3. Tras entrevista, Admin acepta al candidato (estado `accepted`).
  4. El Sistema convierte automáticamente el rol del usuario a Voluntario.
  5. El Sistema crea la asignación al proyecto.
* **Subflujos:**
  1. **Rechazar Candidato:** El Admin cambia el estado a `rejected` y puede añadir comentario de retroalimentación.
* **Flujos Alternativos:**
  1. **Vacantes Llenas:** Si el número de voluntarios aceptados alcanza el límite de vacantes, el Sistema muestra "No se puede aceptar más candidatos, vacantes llenas" y bloquea la aceptación.
* **Precondiciones:** Existencia de postulaciones.
* **Postcondiciones:** Nuevo voluntario asignado al equipo.
* **Puntos de Extensión:**
  - **CU-13 (Gestionar Recursos Educativos):** Una vez aceptado, el nuevo voluntario podrá acceder a los recursos educativos.
  - **CU-09 (Acceder a Mis Proyectos):** El nuevo voluntario podrá entrar a la intranet del proyecto.
* **Requerimientos Especiales:** RF-11 (Automatización de flujo), RF-08 (Seguimiento de progreso).
* **Excepciones:** "No se puede aceptar más candidatos, vacantes llenas".

### CU-13: Gestionar Recursos Educativos
* **Descripción:** El sistema deberá permitir al Administrador Junior agregar y gestionar video‑recursos educativos en un proyecto para facilitar la capacitación de los voluntarios.
* **Actor:** Admin Junior.
* **Flujo Básico:**
  1. El Admin entra a la gestión del proyecto.
  2. El Admin selecciona "Añadir Material".
  3. El Admin ingresa título y URL del recurso.
  4. El Sistema guarda el registro en `training_materials`.
* **Subflujos:**
  1. **Editar Material:** El Admin puede modificar título o URL de un recurso existente.
  2. **Eliminar Material:** El Admin puede borrar un recurso; el Sistema solicita confirmación.
* **Flujos Alternativos:**
  1. **URL Inválida:** Si la URL no es válida, el Sistema muestra "URL inválida" y no guarda.
* **Precondiciones:** Ser manager del proyecto.
* **Postcondiciones:** Material disponible en la Intranet del proyecto.
* **Puntos de Extensión:**
  - **CU-10 (Realizar Capacitación Virtual):** Los voluntarios consumen los materiales creados aquí.
  - **CU-18 (Generar Reportes de Gestión):** Los recursos creados se contabilizan en los reportes.
* **Requerimientos Especiales:** RF-04 (Seguimiento educativo).
* **Excepciones:** "URL inválida".

### CU-14: Supervisar Proyectos Asignados
* **Descripción:** El sistema deberá permitir al Administrador Junior visualizar y gestionar únicamente los proyectos bajo su responsabilidad operativa para mantener el control de sus asignaciones.
* **Actor:** Admin Junior.
* **Flujo Básico:**
  1. El Admin accede al Panel de Gestión.
  2. El Sistema filtra la lista de proyectos donde `manager_id` es el usuario actual.
  3. El Admin selecciona uno para operar.
* **Subflujos:**
  1. **Cambiar Estado del Proyecto:** El Admin puede marcar el proyecto como "En ejecución", "Finalizado" o "Archivado".
* **Flujos Alternativos:**
  1. **Sin Proyectos Asignados:** Si la lista está vacía, el Sistema muestra "No tiene proyectos asignados".
* **Precondiciones:** Haber sido designado como responsable.
* **Postcondiciones:** Ninguna.
* **Puntos de Extensión:**
  - **CU-18 (Generar Reportes de Gestión):** El estado de los proyectos supervisados se incluye en los reportes.
* **Requerimientos Especiales:** RF-08 (Segregación de datos).
* **Excepciones:** "No tiene proyectos asignados".

---

## 5. ACTOR: ADMIN MASTER

### CU-15: Gestionar Usuarios y Roles
* **Descripción:** El sistema deberá permitir al Administrador Master gestionar las cuentas de usuario y asignar roles privilegiados para controlar los niveles de acceso al sistema.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master busca un usuario en el directorio.
  2. El Master modifica el rol (ej. promover a Admin).
  3. El Sistema pide confirmación.
  4. El Sistema actualiza los permisos.
* **Subflujos:**
  1. **Bloquear/Desbloquear Usuario:** El Master puede cambiar el estado `is_active` del usuario.
* **Flujos Alternativos:**
  1. **Intento de Auto‑baja:** Si el Master intenta degradar su propio rol, el Sistema muestra "Operación no permitida".
* **Precondiciones:** Rol de Super Administrador.
* **Postcondiciones:** Permisos de usuario actualizados.
* **Puntos de Extensión:**
  - **CU-16 (Administrar Catálogo de Áreas):** Los cambios de rol pueden habilitar permisos para crear/editar áreas.
  - **CU-19 (Auditar Historial de Actividad):** Cada cambio queda registrado en el log.
* **Requerimientos Especiales:** RF-10 (Registro de log de acceso).
* **Excepciones:** Intento de modificar su propio rol (bloqueado por seguridad).

### CU-16: Administrar Catálogo de Áreas
* **Descripción:** El sistema deberá permitir al Administrador Master crear, modificar o eliminar áreas temáticas para mantener actualizada la estructura organizacional de proyectos.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master ingresa datos de nueva Área.
  2. El Master guarda el registro.
  3. El Sistema actualiza el catálogo disponible.
* **Subflujos:**
  1. **Editar Área Existente:** El Master modifica nombre o descripción.
  2. **Eliminar Área:** El Master solicita confirmación; el Sistema verifica que no existan proyectos asociados.
* **Flujos Alternativos:**
  1. **Área con Dependencias:** Si existen proyectos vinculados, el Sistema muestra "No se puede eliminar un área con proyectos activos".
* **Precondiciones:** Ninguna.
* **Postcondiciones:** Catálogo actualizado.
* **Puntos de Extensión:**
  - **CU-01 (Consultar Áreas de Investigación):** Los visitantes consumen el catálogo actualizado.
* **Requerimientos Especiales:** Ninguno.
* **Excepciones:** "No se puede eliminar un área con proyectos activos".

### CU-17: Actualizar Información Institucional
* **Descripción:** El sistema deberá permitir al Administrador Master editar la información institucional (Misión, Visión, Valores) para asegurar que el contenido público sea veraz y actual.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master edita los campos de texto institucional.
  2. El Master guarda los cambios.
  3. El Sistema actualiza la página "Nosotros" pública.
* **Subflujos:**
  1. **Vista Previa:** Antes de guardar, el Master puede previsualizar el contenido.
* **Flujos Alternativos:**
  1. **Error de Validación:** Si el texto supera el límite de caracteres, el Sistema muestra mensaje de error.
* **Precondiciones:** Ninguna.
* **Postcondiciones:** Información pública actualizada.
* **Puntos de Extensión:**
  - **CU-24 (Consultar Información Institucional):** Los visitantes ven la información actualizada.
* **Requerimientos Especiales:** RF-05 (CMS Básico).
* **Excepciones:** Ninguna.

### CU-18: Generar Reportes de Gestión
* **Descripción:** El sistema deberá permitir al Administrador Master generar y descargar reportes estadísticos consolidados para analizar el desempeño y métricas del programa.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master selecciona el tipo de reporte (Voluntarios, Proyectos).
  2. El Sistema procesa las estadísticas.
  3. El Sistema genera un archivo PDF/Excel.
  4. El Master descarga el archivo.
* **Subflujos:**
  1. **Filtrar por Rango de Fechas:** El Master puede especificar periodo para el reporte.
* **Flujos Alternativos:**
  1. **Sin Datos:** Si no existen datos en el rango, el Sistema muestra "Sin datos para el reporte".
* **Precondiciones:** Existencia de datos históricos.
* **Postcondiciones:** Archivo descargado en local.
* **Puntos de Extensión:**
  - **CU-11, CU-12, CU-13, CU-14:** Los datos de estas funcionalidades aparecen en los reportes.
* **Requerimientos Especiales:** RF-09.
* **Excepciones:** Error de generación "Sin datos para el reporte".

### CU-19: Auditar Historial de Actividad
* **Descripción:** El sistema deberá permitir al Administrador Master consultar el registro de auditoría para monitorear la seguridad y trazabilidad de las acciones críticas realizadas.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master accede al "Log de Actividad".
  2. El Sistema consulta la tabla de auditoría.
  3. El Sistema muestra cronológicamente (Quién, Qué, Cuándo).
* **Subflujos:**
  1. **Exportar Log:** El Master puede exportar el log a CSV.
* **Flujos Alternativos:**
  1. **Filtro sin Resultados:** Si el filtro no devuelve registros, el Sistema muestra "No hay actividades en el rango seleccionado".
* **Precondiciones:** Ninguna (el log se llena automáticamente).
* **Postcondiciones:** Ninguna.
* **Puntos de Extensión:**
  - **CU-15, CU-16, CU-17:** Todas las acciones de gestión quedan auditadas.
* **Requerimientos Especiales:** RF-10 (Solo lectura).
* **Excepciones:** Ninguna.

### CU-20: Administrar Cartera de Proyectos
* **Descripción:** El sistema deberá permitir al Administrador Master gestionar el ciclo de vida completo de los proyectos (Creación, Edición, Cierre) para controlar la cartera institucional.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master crea un nuevo proyecto con datos base.
  2. El Sistema registra el proyecto en estado "Borrador" o "Publicado".
  3. Posteriormente, el Master puede cerrar o finalizar el proyecto.
* **Subflujos:**
  1. **Editar Proyecto:** El Master puede modificar nombre, presupuesto, fechas.
  2. **Archivar Proyecto:** Cambiar estado a "Archivado" para ocultarlo de la vista pública.
* **Flujos Alternativos:**
  1. **Intento de Cierre con Tareas Pendientes:** Si existen tareas sin cerrar, el Sistema muestra "No se puede cerrar el proyecto mientras existan tareas activas".
* **Precondiciones:** Ninguna.
* **Postcondiciones:** Proyecto creado en BD (y/o actualizado).
* **Puntos de Extensión:**
  - **CU-21 (Designar Responsables):** Tras crear el proyecto, el Master asigna responsables.
  - **CU-22 (Asignar Voluntarios a Equipos):** Después de crear el proyecto, se pueden asignar voluntarios.
  - **CU-23 (Depurar Datos del Sistema):** Los proyectos obsoletos pueden ser eliminados.
* **Requerimientos Especiales:** Ninguno.
* **Excepciones:** Ninguna.

### CU-21: Designar Responsables de Proyecto
* **Descripción:** El sistema deberá permitir al Administrador Master asignar a los Administradores Junior responsables de cada proyecto para delegar la gestión operativa.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. En la edición de un proyecto, el Master busca usuarios Admin.
  2. El Master selecciona los encargados.
  3. El Sistema guarda la relación en el campo `managers`.
* **Subflujos:**
  1. **Remover Responsable:** El Master puede desasignar un manager existente.
* **Flujos Alternativos:**
  1. **Sin Admin Disponibles:** Si no hay usuarios con rol Admin, el Sistema muestra "No existen administradores disponibles para asignar".
* **Precondiciones:** Usuarios destino deben tener rol Admin.
* **Postcondiciones:** Permisos delegados.
* **Puntos de Extensión:**
  - **CU-14 (Supervisar Proyectos Asignados):** Los responsables pueden supervisar sus proyectos.
* **Requerimientos Especiales:** Ninguno.
* **Excepciones:** Ninguna.

### CU-22: Asignar Voluntarios a Equipos
* **Descripción:** El sistema deberá permitir al Administrador Master asignar manualmente voluntarios a proyectos específicos para conformar los equipos de trabajo de manera directa.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master selecciona un proyecto.
  2. El Master busca un voluntario por nombre.
  3. El Master confirma la asignación.
  4. El Sistema crea registro en `project_assignments`.
* **Subflujos:**
  1. **Asignar Múltiples Voluntarios:** El Master puede seleccionar varios voluntarios y asignarlos en lote.
* **Flujos Alternativos:**
  1. **Voluntario Ya Asignado:** Si el voluntario ya pertenece al proyecto, el Sistema muestra "El voluntario ya pertenece a este equipo".
* **Precondiciones:** Usuario debe ser Voluntario.
* **Postcondiciones:** Voluntario obtiene acceso al proyecto.
* **Puntos de Extensión:**
  - **CU-09 (Acceder a Mis Proyectos):** Los voluntarios asignados pueden entrar a la intranet.
* **Requerimientos Especiales:** Ninguno.
* **Excepciones:** "El voluntario ya pertenece a este equipo".

### CU-23: Depurar Datos del Sistema
* **Descripción:** El sistema deberá permitir al Administrador Master eliminar permanentemente registros del sistema para realizar tareas de mantenimiento y limpieza de datos obsoletos.
* **Actor:** Admin Master.
* **Flujo Básico:**
  1. El Master selecciona un registro (Usuario, Proyecto, etc.) para borrar.
  2. El Sistema solicita confirmación explícita.
  3. El Master confirma.
  4. El Sistema verifica integridad referencial.
  5. El Sistema elimina el dato físicamente.
* **Subflujos:**
  1. **Borrado en Cascada (Opcional):** Si el Master habilita la opción, el Sistema elimina también los registros dependientes.
* **Flujos Alternativos:**
  1. **Restricción de FK:** Si existen dependencias y no se permite borrado en cascada, el Sistema muestra "No se puede eliminar: existen registros dependientes (FK constraint)".
* **Precondiciones:** Rol Master.
* **Postcondiciones:** Dato eliminado irreversiblemente.
* **Puntos de Extensión:**
  - **CU-19 (Auditar Historial de Actividad):** Cada borrado queda registrado en el log.
* **Requerimientos Especiales:** Mantenimiento.
* **Excepciones:** "No se puede eliminar: existen registros dependientes (FK constraint)".

---

## 6. ACTOR: VISITANTE (NUEVO)

### CU-24: Consultar Información Institucional
* **Descripción:** El sistema deberá permitir al Visitante consultar la información institucional (misión, visión, valores y procesos de trabajo) para conocer el contexto y la cultura de la organización.
* **Actor:** Visitante.
* **Flujo Básico:**
  1. El Visitante accede a la sección "Nosotros" del portal.
  2. El Sistema recupera los textos institucionales almacenados en la tabla `institution_info`.
  3. El Sistema muestra la misión, visión, valores y una breve descripción de los procesos de trabajo.
* **Subflujos:**
  1. **Versión ampliada:** Si el Visitante pulsa "Ver más", el Sistema despliega una página con contenido extendido y recursos multimedia (imágenes, videos).
* **Flujos Alternativos:**
  1. **Contenido no disponible:** Si la tabla está vacía o ocurre un error de conexión, el Sistema muestra el mensaje "Información institucional no disponible".
* **Precondiciones:** La tabla `institution_info` contiene al menos un registro activo.
* **Postcondiciones:** El visitante visualiza la información institucional.
* **Puntos de Extensión:**
  - **CU-01 (Consultar Áreas de Investigación):** Desde la sección institucional el visitante puede navegar a las áreas.
  - **CU-02 (Consultar Convocatorias Vigentes):** La información institucional puede incluir enlaces a convocatorias.
* **Requerimientos Especiales:** RF-05 (Contenido institucional).
* **Excepciones:** "Error al cargar la información institucional".

---

*Fin del documento.*
