# Catálogo de Requisitos del Sistema (Casos de Uso)

Este documento define la terminología oficial y el alcance funcional del Sistema de Gestión de Voluntariado IIAP.

## 1. Actor: Visitante (Público)
*Usuarios generales que acceden al portal sin credenciales.*

*   **CU-01: Consultar Áreas de Investigación**
    *   Permite visualizar las líneas temáticas estratégicas de la institución.
*   **CU-02: Consultar Convocatorias Vigentes**
    *   Visualización de ofertas de voluntariado activas y disponibles para postulación.
*   **CU-03: Explorar Catálogo de Proyectos**
    *   Búsqueda y visualización de iniciativas públicas y sus objetivos.
*   **CU-04: Registrar Cuenta de Usuario**
    *   Creación de nuevas credenciales de acceso para postular.
*   **CU-05: Iniciar Sesión**
    *   Proceso de autenticación para ingresar a las funciones privadas.

## 2. Actor: Usuario Autenticado / Candidato
*Usuarios registrados que buscan participar en el programa.*

*   **CU-06: Gestionar Perfil Personal**
    *   Actualización de datos de contacto e información básica.
*   **CU-07: Postular a una Convocatoria**
    *   Envío de solicitud formal para participar en una vacante específica.
*   **CU-08: Consultar Estado de Postulaciones**
    *   Monitoreo del avance de las solicitudes enviadas (Pendiente, Entrevista, Aceptado, etc.).

## 3. Actor: Voluntario
*Usuarios aceptados que participan activamente en proyectos.*

*   **CU-09: Acceder a Mis Proyectos**
    *   Ingreso a la intranet de los proyectos asignados para ver detalles internos.
*   **CU-10: Realizar Capacitación Virtual**
    *   Consumo de videos formativos y registro de avance en el aprendizaje.

## 4. Actor: Administrador Junior (Gestor)
*Encargados operativos de proyectos y selección.*

*   **CU-11: Publicar Nueva Convocatoria**
    *   Creación y lanzamiento de ofertas públicas asociadas a proyectos.
*   **CU-12: Evaluar y Seleccionar Candidatos**
    *   Revisión de postulantes, gestión de entrevistas y decisión de aceptación/rechazo.
*   **CU-13: Gestionar Recursos Educativos**
    *   Carga y administración de materiales de formación (videos, enlaces) para los proyectos.
*   **CU-14: Supervisar Proyectos Asignados**
    *   Gestión operativa limitada a los proyectos bajo su responsabilidad directa.

## 5. Actor: Administrador Master (Super Admin)
*Usuarios con privilegios globales sobre el sistema.*

*   **CU-15: Gestionar Usuarios y Roles**
    *   Administración global de cuentas y elevación de privilegios (asignación de admins).
*   **CU-16: Administrar Catálogo de Áreas**
    *   ABM (Alta, Baja, Modificación) de las áreas temáticas institucionales.
*   **CU-17: Actualizar Información Institucional**
    *   Edición de contenido estático (Misión, Visión, Valores) visible en el portal.
*   **CU-18: Generar Reportes de Gestión**
    *   Exportación de datos consolidados y estadísticas del sistema.
*   **CU-19: Auditar Historial de Actividad**
    *   Revisión de logs de seguridad y traza de acciones críticas realizadas.
*   **CU-20: Administrar Cartera de Proyectos**
    *   Gestión del ciclo de vida global de todos los proyectos (Creación, Cierre).
*   **CU-21: Designar Responsables de Proyecto**
    *   Asignación de Administradores Junior a proyectos específicos.
*   **CU-22: Asignar Voluntarios a Equipos**
    *   Vinculación directa de voluntarios aceptados a los equipos de trabajo.
*   **CU-23: Depuración de Datos del Sistema**
    *   Mantenimiento y eliminación definitiva de registros obsoletos.
