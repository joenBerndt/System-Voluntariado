# CU-24: Consultar Información Institucional

**Descripción:** El sistema deberá permitir al Visitante consultar la información institucional (misión, visión, valores y procesos de trabajo) para conocer el contexto y la cultura de la organización.

**Actor:** Visitante.

**Flujo Básico:**
1. El Visitante accede a la sección "Nosotros" del portal.
2. El Sistema recupera los textos institucionales almacenados en la tabla `institution_info`.
3. El Sistema muestra la misión, visión, valores y una breve descripción de los procesos de trabajo.

**Subflujos:**
1. **Versión ampliada:** Si el Visitante pulsa "Ver más", el Sistema despliega una página con contenido extendido y recursos multimedia (imágenes, videos).

**Flujos Alternativos:**
1. **Contenido no disponible:** Si la tabla está vacía o ocurre un error de conexión, el Sistema muestra el mensaje "Información institucional no disponible".

**Precondiciones:** La tabla `institution_info` contiene al menos un registro activo.

**Postcondiciones:** El visitante visualiza la información institucional.

**Puntos de Extensión:** Ninguno.

**Requerimientos Especiales:** RF-05 (Contenido institucional).

**Excepciones:** "Error al cargar la información institucional".

---

*Este caso de uso complementa la cobertura de los requisitos funcionales y permite que el sistema cumpla con la necesidad de presentar la información institucional a los usuarios externos.*
