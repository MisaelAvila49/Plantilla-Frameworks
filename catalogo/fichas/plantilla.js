// ======================================================================
// catalogo/fichas/plantilla.js
// Fichas de los componentes de la Plantilla (src/components/formas/*.js) que
// no tienen ficha equivalente en base.js. Las formas que ya la tenían
// (barras apiladas, coropleta, crestas, dumbbell, heatmap, líneas, lollipop,
// mosaico, pendiente, picos, pirámide, sankey, treemap, waffle) llevan su
// bloque `plantilla` en base.js y no se repiten aquí.
//
// Estos componentes dependen de Framework (FileAttachment, paleta.js, globo.js),
// así que su vista previa es una MINIATURA recortada de la galería construida
// (miniaturas/<id>.png y <id>-oscuro.png), no una receta viva. La excepción es
// el mapa de categorías, que se dibuja con Plot como las fichas de base.js.
// Los textos (pregunta, cuándo sí y cuándo no) salen de la cabecera de cada
// componente; la llamada mínima, de la sección de la galería que lo usa.
//
// El contrato completo de una ficha está al inicio de fichas/base.js.
// ======================================================================
;(function () {
  const IMPORTA = (nombre) => `import {${nombre}} from "../components/formas/index.js"\n`
  const DISPATCH = {
    jun2: "https://www.datawrapper.de/blog/data-vis-dispatch-june-2-2026-extreme-weather-gambling-and-the-swiss-alps",
    sep29: "https://www.datawrapper.de/blog/data-vis-dispatch-september-29-2026-marine-heatwaves-interactive-maps-and-the-wnba",
    oct6: "https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting",
    oct20: "https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps",
    oct27: "https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices",
    nov3: "https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge",
    nov10: "https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index",
  }
  // Ficha con miniatura: los campos comunes se rellenan aquí.
  const conMiniatura = (f) => ({
    datos: null, receta: null, imagen: `miniaturas/${f.id}.png`, estado: "plantilla", fuentes: [], ...f,
  })

  window.FICHAS = (window.FICHAS || []).concat([
    // ------------------------------------------------------------ comparación y tiempo
    conMiniatura({
      id: "destacadas", nombre: "Líneas con grupo destacado", nivel: 1,
      familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo", "comparacion"], forma: ["linea"],
      pregunta: "¿Dónde queda un grupo respecto de todos los demás, año tras año?",
      si: "Muchas series como contexto en gris y un grupo elegido en color; el tiempo puede correr hacia abajo para una columna angosta.",
      no: "Menos de cinco puntos por serie (pendiente o dumbbell) o más de unas diez series destacadas a la vez.",
      datosForma: "[{tiempo, valor, serie}]  destacada(serie) elige el grupo",
      plantilla: { componente: "src/components/formas/destacadas.js", galeria: "src/galeria/tiempo.md#destacadas",
        uso: IMPORTA("destacadas") + `destacadas(series, {ancho, tiempo: (d) => d.anio, valor: (d) => d.saldo, serie: (d) => d.entidad,
  destacada: (s) => s === "Jalisco", referencia: {valor: 0, texto: "Saldo cero"}, dominio: DOMINIO_SALDO,
  vertical: true, rotuloValor: "Saldo, en porcentaje de la población", globo: g})` },
      fuentes: [{ texto: "The New York Times, Data Vis Dispatch del 10 de noviembre de 2026", url: DISPATCH.nov10 }],
    }),
    conMiniatura({
      id: "riel", nombre: "Riel de trayectoria con flecha final", nivel: 2,
      familia: "grafica", entrada: ["serie-tiempo"], funcion: ["tiempo"], forma: ["linea", "puntos"],
      pregunta: "¿Cómo se movió cada grupo en tres o más cortes y hacia dónde terminó?",
      si: "De tres a cinco cortes y hasta unas quince unidades; importa si el valor dio la vuelta.",
      no: "Series largas (líneas), más de unas quince unidades (mosaico o lollipop) o magnitudes sin un eje común.",
      datosForma: "[{unidad, corte, valor}]",
      plantilla: { componente: "src/components/formas/riel.js", galeria: "src/galeria/tiempo.md#riel",
        uso: IMPORTA("riel") + `riel(filas, {ancho, unidad: (d) => d.grupo, corte: (d) => d.corte, valor: (d) => d.pct,
  cortes: CORTES, dominio: DOMINIO_RIEL, color: colorDe, rotuloEje: "Porcentaje que cumple la condición", globo: g})` },
      fuentes: [{ texto: "The New York Times, Data Vis Dispatch del 27 de octubre de 2026", url: DISPATCH.oct27 }],
    }),
    conMiniatura({
      id: "areas-superpuestas", nombre: "Áreas superpuestas en paneles", nivel: 2,
      familia: "grafica", entrada: ["categoria-series", "serie-tiempo"], funcion: ["comparacion", "tiempo"], forma: ["area"],
      pregunta: "¿Cómo evolucionan dos series en varios grupos a la vez, y en cuáles se separan?",
      si: "Dos series por grupo a lo largo del tiempo, con la misma escala vertical en todos los paneles.",
      no: "Más de dos series por panel, más de unos diez paneles o grupos de magnitudes muy distintas.",
      datosForma: "[{tiempo, valor, serie, panel}]",
      plantilla: { componente: "src/components/formas/areas-superpuestas.js", galeria: "src/galeria/tiempo.md#areas",
        uso: IMPORTA("areasSuperpuestas") + `areasSuperpuestas(filas, {ancho, tiempo: (d) => d.anio, valor: (d) => d.personas,
  serie: (d) => d.serie, panel: (d) => d.entidad, series: ["salen", "llegan"], color: tinta, globo: g})` },
      fuentes: [{ texto: "Bloomberg, Data Vis Dispatch del 3 de noviembre de 2026", url: DISPATCH.nov3 }],
    }),
    // ------------------------------------------------------------ distribución
    conMiniatura({
      id: "franjas-mediana", nombre: "Franjas con mediana", nivel: 1,
      familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion", "comparacion"], forma: ["puntos"],
      pregunta: "¿Qué tan parejo es un grupo por dentro?",
      si: "Un renglón por grupo (entidad) con sus unidades (municipios) como puntos, la mitad central y la mediana.",
      no: "Grupos con menos de unas ocho unidades: basta listar los valores.",
      datosForma: "[{grupo, valor, id}]",
      plantilla: { componente: "src/components/formas/franjas.js", galeria: "src/galeria/distribucion.md#franjas",
        uso: IMPORTA("franjas") + `franjas(filas, {ancho, grupo: (d) => d.entidad, valor: (d) => d.pct, id: (d) => d.unidad,
  color: (d) => SIG.color(d.s), dominioX: [0, 100], rotuloX: "Porcentaje", globo: g})` },
    }),
    conMiniatura({
      id: "enjambre-burbujas", nombre: "Enjambre de burbujas", nivel: 2,
      familia: "trazado", entrada: ["distribucion"], funcion: ["distribucion"], forma: ["circulo"],
      pregunta: "¿Dónde cae cada unidad sobre el indicador y cuánto pesa?",
      si: "Hasta unas 500 unidades con su población: la posición es el indicador y el área, las personas.",
      no: "Más de unas 500 unidades o indicadores que no comparten universo.",
      datosForma: "[{id, nombre, valor, tamano}]",
      plantilla: { componente: "src/components/formas/enjambre.js", galeria: "src/galeria/distribucion.md#enjambre",
        uso: IMPORTA("enjambre") + `enjambre(filas, {ancho, valor: (d) => d.pct, tamano: (d) => d.den, id: (d) => d.cveMun, nombre: (d) => d.nombre,
  destacado: (d) => d.region === "Sur", dominio: DOMINIO_ENJAMBRE, tamanoMax: TAMANO_MAXIMO,
  referencia: {valor: nacional, texto: "Promedio nacional"}, globo: g})` },
      fuentes: [{ texto: "The New York Times, Data Vis Dispatch del 3 de noviembre de 2026", url: DISPATCH.nov3 }],
    }),
    // ------------------------------------------------------------ unidades
    conMiniatura({
      id: "fraccion", nombre: "Fracción de figuras", nivel: 1,
      familia: "grafica", entrada: ["partes", "categoria-valor"], funcion: ["unidades", "parte-todo"], forma: ["figura"],
      pregunta: "¿Cuántas de cada cien?",
      si: "De uno a cuatro grupos; la base cambia sola a 1,000 o 10,000 si alguna proporción es menor a 1 de cada 100.",
      no: "Más de cuatro grupos o comparar décimas (dumbbell).",
      datosForma: "[{grupo, valor}]  valor de 0 a 100",
      plantilla: { componente: "src/components/formas/fraccion.js", galeria: "src/galeria/unidades.md#fraccion",
        uso: IMPORTA("fraccion") + `fraccion(filas, {ancho, etiqueta: (d) => d.grupo, valor: (d) => d.pct, color: () => P.serie,
  acomodo: "rejilla", rotulos: {cumple: "Cumplen la condición", resto: "No la cumplen"}, globo: g})` },
      fuentes: [{ texto: "Reuters, Data Vis Dispatch del 20 de octubre de 2026", url: DISPATCH.oct20 }],
    }),
    conMiniatura({
      id: "multitud", nombre: "Multitud con subgrupos", nivel: 2,
      familia: "grafica", entrada: ["conteo"], funcion: ["unidades", "parte-todo"], forma: ["figura"],
      pregunta: "De un total de personas, ¿cuántas están en cada situación?",
      si: "De dos a cuatro subgrupos que se pueden contar; cada figura vale un número fijo de personas.",
      no: "Más de cuatro subgrupos, una proporción menor a una figura (fracción) o unidades que no se cuentan.",
      datosForma: "[{grupo, personas}]",
      plantilla: { componente: "src/components/formas/multitud.js", galeria: "src/galeria/unidades.md#multitud",
        uso: IMPORTA("multitud") + `multitud(filas, {ancho, grupo: (d) => d.situacion, valor: (d) => d.personas,
  color: (d) => colorDe(d.situacion), acomodo: "mancha", globo: g})` },
      fuentes: [{ texto: "Reuters, «Finding closure», Data Vis Dispatch del 29 de septiembre de 2026", url: DISPATCH.sep29 }],
    }),
    conMiniatura({
      id: "histograma-unidades", nombre: "Histograma de unidades", nivel: 2,
      familia: "grafica", entrada: ["conteo", "distribucion"], funcion: ["distribucion", "unidades"], forma: ["figura"],
      pregunta: "¿Cómo se reparten las personas a lo largo de una magnitud y dónde cae la mitad?",
      si: "Una magnitud con seis clases o más (edad, grados) y personas que se pueden contar.",
      no: "Menos de unas seis clases (pila) o porcentajes en el eje vertical.",
      datosForma: "[{valor, peso}]  peso = personas que representa la fila",
      plantilla: { componente: "src/components/formas/histograma-unidades.js", galeria: "src/galeria/unidades.md#histograma-unidades",
        uso: IMPORTA("histogramaUnidades") + `histogramaUnidades(filas, {ancho, valor: (d) => d.edad, peso: (d) => d.personas, clase: 5, dominio: [0, 100],
  rotuloX: "Edad en años cumplidos", rotuloMediana: (m) => \`Edad mediana: \${m} años\`, globo: g})` },
      fuentes: [{ texto: "Domestic Data Streamers y Cedra, Data Vis Dispatch del 27 de octubre de 2026", url: DISPATCH.oct27 }],
    }),
    conMiniatura({
      id: "pila", nombre: "Pila de figuras", nivel: 1,
      familia: "grafica", entrada: ["conteo"], funcion: ["unidades", "comparacion", "tiempo"], forma: ["figura"],
      pregunta: "¿Cuánto más o cuánto menos hay ahora que antes?",
      si: "De dos a seis cantidades que se cuentan, con la diferencia entre la primera y la última anotada.",
      no: "Tasas o porcentajes, o más de seis cantidades (histograma de unidades o líneas).",
      datosForma: "[{etiqueta, personas}]  en orden",
      plantilla: { componente: "src/components/formas/pila.js", galeria: "src/galeria/unidades.md#pila",
        uso: IMPORTA("pila") + `pila(filas, {ancho, etiqueta: (d) => String(d.anio), valor: (d) => d.personas, color: () => P.serie,
  diferencia: "relativo", colorCambio: SIG.color, globo: g})` },
      fuentes: [{ texto: "CORRECTIV, «The Pancake Index», Data Vis Dispatch del 10 de noviembre de 2026", url: DISPATCH.nov10 }],
    }),
    conMiniatura({
      id: "escalones", nombre: "Escalones con umbral", nivel: 2,
      familia: "grafica", entrada: ["intervalos", "categoria-valor"], funcion: ["distribucion", "comparacion"], forma: ["figura", "barras"],
      pregunta: "¿En qué lugar queda cada grupo con orden, y qué parte pasa un umbral?",
      si: "Grupos con orden (edades, deciles), con su valor, la banda en que se mueven y un umbral que cruza todos.",
      no: "Grupos sin orden (lollipop) o más de unos diez escalones.",
      datosForma: "[{grupo, valor, bajo, alto}]",
      plantilla: { componente: "src/components/formas/escalones.js", galeria: "src/galeria/unidades.md#escalones",
        uso: IMPORTA("escalones") + `escalones(filas, {ancho, grupo: (d) => d.grupo, valor: (d) => d.pct, bajo: (d) => d.q1, alto: (d) => d.q3,
  dominio: [0, 100], umbral: 30, encima: (d) => d.parteSobre, globo: g})` },
      fuentes: [{ texto: "FlowingData, Data Vis Dispatch del 27 de octubre de 2026", url: DISPATCH.oct27 }],
    }),
    conMiniatura({
      id: "unidades-espejo", nombre: "Unidades a ambos lados del eje", nivel: 2,
      familia: "grafica", entrada: ["conteo", "categoria-series"], funcion: ["unidades", "comparacion", "distribucion"], forma: ["cuadrado"],
      pregunta: "¿Cuántas personas hay de cada lado (sexo, situación) en cada categoría ordenada?",
      si: "Dos lados y categorías con orden (edad, año); cada cuadro vale un número fijo de personas.",
      no: "Más de dos lados, más de unas diez categorías sin orden o tasas.",
      datosForma: "[{categoria, lado, personas}]",
      plantilla: { componente: "src/components/formas/unidades-espejo.js", galeria: "src/galeria/unidades.md#espejo",
        uso: IMPORTA("unidadesEspejo") + `unidadesEspejo(filas, {ancho, categoria: (d) => d.edad, lado: (d) => d.lado, valor: (d) => d.personas,
  lados: ["Mujeres", "Hombres"], categorias: EDADES, color, globo: g})` },
      fuentes: [{ texto: "The New York Times, Data Vis Dispatch del 10 de noviembre de 2026", url: DISPATCH.nov10 }],
    }),
    // ------------------------------------------------------------ parte de un todo
    conMiniatura({
      id: "apiladas-flujo", nombre: "Barras apiladas unidas por flujos", nivel: 2,
      familia: "grafica", entrada: ["partes"], funcion: ["parte-todo", "tiempo"], forma: ["barras", "area"],
      pregunta: "¿Cómo se recompone un total entre dos o más cortes?",
      si: "Hasta cinco categorías en varios cortes independientes; las cintas unen siempre la misma categoría.",
      no: "Datos de transición reales entre categorías (aluvial), más de cinco categorías o más de unos ocho cortes.",
      datosForma: "[{corte, categoria, valor}]",
      plantilla: { componente: "src/components/formas/apiladas-flujo.js", galeria: "src/galeria/flujo.md#cortes",
        uso: IMPORTA("apiladasFlujo") + `apiladasFlujo(filas, {ancho, corte: (d) => d.corte, categoria: (d) => d.motivo, valor: (d) => d.personas,
  categorias: MOTIVOS, color: colorMotivo, destacar: "Violencia", globo: g, globoCinta: gCinta})` },
      fuentes: [{ texto: "The Economist, Data Vis Dispatch del 6 de octubre de 2026", url: DISPATCH.oct6 }],
    }),
    conMiniatura({
      id: "ternario", nombre: "Triángulo ternario con estelas", nivel: 3,
      familia: "trazado", entrada: ["tres-partes"], funcion: ["parte-todo", "tiempo"], forma: ["triangulo", "puntos"],
      pregunta: "¿Hacia cuál de tres partes se movió la composición de cada unidad?",
      si: "Tres partes que suman un todo, en dos o más cortes, con una unidad destacada.",
      no: "Más de tres partes, partes que no suman un todo o comparar cifras exactas (van en la tabla).",
      datosForma: "[{unidad, corte, partes: [a, b, c]}]",
      plantilla: { componente: "src/components/formas/ternario.js", galeria: "src/galeria/parte-todo.md#ternario",
        uso: IMPORTA("ternario") + `ternario(filas, {ancho: Math.min(ancho, 900), unidad: (d) => d.entidad, corte: (d) => d.corte,
  partes: (d) => d.partes, nombres: MOTIVOS, color: colorMotivo, destacada: "Jalisco", globo: g})` },
      fuentes: [{ texto: "USAFacts, reseñado por FlowingData, Data Vis Dispatch del 2 de junio de 2026", url: DISPATCH.jun2 }],
    }),
    conMiniatura({
      id: "silueta-puntos", nombre: "Silueta rellena de puntos", nivel: 2,
      familia: "grafica", entrada: ["conteo"], funcion: ["unidades", "parte-todo"], forma: ["puntos", "mapa"],
      pregunta: "¿Cómo se reparte un total contable entre categorías, dentro de una figura con significado?",
      si: "Hasta cinco o seis categorías; cada punto vale N personas y la silueta significa algo para el tema.",
      no: "Más de seis categorías, una categoría menor a un punto sin rótulo o una silueta que solo adorna.",
      datosForma: "[{categoria, personas}]  más la silueta (GeoJSON)",
      plantilla: { componente: "src/components/formas/silueta-puntos.js", galeria: "src/galeria/mapas.md#silueta",
        uso: IMPORTA("siluetaPuntos") + `siluetaPuntos(silueta, datos, {ancho, categoria: (d) => d.situacion, valor: (d) => d.personas,
  color: (d) => colorSit(d.situacion), orden: SITUACIONES, globo: g})` },
      fuentes: [{ texto: "Georgios Karamanis, «One frog, 8,018 species», Data Vis Dispatch del 20 de octubre de 2026", url: DISPATCH.oct20 }],
    }),
    conMiniatura({
      id: "mosaico-fracciones", nombre: "Mosaico de fracciones", nivel: 2,
      familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion", "parte-todo"], forma: ["puntos", "cuadrado"],
      pregunta: "¿Qué parte de la población cumple la condición en cada entidad, con el mismo peso visual?",
      si: "Una proporción por entidad, contada como «k de cada 100» dentro de cada cuadro del mosaico.",
      no: "Comparar décimas entre entidades (tabla o lollipop) o valores que no son parte de un todo.",
      datosForma: "Map(clave → {pct})",
      plantilla: { componente: "src/components/formas/mosaico-fracciones.js", galeria: "src/galeria/parte-todo.md#fracciones",
        uso: IMPORTA("mosaicoFracciones") + `mosaicoFracciones(valores, {ancho: Math.min(ancho, 980), valor: (d) => d.pct, destacar: "14",
  rotulos: {cumple: "Cumplen la condición", resto: "No la cumplen"}, globo: g})` },
      fuentes: [{ texto: "The European Correspondent, Data Vis Dispatch del 27 de octubre de 2026", url: DISPATCH.oct27 }],
    }),
    // ------------------------------------------------------------ mapas
    conMiniatura({
      id: "mosaico-triangulos", nombre: "Mosaico de triángulos partidos", nivel: 2,
      familia: "mapa", entrada: ["geo-valor", "dos-cortes"], funcion: ["geolocalizacion", "comparacion", "tiempo"], forma: ["triangulo", "cuadrado"],
      pregunta: "¿Cómo se comparan dos cortes o dos grupos en las 32 entidades a la vez?",
      si: "Dos valores por entidad con la misma escala; un cuadro de dos tonos salta a la vista.",
      no: "Más de dos valores por entidad o conteos (la rampa es de tasas).",
      datosForma: "Map(clave → {a, b})",
      plantilla: { componente: "src/components/formas/mosaico-triangulos.js", galeria: "src/galeria/comparacion.md#mosaico-sexo",
        uso: IMPORTA("mosaicoTriangulos") + `mosaicoTriangulos(valores, {ancho: Math.min(ancho, 980), a: (d) => d.m?.pct ?? null, b: (d) => d.h?.pct ?? null,
  escala: rampaTema(DOMINIO_SEXO), nombreA: "Mujeres", nombreB: "Hombres", tituloLeyenda: "Porcentaje", globo: g})` },
      fuentes: [{ texto: "The Wall Street Journal, Data Vis Dispatch del 20 de octubre de 2026", url: DISPATCH.oct20 }],
    }),
    conMiniatura({
      id: "flechas-cambio", nombre: "Mapa de flechas inclinadas", nivel: 3,
      familia: "mapa", entrada: ["geo-puntos", "dos-cortes"], funcion: ["geolocalizacion", "tiempo"], forma: ["linea", "mapa"],
      pregunta: "¿En qué unidades subió o bajó un indicador entre dos cortes, y cuánto?",
      si: "Cientos o miles de municipios; la inclinación y el largo crecen con el cambio y se leen como un viento.",
      no: "Niveles (coropleta), conteos (picos o burbujas), más de unas 2,500 unidades o ediciones no comparables.",
      datosForma: "[{lon, lat, cambio, casos}]",
      plantilla: { componente: "src/components/formas/flechas-cambio.js", galeria: "src/galeria/mapas.md#flechas-cambio",
        uso: IMPORTA("flechasCambio") + `flechasCambio(geo, unidades, {ancho, posicion: (d) => [d.lon, d.lat], cambio: (d) => d.cambio,
  signo: (d) => d.s, sig: SIG, limite: LIMITE_FLECHAS, nombre: (d) => d.nombre, pocos: (d) => d.casos < MIN_CASOS, globo: g})` },
      fuentes: [{ texto: "The Washington Post, Data Vis Dispatch del 10 de noviembre de 2026", url: DISPATCH.nov10 }],
    }),
    conMiniatura({
      id: "semitonos", nombre: "Mapa de semitonos", nivel: 2,
      familia: "mapa", entrada: ["geo-puntos"], funcion: ["geolocalizacion", "distribucion"], forma: ["hexagono", "puntos"],
      pregunta: "¿Dónde se concentra una cantidad dentro del territorio?",
      si: "Una cantidad o densidad con centroides ponderados; las concentraciones se ven como manchas.",
      no: "Tasas o porcentajes (coropleta) o conteos que se comparan lugar por lugar (picos).",
      datosForma: "[{lon, lat, valor, area}]",
      plantilla: { componente: "src/components/formas/semitonos.js", galeria: "src/galeria/mapas.md#semitonos",
        uso: IMPORTA("semitonos") + `semitonos(geo, celdas, {ancho, posicion: (c) => [c.lon, c.lat], valor: (c) => c.personas, area: (c) => c.area,
  tope: TOPE_DENSIDAD, tituloLeyenda: "Personas por km²", marcasLeyenda: [10, 50, 150, 300], globo: g})` },
      fuentes: [{ texto: "IGN de Francia, #30DayMapChallenge, Data Vis Dispatch del 3 de noviembre de 2026", url: DISPATCH.nov3 }],
    }),
    // ------------------------------------------------------------ flujo
    conMiniatura({
      id: "aluvial", nombre: "Aluvial entre dos lados", nivel: 2,
      familia: "diagrama", entrada: ["origen-destino"], funcion: ["flujo"], forma: ["area"],
      pregunta: "¿Quién envía y quién recibe?",
      si: "La fuente observa a las mismas personas en los dos lados (de dónde salió y a dónde llegó cada una).",
      no: "Dos levantamientos independientes (barras apiladas unidas por flujos) o más de unos nueve nodos por lado.",
      datosForma: "[{origen, destino, valor, casos}]",
      plantilla: { componente: "src/components/formas/aluvial.js", galeria: "src/galeria/flujo.md#aluvial",
        uso: IMPORTA("aluvial") + `aluvial(od, {ancho, origen: (d) => d.origen, destino: (d) => d.destino, valor: (d) => d.personas,
  maximo: 9, destacar: {lado: "origen", nombre: "Jalisco"}, color: tono, globo: g, globoNodo: gNodo})` },
      fuentes: [{ texto: "Reuters, Data Vis Dispatch del 27 de octubre de 2026", url: DISPATCH.oct27 }],
    }),
    conMiniatura({
      id: "flechas", nombre: "Mapa de flujos con flechas anchas", nivel: 3,
      familia: "mapa", entrada: ["origen-destino"], funcion: ["flujo", "geolocalizacion"], forma: ["linea", "mapa"],
      pregunta: "¿De dónde a dónde se mueven las personas sobre el territorio?",
      si: "Hasta unos 12 flujos en color, con un lugar elegido; el ancho es el número de personas.",
      no: "Tasas o porcentajes, flujos entre lugares casi pegados o más de unos 12 flujos en color.",
      datosForma: "[{origen, destino, personas, casos}]",
      plantilla: { componente: "src/components/formas/flechas.js", galeria: "src/galeria/flujo.md#flechas",
        uso: IMPORTA("flechas") + `flechas(geo, od, {ancho, origen: (d) => d.cveOrigen, destino: (d) => d.cveDestino, valor: (d) => d.personas,
  foco: "14", sentido: "llegan", maximo: 12, tope: TOPE_FLUJO, globo: g})` },
      fuentes: [{ texto: "Datawrapper, flechas en mapas localizadores (11 de junio de 2026)", url: "https://www.datawrapper.de/blog/fifa-world-cup-locator-map-arrows" }],
    }),
    conMiniatura({
      id: "barra-mapa", nombre: "Flujos de una barra al mapa", nivel: 3,
      familia: "mapa", entrada: ["origen-destino"], funcion: ["flujo", "geolocalizacion", "parte-todo"], forma: ["barras", "mapa"],
      pregunta: "¿De qué se compone un total y a qué lugares llega cada parte?",
      si: "Un lugar de salida, hasta unas cuatro categorías y hasta 12 destinos con cinta propia.",
      no: "Más de cuatro categorías, más de 12 destinos con cinta o tasas (el ancho es un conteo).",
      datosForma: "[{origen, destino, categoria, personas}]",
      plantilla: { componente: "src/components/formas/barra-mapa.js", galeria: "src/galeria/flujo.md#barra-mapa",
        uso: IMPORTA("barraMapa") + `barraMapa(geo, odm, {ancho, origen: (d) => d.cveOrigen, destino: (d) => d.cveDestino, categoria: (d) => d.motivo,
  valor: (d) => d.personas, foco: "14", categorias: MOTIVOS, destacada: "Violencia", maximo: 8, color: tono, globo: g, globoBarra: gBarra})` },
      fuentes: [{ texto: "The Guardian, Data Vis Dispatch del 3 de noviembre de 2026", url: DISPATCH.nov3 }],
    }),
    // ------------------------------------------------------------ mapa de categorías (receta viva)
    {
      id: "mapa-categorias", nombre: "Mapa de categorías", nivel: 1,
      familia: "mapa", entrada: ["geo-valor"], funcion: ["geolocalizacion", "comparacion"], forma: ["mapa"],
      estado: "plantilla", imagen: null,
      pregunta: "¿En qué clase cae cada lugar?",
      si: "Una clasificación con tres clases y gris (sube, baja, sin cambio claro; arriba o abajo de una referencia).",
      no: "Una magnitud continua (coropleta) o más de tres clases con color: el cuarto tono falla en deuteranopía.",
      datosForma: "[{id, clase}]  id igual al del geojson",
      plantilla: { componente: "src/components/formas/mapa-plano.js", galeria: "src/galeria/mapas.md#mapa-categorias",
        uso: IMPORTA("mapaPlano") + `mapaPlano(geo, {ancho, dato: (f) => porClave.get(ISO_A_CVE.get(f.properties.id)) ?? null,
  color: (d) => (d ? SIG.color(d.s) : P.sinDato), encuadre: dentro, atenuar: (f) => !cumple(f), globo: g})` },
      fuentes: [],
      datos: () => ENT.map((e) => {
        const dif = e.internet - 68
        return { id: e.id, nombre: e.nombre, valor: e.internet, dif,
          clase: dif >= 4 ? "Arriba del promedio" : dif <= -4 ? "Abajo del promedio" : "Dentro del margen" }
      }),
      receta: function (datos, width) {
        const CLASES = ["Abajo del promedio", "Arriba del promedio", "Dentro del margen"]
        const porId = new Map(datos.map((d) => [d.id, d]))
        const ancho = Math.max(width, 560)
        return Plot.plot({
          title: titulo("Hogares con internet frente al promedio nacional"),
          subtitle: subtitulo("2024 · promedio nacional: 68 % · margen de ±4 puntos"),
          caption: pie("INEGI, ENDUTIH 2024 (datos de ejemplo). Cada entidad se pinta según su clase: rojo abajo, azul arriba y gris dentro del margen."),
          style: ESTILO, width: ancho, height: Math.round(ancho * 0.66),
          projection: { type: "mercator", domain: entidades },
          color: { domain: CLASES, range: [T.cambio.desfavorable, T.cambio.favorable, T.gris.trazo], legend: true },
          marks: [
            Plot.geo(entidades, { fill: (f) => porId.get(f.id)?.clase, stroke: "none" }),
            Plot.geo(entidades, Plot.pointer(Plot.centroid({ stroke: T.gris.tinta, strokeWidth: 2.5, fill: "none" }))),
            Plot.tip(entidades.features, Plot.pointer(Plot.centroid({ ...GLOBO,
              title: (f) => { const d = porId.get(f.id)
                return `${f.properties.nombre}\n${d.clase}\n${formatear(d.valor)} · ${diferencia(d.dif)} puntos` } }))),
          ],
        })
      },
    },
  ])
})()
