# Reglas para los libros de datos de Social Data IBERO

Documento rector de la Plantilla de Observable Framework. Reúne en un solo lugar las reglas con las que se construye cada libro de datos, de modo que quien arme uno nuevo, sea una persona o un asistente, pueda repetir las mismas instrucciones sin volver a preguntarlas. Las reglas salen de tres fuentes: las 44 reglas destiladas de las correcciones al libro `perdida-lengua` (37 commits, del 21 de octubre al 15 de noviembre de 2026), la auditoría de globos y de color de ese mismo libro, y las lecciones acumuladas en los tableros anteriores (PISA, Observatorio de Pueblos Indígenas). Donde esas fuentes chocan se aplican las decisiones editoriales de noviembre de 2026, que se enumeran en la sección 15.

Cada regla lleva un número (R1, R2…), un enunciado que se puede comprobar y, cuando la fuente lo documenta, una línea de **Por qué** con el error real que la originó.

---

## 0. Cómo usar este documento

### 0.1 Qué manda sobre qué

1. Este archivo, `REGLAS.md`.
2. `catalogo/colores.md` (la regla de color lista para copiar) y `catalogo/README.md` (cómo elegir la forma de una gráfica).
3. `catalogo/formas-novedosas.md` (18 fichas con receta) y las capturas de `catalogo/referencias/`.
4. Los tres catálogos copiados en `catalogo/` (`CatalogoVisualizacion.md`, `GuiaVisualizacion.md`, `CatalogoGraficas.html`). Son material de consulta para recetas. Donde contradigan a los tres niveles anteriores, no se siguen. La lista de contradicciones está en `catalogo/README.md`, sección 4.

Este documento dice **qué** debe cumplir el libro. El **cómo** está en el código de la Plantilla (`src/`, `scripts/`, `observablehq.config.js`) y en su `README.md`. Los nombres de funciones que aquí se citan (`globo()`, `analisis()`, `alAcercarse()`, `conDato`, `sentido()`) son los de `perdida-lengua` o los propuestos en su auditoría. Si el componente de la Plantilla se llama distinto, manda el nombre del código y la regla se conserva.

### 0.2 Preguntas de encuadre

Se hacen una sola vez, antes de escribir código. Todo lo demás está decidido en este documento y no se vuelve a preguntar.

1. **Nombre del producto** y palabra clave que irá en rojo en el título.
2. **Tesis del libro** en una frase, y el caso que podría contradecirla (sirve para elegir la tapa, R31).
3. **Capítulos** (páginas) y, dentro de cada uno, la pregunta que responde cada análisis.
4. **Significado de rojo, azul y gris en cada capítulo** (R95). Si un capítulo solo mide niveles, se declara que no usa rojo ni azul.
5. **Tono de tema** del libro. Por omisión, verde azulado (ver `src/components/paleta.js`, fuente única).
6. **Fuentes**: qué publica cada una, a qué nivel geográfico, en qué ediciones y qué no es comparable entre ediciones (R142, R143).
7. **Unidad de análisis, universo y apellido** de las cifras (por ejemplo, “personas de 5 años y más”). De aquí salen el subtítulo y la explicación de cada figura; el globo no lleva frase (R118).
8. **Metadatos editoriales**: autores con ORCID, afiliación, año, DOI y licencia. Ninguno se publica en “por definir” (R33).
9. **Qué dibuja la tapa**: dos o tres candidatos para probar en el navegador (R32).
10. **Vocabulario**: nombre respetuoso de los grupos de población y cómo se nombra el producto en el texto visible (R132).
11. **Dónde se publica**: repositorio del equipo, espejo personal y quién autoriza cada entrega (R176).

### 0.3 Orden de trabajo para un libro nuevo

1. **Encuadre.** Responder las once preguntas de 0.2 y dejarlas escritas en el `README.md` del libro.
2. **Copiar la Plantilla** a una carpeta nueva dentro de `D:\IMPORTANTE\SocialDataIbero\Pruebas Diseño\`. El repositorio real no se toca mientras se diseña (R11).
3. **Declarar la identidad una sola vez**: nombre, descripción, autores, tono de tema y rutas, en el lugar único que la Plantilla define, y derivar de ahí lo demás (R13).
4. **Poner al día los verificadores**: listas de páginas, de paletas y de controles de cada script, y borrar lo que el libro no usa (R170, R171).
5. **Datos.** Inventariar qué publica cada fuente y a qué nivel, escribir los loaders, cotejar las cifras centrales con la fuente oficial y partir los archivos por capítulo (sección 10).
6. **Capítulos.** Para cada uno: declarar el significado de los colores, hacer el inventario de formas (una por pregunta, sin repetir en secciones seguidas, R73), y escribir cada análisis con la anatomía de la sección 4.
7. **Metodología y Referencias.** Un apartado con ancla por método compartido y una entrada APA por fuente de datos (sección 9). Se actualizan en el mismo cambio que la gráfica.
8. **Portada y tapa.** Portada editorial completa y tapa elegida entre varias en el navegador (sección 3).
9. **Verificación.** Correr la batería completa y mirar las capturas (sección 13). La lista de control final está en la sección 16.
10. **Entrega.** Publicar desde la copia de pruebas, primero al espejo y después al repositorio del equipo con permiso explícito (R176).

---

## 1. Principios

**R1. El libro es para el público.** Cada gráfica responde una sola pregunta y se entiende en cinco segundos sin instrucciones. Cuando claridad y detalle compiten, gana la claridad en la vista y el detalle se va al desplegable, a la tabla o a Metodología. Antes de entregar se abre cada página como alguien que no sabe qué es un denominador. *Por qué:* los libros los abre cualquier persona, no un equipo técnico.

**R2. Un libro de datos no lleva scrollytelling.** Cada análisis es una sección con filtros y globos. No hay historia guiada por pasos, gráfico pegajoso que cambia de estado ni bloque de personalización al inicio. *Por qué:* el formato de capítulo con bloques narrativos se percibió como scrollytelling aunque ya no tuviera gráfica pegajosa.

**R3. Fondo claro y animación una sola vez.** Ninguna gráfica, portada ni encabezado de capítulo se dibuja sobre fondo oscuro como decisión de diseño. Las entradas corren una vez al entrar la sección en pantalla y quedan quietas. No hay bucles ni botón de pausa (R167).

**R4. Llamativo y novedoso, con accesibilidad medida.** Se prefieren las formas poco habituales del catálogo siempre que el valor siga leyéndose (R74). Accesible no significa austero, y la accesibilidad se mide con los verificadores, no se declara (sección 13).

**R5. La forma sale de la pregunta** y no se repite en dos secciones seguidas (R71, R73).

**R6. El mismo control, el mismo color y el mismo trazo significan lo mismo en todo el libro.** El panel base, la regla de color del capítulo, el trazo de la mediana y el contenido del globo son constantes que se fijan antes de dibujar la primera gráfica.

**R7. Lo que el dato no sostiene no se ofrece.** Ni una opción de filtro que deje la gráfica vacía, ni una desagregación que la fuente no capta, ni una serie que una ediciones no comparables (R54, R56, R143).

**R8. Toda estadística va con las personas a las que equivale y con la referencia para comprobarla.** El globo da el porcentaje y el número de personas (sección 8). Cada análisis dice contra qué tabla oficial se cotejó (R136).

**R9. Los textos describen, no concluyen** (sección 9).

**R10. Se verifica mirando y midiendo.** Antes de decir que algo está listo se corre el build y los verificadores y se muestran sus salidas. “Debería funcionar” no cuenta. Una verificación que no cambia tras un arreglo indica que el arreglo no entró.

**R11. Se trabaja sobre una copia.** Las pruebas van en `D:\IMPORTANTE\SocialDataIbero\Pruebas Diseño\`, nunca sobre el repositorio real sin pedirlo.

---

## 2. Estructura del sitio y navegación

**R12. Páginas del libro, en este orden:** Inicio (portada), Introducción, los capítulos, Metodología y Referencias. Inicio, Introducción y Referencias no llevan índice lateral. Los capítulos y Metodología sí.

**R13. El nombre del producto se declara una vez y se deriva.** De esa declaración salen el título de la configuración, la marca del menú, el `title` y el h1 de la portada, el título de la tapa, `CITATION.cff`, los cuatro formatos de cita con su llave BibTeX, las rutas, las descripciones por página y las listas de páginas de los verificadores. *Por qué:* en `perdida-lengua` el renombre tocó nueve lugares en un solo commit, y un título más largo obligó a medir de nuevo la tapa.

**R14. Configuración fija del sitio.** Sin header. `toc: {label: "En esta página"}`. Búsqueda activa. Tipografías Newsreader y Schibsted Grotesk declaradas en `globalStylesheets`, no con `@import`. `body {font: 1rem}`. Metadatos por página en un mapa `DESCRIPCIONES` de la configuración, no en el front matter, con Open Graph completo, favicon SVG y logo del menú como SVG en texto. *Por qué:* el header roba alto a las gráficas y su enlace ya vive en el pie y en el menú.

**R15. Modo claro por omisión, con botón de tema.** El tema vive en `data-tema` de `<html>` y en `localStorage`. No se usa `prefers-color-scheme`. El botón va como `<li>` del menú, con texto y `aria-pressed`. *Por qué:* un `<div>` dentro de la lista del menú no se pinta.

**R16. El HTML generado se corrige después del build.** Un script posterior declara `lang="es"` y quita `maximum-scale=1`. Los arreglos de accesibilidad sobre el marco de Framework van en el script de arranque del `head` (R174). *Por qué:* la configuración no alcanza el HTML generado.

**R17. Los encabezados de capítulo no llevan “Parte N”.** Cada capítulo abre con un encabezado claro sobre el fondo normal y sin animación: h1 con la palabra clave en rojo y, cuando hace falta, entradilla en serif. Nunca una portada oscura por capítulo. *Por qué:* el menú ya muestra el orden y en la revisión de `perdida-lengua` se retiraron los antetítulos numerados. Sustituye a la convención anterior (sección 15).

**R18. Un solo acento rojo por bloque.** Si el h1 lleva palabra clave en rojo, el antetítulo va en gris. Un bloque que ya tiene botón rojo no lleva además filete rojo (R111).

**R19. El índice se arma con anclas estáticas.** Antes de cada análisis va un `<h2 id="..." class="toc-anchor">` escrito en el `.md`, con texto fijo y sin interpolación, colapsado con `position: absolute`, `width: 1px`, `height: 1px` y `clip: rect(0,0,0,0)`. Nunca `display: none`. *Por qué:* el índice de Framework se construye en el build, antes de que el navegador pinte los títulos que genera el componente.

**R20. El título del índice y el del encabezado de sección son el mismo texto.** En texto visible, los rangos de años van con guion corto y espacios (2015 - 2025). *Por qué:* uno sale del `.md` y otro del componente, y divergen solos.

**R21. El número visible de la sección es independiente de su id interno.** Al reordenar se cambia solo el número. Los mapas que enlazan cada análisis con su apartado de Metodología y con su verificación van por id interno. *Por qué:* evitó errores en los reordenamientos de `perdida-lengua`.

**R22. El armado de la sección vive en un solo componente.** `analisis()` (ancla, encabezado, filtros, cuerpo, descarga, explicación y verificación) y la lógica de filtros existen una sola vez y todas las páginas los importan. *Por qué:* en `perdida-lengua` había dos versiones con firmas distintas y la lógica de variantes estaba duplicada.

**R23. Un adorno del menú va como bloque propio al final del menú,** con `aria-hidden`, colores fijos que se lean igual en claro y en oscuro y sin separadores. No va dentro de la lista de páginas. *Por qué:* colocarlo tomó cuatro commits.

**R24. La imagen de vista previa cambia de nombre de archivo cuando cambia la portada,** y el flujo de despliegue la copia a `dist/images/`. *Por qué:* las redes guardan la vista previa por su dirección, y Framework no copia una imagen que solo se referencia por URL absoluta.

**R25. Una página que se retira lleva `draft: true`, no se borra,** y sale de las listas de los verificadores. Una página de pruebas nunca se queda sin `draft: true`. Ninguna página se publica con texto “en preparación”.

**R26. Reglas de marcado dentro de los `.md`.** El HTML crudo va con sangría de dos espacios y sin líneas en blanco dentro del bloque. Un SVG se sirve con `<img src>`, no interpolado. Dentro de `head:` de la configuración no se escriben acentos graves en comentarios. *Por qué:* cuatro espacios de sangría convierten el bloque en código literal, una línea en blanco lo cierra, y `head:` es una plantilla literal cuyo error sale sin número de línea. Se comprueba con `node -e "import('./observablehq.config.js')"`.

---

## 3. Portada y tapa

**R27. Portada editorial obligatoria.** La página de inicio lleva, en este orden: hero, instituciones, rejilla de metadatos y bloque “Cómo citar”. El hero tiene antetítulo, título con la palabra clave en rojo, **un solo párrafo de resumen** y dos botones (“Explorar los datos” y “Cómo se hizo”). La rejilla de metadatos lista autores con ORCID, afiliación, año, fuentes, DOI y licencia. “Cómo citar” lleva pestañas APA, Chicago, IEEE y BibTeX con botón de copiar. El repositorio lleva `CITATION.cff` en la raíz.

**R28. El resumen es un texto único.** El párrafo del hero es el mismo de la descripción para buscadores y del `abstract` de la cita. *Por qué:* en `perdida-lengua` el hero perdió el subtítulo y la línea de dek en dos commits, y quedó un párrafo.

**R29. La tapa es un libro claro en perspectiva.** Texto a la izquierda y, a la derecha, un libro con `rotateY(-16deg) rotateX(3deg)` que se endereza un poco al pasar el cursor, con lomo, canto de hojas y todos los tamaños en `cqw`. Lleva solo lo justo: el sello “SOCIAL DATA IBERO”, el dibujo, el título con una palabra en rojo, el lugar cuando aplica, el año en romanos y el logo gris. Conserva sus colores claros en tema oscuro. Entra una vez al cargar, con `animation-fill-mode: backwards`. *Por qué:* las portadas oscuras con halos se rechazaron. Con `both` el efecto al pasar el cursor deja de funcionar.

**R30. La tapa representa el dato sin imprimir cifras ni rótulos que haya que leer a media escala.** Si el dibujo necesita un renglón explicativo, es una gráfica y no una tapa. *Por qué:* la tapa de pilas de libros necesitó cuatro rondas de ajuste para que sus rótulos se leyeran y se descartó completa.

**R31. Lo que dibuja la tapa se elige por la proporción que sostiene la tesis,** no por el conteo absoluto, y se comprueba con el caso que podría contradecirla. *Por qué:* en tseltal y tsotsil había más niños hablantes que en 1990, pero eran una parte menor de sus hablantes. Con conteos, el dibujo decía lo contrario de la tesis.

**R32. La tapa se elige mirando varias en el navegador.** Se arma una página aparte con dos a cinco tapas y vista previa. No se elige a partir de una descripción.

**R33. Una cifra para un dibujo se coteja con la publicada antes de usarla,** y los metadatos de la portada se entregan completos. *Por qué:* un total sumado por sexo salió al doble porque las filas traían Hombres, Mujeres y Total. La licencia de `perdida-lengua` quedó en “por definir”.

**R34. Un dibujo en `<canvas>` que usa las fuentes del sitio se pinta en `document.fonts.ready`.** *Por qué:* de lo contrario sale con la fuente del sistema.

**R35. La portada se mide a 1366 × 768.** Los botones del hero quedan en la primera pantalla. Con el menú lateral la columna es más angosta que en la prueba aislada, por lo que el h1 baja a `clamp(2.2rem, 1.2rem + 2.4vw, 3.4rem)`. Un título más largo obliga a medir de nuevo la tapa.

**R36. Al copiar CSS de otro proyecto se revisa si ya está.** Antes de pegar se cuenta cada regla con `grep -c "^\.clase {"`, y la copia sobrante se borra entera. *Por qué:* el bloque de portada pegado dos veces dejó el hero a una columna, porque las reglas de abajo ganaban por cascada.

**R37. El bloque de metadatos va en rejilla de dos columnas,** con el rótulo en su propia columna, tamaños en `rem` y `tabular-nums` si cita cifras. *Por qué:* con el rótulo en línea el texto envuelve bajo la etiqueta y todo se funde en un párrafo.

**R38. Nada se mueve de forma permanente detrás de un texto que se lee,** y cada efecto nuevo usa su propio elemento. *Por qué:* una flotación suave del libro estorbaba al leer el título, y reutilizar `::after` para un reflejo habría borrado el marco que ya dibujaba.

---

**R184. La imagen de la tapa es del tema, no de las gráficas.** Una figura que represente a la población del libro, con licencia verificada y anotada (dominio público, CC0, CC BY o ilustración propia), como la mujer del Códice Florentino de `perdida-lengua`. El dato solo puede ir como textura secundaria junto a la figura. Se evitan pictogramas que reduzcan al grupo a un ícono. *Por qué:* las tapas con dibujos de datos se leían como gráficas y se rechazaron.

**R185. Anatomía del bloque de metadatos y del índice de la portada.** Los autores van primero, en su propio renglón y a todo lo ancho, con el nombre en Newsreader 500 a 1.22rem, el ícono oficial de ORCID en su verde #A6CE39 (SVG propio, con `aria-label` «ORCID iD de …»), el sobre del correo en rojo y «autor de correspondencia» chico en gris; en el teléfono cada autor ocupa su renglón. Debajo, la rejilla de afiliación, año, fuentes, DOI y licencia: rótulo encima del valor, en el formato del rótulo de grupo de filtros y del número de sección (700 0.8rem, espaciado 0.08em, mayúsculas, `var(--rojo)`); valor en peso normal, subtítulo en `--tinta-2`, DOI como enlace rojo subrayado y lo que falta («por asignar», «por definir») en gris itálico. El índice lleva un rótulo del mismo formato («Capítulos»), el número de cada capítulo en rojo («01», «02»…, contador CSS), el título en serif tinta sin subrayado, que se subraya y enrojece al pasar el cursor o enfocarlo, y la descripción en gris. En «Cómo citar» la pestaña activa va en rojo. *Por qué:* con rótulos grises, nombres y valores en negrita negra e índice subrayado en negro, el bloque se leía todo negro y los autores no destacaban como en `perdida-lengua`. El rojo de los rótulos da 6.11:1 sobre blanco y #f27076 da 6.72:1 sobre el fondo oscuro.

## 4. Anatomía de una sección

Cada análisis se arma con el mismo esqueleto, en este orden:

```text
[ancla estática h2.toc-anchor]        mismo texto que el título (R19, R20)
01 · Título de la sección             número pequeño en rojo
Frase de entrada                      una sola, optativa (R39)
[panel de filtros]                    sección 5
┌ figura ─────────────────────────┐
│ Título de la figura             │   en tinta, nombra lo que se mide (R40)
│ Subtítulo generado              │   lo escribe el componente con los filtros (R41)
│ [leyenda]                       │   sección 7
│ [rótulos de líneas de referencia]   fuera del lienzo (R43)
│ [gráfica]                       │
│ Pie de una frase                │   12 a 35 palabras (R44)
│ Descargar PNG · SVG             │   sección 11
└─────────────────────────────────┘
Notas.                                solo las que aplican a lo elegido (R45)
▸ ¿Qué quiere decir este análisis?    con botón a Metodología (R134)
▸ Fuentes y verificación              R136
▸ Ver los datos (N filas)             tabla de respaldo (R47)
```

**R39. Sin párrafo de introducción.** Entre el título y los filtros cabe, como máximo, una frase de entrada. *Por qué:* lo que diría el párrafo ya está en el pie y en el desplegable. Si se borra y ninguna pregunta queda sin respuesta, era deuda.

**R40. El título de la figura nombra lo que se mide, no lo que se concluye,** y va en tinta oscura. El rojo queda para la cifra principal y el número de sección. *Por qué:* en la revisión, “Dentro de cada entidad, los municipios se mueven en direcciones distintas” pasó a “El cambio de cada municipio dentro de su entidad”.

**R41. El subtítulo lo genera el componente a partir de los filtros,** no la página. Dice el lugar, el año o tramo, el universo y, si algo se resaltó, qué se resaltó.

**R42. Estilo limpio, sin tarjetas.** Figuras, cifras y filtros van sin caja ni líneas grises y se separan con aire. La gráfica ocupa todo el ancho de la columna (tope de 1,320 px) y se alinea a la izquierda con su título. El alto de las líneas de tiempo crece con el ancho, entre 240 y 400 px. Los mapas se topan en 980 px de ancho. Los filtros van en una franja de fondo gris claro sin borde, con el mismo ancho y el mismo margen izquierdo que la figura. Si un bloque pinta su fondo, pinta también su texto. Se mide sin scroll horizontal en 1920, 1366, 1024 y 390 px.

**R43. Los rótulos de las líneas de referencia van fuera del lienzo,** en un renglón entre la leyenda y la gráfica. La descarga también lo incluye. *Por qué:* dentro del lienzo tapan ejes y filas.

**R44. El pie de la figura es una frase de 12 a 35 palabras** con la forma `fuente · qué representa cada marca`. La metodología va al desplegable.

**R45. Las salvedades que dependen del filtro van en un bloque “Notas.” bajo la figura,** y solo se muestran las que aplican a lo elegido. No van en la explicación, el subtítulo ni el pie.

**R46. Los tres desplegables van siempre en el mismo orden y se ven idénticos cerrados:** “¿Qué quiere decir este análisis?”, “Fuentes y verificación” y “Ver los datos”. Usan el marcador nativo y una sola regla de `summary`, con el mismo ancho y alineación. Entre secciones queda una sola línea. Se comprueba con `getComputedStyle` y `getBoundingClientRect` en varias secciones. *Por qué:* la línea doble salía de sumar el borde del último desplegable y el separador de la sección siguiente.

**R47. Toda sección lleva tabla de respaldo.** La tabla contiene lo que el globo no muestra: margen de error, intervalo, casos de muestra sin expandir, población que cumple y población total. *Por qué:* en `perdida-lengua` faltaba en 21 de las 22 secciones, y la norma de globos (R125) depende de que exista.

**R48. Una figura por sección, elegida por la pregunta.** Cuando la misma gráfica se muestra para país, entidad y municipio, los paneles van lado a lado con una sola función de paneles. *Por qué:* las filas de cuatro a diez gráficas pequeñas por sección eran correctas y monótonas.

**R49. El ancho de la gráfica se mide con una regla en el DOM y un solo `ResizeObserver` por página.** Los cortes de diseño usan las expresiones literales de `layout.css` de Framework. Las reglas CSS que crecen con cada función van por prefijo de clase (`figure[class^="grafica-"]`), no por lista. *Por qué:* diez figuras nuevas se quedaron en 640 px dentro de una columna de 980 y nada avisó.

**R50. Una celda vacía se rotula “Sin dato”,** y el rótulo que identifica una marca va en todas las facetas. *Por qué:* un panel en blanco se lee como filtro roto, y un rótulo solo en la primera faceta impide seguir la misma entidad en las demás.

---

## 5. Filtros

**R51. Cada sección tiene su propio panel, y todos comparten el mismo panel base.** Mismos rótulos, mismo orden y mismas listas en todo el libro. Así se puede dejar una gráfica en un año y otra en otro para compararlas.

**R52. El panel va de lo grande a lo específico, en dos renglones.** Arriba: dónde (entidad, municipio), qué (el tema del libro) y de qué fuente. Abajo: los años, los selectores propios de la gráfica y el umbral. Cuando hay filtros de población (edad, sexo, escolaridad) forman un grupo rotulado, cada grupo en un `fieldset` con su `legend`. Con el panel en columna se usa `align-items: stretch`.

**R53. Se ofrecen todos los filtros que el dato sostiene, y ninguno más.** Cada cruce parte la muestra, así que el filtro se ofrece solo si la celda resultante se puede publicar (R149). Un control que duplica a otro, o que la interacción de la figura ya cubre, se retira. *Por qué:* en el treemap de lenguas se quitaron dos selectores porque el filtro común ya expresaba lo mismo y el clic lo escribía.

**R54. Un selector nunca ofrece una opción que deja la gráfica vacía.** Cada panel recibe una función que dice qué opciones tienen dato para la selección vigente (`conDato`, `entidadesCon`), y los selectores dependientes se rellenan cuando cambia el que los gobierna. *Por qué:* “Desde” y “Hasta” ofrecían las ocho ediciones aunque con una lengua no hubiera 1995 y por municipio no hubiera 2005.

**R55. Los selectores jerárquicos son coherentes en los dos sentidos.** Elegir el padre limpia al hijo. Elegir el hijo fija al padre.

**R56. Si la fuente no sostiene una desagregación en una edición, esa edición no se ofrece en ningún análisis de esa desagregación.** La lista de ediciones excluidas vive en una constante compartida. *Por qué:* con una variante elegida, 2015 y 2025 repetían las localidades del censo anterior.

**R57. “Desde” y “Hasta” solo se ofrecen cuando la gráfica compara un primer año con un último.** Si dibuja todas las ediciones no hay rango. Si dibuja una sola hay un selector de año. *Por qué:* en cinco secciones acotar el tramo solo quitaba renglones.

**R58. El selector de año ofrece un año concreto o comparar en facetas.** Nunca un agregado de ediciones (R147).

**R59. La opción por omisión es la vista más simple que ya cuenta algo,** no la más completa. *Por qué:* la medida por omisión pasó de “Las dos medidas” a una sola.

**R60. Un umbral se escribe como frase completa con la cifra editable dentro** (“Hogares donde habla [40] % o más de sus integrantes”), con la barra deslizante al lado y la casilla del mismo alto que los demás controles. La frase dice sobre qué año y qué universo se aplica. El umbral nunca deja la figura en blanco: con pocos casos se dibuja lo que hay.

**R61. En un mapa, la entidad encuadra y lo temático resalta.** El comportamiento es el mismo en todos los mapas del libro. El umbral de resalte se prueba con la categoría más grande y con la más chica antes de fijarlo, los resaltados llevan contorno y el subtítulo dice qué se resaltó. *Por qué:* con “algún hablante” casi todo el país quedaba resaltado, y con el 1 por ciento solo, las lenguas chicas no resaltaban ningún lugar.

**R62. Cuando la figura es un reparto del total, un filtro que lo partiría se convierte en resalte.** Lo que se oculta por decisión editorial se deja en el código con una línea que diga por qué.

**R63. El rótulo de un control nombra la marca que gobierna** (“Barras, año” y “Línea, comparar con”). Si menciona un color, el nombre sale de la paleta y no se escribe a mano (R94).

**R64. Una lista de casillas solo se muestra cuando su selector de modo la hace efectiva.** La regla va en el componente de filtros y lee el valor del panel, no el DOM.

**R65. `hidden` no oculta si un selector propio fija `display`.** La hoja termina con una regla explícita (`.panel-filtros [hidden] { display: none !important }`) y la prueba mide `getBoundingClientRect()`, no el atributo.

**R66. Los filtros son pegajosos en todas las secciones y compactos al fijarse.** Fijos muestran solo los controles y la franja no pasa de unos 110 px a 1366 × 768. A 390 px colapsan en un botón “Filtros”. En estado normal los grupos van uno junto a otro y bajan de renglón solo cuando no caben, con el rótulo arriba de cada select y selects del mismo ancho y alto. *Por qué:* una franja fija de 439 px tapaba la gráfica; y con un grupo por renglón, cuatro grupos de un control dejaban el panel largo y los controles sueltos (C33).

**R182. Sin tarjetas de cifras.** La sección muestra solo la gráfica: no hay fila de cifras destacadas arriba de la figura. Las cifras viven en la figura (rótulos directos), en el globo y en la tabla. `analisis()` ignora `kpis` aunque una página lo devuelva. *Por qué:* las tarjetas repetían lo que la gráfica ya dice y empujaban la figura hacia abajo (noviembre de 2026).

**R183. El panel se compacta solo cuando el contenido que lo sigue llega a la barra compacta.** Mientras tanto queda fijo el panel completo. Si se compactara apenas se fija, la reserva de R67 quedaba a la vista como un hueco vacío de unos 150 px bajo la barra. El cálculo usa el alto completo y el compacto medidos del propio panel, y se evalúa en el scroll con `requestAnimationFrame`.

**R67. El compactado no cambia el largo de la página.** Una reserva de 1 px después del panel compensa en su `margin-top` el alto que el panel cede. `npm run verificar:quieto` da cero cambios. *Por qué:* cerca del final de una sección la pantalla temblaba sola.

**R68. `#observablehq-main` lleva `container-type: normal`, y las rejillas se replican con `@media`.** *Por qué:* el `container-type: inline-size` de Framework anula `sticky` en todos sus descendientes, y al quitarlo las rejillas `.grid-cols-N` quedan en una columna sin aviso.

**R69. Los filtros se sincronizan aunque la sección todavía no se haya dibujado** (R162).

**R70. En un buscador, “ninguna coincidencia” y “varias” son estados distintos y los dos tienen respuesta visible.** Se compara sin acentos y se desempata por recencia.

---

## 6. Elección de la forma de gráfica

El procedimiento completo, el árbol de decisión y la tabla maestra de formas están en [`catalogo/README.md`](catalogo/README.md). Las recetas de las formas novedosas están en [`catalogo/formas-novedosas.md`](catalogo/formas-novedosas.md).

**R70a. La variante llamativa es la opción por omisión; la forma base es el respaldo.** De la tabla siguiente se parte de la columna «Variante llamativa» y solo se baja a la «Forma base» cuando la variante no cabe (densidad, precisión, pocos casos) y se dice por qué en la revisión. Una pila de barras, una línea sola o una dona no son la figura principal de ninguna sección. *Por qué:* el equipo pidió gráficas novedosas que se vean bien, en la línea del Data Vis Dispatch de Datawrapper, y no las formas típicas.

**R70b. Lo novedoso tiene que servir al flujo y a los filtros.** Una forma llamativa se acepta si cumple las tres condiciones: (1) responde la pregunta de su sección mejor o igual que la forma base; (2) cada filtro del panel cambia el dibujo de manera legible (destaca, recorta o reordena, sin volverse otra figura ni quedarse vacía), comprobado con `verificar:filtros`; (3) conserva el globo normado, la tabla de respaldo y la lectura a 390 px. Si una forma solo luce con un valor del filtro, no se usa.

**R71. La forma sale de la pregunta.** Se elige con la tabla siguiente y se confirma con la densidad (R72).

| Pregunta | Forma base | Variante llamativa (ficha de `formas-novedosas.md`) | No usar cuando |
| --- | --- | --- | --- |
| ¿Cuántos de cada 100? | Waffle de 10 × 10 | Multitud ilustrada con fracción sólida (12), multitud de unidades (17) | Hay más de cuatro grupos, o la proporción es menor a 1 de cada 100 |
| ¿Cuánto separa a dos grupos en cada categoría? | Dumbbell ordenado por brecha | Áreas superpuestas en paneles (06) | Hay más de dos series por fila |
| ¿Cómo cambió entre dos o tres cortes? | Pendiente, flechas | Líneas con grupo destacado (01), barras apiladas unidas por flujos (16) | La serie es larga |
| ¿Cómo evoluciona una serie larga? | Líneas con etiqueta al final, líneas con contexto | Anomalías con líneas de nivel (11) | Hay menos de cinco puntos |
| ¿De qué se compone el total? | Barras apiladas al 100 % | Barras apiladas unidas por flujos (16) | Se quiere comparar el tercer segmento |
| ¿Cómo varía un valor entre dos categorías cruzadas? | Heatmap con el valor en la celda | Mapa de calor edad × año (versión 2D de la 14) | — |
| ¿Quién está arriba y quién abajo? (muchas filas) | Lollipop | — | Hay pocas filas |
| ¿Dónde cae cada unidad y cómo se agrupan? | Enjambre, franjas con mediana, crestas | Enjambre de burbujas sobre un eje de razón (07), histograma de unidades (08) | El enjambre pasa de unos 500 puntos, o las crestas tienen menos de cinco grupos |
| ¿Cómo se compone la población por edad y sexo? | Pirámide | Pirámide con otro grupo en contorno | Los grupos de edad tienen anchos distintos |
| ¿En qué lugar de la distribución queda un valor? | — | Escalones de percentil por grupo (09) | — |
| ¿De dónde a dónde se mueve? | Sankey, matriz de adyacencia | Mapa de flujos con flechas anchas (05), aluvial entre dos cortes (10) | Hay más de ocho nodos por etapa, o los cortes son levantamientos independientes (R78) |
| ¿Dónde pasa? (tasas) | Coropleta con rampa continua de una tinta | Mosaico de entidades | El dato es un conteo |
| ¿Cuántos hay en cada lugar? (conteos) | Mapa de burbujas | Mapa de picos (18), mapa de puntos anotado (04), prismas sobre rejilla (02) | El dato es una tasa |
| ¿Cómo se reparte un total entre muchas partes? | Treemap jerárquico con migas | — | Hay menos de 12 partes sin jerarquía |
| ¿Qué tan de acuerdo están? (escala ordenada) | Apilada divergente | — | — |
| ¿Se relacionan dos medidas? | Dispersión | — | — |
| Un solo número es la respuesta | Cifra destacada, no gráfica | — | — |

**R72. La forma cambia con la densidad.** Un panel: barras o dumbbell. De dos a cuatro paneles: la misma forma en facetas con escala compartida. Más de cuatro: heatmap. Nunca una forma fija.

**R73. La forma no se repite en dos secciones seguidas.** Antes de escribir el capítulo se hace un inventario con una fila por análisis (pregunta, forma principal, alternativa) y se revisa de nuevo al terminar. La alternativa es siempre la forma que tolera menos muestra.

**R74. Se prefiere la variante llamativa cuando el valor sigue leyéndose.** Una forma figurativa se admite si el valor se lee por otro canal con leyenda (color, globo, cifras) y si la figura significa algo para el tema. La explicación dice qué codifica la posición y qué no. *Por qué:* la sección “Todos los municipios de un vistazo” pasó por cinco formas en cinco días. Las columnas de puntos eran legibles y no tenían identidad, y la vírgula volvió cuando el color con leyenda continua permitió leer el valor.

**R75. Formas que no se usan:** pastel y dona, radar, doble eje, 3D real con WebGL, streamgraph, barras y áreas radiales, sunburst, empaquetado de círculos, diagrama de cuerdas, nube de palabras, velocímetro, barra única, arcoíris, esquemas de Plot o D3 sin validar, coropleta de conteos y cualquier forma que dependa de animación continua. Se admiten los pseudo-3D dibujados en SVG (prismas isométricos, mapas de picos).

**R76. Una línea necesita al menos cinco puntos.** Con dos o tres cortes van flechas, pendiente o dumbbell. *Por qué:* la línea sugiere una continuidad que no se midió.

**R77. La coropleta solo admite tasas.** Los conteos van en burbujas o picos. Dos treemaps lado a lado no se comparan entre sí: se ofrece un año a la vez.

**R78. Las cintas entre dos cortes solo cruzan de una categoría a otra cuando la fuente observa a las mismas unidades en los dos momentos.** Con levantamientos independientes, la cinta une cada categoría consigo misma. *Por qué:* dibujar transiciones que la fuente no mide afirma algo que el dato no dice.

**R79. En las gráficas de unidades, el tamaño de la unidad se fija para que queden entre 600 y 1,500 figuras,** se redondea a 1, 2 o 5 por una potencia de 10 y se escribe en el pie (“cada figura representa 5,000 personas”). Un grupo que no alcanza una figura completa se dibuja parcial o se rotula “menos de N”. Las posiciones se calculan con semilla fija. Un waffle no se deja a 260 px en una columna de 790: va a 440 px con una lista al lado.

**R80. La dispersión se resume con la mitad central y la mediana,** explicadas en palabras llanas (“la cuarta parte”, “el municipio de en medio”). Las marcas de resumen van en un tono más tenue que los datos y con el mismo trazo en todas las figuras del libro. Si la figura muestra dos resúmenes distintos, el texto dice por qué difieren. *Por qué:* la raya de mediana tuvo tres versiones porque competía con los puntos.

**R81. Una curva suavizada va acompañada de los puntos reales y de una frase que explique el suavizado.** El desplazamiento al azar de los puntos usa una semilla mezclada y estable (hash de clave y año). *Por qué:* con la clave tal cual, los municipios de claves seguidas formaban hileras.

**R82. Una clasificación se reduce al menor número de casos que el lector distingue.** *Por qué:* el mapa de aceleración pasó de siete casos a cinco.

**R83. Una gráfica con niveles lleva migas clicables,** guarda el nivel en el mismo filtro que el panel, nombra el residuo no asignado (“Sin variante asignada”) y dice en el globo cuál es el denominador de cada nivel. Título, subtítulo, pie, cifras y tabla cambian con el nivel.

**R84. El dominio de un eje o de una escala de tamaño no depende de un selector secundario ni del acercamiento.** En un mapa de magnitudes la escala es la nacional en todas las vistas, con un tamaño mínimo visible (2 px) y una leyenda que traduce el tamaño a cifras. *Por qué:* con la escala por vista, el pico más alto de cada entidad medía lo mismo y una entidad con pocos hablantes se veía igual que una con muchos.

**R85. Tasa y composición son preguntas distintas.** Al cambiar la pregunta de una sección cambian juntos el título, el ancla del índice, las cifras destacadas, la leyenda y la explicación. En una composición, el denominador no cambia cuando se filtra por un subgrupo.

**R86. Cada año de una serie estimada lleva en el dato una etiqueta de método.** Lo que es arrastre de otra edición se retira. Lo que tiene un dato faltante se dibuja punteado y la leyenda dice cuál y por qué.

**R87. La pérdida o el crecimiento de un grupo se mide en proporción indexada, no en absolutos.** La serie empieza en el primer año con registro, y un cero muestral no se lee como desaparición. *Por qué:* el maya pasó de 718,740 a 774,162 hablantes y a la vez bajó de 1.03 a 0.63 por ciento de la población.

**R88. Un mosaico geográfico usa una rejilla publicada y curada** (`mx_state_grid3` de geofacet) y se cita en Metodología.

**R89. Un mapa que repite al mapa principal arranca en gráfica,** y el mapa queda como opción del filtro.

**R90. Interacción común a todas las formas.** El contorno de hover usa `Plot.pointerX` o `Plot.pointerY` según el eje categórico, con `maxRadius: Infinity`. `Plot.pointer` a secas solo en dispersión. En mapas, el borde base entre polígonos es `stroke: "none"`. Hay una sola escala tipográfica exportada. *Por qué:* `Plot.pointer` empareja por distancia a la punta de la marca y puede resaltar la fila equivocada. Un borde blanco se ve gris por antialiasing.

**R91. Antes de dar por buena una gráfica se cuentan sus marcas reales en el SVG.** Antes de dibujar un mapa se verifica que la llave de agregación tenga la misma longitud que la del geojson. *Por qué:* una gráfica sin error en consola puede seguir vacía.

**R177. Un mapa a pantalla completa con tarjeta flotante encuadra el país fuera de la tarjeta.** La tarjeta y la comparación flotan en una banda fija y el país se encuadra debajo de ella (`marco` de `mapaBase`), con los rótulos esquivando los bloques flotantes. La banda no cambia al elegir un lugar ni una marca, para que el mapa no brinque, y solo crece con un cambio de modo que el lector pidió. El mapa a pantalla completa conserva el menú de Framework, quita el ancho máximo solo en su página (`body:has(.mapa-pantalla)`), cabe sin scroll en 1366 × 768 y 1920 × 1080 y, en el teléfono o en una columna angosta, apila mapa, tarjeta, leyenda y panel sin ocultar nada. *Por qué:* en México, la esquina superior izquierda es Baja California, y una tarjeta encima tapaba los destinos de la frontera (`docs/mapa-flujos.md`).

**R178. En un mapa de flujos, seguir un flujo es un botón explícito y la vista vive en la URL.** Clic, Enter o espacio fijan una flecha, y la tarjeta ofrece «Ver todo lo que llega a…» y «Ver todo lo que sale de…» del otro extremo. Ningún clic cambia de lugar o de sentido por sí solo. Escape suelta. Los lugares del mapa son UNA parada de tabulador con tabindex móvil. La URL guarda solo lo que difiere de la vista inicial y se lee al cargar. *Por qué:* con cambios de modo implícitos el lector perdía la vista que estaba leyendo, y 32 paradas de tabulador alejaban las flechas.

**R179. En un tagged template de htl, un atributo interpolado no se pega a `/>`.** Se escribe `fill=${color} />`, con espacio. *Por qué:* con `fill=${color}/>` el atributo recibe la diagonal (`#0E9384/`), el color es inválido y la marca se pinta en negro sin ningún error (pasó en la leyenda del mapa de flujos).

**R186. El mapa es una vista del filtro, con rangos fijos por indicador y municipio solo con fuente representativa.** Una sección con dato por lugar no lleva un mapa aparte: su panel ofrece «Ver como: Gráfica / Mapa por entidad / Mapa por municipio» (`campoVista` de `src/components/vista-mapa.js`), arranca en la gráfica (R89) y el mapa toma la misma selección (año, edad, sexo, subgrupo). Pinta cinco rangos fijos y desiguales por indicador, declarados una sola vez en la constante `RANGOS` del componente con su medición en comentario (cuantiles de entidades y municipios en todos los años, grupos y subgrupos); las páginas no registran rangos propios ni los calculan sobre la vista. Un subgrupo que con los cortes comunes cae en uno o dos tonos lleva cortes propios en `RANGOS[k].subgrupos`, y la tira de rangos dice cuáles usa. `RANGOS` admite unidad (`"pct"` o `"pesos"`) para pintar montos. El mapa por municipio solo se ofrece con una fuente representativa a ese nivel (un censo o una encuesta intercensal) y, por lo común, sin subgrupo; una encuesta por hogares llega a entidad y una nacional no lleva el campo. Las unidades con menos de 30 casos van con trama, las que no tienen dato en gris con su casilla, y la opción «Diferencia» (`campoPinta`) usa la rampa divergente con el rojo en lo desfavorable, declarado en el comentario de color y en Metodología (R95). *Por qué:* en el libro de discapacidad cada capítulo registraba sus rangos con `RANGOS[k] ??= …` y la poca dificultad para ver (mediana municipal 9.3 %, entidades de 5.2 a 10.6 %) dejaba las 32 entidades en los dos tonos altos con los cortes comunes de su grado.

**R187. Un filtro de subgrupo con grado elige UN subgrupo y compara con quien no está en ninguno.** Cuando la población se parte en subgrupos que se traslapan (tipo de dificultad, lengua, programa) y cada uno tiene un grado, el panel lleva un grupo rotulado con «Subgrupo» y «Grado» (`grupoSubgrupo` de `src/components/subgrupo.js`; el grado se oculta con «Todos los subgrupos» y el panel oculta el grupo entero si no le queda ningún campo visible). Con «Todos» se suman las filas de siempre; con un subgrupo se usan las filas de ese subgrupo y grado contra la referencia «Ninguno», la misma para todos los subgrupos. Las filas de subgrupos distintos nunca se suman ni se comparan contra su suma, un grado de un subgrupo no es la categoría excluyente que publique la fuente con el mismo nombre (se dice en la nota), y se usa un solo nivel geográfico a la vez. Las celdas con menos de 30 casos no se esconden con un subgrupo elegido: se marcan (R149). La metodología lleva un apartado general con la semántica, las filas que no se suman, la referencia y las limitaciones de cada fuente (por ejemplo, una edición que cambió la escala de respuesta o que no pregunta el grado).

**R188. Ninguna forma va más de dos veces en el libro, salvo el mapa.** Antes de entregar se hace el inventario de formas por sección (grep de las llamadas a `components/formas/` en `src/*.md`) y se deja en `docs/formas-por-seccion.md`. Una forma aparece como máximo dos veces, donde sea la mejor respuesta, y nunca en dos secciones seguidas (R73), tampoco entre el final de un capítulo y el principio del siguiente. Las sustitutas son de nivel intermedio o más del catálogo y responden igual o mejor la pregunta; al cambiar una forma no se cambian los datos ni la prosa de apertura y cierre, y sí el pie, la explicación, la tabla si hace falta y el párrafo de Metodología que describe la figura. El mapa como vista del filtro (R186) no cuenta. *Por qué:* en el libro de discapacidad la fracción «de cada cien» salía cinco veces y el dumbbell cuatro; el lector veía la misma figura en casi todos los capítulos.

---

## 7. Color

La tabla de papeles, las declaraciones por capítulo y la lista de prohibiciones listas para copiar están en [`catalogo/colores.md`](catalogo/colores.md). Los valores hexadecimales viven en `src/components/paleta.js`, fuente única.

**R92. Todo color de gráfica sale del módulo de paleta.** Ningún componente ni página escribe un hexadecimal ni un ternario de tema. El módulo declara papeles, no tonos sueltos. *Por qué:* en `perdida-lengua` había 41 literales en un módulo de gráficas, 33 en otro y 37 en las páginas, además de 69 ternarios de tema, de modo que cambiar la paleta no cambiaba el libro.

**R93. Sin morado como color del tema.** Ningún tono de la familia morada, violeta o magenta entra en la paleta como color de serie, de tema, de rampa o de categoría, ni en la hoja de estilos de las gráficas. Única excepción: la esquina «los dos altos» del mapa bivariado (`P.bivariado`), donde el morado sale de mezclar el rojo de un eje con el azul del otro y nunca representa el tema principal. *Por qué:* decisión editorial de noviembre de 2026, que sustituye al morado de una sola tinta de `perdida-lengua` (sección 15). La excepción se aprobó el 17 de noviembre de 2026.

**R94. Los textos visibles no nombran un color escrito a mano.** Si un rótulo o una leyenda dice el color de una marca, el nombre sale de la paleta. *Por qué:* tres textos de `perdida-lengua` decían “barras moradas” y dejan de ser ciertos al cambiar la paleta.

**R95. Rojo y azul llevan significado, y cada capítulo lo declara.** Al inicio de cada página de capítulo, en el código y en su apartado de Metodología, se declara qué significan rojo, azul y gris. La regla se mantiene en todo el capítulo y cambia de significado cuando cambia el tema del capítulo, porque ya no se mide lo mismo. Un capítulo que solo mide niveles declara que no usa rojo ni azul. Ejemplos de declaración en `catalogo/colores.md`.

**R96. Rojo y azul no se usan para nada que no esté en la declaración del capítulo.** Si una gráfica necesita distinguir algo que no es el significado declarado, usa el tono de tema, el gris o el resalte por contorno.

**R97. El tono codifica el signo del estado actual y la intensidad su grado.** El color conserva su significado aunque la aritmética invierta el signo. *Por qué:* en el mapa de aceleración, “pierde, pero más lento” salía en el azul más oscuro aunque el municipio seguía perdiendo. Al dividir dos ritmos negativos, un municipio que perdía salía en azul.

**R98. El gris de “no cambia” lo decide una sola función.** `sentido(a, b, {eeA, eeB, umbral})` devuelve baja, sube o igual y la usan todas las gráficas. Con error muestral, la diferencia es “igual” si no supera 1.96 veces el error combinado. Sin él, si es menor que lo que se escribiría como cero (0.05 puntos). *Por qué:* en `perdida-lengua` el punto neutro se definía de tres maneras según la gráfica.

**R99. Las magnitudes de nivel usan una rampa continua de una sola tinta en el tono de tema,** del claro al oscuro, interpolada en Lab. La serie única, sin comparación, usa el mismo tono. *Por qué:* una rampa de dos tonos (BuPu) duró 23 minutos, porque sus pasos intermedios eran azulados y el azul ya significaba “sube”, y su tono más claro no se distinguía del fondo.

**R100. La presencia va en rampa continua con dominio fijo de 0 a 100,** la misma en todas las figuras que se comparan. No se pinta con rangos fijos ni con cortes calculados (cuantiles, Dalenius-Hodges). Sustituye a la regla anterior de rangos fijos y desiguales (sección 15).

**R101. El dominio de toda rampa es una constante del módulo de paleta, elegida midiendo.** Se cuenta cuántos valores quedan fuera y qué porcentaje de la rampa usa el rango real. Si el máximo real queda lejos del tope natural, el extremo se rotula “N o más” (`TOPE_REPARTO = 15`, con máximo real de 13.9 por ciento). El dominio es igual con cualquier filtro. *Por qué:* con el tope calculado sobre la vista, el mismo valor cambiaba de tono al filtrar.

**R102. El color de una celda codifica la misma cifra que la celda imprime.** Una magnitud sin punto medio usa rampa secuencial, no divergente. *Por qué:* en el heatmap de edades “0.53 salía gris, 0.63 azul y 0.54 rojo”, y la leyenda no se podía leer contra la cifra.

**R103. La rampa va por valor, no por posición ni por calendario.** El tono más oscuro cae en el valor más alto de la vista, no en el año más reciente.

**R104. La rampa divergente lleva el centro en gris,** no en el color del fondo, y cuando mide distancia a un promedio se ancla en esa referencia con `symmetric: false`. *Por qué:* el fondo ya significa “sin dato”.

**R105. “Sin dato” y “atenuado” son grises con nombre propio** (`SIN_DATO`, `APAGADO`) y van fuera de la rampa. El residuo de un treemap y lo atenuado comparten el mismo gris.

**R106. El color se asigna por categoría o por entidad, nunca por posición en la lista ni por frecuencia en la vista.** El orden sale de la selección del lector y de una lista fija del módulo. *Por qué:* con un umbral en cero quedaban dos categorías y la segunda heredaba el color de la tercera. Ordenar por frecuencia hacía que añadir un grupo recoloreara a los anteriores.

**R107. Las categorías sin orden usan como máximo tres tonos más gris para “Otras”.** *Por qué:* ningún cuarto tono pasó el validador de daltonismo con todos los pares en modo oscuro.

**R108. Resaltar es contorno u opacidad, nunca otro color.** Lo elegido conserva su tono y gana un trazo. Lo demás baja a gris de fondo, y el contexto lejano a opacidad 0.11.

**R109. Leyendas.** Una magnitud continua lleva leyenda continua (`Plot.legend` con `type: "linear"`), sin el signo de porcentaje en las marcas cuando el título ya lo dice. Una clasificación ordenada lleva una tira ordenada, de lo peor a lo mejor, con el rótulo bajo cada tono. “Sin dato” va en una casilla aparte con borde y nombra las dos razones posibles (“Sin dato o bajo el filtro”). La leyenda solo lista marcas que existen en la figura. Las tiras y las leyendas de marcas se construyen con un solo componente. *Por qué:* el mismo marcado de tira estaba construido en cuatro lugares, y había cinco leyendas hechas a mano.

**R110. Contraste dentro de la figura.** Las cifras en gris usan el gris de texto, no el de las líneas. Los puntos sobre una franja gris llevan borde un paso más oscuro. El texto sobre relleno elige tinta clara u oscura por luminancia. *Por qué:* el gris de las líneas no da 4.5:1.

**R111. El rojo de interfaz lleva un solo acento por bloque.** Va en el botón principal relleno, el antetítulo, el número de sección, la cifra principal, la palabra clave de algunos h1 y los estados activos. El texto rojo chico sobre gris usa `#c4101b` en claro y `#f27076` en oscuro. *Por qué:* `#e30a18` sobre `#f6f6f6` da 4.495:1 y no pasa.

**R112. Modo oscuro.** Toda rampa y toda paleta categórica tiene su variante oscura dentro del módulo, que las muta en sitio al cambiar de tema. Cada sección se suscribe al cambio y se vuelve a dibujar. La tapa, la portada y las placas de logo no se invierten. *Por qué:* seis paletas de `perdida-lengua` eran iguales en los dos temas y el resto se resolvía con ternarios fuera del módulo.

**R113. Toda paleta categórica de tres o más series se valida con `validate_palette.js`** en modo claro y en modo oscuro, nunca a ojo. `verificar:paleta` valida las paletas que el libro dibuja de verdad. *Por qué:* el verificador de `perdida-lengua` pasaba, pero ninguna de sus seis paletas correspondía a una gráfica publicada. Un tono de croma bajo se lee gris para cualquier persona.

**R114. Prohibiciones de color.** Lista completa en `catalogo/colores.md`, sección 5. Las principales: morado, hexadecimales fuera del módulo, esquemas de Plot o D3, arcoíris, rosa y azul para el sexo, dominio calculado sobre la vista, rojo o azul sin significado declarado, `stroke: "#fff"` entre polígonos y colores de estado para pintar un grupo.

**R114a. El tono de tema se elige comparando en la página «Muestra de colores»** (`/colores`), no a ojo ni con una muestra suelta. Ahí cada propuesta de `src/components/paletas-propuestas.js` se ve sobre las mismas cinco gráficas, en claro y en oscuro, con el resultado del validador calculado en el build (incluido si el rojo de «desfavorable» se confunde con la rampa o la serie). Una propuesta nueva se añade a ese módulo, se borra la caché de su loader (`src/.observablehq/cache/data/paletas-propuestas.json`) y se compara; la elegida pasa a `TONOS` de `paleta.js` y a `LIBRO.tono`. Desde el 19 de noviembre de 2026 el tono por omisión es `rojoIbero` (propuesta A, elegida en «Paletas rojo Ibero»): serie #c4101b / #ee5a5f, rampa de una tinta del rosa al rojo profundo, trío rojo, azul petróleo y dorado, y gris de comparación #9a978f / #5c5b56; `rojoGrafito` (B) es la alternativa con la comparación en grafito. Con un tono rojo la serie ES el rojo semántico por decisión (`rojo: true` en `TONOS`): en brecha o cambio, donde no aparece la serie, el rojo sigue marcando lo desfavorable; donde conviven serie y signo, el signo se dice con la flecha y con azul o gris. Del 18 al 19 de noviembre el tono fue `petroleoIbero`, con su rampa de nueve pasos y el trío petróleo, ocre y verde. Con el rojo Ibero como «desfavorable», solo los verdes azulados de matiz 165° a 195° pasan todas las comprobaciones obligatorias en los dos temas (barrido de 55° a 215°, noviembre de 2026): los ocres y los verdes pino se confunden con el rojo con daltonismo, y los azules tinta, con el azul de «favorable». *Por qué:* una rampa que se ve bien sola (OrRd de ColorBrewer) termina en el mismo rojo que «desfavorable», y eso solo se nota con las dos gráficas a la vista y medido.

---

## 8. Globos

**R115. Todo globo sale de una sola función, `globo()`, con papeles declarados por nombre.** La misma función entrega las opciones para Plot y el HTML equivalente para las gráficas que no pasan por Plot (treemap, SVG propio, mapas de teselas). Ninguna gráfica usa `<title>` nativo ni arma su tarjeta a mano. *Por qué:* en `perdida-lengua` convivían seis maneras de construir un globo, y la jerarquía se deducía con una expresión regular y con prefijos escondidos en los rótulos, de modo que un renglón “Año 2020” caía al pie por empezar con un dígito.

**R116. El globo lleva tres renglones, siempre en este orden, y nada más.**

| # | Renglón | Contenido | Estilo | Obligatorio |
| --- | --- | --- | --- | --- |
| 1 | Grupo | La serie o categoría de la marca, con la muestra de su color: “Con discapacidad”. Si el grupo no basta para saber qué marca es, su nombre va delante en el mismo renglón: “Oaxaca · Con discapacidad” (R123) | Gris, con muestra | Sí |
| 2 | Cifra | El porcentaje, o el valor del indicador cuando no es un porcentaje: “16.3 %”, “−5.0 puntos”, “$8,412”, “61 de cada 100”; junto, el margen de error “± 1.2” (R125) | Grande, extra negrita, en el color de la serie o del signo; el margen chico y tenue | Sí; el margen, cuando hay error estimable |
| 3 | Población | Numerador de denominador, expandidos, y el universo en dos o tres palabras: “6,313 de 69,410 personas con discapacidad” (R117) | Tenue | Sí, salvo pesos, horas, índices y cambios (R119, R120) |
| 4 | Aviso | “Estimación poco precisa: pocos casos en la muestra” | Gris chico, con línea punteada arriba | Solo si la estimación es poco precisa (R125) |

No van en el globo el lugar y el año elegidos en el panel (ya los dice el subtítulo de la figura), la frase que explica qué es la cifra y sobre qué denominador (va en el subtítulo y en “¿Qué quiere decir este análisis?”) ni la comparación con otro grupo, otro año o una referencia (va en la tabla y en la gráfica misma). `globo()` rechaza con un error los campos retirados (`donde`, `cuando`, `frase`, `comparacion`, `apellido`) y `verificar:render` falla si la tarjeta trae otro renglón. *Por qué:* con seis renglones el globo repetía lo que ya estaba escrito arriba de la gráfica y la cifra quedaba enterrada a media tarjeta. El lector del libro de discapacidad pidió “solo el grupo, el porcentaje y debajo la población, para que sea más fácil de leer” (noviembre de 2026, lección 131).

**R117. La población es el numerador sobre su denominador, los dos expandidos, y el sustantivo final nombra el universo en dos o tres palabras:** “6,313 de 69,410 personas con discapacidad”. El numerador son quienes cumplen, no el universo, y el universo acompaña con “de”. El sustantivo que cierra el renglón dice a qué total se refiere el segundo número. Cuando el denominador es uno de los grupos comparados, se nombra ese grupo: “personas con discapacidad”, “personas sin discapacidad”, “mujeres”, “hombres”, “hogares con personas con discapacidad”, “hablantes”. Cuando la marca es un lugar y el grupo ya está en el primer renglón, o el total es toda la población del lugar, se nombra a sus habitantes: “26,116 de 585,091 habitantes” en un mapa municipal. Cuando el total es un subconjunto que la gráfica define (las personas con una dificultad, las que dejaron la escuela, las que respondieron), se nombra con lo mínimo que lo distingue: “personas con esa dificultad”, “personas que respondieron”. “Personas” a secas queda para lo que no admite nada más corto ni más claro. Nunca se juntan edad, grupo y lugar: “personas sin discapacidad de 5 años o más del estado de Aguascalientes” es demasiado texto, y la edad y el lugar ya los dice el subtítulo. En `globo()` el sustantivo es el campo `unidad`, fijo o función del dato, con “personas” por omisión; `verificar:render` falla si el renglón trae una edad o más de cinco palabras después del segundo número. *Por qué:* de los 23 globos publicados en `perdida-lengua`, seis mostraban solo el universo y cuatro no mostraban personas. En el libro de discapacidad, “N de M personas” no decía de qué total salía M, y el lector pidió “x de y personas con discapacidad o x de y personas sin discapacidad […] pero de forma sencilla” (noviembre de 2026, lección 131).

**R118. La cifra del globo es la misma estadística que dibuja la marca, con su unidad escrita.** Lo que significa y sobre qué denominador se calcula se dice una vez, en el subtítulo de la figura y en el desplegable de explicación, y sigue al filtro allí. *Por qué:* la frase repetida en cada globo crecía con cada filtro (“de las personas con discapacidad de 15 a 29 años que usan internet …”) y alargaba la tarjeta sin decir nada que no estuviera escrito encima.

**R119. Cuando la unidad de análisis no son personas, la población se escribe en esa unidad:** “1,234 de 10,032 hogares”, “102 de 364 variantes”. En pesos, horas, años de escuela e índices el renglón de población se omite, porque ahí el numerador es masa de dinero o de tiempo.

**R120. En un cambio entre dos años o en una diferencia entre dos grupos, la cifra es el cambio en puntos** y no lleva renglón de población: cada extremo tiene su propio numerador y su propio universo, y los dos van en la tabla. La diferencia entre dos porcentajes nunca lleva el signo de porcentaje.

**R121. La cifra grande es siempre el porcentaje o el valor, nunca el conteo, también en las gráficas que dibujan conteos** (multitud de figuras, flechas, burbujas, cintas): la cifra es la parte que representa la marca y el conteo va debajo, como “N de M personas”. Solo cuando no existe denominador (el saldo de un flujo, un nodo de una red) la cifra es el conteo con su unidad, “1,234 personas”, y no hay renglón de población. *Por qué:* en “Cuántas y dónde” el globo abría con 108,679,150 en grande y el 83.7 % quedaba en el último renglón; el lector buscaba el porcentaje.

**R122. La cifra toma el color de la marca:** el de la serie cuando hay series, y el rojo, azul o gris del signo cuando la gráfica mide un cambio. *Por qué:* solo uno de los 23 globos pintaba la cifra con el color de su serie.

**R123. El nombre de la marca va en el renglón del grupo solo cuando el grupo no la identifica,** delante del grupo y separado por un punto medio: la entidad en un mapa o en una rejilla de entidades (“Oaxaca · Con discapacidad”), la fila de una celda de un mapa de calor (“Dificultad para caminar · Por enfermedad”), el año cuando la vista muestra varios (“2020 · Con discapacidad”) o el tramo de edad de una serie por edad. Se declara con el campo `marca` de `globo()`. El lugar y el año del panel no van nunca: son iguales para todas las marcas. Los rótulos no llevan dos puntos.

**R124. No hay renglón de comparación.** La otra serie, el otro año o el promedio de referencia se leen en la gráfica y en la tabla. *Por qué:* con la comparación, el globo crecía demasiado y competía con la cifra.

**R125. El margen de error va junto a la cifra del globo, chico y tenue, y también en la tabla.** Es 1.96 veces el error estándar (95 %), en la unidad de la cifra y con sus mismos decimales: “16.3 % ± 1.2” (puntos porcentuales), “$8,412 ± $310”; bajo 0.05 se escribe “± <0.1”. En `globo()` es el campo `ee` (en la unidad de `valor`; si falta, se toma de `precision`). Sin error estimable no se pinta nada, nunca “± 0”. Los conteos no llevan margen, y una diferencia solo si el código ya calcula su error. No van en el globo el intervalo completo, los casos de muestra, el desglose del denominador ni las notas de método. Si la estimación es poco precisa, el globo añade al final un renglón corto: “Estimación poco precisa: pocos casos en la muestra”. *Por qué:* el lector pidió ver el error al pasar el mouse (noviembre de 2026, C32). La norma anterior lo sacaba del globo porque 14 de los 23 globos de `perdida-lengua` lo llevaban pegado a la cifra grande, sin unidad y con decimales de más; por eso ahora va separado, tenue y con los decimales de la cifra.

**R126. Toda marca tiene globo.** Las gráficas con celdas, tramos o cintas lo llevan en cada marca, no solo en una columna auxiliar. Una marca enfocable con el teclado se anuncia con los mismos renglones del globo, en el mismo orden (`textoGlobo()`): grupo, cifra, población y aviso. *Por qué:* las celdas del heatmap de edades imprimían el porcentaje y no había forma de saber cuántas personas eran.

**R127. Formatos únicos, definidos una vez en el módulo base.** Ninguna página ni componente define una copia local.

| Tipo | Regla | Ejemplo |
| --- | --- | --- |
| Porcentaje | Un decimal si es 0 o si es 1 o más. Dos si es 0.1 o más. Tres si es menor. Espacio antes de `%` | `12.3 %`, `0.42 %`, `0.037 %` |
| Porcentaje que redondea a cero | Texto, nunca `0.000 %` | `menos de 0.001 %` |
| Cambio en puntos | Signo siempre, misma regla de decimales y la palabra escrita | `−5.0 puntos` |
| Cambio relativo | Signo siempre y `%` | `+12.4 %` |
| De cada cien | Entero | `61 de cada 100` |
| Personas | Entero completo con coma de miles, nunca abreviado, con la unidad escrita | `1,234 personas` |
| Personas con universo | Numerador, “de”, universo y unidad | `1,234 de 10,032 personas` |
| Dos años (tablas y textos) | Flecha entre los dos valores | `1,234 → 1,180 personas` |
| Año | Identificador, sin separador | `2020` |
| Sin dato | Un solo texto en todo el libro | `Sin dato` |

*Por qué:* la regla de decimales estaba escrita cuatro veces con diferencias, había tres maneras de escribir a las personas y cuatro de decir que no hay dato. “0.000 %” se leía como nadie y podían ser cientos de personas.

**R128. El globo pertenece a la marca bajo el puntero.** Se separa la captura (puntos densos dentro de cada tramo) del ancla (centro de la marca). Una figura tiene un solo puntero aunque tenga dos tipos de marca. La tarjeta se elige por la posición del puntero, no por el último globo abierto. *Por qué:* con `Plot.stackX` el globo se anclaba lejos del tramo señalado, dos punteros abrían dos globos a la vez y aparecía el globo de otra gráfica lejana.

**R129. Jerarquía visual medida.** La cifra va a 24 px en extra negrita y cumple 3:1 como texto grande. Los rótulos cumplen 4.5:1. La tarjeta es la misma en todas las formas y en los mapas.

### Ejemplos

Las cifras de los ejemplos ilustran el formato y no son datos publicados.

Correcto, nivel con series (el lugar y el año están en el subtítulo de la figura):

```text
● Con discapacidad
9.1 %
6,313 de 69,410 personas con discapacidad
```

Correcto, el grupo de la marca reparte a toda la población (el universo son sus habitantes):

```text
● Sin dificultad en ninguna actividad
83.7 %
108,679,150 de 129,794,220 habitantes
```

Correcto, marca que el grupo no identifica (un estado en un mapa con dos series):

```text
● Oaxaca · Con discapacidad
12.3 %
1,234 de 10,032 personas con discapacidad
```

Correcto, municipio en un mapa de una sola medida (el universo es el lugar):

```text
● Tlaxiaco, Oaxaca
4.5 %
26,116 de 585,091 habitantes
```

Correcto, serie con varios años:

```text
● 2020 · Mujeres
41.6 %
240,567 de 495,401 mujeres
```

Correcto, hogares:

```text
● Con personas con discapacidad
38.2 %
1,234 de 3,230 hogares con personas con discapacidad
```

Correcto, cambio entre dos años (la cifra en el rojo del signo, sin población):

```text
● Tecpatán, Chiapas · Baja
−5.0 puntos
```

Correcto, unidad distinta de personas:

```text
● Riesgo alto
28.0 %
102 de 364 variantes
```

Correcto, pesos (sin población):

```text
● 2024 · Con discapacidad
$8,412
```

Correcto, estimación poco precisa:

```text
● Guerrero · Por violencia
4.2 %
3,150 de 75,000 personas
Estimación poco precisa: pocos casos en la muestra
```

Incorrecto, y por qué:

| Lo que se ve | Defecto | Corrección |
| --- | --- | --- |
| `Todo el país · 2025` arriba del grupo | Repite el subtítulo de la figura | Se quita (R116) |
| `personas no tienen ninguna dificultad` debajo de la cifra | Frase del denominador repetida en cada globo | Va en el subtítulo y en la explicación (R118) |
| `108,679,150` grande y `83.7 % de la población` al pie | La cifra grande es el conteo | `83.7 %` arriba y `108,679,150 de 129,794,220 personas` debajo (R121) |
| `2010: 15.2 %` o `Sin discapacidad: 4.1 %` al pie | Renglón de comparación | Se lee en la gráfica y en la tabla (R124) |
| `Año 2020` como renglón aparte | El año se separa de la marca y alarga la tarjeta | `2020 · Con discapacidad`, solo si la vista muestra varios años (R123) |
| `12.3 % ± 0.059` | Margen con más decimales que la cifra | `12.3 % ± 0.1`, tenue y separado de la cifra (R125) |
| `Niños con madre hablante: 10,032` | Da el universo, no cuántos cumplen | `6,120 de 10,032 niños` (R117) |
| `6,313 de 69,410 personas` en la serie con discapacidad | No dice a qué total se refiere el segundo número | `6,313 de 69,410 personas con discapacidad` (R117) |
| `6,313 de 69,410 personas sin discapacidad de 5 años o más del estado de Aguascalientes` | Junta grupo, edad y lugar | `6,313 de 69,410 personas sin discapacidad`; la edad y el lugar van en el subtítulo (R117) |
| `0.000 %` | Se lee como nadie | `menos de 0.001 %` (R127) |
| `–`, `s/d`, `sin dato` | Cuatro textos para lo mismo | `Sin dato` (R127) |
| `1.23 M` | Abreviado y sin unidad | `1,230,000 personas` (R127) |
| `−5.0` | Falta la unidad del cambio | `−5.0 puntos` (R120) |
| Cifra del cambio en tinta | No lleva el color del signo | Rojo, azul o gris según `sentido()` (R122) |
| Globo nativo del navegador en una cinta | No pasa por `globo()` | Tarjeta común (R115) |

---

## 9. Textos, explicación, metodología, fuentes y verificación

**R130. Los textos de los análisis describen, no concluyen.** Aplica a títulos, subtítulos, pies, notas, cifras destacadas, globos y explicaciones. No se escriben frases que adelanten una lectura (“la caída no es de unos pocos sistemas”) ni la estructura “no es X, es Y”.

**R131. Tipografía del texto visible.** Sin punto y coma. Sin comillas angulares: se usan comillas curvas “ ”. Sin guiones largos como paréntesis (los rangos de años llevan guion corto con espacios). Las frases con dos puntos y paréntesis se parten en frases cortas.

**R132. Vocabulario.** El texto visible no usa el nombre técnico de la gráfica ni la jerga del equipo (“tablero”, “waffle”). Se escribe “Qué parte de…” en lugar de “El porcentaje de… que”. Los grupos de población se nombran con el término respetuoso (“pueblos indígenas”, no “grupos originarios”). Se nombra una sola fuente, la oficial. El proceso propio de datos es infraestructura y no aparece en el texto visible. *Por qué:* sustituciones sistemáticas de la revisión de `perdida-lengua`.

**R133. Cada explicación lleva un ejemplo con números** (“Si pasó de 30 % a 25 %, el cambio es −5 puntos”).

**R134. “¿Qué quiere decir este análisis?” es conciso y sencillo.** Un párrafo, o dos o tres en las secciones más complejas, que dice qué se preguntó, qué es cada marca, cómo se lee y cuál es el denominador. No explica el método. Termina con un botón “Cómo se calculó, en la Metodología →” que lleva al ancla de su apartado. *Por qué:* los desplegables de dos o tres párrafos mezclaban la lectura con umbrales de muestra, supuestos y suavizados.

**R135. Lo complejo vive una sola vez, en Metodología.** La página se organiza en apartados con ancla (`<h2 id="m-…" class="toc-anchor">`), agrupados por método compartido y no uno por análisis, cada uno con un antetítulo que dice a qué análisis sirve. Hay además apartados transversales: fuentes y universos, márgenes de error, geografía y significado de los colores por capítulo. Cada supuesto va con un ejemplo numérico llano, su prueba con cifras y las alternativas que se descartaron. Cada página de capítulo declara un mapa de sección a ancla. Todo cambio en una gráfica actualiza su apartado en el mismo cambio.

**R136. Cada análisis lleva el bloque “Fuentes y verificación”.** Dice contra qué tabla oficial se cotejó la cifra central y el resultado calculado. Si no hay tabla oficial equivalente, dice “Verificación pendiente” y da la referencia más cercana. Una verificación nunca se inventa. El bloque no repite las fuentes de datos. *Por qué:* con tres filas por bloque, los censos se repetían en las 22 gráficas.

**R137. Las fuentes de consulta se comprueban antes de citarlas.** Se confirma que la URL baja, se localiza la tabla o figura exacta donde está la cifra y se anotan las diferencias de definición. Las referencias van por id desde `fuentes.csv`, los cotejos en `verificaciones.csv`, y `verificar_fuentes.py` corre en cada build. Se prueban por separado la página, el PDF y el archivo de datos antes de declarar que una fuente está bloqueada.

**R138. Las fuentes de datos se citan una vez, en Referencias.** En APA, una entrada por programa estadístico, con su `id`, el nombre institucional de la época y la URL visible. Las publicaciones consultadas van en una lista aparte de la misma página. Las entradas llevan sangría francesa y se resaltan con `li:target`.

**R139. Las citas del texto enlazan a su referencia:** `<a class="cita" href="./referencias#id">Autor, año</a>`.

**R140. La introducción y la apertura de un capítulo son prosa del equipo académico,** en bloque de lectura (ancho de 46 rem, serif a 1.08 rem, interlínea de 1.65) y con citas enlazadas. La regla R130 no aplica a esa prosa, que sí argumenta. Al entrar la prosa se quita la entradilla.

**R181. En la prosa solo van cifras publicadas, con su referencia.** La introducción, la apertura y el cierre de cada capítulo citan únicamente cifras que la fuente oficial publica (comunicado, tabulado, presentación de resultados), cada una con su cita enlazada a Referencias. Las cifras que salen de los análisis propios del libro (cruces, estandarizaciones, cálculos sobre microdatos que la fuente no publica) no van en el texto: se ven en la gráfica, el globo y la tabla, donde el lector las explora por sí mismo. *Por qué:* una cifra propia puesta en la prosa adelanta una lectura y sesga a la persona lectora antes de que mire los datos (decisión del usuario, noviembre de 2026).

**R141. Hay un glosario único de indicadores,** con el sentido y la definición de cada uno por id de selector, que consumen todas las páginas.

---

## 10. Datos y estadística

**R142. Antes de diseñar un panel se inventaría qué publica cada fuente y a qué nivel.** Lo que la fuente no capta define los niveles del panel. Lo que no existe se ofrece como inferencia rotulada o no se ofrece, y se plantea antes de escribir código.

**R143. Cada fuente conserva su definición y no se homologa lo que no es homologable.** Las ediciones cuya categoría o instrumento cambió no se unen con una línea ni se presentan como serie: van en bloques separados, cada uno con su nota. Si se compara, se hace sobre la lista común de categorías y se dice. La unidad se nombra tal como la fuente la mide. *Por qué:* un instrumento pasó de 9 a 15 opciones de causa entre dos levantamientos, y una categoría cambió de definición entre ediciones de la misma encuesta.

**R144. Los códigos se verifican contra los microdatos, no contra el nombre de la columna.** Las escalas se invierten entre ediciones, el sexo no siempre es 1 y 2, y una columna de porcentaje puede venir en proporción. El mapeo de una variable se confirma cruzándola con otra. Las columnas se identifican por su catálogo. Cada pregunta tiene su universo, y una celda vacía no es un “no”.

**R145. La definición oficial de un indicador se descubre cotejando, y donde la fuente oficial publica la cifra, manda la oficial.** El cálculo propio se queda para lo que no se publica, con una columna que diga de dónde viene cada valor. *Por qué:* con la pregunta de uso sola, “usa celular” salía 4.5 puntos arriba de la cifra oficial.

**R146. Con factor de expansión, el globo muestra población, no casos de muestra.** La población es el numerador (quienes cumplen), no el denominador. Los casos sin expandir van en la tabla, junto con la población que cumple y la población total. Los datos viajan con numerador, denominador, error y casos.

**R147. Nunca se promedian tasas ni se suman ediciones.** Se suman numerador y denominador y luego se divide. Los años se comparan en facetas.

**R148. El margen de error se calcula con el diseño muestral, nunca con la fórmula binomial.** Linearización de Taylor con varianza entre unidades primarias de muestreo dentro de estrato. Cuando la varianza no es estimable, la columna va vacía, nunca en cero. *Por qué:* el efecto de diseño medido fue 2.20. La fórmula binomial subestimaría el error en un tercio, y un cero se lee como certeza absoluta.

**R149. Las celdas poco precisas se marcan o se agrupan.** Con menos de 30 casos de muestra la marca se dibuja con trama y asterisco, y el globo añade el renglón de R125. Antes de dibujar un flujo o un municipio se fija un mínimo de casos sin expandir y lo que queda por debajo se agrupa en “otros”, con el umbral declarado en la explicación.

**R150. El ×100 se decide por el formato del indicador.** En medias (ingreso, horas, gasto) el cociente ya es la cifra final. El formato viaja por toda la cadena de componentes. Antes de aprobar una media se lee en voz alta con su unidad. *Por qué:* se publicó “3,489 horas a la semana” sin que nada fallara.

**R151. Los montos de varias ediciones van deflactados, o no se comparan.** Se usa el índice de precios del periodo de levantamiento, desde un CSV versionado con su fuente. Si falta un índice, el loader aborta. Las brechas y razones no cambian con el deflactor, y al reportar el ajuste se dice.

**R152. Un dato que no existe es `null` y se rotula “Sin dato”, nunca cero.**

**R153. Tras tocar un loader se corre `npm run clean && npm run build`.** *Por qué:* la caché de Framework puede tener marca de tiempo posterior al loader y el build no lo vuelve a ejecutar.

**R154. El peso del sitio se arregla partiendo archivos, no comprimiendo.** Cada página carga solo los datos de su capítulo. Los archivos que ninguna página lee no se versionan. *Por qué:* partir los desgloses por tema bajó una página de 72.5 a 14.9 MB.

**R155. Antes de cruzar dos fuentes por una llave geográfica se comprueba que ambas desagregan** (`sort -u` sobre la columna). *Por qué:* una fuente que solo trae el total nacional no cruza con nada y la sección sale vacía sin error.

**R156. Un superlativo temporal se comprueba con la serie completa y su ventana de comparabilidad,** y la diferencia tiene que superar el error de medición. De lo contrario, lo correcto es “empata con”.

---

## 11. Descargas

**R157. El botón de descarga exporta la figura, no el SVG de la gráfica.** Incluye título, subtítulo con los filtros, leyenda, rótulos de referencia, pie y crédito. Formatos: PNG a 2x y SVG. Nunca JPG. *Por qué:* el JPG deja halos en texto y líneas finas.

**R158. La descarga es una copia fiel de la figura en pantalla.** Coloca cada SVG en su posición real, mide cada texto HTML con `Range.getClientRects()` para conservar el corte de línea, copia fuente, tamaño, peso, color y espaciado, y dibuja fondos y bordes. Omite los botones y los globos. Toma las coordenadas del contenido, no de la parte visible. No se reconstruye la figura con otra lógica. *Por qué:* la versión que reconstruía dejaba la columna de tendencias debajo del heatmap, apilaba los paneles lado a lado y perdía las leyendas HTML.

**R159. Las fuentes del sitio se incrustan en el SVG como `data:` URL.** *Por qué:* un SVG abierto como imagen no ve las fuentes de la página y la descarga salía con la fuente del sistema.

**R160. El crédito vive en una sola constante:** “Social Data IBERO, Universidad Iberoamericana”, separado de la figura por una línea y con margen de 24 px.

**R161. El nombre del archivo descargado deriva del nombre del producto.** *Por qué:* en `perdida-lengua` llevaba un prefijo fijo escrito en el componente.

---

## 12. Rendimiento y compatibilidad

**R162. Cada análisis se dibuja al acercarse a la pantalla.** Un observador de un solo disparo, con margen de unos 1,200 px y alto reservado (520 px), ejecuta el dibujo la primera vez. Hasta entonces la sección no dibuja aunque cambien los filtros, el tema o el ancho, pero los filtros sí se sincronizan. Las anclas del índice son HTML estático y no dependen del dibujo. *Por qué:* una página dibujaba sus 17 análisis al abrir, con 4 s de trabajo antes de poder moverla.

**R163. Los datos se cargan en tandas por celda.** La primera celda trae lo que necesitan las primeras secciones. Los archivos pesados van en una segunda celda que espera a la primera y a que el navegador quede libre.

**R164. Dentro de una celda de Framework, toda API que no exista en todos los navegadores se invoca como propiedad de `window`,** tanto en la detección como en la llamada (`window.requestIdleCallback`). *Por qué:* con el nombre suelto, Framework lo toma como una entrada de la celda. En Safari la celda entera fallaba y con ella ocho secciones.

**R165. Antes de entregar se abre el sitio en Safari o en WebKit de Playwright.** Una celda que falla se lleva consigo todas las secciones que dependen de ella.

**R166. La lentitud se mide antes de arreglarla.** Se perfila la carga con red limitada y se compara el resultado carácter por carácter después del arreglo.

**R167. Las animaciones corren una sola vez.** Entran con un `IntersectionObserver` que se desconecta y quedan quietas en su estado final. Con movimiento reducido se muestran directo en ese estado. Un cambio de filtro no vuelve a animar. Sin bucles no hace falta botón de pausa. La entrada cambia solo la opacidad: nada de `transform`, `translate`, `top` ni `margin`, porque un bloque que se mueve al dibujarse por encima de la vista confunde el anclaje de scroll de Chrome y la página brinca al subir (`docs/scroll-bug.md`). Una reserva de alto se suelta después de dibujar, no antes.

**R168. `FileAttachment` es estático.** Un archivo que todavía no existe rompe el build, y Framework solo copia a `dist/` lo que se referencia con `FileAttachment`.

**R180. Con `pages` explícito en la configuración, el `pager: false` del front matter no saca a la página de «anterior» y «siguiente».** Se declara en la lista de páginas (`pager: false` en `scripts/paginas.mjs`, que pasa `pager: null` al menú). *Por qué:* el mapa a pantalla completa con `pager: false` seguía pintando el paginador y la página tenía 242 px de scroll.

---

## 13. Accesibilidad, verificadores y entrega

**R169. La batería completa corre sobre `dist/` con un navegador real, y esto es lo que debe dar.**

| Verificador | Qué corre | Qué debe dar |
| --- | --- | --- |
| `npm run clean && npm run build` | Build desde cero | Sin errores ni avisos de archivo faltante |
| `verificar:render` | Cuenta marcas reales por SVG en cada página, busca desbordes y los colores por omisión de Plot, y comprueba que la lista de colores cambie entre temas | Ninguna gráfica vacía, sin desborde, ningún color fuera de la paleta |
| `verificar:filtros` | Cambia cada control y compara la huella del dibujo, con posiciones | Todo control cambia la huella. Ningún campo oculto se pinta |
| `verificar:a11y` | axe-core (WCAG 2.1 A y AA) en cada página y en los dos temas, nombres accesibles y teclado | Cero `serious` y cero `critical` |
| `verificar:paleta` | `validate_palette.js` sobre las paletas que el libro dibuja, en claro y en oscuro | Todas pasan |
| `verificar:quieto` | Recorre el final de cada sección con panel pegajoso en 1366 × 768 y 1920 × 1080 | Cero cambios de clase y de `scrollY` |
| `verificar:scroll` | Sube y baja con la rueda por cada página, sobre las figuras grandes y con movimiento activado y reducido | Cero pasos bloqueados y cero saltos al revés |
| `verificar_fuentes.py` | Coteja `fuentes.csv` y `verificaciones.csv` | Toda referencia resuelve y todo cotejo tiene resultado o “pendiente” |
| WebKit | Abre cada página en Safari o WebKit de Playwright | Sin errores de celda |
| Capturas | Cada sección en claro, oscuro, escritorio y 390 px | Revisadas a ojo, una por una |
| Anchos | 1920, 1366, 1024 y 390 px | Sin scroll horizontal |

**R170. Al copiar la Plantilla, lo primero es poner al día las listas de los verificadores:** páginas, paletas y controles. *Por qué:* en `perdida-lengua` dos de los cinco verificadores seguían apuntando a las páginas de otro proyecto, uno recorría una lista vacía, y por eso ni el dibujo diferido ni la falla de Safari tuvieron una prueba que los cubriera.

**R171. Lo que el libro no usa se borra antes de empezar:** componentes, dependencias, hojas de estilo, imágenes y datos heredados.

**R172. `verificar:todo` incluye todos los verificadores,** también `verificar:quieto`.

**R173. Un verificador que cuenta marcas recorre la página antes de contar,** para que las secciones de dibujo diferido se pinten.

**R174. Los defectos de accesibilidad del marco de Framework se corrigen en el script de arranque del `head`:** `lang` sin declarar, grises derivados con `color-mix` entre 3.9 y 4.5:1, enlaces rojos sin subrayar en párrafos, interruptor del menú sin nombre y `<g aria-label>` de Plot sin rol. Un `color-mix` con transparencia para texto solo se valida midiendo.

**R175. Las figuras decorativas llevan `aria-hidden` y la figura completa un `aria-label` con las cifras.** Los globos de SVG propio abren con el cursor y con el teclado.

**R176. Se publica desde la copia de pruebas.** Se clona el repositorio real en una carpeta temporal, se copia encima la copia de trabajo (sin `node_modules`, `dist`, caché ni datos crudos), se revisan archivos nuevos y borrados, se buscan credenciales y archivos de más de 20 MB, y se comprueba que el remoto es ancestro. Primero al espejo personal. Al repositorio del equipo, solo con permiso explícito en cada entrega.

---

## 14. Defectos conocidos que no se heredan

Condiciones encontradas en `perdida-lengua` que son previas a las correcciones de la revisión, o que quedaron sin corregir. La Plantilla no debe traerlas, y un libro nuevo se revisa contra esta lista.

| # | Defecto | Regla que lo impide |
| --- | --- | --- |
| D1 | Dos verificadores apuntan a páginas de otro proyecto y uno recorre una lista vacía | R170 |
| D2 | `verificar:paleta` valida seis paletas que el libro no dibuja y ninguna de las que sí dibuja | R113 |
| D3 | `verificar:todo` no incluye `verificar:quieto` | R172 |
| D4 | El módulo base documenta y exporta la rampa descartada, y la rampa vigente está definida dentro de una página | R92 |
| D5 | Colores escritos fuera del módulo: 118 literales y 69 ternarios de tema | R92 |
| D6 | El punto neutro (gris) se define de tres maneras | R98 |
| D7 | Una tercera familia de color, de rojo a amarillo, pinta un reparto de nivel. Su rojo significa “pocas personas” en la misma página donde el rojo significa “baja” | R96, R99 |
| D8 | Seis mecanismos de globo, uno de ellos el `<title>` nativo, y jerarquía deducida con una expresión regular | R115 |
| D9 | Globos que muestran el universo en lugar de quienes cumplen, o que no muestran personas | R117 |
| D10 | Celdas de un heatmap sin globo | R126 |
| D11 | Margen de error pegado a la cifra grande en 14 globos | R125 |
| D12 | Cuatro reglas de decimales, tres maneras de escribir a las personas, cuatro de decir “sin dato” y miles separados con espacio en el bloque de verificación | R127 |
| D13 | Tabla de respaldo ausente en 21 de 22 secciones | R47 |
| D14 | `analisis()` definida dos veces con firmas distintas | R22 |
| D15 | Cuatro componentes completos, dos dependencias, una hoja de estilos enlazada en todas las páginas e imágenes que ninguna página usa | R171 |
| D16 | Importaciones sin llamada y parámetros que la función ya no lee | R171 |
| D17 | `fuentes.csv` con descripciones de otro proyecto | R137, R171 |
| D18 | Prefijo fijo en el nombre del archivo descargado | R161 |
| D19 | Hoja de estilos de 6,394 líneas heredadas, con una regla definida dos veces, más un bloque `<style>` por página | R36 |
| D20 | Página de pruebas sin `draft: true` que el build local genera | R25 |
| D21 | Licencia en “por definir” en la portada | R33 |
| D22 | Tres textos visibles que nombran un color a mano | R94 |
| D23 | Comentarios que describen el proyecto anterior o el orden contrario al del código | R171 |
| D24 | Trece archivos de datos versionados que ninguna página lee | R154 |
| D25 | Una leyenda escribe con signo de porcentaje una diferencia que está en puntos | R120 |
| D26 | El dominio del mapa de cambio se elige con el percentil 95 de la vista | R101, y P3 de la sección 17 |

---

## 15. Reglas que cambiaron

Sustituciones respecto de las reglas escritas antes de noviembre de 2026. Donde `perdida-lengua` contradice una regla anterior, manda `perdida-lengua`. Donde una decisión editorial de noviembre de 2026 contradice a cualquiera de las dos, manda la decisión.

| # | Regla anterior | Regla vigente | Origen del cambio |
| --- | --- | --- | --- |
| C1 | Cada capítulo abre con el antetítulo “Parte N · Nombre · k de n” | Sin “Parte N”: h1 con palabra clave en rojo y entradilla optativa (R17) | Revisión de `perdida-lengua` |
| C2 | Los mapas de presencia usan rangos fijos y desiguales (0-2, 2-10, 10-20, 20-40, 40 % o más) | Rampa continua de una sola tinta, con dominio fijo de 0 a 100 y leyenda continua (R100) | Revisión de `perdida-lengua` y decisión editorial |
| C3 | La magnitud va en morado de una sola tinta (`perdida-lengua`) o en la rampa del papel al rojo de marca (catálogos) | Rampa continua en el tono de tema del libro, por omisión verde azulado. Sin morado (R93, R99) | Decisión editorial |
| C4 | La serie única va en rojo plano (Guía) o en morado (`perdida-lengua`) | La serie única va en el tono de tema (R99) | Decisión editorial |
| C5 | El rojo marca siempre lo desfavorable y el azul lo favorable, según el `sentido` del glosario | Rojo y azul llevan el significado que declara cada capítulo, y cambia cuando cambia el tema (R95). “En desventaja” y “en ventaja” es una de las declaraciones posibles | Decisión editorial |
| C6 | Un reparto por edad se pinta de rojo intenso a amarillo claro | Es una magnitud de nivel y va en el tono de tema (R99) | Decisión editorial |
| C7 | El globo lleva tres o cuatro renglones: dimensión, grupo, valor y población | Seis papeles en orden fijo, con la frase del denominador y las personas como numerador. Sustituida por C30 | Auditoría de globos y decisión editorial |
| C8 | El margen ± va pegado a la cifra del globo | El margen va a la tabla. El globo solo añade un renglón corto si la estimación es poco precisa (R125) | Decisión editorial |
| C9 | Las personas del globo van abreviadas (“1.23 M”) | Entero completo con la unidad escrita (R127) | Auditoría de globos |
| C10 | Orden de los desplegables: fuentes, explicación, tabla | Explicación, fuentes y verificación, tabla (R46) | Revisión de `perdida-lengua` |
| C11 | El bloque de fuentes de cada gráfica lista la fuente de los datos, la verificación y lecturas | Solo la verificación. Las fuentes de datos van una vez en Referencias (R136, R138) | Revisión de `perdida-lengua` |
| C12 | La explicación de cada gráfica incluye el método | Un párrafo de lectura y un botón al apartado de Metodología (R134, R135) | Revisión de `perdida-lengua` |
| C13 | Metodología en apartados temáticos sin ancla | Apartados con ancla, agrupados por método compartido (R135) | Revisión de `perdida-lengua` |
| C14 | La descarga reconstruye la figura con lógica propia | La descarga copia la figura como se ve, con las fuentes incrustadas (R158, R159) | Revisión de `perdida-lengua` |
| C15 | “Desde” y “Hasta” en todas las secciones con serie | Solo donde la gráfica compara dos extremos (R57) | Revisión de `perdida-lengua` |
| C16 | En un mapa, entidad y tema resaltan sin recortar | La entidad encuadra y lo temático resalta (R61) | Revisión de `perdida-lengua` |
| C17 | Leyenda de magnitud en casillas con rango | Leyenda continua para toda magnitud continua (R109) | Revisión de `perdida-lengua` |
| C18 | La escala de un mapa de magnitudes se ajusta a la vista | La escala es la nacional en todas las vistas (R84) | Revisión de `perdida-lengua` |
| C19 | El texto visible llama “tablero” al producto | No se usa “tablero” en el texto visible (R132) | Revisión de `perdida-lengua` |
| C20 | 3D de cualquier tipo, descartado | El 3D real sigue descartado. Se admiten pseudo-3D en SVG, como prismas isométricos y mapas de picos (R75) | `formas-novedosas.md` |
| C21 | Streamgraph con ficha de uso en `CatalogoVisualizacion.md` | Descartado (R75) | Guía, catálogo HTML y `formas-novedosas.md` |
| C22 | Rejilla de dos columnas con varias gráficas por sección | Una figura por sección, a todo el ancho de la columna (R48) | Lecciones 116 y 118 |
| C23 | Título de la figura en rojo, figuras en tarjetas | Título en tinta oscura y estilo limpio sin tarjetas (R40, R42) | Estilo limpio de octubre de 2026 |
| C24 | Scrollytelling, movimiento en bucle y botón global de pausa | No aplican a los libros de datos. Quedan para las landings fuera de Framework (R2, R167) | Lecciones 116 y 117 |
| C25 | Portadas oscuras para el libro y para cada capítulo | Tapa clara en perspectiva y encabezado claro por capítulo (R17, R29) | Lecciones 112 y 113 |
| C26 | El título de una gráfica puede decir el hallazgo (convención de Datawrapper recogida en `formas-novedosas.md`) | El título nombra lo que se mide (R40) | Revisión de `perdida-lengua` y decisión editorial |
| C27 | Fila de cifras destacadas (tarjetas) arriba de cada figura | Solo la gráfica; cifras en rótulos, globo y tabla (R182) | Libro de discapacidad, noviembre de 2026 |
| C28 | La prosa podía citar cifras calculadas por el libro | Solo cifras publicadas por la fuente oficial, con referencia (R181) | Libro de discapacidad, noviembre de 2026 |
| C29 | El dibujo de la tapa representa el dato (mapa de puntos, hilos, arcos) | La imagen representa al tema y a su población; el dato, solo como textura secundaria (R184) | Libro de discapacidad, noviembre de 2026; lección 129 |
| C30 | El globo lleva seis papeles en orden fijo: contexto, grupo, cifra, frase del denominador, personas y comparación (C7) | Grupo, cifra (el porcentaje o el valor) y población «N de M personas»; el aviso de poca precisión solo si aplica. Sin contexto, frase ni comparación; el nombre de la marca va en el renglón del grupo cuando hace falta (R116 a R124) | Pedido del lector del libro de discapacidad, noviembre de 2026; lección 131 |
| C32 | El margen ± va a la tabla, no al globo (C8) | El margen ± va junto a la cifra del globo, chico y tenue, con los decimales de la cifra, y también en la tabla (R125) | Pedido del lector del libro de discapacidad, noviembre de 2026 |
| C34 | Tono por omisión `petroleoIbero`, verde azulado opuesto al rojo; el rojo solo para lo desfavorable | Tono por omisión `rojoIbero`: la serie es el rojo de la marca y también el semántico (R114a) | Elección del usuario en «Paletas rojo Ibero», 19 de noviembre de 2026 |
| C33 | Filtros en estado normal: cada grupo en su propio renglón, con columnas alineadas entre grupos | Grupos uno junto a otro que bajan de renglón solo cuando no caben; controles del mismo ancho (R66) | Pedido del lector del libro de discapacidad, noviembre de 2026: un grupo de un control por renglón se veía separado |
| C31 | Metadatos con rótulo gris en mayúsculas, nombres y valores en negrita, ORCID en tinta; índice con títulos subrayados en negro | Autores en su renglón en serif con ORCID verde y correo rojo; rótulos en rojo de rótulo de grupo; valores en peso normal; índice con número rojo y título sin subrayado (R185) | Revisión de la portada, noviembre de 2026 |

---

## 16. Lista de control final antes de entregar

Identidad y estructura

- [ ] El nombre del producto está declarado una vez y aparece igual en configuración, menú, portada, tapa, cita y verificadores.
- [ ] Autores con ORCID, afiliación, año, DOI y licencia están completos. `CITATION.cff` existe.
- [ ] El resumen del hero, la descripción para buscadores y el `abstract` son el mismo texto.
- [ ] Ningún encabezado de capítulo lleva “Parte N”. Ninguna página dice “en preparación”.
- [ ] La imagen de vista previa tiene nombre nuevo si cambió la portada y el despliegue la copia.

Secciones

- [ ] Cada análisis tiene ancla estática, título igual al del índice, filtros, figura, pie de una frase, descarga y los tres desplegables en el orden fijo.
- [ ] Todas las secciones tienen tabla de respaldo con margen de error y casos.
- [ ] Ninguna forma se repite en dos secciones seguidas. El inventario de formas está actualizado.
- [ ] Ningún selector ofrece una opción que deje la gráfica vacía.
- [ ] Los filtros pegajosos no pasan de unos 110 px a 1366 × 768.

Color y globos

- [ ] Cada capítulo declara qué significan rojo, azul y gris, en la página y en Metodología.
- [ ] No hay morado, salvo la esquina «los dos altos» del mapa bivariado (R93). No hay hexadecimales ni ternarios de tema fuera del módulo de paleta.
- [ ] Toda rampa tiene dominio fijo en una constante. Toda magnitud continua tiene leyenda continua.
- [ ] Todo globo sale de `globo()` con grupo, cifra (el porcentaje o el valor) con su margen ± cuando hay error estimable, y población «N de M personas», sin contexto, frase ni comparación.
- [ ] Hay una sola función por formato y un solo texto para “Sin dato”.

Textos y referencias

- [ ] Los textos de los análisis describen. No hay “no es X, es Y”, punto y coma ni comillas angulares.
- [ ] Cada explicación tiene un ejemplo con números y su botón a Metodología.
- [ ] Cada análisis tiene “Fuentes y verificación” con el resultado calculado o “Verificación pendiente”.
- [ ] Las fuentes de datos están una vez en Referencias, en APA y con `id`.

Datos

- [ ] Las cifras centrales se cotejaron con la fuente oficial.
- [ ] Ninguna serie une ediciones no comparables.
- [ ] El error se calculó con el diseño muestral, y las celdas no estimables van vacías.
- [ ] Las celdas con menos de 30 casos van marcadas o agrupadas.

Verificación

- [ ] `npm run clean && npm run build` termina sin errores.
- [ ] `verificar:render`, `verificar:filtros`, `verificar:a11y`, `verificar:paleta` y `verificar:quieto` pasan, con las listas de este libro.
- [ ] El sitio abre sin errores de celda en WebKit.
- [ ] Se revisaron las capturas de cada sección en claro, oscuro, escritorio y 390 px.
- [ ] No hay scroll horizontal en 1920, 1366, 1024 y 390 px.
- [ ] La descarga PNG y SVG de una figura por capítulo coincide con lo que se ve.
- [ ] Se revisó el libro contra la tabla de defectos de la sección 14.
- [ ] Inventario de formas en `docs/formas-por-seccion.md`: ninguna forma más de dos veces, salvo el mapa, y ninguna en dos secciones seguidas (R188).
- [ ] Los mapas como vista del filtro usan los rangos de `RANGOS` de `vista-mapa.js`; ninguna página registra rangos propios (R186).

---

## 17. Pendiente de decidir

Puntos donde las fuentes chocan y las decisiones vigentes no alcanzan a resolver. Cada uno indica qué se hace mientras tanto.

**P1. Paleta de identidad cuando rojo y azul ya tienen significado.** Los catálogos asignan rojo, azul y ámbar a las categorías sin orden, y ámbar y azul al sexo. Con rojo y azul reservados para el significado del capítulo (R95), no está decidido qué tonos identifican a tres entidades elegidas por el lector o a mujeres y hombres. *Mientras tanto:* se usa lo que declare `paleta.js`, y en un capítulo que ya dio significado a rojo y azul no se usan para identidad.

**P2. Identidad con más de tres categorías.** La regla general es tres tonos más gris (R107). `perdida-lengua` usa once colores, uno por familia lingüística, como identidad y no como medida, con el nombre siempre junto al color. Dos de esos once son morados. *Mientras tanto:* tope de tres más “Otras”. Una identidad más larga se consulta antes de dibujarla.

**P3. Dominio del mapa de cambio.** La regla es dominio fijo (R101). El mapa de cambio de `perdida-lengua` elige entre tres juegos de cortes (±1, ±5 o ±20 puntos) según el percentil 95 de la vista, con el argumento de que con una sola lengua los cambios son de décimas y la escala amplia lo deja todo en un tono. *Mientras tanto:* dominio fijo. Si una vista queda en un solo tono, se plantea el caso antes de añadir juegos de cortes.

**P4. Diagrama de cuerdas y empaquetado de círculos.** La Guía y el catálogo HTML los descartan. La lista de Data Viz Project de `formas-novedosas.md` los marca como aprovechables. *Mientras tanto:* descartados (R75).

**P5. Color de la cifra principal.** La regla de interfaz pone la cifra principal de cada sección en rojo de marca (R111). Con el rojo como color con significado, una cifra principal en rojo puede leerse como pérdida o desventaja aunque no lo sea. *Mientras tanto:* se aplica R111, y la cifra que expresa un cambio toma el color de su signo (R122).

**P6. Mapa bivariado (resuelto el 17 de noviembre de 2026).** Su paleta de 3 × 3 mezcla rojo y azul y produce un morado en la esquina donde coinciden las dos variables. Se aprobó como excepción a R93 porque el morado no es el color del tema. La matriz vive en `P.bivariado` (la de PISA, con tres celdas del modo oscuro ajustadas) y `verificar:paleta` la revisa por filas, columnas y esquinas. Implementada en `formas/bivariado.js` y en la sección 13 de Mapas. Se usa solo cuando las dos variables pesan igual; si una es el tema y la otra lo afina, va el control «Cruzar con» (lección 100).

**P7. Tipografía de la prosa del equipo académico.** La introducción la escribe el equipo y sí argumenta (R140). No está decidido si las reglas de R131 (sin punto y coma, sin comillas angulares) se aplican también a esa prosa. *Mientras tanto:* se publica como la entrega el equipo y se consulta al recibirla.
