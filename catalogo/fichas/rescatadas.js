// ======================================================================
// catalogo/fichas/rescatadas.js
// Formas que hacían falta en el catálogo y que no tenían ficha (base.js,
// plantilla.js) ni componente en src/components/formas/. La elección, con la
// tabla de candidatas rescatadas y descartadas, está en ../rescatadas.md.
//
// Mismo contrato que base.js (ver su cabecera): script CLÁSICO que añade sus
// fichas a window.FICHAS. Las recetas usan solo los globales del catálogo
// (T, TIPO, ESTILO, HALO, GLOBO, FUENTE, titulo, subtitulo, pie, punto,
// formatear, diferencia, poblacion, colorCambio, ENT, azar, Plot, d3) y se
// leen DENTRO de la receta, porque T cambia con el tema.
//
// Dos convenciones propias de este archivo, escritas dentro de cada receta
// para que el código copiado funcione solo:
//   TONO   tono de tema (serie única y rampas de nivel). Usa T.serie si el
//          catálogo lo define; si no, el ocre de T.categorica[2], que es uno
//          de los tonos validados de paleta.js (TONOS.ocre).
//   RAMPA  rampa de una tinta derivada del tono, del fondo al tono y del tono
//          a la tinta: el valor alto siempre tiene más contraste con el fondo,
//          en claro y en oscuro. Se interpola en Lab y el dominio es fijo.
//
// Única pieza compartida: globoHTML(contenedor), el globo de las recetas que
// no pasan por Plot (tablas). Se define abajo, fuera de la lista, y la usan
// las cinco fichas de la familia Tabla. Lee cada renglón del atributo
// data-globo de la marca y le pone contorno al pasar el puntero o el foco.
// ======================================================================
;(function () {
  // Globo HTML para tablas: mismo tamaño y relleno que GLOBO de Plot.
  function globoHTML(raiz) {
    raiz.style.position = "relative"
    const g = document.createElement("div")
    g.setAttribute("aria-hidden", "true") // repite lo que la celda ya escribe
    g.style.cssText = `position:absolute;z-index:4;pointer-events:none;display:none;max-width:250px;
      padding:${GLOBO.textPadding}px;font:${GLOBO.fontSize}px/1.4 ${FUENTE};white-space:pre-line;color:${T.tinta};
      background:${T.superficie};border:1px solid ${T.gris.fondo};border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.14)`
    raiz.append(g)
    let actual = null
    const soltar = () => { if (actual) actual.style.outline = ""; actual = null; g.style.display = "none" }
    const mostrar = (el, x, y) => {
      if (actual !== el) { soltar(); actual = el; el.style.outline = `1.8px solid ${T.gris.tinta}`; el.style.outlineOffset = "-2px" }
      g.textContent = el.dataset.globo
      g.style.display = "block"
      const caja = raiz.getBoundingClientRect(), w = g.offsetWidth, h = g.offsetHeight
      let izq = x - caja.left + 14, arriba = y - caja.top - h - 10
      if (izq + w > caja.width) izq = Math.max(0, x - caja.left - w - 14)
      if (arriba < 0) arriba = y - caja.top + 18
      g.style.left = `${izq}px`; g.style.top = `${arriba}px`
    }
    raiz.addEventListener("pointermove", (e) => {
      const el = e.target.closest("[data-globo]")
      el && raiz.contains(el) ? mostrar(el, e.clientX, e.clientY) : soltar()
    })
    raiz.addEventListener("pointerleave", soltar)
    raiz.addEventListener("focusin", (e) => {
      const el = e.target.closest("[data-globo]"); if (!el) return
      const b = el.getBoundingClientRect(); mostrar(el, b.left + b.width / 2, b.top)
    })
    raiz.addEventListener("focusout", soltar)
    return raiz
  }
  window.globoHTML = window.globoHTML || globoHTML // para que el código copiado de una ficha de tabla funcione en el catálogo

  const DVP = (slug) => `https://datavizproject.com/data-type/${slug}/`
  const DISPATCH = {
    oct27: "https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices",
    nov10: "https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index",
  }

  window.FICHAS = (window.FICHAS || []).concat([
// ================================================================== TABLAS
{
  id: "tabla-barras", nombre: "Tabla con barras en la celda", nivel: 0,
  familia: "tabla", entrada: ["categoria-valor"], funcion: ["comparacion"], forma: ["barras", "cuadrado"],
  pregunta: "¿Cuánto vale cada fila, con la cifra exacta y su tamaño a la vista?",
  si: "De 8 a 40 filas que el lector busca por nombre, con una o dos columnas de cifras.",
  no: "Menos de seis filas (barras) o varias medidas que se cruzan (tabla de calor).",
  datosForma: "[{nombre, valor, num}]  valor en %, num = personas",
  datos: () => ["CMX", "NLE", "SON", "COA", "JAL", "MEX", "PUE", "VER", "GRO", "CHP"].map((id, i) => {
    const e = ENT.find((d) => d.id === id), valor = [86.1, 83.4, 81.2, 79.5, 77.0, 75.8, 69.3, 66.1, 61.7, 58.4][i]
    return { nombre: e.nombre, valor, num: e.pob * 0.052 * valor / 100 }
  }),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const NACIONAL = 74.9, ESCALA = 0.76 // 100 % ocupa el 76 % de la celda; el resto es para la cifra
    const filas = [...datos].sort((a, b) => b.valor - a.valor)
    const celda = `padding:6px 8px;border-bottom:1px solid ${T.gris.rejilla};font:400 ${TIPO.valor + 1}px/1.35 ${FUENTE.replaceAll('"', "'")};
      color:${T.tinta};text-align:left;vertical-align:middle;white-space:normal;letter-spacing:0;text-transform:none`
    const cabeza = `${celda};font-weight:600;font-size:${TIPO.etiqueta + 1}px;color:${T.tintaSuave};border-bottom-color:${T.gris.fondo}`
    const tabla = document.createElement("table")
    tabla.style.cssText = "border-collapse:collapse;width:100%;min-width:0;font-variant-numeric:tabular-nums;background:transparent"
    tabla.innerHTML = `<thead><tr>
      <th scope="col" style="${cabeza}">Entidad</th>
      <th scope="col" style="${cabeza};width:55%">Asiste a la escuela <span style="font-weight:400">(raya: nacional)</span></th>
      <th scope="col" style="${cabeza};text-align:right">Personas</th></tr></thead>
      <tbody>${filas.map((d) => `<tr data-globo="${d.nombre} · 2024&#10;15 a 17 años que asisten a la escuela&#10;${formatear(d.valor)}&#10;Población: ${poblacion(d.num)}">
        <th scope="row" style="${celda};font-weight:600">${d.nombre}</th>
        <td style="${celda}"><div style="position:relative;height:20px">
          <div style="position:absolute;left:0;top:4px;height:12px;width:${d.valor * ESCALA}%;background:${TONO};border-radius:2px"></div>
          <div style="position:absolute;left:${NACIONAL * ESCALA}%;top:-6px;bottom:-6px;border-left:1.5px dashed ${T.gris.tinta}"></div>
          <span style="position:absolute;left:calc(${d.valor * ESCALA}% + 6px);top:0;padding:0 3px;font-weight:600;background:${T.superficie}">${formatear(d.valor)}</span>
        </div></td>
        <td style="${celda};text-align:right">${poblacion(d.num)}</td></tr>`).join("")}</tbody>`
    const figura = document.createElement("figure")
    figura.style.margin = "0"
    figura.append(
      titulo("Asistencia escolar de 15 a 17 años"),
      subtitulo(`2024 · ordenada de mayor a menor · nacional: ${formatear(NACIONAL)}`),
      tabla,
      pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada barra es el porcentaje de la población de 15 a 17 años de la entidad que asiste a la escuela."))
    return globoHTML(figura)
  },
  imagen: null, plantilla: { componente: "src/components/formas/tabla-barras.js", galeria: "src/galeria/tablas.md#tabla-barras",
    uso: "import {tablaBarras} from \"../components/formas/tabla-barras.js\"\ntablaBarras(sel, {ancho: Math.min(ancho, 980), nombre: (d) => d.entidad, valor: (d) => d.pct, cantidad: (d) => d.num, unidad: \"hogares\", rotuloCantidad: \"Hogares que lo tienen\",\n            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, dominio: DOMINIO_PCT, rotuloValor: \"Porcentaje de hogares\",\n            incierta: (d) => pocoPrecisa({valor: d.pct, ee: d.ee, c …})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Table Chart", url: DVP("table-chart") },
            { texto: "Datawrapper, tablas con barras y mapas de calor", url: "https://www.datawrapper.de/tables" }],
},
{
  id: "tabla-calor", nombre: "Tabla de calor", nivel: 1,
  familia: "tabla", entrada: ["cruce"], funcion: ["comparacion", "distribucion"], forma: ["cuadrado"],
  pregunta: "¿Cómo se comparan varias medidas de la misma escala en cada fila, leyendo la cifra exacta?",
  si: "Filas con nombre y de dos a seis columnas que comparten unidad (porcentajes de 0 a 100).",
  no: "Columnas con unidades distintas: cada una pediría su propia rampa y el color dejaría de compararse.",
  datosForma: "[{nombre, indicador, valor, num}]  valor null = sin dato",
  datos: () => {
    const IND = ["3 a 5", "6 a 11", "12 a 14", "15 a 17"]
    const base = { "Ciudad de México": [78, 99, 97, 88], "Nuevo León": [70, 98, 96, 82], "Jalisco": [66, 98, 94, 77],
      "Puebla": [62, 97, 92, 69], "Guerrero": [58, 96, 89, 61], "Oaxaca": [64, 97, 91, 63], "Chiapas": [55, 95, 86, null] }
    return Object.entries(base).flatMap(([nombre, vals]) => vals.map((valor, i) =>
      ({ nombre, indicador: IND[i], valor, num: valor == null ? null : valor * 1800 * (i + 3) })))
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    // Rampa de una tinta que nunca baja de 4.5:1 contra T.tinta: la cifra de la celda va siempre en tinta.
    const lum = (c) => { const { r, g, b } = d3.rgb(c), f = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
    const contraste = (a, b) => { const [p, q] = [lum(a), lum(b)].sort((m, n) => n - m); return (p + 0.05) / (q + 0.05) }
    const hacia = d3.interpolateLab(T.superficie, TONO), tope = d3.range(1, 0.3, -0.02).find((t) => contraste(hacia(t), T.tinta) >= 4.6) ?? 0.3
    const color = d3.scaleLinear().domain([0, 100]).range([hacia(0.2), hacia(tope)]).interpolate(d3.interpolateLab) // dominio fijo 0 a 100
    const cols = [...new Set(datos.map((d) => d.indicador))], filas = [...new Set(datos.map((d) => d.nombre))]
    const valor = new Map(datos.map((d) => [`${d.nombre}|${d.indicador}`, d]))
    const celda = `padding:7px 6px;border:2px solid ${T.superficie};font:400 ${TIPO.valor + 1}px/1.3 ${FUENTE.replaceAll('"', "'")};text-align:center;
      vertical-align:middle;letter-spacing:0;text-transform:none;white-space:nowrap`
    const tabla = document.createElement("table")
    tabla.style.cssText = "border-collapse:collapse;width:100%;min-width:0;font-variant-numeric:tabular-nums;table-layout:fixed;background:transparent"
    tabla.innerHTML = `<thead><tr><th scope="col" style="${celda};text-align:left;color:${T.tintaSuave};font-weight:600;width:${width < 460 ? 30 : 26}%">Entidad</th>
      ${cols.map((c) => `<th scope="col" style="${celda};color:${T.tintaSuave};font-weight:600;white-space:normal">${c} años</th>`).join("")}</tr></thead>
      <tbody>${filas.map((f) => `<tr><th scope="row" style="${celda};text-align:left;font-weight:600;color:${T.tinta};white-space:normal">${f}</th>
      ${cols.map((c) => { const d = valor.get(`${f}|${c}`)
        if (d.valor == null) return `<td style="${celda};color:${T.tintaSuave};font-size:${TIPO.etiqueta}px;background:repeating-linear-gradient(45deg,${T.gris.rejilla} 0 4px,transparent 4px 8px)"
          data-globo="${f} · 2024&#10;${c} años&#10;Sin dato: pocos casos en la muestra">sin dato</td>`
        const fondo = color(d.valor)
        return `<td style="${celda};background:${fondo};color:${T.tinta};font-weight:600"
          data-globo="${f} · 2024&#10;${c} años que asisten a la escuela&#10;${formatear(d.valor)}&#10;Población: ${poblacion(d.num)}">${punto(d.valor)}</td>` }).join("")}</tr>`).join("")}</tbody>`
    const leyenda = document.createElement("div")
    leyenda.style.cssText = `display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin-top:10px;font:${TIPO.etiqueta}px/1.2 ${FUENTE};color:${T.tintaSuave}`
    leyenda.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px">0
      <span style="display:inline-block;width:140px;height:10px;border-radius:2px;background:linear-gradient(to right,${d3.range(0, 101, 10).map((v) => color(v)).join(",")})"></span>100 %</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:16px;height:10px;border:1px solid ${T.gris.trazo};
      background:repeating-linear-gradient(45deg,${T.gris.rejilla} 0 3px,transparent 3px 6px)"></span>Sin dato</span>`
    const figura = document.createElement("figure")
    figura.style.margin = "0"
    figura.append(titulo("Asistencia escolar por grupo de edad"),
      subtitulo("2024 · porcentaje de cada grupo que asiste a la escuela"), tabla, leyenda,
      pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada celda es el porcentaje del grupo de edad que asiste; el color repite la misma cifra con escala fija de 0 a 100."))
    return globoHTML(figura)
  },
  imagen: null, plantilla: { componente: "src/components/formas/tabla-calor.js", galeria: "src/galeria/tablas.md#tabla-calor",
    uso: "import {tablaCalor} from \"../components/formas/tabla-calor.js\"\ntablaCalor(sel, {ancho: Math.min(ancho, 980), fila: (d) => d.entidad, columna: (d) => d.indicador, valor: (d) => d.pct, columnas: INDICADORES, escala, ordenPor: v.orden, cortoColumna: (c) => CORTOS[c] ?? c,\n            tituloLeyenda: \"Porcentaje de hogares\", marcasLeyenda: [0, 25, 50, 75, 100], globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Datawrapper, tablas con mapa de calor", url: "https://www.datawrapper.de/tables" },
            { texto: "Data Viz Project, Heat Map", url: DVP("heat-map") }],
},
{
  id: "tabla-minigraficas", nombre: "Tabla con minigráficas", nivel: 1,
  familia: "tabla", entrada: ["serie-tiempo", "categoria-valor"], funcion: ["tiempo", "comparacion"], forma: ["linea", "cuadrado"],
  pregunta: "¿Cómo le fue a cada fila en el tiempo, con su último valor y su cambio escritos?",
  si: "Entre 6 y 32 filas con cinco o más cortes cada una; el lector busca su entidad y compara la forma de la serie.",
  no: "Dos o tres cortes (una línea sugiere continuidad que no se midió: pendiente o flechas).",
  datosForma: "[{nombre, serie: [{anio, valor}], num}]",
  datos: () => {
    const ANIOS = [2016, 2018, 2020, 2022, 2024]
    return [["Ciudad de México", 79, 2.4], ["Nuevo León", 74, 2.1], ["Jalisco", 70, 1.6], ["Puebla", 62, 1.8],
      ["Veracruz", 60, 0.9], ["Guerrero", 58, -0.8], ["Oaxaca", 57, 1.2], ["Chiapas", 50, 1.5]].map(([nombre, ini, paso], k) => ({
      nombre, num: 9e4 + k * 2.2e4,
      serie: ANIOS.map((anio, i) => ({ anio, valor: ini + paso * i + (i === 2 ? -1.6 : 0) })),
    }))
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const DOMINIO = [40, 90] // fijo para todas las filas
    const ancho = width < 460 ? 74 : 110, alto = 26
    const x = d3.scaleLinear().domain([2016, 2024]).range([3, ancho - 4]), y = d3.scaleLinear().domain(DOMINIO).range([alto - 3, 3])
    const celda = `padding:6px 8px;border-bottom:1px solid ${T.gris.rejilla};font:400 ${TIPO.valor + 1}px/1.3 ${FUENTE.replaceAll('"', "'")};color:${T.tinta};
      text-align:left;vertical-align:middle;letter-spacing:0;text-transform:none;white-space:nowrap`
    const cabeza = `${celda};font-weight:600;font-size:${TIPO.etiqueta + 1}px;color:${T.tintaSuave};border-bottom-color:${T.gris.fondo};white-space:normal`
    const linea = (serie) => {
      const svg = d3.create("svg").attr("width", ancho).attr("height", alto).attr("aria-hidden", "true").style("display", "block").style("overflow", "visible")
      svg.append("path").attr("d", d3.line((d) => x(d.anio), (d) => y(d.valor))(serie)).attr("fill", "none").attr("stroke", TONO).attr("stroke-width", 1.8)
      const u = serie.at(-1)
      svg.append("circle").attr("cx", x(u.anio)).attr("cy", y(u.valor)).attr("r", 3).attr("fill", TONO)
      return svg.node().outerHTML
    }
    const tabla = document.createElement("table")
    tabla.style.cssText = "border-collapse:collapse;width:100%;min-width:0;font-variant-numeric:tabular-nums;background:transparent"
    tabla.innerHTML = `<thead><tr><th scope="col" style="${cabeza}">Entidad</th><th scope="col" style="${cabeza}">2016 - 2024</th>
      <th scope="col" style="${cabeza};text-align:right">2024</th><th scope="col" style="${cabeza};text-align:right">Cambio</th></tr></thead>
      <tbody>${datos.map((d) => { const a = d.serie[0].valor, b = d.serie.at(-1).valor, delta = b - a
        return `<tr data-globo="${d.nombre} · 2016 - 2024&#10;Hogares con internet&#10;${formatear(a)} → ${formatear(b)}&#10;Hogares en 2024: ${poblacion(d.num)}">
        <th scope="row" style="${celda};font-weight:600;white-space:normal">${d.nombre}</th><td style="${celda}">${linea(d.serie)}</td>
        <td style="${celda};text-align:right;font-weight:600">${formatear(b)}</td>
        <td style="${celda};text-align:right;font-weight:600;color:${d3.interpolateLab(colorCambio(delta, "alto"), T.tinta)(0.2)}">${delta >= 0 ? "▲" : "▼"} ${diferencia(delta)}</td></tr>` }).join("")}</tbody>`
    const figura = document.createElement("figure")
    figura.style.margin = "0"
    figura.append(titulo("Hogares con internet"), subtitulo("2016 - 2024 · cambio en puntos entre el primer y el último año"), tabla,
      pie("INEGI, ENIGH 2016 - 2024 (datos de ejemplo). Cada minigráfica usa la misma escala, de 40 a 90 %; el punto marca 2024."))
    return globoHTML(figura)
  },
  imagen: null, plantilla: { componente: "src/components/formas/tabla-minigraficas.js", galeria: "src/galeria/tablas.md#tabla-minigraficas",
    uso: "import {tablaMinigraficas} from \"../components/formas/tabla-minigraficas.js\"\ntablaMinigraficas(renglones, {ancho: Math.min(ancho, 980), x: (d) => d.anio, valor: (d) => d.pct, ee: (d) => d.ee, cortes: ANIOS, dominio: DOMINIO_PCT, orden: v.orden, sig: SIG, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Edward Tufte, sparklines (Data Viz Project)", url: DVP("sparkline") },
            { texto: "Datawrapper, tablas con minigráficas", url: "https://www.datawrapper.de/tables" }],
},
{
  id: "tabla-precision", nombre: "Tabla de estimaciones con su precisión", nivel: 1,
  familia: "tabla", entrada: ["intervalos", "categoria-valor"], funcion: ["comparacion", "distribucion"], forma: ["linea", "puntos", "cuadrado"],
  pregunta: "¿Qué tan confiable es cada cifra de la encuesta antes de compararla?",
  si: "Estimaciones de grupos pequeños (entidades, subgrupos) con error de diseño; acompaña o sustituye a la tabla de respaldo.",
  no: "Cifras censales o de registro, que no tienen error de muestreo.",
  datosForma: "[{nombre, valor, ee, num}]  ee = error estándar de diseño, en puntos",
  datos: () => [["Guerrero", 2.4, 0.30], ["Michoacán", 1.9, 0.38], ["Chiapas", 1.6, 0.22], ["Tamaulipas", 1.5, 0.41],
    ["Veracruz", 1.1, 0.27], ["Zacatecas", 1.0, 0.36], ["Jalisco", 0.7, 0.09], ["Yucatán", 0.3, 0.11]]
    .map(([nombre, valor, ee], i) => ({ nombre, valor, ee, num: valor / 100 * (9.5e5 - i * 7e4) })),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const DOMINIO = [0, 4], angosto = width < 480 // dominio fijo del intervalo
    const nivel = (cv) => (cv < 15 ? ["●", "Alta"] : cv < 30 ? ["◐", "Moderada"] : ["○", "Baja"]) // criterio de INEGI
    const ancho = angosto ? 62 : 120, x = d3.scaleLinear().domain(DOMINIO).range([4, ancho - 4]).clamp(true)
    const celda = `padding:${angosto ? "6px 4px" : "6px 7px"};border-bottom:1px solid ${T.gris.rejilla};font:400 ${angosto ? TIPO.valor : TIPO.valor + 1}px/1.3 ${FUENTE.replaceAll('"', "'")};color:${T.tinta};
      text-align:left;vertical-align:middle;letter-spacing:0;text-transform:none;white-space:nowrap`
    const cabeza = `${celda};font-weight:600;font-size:${TIPO.etiqueta + 1}px;color:${T.tintaSuave};border-bottom-color:${T.gris.fondo};white-space:normal`
    const intervalo = (d) => {
      const lo = Math.max(0, d.valor - 1.96 * d.ee), hi = d.valor + 1.96 * d.ee
      return `<svg width="${ancho}" height="18" aria-hidden="true" style="display:block">
        <line x1="${x(DOMINIO[0])}" x2="${x(DOMINIO[1])}" y1="9" y2="9" stroke="${T.gris.rejilla}" stroke-width="1"/>
        <line x1="${x(lo)}" x2="${x(hi)}" y1="9" y2="9" stroke="${T.tintaSuave}" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="${x(d.valor)}" cy="9" r="4" fill="${TONO}" stroke="${T.superficie}" stroke-width="1"/></svg>`
    }
    const tabla = document.createElement("table")
    tabla.style.cssText = "border-collapse:collapse;width:100%;min-width:0;font-variant-numeric:tabular-nums;background:transparent"
    tabla.innerHTML = `<thead><tr><th scope="col" style="${cabeza}">Entidad</th><th scope="col" style="${cabeza};text-align:right">${angosto ? "Valor" : "Estimación"}</th>
      <th scope="col" style="${cabeza}">${angosto ? "Intervalo 95 %" : "Intervalo de 95 % <span style=\"font-weight:400\">(0 a 4 %)</span>"}</th>
      ${angosto ? "" : `<th scope="col" style="${cabeza};text-align:right">Coef. de variación</th>`}<th scope="col" style="${cabeza}">Precisión</th></tr></thead>
      <tbody>${datos.map((d) => { const cv = d.ee / d.valor * 100, [simbolo, texto] = nivel(cv), baja = cv >= 30
        return `<tr data-globo="${d.nombre} · 2020&#10;5 a 17 años que migraron por violencia&#10;${formatear(d.valor)}&#10;Población: ${poblacion(d.num)}${baja ? " · pocos casos" : ""}">
        <th scope="row" style="${celda};font-weight:600;white-space:normal">${d.nombre}</th>
        <td style="${celda};text-align:right;font-weight:600;color:${baja ? T.tintaSuave : T.tinta}">${formatear(d.valor)}${baja ? " *" : ""}</td>
        <td style="${celda}">${intervalo(d)}</td>
        ${angosto ? "" : `<td style="${celda};text-align:right">${punto(cv, 1)} %</td>`}
        <td style="${celda}"><span aria-hidden="true" style="color:${baja ? T.tintaSuave : TONO};font-size:15px">${simbolo}</span> ${texto}</td></tr>` }).join("")}</tbody>`
    const figura = document.createElement("figure")
    figura.style.margin = "0"
    figura.append(titulo("Migración por violencia de 5 a 17 años"), subtitulo("2020 · estimación, intervalo y precisión por entidad"), tabla,
      pie("INEGI, Censo 2020, cuestionario ampliado (datos de ejemplo). Precisión alta con coeficiente de variación menor a 15 %, moderada hasta 30 % y baja (*) desde 30 %."))
    return globoHTML(figura)
  },
  imagen: null, plantilla: { componente: "src/components/formas/tabla-precision.js", galeria: "src/galeria/precision.md#tabla-precision",
    uso: "import {tablaPrecision} from \"../components/formas/tabla-precision.js\"\ntablaPrecision(sel, {ancho: Math.min(ancho, 980), nombre: (d) => (d.cve === \"00\" ? \"Todo el país\" : d.entidad), valor: (d) => d.pct, ee: (d) => d.ee, referencia: nac ? {...nac} : null, dominio: DOMINIO_PCT, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Error Bars", url: DVP("error-bars") },
            { texto: "INEGI, ENOE, documentación de la encuesta (los rangos de precisión por coeficiente de variación, verificación pendiente)", url: "https://www.inegi.org.mx/programas/enoe/15ymas/" }],
},
{
  id: "tabla-od", nombre: "Tabla origen-destino con totales", nivel: 2,
  familia: "tabla", entrada: ["origen-destino"], funcion: ["flujo", "comparacion"], forma: ["cuadrado", "barras"],
  pregunta: "¿Cuántas personas se mueven entre cada par de lugares, y cuántas salen y llegan en total?",
  si: "De cuatro a ocho lugares, cuando se quiere leer la cifra de cada par y los totales de salida y llegada en el mismo cuadro.",
  no: "Más de ocho lugares: la matriz de adyacencia o el ranking de la entidad elegida.",
  datosForma: "[{origen, destino, personas}]  origen = destino se omite",
  datos: () => {
    const L = ["CDMX", "MEX", "JAL", "NL", "PUE", "VER"], r = azar(23)
    const peso = { CDMX: 3.2, MEX: 2.6, JAL: 1.2, NL: 1.0, PUE: 1.1, VER: 1.4 }
    return L.flatMap((o) => L.filter((d) => d !== o).map((d) => ({ origen: o, destino: d,
      personas: Math.round((peso[o] * peso[d] * 14 + r() * 18 + (o === "CDMX" && d === "MEX" ? 140 : 0)) * 1000) })))
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    // Rampa de una tinta que nunca baja de 4.5:1 contra T.tinta: la cifra de la celda va siempre en tinta.
    const lum = (c) => { const { r, g, b } = d3.rgb(c), f = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
    const contraste = (a, b) => { const [p, q] = [lum(a), lum(b)].sort((m, n) => n - m); return (p + 0.05) / (q + 0.05) }
    const hacia = d3.interpolateLab(T.superficie, TONO), tope = d3.range(1, 0.3, -0.02).find((t) => contraste(hacia(t), T.tinta) >= 4.6) ?? 0.3
    const TOPE = 200000, TOPE_TOTAL = 500000 // dominios fijos: «200 mil o más»
    const pintar = (v) => hacia(0.2 + (tope - 0.2) * Math.sqrt(Math.min(v, TOPE) / TOPE))
    const L = [...new Set(datos.map((d) => d.origen))], v = new Map(datos.map((d) => [`${d.origen}|${d.destino}`, d.personas]))
    const salen = new Map(L.map((o) => [o, d3.sum(datos.filter((d) => d.origen === o), (d) => d.personas)]))
    const llegan = new Map(L.map((o) => [o, d3.sum(datos.filter((d) => d.destino === o), (d) => d.personas)]))
    const mil = (n) => punto(n / 1000)
    const celda = `padding:${width < 460 ? "5px 1px" : "6px 3px"};border:2px solid ${T.superficie};font:400 ${width < 460 ? TIPO.etiqueta - 1 : TIPO.etiqueta + 0.5}px/1.2 ${FUENTE.replaceAll('"', "'")};text-align:center;
      vertical-align:middle;letter-spacing:0;text-transform:none;white-space:nowrap`
    const barra = (n, color) => `<div style="height:4px;margin-top:3px;width:${Math.min(n / TOPE_TOTAL, 1) * 100}%;background:${color};border-radius:2px"></div>`
    const tabla = document.createElement("table")
    tabla.style.cssText = "border-collapse:collapse;width:100%;min-width:0;font-variant-numeric:tabular-nums;table-layout:fixed;background:transparent"
    tabla.innerHTML = `<thead><tr><th scope="col" style="${celda};text-align:left;color:${T.tintaSuave};font-weight:600;width:17%;white-space:normal">De ↓ a →</th>
      ${L.map((d) => `<th scope="col" style="${celda};color:${T.tintaSuave};font-weight:600">${d}</th>`).join("")}
      <th scope="col" style="${celda};color:${d3.interpolateLab(T.cambio.desfavorable, T.tinta)(0.2)};font-weight:700;width:15%">Salen</th></tr></thead>
      <tbody>${L.map((o) => `<tr><th scope="row" style="${celda};text-align:left;font-weight:600;color:${T.tinta}">${o}</th>
        ${L.map((d) => { if (o === d) return `<td style="${celda};color:${T.tintaSuave}" data-globo="${o}&#10;Misma entidad: no cuenta como migración entre entidades">—</td>`
          const n = v.get(`${o}|${d}`), fondo = pintar(n)
          return `<td style="${celda};background:${fondo};color:${T.tinta};font-weight:600"
            data-globo="De ${o} a ${d} · 2015 - 2020&#10;Cambiaron de entidad&#10;${poblacion(n)} personas&#10;${Math.round(n / salen.get(o) * 100)} de cada 100 que salieron de ${o}">${mil(n)}</td>` }).join("")}
        <td style="${celda};font-weight:700;color:${T.tinta};text-align:left" data-globo="${o} · 2015 - 2020&#10;Salen a las otras cinco entidades&#10;${poblacion(salen.get(o))} personas">${mil(salen.get(o))}${barra(salen.get(o), T.cambio.desfavorable)}</td></tr>`).join("")}
      <tr><th scope="row" style="${celda};text-align:left;font-weight:700;color:${d3.interpolateLab(T.cambio.favorable, T.tinta)(0.2)}">Llegan</th>
        ${L.map((d) => `<td style="${celda};font-weight:700;color:${T.tinta};text-align:left" data-globo="${d} · 2015 - 2020&#10;Llegan de las otras cinco entidades&#10;${poblacion(llegan.get(d))} personas">${mil(llegan.get(d))}${barra(llegan.get(d), T.cambio.favorable)}</td>`).join("")}<td style="${celda}"></td></tr></tbody>`
    const figura = document.createElement("figure")
    figura.style.margin = "0"
    figura.append(titulo("Migración entre seis entidades"), subtitulo("2015 - 2020 · miles de personas · filas: de dónde salieron; columnas: a dónde llegaron"), tabla,
      pie("INEGI, Censo 2020 (datos de ejemplo). Cada celda son las personas que se mudaron de la fila a la columna; el color, con raíz cuadrada, satura en 200 mil."))
    return globoHTML(figura)
  },
  imagen: null, plantilla: { componente: "src/components/formas/tabla-od.js", galeria: "src/galeria/flujo.md#tabla-od",
    uso: "import {tablaOD} from \"../components/formas/tabla-od.js\"\ntablaOD(lugares, {\n        ancho, valor, nombre: nombreDe, corto: cortoDe2,\n        cifra: (v0, o) => (enPersonas ? numero(v0 / 1000, 1) : entero(parte(v0, o))),\n        color: (v0, o) => (enPersonas ? escalaCelda(v0) : escalaParte(parte(v0, o))),\n        escala: enPersonas ? escalaCelda : escalaParte, tituloLeyenda: enPersonas ? \"Personas\" : \"De cada 100 que salen\",\n        marcasLeyenda: enPerso …})" }, estado: "plantilla",
  fuentes: [{ texto: "INEGI, tabulados de migración interna (matriz entidad de residencia anterior × actual)", url: "https://www.inegi.org.mx/temas/migracion/" },
            { texto: "Datawrapper, tablas con mapa de calor", url: "https://www.datawrapper.de/tables" }],
},
// ================================================================= TRAZADO
{
  id: "puntos-intervalo", nombre: "Puntos con intervalo de confianza", nivel: 1,
  familia: "trazado", entrada: ["intervalos", "categoria-valor"], funcion: ["comparacion", "distribucion"], forma: ["puntos", "linea"],
  pregunta: "¿Cuánto vale cada grupo y con qué margen lo sabemos?",
  si: "Estimaciones de encuesta por entidad o subgrupo, donde algunos intervalos son anchos y el lector no debe ordenar lo que no se distingue.",
  no: "Cifras sin error muestral, o cuando el público solo necesita el valor (barras con la tabla de precisión al lado).",
  datosForma: "[{nombre, corto, valor, ee, num}]  ee en puntos; intervalo = valor ± 1.96 ee",
  datos: () => [["CMX", 52.4, 1.8], ["NLE", 47.1, 2.1], ["QUE", 45.9, 3.4], ["JAL", 44.3, 1.9], ["SIN", 43.8, 3.9], ["PUE", 40.2, 2.4],
    ["YUC", 39.6, 4.2], ["VER", 36.1, 2.2], ["GRO", 33.0, 3.6], ["OAX", 31.7, 3.3], ["CHP", 28.4, 2.9], ["ZAC", 35.2, 5.9]]
    .map(([id, valor, ee]) => { const e = ENT.find((d) => d.id === id)
      return { nombre: e.nombre, corto: e.corto, valor, ee, num: e.pob * 0.11 * valor / 100 } }),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const NACIONAL = 41.3, angosto = width < 520
    const filas = datos.map((d) => ({ ...d, lo: d.valor - 1.96 * d.ee, hi: d.valor + 1.96 * d.ee, baja: d.ee / d.valor >= 0.15 }))
    const orden = [...filas].sort((a, b) => b.valor - a.valor).map((d) => d.nombre)
    const corto = new Map(filas.map((d) => [d.nombre, d.corto]))
    return Plot.plot({
      title: titulo("Asistencia escolar de 18 a 24 años"),
      subtitle: subtitulo(`2024 · raya: intervalo de 95 % · línea punteada: nacional, ${formatear(NACIONAL)}`),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada punto es la estimación de la entidad y la raya su intervalo; punto hueco y * indican precisión baja."),
      style: ESTILO, width, height: filas.length * 30 + 70,
      marginTop: 34, marginRight: 64, marginBottom: 10, marginLeft: angosto ? 52 : 140,
      x: { axis: "top", grid: true, domain: [0, 70], label: "% →" },
      y: { label: null, domain: orden, tickFormat: (n) => (angosto ? corto.get(n) : n) },
      marks: [
        Plot.ruleX([NACIONAL], { stroke: T.gris.tinta, strokeDasharray: "4 3", strokeWidth: 1.2 }),
        Plot.ruleY(filas, { y: "nombre", x1: "lo", x2: "hi", stroke: TONO, strokeOpacity: 0.4, strokeWidth: 6, strokeLinecap: "round" }),
        Plot.dot(filas, { y: "nombre", x: "valor", r: 5, fill: (d) => (d.baja ? T.superficie : TONO), stroke: TONO, strokeWidth: 1.8 }),
        Plot.text(filas, { y: "nombre", x: "hi", dx: 8, textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO,
          text: (d) => formatear(d.valor) + (d.baja ? " *" : "") }),
        Plot.dot(filas, Plot.pointerY({ y: "nombre", x: "valor", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(filas, Plot.pointerY({ y: "nombre", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2024\n18 a 24 años que asisten\n${formatear(d.valor)}\nPoblación: ${poblacion(d.num)}${d.baja ? " · pocos casos" : ""}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/puntos-intervalo.js", galeria: "src/galeria/precision.md#puntos-intervalo",
    uso: "import {puntosIntervalo} from \"../components/formas/puntos-intervalo.js\"\npuntosIntervalo(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, ee: (d) => d.ee, incierta, dominioX: DOMINIO_PCT,\n            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, rotuloX: \"Porcentaje que asiste\", corto, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Dot Plot", url: DVP("dot-plot") },
            { texto: "Datawrapper, range plots (dot plots)", url: "https://www.datawrapper.de/docs/category/dot-plots" }],
},
{
  id: "diferencia-margen", nombre: "Diferencia con su margen de error", nivel: 2,
  familia: "trazado", entrada: ["intervalos"], funcion: ["comparacion"], forma: ["puntos", "linea"],
  pregunta: "¿Qué grupos están de verdad por encima o por debajo de la referencia, y cuáles no se distinguen?",
  si: "Diferencias contra el nacional o entre dos grupos, con error de diseño; el gris dice «no se distingue del margen».",
  no: "Sin error muestral (el gris quedaría para diferencias menores a 0.05 puntos, y basta un lollipop centrado).",
  datosForma: "[{nombre, corto, dif, ee}]  dif en puntos frente a la referencia",
  datos: () => ENT.filter((e) => ["CMX", "NLE", "BCN", "SON", "JAL", "QUE", "MEX", "YUC", "PUE", "MIC", "VER", "GRO", "OAX", "CHP"].includes(e.id))
    .map((e, i) => ({ nombre: e.nombre, corto: e.corto, dif: e.internet - 69.2, ee: 1.4 + (i % 4) * 0.9 })),
  receta: function (datos, width) {
    const angosto = width < 520
    const CLASES = ["Por debajo del nacional", "No se distingue del margen", "Por encima del nacional"]
    // Gris de «no se distingue»: el que más se separa del rojo en luminosidad (validado en claro y en oscuro).
    const GRIS = d3.greatest([T.gris.trazo, T.tintaSuave], (g) => Math.abs(d3.lab(g).l - d3.lab(T.cambio.desfavorable).l))
    const filas = datos.map((d) => { const lo = d.dif - 1.96 * d.ee, hi = d.dif + 1.96 * d.ee
      return { ...d, lo, hi, clase: hi < 0 ? CLASES[0] : lo > 0 ? CLASES[2] : CLASES[1] } })
    const orden = [...filas].sort((a, b) => b.dif - a.dif).map((d) => d.nombre)
    const corto = new Map(filas.map((d) => [d.nombre, d.corto]))
    return Plot.plot({
      title: titulo("Hogares con internet frente al nacional"),
      subtitle: subtitulo("2024 · diferencia en puntos · raya: intervalo de 95 %"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Gris: el intervalo cruza el cero y la diferencia no se distingue del error de la encuesta."),
      style: ESTILO, width, height: filas.length * 28 + 110,
      marginTop: 36, marginRight: 40, marginBottom: 10, marginLeft: angosto ? 52 : 140,
      x: { axis: "top", grid: true, domain: [-35, 35], label: "← debajo · puntos · encima →", tickFormat: (v) => diferencia(v, 0) },
      y: { label: null, domain: orden, tickFormat: (n) => (angosto ? corto.get(n) : n) },
      color: { domain: CLASES, range: [T.cambio.desfavorable, GRIS, T.cambio.favorable], legend: true },
      marks: [
        Plot.ruleX([0], { stroke: T.tinta, strokeWidth: 1.2 }),
        Plot.ruleY(filas, { y: "nombre", x1: "lo", x2: "hi", stroke: "clase", strokeOpacity: 0.45, strokeWidth: 6, strokeLinecap: "round" }),
        Plot.dot(filas, { y: "nombre", x: "dif", r: 5, fill: "clase", stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(filas, { y: "nombre", x: "hi", dx: 7, textAnchor: "start", fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO,
          text: (d) => diferencia(d.dif) }),
        Plot.dot(filas, Plot.pointerY({ y: "nombre", x: "dif", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(filas, Plot.pointerY({ y: "nombre", x: "dif", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2024\nHogares con internet\n${diferencia(d.dif)} puntos frente al nacional\n${d.clase}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/diferencia-margen.js", galeria: "src/galeria/precision.md#diferencia-margen",
    uso: "import {diferenciaMargen} from \"../components/formas/diferencia-margen.js\"\ndiferenciaMargen(filas, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, dif: (d) => d.dif, ee: (d) => d.eeDif, sig: SIG, limite: LIMITE_DIF, rotuloX: \"Diferencia, en puntos\", corto, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Error Bars", url: DVP("error-bars") },
            { texto: "Financial Times, Visual Vocabulary (desviación)", url: "https://ft-interactive.github.io/visual-vocabulary/" }],
},
{
  id: "rango", nombre: "Gráfico de rango", nivel: 1,
  familia: "trazado", entrada: ["intervalos", "distribucion"], funcion: ["distribucion", "comparacion"], forma: ["linea", "puntos"],
  pregunta: "¿Qué tan distintos son los lugares dentro de cada grupo, del mínimo al máximo?",
  si: "Una cifra por entidad y el rango de sus municipios; muestra que el promedio estatal esconde extremos.",
  no: "Interesa cómo se reparten los municipios entre los extremos (franjas con mediana o enjambre).",
  datosForma: "[{nombre, corto, valor, min, max, num}]",
  datos: () => [["OAX", 31.2, 0.4, 98.1], ["CHP", 28.2, 0.2, 99.0], ["YUC", 23.7, 3.5, 92.4], ["GRO", 15.5, 0.1, 96.3],
    ["HID", 12.3, 0.2, 77.5], ["ROO", 11.7, 2.9, 64.8], ["PUE", 9.9, 0.1, 94.6], ["SLP", 8.6, 0.0, 88.9], ["VER", 8.6, 0.0, 90.2], ["CHH", 3.0, 0.0, 71.4]]
    .map(([id, valor, min, max]) => { const e = ENT.find((d) => d.id === id)
      return { nombre: e.nombre, corto: e.corto, valor, min, max, num: e.pob * 0.94 * valor / 100 } }),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const angosto = width < 520
    const orden = [...datos].sort((a, b) => b.valor - a.valor).map((d) => d.nombre)
    const corto = new Map(datos.map((d) => [d.nombre, d.corto]))
    return Plot.plot({
      title: titulo("Hablantes de lengua indígena por municipio"),
      subtitle: subtitulo("2020 · raya: del municipio más bajo al más alto · punto: la entidad"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada raya va del municipio con menor al de mayor porcentaje de hablantes; el punto es el porcentaje de toda la entidad."),
      style: ESTILO, width, height: datos.length * 34 + 70,
      marginTop: 34, marginRight: 38, marginBottom: 10, marginLeft: angosto ? 50 : 130,
      x: { axis: "top", grid: true, domain: [0, 100], label: "% →" },
      y: { label: null, domain: orden, tickFormat: (n) => (angosto ? corto.get(n) : n) },
      marks: [
        Plot.ruleY(datos, { y: "nombre", x1: "min", x2: "max", stroke: T.gris.fondo, strokeWidth: 7, strokeLinecap: "round" }),
        Plot.text(datos, { y: "nombre", x: "max", dx: 8, textAnchor: "start", fontSize: TIPO.etiqueta, fill: T.tintaSuave, ...HALO, text: (d) => punto(d.max) }),
        Plot.dot(datos, { y: "nombre", x: "valor", r: 5.5, fill: TONO, stroke: T.superficie, strokeWidth: 1.2 }),
        Plot.text(datos, { y: "nombre", x: "valor", dy: -11, fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO, text: (d) => punto(d.valor, 1) }),
        Plot.dot(datos, Plot.pointerY({ y: "nombre", x: "valor", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerY({ y: "nombre", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2020\nMunicipios: de ${formatear(d.min)} a ${formatear(d.max)}\nEntidad: ${formatear(d.valor)}\nHablantes: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/rango.js", galeria: "src/galeria/precision.md#rango",
    uso: "import {rango} from \"../components/formas/rango.js\"\nrango(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, minimo: (d) => d.minimo, maximo: (d) => d.maximo, dominioX: DOMINIO_PCT, rotuloX: \"Porcentaje que asiste\", corto, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Span Chart", url: DVP("span-chart") }],
},
{
  id: "puntos-series", nombre: "Puntos de tres series por fila", nivel: 1,
  familia: "trazado", entrada: ["categoria-series"], funcion: ["comparacion"], forma: ["puntos", "linea"],
  pregunta: "¿Dónde queda cada uno de tres grupos en cada categoría, y cuánto los separa?",
  si: "Tres grupos y de 5 a 20 filas; el dumbbell no alcanza y las barras agrupadas se vuelven un bosque.",
  no: "Dos grupos (dumbbell) o más de tres (heatmap). Diferencias de décimas.",
  datosForma: "[{fila, serie, valor, num}]",
  datos: () => ["Yucatán", "Quintana Roo", "Hidalgo", "Puebla", "Veracruz", "Guerrero", "Oaxaca", "Chiapas"].flatMap((fila, i) =>
    [["Habla lengua indígena", 22 + i * 1.3 + (i % 3) * 2], ["Se considera indígena, no habla", 41 + (i % 4) * 3.1], ["Resto de la población", 58 + (7 - i) * 2.6]]
      .map(([serie, valor], k) => ({ fila, serie, valor, num: valor * (k === 2 ? 9e3 : 3e3) * (8 - i) }))),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const SERIES = ["Habla lengua indígena", "Se considera indígena, no habla", "Resto de la población"]
    const angosto = width < 520
    const filas = [...new Set(datos.map((d) => d.fila))]
    const tramos = d3.groups(datos, (d) => d.fila).map(([fila, v]) => ({ fila, a: d3.min(v, (d) => d.valor), b: d3.max(v, (d) => d.valor) }))
    return Plot.plot({
      title: titulo("Hogares con internet según condición indígena"),
      subtitle: subtitulo("2024 · el grupo de interés en color y los otros dos en gris"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada símbolo es el porcentaje de hogares con internet de un grupo; la raya une al más bajo con el más alto."),
      style: ESTILO, width, height: filas.length * 32 + 110,
      marginTop: 36, marginRight: 30, marginBottom: 10, marginLeft: angosto ? 96 : 120,
      x: { axis: "top", grid: true, domain: [0, 100], label: "% →" },
      y: { label: null, domain: filas },
      color: { domain: SERIES, range: [TONO, T.tintaSuave, T.gris.fondo] }, // el gris claro lleva contorno (no llega a 3:1 con el fondo)
      symbol: { domain: SERIES, range: ["circle", "square", "triangle"], legend: true },
      marks: [
        Plot.ruleY(tramos, { y: "fila", x1: "a", x2: "b", stroke: T.gris.fondo, strokeWidth: 2.5 }),
        Plot.dot(datos, { y: "fila", x: "valor", fill: "serie", symbol: "serie", r: 5.5, stroke: (d) => (d.serie === SERIES[2] ? T.gris.trazo : T.superficie), strokeWidth: 1.2 }),
        Plot.text(datos.filter((d) => d.serie === SERIES[0]), { y: "fila", x: "valor", dy: -12, fontSize: TIPO.etiqueta, fontWeight: 600,
          fill: "currentColor", ...HALO, text: (d) => punto(d.valor) }),
        Plot.dot(datos, Plot.pointerY({ y: "fila", x: "valor", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerY({ y: "fila", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.fila} · 2024\n${d.serie}\n${formatear(d.valor)}\nHogares: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/puntos-series.js", galeria: "src/galeria/comparacion.md#puntos-series",
    uso: "import {puntosSeries} from \"../components/formas/puntos-series.js\"\npuntosSeries(sel, {ancho, fila: (d) => d.entidad, serie: (d) => d.grupo, valor: (d) => d.pct, series: GRUPOS_INDIGENA, color, ordenPor: v.orden,\n            dominioX: DOMINIO_PCT, rotuloX: \"Porcentaje de hogares\", incierta, corto: (n) => ENTIDADES.find((e) => e.nombre === n)?.corto ?? n, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "William Cleveland, dot plot (Data Viz Project, Dot Chart)", url: DVP("dot-chart") },
            { texto: "Datawrapper, dot plots", url: "https://www.datawrapper.de/docs/category/dot-plots" }],
},
// ================================================================= GRÁFICAS
{
  id: "saldo", nombre: "Entradas y salidas con saldo", nivel: 1,
  familia: "grafica", entrada: ["categoria-series", "origen-destino"], funcion: ["flujo", "comparacion"], forma: ["barras"],
  pregunta: "¿Cuántas personas salen y cuántas llegan a cada lugar, y cuál es su saldo?",
  si: "Migración por entidad cuando importa ver los dos sentidos y no solo el saldo neto, que puede esconder flujos grandes que se cancelan.",
  no: "Interesa de dónde a dónde (sankey, mapa de flujos) o el saldo es una tasa por cada mil habitantes (barras divergentes).",
  datosForma: "[{nombre, corto, salen, llegan}]  personas",
  datos: () => [["MEX", 248, 312], ["CMX", 296, 168], ["JAL", 96, 128], ["NLE", 64, 152], ["QUE", 42, 98], ["ROO", 31, 92],
    ["BCN", 58, 101], ["VER", 168, 74], ["GRO", 122, 39], ["CHP", 109, 31], ["OAX", 94, 47], ["TAB", 66, 34]]
    .map(([id, salen, llegan]) => { const e = ENT.find((d) => d.id === id)
      return { nombre: e.nombre, corto: e.corto, salen: salen * 1000, llegan: llegan * 1000 } }),
  receta: function (datos, width) {
    const angosto = width < 520
    const ents = datos.map((d) => ({ ...d, saldo: d.llegan - d.salen })).sort((a, b) => b.saldo - a.saldo)
    const orden = ents.map((d) => d.nombre), corto = new Map(ents.map((d) => [d.nombre, d.corto]))
    const barras = ents.flatMap((d) => [{ ...d, sentido: "Salen", x: -d.salen, n: d.salen }, { ...d, sentido: "Llegan", x: d.llegan, n: d.llegan }])
    const mil = (n) => `${punto(Math.abs(n) / 1000)} mil`
    return Plot.plot({
      title: titulo("Migración entre entidades: salen y llegan"),
      subtitle: subtitulo("2015 - 2020 · ordenado por saldo · rombo: saldo"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). A la izquierda las personas que salieron de la entidad, a la derecha las que llegaron; el rombo marca la diferencia."),
      style: ESTILO, width, height: ents.length * 30 + 100,
      marginTop: 36, marginRight: angosto ? 58 : 74, marginBottom: 10, marginLeft: angosto ? 52 : 120,
      x: { axis: "top", grid: true, domain: [-340000, 340000], label: "← salen · miles de personas · llegan →", tickFormat: (v) => punto(Math.abs(v) / 1000),
        ticks: angosto ? [-300000, 0, 300000] : [-300000, -200000, -100000, 0, 100000, 200000, 300000] },
      y: { label: null, domain: orden, tickFormat: (n) => (angosto ? corto.get(n) : n) },
      color: { domain: ["Salen", "Llegan"], range: [T.cambio.desfavorable, T.cambio.favorable], legend: true },
      marks: [
        Plot.barX(barras, { y: "nombre", x: "x", fill: "sentido", fillOpacity: 0.85, insetTop: 4, insetBottom: 4 }),
        Plot.ruleX([0], { stroke: T.tinta, strokeWidth: 1.2 }),
        Plot.dot(ents, { y: "nombre", x: "saldo", symbol: "diamond", r: 5, fill: T.tinta, stroke: T.superficie, strokeWidth: 1.2 }),
        Plot.text(ents, { y: "nombre", frameAnchor: "right", dx: angosto ? 54 : 70, textAnchor: "end", fontSize: TIPO.etiqueta, fontWeight: 600,
          fill: "currentColor", text: (d) => `${d.saldo >= 0 ? "+" : "−"}${mil(d.saldo)}` }),
        Plot.barX(barras, Plot.pointerY({ y: "nombre", x: "x", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8, insetTop: 4, insetBottom: 4, maxRadius: Infinity })),
        Plot.tip(barras, Plot.pointerY({ y: "nombre", x: "x", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2015 - 2020\n${d.sentido}\n${poblacion(d.n)} personas\nSaldo: ${d.saldo >= 0 ? "+" : "−"}${mil(d.saldo)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/saldo.js", galeria: "src/galeria/flujo.md#saldo",
    uso: "import {saldo} from \"../components/formas/saldo.js\"\nsaldo(filas, {\n        ancho, nombre: (d) => d.entidad, corto: (d) => POR_CVE.get(d.cve)?.corto ?? d.entidad,\n        salen: (d) => m.de(d, \"salen\"), llegan: (d) => m.de(d, \"llegan\"), tope: m.tope, marcas: m.marcas, formatoEje: m.eje,\n        formato: (x) => (v.medida === \"personas\" ? entero(x) : numero(x, 1)),\n        color: {salen: SIG_FLUJO.color(\"baja\"), llegan: SIG_FLUJO.color(\"sube\")},\n      …})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Butterfly Chart", url: DVP("butterfly-chart") },
            { texto: "Financial Times, Visual Vocabulary (desviación)", url: "https://ft-interactive.github.io/visual-vocabulary/" }],
},
{
  id: "curvas-acumuladas", nombre: "Curvas acumuladas de dos grupos con flechas", nivel: 2,
  familia: "grafica", entrada: ["distribucion"], funcion: ["distribucion", "comparacion"], forma: ["linea"],
  pregunta: "¿Qué parte de cada grupo queda por debajo de cualquier umbral, y cuánto los separa en cada uno?",
  si: "Una medida con varios umbrales razonables (años de escolaridad, ingreso) y dos grupos o dos cortes.",
  no: "Un solo umbral reconocido (basta una barra) o más de dos grupos.",
  datosForma: "[{grupo, x, pct, num}]  pct = % del grupo con menos de x",
  datos: () => {
    const grupo = (nombre, media, sd, total) => {
      const p = d3.range(0, 19).map((k) => Math.exp(-((k - media) ** 2) / (2 * sd * sd)) * ([6, 9, 12].includes(k) ? 1.9 : 1) + 0.01)
      const s = d3.sum(p); let acum = 0
      return d3.range(0, 19).map((x) => { const pct = acum / s * 100; acum += p[x]; return { grupo: nombre, x, pct, num: pct / 100 * total } })
    }
    return [...grupo("Habla lengua indígena", 6.4, 4.0, 3.9e6), ...grupo("No habla", 10.4, 3.8, 62e6)]
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const GRUPOS = ["Habla lengua indígena", "No habla"]
    const UMBRALES = [[6, "Primaria"], [9, "Secundaria"], [12, "Media superior"]]
    const valor = new Map(datos.map((d) => [`${d.grupo}|${d.x}`, d.pct]))
    const flechas = UMBRALES.map(([x, nivel]) => ({ x, nivel, a: valor.get(`${GRUPOS[1]}|${x}`), b: valor.get(`${GRUPOS[0]}|${x}`) }))
    return Plot.plot({
      title: titulo("Escolaridad de la población de 25 a 64 años"),
      subtitle: subtitulo("2020 · porcentaje con menos de los años indicados · flecha: distancia entre grupos"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada curva acumula, de izquierda a derecha, el porcentaje del grupo con menos años de escuela."),
      style: ESTILO, width, height: 360,
      marginTop: 28, marginRight: 20, marginBottom: 42, marginLeft: 44,
      x: { domain: [0, 18], label: "Años de escolaridad →", ticks: [0, 3, 6, 9, 12, 15, 18] },
      y: { domain: [0, 100], grid: true, label: "↑ % con menos años" },
      color: { domain: GRUPOS, range: [TONO, T.tintaSuave], legend: true },
      marks: [
        Plot.ruleX(UMBRALES.map((u) => u[0]), { stroke: T.gris.fondo, strokeDasharray: "3 3" }),
        Plot.text(UMBRALES, { x: (u) => u[0], frameAnchor: "top", dy: -14, text: (u) => u[1], fontSize: TIPO.etiqueta, fill: T.tintaSuave }),
        Plot.line(datos, { x: "x", y: "pct", stroke: "grupo", strokeWidth: 2.4, curve: "step-after" }),
        Plot.arrow(flechas, { x1: "x", y1: "a", x2: "x", y2: "b", stroke: T.tinta, strokeWidth: 1.4, headLength: 7, insetEnd: 3, insetStart: 3 }),
        Plot.text(flechas, { x: "x", y: "b", dx: -6, dy: -6, textAnchor: "end", fontSize: TIPO.etiqueta, fontWeight: 700, fill: "currentColor", ...HALO, text: (d) => punto(d.b) }),
        Plot.text(flechas, { x: "x", y: "a", dx: 6, dy: 6, textAnchor: "start", fontSize: TIPO.etiqueta, fill: T.tintaSuave, ...HALO, text: (d) => punto(d.a) }),
        Plot.dot(datos, Plot.pointerX({ x: "x", y: "pct", r: 6, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerX({ x: "x", y: "pct", maxRadius: Infinity, ...GLOBO,
          title: (d) => `Menos de ${d.x} años de escuela · 2020\n${d.grupo}\n${formatear(d.pct)}\nPersonas: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/curvas-acumuladas.js", galeria: "src/galeria/distribucion.md#curvas-acumuladas",
    uso: "import {curvasAcumuladas} from \"../components/formas/curvas-acumuladas.js\"\ncurvasAcumuladas(filas, {ancho, grupos, umbrales: UMBRALES, dominioX: [0, 18], rotuloX: \"Años de escuela\", rotuloY: \"Porcentaje con menos años\", globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Our World in Data en el Data Vis Dispatch del 27 de octubre de 2026 (formas-novedosas, D11)", url: DISPATCH.oct27 }],
},
{
  id: "concentracion", nombre: "Curva de concentración", nivel: 2,
  familia: "grafica", entrada: ["distribucion", "geo-valor"], funcion: ["distribucion", "geolocalizacion"], forma: ["linea", "area"],
  pregunta: "¿Qué tan concentrado está un total en pocos lugares?",
  si: "Muchos lugares (municipios) y una cantidad que se suma; frases como «el 10 % de los municipios reúne la mitad».",
  no: "Pocos lugares (barras ordenadas) o tasas que no se suman.",
  datosForma: "[{grupo, x, y}]  x = % acumulado de municipios, y = % acumulado del total",
  datos: () => {
    const r = azar(51), N = 2469
    const pob = d3.range(N).map(() => Math.exp(8.6 + 1.45 * Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r())))
    const habl = pob.map((p) => p * Math.min(0.97, r() ** 5))
    const curva = (grupo, v) => { const o = [...v].sort((a, b) => b - a), s = d3.sum(o); let acum = 0
      const pts = o.map((x, i) => { acum += x; return { grupo, x: (i + 1) / N * 100, y: acum / s * 100 } })
      return [{ grupo, x: 0, y: 0 }, ...pts.filter((d, i) => i % 12 === 0 || i === N - 1)] }
    return [...curva("Hablantes de lengua indígena", habl), ...curva("Población total", pob)]
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const GRUPOS = ["Hablantes de lengua indígena", "Población total"], CORTE = 10
    const en = (g) => { const s = datos.filter((d) => d.grupo === g); return s.find((d) => d.x >= CORTE) }
    const marcas = GRUPOS.map((g) => ({ grupo: g, ...en(g) }))
    return Plot.plot({
      title: titulo("Concentración de hablantes por municipio"),
      subtitle: subtitulo("2020 · municipios ordenados de más a menos · diagonal: reparto parejo"),
      caption: pie(`INEGI, Censo 2020 (datos de ejemplo). La curva suma el porcentaje del total que reúnen los municipios, empezando por el mayor; el ${CORTE} % de los municipios reúne ${punto(marcas[0].y)} % de los hablantes.`),
      style: ESTILO, width, height: Math.min(420, Math.max(320, width * 0.72)),
      marginTop: 20, marginRight: 20, marginBottom: 42, marginLeft: 44,
      x: { domain: [0, 100], label: "% de municipios →", ticks: [0, 10, 25, 50, 75, 100] },
      y: { domain: [0, 100], grid: true, label: "↑ % acumulado del total" },
      color: { domain: GRUPOS, range: [TONO, T.tintaSuave], legend: true },
      marks: [
        Plot.line([[0, 0], [100, 100]], { stroke: T.gris.fondo, strokeDasharray: "4 3" }),
        Plot.areaY(datos.filter((d) => d.grupo === GRUPOS[0]), { x: "x", y: "y", fill: TONO, fillOpacity: 0.1 }),
        Plot.line(datos, { x: "x", y: "y", stroke: "grupo", strokeWidth: 2.4 }),
        Plot.ruleX([CORTE], { stroke: T.gris.trazo, strokeDasharray: "2 3" }),
        Plot.dot(marcas, { x: "x", y: "y", fill: "grupo", r: 4.5, stroke: T.superficie }),
        Plot.text(marcas, { x: "x", y: "y", dx: 8, textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 700, fill: "currentColor", ...HALO,
          text: (d) => `${punto(d.y)} %` }),
        Plot.dot(datos, Plot.pointerX({ x: "x", y: "y", r: 6, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerX({ x: "x", y: "y", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${punto(d.x)} % de los municipios · 2020\n${d.grupo}\nReúnen el ${formatear(d.y)} del total` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/concentracion.js", galeria: "src/galeria/distribucion.md#concentracion",
    uso: "import {concentracion} from \"../components/formas/concentracion.js\"\nconcentracion([...c0, ...c1], {ancho, grupos: [G0, G1], corte: v.corte, marcas, rotuloX: \"Porcentaje de los municipios, del mayor al menor\", rotuloY: \"Porcentaje acumulado del total\", globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Max O. Lorenz (1905), curva de Lorenz", url: "https://es.wikipedia.org/wiki/Curva_de_Lorenz" },
            { texto: "Financial Times, Visual Vocabulary (distribución)", url: "https://ft-interactive.github.io/visual-vocabulary/" }],
},
{
  id: "linea-banda", nombre: "Línea con banda de confianza", nivel: 1,
  familia: "grafica", entrada: ["serie-tiempo", "intervalos"], funcion: ["tiempo", "distribucion"], forma: ["linea", "area"],
  pregunta: "¿Cómo evoluciona una estimación de encuesta y qué cambios caben dentro del error?",
  si: "Series trimestrales o anuales de una encuesta (ENOE) con cinco o más cortes y su error de diseño.",
  no: "Dos o tres cortes (puntos con intervalo) o cifras censales sin error.",
  datosForma: "[{fecha, valor, ee, num}]  valor null = sin dato",
  datos: () => {
    const r = azar(9)
    return d3.range(26).map((i) => {
      const anio = 2019 + Math.floor(i / 4), t = i % 4, sinDato = anio === 2020 && t === 1
      const valor = sinDato ? null : 16.8 - i * 0.12 + (anio === 2020 ? -2.6 : 0) + (anio === 2021 ? -1.1 : 0) + (r() - 0.5) * 0.9
      return { fecha: new Date(Date.UTC(anio, t * 3, 1)), etiqueta: `${anio} T${t + 1}`, valor, ee: 0.55 + r() * 0.25, num: valor == null ? null : valor / 100 * 6.6e6 }
    })
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const filas = datos.map((d) => ({ ...d, lo: d.valor == null ? null : d.valor - 1.96 * d.ee, hi: d.valor == null ? null : d.valor + 1.96 * d.ee }))
    const hueco = filas.filter((d) => d.valor == null)
    return Plot.plot({
      title: titulo("Población de 15 a 17 años que trabaja"),
      subtitle: subtitulo("2019 - 2025, por trimestre · banda: intervalo de 95 %"),
      caption: pie("INEGI, ENOE 2019 - 2025 (datos de ejemplo). La línea es la estimación de cada trimestre y la banda su intervalo; el segundo trimestre de 2020 no se levantó."),
      style: ESTILO, width, height: Math.min(360, Math.max(280, width * 0.55)),
      marginTop: 20, marginRight: 20, marginBottom: 36, marginLeft: 44,
      x: { type: "utc", label: null, ticks: width < 520 ? 4 : 7, tickFormat: (d) => String(new Date(d).getUTCFullYear()) },
      y: { domain: [0, 25], grid: true, label: "↑ %" },
      marks: [
        Plot.areaY(filas, { x: "fecha", y1: "lo", y2: "hi", fill: TONO, fillOpacity: 0.2 }),
        Plot.line(filas, { x: "fecha", y: "valor", stroke: TONO, strokeWidth: 2.2 }),
        Plot.dot(filas, { x: "fecha", y: "valor", r: 2.4, fill: TONO }),
        Plot.ruleX(hueco, { x: "fecha", stroke: T.gris.trazo, strokeDasharray: "2 3" }),
        Plot.text(hueco, { x: "fecha", y: 4, text: () => "sin dato", fontSize: TIPO.etiqueta, fill: T.tintaSuave, ...HALO }),
        Plot.text(filas.slice(-1), { x: "fecha", y: "valor", dy: -12, textAnchor: "end", fontSize: TIPO.valor, fontWeight: 700, fill: "currentColor", ...HALO,
          text: (d) => formatear(d.valor) }),
        Plot.ruleX(filas.filter((d) => d.valor != null), Plot.pointerX({ x: "fecha", stroke: T.gris.tinta, strokeWidth: 1.2, maxRadius: Infinity })),
        Plot.dot(filas.filter((d) => d.valor != null), Plot.pointerX({ x: "fecha", y: "valor", r: 6, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(filas.filter((d) => d.valor != null), Plot.pointerX({ x: "fecha", y: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.etiqueta}\n15 a 17 años que trabajan\n${formatear(d.valor)}\nPersonas: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/linea-banda.js", galeria: "src/galeria/precision.md#linea-banda",
    uso: "import {lineaBanda} from \"../components/formas/linea-banda.js\"\nlineaBanda(serie, {ancho: Math.min(ancho, 1100), x: (d) => d.i, valor: (d) => d.pct, ee: (d) => d.ee, z: nivel.z, nivel: nivel.texto, dominioY: DOMINIO_TRABAJO,\n            rotuloY: \"Porcentaje que trabaja\", marcasX: marcas, formatoX: (i) => String(serie[i]?.anio ?? \"\"), globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Range Area Chart", url: DVP("range-area-chart") },
            { texto: "Data Viz Project, Fan Chart (Time Series)", url: DVP("fan-chart-time-series") }],
},
{
  id: "cortes-comparables", nombre: "Línea de vida de cortes comparables", nivel: 1,
  familia: "grafica", entrada: ["intervalos", "serie-tiempo"], funcion: ["tiempo", "concepto"], forma: ["linea", "puntos"],
  pregunta: "¿Qué ediciones de cada fuente se pueden comparar entre sí, y dónde se rompe la serie?",
  si: "Al abrir un capítulo o en Metodología, cuando el libro cruza varias encuestas con cambios de definición o de diseño.",
  no: "Como figura de un resultado: no lleva cifras del tema, solo la cobertura de las fuentes.",
  datosForma: "[{indicador, fuente, tramos: [[años comparables], …], motivo}]",
  datos: () => [
    { indicador: "Ingreso de los hogares", fuente: "ENIGH", tramos: [[2008, 2010, 2012, 2014], [2016, 2018, 2020, 2022, 2024]], motivo: "Nueva serie desde 2016" },
    { indicador: "Posgrado (maestría y doctorado)", fuente: "ENIGH", tramos: [[2016, 2018, 2020, 2022], [2024]], motivo: "Cambia la escala de nivel aprobado en 2024" },
    { indicador: "Violencia contra las mujeres", fuente: "ENDIREH", tramos: [[2006], [2011], [2016, 2021]], motivo: "Cambios de cuestionario antes de 2016" },
    { indicador: "Habla lengua indígena", fuente: "Censo e Intercensal", tramos: [[2010, 2015, 2020]], motivo: "" },
    { indicador: "Migración interna", fuente: "ENADID", tramos: [[2014, 2018, 2023]], motivo: "" },
  ],
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const filas = datos.map((d) => d.indicador)
    const ediciones = datos.flatMap((d) => d.tramos.flatMap((t) => t.map((anio) => ({ ...d, anio, tramo: t }))))
    const tramos = datos.flatMap((d) => d.tramos.filter((t) => t.length > 1).map((t) => ({ indicador: d.indicador, x1: t[0], x2: t.at(-1) })))
    const quiebres = datos.flatMap((d) => d.tramos.slice(1).map((t, i) => ({ indicador: d.indicador, x1: d.tramos[i].at(-1), x2: t[0] })))
    return Plot.plot({
      title: titulo("Ediciones comparables de cada fuente"),
      subtitle: subtitulo("2005 - 2025 · línea continua: se pueden comparar · ≠ cambio de definición o de diseño"),
      caption: pie("Cortes y quiebres de ejemplo; cada libro los confirma en la documentación de la encuesta. Cada punto es una edición levantada."),
      style: ESTILO, width, height: filas.length * 56 + 60,
      marginTop: 30, marginRight: 20, marginBottom: 32, marginLeft: 16,
      x: { domain: [2005, 2025], grid: true, label: null, ticks: width < 520 ? [2005, 2015, 2025] : [2005, 2010, 2015, 2020, 2025], tickFormat: (v) => String(v) },
      y: { domain: filas, axis: null, padding: 0.1 },
      marks: [
        Plot.text(datos, { y: "indicador", x: 2005, dy: -16, textAnchor: "start", fontSize: TIPO.ejes, fontWeight: 600, fill: "currentColor",
          text: (d) => `${d.indicador} · ${d.fuente}` }),
        Plot.link(quiebres, { y1: "indicador", y2: "indicador", x1: "x1", x2: "x2", stroke: T.gris.trazo, strokeDasharray: "2 4", strokeWidth: 1.5 }),
        Plot.text(quiebres, { y: "indicador", x: (d) => (d.x1 + d.x2) / 2, text: () => "≠", fontSize: 16, fontWeight: 700, fill: T.tinta, ...HALO }),
        Plot.ruleY(tramos, { y: "indicador", x1: "x1", x2: "x2", stroke: TONO, strokeWidth: 3.5, strokeLinecap: "round" }),
        Plot.dot(ediciones, { y: "indicador", x: "anio", r: 5, fill: TONO, stroke: T.superficie, strokeWidth: 1.5 }),
        Plot.dot(ediciones, Plot.pointerY({ y: "indicador", x: "anio", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(ediciones, Plot.pointerY({ y: "indicador", x: "anio", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.fuente} ${d.anio}\n${d.indicador}\n${d.tramo.length > 1 ? `Comparable con ${d.tramo[0]} - ${d.tramo.at(-1)}` : "Sin otra edición comparable"}${d.motivo ? `\n${d.motivo}` : ""}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/cortes-comparables.js", galeria: "src/galeria/tiempo.md#cortes-comparables",
    uso: "import {cortesComparables} from \"../components/formas/cortes-comparables.js\"\ncortesComparables(filas, {ancho, fila: (d) => d.indicador, anio: (d) => d.anio, tramo: (d) => d.tramo, dominio: [2005, 2025], apagada,\r\n            rotulo: (f) => `${f} · ${fuenteDe.get(f)}`, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Gantt Chart", url: DVP("gannt-chart") }, { texto: "Data Viz Project, Timeline", url: DVP("timeline") }],
},
{
  id: "fichas-rango", nombre: "Fichas por rango con marca de cambio", nivel: 1,
  familia: "grafica", entrada: ["geo-valor", "dos-cortes"], funcion: ["unidades", "comparacion"], forma: ["hexagono"],
  pregunta: "¿Cuántas entidades hay en cada rango, cuáles son y cuáles cambiaron de rango?",
  si: "Las 32 entidades en cuatro a seis rangos ordenados, cuando el lector busca su entidad por nombre y le importa el rango más que la décima.",
  no: "Comparar valores exactos (lollipop) o ubicar en el territorio (mosaico de entidades).",
  datosForma: "[{id, nombre, corto, valor, antes}]  valor y antes en %",
  datos: () => { const r = azar(31)
    return ENT.map((e) => ({ id: e.id, nombre: e.nombre, corto: e.corto, valor: e.indigena, antes: e.indigena * (1.04 + r() * 0.3), num: e.pob * e.indigena / 100 })) },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    // Clases ordenadas: cinco pasos de una tinta, igual de separados en luminosidad, y el más claro a 2:1 o más del fondo.
    const lum = (c) => { const { r, g, b } = d3.rgb(c), f = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
    const contraste = (a, b) => { const [p, q] = [lum(a), lum(b)].sort((m, n) => n - m); return (p + 0.05) / (q + 0.05) }
    const tinta = d3.piecewise(d3.interpolateLab, [T.superficie, TONO, d3.interpolateLab(TONO, T.tinta)(0.75)]), L = (t) => d3.lab(tinta(t)).l
    const t0 = d3.range(0, 1, 0.01).find((t) => contraste(tinta(t), T.superficie) >= 2.1)
    const tPara = (l) => { let a = t0, b = 1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; (L(m) - l) * (L(1) - L(t0)) < 0 ? (a = m) : (b = m) } return (a + b) / 2 }
    const RANGOS = [[0, 1, "Menos de 1 %"], [1, 5, "De 1 a 5 %"], [5, 10, "De 5 a 10 %"], [10, 20, "De 10 a 20 %"], [20, 101, "20 % o más"]]
    const rango = (v) => RANGOS.findIndex(([a, b]) => v >= a && v < b)
    const color = (k) => tinta(tPara(L(t0) + (L(1) - L(t0)) * k / (RANGOS.length - 1)))
    const R = 18, PASO = 2 * R + 4, porRenglon = Math.max(4, Math.floor((width - 8) / PASO))
    const fichas = [], rotulos = []
    let y = 22
    RANGOS.map((r, k) => k).reverse().forEach((k) => {
      const grupo = datos.filter((d) => rango(d.valor) === k).sort((a, b) => b.valor - a.valor)
      rotulos.push({ x: 4, y, texto: `${RANGOS[k][2]} · ${grupo.length} entidades` })
      y += 14 + R
      grupo.forEach((d, i) => fichas.push({ ...d, k, x: 4 + R + (i % porRenglon) * PASO, y: y + Math.floor(i / porRenglon) * PASO,
        bajo: rango(d.antes) > k, rangoAntes: RANGOS[rango(d.antes)][2] }))
      y += Math.max(1, Math.ceil(grupo.length / porRenglon)) * PASO + 12
    })
    return Plot.plot({
      title: titulo("Entidades según su porcentaje de hablantes de lengua indígena"),
      subtitle: subtitulo("2020 · ▼ bajó de rango desde 2015"),
      caption: pie("INEGI, Censos 2020 e Intercensal 2015 (datos de ejemplo). Cada hexágono es una entidad, en el renglón de su rango y ordenada de mayor a menor."),
      style: ESTILO, width, height: y, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      marks: [
        Plot.text(rotulos, { x: "x", y: "y", text: "texto", textAnchor: "start", fontSize: TIPO.ejes, fontWeight: 600, fill: "currentColor" }),
        Plot.dot(fichas, { x: "x", y: "y", symbol: "hexagon", r: R, fill: (d) => color(d.k), stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(fichas, { x: "x", y: "y", text: "corto", fontSize: 10, fontWeight: 700, fill: T.tinta, ...HALO }),
        Plot.dot(fichas.filter((d) => d.bajo), { x: (d) => d.x + R * 0.72, y: (d) => d.y - R * 0.66, symbol: "triangle", rotate: 180, r: 5,
          fill: T.cambio.desfavorable, stroke: T.superficie, strokeWidth: 1.2 }),
        Plot.dot(fichas, Plot.pointer({ x: "x", y: "y", symbol: "hexagon", r: R + 1, fill: "none", stroke: T.gris.tinta, strokeWidth: 2, maxRadius: Infinity })),
        Plot.tip(fichas, Plot.pointer({ x: "x", y: "y", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2020\n${RANGOS[d.k][2]}${d.bajo ? ` (en 2015: ${d.rangoAntes})` : ""}\n${formatear(d.valor)}\nHablantes: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/fichas-rango.js", galeria: "src/galeria/unidades.md#fichas-rango",
    uso: "import {fichasRango} from \"../components/formas/fichas-rango.js\"\nfichasRango(valores, {ancho, valor: (d) => d.pct, antes: (d) => d.antes, rangos: RANGOS, escala, colorCambio: (s) => SIG.color(s),\n        textoCambio: {sube: `Subió de rango desde ${v.comparar}`, baja: `Bajó de rango desde ${v.comparar}`}, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "The Guardian en el Data Vis Dispatch del 10 de noviembre de 2026 (formas-novedosas, D10)", url: DISPATCH.nov10 }],
},
{
  id: "combinaciones", nombre: "Combinaciones de condiciones (UpSet)", nivel: 2,
  familia: "grafica", entrada: ["conteo", "partes"], funcion: ["parte-todo", "comparacion"], forma: ["barras", "puntos"],
  pregunta: "¿Cuántos tienen cada combinación de tres o cuatro condiciones a la vez?",
  si: "Carencias o condiciones que se acumulan (sin internet, hacinamiento, rezago) y la pregunta es cuántos tienen dos o tres juntas.",
  no: "Dos condiciones (diagrama de Euler) o más de cuatro: las combinaciones crecen al doble con cada una.",
  datosForma: "[{combo: [condiciones], valor, num}]  las combinaciones suman 100",
  datos: () => [[[], 48.0], [["Sin internet"], 22.5], [["Sin internet", "Rezago educativo"], 10.2], [["Rezago educativo"], 8.1],
    [["Sin internet", "Hacinamiento"], 3.9], [["Hacinamiento"], 3.4], [["Sin internet", "Hacinamiento", "Rezago educativo"], 2.8], [["Hacinamiento", "Rezago educativo"], 1.1]]
    .map(([combo, valor]) => ({ combo, valor, num: valor / 100 * 38.8e6 })),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const CONDICIONES = ["Sin internet", "Hacinamiento", "Rezago educativo"], POS = [-27, -18, -9] // la matriz vive a la izquierda del cero
    const nombre = (c) => (c.length ? c.join(" + ") : "Ninguna de las tres")
    const filas = [...datos].sort((a, b) => b.valor - a.valor).map((d) => ({ ...d, nombre: nombre(d.combo) }))
    const orden = filas.map((d) => d.nombre)
    const celdas = filas.flatMap((d) => CONDICIONES.map((c, i) => ({ nombre: d.nombre, x: POS[i], tiene: d.combo.includes(c) })))
    const uniones = filas.filter((d) => d.combo.length > 1).map((d) => {
      const xs = d.combo.map((c) => POS[CONDICIONES.indexOf(c)]); return { nombre: d.nombre, x1: d3.min(xs), x2: d3.max(xs) } })
    return Plot.plot({
      title: titulo("Hogares según las carencias que reúnen"),
      subtitle: subtitulo("2024 · cada renglón es una combinación; los puntos llenos dicen cuáles tiene"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada barra es el porcentaje de hogares con exactamente esa combinación; los ocho renglones suman 100 %."),
      style: ESTILO, width, height: filas.length * 30 + 130,
      marginTop: 110, marginRight: 64, marginBottom: 10, marginLeft: 10,
      x: { domain: [-31, 60], axis: null },
      y: { domain: orden, axis: null },
      marks: [
        Plot.text(CONDICIONES.map((c, i) => ({ c, x: POS[i] })), { x: "x", y: () => orden[0], dy: -24, text: "c", rotate: -55, textAnchor: "start",
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor" }),
        Plot.ruleY(uniones, { y: "nombre", x1: "x1", x2: "x2", stroke: TONO, strokeWidth: 2.5 }),
        Plot.dot(celdas, { y: "nombre", x: "x", r: 5.5, fill: (d) => (d.tiene ? TONO : T.gris.rejilla), stroke: (d) => (d.tiene ? T.superficie : T.gris.fondo) }),
        Plot.ruleX([0], { stroke: T.gris.fondo }),
        Plot.barX(filas, { y: "nombre", x1: 0, x2: "valor", fill: TONO, fillOpacity: 0.85, insetTop: 5, insetBottom: 5 }),
        Plot.text(filas, { y: "nombre", x: "valor", dx: 6, textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO,
          text: (d) => formatear(d.valor) + (d.combo.length ? "" : " ninguna") }),
        Plot.barX(filas, Plot.pointerY({ y: "nombre", x1: 0, x2: "valor", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8, insetTop: 5, insetBottom: 5, maxRadius: Infinity })),
        Plot.tip(filas, Plot.pointerY({ y: "nombre", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `Hogares · 2024\n${d.nombre}\n${formatear(d.valor)}\nHogares: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/combinaciones.js", galeria: "src/galeria/parte-todo.md#combinaciones",
    uso: "import {combinaciones} from \"../components/formas/combinaciones.js\"\ncombinaciones(filas, {ancho, condiciones: CARENCIAS, tiene, valor: (d) => d.pct, orden, nombre, tope: TOPE, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Lex, Gehlenborg, Strobelt, Vuillemot y Pfister (2014), UpSet", url: "https://upset.app/" }],
},
// ================================================================ DIAGRAMAS
{
  id: "euler", nombre: "Diagrama de Euler de dos conjuntos", nivel: 2,
  familia: "diagrama", entrada: ["conteo", "partes"], funcion: ["parte-todo", "concepto"], forma: ["circulo"],
  pregunta: "¿Cuántas personas cumplen una condición, la otra o las dos?",
  si: "Dos definiciones que se traslapan y el traslape es la historia (habla una lengua indígena y se considera indígena).",
  no: "Tres o más conjuntos: las áreas ya no pueden ser proporcionales (combinaciones, UpSet).",
  datosForma: "{a: {nombre, n}, b: {nombre, n}, ambos}  personas; las áreas son proporcionales",
  datos: () => ({ a: { nombre: "Habla una lengua indígena", n: 7.36e6 }, b: { nombre: "Se considera indígena", n: 23.2e6 }, ambos: 6.1e6, universo: 119.0e6 }),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const { a, b, ambos } = datos
    const rB = Math.min(width * 0.27, 112), H = 2 * rB + 64, k = rB / Math.sqrt(b.n / Math.PI), rA = k * Math.sqrt(a.n / Math.PI)
    // Distancia entre centros tal que el área común sea proporcional a `ambos` (bisección).
    const lente = (d) => { if (d >= rA + rB) return 0; if (d <= rB - rA) return Math.PI * rA * rA
      const a1 = rA * rA * Math.acos((d * d + rA * rA - rB * rB) / (2 * d * rA)), a2 = rB * rB * Math.acos((d * d + rB * rB - rA * rA) / (2 * d * rB))
      return a1 + a2 - 0.5 * Math.sqrt((-d + rA + rB) * (d + rA - rB) * (d - rA + rB) * (d + rA + rB)) }
    let lo = rB - rA, hi = rA + rB
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; lente(m) > k * k * ambos ? (lo = m) : (hi = m) }
    const dist = (lo + hi) / 2, ancho = rA + dist + rB, cy = 56 + rB
    const cxA = Math.max(rA + 8, (width - ancho) / 2 + rA + 30), cxB = cxA + dist
    const zonas = [
      { zona: `Solo ${a.nombre.toLowerCase()}`, n: a.n - ambos, x: cxA - rA + (cxB - rB - (cxA - rA)) / 2, y: cy, tx: Math.max(8, cxA - rA - 4), ty: 22, fuera: true },
      { zona: "Las dos condiciones", n: ambos, x: (cxB - rB + cxA + rA) / 2, y: cy, tx: (cxB - rB + cxA + rA) / 2, ty: cy },
      { zona: `Solo ${b.nombre.toLowerCase()}`, n: b.n - ambos, x: (cxA + rA + cxB + rB) / 2, y: cy, tx: (cxA + rA + cxB + rB) / 2, ty: cy },
    ]
    const rotulo = (z) => `${z.zona}\n${poblacion(z.n)}`
    return Plot.plot({
      title: titulo("Población indígena según dos definiciones"),
      subtitle: subtitulo("2020 · personas de 3 años y más · área proporcional a las personas"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). El círculo menor son quienes hablan una lengua indígena y el mayor quienes se consideran indígenas; el traslape cumple ambas."),
      style: ESTILO, width, height: H + 10, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null }, r: { type: "identity" },
      marks: [
        Plot.dot([{ x: cxB, y: cy, r: rB }], { x: "x", y: "y", r: "r", fill: T.gris.fondo, fillOpacity: 0.55, stroke: T.gris.trazo }),
        Plot.dot([{ x: cxA, y: cy, r: rA }], { x: "x", y: "y", r: "r", fill: TONO, fillOpacity: 0.5, stroke: TONO, strokeWidth: 1.5 }),
        Plot.link(zonas.filter((z) => z.fuera), { x1: "x", y1: (z) => cy - rA * 0.5, x2: (z) => z.tx + 4, y2: (z) => z.ty + 26, stroke: T.tintaSuave }),
        Plot.text(zonas.filter((z) => z.fuera), { x: "tx", y: "ty", textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO,
          lineWidth: 16, text: rotulo }),
        Plot.text(zonas.filter((z) => !z.fuera), { x: "tx", y: "ty", textAnchor: "middle", fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO,
          lineWidth: 8, text: rotulo }),
        Plot.tip(zonas, Plot.pointer({ x: "x", y: "y", maxRadius: Infinity, ...GLOBO,
          title: (z) => `Personas de 3 años y más · 2020\n${z.zona}\n${poblacion(z.n)}\n${punto(z.n / datos.universo * 100, 1)} % de la población` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/euler.js", galeria: "src/galeria/conceptos.md#euler",
    uso: "import {euler} from \"../components/formas/euler.js\"\neuler({a: {nombre: \"Habla una lengua indígena\", n: d.hli}, b: {nombre: \"Se considera indígena\", n: d.auto}, ambos: d.ambos, universo: d.total}, {\n        ancho, colorA, colorB, apellido: \"del universo\",\n        globo: globo({\n          donde: () => f.texto, cuando: () => edad, grupo: (z) => z.zona, color: (z) => z.color,\n          valor: (z) => (100 * z.n) / z.universo, formato: \"pct\", frase: `de  …})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Euler Diagram", url: DVP("euler-diagram") }, { texto: "Data Viz Project, Venn Diagram", url: DVP("venn-diagram") }],
},
{
  id: "arbol-pregunta", nombre: "Árbol de la pregunta", nivel: 1,
  familia: "diagrama", entrada: ["conteo", "jerarquia"], funcion: ["concepto", "parte-todo"], forma: ["cuadrado", "linea"],
  pregunta: "¿Quién cuenta en el indicador, según las preguntas del cuestionario?",
  si: "Al presentar un indicador que se construye con dos o tres preguntas encadenadas (quién cuenta como migrante por violencia).",
  no: "Para comparar grupos: es una figura de definición, va una vez por capítulo.",
  datosForma: "[{id, texto, n, tipo, fila, lado}]  tipo: universo | pregunta | sale | cuenta",
  datos: () => [
    { id: "u", texto: "Niñas, niños y adolescentes de 5 a 17 años", n: 26.2e6, tipo: "universo", fila: 0, lado: 0 },
    { id: "q1", texto: "¿Vivía en otro municipio o entidad hace cinco años?", n: null, tipo: "pregunta", fila: 1, lado: 0 },
    { id: "no", texto: "No: sin movilidad", n: 25.0e6, tipo: "gris", fila: 1, lado: 1, flecha: "No" },
    { id: "q2", texto: "Sí: ¿por qué se cambió de residencia?", n: 1.2e6, tipo: "pregunta", fila: 2, lado: 0, flecha: "Sí" },
    { id: "otra", texto: "Familia, trabajo, estudio u otra causa", n: 1.08e6, tipo: "azul", fila: 2, lado: 1 },
    { id: "v", texto: "Inseguridad delictiva o violencia: cuenta como migración por violencia", n: 92e3, tipo: "rojo", fila: 3, lado: 0 },
    { id: "ne", texto: "No especificó la causa", n: 28e3, tipo: "gris", fila: 3, lado: 1 },
  ],
  receta: function (datos, width) {
    const angosto = width < 520, ALTO = angosto ? 92 : 72, CAJA = ALTO - 18
    const COL = [[0, 54], [62, 100]] // x en % del ancho: columna de preguntas y columna de salidas
    const tono = { universo: T.tinta, pregunta: T.gris.trazo, gris: T.gris.trazo, azul: T.cambio.favorable, rojo: T.cambio.desfavorable }
    const cajas = datos.map((d) => ({ ...d, x1: COL[d.lado][0], x2: COL[d.lado][1], y1: 10 + d.fila * ALTO, y2: 10 + d.fila * ALTO + CAJA }))
    const px = (w) => (w / 100) * (width - 4)
    const caja = new Map(cajas.map((c) => [c.id, c]))
    const flechas = [["u", "q1", "v"], ["q1", "q2", "v", "Sí"], ["q2", "v", "v"], ["q1", "no", "h", "No"], ["q2", "otra", "h"], ["q2", "ne", "d"]].map(([a, b, modo, rotulo]) => {
      const A = caja.get(a), B = caja.get(b)
      return modo === "v" ? { x1: 12, y1: A.y2, x2: 12, y2: B.y1, rotulo, rx: 13.5, ry: (A.y2 + B.y1) / 2 }
        : modo === "h" ? { x1: A.x2, y1: (A.y1 + A.y2) / 2, x2: B.x1, y2: (B.y1 + B.y2) / 2, rotulo, rx: (A.x2 + B.x1) / 2, ry: (A.y1 + A.y2) / 2 - 8 }
        : { x1: A.x2 - 4, y1: A.y2, x2: B.x1 + 6, y2: B.y1 + 6, rotulo } })
    const texto = (c) => `${c.texto}${c.n == null ? "" : `\n${poblacion(c.n)}`}`
    const preguntas = cajas.filter((c) => c.tipo === "pregunta"), resto = cajas.filter((c) => c.tipo !== "pregunta")
    const rotulos = (lado) => ({ x: (c) => c.x1 + 1.8, y: (c) => (c.y1 + c.y2) / 2, textAnchor: "start", fontSize: TIPO.etiqueta, fill: "currentColor", text: texto,
      lineWidth: (px(COL[lado][1] - COL[lado][0]) - 16) / TIPO.etiqueta * 1.05 })
    return Plot.plot({
      title: titulo("Quién cuenta como migrante por violencia"),
      subtitle: subtitulo("2020 · las dos preguntas del cuestionario ampliado, en orden"),
      caption: pie("INEGI, Censo 2020, cuestionario ampliado (datos de ejemplo). Cada caja es una respuesta con las personas que la dieron; solo la caja final entra al indicador."),
      style: ESTILO, width, height: 4 * ALTO + 16, margin: 0, marginLeft: 2, marginRight: 2,
      x: { domain: [0, 100], axis: null }, y: { type: "identity", axis: null },
      marks: [
        Plot.rect(preguntas, { x1: "x1", x2: "x2", y1: "y1", y2: "y2", rx: 6, fill: T.superficie, stroke: T.gris.trazo, strokeWidth: 1.2, strokeDasharray: "4 3" }),
        Plot.rect(resto, { x1: "x1", x2: "x2", y1: "y1", y2: "y2", rx: 6, fill: (c) => (c.tipo === "universo" ? T.superficie : tono[c.tipo]),
          fillOpacity: (c) => (c.tipo === "universo" ? 1 : 0.14), stroke: (c) => tono[c.tipo], strokeWidth: (c) => (c.tipo === "rojo" ? 2.2 : 1.2) }),
        Plot.arrow(flechas, { x1: "x1", y1: "y1", x2: "x2", y2: "y2", stroke: T.tintaSuave, strokeWidth: 1.4, headLength: 7, insetEnd: 2 }),
        Plot.text(flechas.filter((f) => f.rotulo), { x: "rx", y: "ry", text: "rotulo", dx: 4, textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 700, fill: "currentColor", ...HALO }),
        Plot.text(preguntas.filter((c) => c.lado === 0), { ...rotulos(0), fontWeight: 500 }),
        Plot.text(resto.filter((c) => c.lado === 0), { ...rotulos(0), fontWeight: 600 }),
        Plot.text(resto.filter((c) => c.lado === 1), { ...rotulos(1), fontWeight: 600 }),
        Plot.rect(cajas, Plot.pointer({ x1: "x1", x2: "x2", y1: "y1", y2: "y2", rx: 6, fill: "none", stroke: T.gris.tinta, strokeWidth: 2.2, maxRadius: Infinity })),
        Plot.tip(cajas, Plot.pointer({ x: (c) => (c.x1 + c.x2) / 2, y: (c) => (c.y1 + c.y2) / 2, maxRadius: Infinity, ...GLOBO,
          title: (c) => `5 a 17 años · 2020\n${c.texto}${c.n == null ? "\nPregunta del cuestionario" : `\n${poblacion(c.n)} personas\n${punto(c.n / datos[0].n * 100, 2)} % del universo`}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/arbol-pregunta.js", galeria: "src/galeria/conceptos.md#arbol-pregunta",
    uso: "import {arbolPregunta} from \"../components/formas/arbol-pregunta.js\"\narbolPregunta(cajas, {\n        ancho, universo: u.poblacion, color, globo: g,\n        enlaces: [[\"u\", \"q1\"], [\"q1\", \"sin\"], [\"q1\", \"q2\", \"Otro lugar\"], [\"q2\", \"otra\"], [\"q2\", \"v\"], [\"q2\", \"ne\"]],\n        rotulosLeyenda: [{tipo: \"cuadro\", color: SIG.color(\"baja\"), texto: \"Cuenta en el indicador: por violencia\"}, {tipo: \"cuadro\", color: SIG.color(\"sube\"), texto: \"Por otra causa\"}, {tipo: \"cuadro\", c …})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Flow Chart", url: DVP("flow-chart") }],
},
{
  id: "embudo", nombre: "Embudo de universos", nivel: 1,
  familia: "diagrama", entrada: ["conteo", "partes"], funcion: ["parte-todo", "concepto"], forma: ["barras", "area"],
  pregunta: "¿Cómo se achica el universo paso a paso hasta el grupo que mide el indicador?",
  si: "Dos a cuatro pasos anidados donde cada denominador es el paso anterior; explica por qué la cifra final es pequeña.",
  no: "Grupos que no están contenidos uno en otro (barras) o pasos que no se anidan.",
  datosForma: "[{paso, n}]  cada paso está contenido en el anterior",
  datos: () => [{ paso: "Niñas, niños y adolescentes de 5 a 17 años", n: 26.2e6 }, { paso: "Cambiaron de municipio o entidad", n: 1.2e6 },
    { paso: "Por inseguridad delictiva o violencia", n: 92e3 }],
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const BARRA = 22, ROTULO = width < 520 ? 40 : 22, LUPA = 40
    const filas = datos.map((d, i) => ({ ...d, i, parte: i < datos.length - 1 ? datos[i + 1].n / d.n * 100 : 100,
      y0: i * (ROTULO + BARRA + LUPA) + ROTULO + 6 }))
    const ultimo = filas.length - 1
    const lupas = filas.slice(0, -1).flatMap((f) => [{ i: f.i, y: f.y0 + BARRA, x1: 0, x2: f.parte }, { i: f.i, y: f.y0 + BARRA + LUPA, x1: 0, x2: 100 }])
    const relleno = (f) => (f.i === ultimo ? T.cambio.desfavorable : TONO)
    return Plot.plot({
      title: titulo("De la población de 5 a 17 años a la migración por violencia"),
      subtitle: subtitulo("2020 · cada barra es el 100 % del paso anterior"),
      caption: pie("INEGI, Censo 2020, cuestionario ampliado (datos de ejemplo). La parte llena de cada barra pasa al renglón siguiente, que la amplía a todo el ancho."),
      style: ESTILO, width, height: filas.length * (ROTULO + BARRA + LUPA) - LUPA + 18, margin: 0, marginLeft: 2, marginRight: 2,
      x: { domain: [0, 100], axis: null }, y: { type: "identity", axis: null },
      marks: [
        Plot.areaX(lupas, { x1: "x1", x2: "x2", y: "y", z: "i", fill: T.gris.fondo, fillOpacity: 0.35 }),
        Plot.rect(filas, { x1: 0, x2: 100, y1: "y0", y2: (f) => f.y0 + BARRA, fill: (f) => (f.i === ultimo ? relleno(f) : T.gris.fondo), fillOpacity: (f) => (f.i === ultimo ? 0.9 : 0.45) }),
        Plot.rect(filas.slice(0, -1), { x1: 0, x2: "parte", y1: "y0", y2: (f) => f.y0 + BARRA, fill: (f) => relleno(filas[f.i + 1]), fillOpacity: 0.9 }),
        Plot.text(filas, { x: 0, y: (f) => f.y0 - 6, textAnchor: "start", lineAnchor: "bottom", lineWidth: (width - 12) / TIPO.ejes, fontSize: TIPO.ejes, fontWeight: 600, fill: "currentColor",
          text: (f) => `${f.paso} · ${poblacion(f.n)}` }),
        Plot.text(filas.slice(0, -1), { x: "parte", y: (f) => f.y0 + BARRA / 2, dx: 6, textAnchor: "start", fontSize: TIPO.etiqueta, fontWeight: 700, fill: "currentColor", ...HALO,
          text: (f) => `${formatear(f.parte)} pasa al renglón de abajo` }),
        Plot.rect(filas, Plot.pointerY({ x1: 0, x2: 100, y1: "y0", y2: (f) => f.y0 + BARRA, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8, maxRadius: Infinity })),
        Plot.tip(filas, Plot.pointerY({ x: 50, y: (f) => f.y0 + BARRA / 2, maxRadius: Infinity, ...GLOBO,
          title: (f) => `Paso ${f.i + 1} de ${filas.length} · 2020\n${f.paso}\n${poblacion(f.n)} personas\n${f.i === 0 ? "Universo del indicador" : `${formatear(f.n / datos[f.i - 1].n * 100)} del paso anterior`}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/embudo.js", galeria: "src/galeria/conceptos.md#embudo",
    uso: "import {embudo} from \"../components/formas/embudo.js\"\nembudo(pasos, {ancho, color, globo: g,\n        rotulosLeyenda: [{tipo: \"cuadro\", color: P.serie, texto: \"Pasa al renglón de abajo\"}, {tipo: \"cuadro\", color: SIG.color(\"baja\"), texto: \"Llega al indicador: por violencia\"}, {tipo: \"cuadro\", color: P.apagado, texto: \"Sale del camino\"}]})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Funnel Chart", url: DVP("funnel-chart") }],
},
{
  id: "arbol-clasificacion", nombre: "Árbol de clasificación", nivel: 1,
  familia: "diagrama", entrada: ["jerarquia"], funcion: ["jerarquia", "concepto"], forma: ["linea", "puntos"],
  pregunta: "¿Cómo se organiza una clasificación oficial y cuánto pesa cada rama?",
  si: "Catálogos de dos o tres niveles con nombres que el lector reconoce (familias y agrupaciones lingüísticas de INALI).",
  no: "Comparar tamaños con precisión (treemap o barras) o más de unas 30 hojas.",
  datosForma: "[{ruta: \"Raíz/Familia/Agrupación\", n}]  también los nodos internos",
  datos: () => {
    const H = { "Otomangue": [["Mixteco", 527e3], ["Zapoteco", 490e3], ["Otomí", 298e3], ["Mazateco", 237e3]],
      "Yuto-nahua": [["Náhuatl", 1.65e6], ["Tarahumara", 91e3], ["Mayo", 38e3]],
      "Maya": [["Maya", 774e3], ["Tseltal", 590e3], ["Tsotsil", 550e3], ["Ch'ol", 254e3]] }
    const R = "Lenguas indígenas"
    const hojas = Object.entries(H).flatMap(([f, ls]) => ls.map(([l, n]) => ({ ruta: `${R}/${f}/${l}`, nombre: l, nivel: "Agrupación", n })))
    const familias = Object.entries(H).map(([f, ls]) => ({ ruta: `${R}/${f}`, nombre: f, nivel: "Familia", n: d3.sum(ls, (d) => d[1]) }))
    return [{ ruta: R, nombre: `${R} (tres familias)`, nivel: "Total", n: d3.sum(familias, (d) => d.n) }, ...familias, ...hojas]
  },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const angosto = width < 520
    const op = { path: "ruta", treeLayout: d3.cluster }
    return Plot.plot({
      title: titulo("Familias y agrupaciones lingüísticas"),
      subtitle: subtitulo("2020 · tamaño del punto: hablantes de la agrupación · tres de las once familias"),
      caption: pie("INALI, Catálogo de las Lenguas Indígenas Nacionales, e INEGI, Censo 2020 (datos de ejemplo). Cada rama une una agrupación con su familia."),
      style: ESTILO, width, height: datos.filter((d) => d.nivel === "Agrupación").length * 28 + 40,
      marginTop: 20, marginBottom: 20, marginLeft: angosto ? 16 : 40, marginRight: angosto ? 132 : 150,
      axis: null, r: { type: "sqrt", domain: [0, 2e6], range: [2, 11] },
      marks: [
        Plot.link(datos, Plot.treeLink({ ...op, stroke: T.gris.fondo, strokeWidth: 1.4 })),
        Plot.dot(datos, Plot.treeNode({ ...op, treeFilter: "node:internal", r: 4, fill: T.tintaSuave })),
        Plot.dot(datos, Plot.treeNode({ ...op, treeFilter: "node:external", r: "n", fill: TONO, stroke: T.superficie })),
        Plot.text(datos, Plot.treeNode({ ...op, treeFilter: "node:external", dx: 14, textAnchor: "start", fontSize: TIPO.etiqueta, fill: "currentColor",
          text: (d) => `${d.nombre} · ${poblacion(d.n)}` })),
        Plot.text(datos, Plot.treeNode({ ...op, treeFilter: "node:internal", dy: -14, textAnchor: "start", dx: -6, fontSize: TIPO.etiqueta, fontWeight: 700,
          fill: "currentColor", ...HALO, text: (d) => (d.nivel === "Total" && angosto ? "Lenguas" : d.nombre) })),
        Plot.dot(datos, Plot.pointerY(Plot.treeNode({ ...op, r: 12, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity }))),
        Plot.tip(datos, Plot.pointerY(Plot.treeNode({ ...op, maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nivel} · 2020\n${d.nombre}\n${poblacion(d.n)} hablantes` }))),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/arbol-clasificacion.js", galeria: "src/galeria/parte-todo.md#arbol-clasificacion",
    uso: "import {arbolClasificacion} from \"../components/formas/arbol-clasificacion.js\"\narbolClasificacion(filas, {ancho, rama: (d) => d.familia, hoja: (d) => d.agrupacion, valor: (d) => d.hablantes, raiz: \"Lenguas del ejemplo\", tope: TOPE,\r\n            ordenRamas: FAMILIAS, globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Dendrogram", url: DVP("dendrogram") }, { texto: "Observable Plot, tree mark", url: "https://observablehq.github.io/plot/marks/tree" }],
},
{
  id: "matriz-marcas", nombre: "Matriz de marcas", nivel: 1,
  familia: "tabla", entrada: ["cruce"], funcion: ["concepto", "comparacion"], forma: ["puntos", "circulo"],
  pregunta: "¿Qué tiene cada caso de una lista de rasgos (qué pregunta cada fuente, qué cubre cada programa)?",
  si: "Comparar definiciones entre tres a ocho casos antes de comparar sus cifras: el estado de cada cruce se dice con la forma (lleno, anillo, punto chico) y el color.",
  no: "Cuando el cruce es una cifra (heatmap o tabla de calor), ni con más de ocho casos (no caben las columnas en un teléfono).",
  datosForma: "[{columna, fila, estado}] + columnas [{id, cabeza, corto}], filas [{id, texto, corto}], estados {clave: {forma, color, leyenda}}",
  imagen: null, plantilla: { componente: "src/components/formas/matriz-marcas.js", galeria: "src/galeria/conceptos.md#matriz-marcas",
    uso: "import {matrizMarcas} from \"../components/formas/matriz-marcas.js\"\nmatrizMarcas(datos, {ancho, columna: (d) => d.f.id, fila: (d) => d.fila.id, estado: (d) => d.estado,\n  columnas: FUENTES, filas, estados: ESTADOS, ordenLeyenda: [\"cuenta\", \"aparte\", \"no\"], globo: g})" },
  estado: "plantilla",
  fuentes: [{ texto: "Libro «Las personas con discapacidad en México», introducción, sección 03 (Social Data Ibero, 2026)", url: null }],
},
// ==================================================================== MAPAS
{
  id: "mosaico-series", nombre: "Mosaico de mini-series", nivel: 2,
  familia: "mapa", entrada: ["geo-valor", "serie-tiempo"], funcion: ["tiempo", "geolocalizacion"], forma: ["linea", "cuadrado", "mapa"],
  pregunta: "¿Cómo evolucionó cada entidad, todas a la vez y acomodadas como el país?",
  si: "Las 32 entidades con cinco o más cortes; se busca el patrón regional (el sur sube más lento).",
  no: "Menos de cinco cortes por entidad (mosaico de triángulos) o importa el valor exacto de un año (tabla con minigráficas).",
  datosForma: "[{id, nombre, corto, col, fila, anio, valor, num}]",
  datos: () => { const ANIOS = [2016, 2018, 2020, 2022, 2024]
    return ENT.flatMap((e) => ANIOS.map((anio, i) => { const valor = e.internet - (4 - i) * (2.4 + (e.internet - 40) * 0.07)
      return { id: e.id, nombre: e.nombre, corto: e.corto, col: e.col, fila: e.fila, anio, valor, num: e.pob / 3.6 * valor / 100 } })) },
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const amplio = width >= 720 // con 12 columnas, cada casilla necesita unos 58 px para su serie
    const ultimos = datos.filter((d) => d.anio === 2024).sort((a, b) => b.valor - a.valor)
    // Ancho: rejilla del país. Angosto: cuatro columnas ordenadas por el valor de 2024.
    const pos = new Map(ultimos.map((d, i) => [d.id, amplio ? [d.col, d.fila] : [i % 4, Math.floor(i / 4)]]))
    const cols = amplio ? REJILLA_COLS : 4, renglones = amplio ? REJILLA_FILAS : Math.ceil(ultimos.length / 4)
    const filas = datos.map((d) => ({ ...d, fx: pos.get(d.id)[0], fy: pos.get(d.id)[1] }))
    const nacional = d3.rollups(datos, (v) => d3.mean(v, (d) => d.valor), (d) => d.anio)
    const ref = ultimos.flatMap((u) => nacional.map(([anio, valor]) => ({ anio, valor, fx: pos.get(u.id)[0], fy: pos.get(u.id)[1] })))
    const fin = filas.filter((d) => d.anio === 2024), celda = (width - 8) / cols
    return Plot.plot({
      title: titulo("Hogares con internet por entidad"),
      subtitle: subtitulo(`2016 - 2024 · cada casilla de 0 a 100 % · gris: promedio nacional${amplio ? "" : " · ordenadas de mayor a menor"}`),
      caption: pie("INEGI, ENIGH 2016 - 2024 (datos de ejemplo). Cada casilla es una entidad con su serie; la cifra es 2024. En pantalla ancha la rejilla imita el mapa del país."),
      style: ESTILO, width, height: Math.round(renglones * celda * 0.78) + 16,
      marginTop: 4, marginRight: 4, marginBottom: 4, marginLeft: 4,
      fx: { domain: d3.range(cols), axis: null, padding: 0.1 }, fy: { domain: d3.range(renglones), axis: null, padding: 0.16 },
      x: { domain: [2016, 2024], axis: null }, y: { domain: [0, 100], axis: null },
      marks: [
        Plot.areaY(filas, { fx: "fx", fy: "fy", x: "anio", y: "valor", z: "id", fill: TONO, fillOpacity: 0.12 }),
        Plot.line(ref, { fx: "fx", fy: "fy", x: "anio", y: "valor", stroke: T.gris.trazo, strokeWidth: 1, strokeDasharray: "2 2" }),
        Plot.line(filas, { fx: "fx", fy: "fy", x: "anio", y: "valor", z: "id", stroke: TONO, strokeWidth: 2 }),
        Plot.dot(fin, { fx: "fx", fy: "fy", x: "anio", y: "valor", r: 2.5, fill: TONO }),
        Plot.text(fin, { fx: "fx", fy: "fy", frameAnchor: "top-left", dy: -2, text: "corto", fontSize: 11, fontWeight: 700, fill: "currentColor" }),
        Plot.text(fin, { fx: "fx", fy: "fy", frameAnchor: "top-right", dy: -2, text: (d) => punto(d.valor), fontSize: 11, fill: T.tintaSuave }),
        Plot.ruleX(filas, Plot.pointerX({ fx: "fx", fy: "fy", x: "anio", stroke: T.gris.tinta, strokeWidth: 1, maxRadius: Infinity })),
        Plot.tip(filas, Plot.pointerX({ fx: "fx", fy: "fy", x: "anio", y: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · ${d.anio}\nHogares con internet\n${formatear(d.valor)}\nHogares: ${poblacion(d.num)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/mosaico-series.js", galeria: "src/galeria/tiempo.md#mosaico-series",
    uso: "import {mosaicoSeries} from \"../components/formas/mosaico-series.js\"\nmosaicoSeries(series, {ancho, tiempo: (d) => d.anio, valor: (d) => d.pct, cortes: ANIOS, dominio: DOMINIO_NIVEL, referencia, destacar: v.entidad,\r\n            textoSerie: \"La entidad\", textoReferencia: \"Todo el país\", globo: g})" }, estado: "plantilla",
  fuentes: [{ texto: "Ryan Hafen, geofacet", url: "https://hafen.github.io/geofacet/" },
            { texto: "Data Viz Project, Cartogram", url: DVP("cartogram") }],
},
{
  id: "mosaico-burbujas", nombre: "Mosaico de burbujas con dos medidas", nivel: 2,
  familia: "mapa", entrada: ["geo-valor", "conteo"], funcion: ["geolocalizacion", "comparacion"], forma: ["circulo", "mapa"],
  pregunta: "¿Dónde hay más personas en una condición y dónde pesa más esa condición sobre su población?",
  si: "Las 32 entidades con un conteo (tamaño) y su tasa (color); evita que el Estado de México domine por volumen y Chiapas solo por tasa.",
  no: "Una sola medida (mosaico de entidades o burbujas) o se necesita la forma real del territorio.",
  datosForma: "[{id, nombre, corto, col, fila, tasa, conteo}]",
  datos: () => ENT.map((e) => { const tasa = 100 - e.internet
    return { id: e.id, nombre: e.nombre, corto: e.corto, col: e.col, fila: e.fila, tasa, conteo: e.pob / 3.6 * tasa / 100 } }),
  receta: function (datos, width) {
    const TONO = T.serie ?? T.categorica[2]
    const RAMPA = [d3.interpolateLab(T.superficie, TONO)(0.16), TONO, d3.interpolateLab(TONO, T.tinta)(0.55)]
    const celda = (width - 8) / REJILLA_COLS, TOPE = 1.5e6 // dominio fijo del tamaño
    const clave = [{ col: 6, fila: 0.1, n: 1e6, t: "1 M" }, { col: 7, fila: 0.1, n: 5e5, t: "500 mil" }, { col: 8, fila: 0.1, n: 1e5, t: "100 mil" }]
    return Plot.plot({
      title: titulo("Hogares sin internet por entidad"),
      subtitle: subtitulo("2024 · tamaño: hogares sin internet · color: porcentaje de hogares sin internet"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Cada círculo es una entidad acomodada como el país; su área cuenta hogares y su color da la proporción."),
      style: ESTILO, width, height: Math.round(celda * 6) + 70,
      marginTop: 8, marginRight: 4, marginBottom: 10, marginLeft: 4,
      x: { type: "point", domain: d3.range(REJILLA_COLS), padding: 0.5, axis: null }, y: { type: "linear", domain: [-0.5, 5.5], axis: null, reverse: true },
      r: { type: "sqrt", domain: [0, TOPE], range: [0, celda * 0.44] },
      color: { type: "linear", domain: [0, 100], range: RAMPA, interpolate: "lab", legend: true, label: "Sin internet (%)", ticks: [0, 25, 50, 75, 100] },
      marks: [
        Plot.dot(clave, { x: "col", y: "fila", r: "n", fill: "none", stroke: T.gris.trazo }),
        Plot.text(clave, { x: "col", y: "fila", dy: celda * 0.5, text: "t", fontSize: 10.5, fill: T.tintaSuave }),
        Plot.text(["Tamaño: hogares"], { x: () => 7, y: () => -0.42, text: (t) => t, fontSize: 10.5, fontWeight: 600, fill: T.tintaSuave }),
        Plot.dot(datos, { x: "col", y: "fila", r: "conteo", fill: "tasa", stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(datos, { x: "col", y: "fila", dy: celda * 0.42, text: "corto", fontSize: celda < 50 ? 9.5 : 11, fontWeight: 600, fill: "currentColor", ...HALO }),
        Plot.dot(datos, Plot.pointer({ x: "col", y: "fila", r: "conteo", fill: "none", stroke: T.gris.tinta, strokeWidth: 2, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointer({ x: "col", y: "fila", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.nombre} · 2024\nHogares sin internet\n${formatear(d.tasa)}\nHogares: ${poblacion(d.conteo)}` })),
      ],
    })
  },
  imagen: null, plantilla: { componente: "src/components/formas/mosaico-burbujas.js", galeria: "src/galeria/mapas.md#mosaico-burbujas",
    uso: "import {mosaicoBurbujas} from \"../components/formas/mosaico-burbujas.js\"\nmosaicoBurbujas(new Map(filas.map((r) => [r.cve, r])), {\n            ancho, conteo: (d) => d.num, tasa: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), tope: TOPE_CONTEO,\n            destacar: region ? (k) => POR_CVE.get(k)?.region === region : null,\n            tituloLeyenda: \"Porcentaje\", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? \"80 o más\" : String(x)), globo: globo …})" }, estado: "plantilla",
  fuentes: [{ texto: "Data Viz Project, Bubble Map", url: DVP("bubble-map-chart") },
            { texto: "Arthur Welle en el Data Vis Dispatch del 27 de octubre de 2026 (formas-novedosas, D12)", url: DISPATCH.oct27 }],
},
  ])
})()
