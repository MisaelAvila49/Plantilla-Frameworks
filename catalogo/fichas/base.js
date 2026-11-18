// ======================================================================
// catalogo/fichas/base.js
// Las 43 fichas originales del catálogo, con vista previa viva en Plot o D3.
//
// CONTRATO DE UN ARCHIVO DE FICHAS
// ----------------------------------------------------------------------
// Cada archivo de esta carpeta es un script CLÁSICO (no un módulo), para que
// CatalogoGraficas.html se abra con doble clic por file://. El HTML los carga
// en este orden: base.js, plantilla.js y, si existe, rescatadas.js. Cada uno
// AÑADE sus fichas a la lista común y no toca las de los demás:
//
//   window.FICHAS = (window.FICHAS || []).concat([ {...}, {...} ])
//
// Un id repetido se descarta (gana el archivo que se cargó primero) y se
// avisa en la consola con console.warn, igual que un código desconocido.
//
// ESQUEMA DE UNA FICHA
//   id         texto único, sin espacios ("barras", "aluvial").
//   nombre     nombre visible de la forma.
//   nivel      0 Básico · 1 Intermedio · 2 Avanzado · 3 Experimental.
//   familia    UNO de: "grafica" | "diagrama" | "mapa" | "trazado" | "tabla".
//              Trazado es lo que Data Viz Project llama Plot: marcas sueltas
//              sobre ejes de magnitud (dispersión, enjambre, hexbin, caja).
//   entrada    lista de formas de los datos que la forma acepta:
//              "categoria-valor"  grupo, valor
//              "categoria-series" grupo, serie 1, serie 2
//              "partes"           partes que suman 100
//              "dos-medidas"      unidad, x, y
//              "cruce"            fila × columna → valor
//              "serie-tiempo"     fecha, valor
//              "dos-cortes"       unidad, antes, después
//              "tres-partes"      unidad, a, b, c que suman 100
//              "intervalos"       inicio, fin
//              "origen-destino"   origen, destino, valor
//              "jerarquia"        padre, hijo, valor
//              "geo-valor"        clave geográfica, valor
//              "geo-puntos"       lat, lon, valor
//              "conteo"           un total de personas por grupo
//              "distribucion"     valores sueltos por unidad
//   funcion    lista de: "comparacion" | "concepto" | "correlacion" |
//              "distribucion" | "geolocalizacion" | "parte-todo" | "tiempo" |
//              "flujo" | "jerarquia" | "unidades". La PRIMERA es la principal:
//              agrupa la ficha cuando no hay pestaña elegida.
//   forma      lista de íconos que la describen: "cuadrado" | "circulo" |
//              "area" | "triangulo" | "hexagono" | "linea" | "barras" |
//              "puntos" | "figura" | "mapa".
//   pregunta   la pregunta que responde, en una frase.
//   si, no     cuándo usarla y cuándo evitarla.
//   datosForma texto con la forma de los datos: "[{grupo, valor, num}]".
//   datos      () => [...] datos de ejemplo, o null si no hay receta viva.
//   receta     (datos, width) => nodo DOM (Plot.plot, un <div> o un <svg>), o
//              null. Su código fuente se muestra y se copia tal cual.
//   imagen     null | "miniaturas/<id>.png". Si no hay receta viva. En tema
//              oscuro se usa "miniaturas/<id>-oscuro.png" cuando existe.
//   plantilla  null | {componente: "src/components/formas/x.js",
//              galeria: "src/galeria/x.md#ancla" | null, uso: "llamada mínima"}.
//   fuentes    [{texto, url}] referencias de la forma (puede ir vacía).
//   estado     "plantilla" (hay componente en la Plantilla) | "receta" (solo
//              la receta de esta ficha) | "idea" (ni receta ni componente).
//
// GLOBALES QUE PUEDE USAR UNA RECETA
// Las define CatalogoGraficas.html antes de cargar las fichas, en su bloque
// base y en el bloque de datos de ejemplo. Son enlaces globales de script
// clásico: se nombran directo (T, no window.T). T, ESTILO y HALO cambian con
// el tema, así que se leen DENTRO de la receta, nunca al cargar el archivo.
//   Librerías  d3 (7.9.0), Plot (0.6.17), d3.sankey (d3-sankey 0.12.3),
//              topojson (topojson-client 3.1.0).
//   Tema       T (superficie, tinta, tintaSuave, rojo, rojoTexto, categorica, parSexo,
//              cambio, gris{fondo, trazo, papel, tinta, rejilla, regla},
//              divergente, secuencial, relleno, bivariada), ESTILO (style de
//              Plot), HALO (halo de texto), TIPO {ejes, valor, etiqueta},
//              GLOBO (opciones de Plot.tip), FUENTE.
//   Texto      titulo(t), subtitulo(t), pie(t), bloque(tag, css, texto).
//   Cifras     punto(v, dec), formatear(v, "pct" | "pesos" | "horas" | otro),
//              diferencia(v, dec), poblacion(n).
//   Color      colorCambio(delta, sentido) para marcas; colorCambioTexto(delta,
//              sentido) y T.rojoTexto para texto chico (4.5:1 en los dos temas);
//              gruposDeColor(presentes, orden), MAX_COLOR.
//   Datos      ENT (32 entidades: id, nombre, corto, pob, internet, indigena,
//              region, col, fila), ENT_ID (Map por id), ORDEN_REGIONES,
//              entidades (FeatureCollection de México), paises (del mundo),
//              MX_TOPO, MUNDO_TOPO, azar(semilla), normal(azar), r0, n0.
// ======================================================================

window.FICHAS = (window.FICHAS || []).concat([
// ---------------------------------------------------------------- comparar
{
  id: "barras", nombre: "Barras verticales", nivel: 0,
  familia: "grafica", entrada: ["categoria-valor"], funcion: ["comparacion"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/barras.js", galeria: "src/galeria/comparacion.md#barras",
    uso: "import {barras} from \"../components/formas/barras.js\"\nbarras(sel, {ancho: Math.min(ancho, 900), x: (d) => d.edad, valor: (d) => d.pct, orden: EDADES, dominioY: DOMINIO_PCT, rotuloY: \"Porcentaje\", incierta, globo: g})" },
  pregunta: "¿Cuánto vale cada grupo?",
  si: "Hasta 12 grupos con nombres cortos.", no: "Nombres largos o muchos grupos: barras horizontales.",
  datosForma: "[{grupo, valor, num}]",
  fuentes: [],
  datos: () => [["3 a 5", 64.8], ["6 a 11", 97.6], ["12 a 14", 93.1], ["15 a 17", 76.4], ["18 a 24", 33.9]]
    .map(([grupo, valor], i) => ({ grupo, valor, num: valor * 2.1e5 * (i + 2), fragil: i === 0 })),
  receta: function (datos, width) {
    const techo = Math.min(d3.max(datos, (d) => d.valor) * 1.12, 100)
    return Plot.plot({
      title: titulo("Asistencia escolar por grupo de edad"),
      subtitle: subtitulo("Mujeres · 2024 · Nacional"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada barra es el porcentaje del grupo que asiste a la escuela."),
      style: ESTILO, width: Math.max(width, 560), height: 300,
      marginTop: 28, marginRight: 12, marginBottom: 46, marginLeft: 58,
      x: { label: "Edad (años)", domain: datos.map((d) => d.grupo) }, // orden de los datos: Plot ordenaría el texto («12 a 14» antes que «3 a 5»)
      y: { domain: [0, techo], grid: true, label: "Porcentaje", labelAnchor: "top", labelArrow: "none" },
      marks: [
        Plot.ruleY([0], { stroke: T.gris.regla }),
        Plot.barY(datos, { x: "grupo", y: "valor", fill: T.serie, fillOpacity: 0.9, insetLeft: 6, insetRight: 6 }),
        Plot.text(datos, { x: "grupo", y: "valor", dy: -9, fontSize: TIPO.valor, fontWeight: 600, fill: "currentColor", ...HALO,
          text: (d) => formatear(d.valor) + (d.fragil ? " *" : "") }),
        Plot.barY(datos, Plot.pointerX({ x: "grupo", y: "valor", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8,
          insetLeft: 6, insetRight: 6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerX({ x: "grupo", y: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `Edad: ${d.grupo} años\n${formatear(d.valor)}\nPoblación: ${poblacion(d.num)}` })),
      ],
    })
  },
},
{
  id: "agrupadas", nombre: "Barras agrupadas en facetas", nivel: 1,
  familia: "grafica", entrada: ["categoria-series"], funcion: ["comparacion"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/agrupadas.js", galeria: "src/galeria/comparacion.md#agrupadas",
    uso: "import {agrupadas} from \"../components/formas/agrupadas.js\"\nagrupadas(sel, {ancho: Math.min(ancho, 980), faceta: (d) => d.escolaridad, serie: (d) => d.sexo, valor: (d) => d.pct, facetas: ESCOLARIDADES, series: [\"Mujeres\", \"Hombres\"],\n            color, dominio: DOMINIO_PCT, rotulo: \"Porcentaje\", incierta, globo: g})" },
  pregunta: "¿Cómo se comparan dos o tres series dentro de cada categoría?",
  si: "Dos o tres series (sexo, año) por categoría.", no: "Más de tres series: facetas separadas o heatmap.",
  datosForma: "[{escolaridad, sexo, valor}]",
  fuentes: [],
  datos: () => ["Primaria", "Secundaria", "Media superior", "Superior"].flatMap((escolaridad, i) =>
    [["Mujeres", 34 + i * 9.5], ["Hombres", 72 + i * 3]].map(([sexo, valor]) => ({ escolaridad, sexo, valor, num: valor * 1.3e5 }))),
  receta: function (datos, width) {
    const SEXOS = ["Mujeres", "Hombres"]
    return Plot.plot({
      title: titulo("Participación laboral por escolaridad"),
      subtitle: subtitulo("Población de 25 a 64 años · 2024"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada barra es el porcentaje que trabaja o busca trabajo."),
      style: ESTILO, width: Math.max(width, 560), height: 300,
      marginTop: 10, marginRight: 12, marginBottom: 46, marginLeft: 58,
      fx: { label: null, padding: 0.15, domain: ["Primaria", "Secundaria", "Media superior", "Superior"] },
      x: { axis: null, domain: SEXOS },
      y: { domain: [0, 100], grid: true, label: "%" },
      color: { domain: SEXOS, range: [T.parSexo.mujeres, T.parSexo.hombres], legend: true },
      marks: [
        Plot.ruleY([0], { stroke: T.gris.regla }),
        Plot.barY(datos, { fx: "escolaridad", x: "sexo", y: "valor", fill: "sexo", fillOpacity: 0.9, insetLeft: 3, insetRight: 3 }),
        Plot.text(datos, { fx: "escolaridad", x: "sexo", y: "valor", dy: -9, fontSize: TIPO.etiqueta, fontWeight: 600,
          fill: "currentColor", ...HALO, text: (d) => punto(d.valor, 1) }),
        Plot.barY(datos, Plot.pointerX({ fx: "escolaridad", x: "sexo", y: "valor", fill: "none", stroke: T.gris.tinta,
          strokeWidth: 1.8, insetLeft: 3, insetRight: 3, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerX({ fx: "escolaridad", x: "sexo", y: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.escolaridad}\n${d.sexo}\n${formatear(d.valor)}\nPoblación: ${poblacion(d.num)}` })),
      ],
    })
  },
},
{
  id: "dumbbell", nombre: "Dumbbell", nivel: 1,
  familia: "grafica", entrada: ["categoria-series", "dos-cortes"], funcion: ["comparacion"], forma: ["puntos", "linea"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/dumbbell.js", galeria: "src/galeria/comparacion.md#brecha",
    uso: "import {dumbbell} from \"../components/formas/index.js\"\ndumbbell(filas, {ancho, etiqueta: (d) => d.entidad, a: (d) => d.m.pct, b: (d) => d.h.pct,\n  nombreA: \"Mujeres\", nombreB: \"Hombres\", colorA: color(\"Mujeres\"), colorB: color(\"Hombres\"),\n  orden: (p, q) => Math.abs(q.brecha) - Math.abs(p.brecha), rotuloX: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cuánto separa a dos grupos en cada categoría?",
  si: "Dos grupos y muchas categorías; la brecha es la historia.", no: "Tres o más grupos: barras agrupadas o heatmap.",
  datosForma: "[{fila, serie, valor}]",
  fuentes: [],
  datos: () => ["OAX", "CHP", "GRO", "YUC", "HID", "PUE", "VER", "CMX"].flatMap((id, i) => {
    const e = ENT_ID.get(id)
    return [{ fila: e.nombre, serie: "Población indígena", valor: 22 + i * 4.1 },
            { fila: e.nombre, serie: "Resto de la población", valor: 41 + i * 3.2 }]
  }),
  receta: function (datos, width) {
    const SERIES = ["Población indígena", "Resto de la población"]
    const filas = [...new Set(datos.map((d) => d.fila))]
    const pares = d3.groups(datos, (d) => d.fila).map(([fila, v]) => ({ fila,
      a: v.find((d) => d.serie === SERIES[0]).valor, b: v.find((d) => d.serie === SERIES[1]).valor }))
    const orden = pares.sort((p, q) => (q.b - q.a) - (p.b - p.a)).map((p) => p.fila) // por brecha
    const alto = filas.length > 12 ? 19 : 34
    return Plot.plot({
      title: titulo("Hogares con internet, población indígena y resto"),
      subtitle: subtitulo("2024 · ordenado por brecha"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada punto es el porcentaje de hogares de un grupo; la línea une a los dos."),
      style: ESTILO, width: Math.max(width, 560), height: filas.length * alto + 96,
      marginTop: 44, marginRight: 44, marginBottom: 36, marginLeft: 150,
      x: { axis: "top", grid: true, domain: [0, 100], label: "% →" },
      y: { label: null, domain: orden },
      color: { domain: SERIES, range: T.categorica.slice(0, 2), legend: true },
      marks: [
        Plot.link(pares, { y: "fila", x1: "a", x2: "b", stroke: T.gris.fondo, strokeWidth: 3.2, strokeLinecap: "round" }),
        Plot.dot(datos, { y: "fila", x: "valor", fill: "serie", r: 5.5, stroke: T.superficie, strokeWidth: 0.8 }),
        Plot.text(datos, { y: "fila", x: "valor", dy: -11, fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO,
          text: (d) => punto(d.valor, 1) }),
        Plot.dot(datos, Plot.pointerY({ y: "fila", x: "valor", r: 8, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerY({ y: "fila", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.fila}\n${d.serie}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "waffle", nombre: "Waffle", nivel: 0,
  familia: "grafica", entrada: ["partes"], funcion: ["parte-todo", "unidades"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/waffle.js", galeria: "src/galeria/unidades.md#de-cada-cien",
    uso: "import {waffle} from \"../components/formas/index.js\"\nwaffle(filas, {ancho, etiqueta: (d) => d.region, valor: (d) => d.pct, color: () => P.serie, globo: g})" },
  pregunta: "¿Cuántos de cada 100?",
  si: "Una proporción que se lee mejor como personas que como porcentaje.", no: "Más de cuatro grupos o diferencias de décimas.",
  datosForma: "[{grupo, valor}]",
  fuentes: [],
  datos: () => [{ grupo: "Mujeres", valor: 26.8 }, { grupo: "Hombres", valor: 9.4 }],
  receta: function (datos, width) {
    return Plot.plot({
      title: titulo("Jóvenes que no estudian ni trabajan"),
      subtitle: subtitulo("15 a 24 años · 2024"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada cuadro es una de cada 100 personas jóvenes."),
      style: ESTILO, width: Math.max(width, 560), height: 280,
      marginTop: 30, marginBottom: 20, marginLeft: 20, marginRight: 20,
      fx: { label: null, padding: 0.15 },
      x: { axis: null }, y: { axis: null },
      marks: [
        Plot.waffleY(datos, { fx: "grupo", y: 100, multiple: 10, fill: T.gris.rejilla }),
        Plot.waffleY(datos, { fx: "grupo", y: (d) => Math.round(d.valor), multiple: 10, fill: T.serie }),
        Plot.text(datos, { fx: "grupo", frameAnchor: "top", dy: -22, fontSize: TIPO.valor, fontWeight: 600, fill: "currentColor",
          text: (d) => (d.valor < 1 ? "Menos de 1 de cada 100" : `${punto(Math.round(d.valor))} de cada 100`) }),
      ],
    })
  },
},
{
  id: "cifra", nombre: "Cifra con tendencia", nivel: 0,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["linea"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/cifra.js", galeria: "src/galeria/comparacion.md#cifra",
    uso: "import {cifra} from \"../components/formas/cifra.js\"\ncifra(tarjetas, {ancho, x: (d) => d.anio, valor: (d) => d.pct, ee: (d) => d.ee, elegido: v.anio, dominioY: DOMINIO_USUARIOS, sig: SIG, globo: g})" },
  pregunta: "¿Cuál es el número y hacia dónde va?",
  si: "Un solo número es la respuesta y su trayectoria da contexto.", no: "Varios números que se comparan entre sí: barras.",
  datosForma: "[{anio, valor}]",
  fuentes: [],
  datos: () => d3.range(2005, 2025).map((anio, i) => ({ anio, valor: 3.6 + Math.sin(i / 3) * 0.6 + (i > 3 && i < 8 ? 1.4 : 0) - i * 0.03 })),
  receta: function (datos, width) {
    const ultimo = datos.at(-1), previo = datos.at(-2)
    const cambio = ultimo.valor - previo.valor
    const caja = document.createElement("div")
    caja.style.cssText = `font-family:${FUENTE};color:${T.tinta};background:${T.superficie};padding:6px 2px`
    caja.append(
      bloque("div", `font:600 12px/1.4 ${FUENTE};letter-spacing:.06em;text-transform:uppercase;color:${T.tintaSuave}`, "Tasa de desocupación · 2024"),
      bloque("div", `font:800 46px/1.1 ${FUENTE};color:${T.rojo};font-variant-numeric:tabular-nums;margin:4px 0`, formatear(ultimo.valor)),
      bloque("div", `font:600 13px/1.4 ${FUENTE};color:${colorCambioTexto(cambio, "bajo")}`, `${diferencia(cambio)} puntos respecto a ${previo.anio}`),
      Plot.plot({
        width: Math.min(width, 360), height: 64, margin: 6, axis: null, style: ESTILO,
        marks: [
          Plot.lineY(datos, { x: "anio", y: "valor", stroke: T.gris.trazo, strokeWidth: 1.5, curve: "monotone-x" }),
          Plot.dot(datos, Plot.selectLast({ x: "anio", y: "valor", fill: T.serie, r: 3.5 })),
        ],
      }),
      bloque("p", `margin:.4rem 0 0;font:12.5px/1.5 ${FUENTE};color:${T.tintaSuave}`, "INEGI, ENOE (datos de ejemplo). La línea va de 2005 a 2024.")
    )
    return caja
  },
},
// ---------------------------------------------------------------- ordenar
{
  id: "ranking", nombre: "Barras horizontales ordenadas", nivel: 0,
  familia: "grafica", entrada: ["categoria-valor"], funcion: ["comparacion"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/ranking.js", galeria: "src/galeria/comparacion.md#ranking",
    uso: "import {ranking} from \"../components/formas/ranking.js\"\nranking(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, destacar: destacada, dominioX: DOMINIO_PCT,\n            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, rotuloX: \"Porcentaje de hogares\",\n            corto: (n) => ENTIDADES.find((e) => e.nombre === n)?.corto ?? n, globo: g})" },
  pregunta: "¿Quién está arriba y quién abajo?",
  si: "Muchas categorías o nombres largos.", no: "Categorías con orden propio (edad, decil): barras verticales.",
  datosForma: "[{entidad, valor, num}]",
  fuentes: [],
  datos: () => ENT.slice().sort((a, b) => b.internet - a.internet).filter((_, i) => i % 3 === 0)
    .map((e) => ({ entidad: e.nombre, valor: e.internet, num: e.pob * 0.27 * e.internet / 100 })),
  receta: function (datos, width) {
    const ELEGIDA = "Ciudad de México"
    return Plot.plot({
      title: titulo("Hogares con internet"),
      subtitle: subtitulo("2024 · 11 entidades · resaltada: Ciudad de México"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Cada barra es el porcentaje de hogares de la entidad."),
      style: ESTILO, width: Math.max(width, 560), height: Math.max(320, datos.length * 18 + 96),
      marginTop: 34, marginRight: 56, marginBottom: 44, marginLeft: 150,
      x: { grid: true, label: "% →", domain: [0, 100] },
      y: { label: null, tickSize: 0 },
      marks: [
        Plot.barX(datos, { y: "entidad", x: "valor", sort: { y: "-x" }, insetTop: 2, insetBottom: 2,
          fill: (d) => (d.entidad === ELEGIDA ? T.serie : T.gris.fondo) }),
        Plot.text(datos, { y: "entidad", x: "valor", textAnchor: "start", dx: 8, fontSize: TIPO.valor, fill: "currentColor",
          text: (d) => formatear(d.valor) }),
        Plot.ruleX([0], { stroke: T.gris.regla }),
        Plot.barX(datos, Plot.pointerY({ y: "entidad", x: "valor", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.8,
          insetTop: 2, insetBottom: 2, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerY({ y: "entidad", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.entidad}\n${formatear(d.valor)}\nHogares: ${poblacion(d.num)}` })),
      ],
    })
  },
},
{
  id: "lollipop", nombre: "Lollipop", nivel: 0,
  familia: "grafica", entrada: ["categoria-valor"], funcion: ["comparacion"], forma: ["linea", "puntos"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/lollipop.js", galeria: "src/galeria/comparacion.md#cambio",
    uso: "import {lollipop} from \"../components/formas/index.js\"\nlollipop(filas, {ancho, etiqueta: (d) => d.entidad, valor: (d) => d.cambio, color: (d) => SIG.color(d.s),\n  formato: puntos, dominioX: [-LIMITE_CAMBIO, LIMITE_CAMBIO], rotuloX: \"Cambio, en puntos\", globo: g})" },
  pregunta: "¿Cómo se ordenan muchas categorías sin llenar la vista de tinta?",
  si: "Ranking de 20 o más filas.", no: "Pocas filas: barras, que se leen más rápido.",
  datosForma: "[{entidad, valor}]",
  fuentes: [],
  datos: () => ENT.map((e) => ({ entidad: e.nombre, valor: e.internet })),
  receta: function (datos, width) {
    const ELEGIDA = "Oaxaca"
    return Plot.plot({
      title: titulo("Hogares con internet en las 32 entidades"),
      subtitle: subtitulo("2024 · resaltada: Oaxaca"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Cada punto es el porcentaje de hogares de una entidad."),
      style: ESTILO, width: Math.max(width, 560), height: Math.max(320, datos.length * 18 + 96),
      marginTop: 34, marginRight: 56, marginBottom: 44, marginLeft: 150,
      x: { grid: true, label: "% →", domain: [0, 100] },
      y: { label: null, tickSize: 0 },
      marks: [
        Plot.ruleY(datos, { y: "entidad", x1: 0, x2: "valor", sort: { y: "-x2" }, stroke: T.gris.fondo, strokeWidth: 2 }),
        Plot.dot(datos, { y: "entidad", x: "valor", r: 5, stroke: T.superficie, strokeWidth: 1,
          fill: (d) => (d.entidad === ELEGIDA ? T.serie : T.gris.tinta) }),
        Plot.text(datos, { y: "entidad", x: "valor", textAnchor: "start", dx: 9, fontSize: TIPO.etiqueta, fill: "currentColor",
          text: (d) => punto(d.valor) }),
        Plot.dot(datos, Plot.pointerY({ y: "entidad", x: "valor", r: 8, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6, maxRadius: Infinity })),
        Plot.tip(datos, Plot.pointerY({ y: "entidad", x: "valor", maxRadius: Infinity, ...GLOBO,
          title: (d) => `${d.entidad}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "bump", nombre: "Bump chart", nivel: 2,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo", "comparacion"], forma: ["linea", "circulo"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/bump.js", galeria: "src/galeria/tiempo.md#bump",
    uso: "import {bump} from \"../components/formas/bump.js\"\nbump(filas, {ancho, tiempo: (d) => d.anio, unidad: (d) => d.entidad, valor: (d) => (porNum ? d.num : d.pct), destacada: (u) => u === v.entidad, color: () => P.serie,\r\n        corto: (u) => cortoDeEntidad.get(u) ?? u, textoResto: \"Las demás entidades de la región\", globo: g})" },
  pregunta: "¿Qué lugar ocupa cada quien año con año?",
  si: "El lugar es la historia y son hasta 15 entidades.", no: "Importa la distancia entre valores: líneas.",
  datosForma: "[{entidad, anio, lugar}]",
  fuentes: [],
  datos: () => {
    const nombres = ["Oaxaca", "Chiapas", "Guerrero", "Veracruz", "Puebla", "Hidalgo"], r = azar(11)
    const base = nombres.map((_, i) => 40 + i * 4)
    return [2016, 2018, 2020, 2022, 2024].flatMap((anio) => {
      const v = base.map((b) => b + r() * 12)
      const lugares = d3.rank(v, d3.descending)
      return nombres.map((entidad, i) => ({ entidad, anio, lugar: lugares[i] + 1 }))
    })
  },
  receta: function (datos, width) {
    const ELEGIDAS = ["Oaxaca", "Chiapas", "Guerrero"]
    const n = new Set(datos.map((d) => d.entidad)).size
    return Plot.plot({
      title: titulo("Lugar en rezago educativo entre seis entidades"),
      subtitle: subtitulo("2016 - 2024 · 1 = mayor rezago"),
      caption: pie("CONEVAL (datos de ejemplo). Cada círculo es el lugar de la entidad en esa edición."),
      style: ESTILO, width: Math.max(width, 560), height: n * 34 + 90,
      marginTop: 34, marginRight: 110, marginBottom: 20, marginLeft: 110,
      x: { type: "point", padding: 0.1, label: null, tickFormat: String, axis: "top" },
      y: { axis: null, reverse: true },
      color: { domain: ELEGIDAS, range: T.categorica },
      marks: [
        // Un canal de color no mezcla nombres y colores literales: fondo y elegidas van en marcas separadas.
        Plot.lineY(datos.filter((d) => !ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", z: "entidad", curve: "bump-x",
          strokeWidth: 2.4, stroke: T.gris.fondo }),
        Plot.lineY(datos.filter((d) => ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", z: "entidad", curve: "bump-x",
          strokeWidth: 2.4, stroke: "entidad" }),
        Plot.dot(datos.filter((d) => !ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", r: 10, fill: T.gris.fondo,
          stroke: T.superficie, strokeWidth: 1 }),
        Plot.dot(datos.filter((d) => ELEGIDAS.includes(d.entidad)), { x: "anio", y: "lugar", r: 10, fill: "entidad",
          stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(datos, { x: "anio", y: "lugar", text: "lugar", fontSize: 10.5, fontWeight: 700,
          fill: (d) => (ELEGIDAS.includes(d.entidad) ? T.gris.papel : T.tinta) }),
        Plot.text(datos, Plot.selectFirst({ x: "anio", y: "lugar", z: "entidad", text: "entidad", textAnchor: "end", dx: -16,
          fontSize: TIPO.etiqueta, fill: "currentColor" })),
        Plot.text(datos, Plot.selectLast({ x: "anio", y: "lugar", z: "entidad", text: "entidad", textAnchor: "start", dx: 16,
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor" })),
        Plot.tip(datos, Plot.pointer({ x: "anio", y: "lugar", ...GLOBO, title: (d) => `${d.entidad}\n${d.anio}\nLugar ${d.lugar}` })),
      ],
    })
  },
},
// ---------------------------------------------------------------- distribucion
{
  id: "histograma", nombre: "Histograma", nivel: 1,
  familia: "grafica", entrada: ["distribucion"], funcion: ["distribucion"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/histograma.js", galeria: "src/galeria/distribucion.md#histograma",
    uso: "import {histograma} from \"../components/formas/histograma.js\"\nhistograma(tramos, {ancho, dominioX: [0, TOPE_INGRESO + TRAMO], dominioY: DOMINIO_Y, abierto: true, marcasX: ancho < 560 ? [0, 20000, 40000] : [0, 10000, 20000, 30000, 40000],\n              formatoX: (x) => (x === 0 ? \"$0\" : `${numero(x / 1000, 0)} mil`), rotuloX: \"Ingreso al mes, en pesos de 2024\", rotuloY: \"Porcentaje de las personas ocupadas\",\n              referencias: [{valor: mediana}], globo: g})" },
  pregunta: "¿Cómo se reparten los valores de una medida?",
  si: "Una medida continua: ingreso, edad, horas.", no: "Comparar más de dos grupos: caja o crestas.",
  datosForma: "[{ingreso, factor}]  factor = factor de expansión",
  fuentes: [],
  datos: () => { const r = azar(3), n = normal(r)
    return d3.range(3000).map(() => ({ ingreso: Math.exp(9.35 + 0.62 * n()), factor: 800 + r() * 400 })).filter((d) => d.ingreso < 60000) },
  receta: function (datos, width) {
    const mediana = d3.median(datos, (d) => d.ingreso)
    return Plot.plot({
      title: titulo("Ingreso mensual de las personas que trabajan"),
      subtitle: subtitulo(`2024 · línea punteada: mediana, ${formatear(mediana, "pesos")}`),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada barra suma a las personas en un tramo de $2,000."),
      style: ESTILO, width: Math.max(width, 560), height: 300,
      marginTop: 10, marginRight: 12, marginBottom: 46, marginLeft: 58,
      x: { label: "Ingreso mensual →", tickFormat: (d) => `$${punto(d / 1000)} mil` },
      y: { grid: true, label: "↑ Personas", tickFormat: poblacion },
      marks: [
        Plot.rectY(datos, Plot.binX({ y: "sum" }, { x: "ingreso", y: "factor", interval: 2000,
          fill: T.serie, fillOpacity: 0.9, inset: 0.5, tip: { ...GLOBO } })),
        Plot.ruleY([0], { stroke: T.gris.regla }),
        Plot.ruleX([mediana], { stroke: T.gris.tinta, strokeDasharray: "5 3", strokeWidth: 1.2 }),
      ],
    })
  },
},
{
  id: "caja", nombre: "Caja (box plot)", nivel: 1,
  familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion", "comparacion"], forma: ["cuadrado", "linea"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/caja.js", galeria: "src/galeria/distribucion.md#caja",
    uso: "import {caja} from \"../components/formas/caja.js\"\ncaja(resumen, {ancho, orden: SECTORES, dominio: DOMINIO_HORAS, formato: (x) => `${numero(x, 0)} h`, formatoEje: (x) => numero(x, 0), rotuloX: \"Horas a la semana\", globo: g})" },
  pregunta: "¿Cómo se comparan las distribuciones de varios grupos?",
  si: "Varios grupos con cientos de casos cada uno.", no: "Pocos casos por grupo: puntos individuales.",
  datosForma: "[{grupo, valor}]",
  fuentes: [],
  datos: () => { const n = normal(azar(5))
    return [["Agropecuario", 38, 12], ["Industria", 47, 8], ["Comercio", 44, 11], ["Servicios", 41, 13]]
      .flatMap(([grupo, m, s]) => d3.range(300).map(() => ({ grupo, valor: Math.max(2, Math.min(90, m + s * n())) }))) },
  receta: function (datos, width) {
    const medianas = d3.rollups(datos, (v) => d3.median(v, (d) => d.valor), (d) => d.grupo).map(([grupo, mediana]) => ({ grupo, mediana }))
    return Plot.plot({
      title: titulo("Horas trabajadas a la semana por sector"),
      subtitle: subtitulo("2024 · la caja es la mitad central de las personas"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). La línea roja es la mediana; los puntos, casos muy alejados."),
      style: ESTILO, width: Math.max(width, 560), height: medianas.length * 44 + 90,
      marginTop: 34, marginRight: 40, marginBottom: 46, marginLeft: 150,
      x: { grid: true, label: "Horas →" },
      y: { label: null },
      marks: [
        Plot.boxX(datos, { x: "valor", y: "grupo", fill: T.gris.rejilla, stroke: T.gris.tinta, r: 2 }),
        Plot.tickX(medianas, { x: "mediana", y: "grupo", stroke: T.serie, strokeWidth: 3 }),
        Plot.text(medianas, { x: "mediana", y: "grupo", dy: -16, fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO,
          text: (d) => `mediana ${punto(d.mediana)} h` }),
      ],
    })
  },
},
{
  id: "enjambre", nombre: "Enjambre (beeswarm)", nivel: 1,
  familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion"], forma: ["puntos"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/enjambre-puntos.js", galeria: "src/galeria/distribucion.md#enjambre-puntos",
    uso: "import {enjambrePuntos} from \"../components/formas/enjambre-puntos.js\"\nenjambrePuntos(filas, {ancho, valor: (d) => d.escolaridad, id: (d) => d.cveMun, dominio: DOMINIO_ESCOLARIDAD, destacado: (d) => d.region === v.region,\n              referencia: {valor: nacional, texto: `Promedio nacional: ${anios(nacional)}`}, formatoEje: (x) => numero(x, 0), rotuloX: \"Años de escuela, en promedio\", globo: g})" },
  pregunta: "¿Dónde cae cada unidad y cómo se agrupan?",
  si: "Cientos de unidades (municipios, escuelas) sobre una medida.", no: "Miles de unidades: histograma o hexbin.",
  datosForma: "[{municipio, region, valor}]",
  fuentes: [{ texto: "Mike Bostock, D3", url: "https://observablehq.com/@d3/beeswarm-mirrored/2" }],
  datos: () => { const r = azar(9), n = normal(r)
    const media = { Sur: 7.4, Centro: 9.1, Norte: 9.6, Occidente: 8.6 }
    return d3.range(260).map((i) => { const region = ORDEN_REGIONES[Math.floor(r() * 4)]
      return { municipio: `Municipio ${i + 1}`, region, valor: Math.max(4, media[region] + 1.1 * n()) } }) },
  receta: function (datos, width) {
    const col = gruposDeColor(new Set(datos.map((d) => d.region)), ["Sur", "Centro", "Norte", "Occidente"])
    return Plot.plot({
      title: titulo("Escolaridad promedio por municipio"),
      subtitle: subtitulo("2020 · 260 municipios de ejemplo"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada punto es un municipio; la altura no significa nada."),
      style: ESTILO, width: Math.max(width, 560), height: 300,
      marginTop: 30, marginRight: 20, marginBottom: 46, marginLeft: 20,
      x: { grid: true, label: "Años de escolaridad →" },
      color: { domain: col.domain, range: col.range, legend: true },
      marks: [
        Plot.dot(datos, Plot.dodgeY({ anchor: "middle", x: "valor", r: 3.6, padding: 0.6, fill: (d) => col.clase(d.region),
          stroke: T.superficie, strokeWidth: 0.6, tip: { ...GLOBO },
          title: (d) => `${d.municipio}\n${d.region}\n${punto(d.valor, 1)} años` })),
      ],
    })
  },
},
{
  id: "piramide", nombre: "Pirámide de población", nivel: 1,
  familia: "grafica", entrada: ["categoria-series"], funcion: ["distribucion", "comparacion"], forma: ["barras"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/piramide.js", galeria: "src/galeria/distribucion.md#piramide",
    uso: "import {piramide} from \"../components/formas/index.js\"\npiramide(filas, {ancho, edad: (d) => d.edad, lado: (d) => d.sexo, valor: (d) => d.parte,\n  izquierda: \"Hombres\", derecha: \"Mujeres\", edades: EDADES, tope: TOPE, rotuloX: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cómo se compone la población por edad y sexo?",
  si: "Estructura por edad de un lugar o un año.", no: "Comparar muchos lugares: facetas o índice de envejecimiento.",
  datosForma: "[{edad, sexo, pct}]  pct sobre el total",
  fuentes: [],
  datos: () => { const edades = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"]
    return edades.flatMap((edad, i) => { const b = Math.max(0.4, 4.4 - Math.max(0, i - 3) * 0.28 - (i < 3 ? (3 - i) * 0.12 : 0))
      return [{ edad, sexo: "Mujeres", pct: b + 0.05 * i }, { edad, sexo: "Hombres", pct: b - 0.03 * i }] }) },
  receta: function (datos, width) {
    const EDADES = [...new Set(datos.map((d) => d.edad))]
    const lado = (d) => (d.sexo === "Hombres" ? -d.pct : d.pct)
    return Plot.plot({
      title: titulo("Población por edad y sexo"),
      subtitle: subtitulo("Nacional · 2020 · porcentaje del total"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada barra es el porcentaje de la población total en ese grupo."),
      style: ESTILO, width: Math.max(width, 560), height: EDADES.length * 22 + 90,
      marginTop: 34, marginRight: 60, marginBottom: 46, marginLeft: 60,
      x: { label: "← Hombres · Mujeres →", labelAnchor: "center", tickFormat: (d) => `${Math.abs(d)} %`, grid: true,
        domain: [-d3.max(datos, (d) => d.pct) * 1.2, d3.max(datos, (d) => d.pct) * 1.2] },
      y: { label: null, domain: [...EDADES].reverse() },
      color: { domain: ["Mujeres", "Hombres"], range: [T.parSexo.mujeres, T.parSexo.hombres], legend: true },
      marks: [
        Plot.barX(datos, { y: "edad", x: lado, fill: "sexo", insetTop: 1.5, insetBottom: 1.5 }),
        // textAnchor y dx son constantes en Plot: una marca de texto por lado.
        Plot.text(datos.filter((d) => d.sexo === "Hombres"), { y: "edad", x: lado, text: (d) => punto(d.pct, 1),
          textAnchor: "end", dx: -6, fontSize: TIPO.etiqueta, fill: "currentColor" }),
        Plot.text(datos.filter((d) => d.sexo === "Mujeres"), { y: "edad", x: lado, text: (d) => punto(d.pct, 1),
          textAnchor: "start", dx: 6, fontSize: TIPO.etiqueta, fill: "currentColor" }),
        Plot.ruleX([0], { stroke: T.gris.tinta, strokeWidth: 1.4 }),
        Plot.barX(datos, Plot.pointerY({ y: "edad", x: lado, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6,
          insetTop: 1.5, insetBottom: 1.5, maxRadius: Infinity })),
      ],
    })
  },
},
{
  id: "crestas", nombre: "Crestas (ridgeline)", nivel: 2,
  familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion"], forma: ["area"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/crestas.js", galeria: "src/galeria/distribucion.md#crestas",
    uso: "import {crestas} from \"../components/formas/index.js\"\ncrestas(filas, {ancho, grupo: (d) => d.anio, valor: (d) => d.pct, id: (d) => d.unidad,\n  orden: [2000, 2010, 2020], dominio: [0, 100], suavizado: 4, rotuloX: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cómo se desplaza una distribución entre años o grupos?",
  si: "Cinco a quince distribuciones de la misma medida.", no: "Hay que leer valores exactos: caja o tabla.",
  datosForma: "[{anio, valor}]",
  fuentes: [{ texto: "Claus Wilke; galería de D3", url: "https://observablehq.com/@d3/ridgeline-plot" }],
  datos: () => { const n = normal(azar(21))
    return [2016, 2018, 2020, 2022, 2024].flatMap((anio, i) => d3.range(900).map(() =>
      ({ anio, valor: Math.exp(9.1 + i * 0.07 + 0.55 * n()) }))).filter((d) => d.valor < 40000) },
  receta: function (datos, width) {
    const anios = [...new Set(datos.map((d) => d.anio))]
    const x = d3.scaleLinear().domain([0, 40000])
    const curvas = anios.flatMap((anio, i) => {
      const bins = d3.bin().domain(x.domain()).thresholds(x.ticks(40))(datos.filter((d) => d.anio === anio).map((d) => d.valor))
      const max = d3.max(bins, (b) => b.length)
      return bins.map((b) => ({ anio, base: anios.length - 1 - i, x: (b.x0 + b.x1) / 2, d: b.length / max }))
    })
    const ALTO = 1.5 // cada cresta sube hasta 1.5 filas y tapa un poco a la de arriba
    return Plot.plot({
      title: titulo("Ingreso mensual por edición"),
      subtitle: subtitulo("Pesos de 2024 · la forma importa más que la altura"),
      caption: pie("INEGI, ENIGH (datos de ejemplo). Cada cresta es la distribución del ingreso en un año."),
      style: ESTILO, width: Math.max(width, 560), height: anios.length * 50 + 90,
      marginTop: 20, marginRight: 20, marginBottom: 46, marginLeft: 60,
      x: { label: "Ingreso mensual →", tickFormat: (d) => `$${punto(d / 1000)} mil`, domain: x.domain() },
      y: { axis: null, domain: [0, anios.length - 1 + ALTO] },
      marks: [
        ...anios.map((anio) => {
          const c = curvas.filter((d) => d.anio === anio)
          return [
            Plot.areaY(c, { x: "x", y1: "base", y2: (d) => d.base + d.d * ALTO, fill: T.superficie, curve: "basis" }),
            Plot.areaY(c, { x: "x", y1: "base", y2: (d) => d.base + d.d * ALTO, fill: T.serie, fillOpacity: 0.28, curve: "basis" }),
            Plot.lineY(c, { x: "x", y: (d) => d.base + d.d * ALTO, stroke: T.serie, strokeWidth: 1.5, curve: "basis" }),
          ]
        }),
        Plot.text(anios.map((anio, i) => ({ anio, y: anios.length - 1 - i })), { y: "y", text: (d) => String(d.anio),
          frameAnchor: "left", textAnchor: "end", dx: -8, dy: -6, fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor" }),
      ],
    })
  },
},
{
  id: "lluvia", nombre: "Nube de lluvia (raincloud)", nivel: 3,
  familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion"], forma: ["area", "puntos"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/lluvia.js", galeria: "src/galeria/distribucion.md#lluvia",
    uso: "import {lluvia} from \"../components/formas/lluvia.js\"\nlluvia(filas, resumen, {ancho, grupo: (d) => d.edad, valor: (d) => d.horas, peso: (d) => d.factor, id: (d) => d.id, orden: EDADES_CUIDADO, dominio: DOMINIO_CUIDADOS, suavizado: 3,\n              formato: (x) => `${numero(x, 0)} h`, formatoEje: (x) => numero(x, 0), rotuloX: \"Horas a la semana\", globo: g})" },
  pregunta: "¿En qué se distinguen las distribuciones, más allá de la mediana?",
  si: "Pocos grupos y hay sospecha de dos jorobas o de casos extremos.", no: "Público sin tiempo de leer tres capas: caja o histograma.",
  datosForma: "[{grupo, valor}]",
  fuentes: [{ texto: "Allen, Poggiali, Whitaker y otros (2019)", url: "https://wellcomeopenresearch.org/articles/4-63" }],
  datos: () => { const r = azar(31), n = normal(r)
    return [["15 a 29", 12, 6], ["30 a 44", 24, 9], ["45 a 64", 18, 8]].flatMap(([grupo, m, s], k) =>
      d3.range(160).map(() => ({ grupo, valor: Math.max(0, k === 1 && r() < 0.35 ? 8 + 3 * n() : m + s * n()) }))) },
  receta: function (datos, width) {
    const grupos = [...new Set(datos.map((d) => d.grupo))]
    const x = d3.scaleLinear().domain([0, d3.max(datos, (d) => d.valor)]).nice()
    const nube = grupos.flatMap((g, i) => {
      const bins = d3.bin().domain(x.domain()).thresholds(x.ticks(30))(datos.filter((d) => d.grupo === g).map((d) => d.valor))
      const max = d3.max(bins, (b) => b.length)
      return bins.map((b) => ({ i, x: (b.x0 + b.x1) / 2, d: b.length / max }))
    })
    const caja = grupos.map((g, i) => { const v = datos.filter((d) => d.grupo === g).map((d) => d.valor).sort(d3.ascending)
      return { i, q1: d3.quantile(v, 0.25), med: d3.quantile(v, 0.5), q3: d3.quantile(v, 0.75) } })
    const j = azar(4)
    const gotas = datos.map((d) => ({ ...d, i: grupos.indexOf(d.grupo), y: grupos.indexOf(d.grupo) - 0.14 - j() * 0.26 }))
    return Plot.plot({
      title: titulo("Horas de trabajo de cuidados a la semana"),
      subtitle: subtitulo("Mujeres · por grupo de edad · 2024"),
      caption: pie("INEGI, ENUT (datos de ejemplo). La nube es la forma, la barra la mitad central y cada punto una persona."),
      style: ESTILO, width: Math.max(width, 560), height: grupos.length * 90 + 70,
      marginTop: 20, marginRight: 20, marginBottom: 46, marginLeft: 80,
      x: { grid: true, label: "Horas a la semana →", domain: x.domain() },
      y: { domain: [-0.5, grupos.length - 0.3], ticks: grupos.map((_, i) => i), tickFormat: (i) => grupos[i], label: null, tickSize: 0 },
      marks: [
        ...grupos.map((_, i) => Plot.areaY(nube.filter((d) => d.i === i), { x: "x", y1: (d) => d.i, y2: (d) => d.i + d.d * 0.55,
          fill: T.serie, fillOpacity: 0.35, stroke: T.serie, strokeWidth: 1, curve: "basis" })),
        Plot.dot(gotas, { x: "valor", y: "y", r: 1.8, fill: T.gris.trazo, fillOpacity: 0.8 }),
        Plot.ruleY(caja, { y: (d) => d.i - 0.06, x1: "q1", x2: "q3", stroke: T.gris.tinta, strokeWidth: 5 }),
        Plot.dot(caja, { y: (d) => d.i - 0.06, x: "med", r: 4, fill: T.superficie, stroke: T.gris.tinta, strokeWidth: 1.6 }),
        Plot.text(caja, { y: (d) => d.i - 0.06, x: "q3", text: (d) => `mediana ${punto(d.med)} h`, textAnchor: "start", dx: 8,
          fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO }),
      ],
    })
  },
},
{
  id: "cuantiles", nombre: "Puntos de cuantiles", nivel: 3,
  familia: "trazado", entrada: ["categoria-valor", "intervalos"], funcion: ["distribucion"], forma: ["puntos"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/cuantiles.js", galeria: "src/galeria/precision.md#cuantiles",
    uso: "import {cuantiles} from \"../components/formas/cuantiles.js\"\ncuantiles(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, ee: (d) => d.ee, referencia: {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`}, sig: SIG, dominioX: DOMINIO_CUANTILES, globo: g})" },
  pregunta: "¿Qué tan segura es esta cifra de encuesta?",
  si: "Publicar una estimación con su margen de error a un público general.", no: "La muestra es grande y el intervalo es angosto: basta la cifra.",
  datosForma: "[{lugar, estimacion, error}]  error = error estándar de diseño",
  fuentes: [{ texto: "Kay, Kola, Hullman y Munson (2016)", url: "https://idl.cs.washington.edu/files/2018-UncertaintyBus-CHI.pdf" }],
  datos: () => [{ lugar: "Oaxaca", estimacion: 28.4, error: 4.6 }, { lugar: "Nuevo León", estimacion: 36.1, error: 3.1 }],
  receta: function (datos, width) {
    const N = 20, REFERENCIA = 33.5
    // Inversa de la normal estándar (aproximación de Acklam, error menor a 1e-9).
    const probit = (p) => {
      const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924]
      const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857]
      const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878]
      const e = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742]
      if (p > 0.02425 && p < 0.97575) {
        const u = p - 0.5, r = u * u
        return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * u) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
      }
      const q = Math.sqrt(-2 * Math.log(Math.min(p, 1 - p)))
      const x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((e[0] * q + e[1]) * q + e[2]) * q + e[3]) * q + 1)
      return p < 0.5 ? x : -x
    }
    // 20 cuantiles de la distribución de muestreo: cada punto es un resultado igual de probable.
    const puntos = datos.flatMap((d) => d3.range(N).map((k) => ({ lugar: d.lugar, q: d.estimacion + d.error * probit((k + 0.5) / N) })))
    return Plot.plot({
      title: titulo("Participación laboral de mujeres con discapacidad"),
      subtitle: subtitulo(`2024 · línea punteada: promedio nacional, ${formatear(REFERENCIA)}`),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). Cada punto es uno de 20 resultados igual de probables según el error de la encuesta."),
      style: ESTILO, width: Math.max(width, 560), height: 300,
      marginTop: 20, marginRight: 20, marginBottom: 46, marginLeft: 20,
      fy: { axis: null, padding: 0.25 },
      x: { grid: true, label: "% →", domain: [10, 55] },
      marks: [
        Plot.ruleX([REFERENCIA], { stroke: T.gris.tinta, strokeDasharray: "5 3", strokeWidth: 1.2 }),
        Plot.dot(puntos, Plot.dodgeY({ anchor: "bottom", fy: "lugar", x: "q", r: 6, padding: 1,
          fill: (d) => (d.q < REFERENCIA ? T.cambio.desfavorable : T.gris.trazo) })),
        Plot.text(datos, { fy: "lugar", frameAnchor: "top-left", dy: 2, fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor",
          text: (d) => `${d.lugar}: ${formatear(d.estimacion)}` }),
      ],
    })
  },
},
// ---------------------------------------------------------------- tiempo
{
  id: "lineas", nombre: "Líneas con etiqueta al final", nivel: 0,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["linea"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/lineas.js", galeria: "src/galeria/tiempo.md#lineas",
    uso: "import {lineas} from \"../components/formas/index.js\"\nlineas(filas, {ancho, x: (d) => d.anio, y: (d) => d.pct, serie: (d) => d.grupo,\n  color: (s) => color(s), dominioY: [0, 100], rotuloY: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cómo evoluciona una serie larga?",
  si: "Una a tres series con muchos puntos en el tiempo.", no: "Dos o tres años: pendiente o barras.",
  datosForma: "[{anio, serie, valor}]",
  fuentes: [],
  datos: () => d3.range(2005, 2025).flatMap((anio, i) => [["Mujeres", 3.9], ["Hombres", 3.4]].map(([serie, b], k) =>
    ({ anio, serie, valor: b + Math.sin(i / 3 + k) * 0.35 + (i > 3 && i < 7 ? 1.3 : 0) - i * 0.03 + (i === 15 ? 0.9 : 0) }))),
  receta: function (datos, width) {
    const SERIES = ["Mujeres", "Hombres"]
    return Plot.plot({
      title: titulo("Tasa de desocupación"),
      subtitle: subtitulo("2005 - 2024 · promedio anual"),
      caption: pie("INEGI, ENOE (datos de ejemplo). Cada línea es el porcentaje de la población activa sin trabajo."),
      style: ESTILO, width: Math.max(width, 560), height: 320,
      marginTop: 24, marginRight: 128, marginBottom: 46, marginLeft: 58,
      x: { label: null, tickFormat: String },
      y: { grid: true, label: "↑ %", domain: [0, 7] },
      color: { domain: SERIES, range: [T.parSexo.mujeres, T.parSexo.hombres] },
      marks: [
        Plot.ruleY([0], { stroke: T.gris.regla }),
        Plot.lineY(datos, { x: "anio", y: "valor", stroke: "serie", strokeWidth: 2.6, curve: "monotone-x" }),
        Plot.text(datos, Plot.selectLast({ x: "anio", y: "valor", z: "serie", textAnchor: "start", dx: 10, fontSize: TIPO.etiqueta,
          fontWeight: 600, fill: "serie", ...HALO, text: (d) => `${d.serie}: ${formatear(d.valor)}` })),
        Plot.ruleX(datos, Plot.pointerX({ x: "anio", stroke: T.gris.trazo, strokeDasharray: "3 3" })),
        Plot.tip(datos, Plot.pointerX({ x: "anio", y: "valor", z: "serie", ...GLOBO,
          title: (d) => `${d.anio}\n${d.serie}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "pendiente", nombre: "Pendiente", nivel: 1,
  familia: "grafica", entrada: ["dos-cortes"], funcion: ["tiempo", "comparacion"], forma: ["linea"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/pendiente.js", galeria: "src/galeria/tiempo.md#pendiente",
    uso: "import {pendiente} from \"../components/formas/index.js\"\npendiente(filas, {ancho, edicion: (d) => d.anio, valor: (d) => d.pct, unidad: (d) => d.entidad,\n  color: (unidad, filas) => color(unidad), formato: pct, globo: g})" },
  pregunta: "¿Cómo cambió entre dos o tres años?",
  si: "Dos o tres ediciones y pocas series.", no: "Series largas: líneas.",
  datosForma: "[{anio, serie, valor}]",
  fuentes: [],
  datos: () => [2020, 2022, 2024].flatMap((anio, i) => [["Mujeres", 44.2, 1.9], ["Hombres", 76.5, -0.6]].map(([serie, b, s]) =>
    ({ anio, serie, valor: b + s * i }))),
  receta: function (datos, width) {
    const SERIES = ["Mujeres", "Hombres"]
    return Plot.plot({
      title: titulo("Participación laboral"),
      subtitle: subtitulo("Población de 15 años y más · 2020 - 2024"),
      caption: pie("INEGI, ENOE (datos de ejemplo). Cada punto es el porcentaje en una edición; la línea une las ediciones."),
      style: ESTILO, width: Math.max(width, 560), height: 420,
      marginTop: 24, marginRight: 150, marginBottom: 46, marginLeft: 60,
      x: { type: "point", padding: 0.25, label: "Edición", tickFormat: String },
      y: { grid: true, domain: [0, 100], label: "↑ %" },
      color: { domain: SERIES, range: [T.parSexo.mujeres, T.parSexo.hombres], legend: true },
      marks: [
        Plot.lineY(datos, { x: "anio", y: "valor", z: "serie", stroke: "serie", strokeWidth: 2.6 }),
        Plot.dot(datos, { x: "anio", y: "valor", fill: "serie", r: 5, stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(datos, Plot.selectFirst({ x: "anio", y: "valor", z: "serie", textAnchor: "end", dx: -10, fontSize: TIPO.etiqueta,
          fill: "currentColor", ...HALO, text: (d) => formatear(d.valor) })),
        Plot.text(datos, Plot.selectLast({ x: "anio", y: "valor", z: "serie", textAnchor: "start", dx: 10, fontSize: TIPO.etiqueta,
          fontWeight: 600, fill: "serie", ...HALO, text: (d) => `${d.serie}: ${formatear(d.valor)}` })),
        Plot.tip(datos, Plot.pointer({ x: "anio", y: "valor", ...GLOBO, title: (d) => `${d.anio}\n${d.serie}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "contexto", nombre: "Líneas con contexto", nivel: 1,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["linea"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/contexto.js", galeria: "src/galeria/tiempo.md#contexto",
    uso: "import {contexto} from \"../components/formas/contexto.js\"\ncontexto(total, {ancho, tiempo: (d) => d.anio, valor: (d) => d.pct, serie: (d) => d.entidad, elegidas, color, dominio: DOMINIO_NIVEL, formato: pctEje,\r\n            rotuloValor: \"Porcentaje que cumple la condición\", corto: (s) => cortoDeEntidad.get(s) ?? s, textoResto: \"Las demás entidades\", globo: g})" },
  pregunta: "¿Cómo le fue a unos pocos frente a todos los demás?",
  si: "Muchas entidades y el lector elige hasta tres.", no: "Todas importan por igual: heatmap.",
  datosForma: "[{entidad, anio, valor}]",
  fuentes: [],
  datos: () => { const r = azar(41)
    return ENT.flatMap((e) => d3.range(2016, 2025, 2).map((anio, i) => ({ entidad: e.nombre, anio, valor: e.internet - 22 + i * (4 + r() * 3) }))) },
  receta: function (datos, width) {
    const ELEGIDAS = ["Oaxaca", "Nuevo León", "Ciudad de México"]
    const fondo = datos.filter((d) => !ELEGIDAS.includes(d.entidad))
    const frente = datos.filter((d) => ELEGIDAS.includes(d.entidad))
    return Plot.plot({
      title: titulo("Hogares con internet, 32 entidades"),
      subtitle: subtitulo("2016 - 2024 · en color: Oaxaca, Nuevo León y Ciudad de México"),
      caption: pie("INEGI, ENDUTIH (datos de ejemplo). Cada línea gris es una de las otras 29 entidades."),
      style: ESTILO, width: Math.max(width, 560), height: 420,
      marginTop: 24, marginRight: 150, marginBottom: 46, marginLeft: 58,
      x: { type: "point", label: null, tickFormat: String, padding: 0.1 },
      y: { grid: true, label: "↑ %", domain: [0, 100] },
      color: { domain: ELEGIDAS, range: T.categorica },
      marks: [
        Plot.lineY(fondo, { x: "anio", y: "valor", z: "entidad", stroke: T.gris.trazo, strokeWidth: 1, strokeOpacity: 0.35 }),
        Plot.lineY(frente, { x: "anio", y: "valor", z: "entidad", stroke: "entidad", strokeWidth: 2.8, curve: "monotone-x" }),
        Plot.text(frente, Plot.selectLast({ x: "anio", y: "valor", z: "entidad", textAnchor: "start", dx: 8, fontSize: TIPO.etiqueta,
          fontWeight: 700, fill: "entidad", ...HALO, text: (d) => `${d.entidad} (${punto(d.valor)})` })),
        Plot.tip(datos, Plot.pointer({ x: "anio", y: "valor", ...GLOBO, title: (d) => `${d.entidad}\n${d.anio}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "calendario", nombre: "Calendario", nivel: 2,
  familia: "tabla", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/calendario.js", galeria: "src/galeria/tiempo.md#calendario",
    uso: "import {calendario} from \"../components/formas/calendario.js\"\ncalendario(filas, {ancho, fecha: (d) => d.fecha, valor: (d) => d.tasa, escala, formato: porDia, tituloLeyenda: \"Nacimientos registrados por cada 100 mil habitantes\",\r\n            marcasLeyenda: [0, 2, 4, 6, 8], formatoLeyenda: (x) => (x === 8 ? \"8 o más\" : String(x)), globo: g})" },
  pregunta: "¿Cómo varía día con día?",
  si: "Series diarias donde importan el día de la semana y la estación.", no: "Datos mensuales o anuales: líneas.",
  datosForma: "[{fecha, valor}]  fecha en UTC",
  fuentes: [],
  datos: () => { const r = azar(51)
    return d3.utcDays(new Date(Date.UTC(2024, 0, 1)), new Date(Date.UTC(2025, 0, 1))).map((fecha) => {
      const dow = fecha.getUTCDay(), mes = fecha.getUTCMonth()
      return { fecha, valor: Math.round(18 + (dow === 0 || dow === 6 ? -9 : 0) + (mes === 11 ? -6 : 0) + Math.sin(mes / 2) * 5 + r() * 8) } }) },
  receta: function (datos, width) {
    const dia = d3.utcFormat("%u") // 1 lunes … 7 domingo
    return Plot.plot({
      title: titulo("Registros diarios de nacimientos en una oficina"),
      subtitle: subtitulo("2024 · cada columna es una semana"),
      caption: pie("Registro civil (datos de ejemplo). Cada cuadro es un día; el color, cuántos registros hubo."),
      style: ESTILO, width: Math.max(width, 560), height: 200,
      marginTop: 30, marginRight: 10, marginBottom: 10, marginLeft: 30,
      x: { axis: null, padding: 0 },
      y: { tickFormat: (d) => "LMMJVSD"[d - 1], padding: 0, label: null, tickSize: 0 },
      color: { type: "linear", domain: [0, 35], range: T.relleno, legend: true, label: "Registros" },
      marks: [
        Plot.cell(datos, { x: (d) => d3.utcMonday.count(d3.utcYear(d.fecha), d.fecha), y: (d) => +dia(d.fecha), fill: "valor", inset: 1,
          tip: { ...GLOBO }, title: (d) => `${d3.utcFormat("%d/%m/%Y")(d.fecha)}\n${punto(d.valor)} registros` }),
        Plot.text(d3.utcMonths(new Date(Date.UTC(2024, 0, 1)), new Date(Date.UTC(2025, 0, 1))), {
          x: (m) => d3.utcMonday.count(d3.utcYear(m), m), frameAnchor: "top", dy: -18, textAnchor: "start",
          text: (m) => ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][m.getUTCMonth()],
          fontSize: TIPO.etiqueta, fill: "currentColor" }),
      ],
    })
  },
},
{
  id: "horizonte", nombre: "Horizonte", nivel: 3,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["area"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/horizonte.js", galeria: "src/galeria/tiempo.md#horizonte",
    uso: "import {horizonte} from \"../components/formas/horizonte.js\"\nhorizonte(filas, {ancho, tiempo: (d) => d.t, serie: (d) => d.ambito, valor: (d) => d.pct, series: orden, paso: PASO, bandas: BANDAS,\r\n            marcasTiempo: MARCAS_ANIOS, corto: (s) => cortoDeEntidad.get(s) ?? s, globo: g})" },
  pregunta: "¿Cómo se comparan muchas series largas en poco espacio?",
  si: "Diez o más series diarias o semanales que se revisan con frecuencia.", no: "Público que la ve una sola vez: líneas pequeñas en facetas.",
  datosForma: "[{serie, fecha, valor}]",
  fuentes: [{ texto: "Heer, Kong y Agrawala; Mike Bostock", url: "https://observablehq.com/@d3/horizon-chart/2" }],
  datos: () => { const r = azar(61)
    return ["Chiapas", "Guerrero", "Oaxaca", "Puebla", "Veracruz", "Yucatán"].flatMap((serie, k) =>
      d3.utcWeeks(new Date(Date.UTC(2023, 0, 1)), new Date(Date.UTC(2024, 11, 31))).map((fecha, i) =>
        ({ serie, fecha, valor: Math.max(0, 30 + 25 * Math.sin((i + k * 7) / 9) + r() * 18 + (k === 2 && i > 60 && i < 75 ? 45 : 0)) }))) },
  receta: function (datos, width) {
    const BANDAS = 3
    const paso = d3.max(datos, (d) => d.valor) / BANDAS
    const tonos = [T.secuencial[2], T.secuencial[4], T.secuencial[6]]
    return Plot.plot({
      title: titulo("Consultas semanales por enfermedad respiratoria"),
      subtitle: subtitulo("2023 - 2024 · cada banda más oscura suma un tercio del máximo"),
      caption: pie("Secretaría de Salud (datos de ejemplo). Cada fila es una entidad; las bandas se doblan sobre sí mismas."),
      style: ESTILO, width: Math.max(width, 560), height: 6 * 44 + 60,
      marginTop: 10, marginRight: 10, marginBottom: 36, marginLeft: 80,
      x: { label: null },
      y: { domain: [0, paso], axis: null },
      fy: { label: null, padding: 0.08, axis: "left", tickSize: 0 },
      marks: d3.range(BANDAS).map((i) => Plot.areaY(datos, { x: "fecha", y: (d) => d.valor - i * paso, fy: "serie",
        fill: tonos[i], clip: true, curve: "monotone-x" })),
    })
  },
},
{
  id: "franjas", nombre: "Franjas", nivel: 3,
  familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/franjas-tiempo.js", galeria: "src/galeria/tiempo.md#franjas",
    uso: "import {franjasTiempo} from \"../components/formas/franjas-tiempo.js\"\nfranjasTiempo(filas, {ancho, tiempo: (d) => d.t, valor: (d) => d.pct, color, referencia: {valor: ref.pct, tiempo: ref.t}, dominio: DOMINIO_DESOCUPACION,\r\n            marcasTiempo: MARCAS_ANIOS, rotuloValor: \"Tasa (%)\", leyenda, globo: g})" },
  pregunta: "¿Cuál es la tendencia larga, de un vistazo?",
  si: "Una serie anual o trimestral larga contra su promedio; portada o cierre de una historia.", no: "Hay que leer valores: acompañarla de una línea.",
  datosForma: "[{periodo, valor}]",
  fuentes: [{ texto: "Ed Hawkins (2018)", url: "https://showyourstripes.info/" }],
  datos: () => { const r = azar(71)
    return d3.range(2005, 2025).flatMap((a, i) => [1, 2, 3, 4].map((t) => ({ periodo: `${a}-T${t}`, anio: a,
      valor: 4 + Math.sin(i / 3) * 0.5 + (i > 3 && i < 8 ? 1.3 : 0) + (i === 15 ? 1.1 : 0) - i * 0.04 + r() * 0.3 }))) },
  receta: function (datos, width) {
    const promedio = d3.mean(datos, (d) => d.valor)
    return Plot.plot({
      title: titulo("Desocupación respecto a su promedio"),
      subtitle: subtitulo(`2005 - 2024 · por trimestre · promedio ${formatear(promedio)}`),
      caption: pie("INEGI, ENOE (datos de ejemplo). Cada franja es un trimestre: roja arriba del promedio, azul abajo."),
      style: ESTILO, width: Math.max(width, 560), height: 170,
      marginTop: 10, marginRight: 10, marginBottom: 30, marginLeft: 10,
      x: { label: null, tickSize: 0, tickFormat: (p) => (p.endsWith("T1") && +p.slice(0, 4) % 5 === 0 ? p.slice(0, 4) : "") },
      y: { axis: null },
      // "bajo": más desocupación es peor, así que el rojo va arriba del promedio.
      color: { type: "diverging", pivot: promedio, symmetric: false, range: [...T.divergente].reverse(), legend: true, label: "% de desocupación" },
      marks: [Plot.cell(datos, { x: "periodo", fill: "valor", tip: { ...GLOBO }, title: (d) => `${d.periodo}\n${formatear(d.valor)}` })],
    })
  },
},
{
  id: "conectada", nombre: "Dispersión conectada", nivel: 3,
  familia: "trazado", entrada: ["dos-medidas", "serie-tiempo"], funcion: ["correlacion", "tiempo"], forma: ["linea", "puntos"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/conectada.js", galeria: "src/galeria/correlacion.md#conectada",
    uso: "import {conectada} from \"../components/formas/conectada.js\"\nconectada(filas, {ancho, x: (d) => d.escolaridad, y: (d) => d.ingreso, anio: (d) => d.anio, fondo, unidad: (d) => d.lugar, dominioX: DOMINIO_X, dominioY: DOMINIO_Y,\n              formatoX: (x) => numero(x, Number.isInteger(x) ? 0 : 1), formatoY: (y) => `${numero(y / 1000, 0)} mil`, rotuloX: \"Escolaridad promedio, en años\", rotuloY: \"Ingreso al mes, en pesos de 2024\", globo: g})" },
  pregunta: "¿Cómo se movieron dos indicadores juntos a lo largo del tiempo?",
  si: "Una sola unidad y dos medidas con historia (idas y vueltas).", no: "Muchas unidades: se vuelve un nudo; usar dos líneas.",
  datosForma: "[{anio, x, y}]",
  fuentes: [{ texto: "Hannah Fairfield, The New York Times", url: "https://observablehq.com/@d3/connected-scatterplot/2" }],
  datos: () => [[2008, 8.6, 11.2], [2010, 8.9, 10.6], [2012, 9.1, 10.4], [2014, 9.2, 10.1], [2016, 9.4, 10.9], [2018, 9.6, 11.4], [2020, 9.7, 10.7], [2022, 9.9, 11.3], [2024, 10.1, 12.4]]
    .map(([anio, x, y]) => ({ anio, x, y })),
  receta: function (datos, width) {
    return Plot.plot({
      title: titulo("Escolaridad e ingreso de la población ocupada"),
      subtitle: subtitulo("Nacional · 2008 - 2024 · ingreso en miles de pesos de 2024"),
      caption: pie("INEGI, ENIGH (datos de ejemplo). Cada punto es una edición; la flecha sigue el orden de los años."),
      style: ESTILO, width: Math.max(width, 560), height: 420,
      marginTop: 24, marginRight: 40, marginBottom: 52, marginLeft: 62,
      x: { grid: true, nice: true, label: "Años de escolaridad →" },
      y: { grid: true, nice: true, label: "↑ Ingreso mensual (miles)" },
      marks: [
        Plot.line(datos, { x: "x", y: "y", stroke: T.serie, strokeWidth: 2, curve: "catmull-rom", markerEnd: "arrow" }),
        Plot.dot(datos, { x: "x", y: "y", r: 4.5, fill: T.superficie, stroke: T.serie, strokeWidth: 1.8 }),
        Plot.text(datos, { x: "x", y: "y", text: (d) => String(d.anio), dy: -12, fontSize: TIPO.etiqueta, fontWeight: 600,
          fill: "currentColor", ...HALO }),
        Plot.tip(datos, Plot.pointer({ x: "x", y: "y", ...GLOBO,
          title: (d) => `${d.anio}\nEscolaridad: ${punto(d.x, 1)} años\nIngreso: $${punto(d.y, 1)} mil` })),
      ],
    })
  },
},
// ---------------------------------------------------------------- parte
{
  id: "apiladas", nombre: "Barras apiladas al 100 %", nivel: 1,
  familia: "grafica", entrada: ["partes"], funcion: ["parte-todo"], forma: ["barras"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/barras-apiladas.js", galeria: "src/galeria/parte-todo.md#composicion",
    uso: "import {barrasApiladas} from \"../components/formas/index.js\"\nbarrasApiladas(filas, {ancho, fila: (d) => d.anio, categoria: (d) => d.categoria,\n  valor: (d) => d.personas, categorias: CATEGORIAS, color: colorCategoria, globo: g})" },
  pregunta: "¿De qué se compone el total de cada grupo?",
  si: "Hasta tres partes con orden propio, varios grupos.", no: "Más de tres partes sin orden: facetas o \"Otras\".",
  datosForma: "[{grupo, categoria, valor}]",
  fuentes: [],
  datos: () => [["Mujeres", 38, 45, 17], ["Hombres", 51, 41, 8], ["Hablantes de lengua indígena", 63, 31, 6]]
    .flatMap(([grupo, ...v]) => ["Estudia", "Trabaja", "Ninguna"].map((categoria, i) => ({ grupo, categoria, valor: v[i] }))),
  receta: function (datos, width) {
    const CATEGORIAS = ["Estudia", "Trabaja", "Ninguna"]
    const n = new Set(datos.map((d) => d.grupo)).size
    return Plot.plot({
      title: titulo("Qué hacen las personas de 15 a 24 años"),
      subtitle: subtitulo("2024 · actividad principal"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada barra suma 100 % de las personas del grupo."),
      style: ESTILO, width: Math.max(width, 560), height: Math.max(220, n * 44 + 110),
      marginTop: 20, marginRight: 20, marginBottom: 46, marginLeft: 200,
      x: { label: "% →", domain: [0, 100] },
      y: { label: null },
      color: { domain: CATEGORIAS, range: T.categorica, legend: true },
      marks: [
        Plot.barX(datos, Plot.stackX({ y: "grupo", x: "valor", fill: "categoria", order: CATEGORIAS, insetTop: 4, insetBottom: 4,
          stroke: T.superficie, strokeWidth: 1 })),
        Plot.text(datos, Plot.stackX({ y: "grupo", x: "valor", z: "categoria", order: CATEGORIAS, text: (d) => (d.valor >= 8 ? `${d.valor} %` : ""),
          fill: T.gris.papel, fontSize: TIPO.etiqueta, fontWeight: 600 })),
        Plot.barX(datos, Plot.pointerY(Plot.stackX({ y: "grupo", x: "valor", z: "categoria", order: CATEGORIAS, fill: "none",
          stroke: T.gris.tinta, strokeWidth: 1.6, insetTop: 4, insetBottom: 4, maxRadius: Infinity }))),
      ],
    })
  },
},
{
  id: "likert", nombre: "Apilada divergente (Likert)", nivel: 1,
  familia: "grafica", entrada: ["partes"], funcion: ["parte-todo", "comparacion"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/likert.js", galeria: "src/galeria/parte-todo.md#likert",
    uso: "import {likert} from \"../components/formas/likert.js\"\nlikert(filas, {ancho, fila: (d) => d.servicio, respuesta: (d) => d.respuesta, valor: (d) => d.pct, respuestas: RESPUESTAS, colores, orden,\r\n            textoNegativo: \"Insatisfechas\", textoPositivo: \"Satisfechas\", globo: g})" },
  pregunta: "¿Qué tan de acuerdo están?",
  si: "Escalas de acuerdo o satisfacción de cinco puntos.", no: "Respuestas sin orden: barras apiladas o ranking.",
  datosForma: "[{pregunta, respuesta, pct}]",
  fuentes: [],
  datos: () => [["El transporte es seguro", [18, 26, 20, 24, 12]], ["La escuela queda cerca", [8, 14, 18, 36, 24]], ["Hay empleo en mi colonia", [22, 30, 21, 19, 8]]]
    .flatMap(([pregunta, v]) => ["Muy en desacuerdo", "En desacuerdo", "Ni de acuerdo ni en desacuerdo", "De acuerdo", "Muy de acuerdo"]
      .map((respuesta, i) => ({ pregunta, respuesta, pct: v[i] }))),
  receta: function (datos, width) {
    const ESCALA = { "Muy en desacuerdo": T.divergente[7], "En desacuerdo": T.divergente[5], "Ni de acuerdo ni en desacuerdo": T.divergente[4],
      "De acuerdo": T.divergente[3], "Muy de acuerdo": T.divergente[1] }
    const orden = Object.keys(ESCALA)
    const tramos = d3.groups(datos, (d) => d.pregunta).flatMap(([pregunta, v]) => {
      const por = new Map(v.map((d) => [d.respuesta, d.pct]))
      let izq = -(por.get(orden[0]) + por.get(orden[1]) + por.get(orden[2]) / 2)
      return orden.map((respuesta) => { const x1 = izq; izq += por.get(respuesta); return { pregunta, respuesta, x1, x2: izq, pct: por.get(respuesta) } })
    })
    return Plot.plot({
      title: titulo("Percepción del entorno"),
      subtitle: subtitulo("Personas de 18 años y más · 2024"),
      caption: pie("Encuesta de ejemplo. A la izquierda del cero, desacuerdo; a la derecha, acuerdo; el neutro se parte a la mitad."),
      style: ESTILO, width: Math.max(width, 560), height: 3 * 40 + 110,
      marginTop: 44, marginRight: 30, marginBottom: 20, marginLeft: 180,
      x: { axis: "top", tickFormat: (d) => `${Math.abs(d)} %`, label: null, domain: [-70, 70] },
      y: { label: null },
      color: { domain: orden, range: orden.map((k) => ESCALA[k]), legend: true },
      marks: [
        Plot.barX(tramos, { y: "pregunta", x1: "x1", x2: "x2", fill: "respuesta", insetTop: 4, insetBottom: 4, tip: { ...GLOBO },
          title: (d) => `${d.pregunta}\n${d.respuesta}\n${formatear(d.pct)}` }),
        Plot.text(tramos, { y: "pregunta", x: (d) => (d.x1 + d.x2) / 2, text: (d) => (d.pct >= 12 ? punto(d.pct) : ""),
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: (d) => (["Muy en desacuerdo", "Muy de acuerdo"].includes(d.respuesta) ? T.gris.papel : T.tinta) }),
        Plot.ruleX([0], { stroke: T.gris.tinta, strokeWidth: 1.4 }),
      ],
    })
  },
},
{
  id: "cascada", nombre: "Cascada", nivel: 2,
  familia: "grafica", entrada: ["intervalos", "categoria-valor"], funcion: ["parte-todo"], forma: ["barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/cascada.js", galeria: "src/galeria/parte-todo.md#cascada",
    uso: "import {cascada} from \"../components/formas/cascada.js\"\ncascada(pasos, {ancho, inicio, fin, color: (d) => SIG.color(d.s), dominio: DOMINIO_CASCADA, rotuloEje: `Índice, ingreso de ${a} = 100`,\r\n            formatoTotal: (x) => numero(x, 1), formatoCambio: (x) => conSigno(x, (y) => numero(y, 1)), leyenda, globo: g})" },
  pregunta: "¿Qué partes explican el cambio de un total?",
  si: "Descomponer un cambio entre dos totales en sus fuentes.", no: "Las partes no suman el total: barras de diferencia.",
  datosForma: "[{paso, tipo, inicio, fin}]  tipo: total | paso",
  fuentes: [],
  datos: () => { const pasos = [["Ingreso 2022", "total", 0, 16800], ["Trabajo", "paso", 1300], ["Transferencias", "paso", 420], ["Renta", "paso", -180], ["Otros", "paso", -90]]
    let acum = 16800
    const salida = pasos.map(([paso, tipo, a, b]) => { if (tipo === "total") return { paso, tipo, inicio: a, fin: b }
      const inicio = acum; acum += a; return { paso, tipo, inicio, fin: acum } })
    return [...salida, { paso: "Ingreso 2024", tipo: "total", inicio: 0, fin: acum }] },
  receta: function (datos, width) {
    const SENTIDO = "alto" // más ingreso es mejor
    return Plot.plot({
      title: titulo("De dónde salió el cambio en el ingreso de los hogares"),
      subtitle: subtitulo("Ingreso corriente mensual promedio · pesos de 2024"),
      caption: pie("INEGI, ENIGH (datos de ejemplo). Las barras grises son los totales; las demás, lo que suma o resta cada fuente."),
      style: ESTILO, width: Math.max(width, 560), height: 340,
      marginTop: 24, marginRight: 12, marginBottom: 46, marginLeft: 70,
      x: { label: null, padding: 0.3, domain: datos.map((d) => d.paso) },
      y: { grid: true, label: "↑ Pesos", tickFormat: (d) => `$${punto(d / 1000)} mil`, domain: [15000, 19000] },
      marks: [
        Plot.barY(datos, { x: "paso", y1: (d) => (d.tipo === "total" ? 15000 : d.inicio), y2: "fin",
          fill: (d) => (d.tipo === "total" ? T.gris.tinta : colorCambio(d.fin - d.inicio, SENTIDO)) }),
        Plot.link(datos.slice(0, -1), { x1: "paso", x2: (d, i) => datos[i + 1].paso, y1: "fin", y2: "fin",
          stroke: T.gris.trazo, strokeDasharray: "3 3" }),
        Plot.text(datos, { x: "paso", y: (d) => Math.max(d.inicio, d.fin), dy: -9, fontSize: TIPO.valor, fontWeight: 600,
          fill: "currentColor", ...HALO, text: (d) => (d.tipo === "total" ? formatear(d.fin, "pesos") : diferencia(d.fin - d.inicio, 0)) }),
      ],
    })
  },
},
{
  id: "marimekko", nombre: "Marimekko", nivel: 2,
  familia: "grafica", entrada: ["cruce", "partes"], funcion: ["parte-todo"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/marimekko.js", galeria: "src/galeria/parte-todo.md#marimekko",
    uso: "import {marimekko} from \"../components/formas/marimekko.js\"\nmarimekko(filas, {ancho, grupo: (d) => d.sector, parte, valor: (d) => d.num, partes: PARTES, color, globo: g})" },
  pregunta: "¿Cómo se compone cada grupo cuando los grupos tienen tamaños distintos?",
  si: "El ancho (tamaño del grupo) y la mezcla interna importan a la vez.", no: "Grupos de tamaño parecido: apiladas al 100 %.",
  datosForma: "[{sector, condicion, personas}]",
  fuentes: [{ texto: "Galería de D3", url: "https://observablehq.com/@d3/marimekko-chart" }],
  datos: () => [["Agropecuario", 6.1, 0.87], ["Construcción", 4.6, 0.75], ["Manufactura", 9.8, 0.38], ["Comercio", 11.2, 0.6], ["Servicios", 24.5, 0.48], ["Gobierno", 2.6, 0.05]]
    .flatMap(([sector, total, inf]) => [["Informal", total * inf], ["Formal", total * (1 - inf)]].map(([condicion, personas]) => ({ sector, condicion, personas: personas * 1e6 }))),
  receta: function (datos, width) {
    const total = d3.sum(datos, (d) => d.personas)
    const sectores = d3.rollups(datos, (v) => d3.sum(v, (d) => d.personas), (d) => d.sector).sort((a, b) => b[1] - a[1])
    let x = 0
    const rects = sectores.flatMap(([sector, suma]) => { const x1 = x; x += (100 * suma) / total; let y = 0
      return ["Informal", "Formal"].map((condicion) => { const p = datos.find((d) => d.sector === sector && d.condicion === condicion)
        const y1 = y; y += (100 * p.personas) / suma
        return { sector, condicion, x1, x2: x, y1, y2: y, pct: (100 * p.personas) / suma, personas: p.personas } }) })
    return Plot.plot({
      title: titulo("Informalidad por sector"),
      subtitle: subtitulo("2024 · el ancho es el tamaño del sector"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada columna es un sector; su alto se reparte entre empleo informal y formal."),
      style: ESTILO, width: Math.max(width, 560), height: 380,
      marginTop: 30, marginRight: 10, marginBottom: 40, marginLeft: 50,
      x: { domain: [0, 100], label: "% de las personas ocupadas →" },
      y: { domain: [0, 100], label: "↑ % del sector", reverse: true },
      color: { domain: ["Informal", "Formal"], range: [T.cambio.desfavorable, T.cambio.favorable], legend: true },
      marks: [
        Plot.rect(rects, { x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: "condicion", inset: 1, tip: { ...GLOBO },
          title: (d) => `${d.sector}\n${d.condicion}\n${formatear(d.pct)}\nPersonas: ${poblacion(d.personas)}` }),
        Plot.text(rects.filter((d) => d.condicion === "Informal" && d.x2 - d.x1 > 14), { x: (d) => (d.x1 + d.x2) / 2, y: (d) => d.y1 + 3,
          text: (d) => `${d.sector}\n${punto(d.pct)} %`, lineAnchor: "top", fill: T.gris.papel, fontSize: TIPO.etiqueta, fontWeight: 600 }),
      ],
    })
  },
},
// ---------------------------------------------------------------- relacion
{
  id: "dispersion", nombre: "Dispersión", nivel: 1,
  familia: "trazado", entrada: ["dos-medidas"], funcion: ["correlacion"], forma: ["puntos"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/dispersion.js", galeria: "src/galeria/correlacion.md#dispersion",
    uso: "import {dispersion} from \"../components/formas/dispersion.js\"\ndispersion(filas, {ancho, x: (d) => d.internet, y: m.valor, nombre: (d) => d.entidad, dominioX: DOMINIO_INTERNET, dominioY: m.dominio, destacado, medianas,\n            formatoX: (x) => pctEje(x), formatoY: m.eje, rotuloX: \"Porcentaje de hogares con internet\", rotuloY: m.rotulo, globo: g})" },
  pregunta: "¿Se relacionan dos medidas?",
  si: "Decenas o cientos de unidades con dos medidas.", no: "Miles de puntos: hexbin. Una unidad en el tiempo: dispersión conectada.",
  datosForma: "[{entidad, region, x, y}]",
  fuentes: [],
  datos: () => { const r = azar(81)
    return ENT.map((e) => ({ entidad: e.nombre, region: e.region, x: e.internet, y: 6.6 + (e.internet - 40) * 0.07 + r() * 0.9 })) },
  receta: function (datos, width) {
    const col = gruposDeColor(new Set(datos.map((d) => d.region)), ["Sur", "Centro", "Norte", "Occidente"])
    const ELEGIDOS = ["Oaxaca", "Ciudad de México", "Nuevo León"]
    return Plot.plot({
      title: titulo("Internet en el hogar y escolaridad"),
      subtitle: subtitulo("32 entidades · 2020"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada punto es una entidad, coloreada por región."),
      style: ESTILO, width: Math.max(width, 560), height: 440,
      marginTop: 34, marginRight: 20, marginBottom: 52, marginLeft: 62,
      x: { grid: true, nice: true, label: "Hogares con internet (%) →" },
      y: { grid: true, nice: true, label: "↑ Años de escolaridad" },
      color: { domain: col.domain, range: col.range, legend: true },
      marks: [
        Plot.dot(datos, { x: "x", y: "y", fill: (d) => col.clase(d.region), r: 6.5, stroke: T.superficie, strokeWidth: 1 }),
        Plot.text(datos.filter((d) => ELEGIDOS.includes(d.entidad)), { x: "x", y: "y", text: "entidad", dy: -12,
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO, strokeWidth: 3.5 }),
        Plot.dot(datos, Plot.pointer({ x: "x", y: "y", r: 9, fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6 })),
        Plot.tip(datos, Plot.pointer({ x: "x", y: "y", ...GLOBO,
          title: (d) => `${d.entidad}\n${d.region}\nInternet: ${formatear(d.x)}\nEscolaridad: ${punto(d.y, 1)} años` })),
      ],
    })
  },
},
{
  id: "heatmap", nombre: "Heatmap", nivel: 1,
  familia: "tabla", entrada: ["cruce"], funcion: ["comparacion", "correlacion"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/heatmap.js", galeria: "src/galeria/comparacion.md#cruce",
    uso: "import {heatmap} from \"../components/formas/index.js\"\nheatmap(filas, {ancho: Math.min(ancho, 820), x: (d) => d.anio, y: (d) => d.region, valor: (d) => d.pct,\n  escala: rampaTema([0, 50]), ordenX: ANIOS, ordenY: REGIONES, tituloLeyenda: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cómo varía un valor entre dos categorías cruzadas?",
  si: "Más de cuatro paneles: entidades por año, edad por sexo.", no: "Pocas celdas: barras con valor escrito.",
  datosForma: "[{entidad, anio, valor}]",
  fuentes: [],
  datos: () => { const r = azar(91)
    return ["Oaxaca", "Chiapas", "Guerrero", "Puebla", "Veracruz", "Hidalgo", "Michoacán", "Yucatán"].flatMap((entidad, i) =>
      [2016, 2018, 2020, 2022, 2024].map((anio, j) => ({ entidad, anio, valor: i === 2 && j === 1 ? null : 22 + i * 5 + j * 7 + r() * 4 }))) },
  receta: function (datos, width) {
    return Plot.plot({
      title: titulo("Hogares con internet por entidad y edición"),
      subtitle: subtitulo("2016 - 2024 · escala fija de 0 a 100"),
      caption: pie("INEGI, ENDUTIH (datos de ejemplo). Cada celda es el porcentaje de hogares; en gris, sin dato."),
      style: ESTILO, width: Math.max(width, 560), height: Math.max(340, 8 * 30 + 124),
      marginTop: 64, marginRight: 22, marginBottom: 34, marginLeft: 120,
      x: { axis: "top", label: null, padding: 0.06, tickFormat: String },
      y: { label: null },
      color: { type: "linear", domain: [0, 100], range: T.relleno, unknown: T.gris.rejilla, legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
      marks: [
        Plot.cell(datos, { x: "anio", y: "entidad", fill: "valor", inset: 1.5 }),
        Plot.text(datos, { x: "anio", y: "entidad", fontSize: TIPO.valor, fontWeight: 600,
          fill: (d) => (d.valor == null ? T.tintaSuave : d.valor >= 55 ? T.gris.papel : T.tinta),
          text: (d) => (d.valor == null ? "sin dato" : punto(d.valor)) }),
        Plot.cell(datos, Plot.pointer({ x: "anio", y: "entidad", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6 })),
        Plot.tip(datos, Plot.pointer({ x: "anio", y: "entidad", ...GLOBO, title: (d) => `${d.entidad}\n${d.anio}\n${formatear(d.valor)}` })),
      ],
    })
  },
},
{
  id: "hexbin", nombre: "Hexbin", nivel: 2,
  familia: "trazado", entrada: ["dos-medidas"], funcion: ["correlacion", "distribucion"], forma: ["hexagono"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/hexbin.js", galeria: "src/galeria/correlacion.md#hexbin",
    uso: "import {hexbin} from \"../components/formas/hexbin.js\"\nhexbin(filas, {ancho, x: (d) => d.edad, y: (d) => d.horas, peso: (d) => d.factor, dominioX: [15, 80], dominioY: [0, 84], radio: 0.036, escala,\n        formatoX: (x) => numero(x, 0), formatoY: (y) => numero(y, 0), rotuloX: \"Edad, en años\", rotuloY: \"Horas a la semana\",\n        tituloLeyenda: \"Parte de las personas ocupadas (%)\", formatoLeyenda: (t) => (t >= TOPE_HEX ? `${TOPE_HEX} o más` : pctEje(t …})" },
  pregunta: "¿Dónde se concentran miles de puntos?",
  si: "Más de mil puntos con dos medidas continuas.", no: "Pocas unidades con nombre: dispersión.",
  datosForma: "[{edad, horas, factor}]",
  fuentes: [],
  datos: () => { const r = azar(101), n = normal(r)
    return d3.range(4000).map(() => { const edad = 15 + Math.floor(r() * 60)
      return { edad, horas: Math.max(0, Math.min(84, 44 - Math.abs(edad - 40) * 0.25 + 12 * n())), factor: 900 } }) },
  receta: function (datos, width) {
    return Plot.plot({
      title: titulo("Edad y horas trabajadas"),
      subtitle: subtitulo("Personas ocupadas · 2024"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada hexágono cuenta a las personas con esa edad y esas horas."),
      style: ESTILO, width: Math.max(width, 560), height: 440,
      marginTop: 34, marginRight: 20, marginBottom: 52, marginLeft: 62,
      x: { grid: true, label: "Edad →" }, y: { grid: true, label: "↑ Horas a la semana" },
      color: { type: "sqrt", range: T.relleno, legend: true, label: "Personas" },
      marks: [
        Plot.dot(datos, Plot.hexbin({ fill: "sum", title: "sum" }, { x: "edad", y: "horas", fill: "factor", binWidth: 14, symbol: "hexagon",
          stroke: T.superficie, strokeWidth: 0.5, tip: { ...GLOBO } })),
      ],
    })
  },
},
// ---------------------------------------------------------------- mapa
{
  id: "coropleta", nombre: "Coropleta", nivel: 1,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion"], forma: ["mapa"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/coropleta.js", galeria: "src/galeria/mapas.md#nivel",
    uso: "import {coropleta} from \"../components/formas/index.js\"\ncoropleta(geo, valores, {ancho, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), encuadre: dentro,\n  tituloLeyenda: \"Porcentaje\", marcasLeyenda: [0, 20, 40, 60, 80], globo: g})" },
  pregunta: "¿Dónde pasa? (tasas)",
  si: "Una tasa o porcentaje por entidad o municipio.", no: "Conteos: mapa de burbujas o agujas.",
  datosForma: "[{id, valor}]  id igual al del geojson",
  fuentes: [],
  datos: () => ENT.map((e) => ({ id: e.id, nombre: e.nombre, valor: e.id === "COL" ? null : e.internet })),
  receta: function (datos, width) {
    const valor = new Map(datos.map((d) => [d.id, d]))
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Hogares con internet"),
      subtitle: subtitulo("2024 · escala fija de 0 a 100"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Cada entidad se pinta con su porcentaje; en gris, sin dato."),
      style: ESTILO, width: ancho, height: Math.round(ancho * 0.66),
      projection: { type: "mercator", domain: entidades },
      color: { type: "linear", domain: [0, 100], range: T.relleno, unknown: T.gris.rejilla, legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
      marks: [
        Plot.geo(entidades, { fill: (f) => valor.get(f.id)?.valor, stroke: "none" }),
        Plot.geo(entidades, Plot.pointer(Plot.centroid({ stroke: T.gris.tinta, strokeWidth: 2.5, fill: "none" }))),
        Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO,
          title: (f) => `${f.properties.nombre}\n${valor.get(f.id)?.valor == null ? "sin dato" : formatear(valor.get(f.id).valor)}` }))),
      ],
    })
  },
},
{
  id: "burbujas", nombre: "Mapa de burbujas", nivel: 1,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion"], forma: ["circulo", "mapa"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/burbujas.js", galeria: "src/galeria/mapas.md#burbujas",
    uso: "import {burbujas} from \"../components/formas/burbujas.js\"\nburbujas(geo, new Map(filas.map((r) => [r.cve, r])), {ancho, valor: (d) => d.num, tope: TOPE_CONTEO, encuadre: dentro, globo: g})" },
  pregunta: "¿Cuántos hay en cada lugar? (conteos)",
  si: "Personas, escuelas o casos por entidad.", no: "Tasas: coropleta.",
  datosForma: "[{id, num}]",
  fuentes: [],
  datos: () => ENT.map((e) => ({ id: e.id, num: (e.pob * e.indigena) / 100 })),
  receta: function (datos, width) {
    const valor = new Map(datos.map((d) => [d.id, d.num]))
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Personas que hablan una lengua indígena"),
      subtitle: subtitulo("2020 · el área del círculo es proporcional al número de personas"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada círculo está en el centro de su entidad."),
      style: ESTILO, width: ancho, height: Math.round(ancho * 0.66),
      projection: { type: "mercator", domain: entidades },
      r: { range: [0, 30] },
      marks: [
        Plot.geo(entidades, { fill: T.gris.rejilla, stroke: T.superficie, strokeWidth: 0.8 }),
        Plot.dot(entidades.features, Plot.centroid({ r: (f) => valor.get(f.id), fill: T.serie, fillOpacity: 0.5, stroke: T.serie, strokeWidth: 1 })),
        Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO, title: (f) => `${f.properties.nombre}\n${poblacion(valor.get(f.id))} personas` }))),
      ],
    })
  },
},
{
  id: "bivariado", nombre: "Mapa bivariado", nivel: 2,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion", "correlacion"], forma: ["mapa"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/bivariado.js", galeria: "src/galeria/mapas.md#bivariado",
    uso: "import {bivariado} from \"../components/formas/bivariado.js\"\nbivariado(geo, new Map(filas.map((d) => [d.cve, d])), {\n            ancho, a: (d) => d.internet, b: (d) => d.escolaridad, cortesA: CORTES_INTERNET, cortesB: CORTES_ESCOLARIDAD,\n            ejeA: \"Internet\", ejeB: \"Escolaridad\", formatoA: (x) => `${numero(x, 0)} %`, formatoB: (x) => `${numero(x, 1)} años`,\n            encuadre: dentro, globo: g,\n          })" },
  pregunta: "¿Dónde coinciden dos cosas?",
  si: "Dos variables con terciles claros y una pregunta de coincidencia.", no: "Una sola variable: coropleta. Tres: no se lee.",
  datosForma: "[{id, a, b}]  terciles sobre el universo completo",
  fuentes: [{ texto: "Joshua Stevens", url: "https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/" }],
  datos: () => { const r = azar(111)
    return paises.features.map((f) => ({ id: f.id, nombre: f.properties.name, a: r() < 0.06 ? null : 380 + r() * 170, b: 0.2 + r() * 0.4 })) },
  receta: function (datos, width) {
    const tercil = (v, c) => (v == null ? null : v < c[0] ? 0 : v < c[1] ? 1 : 2)
    const corte = (k) => { const v = datos.map((d) => d[k]).filter((x) => x != null).sort(d3.ascending); return [d3.quantile(v, 1 / 3), d3.quantile(v, 2 / 3)] }
    const CA = corte("a"), CB = corte("b"), por = new Map(datos.map((d) => [d.id, d]))
    const clase = (f) => { const d = por.get(f.id); const a = tercil(d?.a, CA), b = tercil(d?.b, CB)
      return a == null || b == null ? T.gris.rejilla : T.bivariada[a][b] }
    const ancho = Math.max(width, 560)
    const mapa = Plot.plot({
      title: titulo("Puntaje y desigualdad educativa"),
      subtitle: subtitulo("Terciles de cada variable · países de ejemplo"),
      caption: pie("Datos de ejemplo. Cada país combina el tercil de su puntaje (filas) y el de su desigualdad (columnas)."),
      style: ESTILO, width: ancho, height: Math.round((ancho * 142) / 360),
      projection: { type: "equirectangular", domain: { type: "MultiPoint", coordinates: [[-180, -58], [180, 84]] } },
      marks: [
        Plot.frame({ fill: T.gris.papel, stroke: "none" }),
        Plot.geo(paises, { fill: clase, stroke: "none", clip: "frame" }),
        Plot.tip(paises.features, Plot.pointer(Plot.centroid({ ...GLOBO, title: (f) => { const d = por.get(f.id)
          return `${f.properties.name}\n${d?.a == null ? "sin dato" : `Puntaje: ${punto(d.a)}\nDesigualdad: ${punto(d.b, 2)}`}` } }))),
      ],
    })
    const celdas = d3.range(3).flatMap((a) => d3.range(3).map((b) => ({ a, b })))
    const leyenda = Plot.plot({
      width: 170, height: 150, marginLeft: 44, marginBottom: 34, marginTop: 6, marginRight: 6, style: ESTILO,
      x: { domain: [0, 1, 2], tickFormat: () => "", label: "más desigualdad →", tickSize: 0 },
      y: { domain: [0, 1, 2], tickFormat: () => "", label: "↑ más puntaje", tickSize: 0, reverse: true },
      marks: [Plot.cell(celdas, { x: "b", y: (d) => 2 - d.a, fill: (d) => T.bivariada[d.a][d.b], inset: 1 })],
    })
    const caja = document.createElement("div")
    caja.append(mapa, leyenda)
    return caja
  },
},
{
  id: "teselas", nombre: "Mosaico de entidades", nivel: 2,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion", "comparacion"], forma: ["cuadrado", "mapa"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/mosaico.js", galeria: "src/galeria/mapas.md#mosaico",
    uso: "import {mosaico} from \"../components/formas/index.js\"\nmosaico(new Map(filas.map((r) => [r.cve, r])), {ancho, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL),\n  cifra: (x) => pct(x, 0), tituloLeyenda: \"Porcentaje\", globo: g})" },
  pregunta: "¿Cómo se comparan las 32 entidades con el mismo peso visual?",
  si: "Tasas por entidad donde Tlaxcala y la Ciudad de México deben verse igual que Chihuahua.", no: "La forma o el tamaño real del territorio importan: coropleta.",
  datosForma: "[{id, corto, col, fila, valor}]",
  fuentes: [{ texto: "NPR, Danny DeBelius (2015)", url: "https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html" }],
  datos: () => ENT.map((e) => ({ id: e.id, nombre: e.nombre, corto: e.corto, col: e.col, fila: e.fila, valor: e.internet })),
  receta: function (datos, width) {
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Hogares con internet"),
      subtitle: subtitulo("2024 · cada entidad ocupa un cuadro del mismo tamaño"),
      caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). La posición aproxima la geografía; el color es el porcentaje."),
      style: ESTILO, width: ancho, height: Math.round(ancho * REJILLA_FILAS / REJILLA_COLS) + 20,
      marginTop: 10, marginRight: 10, marginBottom: 10, marginLeft: 10,
      x: { axis: null, domain: d3.range(REJILLA_COLS), padding: 0.06 },
      y: { axis: null, domain: d3.range(REJILLA_FILAS), padding: 0.06 },
      color: { type: "linear", domain: [0, 100], range: T.relleno, legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
      marks: [
        Plot.cell(datos, { x: "col", y: "fila", fill: "valor", rx: 4, tip: { ...GLOBO }, title: (d) => `${d.nombre}\n${formatear(d.valor)}` }),
        Plot.text(datos, { x: "col", y: "fila", text: (d) => `${d.corto}\n${punto(d.valor)}`, fontSize: TIPO.etiqueta, fontWeight: 600,
          fill: (d) => (d.valor >= 55 ? T.gris.papel : T.tinta), lineHeight: 1.2 }),
      ],
    })
  },
},
{
  id: "agujas", nombre: "Mapa de agujas", nivel: 3,
  familia: "mapa", entrada: ["geo-valor", "geo-puntos"], funcion: ["geolocalizacion"], forma: ["triangulo", "mapa"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/picos.js", galeria: "src/galeria/mapas.md#picos",
    uso: "import {picos} from \"../components/formas/index.js\"\npicos(geo, filas, {ancho, posicion: (d) => [d.lon, d.lat], valor: (d) => d.num, nombre: (d) => d.nombre,\n  tope: TOPE_PICOS, globo: g})" },
  pregunta: "¿Dónde se concentran los conteos, sin que el territorio grande domine?",
  si: "Conteos absolutos con diferencias grandes entre lugares.", no: "Unidades muy juntas: las agujas se tapan; usar mosaico o burbujas.",
  datosForma: "[{id, num}]",
  fuentes: [{ texto: "Mike Bostock, D3", url: "https://observablehq.com/@d3/spike-map/2" }],
  datos: () => ENT.map((e) => ({ id: e.id, num: e.pob })),
  receta: function (datos, width) {
    const valor = new Map(datos.map((d) => [d.id, d.num]))
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Población por entidad"),
      subtitle: subtitulo("2020 · la altura de la aguja es proporcional a la población"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada aguja sale del centro de su entidad."),
      style: ESTILO, width: ancho, height: Math.round(ancho * 0.7),
      projection: { type: "mercator", domain: entidades },
      length: { range: [0, 130] },
      marks: [
        Plot.geo(entidades, { fill: T.gris.rejilla, stroke: T.superficie, strokeWidth: 0.8 }),
        Plot.spike(entidades.features, Plot.centroid({ length: (f) => valor.get(f.id), stroke: T.serie, fill: T.serie, fillOpacity: 0.25, strokeWidth: 1 })),
        Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO, title: (f) => `${f.properties.nombre}\n${poblacion(valor.get(f.id))} personas` }))),
      ],
    })
  },
},
{
  id: "dorling", nombre: "Cartograma de Dorling", nivel: 3,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion"], forma: ["circulo", "mapa"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/dorling.js", galeria: "src/galeria/mapas.md#dorling",
    uso: "import {dorling} from \"../components/formas/dorling.js\"\ndorling(geo, new Map(filas.map((r) => [r.cve, r])), {\n            ancho, peso: (d) => d.den, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), topePeso: TOPE_POBLACION,\n            destacar: region ? (k) => POR_CVE.get(k)?.region === region : null,\n            tituloLeyenda: \"Porcentaje\", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? \"80 o más\" : String(x)), globo: gl …})" },
  pregunta: "¿Cómo se ve el país pesado por personas y no por territorio?",
  si: "Una tasa donde importa cuánta gente vive en cada lugar.", no: "El lector necesita ubicar lugares con precisión: coropleta.",
  datosForma: "[{id, pob, valor}]",
  fuentes: [{ texto: "Danny Dorling; Julien Gaffuri", url: "https://observablehq.com/@jgaffuri/dorling-cartogram-population" }],
  datos: () => ENT.map((e) => ({ id: e.id, nombre: e.nombre, corto: e.corto, pob: e.pob, valor: e.internet })),
  receta: function (datos, width) {
    const W = Math.max(width, 560), H = Math.round(W * 0.66)
    const proy = d3.geoMercator().fitExtent([[20, 20], [W - 20, H - 20]], entidades)
    const radio = d3.scaleSqrt().domain([0, d3.max(datos, (d) => d.pob)]).range([0, W / 16])
    const centro = new Map(entidades.features.map((f) => [f.id, proy(d3.geoCentroid(f))]))
    const nodos = datos.map((d) => ({ ...d, r: radio(d.pob), x: centro.get(d.id)[0], y: centro.get(d.id)[1], x0: centro.get(d.id)[0], y0: centro.get(d.id)[1] }))
    d3.forceSimulation(nodos).force("x", d3.forceX((d) => d.x0).strength(0.4)).force("y", d3.forceY((d) => d.y0).strength(0.4))
      .force("choque", d3.forceCollide((d) => d.r + 1.5)).stop().tick(240)
    return Plot.plot({
      title: titulo("Hogares con internet, por población"),
      subtitle: subtitulo("2024 · el área del círculo es la población de la entidad"),
      caption: pie("INEGI (datos de ejemplo). Cada círculo es una entidad cerca de su lugar; el color es el porcentaje."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null }, r: { type: "identity" },
      color: { type: "linear", domain: [0, 100], range: T.relleno, legend: true, label: "%", ticks: [0, 25, 50, 75, 100] },
      marks: [
        Plot.dot(nodos, { x: "x", y: "y", r: "r", fill: "valor", stroke: T.superficie, strokeWidth: 1, tip: { ...GLOBO },
          title: (d) => `${d.nombre}\n${formatear(d.valor)}\n${poblacion(d.pob)} personas` }),
        Plot.text(nodos.filter((d) => d.r > 16), { x: "x", y: "y", text: "corto", fontSize: 10.5, fontWeight: 700,
          fill: (d) => (d.valor >= 55 ? T.gris.papel : T.tinta) }),
      ],
    })
  },
},
{
  id: "densidad", nombre: "Mapa de densidad de puntos", nivel: 3,
  familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion", "unidades"], forma: ["puntos", "mapa"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/densidad.js", galeria: "src/galeria/mapas.md#densidad",
    uso: "import {densidad} from \"../components/formas/densidad.js\"\ndensidad(geo, new Map(filas.map((r) => [r.cve, r])), {ancho, cumplen: (d) => d.num, total: (d) => d.den, encuadre: dentro, globo: globoNivel(v)})" },
  pregunta: "¿Dónde viven los grupos y cuánto se mezclan?",
  si: "Dos grupos de población y la pregunta es su mezcla en el territorio.", no: "Precisión de ubicación: los puntos se reparten al azar dentro de cada entidad.",
  datosForma: "[{id, pob, indigena}]",
  fuentes: [{ texto: "Dustin Cable (Racial Dot Map); Aaron Williams", url: "https://observablehq.com/@aboutaaron/racial-demographic-dot-density-map" }],
  datos: () => ENT.map((e) => ({ id: e.id, pob: e.pob, indigena: e.indigena })),
  receta: function (datos, width) {
    const POR_PUNTO = 20000 // personas que representa cada punto
    const r = d3.randomLcg(7)
    const puntos = datos.flatMap((d) => {
      const f = entidades.features.find((g) => g.id === d.id)
      const [[x0, y0], [x1, y1]] = d3.geoBounds(f)
      const n = Math.round(d.pob / POR_PUNTO), hablantes = Math.round((n * d.indigena) / 100), salida = []
      for (let k = 0, intentos = 0; k < n && intentos < n * 40; intentos++) {
        const p = [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)]
        if (d3.geoContains(f, p)) salida.push({ lon: p[0], lat: p[1], grupo: k++ < hablantes ? "Habla lengua indígena" : "No habla lengua indígena" })
      }
      return salida
    })
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Dónde vive la población hablante de lengua indígena"),
      subtitle: subtitulo("2020 · cada punto son 20 mil personas"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Los puntos se reparten al azar dentro de cada entidad; no son domicilios."),
      style: ESTILO, width: ancho, height: Math.round(ancho * 0.66),
      projection: { type: "mercator", domain: entidades },
      color: { domain: ["Habla lengua indígena", "No habla lengua indígena"], range: [T.categorica[0], T.gris.fondo], legend: true },
      marks: [
        Plot.geo(entidades, { fill: "none", stroke: T.gris.trazo, strokeWidth: 0.5 }),
        Plot.dot(puntos.filter((p) => p.grupo !== "Habla lengua indígena"), { x: "lon", y: "lat", r: 1.1, fill: "grupo" }),
        Plot.dot(puntos.filter((p) => p.grupo === "Habla lengua indígena"), { x: "lon", y: "lat", r: 1.3, fill: "grupo" }),
      ],
    })
  },
},
// ---------------------------------------------------------------- flujo
{
  id: "sankey", nombre: "Sankey", nivel: 2,
  familia: "diagrama", entrada: ["origen-destino"], funcion: ["flujo"], forma: ["area"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/sankey.js", galeria: "src/galeria/flujo.md#sankey",
    uso: "import {sankey} from \"../components/formas/index.js\"\nsankey(flujos, {ancho, etapa: (d) => d.etapa, origen: (d) => d.de, destino: (d) => d.a, valor: (d) => d.personas,\n  etapas: [\"2015\", \"2020\", \"2025\"], categorias: CATEGORIAS, color: colorCategoria, globo: g})" },
  pregunta: "¿De dónde a dónde se mueve algo?",
  si: "Tres o cuatro etapas con hasta ocho nodos cada una.", no: "Muchos orígenes y destinos: matriz de adyacencia.",
  datosForma: "nodos [{id}], enlaces [{source, target, value}]",
  fuentes: [{ texto: "Mike Bostock, d3-sankey", url: "https://observablehq.com/@d3/sankey/2" }],
  datos: () => ({
    nodos: ["Estudiaba", "Trabajaba", "Ninguna", "Empleo formal", "Empleo informal", "Sigue estudiando", "Sin empleo"].map((id) => ({ id })),
    enlaces: [["Estudiaba", "Sigue estudiando", 42], ["Estudiaba", "Empleo formal", 21], ["Estudiaba", "Empleo informal", 18], ["Trabajaba", "Empleo formal", 34],
      ["Trabajaba", "Empleo informal", 41], ["Trabajaba", "Sin empleo", 9], ["Ninguna", "Empleo informal", 14], ["Ninguna", "Sin empleo", 21]]
      .map(([source, target, value]) => ({ source, target, value: value * 1e4 })),
  }),
  receta: function ({ nodos, enlaces }, width) {
    const d3Sankey = d3.sankey // d3-sankey no viene con d3: se carga aparte
    const ELEGIDO = "Ninguna"
    const W = Math.max(width, 560), H = 360, MARGEN_X = 130
    const g = d3Sankey().nodeId((d) => d.id).nodeWidth(14).nodePadding(16).nodeSort(null)
      .extent([[MARGEN_X, 12], [W - MARGEN_X, H - 12]])({ nodes: nodos.map((d) => ({ ...d })), links: enlaces.map((d) => ({ ...d })) })
    const total = d3.sum(g.nodes.filter((d) => d.depth === 0), (d) => d.value)
    return Plot.plot({
      title: titulo("Qué hacían y qué hacen tres años después"),
      subtitle: subtitulo("Jóvenes de 18 a 24 años · en rojo, quienes no estudiaban ni trabajaban"),
      caption: pie("INEGI, ENOE panel (datos de ejemplo). El grosor de cada flujo es proporcional a las personas."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      marks: [
        Plot.link(g.links, { x1: (d) => d.source.x1, y1: (d) => d.y0, x2: (d) => d.target.x0, y2: (d) => d.y1, curve: "bump-x",
          strokeWidth: (d) => Math.max(1, d.width), strokeOpacity: 0.45, stroke: (d) => (d.source.id === ELEGIDO ? T.rojo : T.gris.fondo),
          tip: { ...GLOBO }, title: (d) => `${d.source.id} → ${d.target.id}\n${poblacion(d.value)} personas` }),
        Plot.rect(g.nodes, { x1: "x0", x2: "x1", y1: "y0", y2: "y1", fill: T.gris.tinta }),
        // textAnchor es constante en Plot: una marca por lado.
        Plot.text(g.nodes.filter((d) => d.x0 < W / 2), { x: (d) => d.x0 - 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "end",
          fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => `${d.id}\n${punto((100 * d.value) / total, 1)} %` }),
        Plot.text(g.nodes.filter((d) => d.x0 >= W / 2), { x: (d) => d.x1 + 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "start",
          fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => `${d.id}\n${punto((100 * d.value) / total, 1)} %` }),
      ],
    })
  },
},
{
  id: "conjuntos", nombre: "Conjuntos paralelos", nivel: 3,
  familia: "diagrama", entrada: ["cruce"], funcion: ["flujo", "parte-todo"], forma: ["area"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/conjuntos.js", galeria: "src/galeria/flujo.md#conjuntos",
    uso: "import {conjuntos} from \"../components/formas/conjuntos.js\"\nconjuntos(filas, {\n        ancho, dimensiones: DIMS, valor: (d) => d.personas, colorPor: v.color, color,\n        globo: globo({\n          donde: () => \"Todo el país\", cuando: () => periodo, grupo: (d) => d.combo.map((c) => c.texto).join(\" · \"), color: (d) => d.color,\n          valor: (d) => (100 * d.valor) / d.total, formato: \"pct\",\n          frase: `de las personas ${quienes} están en este grupo` …})" },
  pregunta: "¿Cómo se reparte una población entre varias categorías a la vez?",
  si: "Tres variables categóricas cruzadas (sexo, escolaridad, ocupación).", no: "Más de tres variables: los listones se enredan; usar tablas cruzadas.",
  datosForma: "[{sexo, escolaridad, condicion, personas}]",
  fuentes: [{ texto: "Kosara y Bendix; Jason Davies; galería de D3", url: "https://observablehq.com/@d3/parallel-sets" }],
  datos: () => { const r = azar(121), filas = []
    for (const sexo of ["Mujeres", "Hombres"]) for (const escolaridad of ["Básica", "Media superior", "Superior"])
      for (const condicion of ["Formal", "Informal", "No trabaja"]) {
        const base = { "Formal": escolaridad === "Superior" ? 30 : 12, "Informal": escolaridad === "Básica" ? 28 : 16, "No trabaja": sexo === "Mujeres" ? 26 : 10 }[condicion]
        filas.push({ sexo, escolaridad, condicion, personas: (base + r() * 6) * 1e5 }) }
    return filas },
  receta: function (datos, width) {
    const COLUMNAS = ["sexo", "escolaridad", "condicion"]
    const nodos = [...new Set(COLUMNAS.flatMap((c) => datos.map((d) => `${c}:${d[c]}`)))].map((id) => ({ id }))
    const enlaces = COLUMNAS.slice(0, -1).flatMap((c, i) => datos.map((d) => ({ source: `${c}:${d[c]}`, target: `${COLUMNAS[i + 1]}:${d[COLUMNAS[i + 1]]}`,
      value: d.personas, sexo: d.sexo })))
    const W = Math.max(width, 560), H = 380
    const g = d3.sankey().nodeId((d) => d.id).nodeWidth(12).nodePadding(14).nodeSort(null)
      .extent([[90, 12], [W - 90, H - 12]])({ nodes: nodos.map((d) => ({ ...d })), links: enlaces.map((d) => ({ ...d })) })
    const nombre = (id) => id.split(":")[1]
    return Plot.plot({
      title: titulo("Sexo, escolaridad y condición laboral"),
      subtitle: subtitulo("Población de 25 a 64 años · 2024 · color por sexo"),
      caption: pie("INEGI, ENOE 2024 (datos de ejemplo). Cada listón sigue a un grupo de personas de una columna a la siguiente."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      color: { domain: ["Mujeres", "Hombres"], range: [T.parSexo.mujeres, T.parSexo.hombres], legend: true },
      marks: [
        Plot.link(g.links, { x1: (d) => d.source.x1, y1: (d) => d.y0, x2: (d) => d.target.x0, y2: (d) => d.y1, curve: "bump-x",
          strokeWidth: (d) => Math.max(1, d.width), strokeOpacity: 0.5, stroke: "sexo",
          tip: { ...GLOBO }, title: (d) => `${d.sexo}\n${nombre(d.source.id)} → ${nombre(d.target.id)}\n${poblacion(d.value)} personas` }),
        Plot.rect(g.nodes, { x1: "x0", x2: "x1", y1: "y0", y2: "y1", fill: T.gris.tinta }),
        Plot.text(g.nodes.filter((d) => d.x0 < W / 2), { x: (d) => d.x0 - 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "end",
          fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => nombre(d.id) }),
        Plot.text(g.nodes.filter((d) => d.x0 >= W / 2), { x: (d) => d.x1 + 8, y: (d) => (d.y0 + d.y1) / 2, textAnchor: "start",
          fontSize: TIPO.etiqueta, fill: "currentColor", ...HALO, text: (d) => nombre(d.id) }),
      ],
    })
  },
},
{
  id: "red", nombre: "Red", nivel: 2,
  familia: "diagrama", entrada: ["origen-destino"], funcion: ["flujo"], forma: ["circulo", "linea"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/red.js", galeria: "src/galeria/flujo.md#red",
    uso: "import {red} from \"../components/formas/red.js\"\nred(nodos, pares, {\n        ancho, base: 10000, minimo: v.minimo, tope: TOPE_RED, clave: \"red-od\", destacar: region ? (id) => POR_CVE.get(id)?.region === region : null,\n        globo: globo({\n          donde: (d) => d.nombre, cuando: () => PERIODO_OD, grupo: (d) => (region ? (d.region === region ? `Región ${region}` : \"Otra región\") : null), color: (d) => (!region || d.region === region ? P.tonoTe …})" },
  pregunta: "¿Quién se conecta con quién?",
  si: "La estructura (comunidades, nodos centrales) es la pregunta.", no: "Hay que comparar cantidades entre pares: matriz de adyacencia.",
  datosForma: "nodos [{id, grupo}], enlaces [{source, target}]",
  fuentes: [],
  datos: () => { const r = azar(131), grupos = ["Sur", "Centro", "Norte", "Occidente"]
    const nodos = d3.range(36).map((i) => ({ id: `Org. ${i + 1}`, grupo: grupos[i % 4] }))
    const enlaces = []
    nodos.forEach((a, i) => nodos.forEach((b, j) => { if (j > i && r() < (a.grupo === b.grupo ? 0.28 : 0.025)) enlaces.push({ source: a.id, target: b.id }) }))
    return { nodos, enlaces } },
  receta: function ({ nodos, enlaces }, width) {
    const W = Math.max(width, 560), H = 460, UMBRAL = 7
    const nodosR = nodos.map((d) => ({ ...d })), enlacesR = enlaces.map((d) => ({ ...d }))
    d3.forceSimulation(nodosR).force("link", d3.forceLink(enlacesR).id((d) => d.id).distance(34))
      .force("carga", d3.forceManyBody().strength(-70)).force("centro", d3.forceCenter(W / 2, H / 2))
      .force("x", d3.forceX(W / 2).strength(0.05)).force("y", d3.forceY(H / 2).strength(0.08))
      .force("choque", d3.forceCollide(10)).stop().tick(300) // se calcula completa: nada se mueve en pantalla
    const col = gruposDeColor(new Set(nodosR.map((d) => d.grupo)), ["Sur", "Centro", "Norte", "Occidente"])
    const grado = d3.rollup(enlacesR.flatMap((l) => [l.source.id, l.target.id]), (v) => v.length, (d) => d)
    return Plot.plot({
      title: titulo("Colaboración entre organizaciones civiles"),
      subtitle: subtitulo("Proyectos compartidos · color por región"),
      caption: pie("Datos de ejemplo. Cada círculo es una organización y crece con sus conexiones; la posición no significa nada."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      color: { domain: col.domain, range: col.range, legend: true },
      marks: [
        Plot.link(enlacesR, { x1: (d) => d.source.x, y1: (d) => d.source.y, x2: (d) => d.target.x, y2: (d) => d.target.y, stroke: T.gris.fondo, strokeWidth: 1 }),
        Plot.dot(nodosR, { x: "x", y: "y", fill: (d) => col.clase(d.grupo), stroke: T.superficie, strokeWidth: 1,
          r: (d) => 3 + Math.sqrt(grado.get(d.id) ?? 0) * 2, tip: { ...GLOBO },
          title: (d) => `${d.id}\n${d.grupo}\n${grado.get(d.id) ?? 0} conexiones` }),
        Plot.text(nodosR.filter((d) => (grado.get(d.id) ?? 0) >= UMBRAL), { x: "x", y: "y", text: "id", dy: -13,
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: "currentColor", ...HALO }),
      ],
    })
  },
},
{
  id: "matriz", nombre: "Matriz de adyacencia", nivel: 2,
  familia: "tabla", entrada: ["origen-destino"], funcion: ["flujo"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/matriz.js", galeria: "src/galeria/flujo.md#matriz",
    uso: "import {matriz} from \"../components/formas/matriz.js\"\nmatriz(lugares, {\n        ancho, valor: (o, d) => odPar.get(`${o}-${d}`)?.personas ?? null, casos: (o, d) => odPar.get(`${o}-${d}`)?.casos ?? null,\n        nombre: nombreDe, corto: cortoDe2, escala: escalaCelda, marcas: [0, 5000, 20000, 45000, TOPE_CELDA], destacar: foco, globo: g,\n      })" },
  pregunta: "¿Cuánto se mueve entre cada par de lugares?",
  si: "Flujos origen-destino entre 6 y 30 lugares.", no: "Pocos flujos y la trayectoria importa: Sankey.",
  datosForma: "[{origen, destino, personas}]",
  fuentes: [{ texto: "Mike Bostock (Les Misérables)", url: "https://bost.ocks.org/mike/miserables/" }],
  datos: () => { const r = azar(141), lugares = ["Ciudad de México", "México", "Jalisco", "Nuevo León", "Puebla", "Veracruz", "Guanajuato", "Querétaro"]
    return lugares.flatMap((o, i) => lugares.map((d, j) => ({ origen: o, destino: d, personas: i === j ? null : Math.round((i < 2 && j < 2 ? 180 : 20) + r() * 60 + (j === 7 ? 40 : 0)) * 1000 }))) },
  receta: function (datos, width) {
    const lugares = [...new Set(datos.map((d) => d.origen))]
    return Plot.plot({
      title: titulo("Migración entre entidades"),
      subtitle: subtitulo("2015 - 2020 · filas: de dónde salieron; columnas: a dónde llegaron"),
      caption: pie("INEGI, Censo 2020 (datos de ejemplo). Cada celda son las personas que se mudaron de la fila a la columna."),
      style: ESTILO, width: Math.max(width, 560), height: lugares.length * 36 + 150,
      marginTop: 120, marginRight: 20, marginBottom: 10, marginLeft: 130,
      x: { axis: "top", label: null, domain: lugares, tickRotate: -40 },
      y: { label: null, domain: lugares },
      color: { type: "sqrt", domain: [0, 250000], range: T.relleno, unknown: T.gris.rejilla, legend: true, label: "Personas" },
      marks: [
        Plot.cell(datos, { x: "destino", y: "origen", fill: "personas", inset: 1 }),
        Plot.cell(datos, Plot.pointer({ x: "destino", y: "origen", fill: "none", stroke: T.gris.tinta, strokeWidth: 1.6 })),
        Plot.tip(datos, Plot.pointer({ x: "destino", y: "origen", ...GLOBO,
          title: (d) => `${d.origen} → ${d.destino}\n${d.personas == null ? "misma entidad" : `${poblacion(d.personas)} personas`}` })),
      ],
    })
  },
},
{
  id: "arcos", nombre: "Diagrama de arcos", nivel: 3,
  familia: "diagrama", entrada: ["origen-destino"], funcion: ["flujo"], forma: ["linea", "circulo"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/arcos.js", galeria: "src/galeria/flujo.md#arcos",
    uso: "import {arcos} from \"../components/formas/arcos.js\"\narcos(ORDENES[v.orden].fn(), flujosArco, {\n        ancho, nombre: nombreDe, corto: cortoDe2, foco, maximo: v.cuantos, tope: TOPE_CELDA,\n        globo: globo({\n          donde: (d) => `${d.origen} → ${d.destino}`, cuando: () => PERIODO_OD,\n          grupo: (d) => (!foco ? null : d.o === foco ? `Salen de ${d.origen}` : d.d === foco ? `Llegan a ${d.destino}` : \"Otro flujo mayor\"),\n          color: (d …})" },
  pregunta: "¿Qué pares de una lista ordenada están conectados?",
  si: "Pocos nodos con un orden natural (años, entidades de norte a sur).", no: "Muchos enlaces: matriz de adyacencia.",
  datosForma: "[{origen, destino, valor}]",
  fuentes: [{ texto: "Martin Wattenberg; Observable Plot", url: "https://observablehq.com/@observablehq/plot-arc-diagram" }],
  datos: () => { const lugares = ["Baja California", "Sonora", "Chihuahua", "Nuevo León", "Jalisco", "Ciudad de México", "Puebla", "Veracruz", "Oaxaca", "Chiapas"]
    const pares = [[8, 0, 9], [9, 0, 6], [8, 5, 7], [7, 3, 8], [7, 5, 5], [6, 5, 9], [9, 3, 3], [4, 0, 4], [8, 1, 3], [5, 4, 4], [7, 2, 2]]
    return { lugares, pares: pares.map(([o, d, v]) => ({ origen: lugares[o], destino: lugares[d], valor: v * 1e4 })) } },
  receta: function ({ lugares, pares }, width) {
    // Plot curva el arco hacia su izquierda: con los extremos de izquierda a derecha, todos quedan arriba.
    const arcos = pares.map((d) => { const invertido = lugares.indexOf(d.origen) > lugares.indexOf(d.destino)
      return { ...d, a: invertido ? d.destino : d.origen, b: invertido ? d.origen : d.destino } })
    const ancho = Math.max(width, 560)
    return Plot.plot({
      title: titulo("Principales rutas de migración interna"),
      subtitle: subtitulo("Entidades de norte a sur · el grosor es el número de personas"),
      caption: pie("Datos de ejemplo. Cada arco une la entidad de origen con la de destino; las entidades van ordenadas por latitud."),
      style: ESTILO, width: ancho, height: Math.round(ancho * 0.42) + 110,
      marginTop: 20, marginRight: 30, marginBottom: 90, marginLeft: 30,
      x: { domain: lugares, type: "point", padding: 0.3, tickRotate: -35, label: null, tickSize: 0 },
      y: { axis: null, domain: [0, 1] },
      marks: [
        Plot.arrow(arcos, { x1: "a", x2: "b", y1: 0, y2: 0, bend: 90, headLength: 0, stroke: T.serie, strokeOpacity: 0.5,
          strokeWidth: (d) => d.valor / 2.2e4, tip: { ...GLOBO }, title: (d) => `${d.origen} → ${d.destino}\n${poblacion(d.valor)} personas` }),
        Plot.dot(lugares, { x: (d) => d, y: 0, r: 4.5, fill: T.gris.tinta }),
      ],
    })
  },
},
// ---------------------------------------------------------------- jerarquia
{
  id: "treemap", nombre: "Treemap", nivel: 2,
  familia: "diagrama", entrada: ["jerarquia"], funcion: ["jerarquia", "parte-todo"], forma: ["cuadrado"],
  estado: "plantilla", imagen: null,
  plantilla: { componente: "src/components/formas/treemap.js", galeria: "src/galeria/parte-todo.md#reparto",
    uso: "import {treemap} from \"../components/formas/index.js\"\ntreemap(filas, {ancho, grupo: (d) => d.region, parte: (d) => d.entidad, valor: (d) => d.num,\n  grupos: REGIONES, color: colorRegion, globo: g})" },
  pregunta: "¿Cómo se reparte un total entre muchas partes?",
  si: "Diez o más partes agrupadas en pocas categorías.", no: "Menos de 12 partes sin jerarquía: barras ordenadas.",
  datosForma: "[{grupo, rubro, valor}]",
  fuentes: [{ texto: "Ben Shneiderman (1990); galería de D3", url: "https://observablehq.com/@d3/treemap/2" }],
  datos: () => [["Alimentos", "Carne y pescado", 9.4], ["Alimentos", "Verduras y frutas", 6.2], ["Alimentos", "Cereales", 5.1], ["Alimentos", "Comida fuera", 7.8],
    ["Vivienda", "Renta", 8.9], ["Vivienda", "Luz y gas", 4.3], ["Vivienda", "Agua", 1.2], ["Transporte", "Gasolina", 6.6], ["Transporte", "Transporte público", 4.1],
    ["Transporte", "Vehículo", 3.2], ["Educación", "Colegiaturas", 3.9], ["Educación", "Útiles", 1.1], ["Salud", "Medicinas", 2.4], ["Salud", "Consultas", 1.9]]
    .map(([grupo, rubro, valor]) => ({ grupo, rubro, valor })),
  receta: function (datos, width) {
    const W = Math.max(width, 560), H = 440
    const col = gruposDeColor(new Set(datos.map((d) => d.grupo)), ["Alimentos", "Vivienda", "Transporte"])
    const raiz = d3.hierarchy(d3.group(datos, (d) => col.clase(d.grupo))).sum((d) => d.valor ?? 0).sort((a, b) => b.value - a.value)
    d3.treemap().size([W, H]).paddingInner(2).round(true)(raiz)
    const hojas = raiz.leaves().map((h) => ({ ...h.data, x0: h.x0, x1: h.x1, y0: h.y0, y1: h.y1, clase: h.parent.data[0], pct: (100 * h.value) / raiz.value }))
    // Recorta el rótulo al ancho del rectángulo (unos 6.4 px por letra a 11.5 px).
    const cabe = (s, px) => (s.length * 6.4 <= px ? s : `${s.slice(0, Math.max(1, Math.floor(px / 6.4) - 1))}…`)
    return Plot.plot({
      title: titulo("En qué gastan los hogares"),
      subtitle: subtitulo("Gasto corriente monetario · 2024"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). El área de cada rectángulo es su parte del gasto total."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      color: { domain: col.domain, range: col.range, legend: true },
      marks: [
        Plot.rect(hojas, { x1: "x0", x2: "x1", y1: "y0", y2: "y1", fill: "clase", fillOpacity: 0.92, tip: { ...GLOBO },
          title: (d) => `${d.clase}\n${d.rubro}\n${punto(d.pct, 1)} % del total` }),
        Plot.text(hojas.filter((d) => d.x1 - d.x0 > 60 && d.y1 - d.y0 > 34), { x: (d) => d.x0 + 6, y: (d) => d.y0 + 6,
          textAnchor: "start", lineAnchor: "top", text: (d) => `${cabe(d.rubro, d.x1 - d.x0 - 12)}\n${punto(d.pct, 1)} %`,
          fontSize: TIPO.etiqueta, fontWeight: 600, fill: T.gris.papel }),
      ],
    })
  },
},
{
  id: "icicle", nombre: "Icicle", nivel: 2,
  familia: "diagrama", entrada: ["jerarquia"], funcion: ["jerarquia"], forma: ["cuadrado", "barras"],
  estado: "plantilla", imagen: null, plantilla: { componente: "src/components/formas/icicle.js", galeria: "src/galeria/parte-todo.md#icicle",
    uso: "import {icicle} from \"../components/formas/icicle.js\"\nicicle(filas, {ancho, rama: (d) => d.fuente, parte: (d) => d.subfuente, valor: (d) => d.monto, ramas: FUENTES, color: colorFuente, globo: g})" },
  pregunta: "¿Qué contiene qué, y cuánto pesa cada parte?",
  si: "Dos o tres niveles de jerarquía y la estructura importa.", no: "Solo importan las proporciones: treemap.",
  datosForma: "[{nivel1, nivel2, valor}]",
  fuentes: [{ texto: "Kruskal y Landwehr (1983); galería de D3", url: "https://observablehq.com/@d3/icicle/2" }],
  datos: () => [["Trabajo", "Asalariado", 62], ["Trabajo", "Por cuenta propia", 21], ["Trabajo", "Negocio", 6], ["Transferencias", "Programas sociales", 7],
    ["Transferencias", "Jubilaciones", 9], ["Transferencias", "Remesas", 3], ["Renta", "Alquileres", 3], ["Renta", "Otros", 1]]
    .map(([nivel1, nivel2, valor]) => ({ nivel1, nivel2, valor })),
  receta: function (datos, width) {
    const W = Math.max(width, 560), H = 380
    const raiz = d3.hierarchy(d3.rollup(datos, (v) => d3.sum(v, (d) => d.valor), (d) => d.nivel1, (d) => d.nivel2))
      .sum((d) => (Array.isArray(d) ? d[1] : 0)).sort((a, b) => b.value - a.value)
    d3.partition().size([H, 3]).padding(1)(raiz) // alto H; tres columnas: raíz, nivel 1 y nivel 2
    // La raíz no se dibuja: el nivel 1 ocupa la mitad izquierda y el nivel 2 la derecha.
    const nodos = raiz.descendants().filter((d) => d.depth > 0).map((d) => ({ nombre: d.data[0], nivel: d.depth,
      rama: d.ancestors().at(-2).data[0], x1: ((d.depth - 1) * W) / 2, x2: (d.depth * W) / 2 - 1, y1: d.x0, y2: d.x1,
      pct: (100 * d.value) / raiz.value }))
    const col = gruposDeColor(new Set(nodos.map((d) => d.rama)), ["Trabajo", "Transferencias", "Renta"])
    return Plot.plot({
      title: titulo("De dónde viene el ingreso de los hogares"),
      subtitle: subtitulo("Ingreso corriente · 2024 · de la fuente al tipo"),
      caption: pie("INEGI, ENIGH 2024 (datos de ejemplo). El alto de cada bloque es su parte del ingreso total."),
      style: ESTILO, width: W, height: H, margin: 0,
      x: { type: "identity", axis: null }, y: { type: "identity", axis: null },
      color: { domain: col.domain, range: col.range, legend: true },
      marks: [
        Plot.rect(nodos, { x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: (d) => col.clase(d.rama),
          fillOpacity: (d) => (d.nivel === 1 ? 1 : 0.72), tip: { ...GLOBO }, title: (d) => `${d.nombre}\n${punto(d.pct, 1)} % del total` }),
        Plot.text(nodos.filter((d) => d.y2 - d.y1 > 18), { x: (d) => d.x1 + 8, y: (d) => (d.y1 + d.y2) / 2, textAnchor: "start",
          text: (d) => `${d.nombre} · ${punto(d.pct, 1)} %`, fontSize: TIPO.etiqueta, fill: T.gris.papel, fontWeight: 600 }),
      ],
    })
  },
},
])
