> **Nota de la Plantilla.** Este archivo es una copia de consulta. Donde contradiga a [`../REGLAS.md`](../REGLAS.md), manda `REGLAS.md`
> (color sin morado, rojo y azul con significado declarado por capítulo, globo con personas, presencia en rampa continua de una tinta).
> Las correcciones punto por punto están en [`README.md`](README.md), sección 4.

# Catálogo de Visualización - Social Data Ibero

Catálogo de gráficas construidas **únicamente con Observable Plot**, organizadas
por categoría funcional y nivel de complejidad. Es la especificación de la que
saldrá `@socialdataibero/plot-kit`: cada ficha declara marcas, canales,
transforms y el helper de la futura biblioteca que la encapsulará.

Las reglas de color, formato y accesibilidad de este documento se tomaron de lo
que ya funciona en tres tableros publicados: **Observatorio PISA** (`PISA/`),
**Grupos originarios** (`grupos-originarios/`) y **JCF stats** (`jcf-stats-v2/`).
Donde los tres coinciden, la regla se escribe como norma. Donde divergen, gana
el proyecto que la midió (validador de paleta, axe-core, conteo de marcas en el
SVG) y la diferencia queda registrada en [Estado de adopción](#estado-de-adopción-en-los-tableros).

- **Básica** - Un solo mark, configuración mínima
- **Intermedia** - Combinación de marks, transforms, opciones de estilo
- **Avanzada** - Múltiples layers, transforms complejos, layouts especializados

> **Nota principal: estos tableros son para el público.** Cualquier persona los
> abre, sin instrucciones y sin saber qué es un denominador. Cada gráfica responde
> una sola pregunta, se entiende en cinco segundos y deja el detalle (intervalo,
> casos, denominador, metodología) en el desplegable o en la tabla. Cuando
> claridad y detalle compiten, gana la claridad en la vista.

## Cómo leer una ficha

| Campo          | Qué dice                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **Marks**      | Marcas de Plot y qué canal recibe qué tipo de dato                                             |
| **Transforms** | Transform de Plot necesario (`binX`, `groupY`, `stackY`, `dodgeY`…)                            |
| **Helper**     | Nombre previsto en la biblioteca                                                               |
| **Cuándo**     | Condición de uso - cuándo esta forma es la correcta y cuándo no                                |
| **Color**      | Rol del color: identidad (categórico), magnitud (secuencial), polaridad (divergente) o ninguno |

Los fragmentos de código de las fichas muestran la **forma**; lo que las reglas
transversales resuelven una sola vez (puntero, tooltip, ancho, tema, etiquetas
sobre relleno) se abrevia en ellas como `tip: true` y el helper lo sustituye por
la versión completa.

---

## Paleta - fuente única de verdad

Los colores no se eligen por gráfica: se heredan de un solo módulo,
`components/base.js`, que es el nombre que ya usan PISA y Grupos originarios.
Ningún selector de CSS ni ninguna llamada a `Plot.plot` escribe un hex; si una
gráfica necesita un color que no está aquí, se agrega aquí, se valida y después
se usa.

```js
// components/base.js - corregir SOLO aquí. Cada constante tiene su versión
// clara y oscura; aplicarModo() las MUTA en sitio (nunca las reasigna) para
// que los módulos que ya las importaron vean el cambio.

// Rojo de marca. En oscuro, #C4101B da 3.2:1 contra la superficie y vibra.
export let ROJO = "#C4101B"                // oscuro: "#E8474F" (5.4:1)
export const FONDO = "var(--theme-background, #fff)"  // halo de etiquetas y borde de puntos

// Categórica - identidad. TRES tonos, validados con --pairs all en los dos
// modos. En oscuro el rojo se corre a magenta: rojo de marca y ámbar chocan
// bajo deuteranopía (ΔE 3.7) dentro de la banda de luminosidad oscura.
const CATEGORICA_CLARO  = ["#C4101B", "#2166AC", "#B87709"]
const CATEGORICA_OSCURO = ["#EE4C7C", "#4A90D9", "#BE8700"]
export const PALETA = [...CATEGORICA_CLARO]  // mutable
export const MAX_GRUPOS_COLOR = 3
export const OTRAS = "Otras"                 // se pinta con GRIS.trazo

// Pares de dos series (Grupos originarios). El rojo identifica siempre al
// grupo del que trata el tablero; el sexo va en ámbar y azul, nunca rosa/azul.
export const PAR_TEMA = { tema: PALETA[0], resto: PALETA[1] }
export const PAR_SEXO = { mujeres: "#B87709", hombres: "#2166AC" } // oscuro: #BE8700 / #4A90D9

// Polaridad de un cambio o una brecha. El ROJO marca siempre lo
// desfavorable; qué es desfavorable lo dice `sentido` en el glosario.
export const CAMBIO = { desfavorable: "#C4101B", favorable: "#2166AC" } // oscuro: #E8474F / #4A90D9
export const colorCambio = (delta, sentido = "alto") =>
  (sentido === "alto" ? delta < 0 : delta > 0) ? CAMBIO.desfavorable : CAMBIO.favorable

// Grises: un TONO por uso, nunca una opacidad sobre negro.
export const GRIS = {
  fondo: "#C8C8C2",    // marcas de contexto (países al fondo, barras no elegidas)
  trazo: "#8A8A84",    // "Otras", líneas de contexto
  contexto: "#ADADA7",
  papel: "#F7F7F5",    // marco de mapa; tinta sobre relleno saturado
  tinta: "#3A3A36",    // contorno de hover, anotaciones, líneas de referencia
  rejilla: "#EDEDE9",  // rejilla y "sin dato"
}
// oscuro: fondo #3E3E3B, trazo #75756E, contexto #57574F, papel #1E1E1C,
//         tinta #D8D6D1, rejilla #2E2E2B

// Divergente - polaridad o distancia a una referencia. RdBu de 9 pasos; el
// centro es GRIS y no el color del papel, porque el papel ya significa
// "sin dato". En oscuro se invierte la luminosidad.
export const RAMPA = [
  "#67001F", "#B2182B", "#D6604D", "#F4A582", "#E8E6E1",
  "#92C5DE", "#4393C3", "#2166AC", "#053061",
]
// oscuro: #FFB3B8 #F27C82 #E8474F #A32C34 #4A4A45 #2C5C8C #4A90D9 #7FB6EA #B8D8F7

// Secuencial - magnitud. Un solo matiz, del papel al rojo de marca.
export const SECUENCIAL = [
  "#FDE9E7", "#F8C4BE", "#EF9A93", "#E36F6A", "#D34246", "#C4101B", "#8E0B14",
]
// oscuro: #3A2223 #6A2C31 #9A3A40 #C64C52 #E8666C #F58A8F #FFB3B8
// Tramo para rellenos contra el papel (coropletas, celdas): ver nota abajo.
export const SECUENCIAL_RELLENO = SECUENCIAL.slice(2) // oscuro: desde #9A3A40

// Bivariada 3×3 (mapa de dos variables), indexada [a][b].
export const BIVARIADO = [
  ["#E8E6E1", "#A9C3D8", "#5B92C0"],
  ["#E0B9BC", "#9E9EA8", "#5C6E9E"],
  ["#D08B92", "#B0707F", "#4A3A62"],
]
// oscuro: [#2E2E2C,#2C4356,#4E88B8],[#5A2A2E,#5A5A63,#6E86C4],[#8C4048,#A0707C,#B49AD6]

// Extendida - SOLO formas de pares adyacentes (apiladas, waffle, treemap),
// con separación de 2 px y etiqueta directa. No está cableada en ningún
// tablero todavía: es especificación.
export const PALETA_EXTENDIDA = [
  "#C4101B", "#2166AC", "#E8930C", "#2E8B57", "#8C4799", "#A6761D", "#1B9E9E", "#B0562B",
]
// oscuro: #E8474F #4A88C7 #C07A10 #3E9A6B #A768B8 #B08838 #2AA6A6 #C4713F

// Superficies contra las que se valida (--surface-3 del tablero).
export const SUPERFICIE = { claro: "#fafaf9", oscuro: "#1e1e1c" }
```

Los colores de estado viven en el CSS, no en `base.js`, porque solo pintan
avisos y nunca una serie: `--estado-bien #2a7f3e`, `--estado-aviso #c48a00` y
`--estado-aviso-tinta #8a5500` para el texto. Van siempre acompañados de texto.

### Resultado del validador

Todas las cifras salen de `scripts/validate_palette.js` (copia del validador de
la skill `dataviz`), corrido el 24 de septiembre de 2026 contra las superficies
`#fafaf9` y `#1e1e1c`.

| Paleta                    | Pares      | Claro                                     | Oscuro                                    |
| ------------------------- | ---------- | ----------------------------------------- | ----------------------------------------- |
| `PALETA` (3)              | todos      | PASS, peor CVD ΔE 9.7 deutan, normal 17.7 | PASS, peor CVD ΔE 9.6 deutan, normal 20.7 |
| `PAR_TEMA` / `CAMBIO`     | todos      | PASS, ΔE 22.1 protan                      | PASS, ΔE 21.2 protan                      |
| `PAR_SEXO`                | todos      | PASS, ΔE 23.9 protan                      | PASS, ΔE 24.7 protan                      |
| `PALETA_EXTENDIDA` (8)    | adyacentes | PASS, ΔE 11.6; WARN `#E8930C` 2.34:1      | PASS, ΔE 8.6 (tritan 5.8)                 |
| `PALETA_EXTENDIDA` (8)    | todos      | **FAIL**, ΔE 3.0 deutan                   | **FAIL**, ΔE 1.1 deutan                   |
| `SECUENCIAL` (7, ordinal) | -          | **FAIL** extremo claro 1.12:1             | **FAIL** extremo claro 1.14:1             |
| `SECUENCIAL_RELLENO` (5)  | -          | PASS, extremo claro 2.07:1                | PASS, extremo claro 2.43:1                |

Se desprenden cinco reglas que la biblioteca debe respetar:

1. **Tres colores de identidad, y el resto en gris.** En PISA se probaron seis
   candidatos a cuarto tono y ninguno libró `--pairs all` en oscuro (el morado
   quedó a ΔE 4.8 del azul bajo protanopía, el verde a 4.8 del magenta bajo
   deuteranopía). Con más de tres grupos, los tres primeros llevan color y los
   demás van a `OTRAS` en `GRIS.trazo`; una cuarta variable (el sexo, por
   ejemplo) se codifica como faceta y no como color.
2. **La paleta extendida solo vale entre vecinos.** Con todos los pares contra
   todos, `#B0562B` y `#C4101B` quedan a ΔE 3.0 bajo deuteranopía, y en oscuro
   `#C4713F` y `#E8474F` a ΔE 1.1: son el mismo color para una persona
   daltónica. Por eso se restringe a apiladas, waffle, treemap e icicle, donde
   cada segmento solo toca a sus vecinos, siempre con etiqueta directa. El ámbar
   `#E8930C` además queda en 2.34:1 contra la superficie clara, y el WARN se
   compensa con esa misma etiqueta.
3. **El extremo claro de la rampa secuencial no se distingue del papel.** Con
   `#FDE9E7` a 1.12:1, una entidad en el primer tramo de una coropleta se lee
   como hueco, y el hueco ya significa "sin dato". Los tres tableros publican
   rampas que reprueban esta prueba (la de JCF empieza en `#f7cdd0`, 1.38:1) y
   ninguno la corría. Para rellenos contra el papel se usa `SECUENCIAL_RELLENO`,
   que empieza en el tercer paso. La rampa completa se conserva para líneas y
   marcas que llevan contorno.
4. **La rampa divergente y la bivariada no las cubre el validador categórico.**
   `RAMPA` y `BIVARIADO` se justificaron midiendo contraste a mano (la bivariada
   va de 1.25:1 a 10.13:1 sobre blanco y sus extremos quedan a ΔE 21.7 bajo
   deuteranopía), no con un script. Queda pendiente llevarlas a
   `validateOrdinal` por mitades.
5. **Nunca generar colores en runtime.** Ni `d3.schemeTableau10` ni
   `scheme: "reds"` de Plot. PISA retiró Tableau de su dispersión porque no estaba
   validado y no cambiaba con el tema (el `#4e79a7` quedaba igual sobre negro), y
   JCF pinta mapas y heatmaps con `reds` sin haberlo pasado por el validador. Toda
   paleta nueva se agrega a `base.js` con su justificación y se revalida antes de
   usarse.

### Tema claro y oscuro

El tema no sigue `prefers-color-scheme`: el sitio abre en claro y un botón lo
cambia. El script del `head` lee `localStorage` y pone `data-tema` en `<html>`
antes del primer pintado; el botón (`<button class="boton-tema">` dentro de un
`<li>` del sidebar, con texto "Claro"/"Oscuro" y `aria-pressed`) escribe la
preferencia y dispara un evento. `base.js` escucha ese evento y llama a
`aplicarModo(oscuro)`, que muta en sitio todas las constantes de arriba y avisa a
las secciones suscritas con `alCambiarModo(fn)` para que se vuelvan a dibujar.
Las constantes se mutan y no se reasignan porque un `export` reasignado no se
propaga a los módulos que ya lo importaron.

---

## Reglas transversales de la biblioteca

Aplican a todas las fichas; no se repiten en cada una.

### Color

- **El color sigue a la entidad, no a su frecuencia.** Ordenar los grupos por
  cuántas filas tienen en la vista hace que al agregar uno se recoloreen los
  demás. El orden sale de dos fuentes: primero lo que el lector ya eligió y
  después una lista fija del proyecto (`ORDEN_GRUPOS`). `gruposDeColor(filas,
  llave, fijos)` devuelve `{dominio, rango, clase}` con los tres primeros en
  color y el resto en `OTRAS`. El dominio se fija sobre el universo completo,
  no sobre el subconjunto filtrado.
- **Resaltar es contorno u opacidad, nunca otro color.** La entidad elegida
  conserva su tono y gana un trazo `GRIS.tinta`; el contexto baja a
  `GRIS.fondo` o a `OPACIDAD_FONDO = 0.11`.
- **Rampa por valor, no por posición.** Si una serie por año se pinta con una
  rampa de un matiz, el tono más oscuro cae en el valor más alto de la vista y no
  en el año más reciente (`colorPorValor` de JCF): si la serie va a la baja, esos
  dos son distintos.
- **Dominio fijo en una constante, elegido midiendo.** Si el filtro cambia la
  escala, el mismo valor cambia de tono entre vistas. Porcentajes: `[0, 100]`
  con marcas en 0, 25, 50, 75 y 100. Magnitudes: una constante medida contra el
  dato completo. `DOMINIO_COLOR = [300, 620]` de PISA se eligió contando: el
  mínimo real es 300.9 y el máximo 612.4, ningún valor de los 943 queda fuera y
  el rango real ocupa el 97 por ciento de la rampa. Las marcas de la leyenda
  fuerzan los dos extremos y el pivote, y se descarta cualquier marca a menos
  del 8 por ciento de un extremo.
- **Divergente anclada en la referencia, no en cero.** Cuando el color mide
  distancia a un promedio (OCDE, nacional), el pivote es ese promedio, fijo
  mientras el lector filtra, y la escala es `{type: "diverging", pivot,
  symmetric: false}`. La orientación la da `sentido: "alto" | "bajo"` del
  glosario de indicadores, para que el rojo caiga siempre en lo desfavorable.
- **Etiqueta sobre relleno saturado:** `GRIS.papel`, no `"white"`. En oscuro las
  rampas se invierten y el relleno alto es claro; `GRIS.papel` se invierte con
  ellas y la etiqueta sigue siendo legible.

### Forma y densidad

- **La forma cambia con la densidad.** Un panel → barras; de 2 a 4 paneles →
  rejilla de facetas; más de 4 → heatmap. Grupos originarios lo resuelve en un
  solo lugar, `geometria(v)` de `filtros.js`, que lee el estado del panel y
  devuelve el modo (`barras`, `pendiente`, `dumbbell`, `entidades`, `mapa`);
  ninguna página decide la forma por su cuenta.
- **Un solo eje.** Nunca dos escalas `y`. Dos medidas de escala distinta → dos
  gráficas, facetas, o índice a base común.
- **Nunca promediar tasas ni sumar ediciones.** Se suman numerador y
  denominador por grupo y luego se divide; el selector de año ofrece un año o
  la comparación en facetas, jamás un agregado.
- **Etiquetas directas selectivas.** Con hasta 8 marcas (`POCAS` en PISA) cada
  una lleva su valor; con más, solo las extremas o las elegidas. Con más de 12
  filas el dumbbell baja el alto de fila de 34 a 19 px y retira las etiquetas.
- **El rótulo que identifica una marca va en todas las facetas**, pasando `fx` y
  `fy` a la marca de texto: en la primera sola, el lector pierde la entidad en
  cuanto las demás reordenan.
- **Una celda vacía se rotula "sin dato"** en la faceta, o se lee como filtro
  roto.
- **Línea base** explícita: `Plot.ruleY([0])` o `Plot.ruleX([0])`.
- **Separación de 2 px** entre rellenos contiguos con `inset` o con `stroke:
  FONDO`.
- **Fechas en texto** (`"2019-04"`) en el eje `x`: declarar `x: {type: "band"}`.

### Interacción

- **Puntero según el eje categórico.** En barras, rankings y apiladas el
  contorno de hover se empareja por fila o columna, no por distancia a la punta
  de la marca:

  ```js run=false
  // Barras verticales: el eje x es categórico.
  Plot.barY(datos, Plot.pointerX({
    x: "grupo", y: "valor", fill: "none", stroke: GRIS.tinta, strokeWidth: 1.8,
    insetLeft: 6, insetRight: 6, pointerEvents: "none", maxRadius: Infinity,
  }))
  // Dumbbell y ranking: el eje y es categórico → Plot.pointerY.
  ```

  `Plot.pointer` a secas solo en dispersión y en celdas de heatmap, donde los dos
  ejes son continuos o ambos categóricos. `maxRadius: Infinity` siempre: el radio
  por omisión de Plot (40 px) deja zonas muertas entre barras.
- **El globo lleva tres o cuatro renglones:** dimensión, grupo, valor y
  población. La población es `num` (quienes cumplen), no `den`, y se omite en
  indicadores de pesos u horas, donde `num` es dinero o tiempo y no gente. El
  intervalo, la brecha, los casos de muestra y el denominador van a la tabla de
  respaldo, nunca al globo.
- **Mapas con contorno al pasar el puntero:** `stroke: "none"` entre polígonos
  (un borde blanco se ve gris por antialiasing a cualquier grosor) y el contorno
  lo pone CSS sobre `.mapa-hover` con `stroke: var(--text-primary); stroke-width:
  2.5; paint-order: stroke fill`.
- **Ancho medido una sola vez por página.** Una regla `.medida-ancho` en el DOM
  y un solo `ResizeObserver` (`anchoActual()`, `alCambiarAncho()`, umbral de 8
  px); el panel de filtros entrega `{v, ancho}` a la gráfica. Un `resize()` por
  gráfica se desincroniza en cuanto la página tiene más de tres.
- **Movimiento.** Animación solo de entrada y de cambio de filtro, a través de
  `animar(nodo)`, que respeta `prefers-reduced-motion`. Nada se mueve detrás de
  texto que se lee.

### Cifras y unidades

- **Una sola escala tipográfica:** `TIPO = {ejes: 13, valor: 12.5, etiqueta:
  11.5}`, exportada de `base.js` y usada por todas las marcas de texto.
- **`formato` viaja por toda la cadena** y decide el ×100: en `"pct"` la
  proporción se multiplica por 100; en medias (`"pesos"`, `"horas"`) `num/den`
  ya es la cifra final. `formatear(valor, formato)` escribe `"12.4 %"`, `"$8,120"`
  o `"38.5 h"`, en locale `es-MX`, y `"s/d"` para `null`. Antes de aprobar una
  media se lee en voz alta con su unidad.
- **Signo de resta tipográfico:** `diferencia()` escribe `+`, `−` (U+2212) y
  `±`.
- **Montos de varias ediciones, deflactados o no se comparan**, con el INPC del
  periodo de levantamiento.

### Datos frágiles y faltantes

- **Muestra chica se marca, no se esconde.** Con menos de `MIN_CASOS = 30`
  casos la marca lleva la trama `#trama-fragil` y un asterisco junto al valor, y
  `avisoMuestra()` agrega una nota con `role="note"`. Lo mismo un valor que topa
  en 100 (`saturado`), que conserva su cifra cruda en la tabla.
- **Una tasa no calculable es `null`, no cero.** Una barra en cero afirma algo
  que el dato no dice; lo mismo un margen de error no estimable, que va vacío.
- **Márgenes de error con el diseño muestral**, nunca con la fórmula binomial:
  en la ENIGH el efecto de diseño medido es 2.20, y `sqrt(p(1-p)/n)`
  publicaría intervalos un tercio más angostos que los reales.

---

## Anatomía de la figura

Toda gráfica de análisis se publica dentro de la misma estructura, y el lector
aprende a leerla una vez. Está implementada completa en Grupos originarios y en
PISA:

1. **Encabezado de sección** con el mismo texto que el ancla del índice, sin
   párrafo de introducción.
2. **Panel de filtros propio**, en `fieldset` rotulados de lo grande a lo
   específico ("Qué se compara y dónde", "Entre quiénes").
3. **Figura** (`figura({titulo, subtitulo, pie}, hijos)`, que produce `figure`
   con clase `grafica-*`):
   - título `h3` en rojo;
   - subtítulo generado desde los filtros activos (`notaSeleccion(v)`), para
     que la figura descargada diga qué se eligió;
   - leyenda, y en un renglón aparte, entre leyenda y lienzo, el rótulo de las
     líneas de referencia (`p.nota-referencia`): dentro del lienzo tapa ejes y
     filas;
   - el lienzo;
   - pie de una sola frase de 12 a 35 palabras con la forma `fuente · qué
     representa cada marca`;
   - botón de descarga (`conDescarga`) que exporta la **figura completa**
     (título, subtítulo, leyenda, nota de referencia, pie y crédito) en PNG a 2x
     y en SVG. Nunca JPG, que deja halos en texto y líneas finas.
4. **Tres desplegables**, cerrados e idénticos en forma: "¿Qué quiere decir
   este análisis?" (`explicacion()`, lenguaje llano, qué se preguntó y cuál es el
   denominador), "Fuentes y verificación" (`verificado()`, contra qué se cruzó la
   cifra central, o "verificación pendiente") y "Ver los datos (n filas)"
   (`tablaDatos()`, con intervalo, "Pob. cumple", "Pob. total" y casos).
5. **Región viva** `.aviso-lector` (`role="status"`, `aria-live="polite"`) que
   anuncia "Gráfica actualizada" al cambiar un filtro.

La tarjeta lleva borde izquierdo en `--border-subtle`, esquinas de 10 px y
sombra suave. El rojo queda en un solo lugar por tarjeta, el título o la cifra;
un segundo acento rojo compite con el primero.

---

## Accesibilidad medida

La accesibilidad se comprueba con scripts, no se declara. Grupos originarios y
PISA corren los mismos verificadores sobre `dist/`; JCF no tiene ninguno.

| Script              | Qué comprueba                                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verificar:a11y`    | axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`) en cada página y en los dos temas, con `reducedMotion: "reduce"`. Falla con cualquier hallazgo `serious` o `critical`. Además: nombre accesible en cada control, botón de tema con texto y `aria-pressed`, enlace para saltar al contenido. |
| `verificar:paleta`  | El validador sobre las paletas reales, en los dos modos y contra la superficie real.                                                                                                                                                                                                                               |
| `verificar:render`  | Cuenta marcas reales en el SVG por página y tema, con el `colorScheme` del navegador puesto al tema contrario para confirmar que manda el botón.                                                                                                                                                                   |
| `verificar:filtros` | Huella por combinación de filtros: `fill`, `stroke`, anchos, opacidades, orden de rótulos del eje y un hash de posiciones. Un filtro que no cambia la huella no hace nada.                                                                                                                                         |
| `verificar:todo`    | Los anteriores en cadena, antes de publicar.                                                                                                                                                                                                                                                                       |

Lo que axe-core encuentra siempre en Framework, y cómo se corrige desde el
script del `head` (la configuración no toca el HTML generado):

- `lang="es"` en `<html>`.
- Enlace "Saltar al contenido" y `tabindex="-1"` en `main`.
- Nombre accesible (`aria-label` y texto oculto) en el interruptor del sidebar,
  y los hijos que no son `<li>` dentro de un `<ol>` envueltos en uno.
- En Plot: `role="group"` en cada `g[aria-label]`, quitar el `aria-label` del
  marco, y `role="img"` con `aria-label="Gráfica: <título>"` en el SVG. Un
  `MutationObserver` lo reaplica cada vez que la gráfica se vuelve a dibujar.

Y desde el CSS:

| Elemento                             | Antes             | Después                 |
| ------------------------------------ | ----------------- | ----------------------- |
| Texto secundario (gris de marca)     | `#a7a3a2`, 2.5:1  | `#4a4845`               |
| Gris derivado del índice (Framework) | `#777776`, 4.48:1 | tokens propios de tinta |
| Rojo de marca sobre oscuro           | `#C4101B`, 3.2:1  | `#e8474f`, 5.4:1        |
| Título de tarjeta en oscuro          | 4.32:1            | 5.6:1                   |
| Separación de superficies oscuras    | 1.11:1            | 1.19:1                  |

- Los enlaces dentro de párrafos van **subrayados**: el rojo solo da 2.76:1
  contra el texto que lo rodea, y el color no alcanza para distinguirlos.
- Un solo anillo de foco: `:focus-visible { outline: 2px solid
  var(--brand-red); outline-offset: 2px }`.
- Bordes en `@media (forced-colors: active)`.
- Un gris hecho con `color-mix` y transparencia no se valida leyendo el CSS,
  solo midiendo: JCF usa `--brand-dark 55%` para texto y nunca se midió.
- La tabla de respaldo es el relevo de toda gráfica para quien no la ve: cada
  cifra del SVG tiene que estar en ella.

Queda sin cubrir un recorrido con teclado: el encabezado de `verificar:a11y`
dice que lo hace, pero ningún paso lo ejecuta.

---

---

# - Comparación

Comparar valores entre categorías o grupos.

---

## Barras verticales

|               |                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Categoría** | Comparación · **Complejidad** Básica · **Helper** `barras()`                                                |
| **Marks**     | `barY` (x: categórico, y: cuantitativo continuo), `ruleY`, `text` (etiqueta directa)                        |
| **Cuándo**    | Menos de 12 categorías y etiquetas cortas. Con más categorías o etiquetas largas, usar barras horizontales. |
| **Color**     | Ninguno - una sola serie, color de marca plano. Sin leyenda.                                                |

```js run=false
Plot.plot({
  y: { grid: true, label: "Casos" },
  marks: [
    Plot.barY(data, {
      x: "categoria",
      y: "valor",
      fill: ROJO,
      sort: { x: "-y" },
      tip: true,
    }),
    Plot.text(data, {
      x: "categoria",
      y: "valor",
      text: (d) => compacto(d.valor),
      dy: -8,
      fontWeight: 600,
    }),
    Plot.ruleY([0]),
  ],
})
```

---

## Barras agrupadas

|               |                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Comparación · **Complejidad** Intermedia · **Helper** `barrasAgrupadas()`                                    |
| **Marks**     | `barY` (x: serie, y: cuantitativo, fill: serie, fx: categoría), `ruleY`                                      |
| **Cuándo**    | Comparar 2–5 series dentro de cada categoría. La faceta `fx` separa los grupos sin que las barras se toquen. |
| **Color**     | Categórico con `PALETA_EXTENDIDA` (solo pares adyacentes). Leyenda obligatoria y etiqueta directa.           |

```js run=false
Plot.plot({
  color: { legend: true, domain: SERIES, range: PALETA_EXTENDIDA },
  fx: { padding: 0.15, label: null },
  y: { grid: true },
  marks: [
    Plot.barY(data, {
      x: "serie",
      y: "valor",
      fill: "serie",
      fx: "categoria",
      inset: 1,
      tip: true,
    }),
    Plot.ruleY([0]),
  ],
  x: { axis: null },
})
```

---

## Barras divergentes

|               |                                                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Comparación · **Complejidad** Intermedia · **Helper** `barrasDivergentes()`                                                                                                        |
| **Marks**     | `barX` (x: cuantitativo con signo, y: categórico, fill: signo), `ruleX`, `text`                                                                                                    |
| **Cuándo**    | El valor tiene polaridad real respecto a un cero significativo: saldo, brecha, cambio neto, diferencia contra un promedio. No usar para magnitudes que solo son "altas" o "bajas". |
| **Color**     | Polaridad con `colorCambio(delta, SENTIDO)`: rojo en lo desfavorable según el `sentido` del glosario, no según el signo.                                                           |

```js run=false
// "alto" si más es mejor (puntaje, cobertura); "bajo" si más es peor
// (carencia, violencia). Sale del glosario de indicadores, no de la gráfica.
const SENTIDO = GLOSARIO[indicador].sentido

Plot.plot({
  x: { label: "Diferencia respecto al promedio nacional" },
  marginLeft: 140,
  marks: [
    Plot.barX(data, {
      x: "diferencia",
      y: "entidad",
      fill: (d) =>
        colorCambio(d.diferencia, SENTIDO),
      sort: { y: "x" },
      tip: true,
    }),
    // textAnchor y dx son constantes en Plot: una marca por signo.
    Plot.text(data.filter((d) => d.diferencia >= 0), {
      x: "diferencia",
      y: "entidad",
      text: (d) => diferencia(d.diferencia),
      textAnchor: "start",
      dx: 6,
    }),
    Plot.text(data.filter((d) => d.diferencia < 0), {
      x: "diferencia",
      y: "entidad",
      text: (d) => diferencia(d.diferencia),
      textAnchor: "end",
      dx: -6,
    }),
    Plot.ruleX([0], { stroke: "currentColor", strokeWidth: 1.5 }),
  ],
})
```

---

## Barras con intervalo de confianza

|               |                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Comparación · **Complejidad** Intermedia · **Helper** `barrasConError()`                                                                                                      |
| **Marks**     | `barY` (x: categórico, y: estimación), `ruleY` (y1: inferior, y2: superior), `tickY` (extremos)                                                                               |
| **Cuándo**    | La estimación viene de una encuesta y las diferencias entre categorías pueden no ser significativas. Sin la barra de error, la gráfica afirma más de lo que el dato sostiene. |
| **Color**     | Ninguno - una serie. El intervalo va en tinta neutra, no en color de serie.                                                                                                   |

```js run=false
Plot.plot({
  y: { grid: true, label: "% (IC 95%)" },
  marks: [
    Plot.barY(data, {
      x: "grupo",
      y: "estimacion",
      fill: ROJO,
      fillOpacity: 0.85,
    }),
    Plot.ruleY(data, {
      x: "grupo",
      y1: "ic_inferior",
      y2: "ic_superior",
      stroke: "currentColor",
      strokeWidth: 1.5,
    }),
    Plot.tickY(data, { x: "grupo", y: "ic_inferior", stroke: "currentColor" }),
    Plot.tickY(data, { x: "grupo", y: "ic_superior", stroke: "currentColor" }),
    Plot.ruleY([0]),
  ],
})
```

El intervalo sale del diseño muestral (linearización de Taylor con varianza
entre UPM dentro de estrato), no de `sqrt(p(1-p)/n)`. En porcentajes se recorta
a `[0, 100]`, y se publica solo si todas las partes de la estimación tienen
error; si no es estimable, la columna va vacía y la barra se dibuja sin
intervalo. Una barra con menos de `MIN_CASOS` casos lleva además la trama
`#trama-fragil` y un asterisco junto al valor.

---

## Comparación con puntos

|               |                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Comparación · **Complejidad** Básica · **Helper** `puntosComparacion()`                                                 |
| **Marks**     | `dot` (x: categórico, y: cuantitativo), `ruleY`                                                                         |
| **Cuándo**    | El cero no es un anclaje necesario y las diferencias son sutiles: el punto enfatiza posición sobre área y reduce tinta. |
| **Color**     | Ninguno.                                                                                                                |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(data, { x: "categoria", y: "valor", fill: ROJO, r: 6, tip: true }),
  ],
})
```

---

---

# - Ranking

Elementos ordenados por valor.

---

## Barras horizontales

|               |                                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| **Categoría** | Ranking · **Complejidad** Básica · **Helper** `barrasH()`                        |
| **Marks**     | `barX` (x: cuantitativo, y: categórico ordinal), `ruleX`, `text`                 |
| **Cuándo**    | Más de 8 categorías o etiquetas largas. Es la forma por defecto de todo ranking. |
| **Color**     | Ninguno; opcionalmente resalte de una barra seleccionada.                        |

```js run=false
Plot.plot({
  marginLeft: 140,
  x: { grid: true, label: "Casos" },
  marks: [
    Plot.barX(data, {
      x: "valor",
      y: "categoria",
      fill: (d) => (d.categoria === seleccion ? ROJO : GRIS.fondo),
      sort: { y: "-x" },
      tip: true,
    }),
    Plot.text(data, {
      x: "valor",
      y: "categoria",
      text: (d) => compacto(d.valor),
      textAnchor: "start",
      dx: 6,
    }),
    Plot.ruleX([0]),
  ],
})
```

---

## Lollipop

|               |                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Categoría** | Ranking · **Complejidad** Intermedia · **Helper** `lollipop()`                                              |
| **Marks**     | `ruleY` (y: categórico, x1: 0, x2: valor), `dot` (x: valor, y: categórico)                                  |
| **Cuándo**    | Mismo caso que barras horizontales pero con valores muy dispares, donde las barras llenas saturan de tinta. |
| **Color**     | Ninguno, o categórico si el punto codifica grupo.                                                           |

```js run=false
// El tallo horizontal es un ruleY (ancla en y, se extiende en x).
// `Plot.ruleX` con x1/x2 falla: "missing channel: x2".
Plot.plot({
  marginLeft: 140,
  x: { grid: true },
  marks: [
    Plot.ruleY(data, {
      y: "categoria",
      x1: 0,
      x2: "valor",
      stroke: GRIS.fondo,
      strokeWidth: 2,
      sort: { y: "-x2" },
    }),
    Plot.dot(data, { x: "valor", y: "categoria", fill: ROJO, r: 5, tip: true }),
    Plot.ruleX([0]),
  ],
})
```

---

## Dot plot de Cleveland (dumbbell)

|               |                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Ranking · **Complejidad** Intermedia · **Helper** `dumbbell()`                                                                       |
| **Marks**     | `link` (x1/x2: dos valores, y: categórico), `dot` ×2 (uno por extremo, fill: serie)                                                  |
| **Cuándo**    | Comparar exactamente **dos** momentos o dos grupos por categoría. La longitud del segmento es la brecha, y esa brecha es el mensaje. |
| **Color**     | Par de dos tonos de `PALETA` (antes en azul, después en rojo), con leyenda obligatoria. El puntero va por fila (`Plot.pointerY`).    |

```js run=false
Plot.plot({
  marginLeft: 140,
  color: {
    legend: true,
    domain: ["Antes", "Después"],
    range: [PALETA[1], PALETA[0]],
  },
  x: { grid: true },
  marks: [
    Plot.link(data, {
      x1: "antes",
      x2: "despues",
      y: "categoria",
      stroke: GRIS.fondo,
      strokeWidth: 3,
      sort: { y: "-x2" },
    }),
    Plot.dot(data, { x: "antes", y: "categoria", fill: PALETA[1], r: 6 }),
    Plot.dot(data, {
      x: "despues",
      y: "categoria",
      fill: PALETA[0],
      r: 6,
      tip: true,
    }),
  ],
})
```

---

## Bump chart

|               |                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Ranking · **Complejidad** Avanzada · **Helper** `bump()`                                                            |
| **Marks**     | `line` (x: periodo, y: rango, stroke: entidad, curve `bump-x`), `dot`, `text` (etiqueta al final)                   |
| **Cuándo**    | Importa el **orden** y cómo cambia, no la magnitud. Máximo ~8 entidades; con más, las líneas se vuelven ilegibles.  |
| **Color**     | Categórico - identidad de la entidad, hasta 3 en color y el resto en gris. Etiqueta directa al final de cada línea. |

```js run=false
Plot.plot({
  y: { reverse: true, label: "Lugar", ticks: 10 },
  x: { type: "point", label: null },
  color: { domain: ENTIDADES, range: PALETA, legend: true },
  marginRight: 120,
  marks: [
    Plot.line(data, {
      x: "periodo",
      y: "rango",
      stroke: "entidad",
      strokeWidth: 2.5,
      curve: "bump-x",
    }),
    Plot.dot(data, {
      x: "periodo",
      y: "rango",
      fill: "entidad",
      r: 5,
      stroke: FONDO,
      tip: true,
    }),
    Plot.text(data, {
      filter: (d) => d.periodo === ULTIMO,
      x: "periodo",
      y: "rango",
      text: "entidad",
      textAnchor: "start",
      dx: 12,
      fontWeight: 600,
    }),
  ],
})
```

---

---

# - Distribución

Cómo se reparten los datos a lo largo de un rango.

---

## Histograma

|                |                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Distribución · **Complejidad** Básica · **Helper** `histograma()`                                                                        |
| **Marks**      | `rectY` (x: cuantitativo continuo, y: conteo), `ruleY`                                                                                   |
| **Transforms** | `binX`                                                                                                                                   |
| **Cuándo**     | Una variable continua, forma de la distribución desconocida. Revisa el número de bins: el default de Plot no siempre cuenta la historia. |
| **Color**      | Ninguno.                                                                                                                                 |

```js run=false
Plot.plot({
  y: { grid: true, label: "Frecuencia" },
  marks: [
    Plot.rectY(
      data,
      Plot.binX(
        { y: "count" },
        { x: "valor", fill: ROJO, inset: 0.5, tip: true }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Histograma apilado

|                |                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría**  | Distribución · **Complejidad** Intermedia · **Helper** `histograma({serie})`                                                                     |
| **Marks**      | `rectY` (x: continuo, y: conteo, fill: grupo), `ruleY`                                                                                           |
| **Transforms** | `binX` + `stackY` implícito                                                                                                                      |
| **Cuándo**     | Interesa la distribución total **y** la contribución de cada grupo. Si lo que importa es comparar formas entre grupos, usar facetas o ridgeline. |
| **Color**      | Categórico. Leyenda obligatoria; separación de 2px entre segmentos.                                                                              |

```js run=false
Plot.plot({
  color: { legend: true, domain: GRUPOS, range: PALETA_EXTENDIDA },
  y: { grid: true },
  marks: [
    Plot.rectY(
      data,
      Plot.binX(
        { y: "count" },
        {
          x: "valor",
          fill: "grupo",
          inset: 0.5,
          stroke: FONDO,
          strokeWidth: 1,
          tip: true,
        }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Histograma facetado

|                |                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Distribución · **Complejidad** Intermedia · **Helper** `histograma({faceta})`                           |
| **Marks**      | `rectY` (x: continuo, y: conteo, fy: grupo), `ruleY`                                                    |
| **Transforms** | `binX`                                                                                                  |
| **Cuándo**     | Comparar la **forma** de la distribución entre grupos sin solapamiento. Escala `x` compartida, siempre. |
| **Color**      | Categórico redundante con la faceta - legítimo, refuerza identidad.                                     |

```js run=false
Plot.plot({
  fy: { label: null },
  color: { domain: GRUPOS, range: PALETA },
  marks: [
    Plot.rectY(
      data,
      Plot.binX(
        { y: "count" },
        { x: "valor", fill: "grupo", fy: "grupo", inset: 0.5 }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Box plot

|               |                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Distribución · **Complejidad** Básica · **Helper** `caja()`                                                                      |
| **Marks**     | `boxY` (x: categórico, y: cuantitativo)                                                                                          |
| **Cuándo**    | Resumen de cinco números por grupo, con muchas observaciones. Oculta bimodalidad: si sospechas dos modas, usa violín o beeswarm. |
| **Color**     | Ninguno, o categórico por grupo.                                                                                                 |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.boxY(data, {
      x: "grupo",
      y: "valor",
      fill: ROJO,
      fillOpacity: 0.25,
      stroke: ROJO,
    }),
  ],
})
```

---

## Strip plot (código de barras)

|               |                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Categoría** | Distribución · **Complejidad** Básica · **Helper** `strip()`                                                |
| **Marks**     | `tickX` (x: cuantitativo, y: categórico opcional)                                                           |
| **Cuándo**    | Pocas observaciones (<200) y se quiere mostrar cada una. Con más, se satura: pasar a beeswarm o histograma. |
| **Color**     | Ninguno; opacidad baja para revelar densidad por acumulación.                                               |

```js run=false
Plot.plot({
  height: 100,
  marks: [
    Plot.tickX(data, {
      x: "valor",
      stroke: ROJO,
      strokeOpacity: 0.35,
      tip: true,
    }),
  ],
})
```

---

## Beeswarm

|                |                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Distribución · **Complejidad** Avanzada · **Helper** `beeswarm()`                                                                                       |
| **Marks**      | `dot` (x: cuantitativo, fill: grupo opcional)                                                                                                           |
| **Transforms** | `dodgeY`                                                                                                                                                |
| **Cuándo**     | Menos de ~500 puntos y cada observación importa (cada punto es una persona, un municipio). Combina la honestidad del strip con la forma del histograma. |
| **Color**      | Categórico si hay grupo - máximo 3 tonos (`--pairs all`); el resto a `OTRAS` en gris.                                                                   |

```js run=false
Plot.plot({
  height: 220,
  color: { legend: true, domain: GRUPOS.slice(0, MAX_GRUPOS_COLOR), range: PALETA },
  marks: [
    Plot.dot(
      data,
      Plot.dodgeY({
        x: "valor",
        fill: "grupo",
        r: 3.5,
        stroke: FONDO,
        strokeWidth: 0.5,
        tip: true,
      })
    ),
  ],
})
```

---

## Ridgeline

|                |                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Distribución · **Complejidad** Avanzada · **Helper** `ridgeline()`                                                                        |
| **Marks**      | `areaY` (x: continuo, y: conteo, fy: grupo)                                                                                               |
| **Transforms** | `binX`                                                                                                                                    |
| **Cuándo**     | 5+ grupos ordenables (por año, por mediana). El solapamiento vertical ahorra espacio y hace visible el desplazamiento de la distribución. |
| **Color**      | Secuencial si el orden de los grupos tiene magnitud (años); categórico si es identidad.                                                   |

```js run=false
Plot.plot({
  height: 420,
  fy: { label: null, domain: GRUPOS_ORDENADOS },
  color: { domain: GRUPOS_ORDENADOS, range: SECUENCIAL },
  marks: [
    Plot.areaY(
      data,
      Plot.binX(
        { y: "count" },
        {
          x: "valor",
          fy: "grupo",
          fill: "grupo",
          curve: "basis",
          fillOpacity: 0.85,
        }
      )
    ),
  ],
})
```

---

## Violín

|                |                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Distribución · **Complejidad** Avanzada · **Helper** `violin()`                                                                                       |
| **Marks**      | `areaX` (y: continuo, x: conteo, fx: grupo)                                                                                                           |
| **Transforms** | `binY`                                                                                                                                                |
| **Cuándo**     | Se necesita la forma completa por grupo - revela bimodalidad que el box plot esconde. Requiere n suficiente por grupo (>50); con pocos datos, miente. |
| **Color**      | Categórico por grupo.                                                                                                                                 |

```js run=false
Plot.plot({
  color: { domain: GRUPOS, range: PALETA },
  marks: [
    Plot.areaX(
      data,
      Plot.binY(
        { x: "count" },
        {
          y: "valor",
          fill: "grupo",
          fx: "grupo",
          curve: "basis",
          fillOpacity: 0.8,
        }
      )
    ),
  ],
  x: { axis: null },
})
```

---

## Pirámide poblacional

|               |                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Distribución · **Complejidad** Intermedia · **Helper** `piramide()`                                                 |
| **Marks**     | `barX` (x: valor con signo por sexo, y: grupo de edad, fill: sexo), `ruleX`, `axisY` central                        |
| **Cuándo**    | Estructura por edad y sexo. Un lado se niega numéricamente y el eje se formatea en absoluto para no leer "-40 000". |
| **Color**     | `PAR_SEXO`: ámbar para mujeres, azul para hombres. Nunca rosa y azul.                                               |

```js run=false
Plot.plot({
  x: { label: "Población", tickFormat: (d) => compacto(Math.abs(d)) },
  y: { label: "Edad", reverse: true },
  color: {
    legend: true,
    domain: ["Mujeres", "Hombres"],
    range: [PAR_SEXO.mujeres, PAR_SEXO.hombres],
  },
  marks: [
    Plot.barX(data, {
      x: (d) => (d.sexo === "Hombres" ? -d.poblacion : d.poblacion),
      y: "grupo_edad",
      fill: "sexo",
      inset: 0.5,
      tip: { format: { x: (d) => compacto(Math.abs(d)) } },
    }),
    Plot.ruleX([0], { stroke: "currentColor" }),
  ],
})
```

---

## Diagrama de Pareto

|               |                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Distribución · **Complejidad** Avanzada · **Helper** `pareto()`                                                                                                                       |
| **Marks**     | `barY` (x: categoría ordenada, y: valor), `lineY` (y: acumulado %), `dot`, `ruleY` en 80%                                                                                             |
| **Cuándo**    | Identificar las pocas categorías que explican la mayor parte del total. **Ojo:** la versión clásica usa doble eje, prohibido aquí - se normaliza todo a porcentaje sobre un solo eje. |
| **Color**     | Ninguno en barras; la línea acumulada en tinta neutra oscura.                                                                                                                         |

```js run=false
// Ambas series en % de un solo eje: barras = % del total, línea = % acumulado.
Plot.plot({
  y: { grid: true, label: "% del total", domain: [0, 100] },
  x: { label: null, domain: data.map((d) => d.categoria) },
  marginBottom: 80,
  marks: [
    Plot.barY(data, { x: "categoria", y: "pct", fill: ROJO, tip: true }),
    Plot.lineY(data, {
      x: "categoria",
      y: "pct_acumulado",
      stroke: GRIS.tinta,
      strokeWidth: 2,
    }),
    Plot.dot(data, {
      x: "categoria",
      y: "pct_acumulado",
      fill: GRIS.tinta,
      r: 4,
    }),
    Plot.ruleY([80], { stroke: GRIS.tinta, strokeDasharray: "4 4" }),
    Plot.ruleY([0]),
  ],
})
```

---

## Curva de Lorenz

|               |                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Distribución · **Complejidad** Avanzada · **Helper** `lorenz()`                                                                                    |
| **Marks**     | `areaY` (banda entre la curva y la diagonal), `lineY` (curva), `link` (diagonal de igualdad)                                                       |
| **Cuándo**    | Concentración o desigualdad de una magnitud (ingreso, presupuesto, casos por municipio). El área entre curva y diagonal es el coeficiente de Gini. |
| **Color**     | Un solo relleno para la brecha; diagonal en tinta neutra punteada.                                                                                 |

```js run=false
// data ordenado ascendente, con pct_poblacion y pct_valor acumulados (0–1).
Plot.plot({
  aspectRatio: 1,
  x: {
    label: "Proporción acumulada de la población",
    percent: true,
    grid: true,
  },
  y: { label: "Proporción acumulada del valor", percent: true, grid: true },
  marks: [
    Plot.areaY(data, {
      x: "pct_poblacion",
      y1: "pct_valor",
      y2: "pct_poblacion",
      fill: ROJO,
      fillOpacity: 0.15,
    }),
    Plot.link([{ x1: 0, y1: 0, x2: 1, y2: 1 }], {
      x1: "x1",
      y1: "y1",
      x2: "x2",
      y2: "y2",
      stroke: GRIS.tinta,
      strokeDasharray: "4 4",
    }),
    Plot.lineY(data, {
      x: "pct_poblacion",
      y: "pct_valor",
      stroke: ROJO,
      strokeWidth: 2.5,
      tip: true,
    }),
  ],
})
```

---

---

# - Cambio en el tiempo

Evolución de los valores a lo largo del tiempo.

---

## Línea

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Básica · **Helper** `lineas()`                                                                        |
| **Marks**     | `lineY` (x: temporal, y: cuantitativo), `ruleY`                                                                                             |
| **Cuándo**    | Serie temporal continua con intervalos regulares. Con menos de ~5 puntos, la línea sugiere una continuidad que no hay: usar barras o slope. |
| **Color**     | Ninguno para una serie.                                                                                                                     |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.lineY(data, {
      x: "fecha",
      y: "valor",
      stroke: ROJO,
      strokeWidth: 2,
      curve: "monotone-x",
    }),
    Plot.ruleY([0]),
    Plot.tip(data, Plot.pointerX({ x: "fecha", y: "valor" })),
  ],
})
```

---

## Multi-serie con etiqueta directa

|               |                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `lineas({serie})`                                         |
| **Marks**     | `lineY` (stroke: serie), `text` (etiqueta al final), `ruleY`                                                            |
| **Cuándo**    | 2–6 series. Con más, facetar (small multiples) o resaltar una contra el fondo gris del resto.                           |
| **Color**     | Categórico, hasta 3 series con color y el resto en `GRIS.trazo`. Leyenda **y** etiqueta directa al final de cada línea. |

```js run=false
Plot.plot({
  color: { legend: true, domain: SERIES, range: PALETA },
  y: { grid: true },
  marginRight: 110,
  marks: [
    Plot.lineY(data, {
      x: "fecha",
      y: "valor",
      stroke: "serie",
      strokeWidth: 2,
    }),
    Plot.text(
      data,
      Plot.selectLast({
        x: "fecha",
        y: "valor",
        z: "serie",
        text: "serie",
        fill: "serie",
        textAnchor: "start",
        dx: 8,
        fontWeight: 600,
      })
    ),
    Plot.ruleY([0]),
    Plot.tip(data, Plot.pointerX({ x: "fecha", y: "valor", z: "serie" })),
  ],
})
```

---

## Resalte sobre fondo (spaghetti destacado)

|               |                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `lineasResalte()`                                                      |
| **Marks**     | `lineY` ×2 (contexto gris + serie resaltada), `text`                                                                                 |
| **Cuándo**    | Muchas series (10–50) donde el mensaje es _una_ de ellas contra el conjunto. Sustituye al spaghetti ilegible sin perder el contexto. |
| **Color**     | Gris para el contexto, un solo color de marca para la resaltada.                                                                     |

```js run=false
Plot.plot({
  y: { grid: true },
  marginRight: 110,
  marks: [
    Plot.lineY(data, {
      x: "fecha",
      y: "valor",
      z: "entidad",
      stroke: GRIS.fondo,
      strokeWidth: 1,
    }),
    Plot.lineY(
      data.filter((d) => d.entidad === FOCO),
      {
        x: "fecha",
        y: "valor",
        stroke: ROJO,
        strokeWidth: 2.5,
      }
    ),
    Plot.text(
      data.filter((d) => d.entidad === FOCO),
      Plot.selectLast({
        x: "fecha",
        y: "valor",
        text: () => FOCO,
        fill: ROJO,
        textAnchor: "start",
        dx: 8,
        fontWeight: 600,
      })
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Área

|               |                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Básica · **Helper** `area()`                                             |
| **Marks**     | `areaY`, `lineY`, `ruleY`                                                                                      |
| **Cuándo**    | Una sola serie donde el volumen acumulado importa. El eje `y` **debe** empezar en cero; si no, el área miente. |
| **Color**     | Ninguno - relleno del color de marca al 20%.                                                                   |

```js run=false
Plot.plot({
  y: { grid: true, zero: true },
  marks: [
    Plot.areaY(data, {
      x: "fecha",
      y: "valor",
      fill: ROJO,
      fillOpacity: 0.18,
      curve: "monotone-x",
    }),
    Plot.lineY(data, {
      x: "fecha",
      y: "valor",
      stroke: ROJO,
      strokeWidth: 2,
      curve: "monotone-x",
    }),
    Plot.ruleY([0]),
  ],
})
```

---

## Área apilada

|                |                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `areaApilada()`                                                            |
| **Marks**      | `areaY` (fill: serie), `ruleY`                                                                                                           |
| **Transforms** | `stackY`                                                                                                                                 |
| **Cuándo**     | El total y su composición importan a la vez. Solo con series que **suman** algo real; no apilar tasas ni porcentajes de bases distintas. |
| **Color**      | Categórico con `PALETA_EXTENDIDA`, orden de apilado estable entre cortes.                                                                |

```js run=false
Plot.plot({
  color: { legend: true, domain: SERIES, range: PALETA_EXTENDIDA },
  y: { grid: true },
  marks: [
    Plot.areaY(data, {
      x: "fecha",
      y: "valor",
      fill: "serie",
      order: SERIES,
      tip: true,
    }),
    Plot.ruleY([0]),
  ],
})
```

---

## Área apilada al 100%

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `areaApilada({normalizar: true})`                                               |
| **Marks**     | `areaY` con `offset: "normalize"`                                                                                                             |
| **Cuándo**    | Importa la **composición** relativa y no el total. El total desaparece de la vista: si también importa, va en una gráfica aparte o en un KPI. |
| **Color**     | Categórico.                                                                                                                                   |

```js run=false
Plot.plot({
  y: { percent: true, grid: true, label: "% del total" },
  color: { legend: true, domain: SERIES, range: PALETA_EXTENDIDA },
  marks: [
    Plot.areaY(data, {
      x: "fecha",
      y: "valor",
      fill: "serie",
      offset: "normalize",
      order: SERIES,
      tip: true,
    }),
  ],
})
```

---

## Streamgraph

|               |                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Avanzada · **Helper** `streamgraph()`                                                                                                             |
| **Marks**     | `areaY` con `offset: "wiggle"`, curva suave                                                                                                                                             |
| **Cuándo**    | Muchas series y el interés es la textura del cambio, no la lectura de valores puntuales. Sin línea base fija, ningún valor individual es medible: es una forma expresiva, no analítica. |
| **Color**     | Categórico o secuencial ordenado.                                                                                                                                                       |

```js run=false
Plot.plot({
  color: { legend: true, domain: SERIES, range: PALETA_EXTENDIDA },
  axis: null,
  marks: [
    Plot.areaY(data, {
      x: "fecha",
      y: "valor",
      fill: "serie",
      offset: "wiggle",
      curve: "basis",
      order: SERIES,
      tip: true,
    }),
    Plot.axisX({ ticks: 6 }),
  ],
})
```

---

## Histograma temporal

|                |                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Cambio en el tiempo · **Complejidad** Básica · **Helper** `histogramaTemporal()`                                  |
| **Marks**      | `rectY` (x: fecha agrupada, y: conteo), `ruleY`                                                                   |
| **Transforms** | `binX` con `interval`                                                                                             |
| **Cuándo**     | Eventos discretos agregados por periodo. El `interval` (día/semana/mes) es una decisión editorial, no un default. |
| **Color**      | Ninguno, o secuencial si el periodo codifica magnitud.                                                            |

```js run=false
Plot.plot({
  y: { grid: true, label: "Eventos" },
  marks: [
    Plot.rectY(
      data,
      Plot.binX(
        { y: "count" },
        {
          x: "fecha",
          interval: "month",
          fill: ROJO,
          inset: 0.5,
          tip: true,
        }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Slope chart

|               |                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `slope()`                         |
| **Marks**     | `line` (dos puntos), `dot`, `text` a ambos lados                                                |
| **Cuándo**    | Exactamente dos momentos. La pendiente es el mensaje; el cruce de líneas señala reordenamiento. |
| **Color**     | Categórico por entidad (hasta 3), o `colorCambio` por dirección favorable o desfavorable.       |

```js run=false
Plot.plot({
  x: { type: "point", padding: 0.6, label: null },
  y: { grid: true },
  marginLeft: 110,
  marginRight: 110,
  marks: [
    Plot.line(data, {
      x: "periodo",
      y: "valor",
      z: "entidad",
      stroke: (d) =>
        colorCambio(d.cambio, SENTIDO),
      strokeWidth: 2,
    }),
    Plot.dot(data, { x: "periodo", y: "valor", fill: "currentColor", r: 4 }),
    Plot.text(
      data,
      Plot.selectFirst({
        x: "periodo",
        y: "valor",
        z: "entidad",
        text: "entidad",
        textAnchor: "end",
        dx: -8,
      })
    ),
    Plot.text(
      data,
      Plot.selectLast({
        x: "periodo",
        y: "valor",
        z: "entidad",
        text: (d) => compacto(d.valor),
        textAnchor: "start",
        dx: 8,
      })
    ),
  ],
})
```

---

## Línea + promedio móvil

|                |                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `lineasSuavizada()`                                                                 |
| **Marks**      | `dot` (crudo, tenue), `lineY` (suavizado)                                                                                                         |
| **Transforms** | `windowY` con `k`                                                                                                                                 |
| **Cuándo**     | Serie ruidosa con estacionalidad corta. La `k` debe coincidir con el ciclo (7 para semanal); el dato crudo queda visible detrás, nunca se oculta. |
| **Color**      | Gris el crudo, color de marca el suavizado.                                                                                                       |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.dot(data, { x: "fecha", y: "valor", fill: GRIS.fondo, r: 2 }),
    Plot.lineY(
      data,
      Plot.windowY(
        { k: 7 },
        {
          x: "fecha",
          y: "valor",
          stroke: ROJO,
          strokeWidth: 2.5,
        }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Línea + banda de confianza

|               |                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `lineasConBanda()`            |
| **Marks**     | `areaY` (y1: inferior, y2: superior), `lineY` (central)                                     |
| **Cuándo**    | La serie es una estimación con incertidumbre. Sin la banda, se leería como medición exacta. |
| **Color**     | Un solo matiz: banda al 15%, línea al 100%.                                                 |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.areaY(data, {
      x: "fecha",
      y1: "inferior",
      y2: "superior",
      fill: ROJO,
      fillOpacity: 0.15,
    }),
    Plot.lineY(data, { x: "fecha", y: "valor", stroke: ROJO, strokeWidth: 2 }),
    Plot.tip(data, Plot.pointerX({ x: "fecha", y: "valor" })),
  ],
})
```

---

## Gráfica de diferencia

|               |                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Avanzada · **Helper** `diferencia()`                                     |
| **Marks**     | `differenceY` (y1: referencia, y2: observado)                                                                  |
| **Cuándo**    | Comparar una serie contra una referencia (meta, año base, promedio) donde el signo de la brecha es el mensaje. |
| **Color**     | Polaridad: `CAMBIO.desfavorable` en el tramo donde la serie queda del lado malo según `SENTIDO`.               |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    Plot.differenceY(data, {
      x: "fecha",
      y1: "referencia",
      y2: "observado",
      positiveFill: CAMBIO.favorable,
      positiveFillOpacity: 0.25,
      negativeFill: CAMBIO.desfavorable,
      negativeFillOpacity: 0.25,
      stroke: "currentColor",
      strokeWidth: 1.5,
      tip: true,
    }),
  ],
})
```

---

## Serie indexada a base 100

|                |                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Cambio en el tiempo · **Complejidad** Intermedia · **Helper** `lineasIndexada()`                                           |
| **Marks**      | `lineY` (stroke: serie), `ruleY` en 100, `text`                                                                            |
| **Transforms** | `normalizeY` con `basis: "first"`                                                                                          |
| **Cuándo**     | **La alternativa correcta al doble eje.** Series de magnitudes muy distintas cuyo crecimiento relativo se quiere comparar. |
| **Color**      | Categórico.                                                                                                                |

```js run=false
Plot.plot({
  y: { grid: true, label: "Índice (primer periodo = 100)" },
  color: { legend: true, domain: SERIES, range: PALETA },
  marginRight: 110,
  marks: [
    // El basis va POSICIONAL, no dentro del objeto de opciones:
    // Plot.normalizeY({basis: "first"}, {...}) lanza "invalid basis".
    Plot.lineY(
      data,
      Plot.normalizeY("first", {
        x: "fecha",
        y: "valor",
        stroke: "serie",
        z: "serie",
        strokeWidth: 2,
      })
    ),
    Plot.ruleY([1], { stroke: GRIS.tinta, strokeDasharray: "4 4" }),
    Plot.text(
      data,
      Plot.selectLast(
        Plot.normalizeY("first", {
          x: "fecha",
          y: "valor",
          z: "serie",
          text: "serie",
          fill: "serie",
          textAnchor: "start",
          dx: 8,
          fontWeight: 600,
        })
      )
    ),
  ],
})
```

---

## Heatmap de calendario

|               |                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Avanzada · **Helper** `calendario()`                           |
| **Marks**     | `cell` (x: semana del año, y: día de la semana, fill: valor), faceta por año                         |
| **Cuándo**    | Valores diarios a lo largo de uno o más años; revela estacionalidad semanal y anual simultáneamente. |
| **Color**     | Secuencial de un matiz. Nunca arcoíris.                                                              |

```js run=false
Plot.plot({
  padding: 0,
  aspectRatio: 1,
  color: { type: "quantize", range: SECUENCIAL_RELLENO, legend: true, label: "Casos" },
  x: { axis: null },
  y: { tickFormat: (i) => "DLMMJVS"[i], tickSize: 0, label: null },
  fy: { reverse: true },
  marks: [
    Plot.cell(data, {
      x: (d) => d3.utcWeek.count(d3.utcYear(d.fecha), d.fecha),
      y: (d) => d.fecha.getUTCDay(),
      fy: (d) => d.fecha.getUTCFullYear(),
      fill: "valor",
      inset: 0.5,
      tip: true,
    }),
  ],
})
```

---

## Horizon chart

|               |                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cambio en el tiempo · **Complejidad** Avanzada · **Helper** `horizon()`                                                                                                |
| **Marks**     | `areaY` repetida por bandas con `clip`, faceta por serie                                                                                                               |
| **Cuándo**    | Muchas series temporales (10–40) en poco espacio vertical. Densidad máxima a cambio de una lectura que exige aprendizaje: no usar con público general sin explicación. |
| **Color**     | Secuencial de un matiz, una banda por escalón de magnitud.                                                                                                             |

```js run=false
const BANDAS = 4
const paso = maxValor / BANDAS

Plot.plot({
  height: BANDAS * 22 * SERIES.length,
  x: { axis: "top" },
  fy: { label: null, domain: SERIES },
  y: { axis: null, domain: [0, paso] },
  color: { type: "ordinal", range: SECUENCIAL_RELLENO },
  marks: d3.range(BANDAS).map((banda) =>
    Plot.areaY(data, {
      x: "fecha",
      y: (d) => d.valor - banda * paso,
      fy: "serie",
      fill: () => banda,
      clip: true,
      curve: "monotone-x",
    })
  ),
})
```

---

---

# - Parte-Todo

Cómo las partes componen un todo.

---

## Barras apiladas

|                |                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Parte-Todo · **Complejidad** Intermedia · **Helper** `barrasApiladas()`                                                                                         |
| **Marks**      | `barY` (x: categoría, y: valor, fill: subgrupo), `ruleY`                                                                                                        |
| **Transforms** | `groupX` + `stackY`                                                                                                                                             |
| **Cuándo**     | 2–6 subgrupos. Solo el segmento inferior comparte línea base: si hay que comparar el tercer segmento entre categorías, apilar es la forma equivocada - facetar. |
| **Color**      | Categórico con `PALETA_EXTENDIDA`, orden de apilado fijo, separación de 2px.                                                                                    |

```js run=false
Plot.plot({
  color: { legend: true, domain: SUBGRUPOS, range: PALETA_EXTENDIDA },
  y: { grid: true },
  marks: [
    Plot.barY(
      data,
      Plot.groupX(
        { y: "sum" },
        {
          x: "categoria",
          y: "valor",
          fill: "subgrupo",
          order: SUBGRUPOS,
          stroke: FONDO,
          strokeWidth: 1,
          tip: true,
        }
      )
    ),
    Plot.ruleY([0]),
  ],
})
```

---

## Barras apiladas al 100%

|                |                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Parte-Todo · **Complejidad** Intermedia · **Helper** `barrasApiladas({normalizar: true})`                                                                                 |
| **Marks**      | `barX` con `offset: "normalize"`, `ruleX`                                                                                                                                 |
| **Transforms** | `groupY` + `normalize`                                                                                                                                                    |
| **Cuándo**     | Comparar composición entre categorías de tamaños muy distintos. El tamaño del grupo se pierde: ponerlo en la etiqueta del eje o en un KPI, o se leerán como equivalentes. |
| **Color**      | Categórico.                                                                                                                                                               |

```js run=false
Plot.plot({
  x: { percent: true, label: "% de cada grupo" },
  color: { legend: true, domain: SUBGRUPOS, range: PALETA_EXTENDIDA },
  marginLeft: 140,
  marks: [
    Plot.barX(
      data,
      Plot.groupY(
        { x: "sum" },
        {
          y: "categoria",
          x: "valor",
          fill: "subgrupo",
          offset: "normalize",
          order: SUBGRUPOS,
          stroke: FONDO,
          strokeWidth: 1,
          tip: true,
        }
      )
    ),
    Plot.ruleX([0]),
  ],
})
```

---

## Escala de Likert divergente

|               |                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Avanzada · **Helper** `likert()`                                                                                                                    |
| **Marks**     | `barX` apilada con offset centrado en el punto neutro, `ruleX` en 0                                                                                                              |
| **Cuándo**    | Preguntas de acuerdo/desacuerdo. El anclaje en el punto neutro permite comparar el peso de cada polo entre reactivos - la clave de toda encuesta de discriminación o percepción. |
| **Color**     | Divergente, con gris para la categoría neutra.                                                                                                                                   |

```js run=false
// data en formato largo con un `offset` precalculado: la mitad de la
// categoría neutra más la suma de las categorías negativas, en negativo.
const ESCALA_LIKERT = {
  "Muy en desacuerdo": RAMPA[7],
  "En desacuerdo": RAMPA[5],
  "Ni de acuerdo ni en desacuerdo": RAMPA[4],
  "De acuerdo": RAMPA[3],
  "Muy de acuerdo": RAMPA[1],
}

Plot.plot({
  x: { label: "% de respuestas", tickFormat: (d) => Math.abs(d) + "%" },
  color: {
    legend: true,
    domain: Object.keys(ESCALA_LIKERT),
    range: Object.values(ESCALA_LIKERT),
  },
  marginLeft: 200,
  marks: [
    Plot.barX(data, {
      x: "pct",
      y: "reactivo",
      fill: "respuesta",
      offset: (d) => d.offset,
      order: Object.keys(ESCALA_LIKERT),
      stroke: FONDO,
      strokeWidth: 1,
      tip: true,
    }),
    Plot.ruleX([0], { stroke: "currentColor", strokeWidth: 1.5 }),
  ],
})
```

---

## Waffle

|               |                                                                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Básica · **Helper** `waffle()`                                                                                                             |
| **Marks**     | `waffleY` (x: categoría, y: conteo, fill: categoría)                                                                                                                    |
| **Cuándo**    | **La alternativa correcta al pie chart.** Proporciones donde cada cuadro es una unidad contable. Legible incluso con proporciones parecidas, que es donde el pie falla. |
| **Color**     | Categórico.                                                                                                                                                             |

```js run=false
Plot.plot({
  color: { legend: true, domain: CATEGORIAS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.waffleY(data, {
      x: "categoria",
      y: "valor",
      fill: "categoria",
      tip: true,
    }),
  ],
})
```

---

## Waffle apilado

|               |                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Intermedia · **Helper** `waffle({serie})`                                                              |
| **Marks**     | `waffleY` con `groupX`                                                                                                              |
| **Cuándo**    | Composición donde el cuadro conserva significado unitario ("1 cuadro = 100 personas"). Declarar el `unit` en el subtítulo, siempre. |
| **Color**     | Categórico.                                                                                                                         |

```js run=false
Plot.plot({
  color: { legend: true, domain: SUBGRUPOS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.waffleY(
      data,
      Plot.groupX(
        { y: "sum" },
        {
          x: "categoria",
          y: "valor",
          fill: "subgrupo",
          unit: 100,
          tip: true,
        }
      )
    ),
  ],
})
```

---

## Isotipo (pictograma)

|               |                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Intermedia · **Helper** `isotipo()`                                                          |
| **Marks**     | `waffleY` con `unit: 1`                                                                                                   |
| **Cuándo**    | Cifras pequeñas y humanas ("7 de cada 10"). Hace tangible el dato para público no técnico; inútil con magnitudes grandes. |
| **Color**     | Categórico, 2 o 3 tonos de `PALETA`.                                                                                      |

```js run=false
Plot.plot({
  height: 200,
  color: { legend: true, domain: CATEGORIAS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.waffleY(data, { y: "conteo", fill: "categoria", unit: 1, rx: "50%" }),
  ],
})
```

---

## Cascada (waterfall)

|               |                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Avanzada · **Helper** `cascada()`                                                                               |
| **Marks**     | `barY` (y1: inicio, y2: fin), `link` (conectores), `text`, `ruleY`                                                                           |
| **Cuándo**    | Descomponer cómo un valor inicial llega a uno final por incrementos y decrementos. Requiere datos precalculados con `inicio`/`fin`/`cambio`. |
| **Color**     | `colorCambio` por dirección; `GRIS.tinta` para las barras de total.                                                                          |

```js run=false
Plot.plot({
  x: { padding: 0.3, label: null },
  y: { grid: true },
  marks: [
    Plot.barY(data, {
      x: "paso",
      y1: "inicio",
      y2: "fin",
      fill: (d) =>
        d.tipo === "total" ? GRIS.tinta : colorCambio(d.cambio, SENTIDO),
      tip: true,
    }),
    Plot.link(data.slice(0, -1), {
      x1: "paso",
      x2: (d, i) => data[i + 1].paso,
      y1: "fin",
      y2: "fin",
      stroke: GRIS.trazo,
      strokeDasharray: "3 3",
    }),
    Plot.text(data, {
      x: "paso",
      y: (d) => Math.max(d.inicio, d.fin),
      text: (d) => d3.format("+,")(d.cambio),
      dy: -8,
      fontWeight: 600,
    }),
    Plot.ruleY([0]),
  ],
})
```

---

## Marimekko / Mosaico

|               |                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Parte-Todo · **Complejidad** Avanzada · **Helper** `marimekko()`                                                                                                                                 |
| **Marks**     | `rect` (x1/x2, y1/y2 precalculados), `text`                                                                                                                                                      |
| **Cuándo**    | Dos dimensiones categóricas donde el **tamaño del grupo** y su **composición** importan a la vez. El área compara mal entre columnas no alineadas: úsalo para panorama, no para lectura precisa. |
| **Color**     | Categórico por subgrupo.                                                                                                                                                                         |

```js run=false
// Requiere precálculo de x0/x1 (ancho ∝ tamaño del grupo) e y0/y1 (composición).
Plot.plot({
  x: { percent: true, label: "% del total →" },
  y: { percent: true, label: "↑ Composición interna" },
  color: { legend: true, domain: SUBGRUPOS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.rect(data, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: "subgrupo",
      inset: 1,
      tip: true,
    }),
    Plot.text(data, {
      filter: (d) => d.x1 - d.x0 > 0.06 && d.y1 - d.y0 > 0.08,
      x: (d) => (d.x0 + d.x1) / 2,
      y: (d) => (d.y0 + d.y1) / 2,
      text: (d) => d3.format(".0%")(d.y1 - d.y0),
      fill: GRIS.papel,
      fontSize: 11,
      fontWeight: 600,
    }),
  ],
})
```

---

## Treemap

|               |                                                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Avanzada · **Helper** `treemap()`                                                                                                                     |
| **Marks**     | `rect` (x1/x2/y1/y2 de `d3.treemap`), `text`                                                                                                                                       |
| **Cuándo**    | Jerarquía de dos niveles con muchas hojas (>20) donde una barra apilada ya no cabe. El área se compara mal con precisión: sirve para "quién domina", no para "cuánto exactamente". |
| **Color**     | Categórico por rama padre - máximo 8 ramas con `PALETA_EXTENDIDA` y etiqueta directa; el resto a `OTRAS`.                                                                          |

```js run=false
// Precálculo con d3-hierarchy:
// const raiz = d3.treemap().size([width, height]).padding(2).round(true)(
//   d3.hierarchy(jerarquia).sum((d) => d.valor).sort((a, b) => b.value - a.value));
// const hojas = raiz.leaves();

Plot.plot({
  axis: null,
  height,
  color: { legend: true, domain: RAMAS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.rect(hojas, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: (d) => d.parent.data.nombre,
      title: (d) =>
        `${d.parent.data.nombre} · ${d.data.nombre}\n${fmtEntero(d.value)}`,
      tip: true,
    }),
    Plot.text(hojas, {
      x: "x0",
      y: "y0",
      dx: 6,
      dy: 14,
      text: (d) => (d.x1 - d.x0 > 70 && d.y1 - d.y0 > 24 ? d.data.nombre : ""),
      fill: GRIS.papel,
      fontWeight: 600,
      fontSize: 11,
      textAnchor: "start",
    }),
  ],
})
```

---

## Icicle (partición jerárquica)

|               |                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Parte-Todo · **Complejidad** Avanzada · **Helper** `icicle()`                                                                                      |
| **Marks**     | `rect` (de `d3.partition`), `text`                                                                                                                 |
| **Cuándo**    | Jerarquía de **3+ niveles** donde el treemap ya no deja ver la estructura. Cada columna es un nivel de profundidad; se lee de izquierda a derecha. |
| **Color**     | Categórico por rama de primer nivel; los descendientes heredan el color del ancestro.                                                              |

```js run=false
// const raiz = d3.partition().size([height, width]).padding(1)(
//   d3.hierarchy(jerarquia).sum((d) => d.valor).sort((a, b) => b.value - a.value));
// Ojo: partition trabaja en [y, x]; se transpone al mapear.
const nodos = raiz.descendants().filter((d) => d.depth > 0)
const rama = (d) => d.ancestors().find((a) => a.depth === 1)?.data.nombre

Plot.plot({
  axis: null,
  height,
  color: { legend: true, domain: RAMAS, range: PALETA_EXTENDIDA },
  marks: [
    Plot.rect(nodos, {
      x1: "y0",
      x2: "y1",
      y1: "x0",
      y2: "x1",
      fill: rama,
      fillOpacity: (d) => 1 - (d.depth - 1) * 0.18,
      title: (d) => `${d.data.nombre}\n${fmtEntero(d.value)}`,
      tip: true,
    }),
    Plot.text(nodos, {
      x: "y0",
      y: (d) => (d.x0 + d.x1) / 2,
      dx: 6,
      text: (d) => (d.x1 - d.x0 > 16 ? d.data.nombre : ""),
      textAnchor: "start",
      fill: GRIS.papel,
      fontSize: 10,
    }),
  ],
})
```

---

---

# - Correlación

Relaciones entre dos o más variables.

---

## Dispersión

|               |                                                                             |
| ------------- | --------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Básica · **Helper** `dispersion()`            |
| **Marks**     | `dot` (x: cuantitativo, y: cuantitativo)                                    |
| **Cuándo**    | Menos de ~1000 puntos. Con más, hay sobreploteo: pasar a densidad o hexbin. |
| **Color**     | Ninguno.                                                                    |

```js run=false
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(data, {
      x: "variable_x",
      y: "variable_y",
      fill: ROJO,
      fillOpacity: 0.6,
      r: 4,
      tip: true,
    }),
  ],
})
```

---

## Dispersión con color

|               |                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Intermedia · **Helper** `dispersion({serie})`                                                                                                   |
| **Marks**     | `dot` (fill: grupo)                                                                                                                                                           |
| **Cuándo**    | Verificar si la relación difiere entre grupos. **Máximo 4 grupos** - en dispersión cualquier par puede quedar contiguo y aplica el límite de `--pairs all`. Con más, facetar. |
| **Color**     | Categórico, máximo 3 tonos (`gruposDeColor`); el resto a `OTRAS` en gris.                                                                                                     |

```js run=false
Plot.plot({
  grid: true,
  color: {
    legend: true,
    domain: GRUPOS.slice(0, MAX_GRUPOS_COLOR),
    range: PALETA,
  },
  marks: [
    Plot.dot(data, {
      x: "variable_x",
      y: "variable_y",
      fill: "grupo",
      r: 4,
      fillOpacity: 0.75,
      stroke: FONDO,
      strokeWidth: 0.5,
      tip: true,
    }),
  ],
})
```

---

## Burbujas

|               |                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Intermedia · **Helper** `burbujas()`                                                                                                            |
| **Marks**     | `dot` (r: cuantitativo)                                                                                                                                                       |
| **Cuándo**    | Tercera variable de magnitud (población, presupuesto). El radio se escala por **área**, nunca por diámetro - Plot lo hace bien por defecto; no forzar `r` como escala lineal. |
| **Color**     | Categórico, máximo 3 tonos (`gruposDeColor`); el resto a `OTRAS` en gris.                                                                                                     |

```js run=false
Plot.plot({
  grid: true,
  r: { range: [3, 22] },
  color: {
    legend: true,
    domain: GRUPOS.slice(0, MAX_GRUPOS_COLOR),
    range: PALETA,
  },
  marks: [
    Plot.dot(data, {
      x: "var_x",
      y: "var_y",
      r: "poblacion",
      fill: "grupo",
      fillOpacity: 0.65,
      stroke: FONDO,
      strokeWidth: 1,
      sort: { channel: "-r" },
      tip: true,
    }),
  ],
})
```

---

## Dispersión + regresión

|               |                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Intermedia · **Helper** `dispersion({regresion: true})`                                  |
| **Marks**     | `dot`, `linearRegressionY` (incluye banda de confianza)                                                                |
| **Cuándo**    | La tendencia lineal es la afirmación. Verificar antes que la relación sea lineal: sobre datos curvos, la recta engaña. |
| **Color**     | Gris los puntos, color de marca la recta.                                                                              |

```js run=false
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(data, {
      x: "var_x",
      y: "var_y",
      fill: GRIS.trazo,
      fillOpacity: 0.55,
      r: 3.5,
    }),
    Plot.linearRegressionY(data, {
      x: "var_x",
      y: "var_y",
      stroke: ROJO,
      strokeWidth: 2,
      fill: ROJO,
      fillOpacity: 0.12,
    }),
  ],
})
```

---

## Hexbin (densidad)

|                |                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Categoría**  | Correlación · **Complejidad** Avanzada · **Helper** `hexbin()`                                                           |
| **Marks**      | `hexagon` con `fill: "count"`                                                                                            |
| **Transforms** | `hexbin`                                                                                                                 |
| **Cuándo**     | Miles de puntos donde la dispersión se convierte en una mancha. El hexágono agrega y el color revela dónde está la masa. |
| **Color**      | Secuencial de un matiz.                                                                                                  |

```js run=false
Plot.plot({
  grid: true,
  color: { range: SECUENCIAL_RELLENO, legend: true, label: "Observaciones", type: "sqrt" },
  marks: [
    Plot.hexagon(
      data,
      Plot.hexbin(
        { fill: "count" },
        {
          x: "var_x",
          y: "var_y",
          binWidth: 14,
          stroke: FONDO,
          strokeWidth: 0.5,
          tip: true,
        }
      )
    ),
  ],
})
```

---

## Contornos de densidad

|               |                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Correlación · **Complejidad** Avanzada · **Helper** `densidad()`                                                   |
| **Marks**     | `density` (contornos), `dot` (muestra tenue)                                                                       |
| **Cuándo**    | Igual que hexbin pero cuando interesa la **forma** de la nube (clusters, bimodalidad) más que el conteo por celda. |
| **Color**     | Secuencial por umbral de densidad.                                                                                 |

```js run=false
Plot.plot({
  grid: true,
  color: { range: SECUENCIAL_RELLENO, legend: true, label: "Densidad" },
  marks: [
    Plot.density(data, {
      x: "var_x",
      y: "var_y",
      fill: "density",
      bandwidth: 22,
      thresholds: 12,
    }),
    Plot.dot(data, {
      x: "var_x",
      y: "var_y",
      r: 1.2,
      fill: GRIS.tinta,
      fillOpacity: 0.35,
    }),
  ],
})
```

---

## Heatmap

|               |                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Intermedia · **Helper** `heatmap()`                                                                                             |
| **Marks**     | `cell` (x: categórico, y: categórico, fill: cuantitativo), `text` (valor)                                                                                     |
| **Cuándo**    | Matriz de dos dimensiones categóricas. Ordenar filas y columnas por una estadística (suma, cluster), nunca alfabéticamente: el orden es la mitad del mensaje. |
| **Color**     | Secuencial de un matiz. El texto encima decide su color por luminosidad del fondo.                                                                            |

```js run=false
Plot.plot({
  padding: 0,
  marginLeft: 140,
  color: { type: "linear", range: SECUENCIAL_RELLENO, legend: true },
  marks: [
    Plot.cell(data, {
      x: "columna",
      y: "fila",
      fill: "valor",
      inset: 1,
      tip: true,
      sort: { y: "-fill", x: "-fill" },
    }),
    Plot.text(data, {
      x: "columna",
      y: "fila",
      text: (d) => formatear(d.valor, "pct"),
      fill: (d) => (d.valor > umbralClaro ? GRIS.papel : GRIS.tinta),
      fontSize: 10,
    }),
  ],
})
```

---

## Matriz de correlación

|               |                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Avanzada · **Helper** `matrizCorrelacion()`                                               |
| **Marks**     | `cell` (fill: r de Pearson), `text`                                                                                     |
| **Cuándo**    | Explorar relaciones entre muchas variables numéricas. Requiere precálculo de la matriz de correlación en formato largo. |
| **Color**     | **Divergente obligatorio** - el cero es un punto neutro real y −1 y +1 son opuestos. Dominio simétrico `[-1, 1]`.       |

```js run=false
Plot.plot({
  padding: 0,
  marginLeft: 140,
  marginBottom: 100,
  aspectRatio: 1,
  color: {
    type: "linear",
    domain: [-1, 0, 1],
    range: [RAMPA[7], RAMPA[4], RAMPA[1]],
    legend: true,
    label: "Correlación (r)",
  },
  x: { tickRotate: -45, label: null },
  y: { label: null },
  marks: [
    Plot.cell(matriz, {
      x: "var_a",
      y: "var_b",
      fill: "r",
      inset: 1,
      tip: true,
    }),
    Plot.text(matriz, {
      x: "var_a",
      y: "var_b",
      text: (d) => d3.format(".2f")(d.r),
      fill: (d) => (Math.abs(d.r) > 0.6 ? GRIS.papel : GRIS.tinta),
      fontSize: 10,
    }),
  ],
})
```

---

## Dispersión facetada (small multiples)

|               |                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Correlación · **Complejidad** Intermedia · **Helper** `dispersion({faceta})`                                                                           |
| **Marks**     | `dot` (fy o fx: grupo), `frame`, contexto gris                                                                                                         |
| **Cuándo**    | Más de 4 grupos - sustituye al color. Escalas compartidas entre paneles, siempre; el truco del contexto gris deja comparar cada panel contra el total. |
| **Color**     | Gris el contexto, color de marca el panel.                                                                                                             |

```js run=false
Plot.plot({
  grid: true,
  marks: [
    Plot.frame({ stroke: GRIS.rejilla }),
    // Contexto: todos los puntos, sin faceta, en gris.
    Plot.dot(data, {
      x: "var_x",
      y: "var_y",
      r: 2,
      fill: GRIS.fondo,
      facet: "exclude",
    }),
    Plot.dot(data, {
      x: "var_x",
      y: "var_y",
      fx: "grupo",
      r: 3,
      fill: ROJO,
      tip: true,
    }),
  ],
})
```

---

## Coordenadas paralelas

|                |                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría**  | Correlación · **Complejidad** Avanzada · **Helper** `coordenadasParalelas()`                                                                                                  |
| **Marks**      | `line` (x: variable, y: valor normalizado, z: id), `ruleX` (ejes), `text`                                                                                                     |
| **Transforms** | `normalizeY`                                                                                                                                                                  |
| **Cuándo**     | Datos multivariados (4–10 variables) para detectar perfiles y outliers. Requiere formato largo. El **orden de los ejes** cambia lo que se ve: es una decisión, no un default. |
| **Color**      | Categórico por grupo, opacidad baja.                                                                                                                                          |

```js run=false
Plot.plot({
  marginLeft: 80,
  marginRight: 80,
  x: { type: "point", padding: 0.5, label: null },
  y: { axis: null },
  color: {
    legend: true,
    domain: GRUPOS.slice(0, MAX_GRUPOS_COLOR),
    range: PALETA,
  },
  marks: [
    Plot.ruleX(VARIABLES, { stroke: GRIS.fondo }),
    // basis posicional (ver "Serie indexada a base 100").
    Plot.line(
      dataLargo,
      Plot.normalizeY("extent", {
        x: "variable",
        y: "valor",
        z: "id",
        stroke: "grupo",
        strokeOpacity: 0.35,
        strokeWidth: 1,
      })
    ),
  ],
})
```

---

## Matriz de burbujas

|               |                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Correlación · **Complejidad** Avanzada · **Helper** `matrizBurbujas()`                                        |
| **Marks**     | `dot` (x/y categóricos, r: medida 1, fill: medida 2)                                                          |
| **Cuándo**    | Matriz donde hacen falta **dos** medidas por celda (volumen y tasa). Si solo hay una, heatmap es más legible. |
| **Color**     | Secuencial o divergente según la segunda medida; el tamaño lleva la primera.                                  |

```js run=false
Plot.plot({
  marginLeft: 140,
  grid: true,
  r: { range: [0, 16] },
  color: {
    type: "linear",
    domain: [-1, 0, 1],
    range: [RAMPA[7], RAMPA[4], RAMPA[1]],
    legend: true,
  },
  marks: [
    Plot.dot(data, {
      x: "columna",
      y: "fila",
      r: "volumen",
      fill: "tasa",
      stroke: FONDO,
      strokeWidth: 0.5,
      tip: true,
    }),
  ],
})
```

---

---

# - Espacial

Datos sobre mapas y distribuciones geográficas.

---

## Coropleta de entidades

|               |                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Espacial · **Complejidad** Intermedia · **Helper** `mapaEntidades()`                                                                       |
| **Marks**     | `geo` (fill: cuantitativo), `geo` (mesh de fronteras)                                                                                      |
| **Cuándo**    | Una métrica por entidad federativa. Mapear **tasas**, nunca conteos absolutos: en absolutos el mapa solo muestra dónde vive la gente.      |
| **Color**     | Secuencial de un matiz con dominio fijo (o divergente anclada en la referencia si hay un punto neutro real). "Sin dato" en `GRIS.rejilla`. |

Antes de dibujar, se verifica que la llave de agregación tenga la misma
longitud que la del geojson (`"01"` contra `"1"` deja el mapa gris sin error).
Los polígonos no llevan borde: un trazo blanco se ve gris por antialiasing a
cualquier grosor. El contorno aparece solo al pasar el puntero, con
`conHoverGeo(figura)` y la regla `.mapa-hover` del CSS.

```js run=false
const figura = Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  color: {
    type: "linear",
    domain: [0, 100], // fijo: el mismo valor conserva su tono entre filtros
    ticks: [0, 25, 50, 75, 100],
    range: SECUENCIAL_RELLENO,
    unknown: GRIS.rejilla,
    legend: true,
    label: "% de la población",
  },
  marks: [
    Plot.geo(entidades, {
      fill: (d) => valores.get(d.properties.cve_ent),
      stroke: "none",
      title: (d) => {
        const v = valores.get(d.properties.cve_ent)
        return `${d.properties.nombre}\n${v == null ? "sin dato" : formatear(v, "pct")}`
      },
      tip: true,
    }),
    // Resaltar sin atenuar: la seleccionada conserva su color, solo gana contorno.
    Plot.geo(
      entidades.filter((d) => d.properties.cve_ent === seleccion),
      {
        stroke: GRIS.tinta,
        strokeWidth: 2.2,
        fill: "none",
      }
    ),
  ],
})
conHoverGeo(figura) // agrega .mapa-hover al SVG del mapa, no al de la leyenda
```

**Mapa mundial (PISA).** Proyección equirectangular recortada de 84°N a 58°S
(`LAT_N`, `LAT_S`, `LON_0 = 10`), alto derivado del ancho (`width * 142 / 360`),
`clip: "frame"` en las marcas y `Plot.frame` en `GRIS.papel`. Los códigos del
geojson son los mismos que los del dato; los países demasiado pequeños para un
polígono (Hong Kong, Macao, Malta, Singapur) se dibujan como punto.

**Mapa de teselas (MapLibre).** Queda fuera de Plot, pero sigue las mismas
reglas de color: rampa por cortes con `"sin dato"` como caso aparte de la
expresión, leyenda con muestra propia de "sin dato", contorno de hover en su
propia capa de líneas, y el mapa creado una sola vez con las órdenes que llegan
antes de `load` guardadas y aplicadas al cargar. En Grupos originarios la rampa
es BuPu (`RAMPA_MORADA`), por continuidad con el mapa del INIDE, y los cortes
son cuantiles calculados sobre el dato; no tiene variante oscura.

---

## Coropleta municipal

|               |                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `mapaMunicipios()`                                                                                  |
| **Marks**     | `geo` (fill: cuantitativo), `geo` (mesh estatal encima)                                                                                              |
| **Cuándo**    | Detalle municipal (2,475 polígonos). Escala por cuantiles casi siempre: la distribución municipal tiene colas largas que aplastan una escala lineal. |
| **Color**     | Secuencial por cuantiles.                                                                                                                            |

```js run=false
Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  // Cuantiles solo si la vista no se compara con otra: al filtrar, los cortes
  // se recalculan y el mismo valor cambia de tono. Con filtros, dominio fijo.
  color: {
    type: "quantile",
    n: 5,
    range: SECUENCIAL_RELLENO,
    unknown: GRIS.rejilla,
    legend: true,
  },
  marks: [
    Plot.geo(municipios, {
      fill: (d) => valores.get(d.properties.cve_mun),
      stroke: "none",
      tip: true,
      title: (d) => {
        const v = valores.get(d.properties.cve_mun)
        return `${d.properties.nombre}\n${v == null ? "sin dato" : formatear(v, "pct")}`
      },
    }),
    // Límite estatal en tinta, no en blanco: el blanco se funde con el papel.
    Plot.geo(meshEstatal, {
      stroke: GRIS.trazo,
      strokeWidth: 0.7,
      fill: "none",
    }),
  ],
})
```

---

## Mapa bivariado

|               |                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `mapaBivariado()` + `leyendaBivariada()`                                                                                                          |
| **Marks**     | `geo` (fill: clase bivariada precalculada), `frame`                                                                                                                                                |
| **Cuándo**    | La pregunta es dónde coinciden dos variables (puntaje alto **y** desigualdad baja). Con una sola variable, coropleta. Con tres, no: el ojo no descompone un color en tres cantidades.              |
| **Color**     | `BIVARIADO` 3×3, una fila por tercil de la primera variable y una columna por tercil de la segunda. La leyenda es una rejilla de 3×3 con los dos ejes rotulados, nunca una lista de nueve colores. |

```js run=false
// Cortes por terciles sobre el universo completo, no sobre la vista filtrada.
const tercil = (v, cortes) => (v == null ? null : v < cortes[0] ? 0 : v < cortes[1] ? 1 : 2)

Plot.plot({
  projection: { type: "equirectangular", rotate: [-LON_0, 0] },
  marks: [
    Plot.frame({ fill: GRIS.papel }),
    Plot.geo(paises, {
      fill: (d) => {
        const a = tercil(valA.get(d.id), CORTES_A)
        const b = tercil(valB.get(d.id), CORTES_B)
        return a == null || b == null ? GRIS.rejilla : BIVARIADO[a][b]
      },
      stroke: "none",
      clip: "frame",
      tip: true,
    }),
  ],
})
```

Los nueve tonos van de 1.25:1 a 10.13:1 contra blanco: la celda baja-baja
casi no se distingue del papel, y por eso el mapa pinta el marco en
`GRIS.papel` y "sin dato" en `GRIS.rejilla`, dos tonos distintos. Esta paleta no
la cubre el validador categórico; se midió a mano.

---

## Mapa de puntos

|               |                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Intermedia · **Helper** `mapaPuntos()`                                                 |
| **Marks**     | `geo` (base), `dot` (x: longitud, y: latitud)                                                                     |
| **Cuándo**    | Ubicaciones discretas (escuelas, incidentes). Con sobreploteo severo, pasar a mapa de burbujas agregado o hexbin. |
| **Color**     | Categórico por tipo, máximo 3 tonos.                                                                              |

```js run=false
Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  color: { legend: true, domain: TIPOS.slice(0, MAX_GRUPOS_COLOR), range: PALETA },
  marks: [
    Plot.geo(entidades, {
      fill: GRIS.papel,
      stroke: GRIS.fondo,
      strokeWidth: 0.5,
    }),
    Plot.dot(puntos, {
      x: "longitud",
      y: "latitud",
      fill: "tipo",
      r: 3,
      fillOpacity: 0.7,
      stroke: FONDO,
      strokeWidth: 0.4,
      tip: true,
    }),
  ],
})
```

---

## Mapa de burbujas

|               |                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Espacial · **Complejidad** Intermedia · **Helper** `mapaBurbujas()`                                                                                                            |
| **Marks**     | `geo` (base), `dot` (r: magnitud, en el centroide)                                                                                                                             |
| **Cuándo**    | **La forma correcta para conteos absolutos** sobre geografía, donde la coropleta engañaría. El área del círculo es proporcional al valor, sin importar el tamaño del polígono. |
| **Color**     | Un solo color; el tamaño lleva la magnitud.                                                                                                                                    |

```js run=false
Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  r: { range: [0, 28], label: "Casos" },
  marks: [
    Plot.geo(entidades, {
      fill: GRIS.papel,
      stroke: GRIS.fondo,
      strokeWidth: 0.5,
    }),
    Plot.dot(
      entidades,
      Plot.centroid({
        r: (d) => valores.get(d.properties.cve_ent),
        fill: ROJO,
        fillOpacity: 0.6,
        stroke: ROJO,
        strokeWidth: 1,
        sort: { channel: "-r" },
        tip: true,
      })
    ),
  ],
})
```

---

## Mapa de espigas

|               |                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `mapaEspigas()`                                                    |
| **Marks**     | `geo` (base), `spike` en el centroide                                                                               |
| **Cuándo**    | Alternativa a burbujas cuando hay sobreploteo: la espiga ocupa poco ancho y la altura se compara mejor que el área. |
| **Color**     | Un solo color.                                                                                                      |

```js run=false
Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  length: { range: [0, 90] },
  marks: [
    Plot.geo(entidades, {
      fill: GRIS.papel,
      stroke: GRIS.fondo,
      strokeWidth: 0.5,
    }),
    Plot.spike(
      entidades,
      Plot.centroid({
        length: (d) => valores.get(d.properties.cve_ent),
        stroke: ROJO,
        fill: ROJO,
        fillOpacity: 0.3,
        tip: true,
      })
    ),
  ],
})
```

---

## Cartograma de cuadrícula

|               |                                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `cartograma()`                                                                                                      |
| **Marks**     | `cell` (x: columna, y: fila, fill: valor), `text` (abreviatura)                                                                                                      |
| **Cuándo**    | Cada unidad geográfica debe pesar visualmente lo mismo - la coropleta le da a Chihuahua 60 veces el área de Tlaxcala. Requiere una tabla de posiciones fila/columna. |
| **Color**     | Secuencial.                                                                                                                                                          |

```js run=false
Plot.plot({
  axis: null,
  aspectRatio: 1,
  color: { type: "quantile", n: 6, range: SECUENCIAL_RELLENO, legend: true },
  marks: [
    Plot.cell(cuadricula, {
      x: "col",
      y: "fila",
      fill: "valor",
      inset: 2,
      tip: true,
    }),
    Plot.text(cuadricula, {
      x: "col",
      y: "fila",
      text: "abreviatura",
      fill: (d) => (d.valor > umbralClaro ? GRIS.papel : GRIS.tinta),
      fontSize: 10,
      fontWeight: 600,
    }),
  ],
})
```

---

## Ráster interpolado

|               |                                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `raster()`                                                                                                                                       |
| **Marks**     | `raster` (fill interpolado), `contour`, `dot` (puntos de origen)                                                                                                                                  |
| **Cuándo**    | Superficie continua a partir de mediciones dispersas (temperatura, contaminación). **Solo si el fenómeno es realmente continuo** - interpolar datos administrativos inventa valores donde no hay. |
| **Color**     | Secuencial.                                                                                                                                                                                       |

```js run=false
Plot.plot({
  color: { range: SECUENCIAL_RELLENO, legend: true },
  marks: [
    Plot.raster(data, {
      x: "longitud",
      y: "latitud",
      fill: "valor",
      interpolate: "barycentric",
    }),
    Plot.contour(data, {
      x: "longitud",
      y: "latitud",
      value: "valor",
      interpolate: "barycentric",
      stroke: GRIS.tinta,
      strokeOpacity: 0.25,
    }),
    Plot.dot(data, {
      x: "longitud",
      y: "latitud",
      r: 2,
      fill: GRIS.papel,
      stroke: GRIS.tinta,
    }),
  ],
})
```

---

## Campo vectorial

|               |                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------- |
| **Categoría** | Espacial · **Complejidad** Avanzada · **Helper** `campoVectorial()`                               |
| **Marks**     | `vector` (rotate: ángulo, length: magnitud)                                                       |
| **Cuándo**    | El dato tiene dirección y magnitud: viento, corrientes, gradientes, saldo migratorio direccional. |
| **Color**     | Secuencial por magnitud.                                                                          |

```js run=false
Plot.plot({
  color: { range: SECUENCIAL_RELLENO, legend: true, label: "Magnitud" },
  marks: [
    Plot.vector(data, {
      x: "longitud",
      y: "latitud",
      rotate: (d) => 180 + (d.direccion * 180) / Math.PI,
      length: "magnitud",
      stroke: "magnitud",
      tip: true,
    }),
  ],
})
```

---

---

# - Flujo y relaciones

Conexiones, flujos y estructura entre entidades.

---

## Mapa de arcos

|               |                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Categoría** | Flujo · **Complejidad** Avanzada · **Helper** `mapaArcos()`                                                                                                  |
| **Marks**     | `geo` (base), `arrow` con `bend`, `dot` (nodos)                                                                                                              |
| **Cuándo**    | Flujos origen-destino sobre geografía: migración, remesas, traslados. El grosor lleva el volumen; con más de ~50 arcos se satura, filtrar a los principales. |
| **Color**     | Un solo color con opacidad, o divergente por signo del saldo.                                                                                                |

```js run=false
Plot.plot({
  projection: { type: "mercator", domain: mexicoGeo },
  marks: [
    Plot.geo(entidades, {
      fill: GRIS.papel,
      stroke: GRIS.fondo,
      strokeWidth: 0.5,
    }),
    Plot.arrow(flujos, {
      x1: "lon_origen",
      y1: "lat_origen",
      x2: "lon_destino",
      y2: "lat_destino",
      bend: 22,
      stroke: ROJO,
      strokeOpacity: 0.45,
      strokeWidth: (d) => Math.sqrt(d.volumen) / 4,
      headLength: 6,
      tip: true,
    }),
    Plot.dot(nodos, { x: "longitud", y: "latitud", r: 3, fill: GRIS.tinta }),
  ],
})
```

---

## Diagrama de arcos

|               |                                                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Avanzada · **Helper** `diagramaArcos()`                                                                                                      |
| **Marks**     | `arrow` curvos sobre un eje, `dot` (nodos), `text`                                                                                                                   |
| **Cuándo**    | Red pequeña (<40 nodos) donde importa **quién se conecta con quién** y no la topología espacial. El orden de los nodos en el eje es la decisión de diseño principal. |
| **Color**     | Categórico por comunidad del nodo.                                                                                                                                   |

```js run=false
Plot.plot({
  marginLeft: 160,
  marginRight: 40,
  height: nodos.length * 22,
  x: { axis: null },
  y: { domain: ORDEN_NODOS, label: null },
  color: { legend: true, domain: COMUNIDADES, range: PALETA },
  marks: [
    Plot.arrow(enlaces, {
      x1: 0,
      y1: "origen",
      x2: 0,
      y2: "destino",
      bend: 90,
      sweep: "-y",
      stroke: GRIS.fondo,
      strokeOpacity: 0.6,
      strokeWidth: (d) => Math.sqrt(d.peso),
      headLength: 0,
    }),
    Plot.dot(nodos, {
      x: 0,
      y: "nombre",
      r: (d) => Math.sqrt(d.grado) * 2,
      fill: "comunidad",
      tip: true,
    }),
  ],
})
```

---

## Matriz de flujo (en lugar del diagrama de cuerdas)

|               |                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Avanzada · **Helper** `matrizFlujo()`                                                                                                                 |
| **Marks**     | `cell` (origen × destino, fill: volumen), `cell` (diagonal marcada)                                                                                                           |
| **Cuándo**    | Flujos entre todos los pares. **Nota:** el diagrama de cuerdas circular no es reproducible solo con Plot; la matriz de flujo es la forma equivalente - y además se lee mejor. |
| **Color**     | Secuencial; la diagonal (origen = destino) se marca aparte.                                                                                                                   |

```js run=false
Plot.plot({
  padding: 0,
  marginLeft: 140,
  marginBottom: 120,
  aspectRatio: 1,
  x: { label: "Destino →", tickRotate: -45 },
  y: { label: "↑ Origen" },
  color: { type: "sqrt", range: SECUENCIAL_RELLENO, legend: true, label: "Personas" },
  marks: [
    Plot.cell(flujos, {
      x: "destino",
      y: "origen",
      fill: "volumen",
      inset: 0.5,
      tip: true,
      sort: { x: "-fill", y: "-fill" },
    }),
    // Diagonal: no es flujo, es permanencia.
    Plot.cell(
      flujos.filter((d) => d.origen === d.destino),
      {
        x: "destino",
        y: "origen",
        fill: "none",
        stroke: GRIS.tinta,
        strokeWidth: 1,
      }
    ),
  ],
})
```

---

## Sankey

|               |                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Avanzada · **Helper** `sankey()`                                                                                                               |
| **Marks**     | `areaY` por enlace (curva `bump-x`), `rect` (nodos), `text`                                                                                                            |
| **Cuándo**    | Flujo que se conserva a través de 2–4 etapas (trayectorias escolares, presupuesto). Requiere `d3-sankey`. Si el flujo no se conserva entre etapas, el diagrama miente. |
| **Color**     | Categórico por nodo de origen; enlaces al 25% de opacidad.                                                                                                             |

```js run=false
// const {sankey} = await import("npm:d3-sankey");
// const grafo = sankey().nodeWidth(14).nodePadding(12)
//   .extent([[0, 0], [width, height]])({nodes, links});
// `enlaces` = array de arrays de puntos por enlace (muestreo de la curva).

Plot.plot({
  axis: null,
  height,
  marginRight: 120,
  color: { legend: true, domain: NODOS, range: PALETA_EXTENDIDA },
  marks: [
    enlaces.map((enlace) =>
      Plot.areaY(enlace, {
        x: "x",
        y1: "y0",
        y2: "y1",
        curve: "bump-x",
        fill: enlace[0].origen,
        fillOpacity: 0.25,
      })
    ),
    Plot.rect(grafo.nodes, {
      x1: "x0",
      x2: "x1",
      y1: "y0",
      y2: "y1",
      fill: "name",
      tip: true,
    }),
    Plot.text(grafo.nodes, {
      x: "x1",
      dx: 6,
      y: (d) => (d.y0 + d.y1) / 2,
      text: (d) => `${d.name} (${compacto(d.value)})`,
      textAnchor: "start",
      fontSize: 11,
    }),
  ],
})
```

---

## Red por fuerzas

|               |                                                                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Avanzada · **Helper** `red()`                                                                                                                                  |
| **Marks**     | `link` (aristas), `dot` (nodos), `text`                                                                                                                                                |
| **Cuándo**    | Estructura de una red donde importan clusters y centralidad. Requiere `d3-force` para precalcular posiciones. Con más de ~150 nodos se vuelve una bola de pelo: agregar por comunidad. |
| **Color**     | Categórico por comunidad.                                                                                                                                                              |

```js run=false
// Precálculo: d3.forceSimulation(nodos)
//   .force("link", d3.forceLink(enlaces).id((d) => d.id))
//   .force("charge", d3.forceManyBody().strength(-140))
//   .force("center", d3.forceCenter(width / 2, height / 2))
//   .stop().tick(300);

Plot.plot({
  axis: null,
  height,
  aspectRatio: 1,
  color: { legend: true, domain: COMUNIDADES, range: PALETA },
  marks: [
    Plot.link(enlaces, {
      x1: (d) => d.source.x,
      y1: (d) => d.source.y,
      x2: (d) => d.target.x,
      y2: (d) => d.target.y,
      stroke: GRIS.fondo,
      strokeWidth: (d) => Math.sqrt(d.peso),
    }),
    Plot.dot(nodos, {
      x: "x",
      y: "y",
      r: (d) => Math.sqrt(d.grado) * 2.5,
      fill: "comunidad",
      stroke: FONDO,
      strokeWidth: 1,
      tip: true,
    }),
    Plot.text(
      nodos.filter((d) => d.grado > umbral),
      {
        x: "x",
        y: "y",
        text: "nombre",
        dy: -12,
        fontSize: 10,
        fontWeight: 600,
      }
    ),
  ],
})
```

---

## Árbol jerárquico

|               |                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Intermedia · **Helper** `arbol()`                                                                                                                        |
| **Marks**     | `tree` (mark nativo de Plot)                                                                                                                                                     |
| **Cuándo**    | Jerarquía estricta donde importa la **estructura de ramificación** y no la magnitud (organigrama, taxonomía, clasificación temática). Plot lo resuelve nativo, sin d3-hierarchy. |
| **Color**     | Categórico por rama de primer nivel.                                                                                                                                             |

```js run=false
// `data` es un array PLANO de cadenas: ["Macrotema/Tema/Subtema", …].
// Con ese formato no se declara `path:` - Plot ya trata cada cadena como ruta.
// `fill` recibe la cadena completa, así que la rama se deriva del primer
// segmento; ojo con el separador inicial, de ahí el filter(Boolean).
const rama = (ruta) => String(ruta).split("/").filter(Boolean)[0]

Plot.plot({
  axis: null,
  height,
  marginLeft: 40,
  marginRight: 180,
  color: { domain: RAMAS, range: PALETA, legend: true },
  marks: [
    Plot.tree(data, {
      delimiter: "/",
      stroke: GRIS.fondo,
      fill: (d) => rama(d),
      textStroke: FONDO,
      fontSize: 11,
    }),
  ],
})
```

---

## Diagrama de conexión (link chart)

|               |                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Flujo · **Complejidad** Intermedia · **Helper** `conexiones()`                                                          |
| **Marks**     | `link`, `dot`, `text`                                                                                                   |
| **Cuándo**    | Pares origen-destino en un plano no geográfico: movimiento entre dos estados medidos, antes/después en dos dimensiones. |
| **Color**     | `colorCambio` por dirección favorable o desfavorable.                                                                   |

```js run=false
Plot.plot({
  grid: true,
  marks: [
    Plot.link(data, {
      x1: "x_inicio",
      y1: "y_inicio",
      x2: "x_fin",
      y2: "y_fin",
      stroke: (d) =>
        colorCambio(d.y_fin - d.y_inicio, SENTIDO),
      strokeWidth: 1.5,
      markerEnd: "arrow",
    }),
    Plot.dot(data, { x: "x_inicio", y: "y_inicio", r: 3, fill: GRIS.fondo }),
    Plot.dot(data, { x: "x_fin", y: "y_fin", r: 4.5, fill: ROJO, tip: true }),
    Plot.text(data, {
      x: "x_fin",
      y: "y_fin",
      text: "etiqueta",
      dx: 8,
      fontSize: 10,
    }),
  ],
})
```

---

---

# - Cifra y anotación

Formas que no son gráficas de datos pero que la biblioteca debe cubrir, porque
son la mitad de lo que se publica.

---

## Cifra destacada (hero number)

|               |                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cifra · **Complejidad** Básica · **Helper** `kpi()`                                                           |
| **Marks**     | Ninguno - HTML, no Plot                                                                                       |
| **Cuándo**    | **Un solo número es la respuesta.** Una gráfica de una sola barra siempre está mal: es una cifra con adornos. |
| **Color**     | Tinta de texto; el único acento rojo de la tarjeta es la cifra. El costado va en `--border-subtle`.           |

```js run=false
// components/kpi.js - HTML puro, sin Plot.
export function kpi({ valor, etiqueta, contexto, destacado = false }) {
  const el = document.createElement("div")
  el.className = destacado ? "kpi kpi--destacado" : "kpi"
  el.innerHTML = `
    <div class="kpi__valor">${valor}</div>
    <div class="kpi__etiqueta">${etiqueta}</div>
    ${contexto ? `<div class="kpi__contexto">${contexto}</div>` : ""}`
  return el
}
```

---

## Cifra con sparkline

|               |                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Cifra · **Complejidad** Intermedia · **Helper** `kpiSparkline()`                                                                          |
| **Marks**     | `lineY`, `dot` (último punto) - sin ejes                                                                                                  |
| **Cuándo**    | La cifra actual necesita su trayectoria para leerse bien. Sin ejes ni etiquetas: la forma es el mensaje, el número exacto está en el KPI. |
| **Color**     | Un solo matiz.                                                                                                                            |

```js run=false
Plot.plot({
  width: 180,
  height: 40,
  axis: null,
  margin: 2,
  marks: [
    Plot.lineY(serie, {
      x: "fecha",
      y: "valor",
      stroke: ROJO,
      strokeWidth: 1.5,
    }),
    Plot.dot(
      serie,
      Plot.selectLast({ x: "fecha", y: "valor", fill: ROJO, r: 3 })
    ),
  ],
})
```

---

## Gráfica con anotación

|               |                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categoría** | Anotación · **Complejidad** Intermedia · **Helper** `conAnotacion()`                                                                                                  |
| **Marks**     | Cualquiera + `ruleX`/`ruleY` de referencia, `text`, `rect` (banda de periodo)                                                                                         |
| **Cuándo**    | Un evento externo explica un quiebre de la serie (reforma legal, pandemia, cambio de metodología). **Un quiebre metodológico sin anotar es un error de publicación.** |
| **Color**     | Tinta neutra para toda la capa de anotación - nunca color de serie.                                                                                                   |

```js run=false
Plot.plot({
  y: { grid: true },
  marks: [
    // Banda de periodo anotado, al fondo.
    Plot.rect([{ x1: INICIO_EVENTO, x2: FIN_EVENTO }], {
      x1: "x1",
      x2: "x2",
      y1: 0,
      y2: maxValor,
      fill: GRIS.tinta,
      fillOpacity: 0.05,
    }),
    Plot.lineY(data, { x: "fecha", y: "valor", stroke: ROJO, strokeWidth: 2 }),
    Plot.ruleX([FECHA_CORTE], { stroke: GRIS.tinta, strokeDasharray: "4 4" }),
    Plot.text([{ fecha: FECHA_CORTE, valor: maxValor }], {
      x: "fecha",
      y: "valor",
      text: () => "Cambio de metodología",
      textAnchor: "start",
      dx: 8,
      fill: GRIS.tinta,
      fontSize: 11,
      lineWidth: 14,
    }),
    Plot.ruleY([0]),
  ],
})
```

---

---

# Formas descartadas

No entran a la biblioteca. Se documenta el motivo para no volver a discutirlo.

| Forma                                                       | Por qué no                                                                                                                                               | Qué usar                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Pie / dona**                                              | El ángulo se compara mal; falla justo cuando las proporciones son parecidas.                                                                             | Waffle, barras apiladas al 100%           |
| **Doble eje `y`**                                           | Dos escalas arbitrarias fabrican correlaciones visuales inexistentes.                                                                                    | Serie indexada a base 100, o dos gráficas |
| **Gauge / velocímetro**                                     | Enorme tinta para un solo número, sin contexto de serie.                                                                                                 | Cifra destacada + sparkline               |
| **Radar / araña**                                           | El área depende del orden arbitrario de los ejes y cambia al rotarlos; además no hay forma de ordenar 88 radares para compararlos.                       | Matriz-cinta, coordenadas paralelas       |
| **Color por mezcla RGB** (una variable por canal)           | Compacto, pero el ojo no descompone un color en tres cantidades: se distinguen unos cuatro niveles por canal. Agrupa perfiles, no deja consultar cifras. | Matriz-cinta con una sola escala          |
| **3D de cualquier tipo**                                    | La perspectiva distorsiona magnitudes y ocluye datos.                                                                                                    | La versión 2D de la misma forma           |
| **Nube de palabras**                                        | El tamaño codifica frecuencia pero el área depende del largo de la palabra.                                                                              | Barras horizontales                       |
| **Barra única**                                             | Es una cifra con adornos.                                                                                                                                | Cifra destacada                           |
| **Arcoíris secuencial** (`turbo`, `rainbow`)                | No es perceptualmente uniforme; inventa fronteras donde el dato es liso.                                                                                 | Rampa de un matiz                         |
| **Esquemas de Plot o d3 sin validar** (`reds`, `tableau10`) | No pasan por el validador y no cambian con el tema: `#4e79a7` queda igual sobre negro.                                                                   | Constantes de `base.js`                   |
| **Rosa y azul para el sexo**                                | Reproduce un estereotipo, y el par ámbar y azul ya está validado (ΔE 23.9 en claro, 24.7 en oscuro).                                                     | `PAR_SEXO`                                |

---

---

# Hacia `@socialdataibero/plot-kit`

Este catálogo es la especificación de la biblioteca. Grupos originarios y PISA
ya tienen buena parte de ella implementada en `components/base.js`,
`components/graficas.js` y `components/descargar.js`; la biblioteca parte de
esos módulos y no de cero. Orden de construcción:

**1. Núcleo** - `base.js` (las constantes de arriba con su par oscuro,
`aplicarModo()`, `alCambiarModo()`, `gruposDeColor()`, `colorCambio()`, `TIPO`,
`formatear()`, `punto()`, `diferencia()`), el glosario de indicadores con
`sentido` y definición por id, y los defaults de `Plot.plot` (márgenes, rejilla
en `GRIS.rejilla`, `ESTILO_EJES`).

**2. Envolturas** - `figura()`, `conDescarga()`, `conNota()` para el rótulo de
referencia fuera del lienzo, `explicacion()`, `verificado()`, `tablaDatos()`,
`avisoMuestra()`, `animar()` con `prefers-reduced-motion` y los roles ARIA de
Plot, `conHoverGeo()`, y la medición de ancho con un solo `ResizeObserver`.

**3. Helpers por categoría** - un módulo por sección de este catálogo. Firma
homogénea: `helper(datos, opciones)` donde `opciones` acepta siempre
`{x, y, serie, faceta, titulo, subtitulo, fuente, formato, sentido, width}`.
La forma según la densidad la decide un solo `geometria(v)`, no cada página.

**4. Guardas en tiempo de ejecución** - la biblioteca debe _avisar_ cuando se
viola una regla, no confiar en que se recuerde:

- más de 3 grupos con color en formas de todos los pares → agrupar en `OTRAS`
  con `gruposDeColor()`;
- más de 8 series en una forma de pares adyacentes → advertir y proponer
  `OTRAS`;
- una escala de color sin `domain` fijo en una vista con filtros → advertir;
- una rampa secuencial completa como relleno contra el papel → usar
  `SECUENCIAL_RELLENO`;
- un hex literal fuera de `base.js` → falla en CI (`grep` sobre `components/` y
  el CSS);
- `formato` ausente en una media (`pesos`, `horas`) → abortar en vez de caer al
  `"pct"` por omisión y publicar la cifra multiplicada por cien;
- eje `y` de un área que no empieza en cero → advertir;
- promedio de una columna que ya es tasa → advertir (`conTasa()` en su lugar);
- `x` de cadenas tipo `"2019-04"` sin `type: "band"` → corregir en automático.

**5. Precálculos** - módulo aparte (`layouts.js`) para lo que Plot no resuelve
solo: treemap, icicle, sankey, marimekko, red por fuerzas, offset de Likert,
curva de Lorenz, clases bivariadas. Entran datos crudos, salen posiciones listas
para `Plot.rect`.

**6. Pruebas** - los verificadores de [Accesibilidad medida](#accesibilidad-medida)
en CI, más snapshot de SVG por helper. `verificar:paleta` importa las
constantes de `base.js` en vez de copiarlas a mano (hoy PISA y Grupos
originarios las duplican y pueden separarse sin que nada falle), y agrega
`validateOrdinal` para `SECUENCIAL`, `SECUENCIAL_RELLENO` y cada mitad de
`RAMPA`. La paleta no se toca sin que el validador pase en ambos modos.

---

---

# Estado de adopción en los tableros

Revisión del código de los tres tableros hecha el 24 de septiembre de 2026. Se
registra qué parte de este catálogo cumple cada uno, para que el catálogo no
afirme más de lo que el código hace.

| Regla                                                 | Grupos originarios                        | PISA                                        | JCF stats                                    |
| ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| Paleta en un solo módulo con par oscuro               | Sí (`base.js`, pares de dos series)       | Sí (`base.js`, tres áreas)                  | Parcial: `modelo.js`, `PALETA_DARK` sin usar |
| Tema claro/oscuro con botón                           | Sí                                        | Sí                                          | No                                           |
| Máximo 3 tonos + `OTRAS`                              | Sí (dos por comparación)                  | Sí (`gruposDeColor`)                        | No: 8 ranuras en orden de aparición          |
| Rampa secuencial con extremo claro ≥ 2:1              | No (1.12:1)                               | No aplica (usa divergente)                  | No (1.38:1)                                  |
| Dominio fijo de color                                 | Sí en Plot (0-100); cuantiles en MapLibre | Sí (`DOMINIO_COLOR`), salvo `rejillaCeldas` | Solo en porcentajes                          |
| Divergente con pivote y `sentido`                     | Simétrica en cero                         | Pivote sí; `sentido` sin conectar           | No tiene divergente                          |
| Puntero por eje categórico, `maxRadius: Infinity`     | Sí                                        | No: `tip` por omisión en todas las marcas   | Sí                                           |
| Globo de 3 o 4 renglones                              | Sí                                        | No: 5 o 6 renglones                         | No: incluye "Casos"                          |
| Rótulo de referencia fuera del lienzo                 | Sí (`conNota`)                            | No: dentro del lienzo                       | No hay líneas de referencia                  |
| Figura completa con descarga PNG 2x / SVG             | Sí                                        | Sí                                          | No: título y fuente de Plot, sin descarga    |
| Tres desplegables                                     | Sí                                        | Sí                                          | Dos: sin "Fuentes y verificación"            |
| Trama y asterisco en muestra frágil                   | Sí                                        | No aplica                                   | Sí                                           |
| Verificadores (`a11y`, `paleta`, `render`, `filtros`) | Sí                                        | Sí                                          | Ninguno                                      |
| Correcciones de accesibilidad en el `head`            | Sí                                        | Sí                                          | No: solo traducción del buscador             |

Además de lo anterior, la revisión encontró inconsistencias dentro de cada
proyecto que conviene corregir antes de extraer la biblioteca. En PISA hay cuatro
versiones del rojo en oscuro (`#E8474F`, `#EE4C7C`, `#f06a70` y `#f27076`), con
`#f06a70` escrito cinco veces en el CSS pese a la regla de no escribir hex; las
paletas se validan contra `--surface-3` mientras las tarjetas pintan
`--surface-1` (`#fff` y `#0a0a09`); y `GRIS.papel` vale `#F7F7F5` aunque su
comentario dice que debe coincidir con `#fafaf9`. En Grupos originarios, la
gráfica de `src/index.md` escribe sus colores a mano y no cambia con el tema, y
`descargar.js` todavía nombra los archivos `pisa-…` y acredita a "Social Data
IBERO Educación". En JCF, el comentario de `modelo.js` dice "CVD ΔE ≥ 12" cuando
el valor registrado es 9.1, y nombra "naranja/magenta/aqua" a ranuras que son
naranja, ámbar y rosa. Ninguna de estas diferencias invalida las reglas del
catálogo; indican que se adoptaron en momentos distintos y que hace falta una
sola fuente para que no vuelvan a separarse.

Finalmente, la polaridad cambió respecto a la versión anterior de este catálogo.
Antes `DIVERGENTE` ponía el rojo en lo positivo y el azul en lo negativo; PISA y
Grupos originarios usan el rojo para lo desfavorable (PISA lo nombra `baja`,
porque ahí más puntaje es mejor). Por eso `DIVERGENTE` se sustituyó por `CAMBIO`
y `colorCambio(delta, sentido)`, y toda ficha que coloreaba por signo ahora
colorea por dirección favorable o desfavorable.
