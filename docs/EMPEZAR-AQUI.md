# Empezar aquí: cómo se hace un libro o tablero de Social Data IBERO

Este documento es el punto de entrada para cualquier persona o asistente que vaya a crear un libro de
datos o un tablero nuevo en Observable Framework. Resume lo que se decidió y se probó hasta noviembre
de 2026 y dice dónde está el detalle. Se lee completo antes de escribir código.

## 1. Se parte siempre de esta Plantilla

- Repositorio: `MisaelAvila49/Plantilla-Frameworks` (GitHub). Copia local:
  `D:\IMPORTANTE\SocialDataIbero\Framework\Plantilla`.
- Un libro nuevo se crea COPIANDO esta carpeta (sin `node_modules/`, `dist/`, `.git/`, `docs/capturas/`
  ni `catalogo/referencias/`) y se edita; no se arma un sitio desde cero ni se copia de proyectos
  viejos (`obs-data-book`, `jcf-stats`, PISA), que tienen estilos y errores ya corregidos aquí.
- Implementaciones de referencia hechas con esta Plantilla:
  - Libro «Las personas con discapacidad en México»: `Framework\discapacidad` (siete capítulos, cinco
    fuentes del INEGI, portada con ilustración). Es el ejemplo más completo de datos reales, prosa y
    verificación.
  - Tablero «Mujeres con discapacidad en México»: `Framework\discriminacion-mujeres`
    (`socialdataibero/obf-discapacidad-discriminacion`), con el estilo de la Plantilla aplicado a un
    tablero existente.

## 2. Qué leer, en este orden

1. `REGLAS.md`: todas las reglas numeradas (R1 a R185 y la tabla «Reglas que cambiaron»). Manda sobre
   cualquier costumbre de otro proyecto.
2. `README.md`: cómo correr, verificar, empezar un libro, dónde está cada cosa.
3. `docs/datos.md`: contrato de datos (esquema largo num/den/casos/ee, error por linearización de
   Taylor, código 8 en Censo/EIC, escalas invertidas). Con `scripts/datos/comun.py` (agregador en
   DuckDB, ya con el arreglo de COALESCE que evitaba subestimar el error) y
   `src/components/agregar.js` (lectura de Parquet y suma de num/den en el navegador).
4. `docs/publicar-en-github-pages.md`: despliegue con GitHub Actions.
5. La skill `/observableframework` (`references/lecciones-tablero.md`, lecciones 1 a 131) y el
   `CLAUDE.md` del usuario: el porqué de cada regla.

## 3. Decisiones que más se olvidan

- **Portada**: hero con texto a la izquierda y libro claro en perspectiva a la derecha; la tapa lleva
  una ILUSTRACIÓN del tema con licencia (opción `imagen` de `portada()`), nunca un dibujo de datos
  (R184). Debajo: autores destacados con ORCID verde, los cinco datos en un renglón con rótulos rojos y
  enlace a Referencias (R185), luego «Cómo citar» y al final «Contenido» en negro con números rojos.
- **Menú**: Inicio solo arriba; capítulos o páginas en grupos; Metodología y Referencias abajo. Las
  páginas sueltas seguidas se funden en un solo bloque: lo que debe ir aparte va en un grupo.
- **Sección**: título, panel de filtros en grupos rotulados (rótulo de grupo en rojo, formato del
  número de sección), figura con título en tinta, subtítulo generado, pie de una frase, descarga y tres
  desplegables con tabla. SIN tarjetas de cifras (R182). Forma de gráfica según la pregunta y sin
  repetir en secciones seguidas.
- **Panel pegajoso**: se compacta solo cuando el contenido llega a la barra (R183); `verificar:quieto`
  en cero.
- **Globo**: tres renglones: grupo, cifra (el porcentaje o el valor) y población «N de M universo»,
  con el universo en dos o tres palabras («personas con discapacidad», «hombres», «habitantes»); sin
  lugar, año, frase ni comparación (sección 8 de REGLAS.md, R117).
- **Textos**: la prosa de apertura y cierre solo cita cifras PUBLICADAS por la fuente oficial, con su
  referencia (R181); lo propio se ve en gráfica, globo y tabla. Los textos describen, no concluyen.
- **Color**: tono de tema para la serie y la rampa; rojo = desfavorable, azul = favorable, gris = sin
  cambio o contexto. El tono se elige en la página «Muestra de colores» (`/colores`), con el validador
  de daltonismo en claro y oscuro; la recomendada es la A.
- **Datos**: nunca promediar tasas ni sumar ediciones; montos deflactados con el INPC del levantamiento;
  códigos verificados con conteos, no por el nombre de la columna; cifras centrales cotejadas contra el
  tabulado oficial en `docs/verificacion/<fuente>.md`.
- **Ejes**: los de porcentaje llevan « %» (`pctMarca` de `formato.js`).

## 4. Cómo se trabaja

- Encuadre primero (preguntas de la sección 0.2 de REGLAS.md): tema, fuentes, capítulos, quién lo lee.
- Inventario de lo que cada fuente capta antes de diseñar filtros (lección 103).
- Datos: un loader por fuente en `scripts/datos/`, salida Parquet chica en `src/data/indicadores/`,
  cotejo oficial documentado.
- Páginas: copiar el patrón de una sección existente (`src/seccion-modelo.md` o un capítulo del libro de
  discapacidad), con `analisis()`.
- Builds en paralelo sin pisarse: `OBS_SALIDA=dist-x OBS_PUERTO=47xx npm run build` y lo mismo en cada
  `npm run verificar:*`.
- Antes de entregar: `npm run verificar:todo` (build, paleta, render, filtros, quieto, a11y, scroll) y
  MIRAR capturas de cada sección en claro y oscuro, a 1366 y 390 px.
- Pruebas de diseño en `D:\IMPORTANTE\SocialDataIbero\Pruebas Diseño\`, no sobre el repo real. Nada se
  publica ni se empuja sin pedirlo.
