> **Nota de la Plantilla.** Este archivo es una copia de consulta. Donde contradiga a [`../REGLAS.md`](../REGLAS.md), manda `REGLAS.md`
> (color sin morado, rojo y azul con significado declarado por capítulo, globo con personas, presencia en rampa continua de una tinta).
> Las correcciones punto por punto están en [`README.md`](README.md), sección 4.

# Guía de visualización - Social Data Ibero

Instrucciones para generar gráficas con **Observable Plot** dentro de
**Observable Canvas** (nodo JavaScript). Cada gráfica es una sola expresión
`Plot.plot({...})` que recibe las filas del nodo anterior como `datos`. Esta
guía cubre la gráfica en sí: color, tema, texto, tamaños, etiquetas, forma e
interacción. No cubre el sitio que la rodea.

Las reglas salen de tres tableros publicados y medidos: Observatorio PISA,
Grupos originarios y JCF stats. Los tamaños por omisión son los de PISA y Grupos
originarios. Cuando esta guía y una costumbre de Plot chocan, gana esta guía.

**Público.** Las gráficas las ve cualquier persona, sin instrucciones y sin
saber qué es un denominador. Una gráfica responde una sola pregunta y se
entiende en cinco segundos. Si claridad y detalle compiten, la gráfica se queda
con lo claro y el detalle se va al pie o a la tabla.

---

## 1. Reglas de oro

Si solo se leen diez líneas, son estas:

1. **Los colores salen de `TEMA`** (sección 3), nunca de un hex escrito en la
   gráfica ni de un esquema de Plot (`"reds"`, `"tableau10"`).
2. **Máximo tres colores de identidad.** A partir del cuarto grupo, los que
   sobran van a "Otras" en gris, o se reparten en facetas.
3. **El rojo marca lo desfavorable**, según el `sentido` del indicador, no
   según el signo del número.
4. **Toda barra lleva su valor escrito**: encima si es vertical, al lado si es
   horizontal. Toda línea lleva su etiqueta al final.
5. **La escala de color tiene dominio fijo**: `[0, 100]` en porcentajes, o una
   constante medida en magnitudes. Nunca el mínimo y máximo de la vista.
6. **El tooltip tiene tres o cuatro renglones**: dimensión, grupo, valor y
   población.
7. **El hover resalta con contorno**, emparejado por el eje categórico
   (`Plot.pointerX` o `Plot.pointerY`) y con `maxRadius: Infinity`.
8. **La forma cambia con la densidad**: un panel son barras, de 2 a 4 paneles
   van en facetas, y con más de 4 se usa un heatmap.
9. **Nunca promediar tasas ni sumar años.** Se suman numerador y denominador y
   luego se divide; los años se comparan en facetas.
10. **Un dato que no existe es `null` y se rotula "sin dato"**, nunca cero.

---

## 2. Bloque base

Toda gráfica empieza pegando este bloque (o importándolo de un nodo común). Todo
lo demás de la guía lo usa.

```js
// ---- Modo: "claro" por omisión. Cambiar solo esta línea. ----
const MODO = "claro"

const TEMAS = {
  claro: {
    superficie: "#fafaf9",          // fondo de la gráfica (contra este se validó)
    tinta: "#1D1D1B",               // texto principal y ejes
    tintaSuave: "#4a4845",          // subtítulo y pie (≥ 4.5:1)
    rojo: "#C4101B",                // marca; títulos y serie principal
    categorica: ["#C4101B", "#2166AC", "#B87709"],
    parSexo: { mujeres: "#B87709", hombres: "#2166AC" },
    cambio: { desfavorable: "#C4101B", favorable: "#2166AC" },
    gris: {
      fondo: "#C8C8C2",   // marcas de contexto
      trazo: "#8A8A84",   // "Otras", líneas de contexto, guías
      papel: "#F7F7F5",   // marco de mapa; texto sobre relleno oscuro
      tinta: "#3A3A36",   // contorno de hover, referencias, anotaciones
      rejilla: "#EDEDE9", // rejilla y "sin dato"
      regla: "#E2E8F0",   // línea del cero
    },
    divergente: ["#67001F", "#B2182B", "#D6604D", "#F4A582", "#E8E6E1",
                 "#92C5DE", "#4393C3", "#2166AC", "#053061"],
    secuencial: ["#FDE9E7", "#F8C4BE", "#EF9A93", "#E36F6A", "#D34246", "#C4101B", "#8E0B14"],
    bivariada: [["#E8E6E1", "#A9C3D8", "#5B92C0"],
                ["#E0B9BC", "#9E9EA8", "#5C6E9E"],
                ["#D08B92", "#B0707F", "#4A3A62"]],
  },
  oscuro: {
    superficie: "#1e1e1c",
    tinta: "#ecebe8",
    tintaSuave: "#c9c7c2",
    rojo: "#E8474F",                // #C4101B da 3.2:1 aquí; este da 5.4:1
    categorica: ["#EE4C7C", "#4A90D9", "#BE8700"],
    parSexo: { mujeres: "#BE8700", hombres: "#4A90D9" },
    cambio: { desfavorable: "#E8474F", favorable: "#4A90D9" },
    gris: {
      fondo: "#3E3E3B", trazo: "#75756E", papel: "#1E1E1C",
      tinta: "#D8D6D1", rejilla: "#2E2E2B", regla: "#2E2E2B",
    },
    divergente: ["#FFB3B8", "#F27C82", "#E8474F", "#A32C34", "#4A4A45",
                 "#2C5C8C", "#4A90D9", "#7FB6EA", "#B8D8F7"],
    secuencial: ["#3A2223", "#6A2C31", "#9A3A40", "#C64C52", "#E8666C", "#F58A8F", "#FFB3B8"],
    bivariada: [["#2E2E2C", "#2C4356", "#4E88B8"],
                ["#5A2A2E", "#5A5A63", "#6E86C4"],
                ["#8C4048", "#A0707C", "#B49AD6"]],
  },
}
const T = TEMAS[MODO]
// Para rellenos contra el fondo (mapas, celdas): la rampa sin sus dos pasos
// más claros, que no se distinguen del fondo (1.12:1).
T.relleno = T.secuencial.slice(2)

// ---- Texto ----
const TIPO = { ejes: 13, valor: 12.5, etiqueta: 11.5 }
const GLOBO = { fontSize: 13, textPadding: 9 }
const ESTILO = {
  fontFamily: 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: `${TIPO.ejes}px`,
  color: T.tinta,
  background: T.superficie,
}
const HALO = { stroke: T.superficie, strokeWidth: 3, paintOrder: "stroke" }

// ---- Formato de cifras (es-MX) ----
const punto = (v, dec = 0) =>
  Number.isFinite(v)
    ? v.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : "s/d"
const formatear = (v, formato = "pct") =>
  v == null || !Number.isFinite(v) ? "s/d"
  : formato === "pct" ? `${punto(v, 1)} %`
  : formato === "pesos" ? `$${punto(Math.round(v))}`
  : formato === "horas" ? `${punto(v, 1)} h`
  : punto(v)
const diferencia = (v, dec = 1) =>
  !Number.isFinite(v) ? "s/d" : v > 0 ? `+${punto(v, dec)}` : v < 0 ? `−${punto(-v, dec)}` : "±0"
const poblacion = (n) =>
  n >= 1e6 ? `${punto(n / 1e6, 2)} M` : n >= 1e4 ? `${punto(n / 1e3, 1)} mil` : punto(n)

// ---- Encabezado de la figura ----
const bloque = (tag, css, texto) => {
  const el = document.createElement(tag)
  el.style.cssText = css
  el.textContent = texto
  return el
}
const titulo = (t) => bloque("h3", `margin:0 0 .15rem;font:700 16px/1.3 ${ESTILO.fontFamily};color:${T.rojo}`, t)
const subtitulo = (t) => bloque("p", `margin:0 0 .5rem;font:13.5px/1.4 ${ESTILO.fontFamily};color:${T.tintaSuave}`, t)
const pie = (t) => bloque("p", `margin:.5rem 0 0;font:12.5px/1.5 ${ESTILO.fontFamily};color:${T.tintaSuave}`, t)

// ---- Color por polaridad ----
// sentido "alto": más es mejor (puntaje, cobertura). "bajo": más es peor (carencia).
const colorCambio = (delta, sentido = "alto") =>
  (sentido === "alto" ? delta < 0 : delta > 0) ? T.cambio.desfavorable : T.cambio.favorable

// ---- Color por entidad: tres tonos y "Otras" ----
// `orden`: lista fija del proyecto, con lo que el lector eligió al principio.
const MAX_COLOR = 3
function gruposDeColor(presentes, orden) {
  const pos = (g) => (orden.includes(g) ? orden.indexOf(g) : orden.length)
  const lista = [...presentes].sort((a, b) => pos(a) - pos(b) || a.localeCompare(b, "es"))
  const principales = lista.slice(0, MAX_COLOR)
  const resto = lista.length > MAX_COLOR
  return {
    domain: resto ? [...principales, "Otras"] : principales,
    range: resto ? [...T.categorica.slice(0, principales.length), T.gris.trazo]
                 : T.categorica.slice(0, principales.length),
    clase: (g) => (principales.includes(g) ? g : "Otras"),
  }
}
```

Con el bloque, toda gráfica se abre igual:

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO,
  width: Math.max(width, 560),
  // …
})
```

---

## 3. Color

### 3.1 Qué color para qué

| Rol | Cuándo | Qué usar |
| --- | --- | --- |
| **Ninguno** | Una sola serie | `T.rojo` plano, sin leyenda; el título nombra la serie |
| **Identidad** | 2 o 3 grupos que se comparan | `T.categorica` en su orden: rojo, azul, ámbar |
| **Tema contra resto** | El grupo del que trata la gráfica contra los demás | Rojo para el tema, azul para el resto |
| **Sexo** | Mujeres y hombres | `T.parSexo`: ámbar y azul. Nunca rosa y azul |
| **Magnitud** | Valor en mapa, celda o rampa | `T.relleno` (rellenos) o `T.secuencial` (líneas), dominio fijo |
| **Polaridad** | Cambio, brecha o distancia a una referencia | `colorCambio(delta, sentido)` o `T.divergente` con pivote |
| **Contexto** | Lo que está pero no es la pregunta | `T.gris.fondo`, u opacidad 0.11 si son muchas marcas |
| **Otras** | Grupos a partir del cuarto | `T.gris.trazo` con la etiqueta "Otras" |
| **Dos variables en un mapa** | Dónde coinciden dos cosas | `T.bivariada[a][b]`, terciles de cada una |

### 3.2 Reglas

- **Tres tonos y gris.** Ningún cuarto tono pasa el validador de daltonismo
  (`--pairs all`) en oscuro: se probaron seis y el mejor quedó a ΔE 4.8 de otro.
  Con cuatro o más grupos: los tres primeros en color, el resto en "Otras".
- **El color sigue a la entidad.** El orden de los tonos lo fija primero lo que
  el lector eligió y después una lista fija (`ORDEN_GRUPOS`), nunca cuántas
  filas tiene cada grupo en la vista: si no, al añadir un grupo se recolorean
  los demás. El dominio se declara sobre el universo completo. `gruposDeColor()`
  del bloque base hace las dos cosas y devuelve `{domain, range, clase}`.
- **Resaltar es contorno u opacidad, nunca otro color.** Lo elegido conserva su
  tono y gana un trazo `T.gris.tinta`; lo demás baja a `T.gris.fondo` u opacidad
  0.42, y el contexto lejano a 0.11.
- **Rampa por valor, no por posición.** Si una serie por año lleva rampa, el tono
  más oscuro cae en el valor más alto, no en el año más reciente.
- **Dominio fijo.** Porcentajes: `domain: [0, 100]` con `ticks: [0, 25, 50, 75,
  100]`. Magnitudes: una constante elegida midiendo el dato completo (PISA usa
  `[300, 620]`: ningún valor de 943 queda fuera y el rango real usa el 97 % de
  la rampa). Forzar los dos extremos en la leyenda.
- **Divergente anclada en la referencia**, no en cero, cuando mide distancia a un
  promedio: `{type: "diverging", pivot: promedio, symmetric: false, range:
  T.divergente}`. Si `sentido` es "bajo", invertir la rampa para que el rojo
  quede en lo desfavorable. El centro es gris, no el color del fondo: el fondo
  ya significa "sin dato".
- **Texto sobre relleno:** `T.gris.papel` sobre relleno oscuro y `T.tinta` sobre
  claro. En oscuro las rampas y esos dos tokens se invierten juntos, y la regla
  sigue funcionando.
- **Estado** (bien / aviso) no es una serie: nunca pintar un grupo con el verde o
  el ámbar de un aviso.

---

## 4. Tema claro y oscuro

- Se publica en **claro** por omisión. El oscuro se obtiene cambiando `MODO`;
  nada más en la gráfica cambia.
- **Toda gráfica declara su fondo y su tinta** (`style: ESTILO`). Sin eso, el
  lienzo hereda el fondo del entorno y los colores oscuros quedan sobre blanco.
- Los halos de las etiquetas usan `T.superficie`, nunca `"white"`.
- En oscuro el rojo de la paleta categórica se corre a magenta (`#EE4C7C`),
  porque rojo y ámbar se confunden bajo deuteranopía en esa luminosidad (ΔE 3.7).
  No "corregirlo" de vuelta a rojo.

---

## 5. Texto

### 5.1 Tipografía y tamaños

| Elemento | Tamaño | Peso | Color |
| --- | --- | --- | --- |
| Título de la gráfica | 16 px | 700 | `T.rojo` |
| Subtítulo | 13.5 px | 400 | `T.tintaSuave` |
| Ejes y rótulos de eje | 13 px (`TIPO.ejes`) | 400 | `T.tinta` |
| Valor sobre barra | 12.5 px (`TIPO.valor`) | 600 | `currentColor` + halo |
| Etiqueta de línea, punto o referencia | 11.5 px (`TIPO.etiqueta`) | 600 (700 si está elegida) | `currentColor` + halo |
| Tooltip | 13 px, `textPadding: 9` | - | el de Plot |
| Pie | 12.5 px | 400 | `T.tintaSuave` |
| "sin dato" en una celda vacía | 10.5 px | 400 | opacidad 0.75 |

Fuente: Inter, con las del sistema de respaldo. Una sola escala: ninguna marca
de texto inventa su propio `fontSize`.

### 5.2 Qué dice cada texto

- **Título**: la pregunta o la medida, en llano. "Asistencia escolar por edad",
  no "Distribución porcentual de la variable asiste".
- **Subtítulo**: se genera desde la selección, para que la imagen exportada diga
  qué se eligió: "Mujeres · 2024 · Ciudad de México". Si hay línea de
  referencia, su rótulo va aquí ("Línea punteada: promedio nacional, 42.1 %") y
  no dentro del lienzo, donde tapa ejes y filas.
- **Pie**: una frase de 12 a 35 palabras con la forma `fuente · qué representa
  cada marca`. "INEGI, ENIGH 2024. Cada punto es una entidad; la línea une a
  mujeres y hombres." La metodología no va aquí.
- **Ejes**: con unidad ("%", "Puntaje PISA →", "↑ Promedio"). `label: null` en
  el eje categórico cuando el título ya lo dice.
- **Tono**: describir, no concluir. Nada de "la caída es alarmante", "lo
  interesante es", ni la estructura "no es X, es Y". Sin guiones largos como
  paréntesis; los rangos de años llevan guion corto con espacios (2015 - 2025).

### 5.3 Cifras

| Tipo | Se escribe | Función |
| --- | --- | --- |
| Porcentaje | `12.4 %` (un decimal, espacio antes de %) | `formatear(v, "pct")` |
| Pesos | `$12,345` (sin decimales) | `formatear(v, "pesos")` |
| Horas | `38.5 h` | `formatear(v, "horas")` |
| Conteo | `12,345` | `punto(v)` |
| Población en tooltip | `1.23 M`, `12.3 mil` | `poblacion(n)` |
| Diferencia | `+2.1`, `−3.4` (signo U+2212), `±0` | `diferencia(v)` |
| Año | `2024`, sin separador de miles | `String(anio)`; en ejes, `tickFormat: String` (Plot escribe "2,024") |
| Sin dato | `s/d` en cifras, "sin dato" en rótulos | - |
| Muestra chica | valor con asterisco: `12.4 % *` | - |

El ×100 lo decide el formato: en `"pct"` una proporción se multiplica por 100;
en medias (pesos, horas) `num/den` ya es la cifra. Antes de publicar una media,
leerla en voz alta con su unidad: "cuatro mil horas a la semana" delata el
error.

---

## 6. Tamaños y espaciado

**Ancho:** el del contenedor, con piso de 560 px (`Math.max(width, 560)`).
**Alto:** fijo para gráficas de pocas marcas, y por fila en las que crecen con
los datos, para que cada fila conserve su grosor legible.

| Forma | Alto | Márgenes (T R B L) | Marcas |
| --- | --- | --- | --- |
| Barras verticales | 300 | 10 · 12 · 46 · 58 | `insetLeft/Right: 6`, `fillOpacity: 0.9`; techo del eje al 112 % del máximo (tope 100 en %) |
| Barras horizontales / ranking | `max(320, n × 18 + 96)` | 34 · 56 · 44 · 150 | `insetTop/Bottom: 2` |
| Dumbbell | `n × fila + 96`, fila 34 (19 si n > 12) | 44 · 44 · 36 · 130 (150 entidades) | enlace 3.2 redondeado; punto `r` 5.5 (4.2 si n > 12) |
| Pendiente (líneas entre años) | 420 | 24 · 150 · 46 · 60 | línea 2.6; punto `r` 5; `x: {type: "point", padding: 0.25}` |
| Líneas de contexto (spaghetti) | 520 | 34 · 128 · 46 · 92 | fondo: línea 1, opacidad 0.11; resaltada: 2.8 |
| Dispersión | 520; facetada `ceil(n/4) × 260 + 90` | 34 · 20 · 52 · 62 | `r` 5 (6.5 si ≤ 12 puntos, 7.5 elegido); borde `T.superficie` 1 |
| Heatmap / matriz | `max(340, filas × 17 + 124)` | 64 · 22 · 34 · 158 | `inset: 0.5`; eje x arriba |
| Rejilla de celdas con valor | `filas × 44 + 90` | 40 · 20 · 40 · 90 | `inset: 1.5`; valor 12.5 px, 600, halo |
| Apilada divergente (Likert) | `n × 14 + 96` | 44 · 30 · 36 · 168 | `insetTop/Bottom: 1.5` |
| Mapa de México | `width × 0.72` | 0 | `stroke: "none"` |
| Mapa mundial | `width × 142 / 360` | 0 | `stroke: "none"`, `clip: "frame"` |

- **Margen izquierdo según el rótulo más largo**: 130 px para categorías cortas,
  150 para entidades, 168 para países, 250 para nombres de indicador.
- **Margen derecho de 128 a 150 px** cuando las líneas llevan etiqueta al final.
- **Facetas**: máximo 4 columnas.
- **Referencias**: `strokeDasharray: "5 3"`, grosor 1.2, `T.gris.tinta`,
  opacidad 0.7.
- **Línea del cero**: `Plot.ruleY([0], {stroke: T.gris.regla})`, o grosor 1.4 en
  tinta si el cero tiene significado (sin diferencia).
- **Rejilla**: solo en el eje de valor (`grid: true`), nunca en el categórico.

---

## 7. Etiquetas de valor

El lector no debería tener que leer el eje para saber cuánto vale una barra.

| Forma | Dónde va el valor | Parámetros |
| --- | --- | --- |
| Barra vertical | Encima de la barra | `dy: -9`, `TIPO.valor`, peso 600, `HALO` |
| Barra horizontal | Al lado derecho de la punta | `textAnchor: "start"`, `dx: 8`, `TIPO.valor` |
| Barra negativa horizontal | Al lado izquierdo | `textAnchor: "end"`, `dx: -8` |
| Dumbbell | Sobre cada punto | `dy: -11`, `TIPO.etiqueta`, `HALO` |
| Línea | Al final (y al inicio si son pocas) | fin: `"start"`, `dx: 10`, texto "Serie: 12.4 %"; inicio: `"end"`, `dx: -10`, solo el valor |
| Punto de dispersión | Encima, solo los elegidos | `dy: -12`, `TIPO.etiqueta`, peso 600, halo 3.5 |
| Celda de heatmap | Dentro, si caben | 12.5 px, peso 600, color según el relleno |
| Segmento apilado | Dentro, solo si el segmento mide más de 28 px | `T.gris.papel` sobre relleno oscuro |

**Cuándo se escriben todas y cuándo no:**

- Hasta 8 marcas (`POCAS = 8`): todas llevan valor.
- Barras: hasta 14 barras, todas; con más, solo la elegida y las extremas.
- Dumbbell: con más de 12 filas o con facetas, sin valores (el tooltip y la
  tabla los tienen).
- Líneas: con más de 8, solo la elegida y la referencia llevan etiqueta.

Toda etiqueta sobre algo dibujado lleva halo del color del fondo (`HALO`), para
leerse aunque cruce una rejilla o una línea.

---

## 8. Interacción

### 8.1 Hover

Contorno sin relleno, emparejado por el eje categórico. `Plot.pointer` a secas
empareja por distancia a la punta de la marca y en barras resalta la fila
equivocada.

| Forma | Puntero |
| --- | --- |
| Barras verticales, apiladas verticales | `Plot.pointerX` |
| Barras horizontales, ranking, dumbbell, apiladas horizontales | `Plot.pointerY` |
| Dispersión, celdas de heatmap, mapas | `Plot.pointer` |

Siempre `maxRadius: Infinity` en barras y filas: el radio por omisión (40 px)
deja zonas muertas entre marcas.

```js
// Contorno de hover para barras verticales
Plot.barY(datos, Plot.pointerX({
  x: "grupo", y: "valor", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8,
  insetLeft: 6, insetRight: 6, maxRadius: Infinity,
}))
```

### 8.2 Tooltip

Tres o cuatro renglones, siempre en este orden: **dimensión, grupo, valor,
población**. La población es quienes cumplen (`num`), no el total (`den`), y se
omite cuando el indicador es de pesos u horas (ahí `num` es dinero o tiempo, no
gente). El intervalo, la brecha, los casos de muestra y el denominador no van en
el tooltip.

```js
Plot.tip(datos, Plot.pointerX({
  x: "grupo", y: "valor", maxRadius: Infinity, ...GLOBO,
  title: (d) => [
    `${d.dimension}: ${d.grupo}`,
    formatear(d.valor, FORMATO) + (d.fragil ? " *" : ""),
    FORMATO === "pct" ? `Población: ${poblacion(d.num)}` : null,
  ].filter(Boolean).join("\n"),
}))
```

### 8.3 Movimiento

Sin animaciones permanentes. Si el entorno anima la entrada, que respete
`prefers-reduced-motion`. Nada se mueve detrás de texto que se lee.

---

## 9. Elegir la forma

### 9.1 Por pregunta

| Pregunta | Forma | Receta |
| --- | --- | --- |
| ¿Cuánto vale cada grupo? (≤ 12 grupos, nombres cortos) | Barras verticales | 10.1 |
| ¿Quién está arriba y quién abajo? (muchos, nombres largos) | Barras horizontales ordenadas | 10.2 |
| ¿Cuánto separa a dos grupos en cada categoría? | Dumbbell | 10.3 |
| ¿Cómo cambió entre dos o tres años? | Pendiente | 10.4 |
| ¿Cómo evoluciona una serie larga? | Líneas con etiqueta al final | 10.5 |
| ¿De qué se compone el total? | Barras apiladas al 100 % | 10.6 |
| ¿Cómo varía un valor entre dos categorías cruzadas? | Heatmap | 10.7 |
| ¿Se relacionan dos medidas? | Dispersión | 10.8 |
| ¿Dónde pasa? | Coropleta con dominio fijo | 10.9 |
| ¿Dónde coinciden dos cosas? | Mapa bivariado | 10.10 |
| ¿Qué tan de acuerdo están? | Apilada divergente (Likert) | 10.11 |
| ¿Cómo se reparten los valores de una medida? | Histograma | 11.1 |
| ¿Cómo se comparan las distribuciones de varios grupos? | Caja (box plot) | 11.2 |
| ¿Cómo se compone la población por edad y sexo? | Pirámide | 11.3 |
| ¿Cuántos de cada 100? | Waffle | 11.4 |
| Ranking con muchas filas | Lollipop | 11.5 |
| ¿Qué lugar ocupa cada quien año con año? | Bump chart | 11.6 |
| ¿Qué partes explican el cambio de un total? | Cascada | 11.7 |
| ¿Cómo varía día con día? | Calendario | 11.8 |
| ¿Se relacionan dos medidas con miles de puntos? | Hexbin | 11.9 |
| ¿Cuántos hay en cada lugar? (conteos, no tasas) | Mapa de burbujas | 11.10 |
| ¿Cómo se reparte un total entre muchas partes? | Treemap | 11.11 |
| ¿Qué contiene qué, y cuánto pesa? | Icicle | 11.12 |
| ¿De dónde a dónde se mueve? | Sankey | 11.13 |
| ¿Quién se conecta con quién? | Red | 11.14 |
| Un solo número es la respuesta | Cifra destacada, no gráfica | - |

### 9.2 Por densidad

La misma pregunta cambia de forma según cuántos paneles salen de la selección:

- **1 panel** → barras (o dumbbell si hay dos series).
- **2 a 4 paneles** (años, sexo, regiones) → la misma forma en facetas, con la
  misma escala en todas.
- **Más de 4 paneles** → heatmap: veinte paneles de barras no se leen.
- Con más de 12 filas, el dumbbell baja la fila de 34 a 19 px y quita los
  valores; con más de 32, el ranking muestra las primeras 32 y la elegida.
- El rótulo que identifica una marca va en **todas** las facetas, no solo en la
  primera. Una faceta sin dato para una entidad dice "sin dato".

### 9.3 Formas que no se usan

| Forma | Por qué no | En su lugar |
| --- | --- | --- |
| Pastel / dona | El ángulo se compara mal justo cuando las partes se parecen | Apiladas al 100 %, waffle |
| Doble eje y | Dos escalas arbitrarias fabrican correlaciones | Índice base 100, o dos gráficas |
| Radar | El área depende del orden de los ejes y no se pueden ordenar muchos | Heatmap / matriz |
| Color por mezcla RGB | El ojo no descompone un color en tres cantidades | Heatmap con una sola escala |
| 3D | Distorsiona y oculta | La versión 2D |
| Barra única | Es una cifra con adornos | Cifra destacada |
| Arcoíris (`turbo`, `rainbow`) | Inventa fronteras donde el dato es liso | Rampa de un matiz |
| Esquemas de Plot o d3 (`reds`, `tableau10`) | No están validados y no cambian con el tema | Colores de `T` |
| Sunburst y dona jerárquica | Mismo defecto del pastel: ángulos y arcos de radios distintos no se comparan | Icicle |
| Empaquetado de círculos (circle packing) | Compara áreas de círculos, que el ojo subestima, y desperdicia el espacio entre ellos | Treemap |
| Diagrama de cuerdas (chord) | Los arcos cruzados no se pueden seguir ni leer como cantidad | Matriz origen-destino (heatmap), Sankey |
| Streamgraph | El eje central flota y ninguna capa se puede medir | Área apilada con base en cero, o líneas |
| Coropleta de conteos | Solo muestra dónde vive más gente | Tasa en coropleta, o mapa de burbujas |

---

## 10. Recetas

Todas suponen el bloque base de la sección 2, `FORMATO` (`"pct"`, `"pesos"`,
`"horas"`) y datos ya agregados (una fila por marca).

### 10.1 Barras verticales

```js
const techo = FORMATO === "pct"
  ? Math.min(d3.max(datos, (d) => d.valor) * 1.12, 100)
  : d3.max(datos, (d) => d.valor) * 1.12

Plot.plot({
  title: titulo("Asistencia escolar por grupo de edad"),
  subtitle: subtitulo("Mujeres · 2024 · Nacional"),
  caption: pie("INEGI, ENIGH 2024. Cada barra es el porcentaje de personas del grupo que asiste a la escuela."),
  style: ESTILO, width: Math.max(width, 560), height: 300,
  marginTop: 10, marginRight: 12, marginBottom: 46, marginLeft: 58,
  x: { label: null },
  y: { domain: [0, techo], grid: true, label: FORMATO === "pct" ? "%" : null },
  marks: [
    Plot.ruleY([0], { stroke: T.gris.regla }),
    Plot.barY(datos, { x: "grupo", y: "valor", fill: T.rojo, fillOpacity: 0.9, insetLeft: 6, insetRight: 6 }),
    Plot.text(datos, {
      x: "grupo", y: "valor", dy: -9, fontSize: TIPO.valor, fontWeight: 600, fill: "currentColor", ...HALO,
      text: (d) => formatear(d.valor, FORMATO) + (d.fragil ? " *" : ""),
    }),
    Plot.barY(datos, Plot.pointerX({ x: "grupo", y: "valor", fill: "none", stroke: T.gris.tinta,
      strokeWidth: 1.8, insetLeft: 6, insetRight: 6, maxRadius: Infinity })),
    Plot.tip(datos, Plot.pointerX({ x: "grupo", y: "valor", maxRadius: Infinity, ...GLOBO,
      title: (d) => `Edad: ${d.grupo}\n${formatear(d.valor, FORMATO)}\nPoblación: ${poblacion(d.num)}` })),
  ],
})
```

Con dos o tres series, la serie va en `x` y la categoría en `fx` (nunca dos
series en la misma `x`, que Plot apila sin avisar), `color: {domain: SERIES,
range: T.categorica, legend: true}` y `x: {axis: null}`.

### 10.2 Barras horizontales ordenadas (ranking)

```js
const n = datos.length
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.max(320, n * 18 + 96),
  marginTop: 34, marginRight: 56, marginBottom: 44, marginLeft: 150,
  x: { grid: true, label: "% →" },
  y: { label: null, tickSize: 0 },
  marks: [
    Plot.barX(datos, {
      y: "entidad", x: "valor", sort: { y: "-x" }, insetTop: 2, insetBottom: 2,
      fill: (d) => (d.entidad === ELEGIDA ? T.rojo : T.gris.fondo),
    }),
    Plot.text(datos, {
      y: "entidad", x: "valor", textAnchor: "start", dx: 8, fontSize: TIPO.valor, fill: "currentColor",
      text: (d) => formatear(d.valor, FORMATO),
    }),
    Plot.ruleX([0], { stroke: T.gris.regla }),
    Plot.barX(datos, Plot.pointerY({ y: "entidad", x: "valor", fill: "none", stroke: T.gris.tinta,
      strokeWidth: 1.8, insetTop: 2, insetBottom: 2, maxRadius: Infinity })),
    Plot.tip(datos, Plot.pointerY({ y: "entidad", x: "valor", maxRadius: Infinity, ...GLOBO,
      title: (d) => `${d.entidad}\n${formatear(d.valor, FORMATO)}\nPoblación: ${poblacion(d.num)}` })),
  ],
})
```

Sin entidad elegida, todas las barras van en `T.rojo`. El promedio nacional, si
entra, va como fila con rótulo en negritas y relleno `T.gris.tinta`.

### 10.3 Dumbbell (dos grupos por fila)

```js
// datos: {fila, serie, valor}, dos filas por categoría
const SERIES = ["Población indígena", "Resto de la población"]
const nFilas = new Set(datos.map((d) => d.fila)).size
const fila = nFilas > 12 ? 19 : 34
const pares = d3.groups(datos, (d) => d.fila).map(([f, v]) => ({
  fila: f,
  a: v.find((d) => d.serie === SERIES[0])?.valor,
  b: v.find((d) => d.serie === SERIES[1])?.valor,
}))

Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: nFilas * fila + 96,
  marginTop: 44, marginRight: 44, marginBottom: 36, marginLeft: 150,
  x: { axis: "top", grid: true, domain: FORMATO === "pct" ? [0, 100] : undefined, label: "% →" },
  y: { label: null, domain: ORDEN_FILAS },
  color: { domain: SERIES, range: T.categorica.slice(0, 2), legend: true },
  marks: [
    Plot.link(pares, { y: "fila", x1: "a", x2: "b", stroke: T.gris.fondo, strokeWidth: 3.2, strokeLinecap: "round" }),
    Plot.dot(datos, { y: "fila", x: "valor", fill: "serie", r: nFilas > 12 ? 4.2 : 5.5, stroke: T.superficie, strokeWidth: 0.8 }),
    nFilas <= 12
      ? Plot.text(datos, { y: "fila", x: "valor", dy: -11, fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO,
          text: (d) => formatear(d.valor, FORMATO) })
      : null,
    Plot.dot(datos, Plot.pointerY({ y: "fila", x: "valor", r: nFilas > 12 ? 6 : 8, fill: "none",
      stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
    Plot.tip(datos, Plot.pointerY({ y: "fila", x: "valor", maxRadius: Infinity, ...GLOBO,
      title: (d) => `${d.fila}\n${d.serie}\n${formatear(d.valor, FORMATO)}` })),
  ],
})
```

Las filas se ordenan por brecha cuando la categoría no tiene orden propio
(entidades, motivos) y en su orden natural cuando lo tiene (edad, decil,
escolaridad). Una referencia nacional va como `Plot.ruleX` punteada, con su
rótulo en el subtítulo.

### 10.4 Pendiente (dos o tres años)

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 420,
  marginTop: 24, marginRight: 150, marginBottom: 46, marginLeft: 60,
  x: { type: "point", padding: 0.25, label: "Edición", tickFormat: String },
  y: { grid: true, domain: FORMATO === "pct" ? [0, 100] : undefined, label: "↑ %" },
  color: { domain: SERIES, range: T.categorica, legend: true },
  marks: [
    Plot.lineY(datos, { x: "anio", y: "valor", z: "serie", stroke: "serie", strokeWidth: 2.6, curve: "monotone-x" }),
    Plot.dot(datos, { x: "anio", y: "valor", fill: "serie", r: 5, stroke: T.superficie, strokeWidth: 1 }),
    Plot.text(datos, Plot.selectFirst({ x: "anio", y: "valor", z: "serie", textAnchor: "end", dx: -10,
      fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => formatear(d.valor, FORMATO) })),
    Plot.text(datos, Plot.selectLast({ x: "anio", y: "valor", z: "serie", textAnchor: "start", dx: 10,
      fontSize: TIPO.etiqueta, fontWeight: 600, fill: "serie", ...HALO,
      text: (d) => `${d.serie}: ${formatear(d.valor, FORMATO)}` })),
  ],
})
```

Si importa el sentido del cambio y no la identidad, cada línea se pinta con
`colorCambio(ultimo - primero, SENTIDO)`. Con menos de dos años, usar barras.

### 10.5 Líneas en el tiempo con contexto

Muchas entidades en gris al fondo, las elegidas encima en color, cada una con su
etiqueta al final.

```js
const elegidas = new Set(ELEGIDAS) // máximo 3
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 520,
  marginTop: 34, marginRight: 128, marginBottom: 46, marginLeft: 62,
  x: { type: "point", label: null, tickFormat: String },
  y: { grid: true, label: "↑ Puntaje" },
  color: { domain: [...elegidas], range: T.categorica },
  marks: [
    Plot.lineY(datos.filter((d) => !elegidas.has(d.pais)), {
      x: "anio", y: "valor", z: "pais", stroke: T.gris.trazo, strokeWidth: 1, strokeOpacity: 0.11 }),
    Plot.lineY(datos.filter((d) => elegidas.has(d.pais)), {
      x: "anio", y: "valor", z: "pais", stroke: "pais", strokeWidth: 2.8, curve: "monotone-x" }),
    Plot.text(datos.filter((d) => elegidas.has(d.pais)), Plot.selectLast({
      x: "anio", y: "valor", z: "pais", textAnchor: "start", dx: 8, fontSize: TIPO.etiqueta, fontWeight: 700,
      fill: "pais", ...HALO, text: (d) => `${d.pais} (${punto(d.valor)})` })),
    Plot.ruleY([REFERENCIA], { stroke: T.gris.tinta, strokeDasharray: "6 4", strokeWidth: 2 }),
    Plot.tip(datos, Plot.pointer({ x: "anio", y: "valor", ...GLOBO,
      title: (d) => `${d.pais}\n${d.anio}\n${punto(d.valor)}` })),
  ],
})
```

Con hasta 8 líneas no hace falta fondo: todas van en color con `strokeWidth:
2.6`, siempre que los tonos no pasen de tres (el resto en gris con etiqueta).

### 10.6 Barras apiladas al 100 %

```js
// Categorías con orden propio (nivel escolar, satisfacción): orden fijo.
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.max(240, n * 34 + 96),
  marginLeft: 150,
  x: { percent: true, label: "% →", grid: false },
  y: { label: null },
  color: { domain: CATEGORIAS, range: T.categorica, legend: true },
  marks: [
    Plot.barX(datos, Plot.stackX({ y: "grupo", x: "valor", fill: "categoria", offset: "normalize",
      order: CATEGORIAS, insetTop: 0.5, stroke: T.superficie, strokeWidth: 1 })),
    Plot.barX(datos, Plot.pointerY(Plot.stackX({ y: "grupo", x: "valor", z: "categoria", offset: "normalize",
      order: CATEGORIAS, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity }))),
  ],
})
```

Con más de tres categorías ordenadas, usar tramos de `T.secuencial` (una
magnitud) en vez de la categórica. Con categorías sin orden y más de tres,
facetas o "Otras".

### 10.7 Heatmap

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.max(340, filas * 17 + 124),
  marginTop: 64, marginRight: 22, marginBottom: 34, marginLeft: 158,
  x: { axis: "top", label: null, padding: 0.06, tickFormat: String },
  y: { label: null },
  color: { type: "linear", domain: [0, 100], range: T.relleno, unknown: T.gris.rejilla,
           legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
  marks: [
    Plot.cell(datos, { x: "anio", y: "entidad", fill: "valor", inset: 0.5 }),
    filas <= 20
      ? Plot.text(datos, { x: "anio", y: "entidad", fontSize: TIPO.valor, fontWeight: 600,
          fill: (d) => (d.valor >= 60 ? T.gris.papel : T.tinta), text: (d) => punto(d.valor, 1) })
      : null,
    Plot.cell(datos, Plot.pointer({ x: "anio", y: "entidad", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6 })),
    Plot.tip(datos, Plot.pointer({ x: "anio", y: "entidad", ...GLOBO,
      title: (d) => `${d.entidad}\n${d.anio}\n${formatear(d.valor, FORMATO)}` })),
  ],
})
```

Una sola escala para todas las columnas: si cada columna tuviera la suya, dejarían
de ser comparables entre sí.

### 10.8 Dispersión

```js
const col = gruposDeColor(new Set(datos.map((d) => d.region)), ORDEN_GRUPOS)
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 520,
  marginTop: 34, marginRight: 20, marginBottom: 52, marginLeft: 62,
  x: { grid: true, nice: true, label: "Gasto por estudiante →" },
  y: { grid: true, nice: true, label: "↑ Puntaje" },
  color: { domain: col.domain, range: col.range, legend: true },
  marks: [
    Plot.dot(datos, { x: "x", y: "y", fill: (d) => col.clase(d.region), r: datos.length <= 12 ? 6.5 : 5,
      stroke: T.superficie, strokeWidth: 1 }),
    Plot.text(datos.filter((d) => ELEGIDOS.includes(d.pais)), { x: "x", y: "y", text: "pais", dy: -12,
      fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO, strokeWidth: 3.5 }),
    Plot.tip(datos, Plot.pointer({ x: "x", y: "y", ...GLOBO,
      title: (d) => `${d.pais}\n${d.region}\nGasto: ${punto(d.x)}\nPuntaje: ${punto(d.y)}` })),
  ],
})
```

Para comparar años, facetar (`fx: "anio"`) con la misma escala; si no, todos
los años caen en una sola nube. Guías (diagonal o medianas) punteadas `"4 4"`
en `T.gris.trazo`, opacidad 0.6.

### 10.9 Coropleta de México

```js
// Antes: comprobar que la llave del dato y la del geojson tienen la misma
// longitud ("01" contra "1" deja el mapa gris sin error).
const valor = new Map(datos.map((d) => [d.cve_ent, d]))
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.round(Math.max(width, 560) * 0.72),
  projection: { type: "mercator", domain: entidades },
  color: { type: "linear", domain: [0, 100], range: T.relleno, unknown: T.gris.rejilla,
           legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
  marks: [
    Plot.geo(entidades, { fill: (f) => valor.get(f.properties.cve_ent)?.valor, stroke: "none" }),
    Plot.geo(entidades, Plot.pointer(Plot.centroid({ stroke: T.gris.tinta, strokeWidth: 2.5, fill: "none" }))),
    Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO,
      title: (f) => {
        const d = valor.get(f.properties.cve_ent)
        return `${f.properties.nombre}\n${d ? formatear(d.valor, FORMATO) : "sin dato"}`
      } }))),
  ],
})
```

Sin borde entre polígonos: un trazo blanco se ve gris por antialiasing a
cualquier grosor. El contorno aparece solo con el hover. Mapear tasas, nunca
conteos (un conteo solo muestra dónde vive más gente). Para una brecha, rampa
`T.divergente` con dominio fijo y simétrico (`[-40, 40]` en puntos
porcentuales) o con pivote en la referencia.

**Mapa mundial:** proyección equirectangular recortada de 84°N a 58°S, alto
`width × 142 / 360`, `clip: "frame"` en las marcas, `Plot.frame({fill:
T.gris.papel})` al fondo, y los países sin polígono visible (Hong Kong, Macao,
Malta, Singapur) como punto de `r` 5.5.

### 10.10 Mapa bivariado

```js
const tercil = (v, c) => (v == null ? null : v < c[0] ? 0 : v < c[1] ? 1 : 2)
// CORTES_A y CORTES_B: terciles calculados sobre el universo completo.
Plot.geo(paises, {
  fill: (f) => {
    const a = tercil(A.get(f.id), CORTES_A), b = tercil(B.get(f.id), CORTES_B)
    return a == null || b == null ? T.gris.rejilla : T.bivariada[a][b]
  },
  stroke: "none", clip: "frame",
})
```

La leyenda es una rejilla de 3 × 3 con los dos ejes rotulados ("↑ más puntaje",
"más desigualdad →"), nunca una lista de nueve colores. Se usa solo para dos
variables; con una, coropleta.

### 10.11 Apilada divergente (Likert)

```js
const ESCALA = {
  "Muy en desacuerdo": T.divergente[7], "En desacuerdo": T.divergente[5],
  "Ni de acuerdo ni en desacuerdo": T.divergente[4],
  "De acuerdo": T.divergente[3], "Muy de acuerdo": T.divergente[1],
}
// Precalcular x1/x2 con el neutro partido a la mitad del cero.
Plot.plot({
  style: ESTILO, width: Math.max(width, 560), height: n * 14 + 96,
  marginTop: 44, marginRight: 30, marginBottom: 36, marginLeft: 168,
  x: { axis: "top", tickFormat: (d) => `${Math.abs(d)} %`, label: null },
  y: { label: null },
  color: { domain: Object.keys(ESCALA), range: Object.values(ESCALA), legend: true },
  marks: [
    Plot.barX(tramos, { y: "pregunta", x1: "x1", x2: "x2", fill: "respuesta", insetTop: 1.5, insetBottom: 1.5 }),
    Plot.ruleX([0], { stroke: T.gris.tinta, strokeWidth: 1.4 }),
  ],
})
```

---

## 11. Otras formas

Formas comunes en visualización de datos públicos que los tableros de
referencia no usan. Siguen las mismas reglas de color, texto e interacción; los
**tamaños son propuesta**, derivados de las formas medidas de la sección 6, y no
salen de un tablero publicado.

Las de 11.1 a 11.10 son nativas de Plot. Las de 11.11 a 11.14 no lo son: se
calcula la geometría con d3 (`d3.treemap`, `d3.partition`, `d3-sankey`,
`d3.forceSimulation`) y se dibuja con marcas de Plot sobre escalas `identity`,
donde una coordenada es directamente un píxel. Así heredan tema, halo, tooltip y
exportación igual que las demás.

### 11.1 Histograma (distribución de una medida)

Una sola medida continua: ingreso, edad, puntaje. En encuestas con factor de
expansión la altura es **población**, no casos: se suma el factor.

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 300,
  marginTop: 10, marginRight: 12, marginBottom: 46, marginLeft: 58,
  x: { label: "Ingreso mensual →", tickFormat: (d) => `$${punto(d / 1000)} mil` },
  y: { grid: true, label: "↑ Personas", tickFormat: poblacion },
  marks: [
    Plot.rectY(datos, Plot.binX({ y: "sum" }, { x: "ingreso", y: "factor", thresholds: 30,
      fill: T.rojo, fillOpacity: 0.9, inset: 0.5, tip: { ...GLOBO } })),
    Plot.ruleY([0], { stroke: T.gris.regla }),
    Plot.ruleX([MEDIANA], { stroke: T.gris.tinta, strokeDasharray: "5 3", strokeWidth: 1.2 }),
  ],
})
```

Es la única forma de barras sin valor escrito sobre cada barra: con 20 a 40
intervalos serían ilegibles. Se escribe la mediana en el subtítulo ("Línea
punteada: mediana, $12,300"). Entre 20 y 40 intervalos; menos esconde la forma,
más la vuelve ruido. Para comparar dos grupos, facetas con la misma escala
(`fy`), nunca dos histogramas encimados.

### 11.2 Caja (box plot)

Comparar distribuciones de varios grupos a la vez.

```js
const medianas = d3.rollups(datos, (v) => d3.median(v, (d) => d.valor), (d) => d.grupo)
  .map(([grupo, mediana]) => ({ grupo, mediana }))
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: medianas.length * 44 + 90,
  marginTop: 34, marginRight: 40, marginBottom: 46, marginLeft: 150,
  x: { grid: true, label: "Puntaje →" },
  y: { label: null },
  marks: [
    Plot.boxX(datos, { x: "valor", y: "grupo", fill: T.gris.rejilla, stroke: T.gris.tinta, r: 2 }),
    Plot.tickX(medianas, { x: "mediana", y: "grupo", stroke: T.rojo, strokeWidth: 3 }),
    Plot.text(medianas, { x: "mediana", y: "grupo", dy: -16, fontSize: TIPO.etiqueta, fontWeight: 600,
      fill: "currentColor", ...HALO, text: (d) => `mediana ${punto(d.mediana)}` }),
  ],
})
```

El público general no sabe leer bigotes ni cuartiles: el desplegable explica qué
es la caja ("la mitad central de los casos") y la mediana va escrita. Si los
datos son pocos (menos de 200 por grupo), mejor puntos individuales con la
mediana marcada.

### 11.3 Pirámide de población

```js
// datos: {edad, sexo, pct}; EDADES en orden ascendente.
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: EDADES.length * 22 + 90,
  marginTop: 34, marginRight: 60, marginBottom: 46, marginLeft: 60,
  x: { label: "← Hombres · Mujeres →", tickFormat: (d) => `${Math.abs(d)} %`, grid: true,
       domain: [-d3.max(datos, (d) => d.pct) * 1.2, d3.max(datos, (d) => d.pct) * 1.2] }, // aire para las etiquetas
  y: { label: null, domain: [...EDADES].reverse() },
  color: { domain: ["Mujeres", "Hombres"], range: [T.parSexo.mujeres, T.parSexo.hombres], legend: true },
  marks: [
    Plot.barX(datos, { y: "edad", x: (d) => (d.sexo === "Hombres" ? -d.pct : d.pct), fill: "sexo",
      insetTop: 1.5, insetBottom: 1.5 }),
    // textAnchor y dx son constantes en Plot: una marca de texto por lado.
    Plot.text(datos.filter((d) => d.sexo === "Hombres"), { y: "edad", x: (d) => -d.pct,
      text: (d) => punto(d.pct, 1), textAnchor: "end", dx: -6, fontSize: TIPO.etiqueta, fill: "currentColor" }),
    Plot.text(datos.filter((d) => d.sexo === "Mujeres"), { y: "edad", x: "pct",
      text: (d) => punto(d.pct, 1), textAnchor: "start", dx: 6, fontSize: TIPO.etiqueta, fill: "currentColor" }),
    Plot.ruleX([0], { stroke: T.gris.tinta, strokeWidth: 1.4 }),
    Plot.barX(datos, Plot.pointerY({ y: "edad", x: (d) => (d.sexo === "Hombres" ? -d.pct : d.pct),
      fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, insetTop: 1.5, insetBottom: 1.5, maxRadius: Infinity })),
  ],
})
```

Edades mayores arriba. El porcentaje es sobre el **total** de la población, no
sobre cada sexo, o los dos lados no se pueden comparar. Para comparar dos años,
el año anterior va como contorno (`fill: "none", stroke: T.gris.trazo`) sobre
las barras del año actual.

### 11.4 Waffle ("de cada 100")

Una proporción que el público lee mejor como personas que como porcentaje.

```js
// Una fila por grupo con su valor en porcentaje.
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 260,
  marginTop: 24, marginBottom: 40, marginLeft: 20, marginRight: 20,
  fx: { label: null, padding: 0.12 },
  x: { axis: null }, y: { axis: null },
  marks: [
    Plot.waffleY(datos, { fx: "grupo", y: 100, multiple: 10, fill: T.gris.rejilla }),
    Plot.waffleY(datos, { fx: "grupo", y: (d) => Math.round(d.valor), multiple: 10, fill: T.rojo }),
    Plot.text(datos, { fx: "grupo", frameAnchor: "top", dy: -14, fontSize: TIPO.valor, fontWeight: 600,
      fill: "currentColor", text: (d) => `${punto(Math.round(d.valor))} de cada 100` }),
  ],
})
```

Siempre 100 celdas en rejilla de 10 × 10. El texto dice "12 de cada 100"; por
debajo de 1 se escribe "menos de 1 de cada 100", nunca "0 de cada 100". Hasta
cuatro grupos; con más, barras.

### 11.5 Lollipop (ranking ligero)

Mismo uso que el ranking de barras (10.2), cuando son muchas filas y las barras
harían una mancha. Menos tinta, misma lectura.

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.max(320, n * 18 + 96),
  marginTop: 34, marginRight: 56, marginBottom: 44, marginLeft: 150,
  x: { grid: true, label: "% →" },
  y: { label: null, tickSize: 0 },
  marks: [
    Plot.ruleY(datos, { y: "entidad", x1: 0, x2: "valor", sort: { y: "-x2" }, stroke: T.gris.fondo, strokeWidth: 2 }),
    Plot.dot(datos, { y: "entidad", x: "valor", r: 5, stroke: T.superficie, strokeWidth: 1,
      fill: (d) => (d.entidad === ELEGIDA ? T.rojo : T.gris.tinta) }),
    Plot.text(datos, { y: "entidad", x: "valor", textAnchor: "start", dx: 9, fontSize: TIPO.etiqueta,
      fill: "currentColor", text: (d) => formatear(d.valor, FORMATO) }),
    Plot.dot(datos, Plot.pointerY({ y: "entidad", x: "valor", r: 8, fill: "none", stroke: T.gris.tinta,
      strokeWidth: 1.6, maxRadius: Infinity })),
  ],
})
```

### 11.6 Bump chart (posición en el tiempo)

Cuando la pregunta es **el lugar** que ocupa cada entidad año con año, no su
valor.

```js
// datos: {entidad, anio, lugar}; lugar 1 = primero.
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: nEntidades * 30 + 90,
  marginTop: 34, marginRight: 150, marginBottom: 46, marginLeft: 150,
  x: { type: "point", padding: 0.1, label: null, tickFormat: String, axis: "top" },
  y: { axis: null, reverse: true },
  color: { domain: [...ELEGIDAS], range: T.categorica },
  marks: [
    // Un canal de color no mezcla nombres y colores literales: fondo y elegidas van en marcas separadas.
    Plot.lineY(datos.filter((d) => !ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", z: "entidad",
      curve: "bump-x", strokeWidth: 2, stroke: T.gris.fondo }),
    Plot.lineY(datos.filter((d) => ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", z: "entidad",
      curve: "bump-x", strokeWidth: 2, stroke: "entidad" }),
    Plot.dot(datos.filter((d) => !ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", r: 9, fill: T.gris.fondo,
      stroke: T.superficie, strokeWidth: 1 }),
    Plot.dot(datos.filter((d) => ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", r: 9, fill: "entidad",
      stroke: T.superficie, strokeWidth: 1 }),
    Plot.text(datos, { x: "anio", y: "lugar", text: "lugar", fontSize: 10.5, fontWeight: 700,
      fill: (d) => (ELEGIDAS.includes(d.entidad) ? T.gris.papel : T.tinta) }),
    Plot.text(datos, Plot.selectFirst({ x: "anio", y: "lugar", z: "entidad", text: "entidad",
      textAnchor: "end", dx: -14, fontSize: TIPO.etiqueta, fill: "currentColor" })),
    Plot.text(datos, Plot.selectLast({ x: "anio", y: "lugar", z: "entidad", text: "entidad",
      textAnchor: "start", dx: 14, fontSize: TIPO.etiqueta, fill: "currentColor" })),
  ],
})
```

Hasta unas 15 entidades. El lugar esconde la distancia: dos lugares pueden
separarse por décimas o por decenas de puntos. El tooltip y la tabla llevan el
valor.

### 11.7 Cascada (cómo se llega de un total a otro)

Descomponer un cambio en sus partes: el ingreso de 2022 al de 2024 por fuente,
por ejemplo.

```js
// Precalcular: cada paso con inicio y fin acumulados; tipo "total" o "paso".
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 340,
  marginTop: 24, marginRight: 12, marginBottom: 46, marginLeft: 58,
  x: { label: null, padding: 0.3, domain: pasos.map((d) => d.paso) },
  y: { grid: true, label: "↑ Pesos" },
  marks: [
    Plot.barY(pasos, { x: "paso", y1: "inicio", y2: "fin",
      fill: (d) => (d.tipo === "total" ? T.gris.tinta : colorCambio(d.fin - d.inicio, SENTIDO)) }),
    Plot.link(pasos.slice(0, -1), { x1: "paso", x2: (d, i) => pasos[i + 1].paso, y1: "fin", y2: "fin",
      stroke: T.gris.trazo, strokeDasharray: "3 3" }),
    Plot.text(pasos, { x: "paso", y: (d) => Math.max(d.inicio, d.fin), dy: -9, fontSize: TIPO.valor,
      fontWeight: 600, fill: "currentColor", ...HALO,
      text: (d) => (d.tipo === "total" ? formatear(d.fin, "pesos") : diferencia(d.fin - d.inicio, 0)) }),
    Plot.ruleY([0], { stroke: T.gris.regla }),
  ],
})
```

Totales en tinta, pasos por dirección favorable o desfavorable. El valor de cada
paso lleva su signo escrito.

### 11.8 Calendario (valor por día)

Series diarias largas (casos, registros) donde importan el día de la semana y
la estación.

```js
const dia = d3.utcFormat("%u") // 1 lunes … 7 domingo
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: anios.length * 130 + 60,
  marginTop: 24, marginLeft: 40,
  fy: { label: null, tickFormat: String },
  x: { axis: null, padding: 0 },
  y: { tickFormat: (d) => "LMMJVSD"[d - 1], padding: 0, label: null },
  color: { type: "linear", domain: DOMINIO_DIARIO, range: T.relleno, unknown: T.gris.rejilla, legend: true, label: "Casos" },
  marks: [
    Plot.cell(datos, { fy: (d) => d.fecha.getUTCFullYear(), x: (d) => d3.utcWeek.count(d3.utcYear(d.fecha), d.fecha),
      y: (d) => +dia(d.fecha), fill: "valor", inset: 1,
      tip: { ...GLOBO }, title: (d) => `${d3.utcFormat("%d/%m/%Y")(d.fecha)}\n${punto(d.valor)}` }),
  ],
})
```

`DOMINIO_DIARIO` es fijo y medido, como cualquier otra rampa. Un día sin
registro va en `T.gris.rejilla`, no en el tono más claro.

### 11.9 Hexbin (dispersión con miles de puntos)

Con más de unos 1,000 puntos la dispersión se vuelve una mancha: se cuenta cuántos
caen en cada hexágono.

```js
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: 520,
  marginTop: 34, marginRight: 20, marginBottom: 52, marginLeft: 62,
  x: { grid: true, label: "Edad →" }, y: { grid: true, label: "↑ Horas trabajadas" },
  color: { type: "sqrt", range: T.relleno, legend: true, label: "Personas" },
  marks: [
    Plot.dot(datos, Plot.hexbin({ fill: "count" }, { x: "edad", y: "horas", binWidth: 14, symbol: "hexagon",
      stroke: T.superficie, strokeWidth: 0.5, tip: { ...GLOBO } })),
  ],
})
```

Escala `sqrt` porque la cuenta tiene colas largas. Si hay factor de expansión,
`fill: "sum"` con `fill: "factor"` en las opciones, y la leyenda dice personas.

### 11.10 Mapa de burbujas (conteos en el mapa)

La coropleta solo admite tasas. Cuando la pregunta es **cuántos** (personas,
escuelas, casos), el conteo va en un círculo por entidad, con área proporcional.

```js
const valor = new Map(datos.map((d) => [d.cve_ent, d]))
Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: Math.max(width, 560), height: Math.round(Math.max(width, 560) * 0.72),
  projection: { type: "mercator", domain: entidades },
  r: { range: [0, 28] },
  marks: [
    Plot.geo(entidades, { fill: T.gris.rejilla, stroke: T.superficie, strokeWidth: 0.8 }),
    Plot.dot(entidades.features, Plot.centroid({ r: (f) => valor.get(f.properties.cve_ent)?.num,
      fill: T.rojo, fillOpacity: 0.55, stroke: T.rojo, strokeWidth: 1 })),
    Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO,
      title: (f) => `${f.properties.nombre}\n${poblacion(valor.get(f.properties.cve_ent)?.num ?? NaN)}` }))),
  ],
})
```

Aquí el mapa base sí lleva borde fino del color del fondo: no codifica nada y
solo sitúa. Tamaño máximo de 28 px de radio; la leyenda muestra dos o tres
tamaños de referencia.

### 11.11 Treemap (partes de un total con jerarquía)

Cómo se reparte un total entre muchas partes, agrupadas en pocas categorías:
el gasto del hogar por rubro y subrubro, por ejemplo.

```js
// datos: {grupo, rubro, valor}. Máximo 3 grupos con color; el resto a "Otras".
const W = Math.max(width, 560), H = 480
const col = gruposDeColor(new Set(datos.map((d) => d.grupo)), ORDEN_GRUPOS)
const raiz = d3.hierarchy(d3.group(datos, (d) => col.clase(d.grupo)))
  .sum((d) => d.valor ?? 0)
  .sort((a, b) => b.value - a.value)
d3.treemap().size([W, H]).paddingInner(2).paddingOuter(0).round(true)(raiz)
const hojas = raiz.leaves().map((h) => ({ ...h.data, x0: h.x0, x1: h.x1, y0: h.y0, y1: h.y1,
  clase: h.parent.data[0], pct: (100 * h.value) / raiz.value }))
// Recorta el rótulo al ancho del rectángulo (unos 6.4 px por letra a 11.5 px).
const cabe = (s, px) => (s.length * 6.4 <= px ? s : `${s.slice(0, Math.max(1, Math.floor(px / 6.4) - 1))}…`)

Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: W, height: H, margin: 0,
  x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
  color: { domain: col.domain, range: col.range, legend: true },
  marks: [
    Plot.rect(hojas, { x1: "x0", x2: "x1", y1: "y0", y2: "y1", fill: "clase", fillOpacity: 0.9,
      tip: { ...GLOBO }, title: (d) => `${d.clase}\n${d.rubro}\n${punto(d.pct, 1)} % del total` }),
    Plot.text(hojas.filter((d) => d.x1 - d.x0 > 60 && d.y1 - d.y0 > 34), {
      x: (d) => d.x0 + 6, y: (d) => d.y0 + 6, frameAnchor: "top-left", textAnchor: "start", lineAnchor: "top",
      text: (d) => `${cabe(d.rubro, d.x1 - d.x0 - 12)}\n${punto(d.pct, 1)} %`, fontSize: TIPO.etiqueta, fontWeight: 600,
      fill: T.gris.papel }),
  ],
})
```

Las etiquetas solo entran en rectángulos de más de 70 × 34 px; lo demás queda en
el tooltip y la tabla. El área compara partes de un mismo total, no totales
distintos: dos treemaps lado a lado no se comparan entre sí. Si la jerarquía no
importa y son menos de 12 partes, barras horizontales ordenadas.

### 11.12 Icicle (jerarquía de dos o tres niveles)

Mismo dato que el treemap, cuando importa ver **la estructura** (qué contiene
qué) además de las proporciones. Se lee de izquierda a derecha.

```js
const W = Math.max(width, 560), H = 420
const raiz = d3.hierarchy(d3.rollup(datos, (v) => d3.sum(v, (d) => d.valor), (d) => d.nivel1, (d) => d.nivel2))
  .sum((d) => (Array.isArray(d) ? d[1] : 0))
  .sort((a, b) => b.value - a.value)
d3.partition().size([H, 3]).padding(1)(raiz) // tres columnas: raíz, nivel 1 y nivel 2
// La raíz no se dibuja: el nivel 1 ocupa la mitad izquierda y el nivel 2 la derecha.
const nodos = raiz.descendants().filter((d) => d.depth > 0).map((d) => ({
  nombre: d.data[0], nivel: d.depth, rama: d.ancestors().at(-2).data[0],
  x1: ((d.depth - 1) * W) / 2, x2: (d.depth * W) / 2 - 1, y1: d.x0, y2: d.x1, pct: (100 * d.value) / raiz.value }))
const col = gruposDeColor(new Set(nodos.map((d) => d.rama)), ORDEN_GRUPOS)

Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: W, height: H, margin: 0,
  x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
  color: { domain: col.domain, range: col.range, legend: true },
  marks: [
    Plot.rect(nodos, { x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: (d) => col.clase(d.rama),
      fillOpacity: (d) => (d.nivel === 1 ? 1 : 0.7), tip: { ...GLOBO },
      title: (d) => `${d.nombre}\n${punto(d.pct, 1)} % del total` }),
    Plot.text(nodos.filter((d) => d.y2 - d.y1 > 18), { x: (d) => d.x1 + 6, y: (d) => (d.y1 + d.y2) / 2,
      textAnchor: "start", text: (d) => `${d.nombre} · ${punto(d.pct, 1)} %`, fontSize: TIPO.etiqueta,
      fill: T.gris.papel, fontWeight: 600 }),
  ],
})
```

La raíz no se dibuja: es el 100 % y ocupa espacio sin decir nada. Los hijos
heredan el color de su rama con menor opacidad.

### 11.13 Sankey (flujos entre etapas)

De dónde a dónde se mueve algo: personas entre condiciones de actividad de un
año a otro, o el paso por niveles escolares.

```js
// d3-sankey no viene con d3; se carga una vez.
const { sankey: d3Sankey } = await import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/+esm")

// nodos: [{id, etapa}], enlaces: [{source: id, target: id, value}]
const W = Math.max(width, 560), H = Math.max(360, nodos.length * 34)
const MARGEN_X = 150 // espacio para los nombres de la primera y la última etapa
const g = d3Sankey().nodeId((d) => d.id).nodeWidth(14).nodePadding(14).nodeSort(null)
  .extent([[MARGEN_X, 12], [W - MARGEN_X, H - 12]])({
    nodes: nodos.map((d) => ({ ...d })), links: enlaces.map((d) => ({ ...d })) })
const total = d3.sum(g.nodes.filter((d) => d.depth === 0), (d) => d.value)

Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: W, height: H, margin: 0,
  x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
  marks: [
    Plot.link(g.links, { x1: (d) => d.source.x1, y1: (d) => d.y0, x2: (d) => d.target.x0, y2: (d) => d.y1,
      curve: "bump-x", strokeWidth: (d) => Math.max(1, d.width), strokeOpacity: 0.45,
      stroke: (d) => (d.source.id === ELEGIDO ? T.rojo : T.gris.fondo),
      tip: { ...GLOBO }, title: (d) => `${d.source.id} → ${d.target.id}\n${poblacion(d.value)}` }),
    Plot.rect(g.nodes, { x1: "x0", x2: "x1", y1: "y0", y2: "y1", fill: T.gris.tinta }),
    // textAnchor es constante en Plot: una marca para los nodos de la izquierda y otra para los de la derecha.
    Plot.text(g.nodes.filter((d) => d.x0 < W / 2), { x: (d) => d.x0 - 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "end",
      fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => `${d.id} · ${punto((100 * d.value) / total, 1)} %` }),
    Plot.text(g.nodes.filter((d) => d.x0 >= W / 2), { x: (d) => d.x1 + 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "start",
      fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => `${d.id} · ${punto((100 * d.value) / total, 1)} %` }),
  ],
})
```

Los flujos van en gris y se resalta en rojo el que responde la pregunta (el
origen elegido, o el flujo desfavorable); colorear cada flujo por su origen con
más de tres orígenes rompe la regla de tres tonos. Máximo tres o cuatro etapas y
unos 8 nodos por etapa; con más, una matriz origen-destino (heatmap, 10.7). Si
el entorno no permite `import` dinámico, `d3-sankey` se agrega como dependencia
del nodo.

### 11.14 Red (quién se conecta con quién)

Solo cuando la pregunta es la **estructura** de las relaciones: comunidades,
nodos centrales. Para comparar cantidades entre pares, matriz (10.7).

```js
const W = Math.max(width, 560), H = 560
const nodosR = nodos.map((d) => ({ ...d })), enlacesR = enlaces.map((d) => ({ ...d }))
d3.forceSimulation(nodosR)
  .force("link", d3.forceLink(enlacesR).id((d) => d.id).distance(40))
  .force("charge", d3.forceManyBody().strength(-60))
  .force("center", d3.forceCenter(W / 2, H / 2))
  .force("colision", d3.forceCollide(10))
  .stop().tick(300) // se calcula completa antes de dibujar: nada se mueve en pantalla
const col = gruposDeColor(new Set(nodosR.map((d) => d.grupo)), ORDEN_GRUPOS)
const grado = d3.rollup(enlacesR.flatMap((l) => [l.source.id, l.target.id]), (v) => v.length, (d) => d)

Plot.plot({
  title: titulo("…"), subtitle: subtitulo("…"), caption: pie("…"),
  style: ESTILO, width: W, height: H, margin: 0,
  x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
  color: { domain: col.domain, range: col.range, legend: true },
  marks: [
    Plot.link(enlacesR, { x1: (d) => d.source.x, y1: (d) => d.source.y, x2: (d) => d.target.x, y2: (d) => d.target.y,
      stroke: T.gris.fondo, strokeWidth: 1 }),
    Plot.dot(nodosR, { x: "x", y: "y", fill: (d) => col.clase(d.grupo), stroke: T.superficie, strokeWidth: 1,
      r: (d) => 3 + Math.sqrt(grado.get(d.id) ?? 0) * 2, tip: { ...GLOBO },
      title: (d) => `${d.id}\n${d.grupo}\n${grado.get(d.id) ?? 0} conexiones` }),
    Plot.text(nodosR.filter((d) => (grado.get(d.id) ?? 0) >= UMBRAL_ETIQUETA), { x: "x", y: "y", text: "id",
      dy: -12, fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO }),
  ],
})
```

La posición de un nodo no significa nada por sí misma (sale de la simulación),
y eso lo dice el desplegable. Solo se rotulan los nodos más conectados. Por
encima de unos 150 nodos la red es una madeja: agrupar por comunidad o usar la
matriz.

---

## 12. Datos antes de dibujar

- **Tasas**: sumar numerador y denominador por grupo y dividir. Nunca promediar
  porcentajes ya calculados.
- **Años**: un año concreto o la comparación en facetas. Nunca un "total" de
  varias ediciones.
- **Pesos de varios años**: deflactados con el INPC del periodo de levantamiento,
  o no se comparan.
- **Muestra chica**: con menos de 30 casos (`fragil`), la marca se dibuja igual
  pero con asterisco en el valor y nota en el pie. No se oculta.
- **Topes**: un valor que supera 100 % por redondeo se dibuja en 100 y conserva
  su cifra cruda en la tabla.
- **Faltantes**: `null`, nunca 0. Una barra en cero afirma algo que el dato no
  dice. Un margen de error no estimable también va vacío.
- **Intervalos**: si se dibujan, salen del diseño muestral (UPM y estrato), no de
  `sqrt(p(1-p)/n)`, que los hace un tercio más angostos. Se dibujan en tinta
  neutra (`T.gris.tinta`, grosor 1.4, opacidad 0.75), nunca en color de serie.

---

## 13. Accesibilidad de la gráfica

- **Contraste medido.** Los colores de `T` pasan el validador de daltonismo en
  los dos modos (peor par de identidad ΔE 9.7 en claro y 9.6 en oscuro) y
  quedan a 3:1 o más contra el fondo. No sustituir un tono "porque se ve
  parecido": se valida con `validate_palette.js` de la skill `dataviz`.
- **El color nunca va solo.** Toda serie lleva además leyenda y etiqueta directa;
  toda polaridad, su signo escrito (`+2.1`, `−3.4`).
- **Texto legible.** Nada por debajo de 10.5 px. Toda etiqueta sobre marcas
  lleva halo. Los grises de texto son tonos que dan 4.5:1 o más, nunca negro con
  transparencia.
- **Nombre accesible.** `ariaLabel` en las marcas principales y
  `ariaDescription` en el `Plot.plot` con una frase de lo que muestra:
  `ariaDescription: "Barras del porcentaje que asiste a la escuela por grupo de
  edad, mujeres, 2024."`
- **Tabla de respaldo.** Cada cifra que la gráfica dibuja existe también en una
  tabla (valor, intervalo, población que cumple, población total, casos). Es el
  relevo de quien no ve la gráfica y el lugar del detalle que no cabe en el
  tooltip.
- **Nada se mueve** si el sistema pide movimiento reducido.

---

## 14. Lista de verificación

Antes de entregar una gráfica:

- [ ] ¿Todos los colores salen de `T`? ¿Hay algún hex o `scheme` escrito en la gráfica?
- [ ] ¿Hay tres tonos de identidad o menos, con el resto en "Otras"?
- [ ] ¿El rojo cae en lo desfavorable según el `sentido`?
- [ ] ¿La escala de color tiene dominio fijo?
- [ ] ¿Cada barra tiene su valor escrito y cada línea su etiqueta?
- [ ] ¿El título dice la pregunta, el subtítulo la selección y el pie la fuente en una frase?
- [ ] ¿El tooltip tiene tres o cuatro renglones, con población y no casos?
- [ ] ¿El hover usa el puntero del eje categórico con `maxRadius: Infinity`?
- [ ] ¿La forma corresponde a la densidad (1 panel, 2 a 4, más de 4)?
- [ ] ¿Los faltantes son "sin dato" y no cero? ¿Los casos frágiles llevan asterisco?
- [ ] ¿La media se lee bien en voz alta con su unidad?
- [ ] ¿Se ve bien con `MODO = "oscuro"`?
- [ ] ¿Alguien que no sabe qué es un denominador entiende la gráfica en cinco segundos?
