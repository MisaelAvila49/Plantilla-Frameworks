// src/components/mapa-flujos.js
// MAPA DE FLUJOS A PANTALLA COMPLETA (src/mapa.md): de qué entidad a qué
// entidad cambiaron de residencia las personas, con flechas anchas sobre el
// mapa, una tarjeta de lectura flotante, una leyenda flotante y un panel a la
// derecha con dos pestañas («Filtros» e «Información»). Dibuja con
// `flechas()` (formas/flechas.js) y `mapaBase()`, en SVG propio. Sin MapLibre.
//
// ------------------------------------------------------------------------
// DECISIONES DEL FLUJO DE USO (detalle y porqué en docs/mapa-flujos.md)
//
//  1. Llegada, «Todo el país». Las flechas mayores van en el tono de tema
//     (no hay sentido que distinguir, así que ni rojo ni azul) y el resto en
//     gris tenue. La tarjeta dice QUÉ se cuenta en una frase generada con los
//     filtros, da el total en grande (único acento rojo) y una sola
//     instrucción: «Toca un estado…». Sin párrafos.
//  2. Estado elegido. Clic o Enter en el mapa, o el selector «Entidad»: los
//     dos escriben en el MISMO panel, así que siempre coinciden. El control
//     «Salen | Llegan» vive en la tarjeta (es la decisión siguiente y tiene
//     que verse) y se refleja en el selector «Sentido» del panel. Rojo es
//     «salen» y azul «llegan» (significado declarado abajo). La tarjeta da
//     salen, llegan y saldo, y los cinco destinos u orígenes mayores. Pasar
//     el cursor por un renglón resalta su flecha y al revés.
//  3. Flecha. Globo al cursor con `globo()`. Clic, Enter o espacio la FIJA:
//     las demás se atenúan y la tarjeta muestra el par con dos botones
//     explícitos para seguir el flujo desde el OTRO extremo (el destino si se
//     ven salidas o el país, el origen si se ven llegadas). Nada cambia de
//     modo sin que el lector lo pida. Escape o «Soltar» la sueltan.
//  4. La vista vive en la URL (?ent=12&sentido=llegan&fija=12-15…), solo con
//     lo que difiere de la vista inicial. Al cargar se lee.
//  5. Pocos casos. Una flecha de color con menos de MIN_CASOS casos va
//     punteada y una gris no se dibuja. Si TODAS las de color son poco
//     precisas, la tarjeta lo dice y ofrece botones para ampliar la
//     selección. Si no queda ningún flujo, un aviso sobre el mapa dice por
//     qué y ofrece los mismos botones: el mapa nunca queda en blanco.
//  6. Comparar con. Es un control distinto de «Entre quiénes» (lección 100):
//     «Entre quiénes» FILTRA las flechas; «Comparar con» abre un bloque junto
//     a la tarjeta que responde «¿este grupo está más representado entre
//     quienes se mueven?». El grupo elegido en «Entre quiénes» se resalta en
//     ese bloque, no lo filtra (filtrarlo daría 100 de cada 100).
//  7. Disposición. Primero se prueba «esquina»: el país ocupa todo el alto
//     de la zona, la tarjeta flota en su esquina noreste (Texas, sin tierra
//     mexicana) y la leyenda en la suroeste (océano); se usa solo si un
//     lienzo rasterizado confirma que ninguna de las dos tapa un estado. Es
//     el de 1920 px sin comparación. Si no cabe (1366 px, o con la
//     comparación abierta), los dos de siempre. Escritorio ancho: tarjeta,
//     comparación y leyenda van en una columna a la derecha del mapa,
//     arriba como los filtros, y el mapa
//     se centra en el resto con un tope de ancho (TOPE_MAPA). Escritorio de
//     1366 px: el país se encuadra DEBAJO de una banda fija (BANDA_REM) donde
//     flotan la tarjeta y la comparación, para que no tapen Baja California
//     ni Sonora, y se centra en lo que queda. Se elige el acomodo que deja el
//     mapa más grande. Ni la banda ni la columna cambian al elegir un estado
//     o una flecha, así que el mapa no brinca. La banda solo crece si la
//     comparación no cabe al lado de la tarjeta. Móvil o columna angosta: mapa, leyenda, tarjeta
//     y panel uno debajo de otro, nada oculto.
//
// ------------------------------------------------------------------------
// DATOS (src/components/muestra-mapa.js)
//   flujos: {periodo, causa, grupo, edad, sexo, origen, destino, personas, casos}
//   poblacion: {periodo, entidad, grupo, edad, sexo, poblacion, noMigrante}
// Causa, edad y sexo PARTEN el total: «Todas las causas», «Todas las edades»
// y «Mujeres y hombres» se obtienen sumando esas filas aquí. Los grupos de
// población son subconjuntos que se traslapan (hablar una lengua indígena y
// considerarse indígena, por ejemplo) y NUNCA se suman entre sí: cada cifra
// de grupo sale de sus propias filas.
// ------------------------------------------------------------------------

import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, significado, alCambiarModo} from "./paleta.js";
import {entero, pct, deCada100} from "./formato.js";
import {globo, globoEn, ocultarGlobo} from "./globo.js";
import {panel, campo} from "./filtros.js";
import {ENTIDADES, POR_CVE, nombreEntidad, proyeccionMx} from "./geografia.js";
import {proyectar} from "./formas/mapa-base.js";
import {rebobinar} from "./formas/mapa-plano.js";
import {flechas} from "./formas/flechas.js";
import {verificado, tablaDatos} from "./seccion.js";
import {VERIFICA_MUESTRA} from "./muestra.js";
import {MIN_CASOS} from "./muestra-flujos.js";
import {TOPE_FLUJO} from "./muestra-mapa.js";

// Significado del color en este mapa (R95): rojo, las personas que salen de
// la entidad elegida. Azul, las que llegan. Gris, los demás flujos. Sin
// entidad elegida no hay sentido y las flechas van en el tono de tema.
export const SIG_MAPA = significado({rojo: "salen", azul: "llegan", gris: "otros flujos", desfavorable: "baja"});

// Alto de la banda superior donde flotan la tarjeta y la comparación, en rem.
const BANDA_REM = 17;
// Columna de lectura (pantallas anchas), tope de ancho del mapa y proporción
// ancho/alto del país con la proyección del mapa base (medida: 1.55 a 1.6).
const COLUMNA_REM = 25, TOPE_MAPA = 1300, ASPECTO_MAPA = 1.55;
// Ancho en el que la página pasa a una columna aunque el menú esté abierto.
const ANCHO_APILADO = 860;
// Corte del layout de Framework (expresión literal de layout.css): por
// debajo, el menú lateral se oculta y la página es de teléfono.
const CORTE_FRAMEWORK = "(min-width: calc(640px + 6rem + 272px))";
// Dominio FIJO del mini gráfico «De cada 100…»: de 0 a 50 de cada 100. Los
// valores mayores se dibujan en el tope con su cifra escrita.
const TOPE_REPRESENTACION = 50;

// ------------------------------------------------------------- catálogos
const PERIODOS = [
  {valor: "2015-2020", texto: "2015 - 2020 · Censo", rango: "2015 - 2020"},
  {valor: "2020-2025", texto: "2020 - 2025 · Encuesta Intercensal", rango: "2020 - 2025"},
];
const CAUSAS = [{valor: "violencia", texto: "Violencia"}, {valor: "otras", texto: "Otras causas"}, {valor: "todas", texto: "Todas las causas"}];
const EDADES = [{valor: "5-17", texto: "5 a 17 años"}, {valor: "18+", texto: "18 años y más"}, {valor: "todas", texto: "Todas las edades"}];
const SEXOS = [{valor: "todos", texto: "Mujeres y hombres"}, {valor: "m", texto: "Mujeres"}, {valor: "h", texto: "Hombres"}];
const GRUPOS = [
  {valor: "total", texto: "Toda la población"},
  {valor: "hli", texto: "Habla una lengua indígena", fila: "Habla una lengua indígena", corta: "Lengua indígena", verbo: "hablan una lengua indígena", relativo: "que hablan una lengua indígena"},
  {valor: "indigena", texto: "Se considera indígena", fila: "Se considera indígena", corta: "Se considera indígena", verbo: "se consideran indígenas", relativo: "que se consideran indígenas"},
  {valor: "afro", texto: "Se considera afrodescendiente", fila: "Se considera afrodescendiente", corta: "Afrodescendiente", verbo: "se consideran afrodescendientes", relativo: "que se consideran afrodescendientes"},
  {valor: "discapacidad", texto: "Con discapacidad", fila: "Con discapacidad", corta: "Con discapacidad", verbo: "tienen alguna discapacidad", adjetivo: "con discapacidad"},
  {valor: "otro_pais", texto: "Nació en otro país", fila: "Nació en otro país", corta: "Nació en otro país", verbo: "nacieron en otro país", adjetivo: (s) => (s === "h" ? "nacidos en otro país" : "nacidas en otro país")},
];
const GRUPO = new Map(GRUPOS.map((g) => [g.valor, g]));
const POR_OMISION = {periodo: "2015-2020", causa: "violencia", cuantos: 10, entidad: "todas", sentido: "salen", edad: "5-17", sexo: "todos", grupo: "total", comparar: "no"};
const PARAMETRO = {periodo: "periodo", causa: "causa", cuantos: "n", entidad: "ent", sentido: "sentido", edad: "edad", sexo: "sexo", grupo: "grupo", comparar: "comparar"};

const rango = (periodo) => PERIODOS.find((p) => p.valor === periodo)?.rango ?? periodo;
const nombre = (c) => nombreEntidad(c);
const causasDe = (c) => (c === "todas" ? ["violencia", "otras"] : [c]);
const edadesDe = (e) => (e === "todas" ? ["5-17", "18+"] : [e]);
const sexosDe = (s) => (s === "todos" ? ["m", "h"] : [s]);
const otraCausa = (c) => (c === "violencia" ? "otras" : c === "otras" ? "violencia" : null);

// ------------------------------------------------------------- frases
// Sujeto y apellido de las cifras, generados con los filtros (R41, R118).
const sujeto = (v) => (v.sexo === "m" ? "Mujeres" : v.sexo === "h" ? "Hombres" : "Personas");
const tramoEdad = (v) => (v.edad === "5-17" ? "de 5 a 17 años" : v.edad === "18+" ? "de 18 años y más" : "de 5 años y más");
const porCausa = (causa) => (causa === "violencia" ? " por violencia" : causa === "otras" ? " por otras causas" : "");
function quienes(v, {mayuscula = true} = {}) {
  const g = GRUPO.get(v.grupo);
  const s = sujeto(v);
  const inicio = `${mayuscula ? s : s.toLowerCase()} ${tramoEdad(v)}`;
  if (!g || g.valor === "total") return `${inicio} que cambiaron de entidad${porCausa(v.causa)}`;
  if (g.relativo) return `${inicio} ${g.relativo} y cambiaron de entidad${porCausa(v.causa)}`;
  const adj = typeof g.adjetivo === "function" ? g.adjetivo(v.sexo) : g.adjetivo;
  return `${inicio} ${adj} que cambiaron de entidad${porCausa(v.causa)}`;
}
const serieA = (v) => (v.causa === "violencia" ? "Cambiaron por violencia" : v.causa === "otras" ? "Cambiaron por otras causas" : "Cambiaron de entidad");
const serieB = (v) => (v.comparar === "no_migrantes" ? "No cambiaron de entidad" : otraCausa(v.causa) === "otras" ? "Cambiaron por otras causas" : "Cambiaron por violencia");

// =================================================================== datos
function indexar(flujos, poblacion) {
  const indice = d3.group(flujos, (f) => `${f.periodo}|${f.causa}|${f.grupo}|${f.edad}|${f.sexo}`);
  const indicePob = d3.group(poblacion, (p) => `${p.periodo}|${p.grupo}|${p.edad}|${p.sexo}`);
  const memo = new Map();
  // Pares origen-destino de una selección, sumando causa, edad y sexo.
  function porPar({periodo, causa, grupo, edad, sexo}) {
    const k = `${periodo}|${causa}|${grupo}|${edad}|${sexo}`;
    if (memo.has(k)) return memo.get(k);
    const m = new Map();
    for (const c of causasDe(causa)) for (const e of edadesDe(edad)) for (const s of sexosDe(sexo)) {
      for (const f of indice.get(`${periodo}|${c}|${grupo}|${e}|${s}`) ?? []) {
        const kk = `${f.origen}-${f.destino}`;
        let x = m.get(kk);
        if (!x) m.set(kk, (x = {clave: kk, origen: f.origen, destino: f.destino, personas: 0, casos: 0}));
        x.personas += f.personas; x.casos += f.casos;
      }
    }
    const lista = [...m.values()];
    memo.set(k, lista);
    return lista;
  }
  const suma = (sel, dentro = () => true) => {
    let personas = 0, casos = 0;
    for (const d of porPar(sel)) if (dentro(d)) { personas += d.personas; casos += d.casos; }
    return {personas, casos};
  };
  // Población que no cambió de entidad (todo el país o una entidad).
  const sumaPob = ({periodo, grupo, edad, sexo}, entidad = null) => {
    let n = 0;
    for (const e of edadesDe(edad)) for (const s of sexosDe(sexo)) {
      for (const p of indicePob.get(`${periodo}|${grupo}|${e}|${s}`) ?? []) if (entidad == null || p.entidad === entidad) n += p.noMigrante;
    }
    return n;
  };
  return {porPar, suma, sumaPob};
}

// =========================================================== componente
export function mapaFlujos({flujos, poblacion, geo}) {
  const datos = indexar(flujos, poblacion);
  let fijado = null;      // clave «OO-DD» de la flecha fijada
  let resaltado = null;   // clave bajo el cursor (renglón o flecha)
  let marcas = new Map(); // clave → <path> de cada flecha de color
  let vistaActual = null; // última selección dibujada
  let primera = true;

  // ------------------------------------------------------------ panel
  const filtros = panel({grupos: [
    {leyenda: "Qué se ve", campos: [
      campo({id: "periodo", rotulo: "Periodo", inicial: POR_OMISION.periodo, opciones: PERIODOS.map(({valor, texto}) => ({valor, texto}))}),
      campo({id: "causa", rotulo: "Causa del cambio", inicial: POR_OMISION.causa, opciones: CAUSAS}),
      campo({id: "cuantos", rotulo: "Flujos con flecha", inicial: POR_OMISION.cuantos, opciones: [10, 15, 20].map((n) => ({valor: n, texto: `${n} flechas`}))}),
    ]},
    {leyenda: "Dónde", campos: [
      campo({id: "entidad", rotulo: "Entidad", inicial: POR_OMISION.entidad, opciones: [{valor: "todas", texto: "Todo el país"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]}),
      // Solo decide algo con una entidad elegida: sin ella se oculta.
      campo({id: "sentido", rotulo: "Sentido", inicial: POR_OMISION.sentido, opciones: [{valor: "salen", texto: "Salen"}, {valor: "llegan", texto: "Llegan"}], oculto: (v) => v.entidad === "todas"}),
    ]},
    {leyenda: "Entre quiénes", campos: [
      campo({id: "edad", rotulo: "Edad", inicial: POR_OMISION.edad, opciones: EDADES}),
      campo({id: "sexo", rotulo: "Sexo", inicial: POR_OMISION.sexo, opciones: SEXOS}),
      campo({id: "grupo", rotulo: "Grupo de población", inicial: POR_OMISION.grupo, opciones: GRUPOS.map(({valor, texto}) => ({valor, texto}))}),
    ]},
    {leyenda: "Comparar con", campos: [
      // La «otra causa» depende de la causa elegida, y con todas las causas
      // no hay otra: esa opción no se ofrece (R54).
      campo({id: "comparar", rotulo: "Grupo de comparación", inicial: POR_OMISION.comparar, opciones: (v) => [
        {valor: "no", texto: "Sin comparar"},
        ...(otraCausa(v.causa) ? [{valor: "otra_causa", texto: otraCausa(v.causa) === "otras" ? "Quienes cambiaron por otras causas" : "Quienes cambiaron por violencia"}] : []),
        {valor: "no_migrantes", texto: "Quienes no cambiaron de entidad"},
      ]}),
    ]},
  ]});
  filtros.setAttribute("aria-label", "Filtros del mapa");
  // El panel vive en la columna lateral con su propio scroll: no se fija
  // arriba ni se compacta como los paneles de las secciones.
  filtros.setAttribute("data-sin-pegar", "");

  // ------------------------------------------------------------ armazón
  const lienzo = html`<div class="mapa-lienzo"></div>`;
  const tarjeta = html`<section class="mapa-tarjeta" aria-live="polite" aria-label="Lectura del mapa"></section>`;
  const comparacion = html`<section class="mapa-representacion" aria-label="Comparación entre grupos" hidden></section>`;
  const banda = html`<div class="mapa-banda">${tarjeta}${comparacion}</div>`;
  const leyendaCaja = html`<div class="mapa-leyenda-caja" role="group" aria-label="Leyenda del mapa"></div>`;
  const aviso = html`<div class="mapa-vacio" hidden></div>`;
  const zona = html`<div class="mapa-zona">${lienzo}${aviso}${banda}${leyendaCaja}</div>`;

  const tabFiltros = html`<button type="button" role="tab" id="mapa-tab-filtros" aria-selected="true" aria-controls="mapa-vista-filtros">Filtros</button>`;
  const tabInfo = html`<button type="button" role="tab" id="mapa-tab-info" aria-selected="false" aria-controls="mapa-vista-info" tabindex="-1">Información</button>`;
  const pestanas = html`<div class="mapa-pestanas" role="tablist" aria-label="Panel del mapa">${tabFiltros}${tabInfo}</div>`;
  const vistaFiltros = html`<div id="mapa-vista-filtros" class="mapa-vista" role="tabpanel" aria-labelledby="mapa-tab-filtros">${filtros}</div>`;
  const infoTabla = html`<div class="mapa-info-tablas"></div>`;
  const vistaInfo = html`<div id="mapa-vista-info" class="mapa-vista mapa-info" role="tabpanel" aria-labelledby="mapa-tab-info" hidden>
    <h2 class="mapa-info-titulo">Qué muestra este mapa</h2>
    <p>Cada flecha une la entidad donde vivía una persona al inicio del periodo con la entidad donde vivía al final, y apunta hacia la llegada. Su ancho es el número de personas, con una escala fija para cada periodo, causa y edad: al cambiar de entidad, de sexo o de grupo de población la escala no cambia, y las flechas se pueden comparar. Por ejemplo, si de Guerrero a Querétaro llegaron 1,800 personas y de Michoacán a Jalisco 900, la primera flecha mide el doble de ancho.</p>
    <p>El censo y la encuesta preguntan en qué entidad vivía cada persona cinco años antes y, si cambió, cuál fue la causa principal. Esa causa la declara un adulto del hogar por todas las personas que viven en él, también por niñas, niños y adolescentes. El universo son las personas de 5 años y más que vivían en otra entidad al inicio del periodo.</p>
    <p>La cifra grande de la tarjeta es el total de personas de la selección. En el globo de cada flecha, el porcentaje se calcula sobre todas las personas que salen de la entidad de origen, o que llegan a la de destino si se eligió “Llegan”. En “De cada 100”, cada renglón dice cuántas de cada 100 personas de la selección pertenecen a ese grupo.</p>
    <p>Hablar una lengua indígena y considerarse indígena son preguntas distintas: hay quien se considera indígena sin hablar la lengua, y al revés. Una persona puede estar en varios grupos, por eso los renglones no suman 100. Una flecha punteada tiene menos de ${MIN_CASOS} casos en la muestra y su cifra es poco precisa.</p>
    <a class="boton-metodo" href=${`${globalThis.__RAIZ ?? "./"}metodologia#m-mapa-flujos`}>Cómo se calculó, en la Metodología →</a>
    <div class="desplegables">${verificado(VERIFICA_MUESTRA)}${infoTabla}</div>
  </div>`;
  const lateral = html`<aside class="mapa-lateral" aria-label="Filtros e información del mapa">${pestanas}${vistaFiltros}${vistaInfo}</aside>`;
  const raiz = html`<div class="mapa-pantalla">${zona}${lateral}</div>`;

  const mostrarPestana = (cual, enfocar = false) => {
    const info = cual === "info";
    vistaFiltros.hidden = info; vistaInfo.hidden = !info;
    tabFiltros.setAttribute("aria-selected", String(!info)); tabInfo.setAttribute("aria-selected", String(info));
    tabFiltros.tabIndex = info ? -1 : 0; tabInfo.tabIndex = info ? 0 : -1;
    if (enfocar) (info ? tabInfo : tabFiltros).focus();
  };
  tabFiltros.addEventListener("click", () => mostrarPestana("filtros"));
  tabInfo.addEventListener("click", () => mostrarPestana("info"));
  pestanas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      mostrarPestana(tabFiltros.getAttribute("aria-selected") === "true" ? "info" : "filtros", true);
    }
  });

  // --------------------------------------------------------- vista activa
  // Flujos de la selección, ordenados de mayor a menor, y los del foco.
  function calcular(v) {
    const sel = {periodo: v.periodo, causa: v.causa, grupo: v.grupo, edad: v.edad, sexo: v.sexo};
    const pares = datos.porPar(sel).filter((d) => d.personas > 0);
    const foco = v.entidad === "todas" ? null : v.entidad;
    const llegan = v.sentido === "llegan";
    const salidas = d3.rollup(pares, (f) => d3.sum(f, (d) => d.personas), (d) => d.origen);
    const llegadas = d3.rollup(pares, (f) => d3.sum(f, (d) => d.personas), (d) => d.destino);
    const propios = d3.sort(foco == null ? pares : pares.filter((d) => (llegan ? d.destino : d.origen) === foco), (d) => -d.personas);
    const n = +v.cuantos;
    const principales = propios.slice(0, n);
    const total = d3.sum(pares, (d) => d.personas);
    return {
      v, sel, pares, foco, llegan, salidas, llegadas, propios, principales, n, total,
      contexto: propios.slice(n, n + 30),
      sumaPrincipales: d3.sum(principales, (d) => d.personas),
      bajas: principales.filter((d) => d.casos < MIN_CASOS).length,
      tope: TOPE_FLUJO[v.periodo]?.[v.causa]?.[v.edad] ?? d3.max(pares, (d) => d.personas) ?? 1,
      tinta: foco == null ? P.serie : llegan ? SIG_MAPA.color("sube") : SIG_MAPA.color("baja"),
      tintaTexto: foco == null ? P.tonoTexto : llegan ? P.azul : P.rojoTexto,
    };
  }

  // ------------------------------------------------------------ acciones
  const fijarPanel = (cambios) => { fijado = null; filtros.fijar(cambios); };
  const elegirLugar = (cve) => fijarPanel({entidad: cve === vistaActual?.foco ? "todas" : cve});
  function alternarFijado(d) { fijarFlujo(fijado === d.clave ? null : d.clave); }
  function fijarFlujo(k) {
    fijado = k && marcas.has(k) ? k : null;
    aplicarFijado();
    pintarTarjeta();
    escribirURL();
  }
  function aplicarFijado() {
    const dibujo = lienzo.querySelector("svg.flechas");
    dibujo?.classList.toggle("ff-con-fijo", fijado != null);
    for (const [k, n] of marcas) { n.classList.toggle("ff-fijo", k === fijado); n.setAttribute("aria-pressed", String(k === fijado)); }
  }
  function resaltar(k) {
    resaltado = k != null && marcas.has(k) ? k : null;
    lienzo.querySelector("svg.flechas")?.classList.toggle("ff-con-resalte", resaltado != null);
    for (const [kk, n] of marcas) n.classList.toggle("ff-resaltada", kk === resaltado);
    for (const r of tarjeta.querySelectorAll("[data-clave]")) r.classList.toggle("resaltado", r.dataset.clave === resaltado);
  }
  const conEscape = (e) => {
    if (e.key !== "Escape" || fijado == null) return;
    const k = fijado;
    fijarFlujo(null);
    marcas.get(k)?.focus();
  };

  // -------------------------------------------------------------- tarjeta
  const boton = (texto, accion, clase = "mapa-boton") => {
    const b = html`<button type="button" class=${clase}>${texto}</button>`;
    b.addEventListener("click", accion);
    return b;
  };
  // Botones para ampliar una selección con pocos casos.
  function ampliar(v) {
    return [
      v.edad !== "todas" ? boton("Todas las edades", () => fijarPanel({edad: "todas"})) : null,
      v.grupo !== "total" ? boton("Toda la población", () => fijarPanel({grupo: "total"})) : null,
      v.sexo !== "todos" ? boton("Mujeres y hombres", () => fijarPanel({sexo: "todos"})) : null,
      v.entidad !== "todas" ? boton("Todo el país", () => fijarPanel({entidad: "todas"})) : null,
    ].filter(Boolean);
  }
  const TEXTO_POCOS = "Con estos filtros hay muy pocos casos en la muestra para dibujar flujos confiables.";
  // Aviso con botones que amplían la selección (lo que dice «Prueba con…»).
  const avisoPocos = (v, texto = TEXTO_POCOS) => html`<div class="mt-aviso" role="status"><p>${texto} Prueba con:</p><div class="mt-botones">${ampliar(v)}</div></div>`;

  function pintarTarjeta() {
    const a = vistaActual;
    if (!a) return;
    const {v, foco} = a;
    const d = fijado != null ? a.principales.find((x) => x.clave === fijado) : null;
    // Aviso de pocos casos: todas las flechas de color son poco precisas. Va
    // arriba en la tarjeta, después de decir qué se cuenta, para que nunca
    // quede escondido bajo el scroll de la tarjeta.
    const todasBajas = Boolean(a.principales.length) && a.bajas === a.principales.length && !d;
    const aviso1 = todasBajas ? avisoPocos(v, `Pocos casos: ninguna flecha llega a ${MIN_CASOS} casos en la muestra.`) : null;
    let contenido;
    if (d) contenido = tarjetaFijada(a, d);
    else if (foco != null) contenido = tarjetaEstado(a, aviso1);
    else contenido = tarjetaPais(a, aviso1);
    tarjeta.replaceChildren(...contenido);
    tarjeta.dataset.modo = d ? "fijado" : foco != null ? "estado" : "pais";
    for (const r of tarjeta.querySelectorAll("[data-clave]")) {
      r.addEventListener("pointerenter", () => resaltar(r.dataset.clave));
      r.addEventListener("pointerleave", () => resaltar(null));
      r.addEventListener("focus", () => resaltar(r.dataset.clave));
      r.addEventListener("blur", () => resaltar(null));
    }
    if (resaltado) resaltar(resaltado);
  }

  function tarjetaPais(a, aviso1) {
    const {v, total, principales, sumaPrincipales} = a;
    return [
      html`<p class="mt-antetitulo">Todo el país</p>`,
      html`<h2 class="mt-titulo">${quienes(v)}, ${rango(v.periodo)}</h2>`,
      html`<p class="mt-cifra-fila"><strong class="mt-cifra">${entero(total)}</strong> <span>personas</span></p>`,
      aviso1 ?? "",
      principales.length ? html`<p class="mt-lectura">Las ${principales.length} flechas de color reúnen a ${deCada100(100 * sumaPrincipales / (total || 1))}.</p>` : "",
      html`<p class="mt-instruccion">Toca un estado para ver a dónde se fueron y de dónde llegaron.</p>`,
    ];
  }

  function segmentado(llegan) {
    const opcion = (valor, texto) => {
      const b = html`<button type="button" aria-pressed=${String((valor === "llegan") === llegan)} data-sentido=${valor}>${texto}</button>`;
      b.addEventListener("click", () => { if ((valor === "llegan") !== llegan) fijarPanel({sentido: valor}); });
      return b;
    };
    return html`<div class="mt-segmentado" role="group" aria-label="Sentido de los flujos">${opcion("salen", "Salen")}${opcion("llegan", "Llegan")}</div>`;
  }

  function tarjetaEstado(a, aviso1) {
    const {v, foco, llegan, salidas, llegadas, principales} = a;
    const salen = salidas.get(foco) ?? 0, llegaron = llegadas.get(foco) ?? 0, saldo = llegaron - salen;
    const lista = principales.slice(0, 5);
    const mayor = lista[0]?.personas || 1;
    const titulo = html`<h2 class="mt-titulo mt-titulo-estado" tabindex="-1">${nombre(foco)}</h2>`;
    return [
      html`<div class="mt-cabecera">${titulo}${boton("← Volver a todo el país", () => fijarPanel({entidad: "todas"}), "mapa-boton mapa-boton-volver")}</div>`,
      html`<p class="mt-sub">${quienes(v)}, ${rango(v.periodo)}</p>`,
      aviso1 ?? "",
      html`<div class="mt-fila">${segmentado(llegan)}
        <dl class="mt-cifras">
          <div><dt>Salen</dt><dd class="mt-rojo">${entero(salen)}</dd></div>
          <div><dt>Llegan</dt><dd class="mt-azul">${entero(llegaron)}</dd></div>
          <div><dt>Saldo</dt><dd>${saldo > 0 ? "+" : saldo < 0 ? "−" : ""}${entero(Math.abs(saldo))}</dd></div>
        </dl></div>`,
      lista.length
        ? html`<div class="mt-lista-bloque"><p class="mt-lista-titulo">${llegan ? "De dónde llegaron" : "A dónde se fueron"}</p>
          <ol class="mt-lista">${lista.map((d) => {
            const otro = llegan ? d.origen : d.destino, bajo = d.casos < MIN_CASOS;
            const fila = html`<li><button type="button" class="mt-renglon" data-clave=${d.clave} aria-label=${`${nombre(otro)}: ${entero(d.personas)} personas${bajo ? ", poco precisa" : ""}. Fijar este flujo.`}>
              <span class="mt-renglon-nombre">${nombre(otro)}</span>
              <span class="mt-renglon-pista" aria-hidden="true"><span class="mt-renglon-barra" style=${`width:${(100 * d.personas / mayor).toFixed(1)}%;background:${a.tinta}`}></span></span>
              <span class="mt-renglon-valor">${entero(d.personas)}${bajo ? "*" : ""}</span>
            </button></li>`;
            fila.querySelector("button").addEventListener("click", () => fijarFlujo(d.clave));
            return fila;
          })}</ol></div>`
        : html`<p class="mt-lectura">Sin flujos ${llegan ? "que lleguen a" : "que salgan de"} ${nombre(foco)} con estos filtros.</p>`,
      lista.some((d) => d.casos < MIN_CASOS) && !aviso1 ? html`<p class="mt-nota">* Menos de ${MIN_CASOS} casos en la muestra.</p>` : "",
      lista.length && !aviso1 ? html`<p class="mt-instruccion">Toca una flecha o un renglón para fijarlo.</p>` : "",
    ];
  }

  function tarjetaFijada(a, d) {
    const {v, foco, llegan, salidas, llegadas} = a;
    // Seguir el flujo desde el OTRO extremo: el destino si se ven salidas (o
    // el país), el origen si se ven llegadas.
    const otro = foco != null && llegan ? d.origen : d.destino;
    const parteSalen = 100 * d.personas / (salidas.get(d.origen) || 1);
    const parteLlegan = 100 * d.personas / (llegadas.get(d.destino) || 1);
    const bajo = d.casos < MIN_CASOS;
    const titulo = html`<h2 class="mt-titulo" tabindex="-1">${nombre(d.origen)} → ${nombre(d.destino)}</h2>`;
    return [
      html`<p class="mt-antetitulo">Flujo fijado · ${rango(v.periodo)}</p>`,
      titulo,
      html`<p class="mt-cifra-fila"><strong class="mt-cifra" style=${`color:${a.tintaTexto}`}>${entero(d.personas)}${bajo ? "*" : ""}</strong> <span>personas</span></p>`,
      html`<p class="mt-sub">${quienes(v)} de ${nombre(d.origen)} a ${nombre(d.destino)}</p>`,
      html`<p class="mt-lectura">${pct(parteSalen)} de quienes salen de ${nombre(d.origen)} · ${pct(parteLlegan)} de quienes llegan a ${nombre(d.destino)}</p>`,
      bajo ? html`<p class="mt-nota">* Menos de ${MIN_CASOS} casos en la muestra: cifra poco precisa.</p>` : "",
      html`<div class="mt-botones">
        ${boton(`Ver todo lo que llega a ${nombre(otro)}`, () => irA(otro, "llegan"))}
        ${boton(`Ver todo lo que sale de ${nombre(otro)}`, () => irA(otro, "salen"))}
        ${boton("Soltar (Esc)", () => { const k = fijado; fijarFlujo(null); marcas.get(k)?.focus(); }, "mapa-boton mapa-boton-suave")}
      </div>`,
    ];
  }
  function irA(cve, sentido) {
    fijado = null;
    enfocarTitulo = true;
    filtros.fijar({entidad: cve, sentido});
  }
  let enfocarTitulo = false;

  // ------------------------------------------------------- comparación
  function representacion(a) {
    const {v, foco, llegan} = a;
    const dentro = foco == null ? () => true : (d) => (llegan ? d.destino : d.origen) === foco;
    const base = {periodo: v.periodo, edad: v.edad, sexo: v.sexo};
    const lado = (causa) => ({
      total: datos.suma({...base, causa, grupo: "total"}, dentro),
      de: (g, extra = {}) => datos.suma({...base, causa, grupo: g, ...extra}, dentro),
    });
    const A = lado(v.causa);
    const B = v.comparar === "otra_causa" ? lado(otraCausa(v.causa)) : null;
    const pob = (g, extra = {}) => datos.sumaPob({...base, grupo: g, ...extra}, foco);
    const totalB = B ? B.total.personas : pob("total");
    const filas = [];
    const agregar = (id, rotulo, corta, verbo, extra, grupo = "total") => {
      const a1 = A.de(grupo, extra), b1 = B ? B.de(grupo, extra).personas : pob(grupo, extra);
      filas.push({id, rotulo, corta, verbo,
        kA: A.total.personas ? 100 * a1.personas / A.total.personas : null, nA: a1.personas, casosA: a1.casos, uA: A.total.personas,
        kB: totalB ? 100 * b1 / totalB : null, nB: b1, uB: totalB, casosB: B ? B.de(grupo, extra).casos : null});
    };
    for (const g of GRUPOS.slice(1)) agregar(g.valor, g.fila, g.corta, g.verbo, {}, g.valor);
    if (v.sexo === "todos") agregar("mujeres", "Mujeres", "Mujeres", "son mujeres", {sexo: "m"});
    if (v.edad === "todas") agregar("5-17", "De 5 a 17 años", "De 5 a 17 años", "tienen de 5 a 17 años", {edad: "5-17"});
    return {filas, A, totalB, casosTotalA: A.total.casos};
  }

  function pintarComparacion(a) {
    const {v, foco, llegan} = a;
    raiz.classList.toggle("con-comparacion", v.comparar !== "no");
    if (v.comparar === "no") { comparacion.hidden = true; comparacion.replaceChildren(); return null; }
    comparacion.hidden = false;
    const r = representacion(a);
    const donde = foco == null ? "Todo el país" : llegan ? `Llegan a ${nombre(foco)}` : `Salen de ${nombre(foco)}`;
    const ambitoB = v.comparar === "no_migrantes" ? (foco == null ? "en todo el país" : `que viven en ${nombre(foco)}`) : "";
    const leyenda = html`<div class="mr-leyenda" aria-hidden="true">
      <span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill=${P.serie} /></svg>${serieA(v)}</span>
      <span><svg width="12" height="12"><circle cx="6" cy="6" r="4.2" fill=${P.fondo} stroke=${P.comparacion} stroke-width="1.8"/></svg>${serieB(v)}${ambitoB ? ` ${ambitoB}` : ""}</span>
    </div>`;
    const cabeza = [
      html`<h2 class="mr-titulo">De cada 100, cuántas son de cada grupo</h2>`,
      html`<p class="mr-sub">${sujeto(v)} ${tramoEdad(v)} · ${donde} · ${rango(v.periodo)}</p>`,
      leyenda,
    ];
    if (!r.A.total.personas || r.casosTotalA < MIN_CASOS) {
      comparacion.replaceChildren(...cabeza, html`<p class="mt-aviso-simple">Hay muy pocos casos en la muestra para comparar esta selección. Prueba con Todo el país o con Todas las edades.</p>`);
      return r;
    }
    const ancho = 112, x = (k) => 6 + Math.min(k, TOPE_REPRESENTACION) / TOPE_REPRESENTACION * (ancho - 12);
    // Globo: el grupo, cuántos de cada 100 y a cuántas personas equivale. El
    // lugar y el periodo ya van en el subtítulo de la tarjeta.
    const g = globo({
      grupo: (f) => f.rotulo, color: () => P.serie,
      valor: (f) => f.kA, formato: (k) => deCada100(k),
      // El total son quienes se movieron por la causa en la selección (R117).
      personas: (f) => f.nA, universo: (f) => f.uA,
      unidad: foco == null ? "personas que cambiaron de entidad" : llegan ? "personas que llegaron" : "personas que salieron",
      precision: (f) => ({casos: f.casosA}),
    });
    const filas = r.filas.map((f) => {
      const resalta = f.id === v.grupo;
      const bajo = f.casosA < MIN_CASOS;
      const xa = x(f.kA ?? 0), xb = x(f.kB ?? 0);
      const dibujo = svg`<svg width=${ancho} height="18" viewBox="0 0 ${ancho} 18" aria-hidden="true">
        <line x1="6" x2=${ancho - 6} y1="9" y2="9" stroke=${P.rejilla} stroke-width="1"/>
        <line x1=${Math.min(xa, xb)} x2=${Math.max(xa, xb)} y1="9" y2="9" stroke=${P.contexto} stroke-width="3" stroke-linecap="round"/>
        <circle cx=${xb} cy="9" r="4.2" fill=${P.fondo} stroke=${P.comparacion} stroke-width="1.8"/>
        <circle cx=${xa} cy="9" r="5" fill=${P.serie} fill-opacity=${bajo ? 0.45 : 1} stroke=${bajo ? P.serie : "none"} stroke-dasharray=${bajo ? "2 1.5" : null} />
      </svg>`;
      const fila = html`<li class=${resalta ? "mr-fila mr-elegida marca-viva" : "mr-fila marca-viva"} tabindex="0">
        <span class="mr-rotulo">${f.corta}</span>${dibujo}
        <span class="mr-valores"><span class="mr-a">${f.kA == null ? "Sin dato" : Math.round(f.kA)}${bajo ? "*" : ""}</span> <span class="mr-b">${f.kB == null ? "Sin dato" : Math.round(f.kB)}</span></span>
      </li>`;
      globoEn(fila, g, f);
      fila.setAttribute("role", "listitem");
      return fila;
    });
    comparacion.replaceChildren(...cabeza,
      html`<p class="mr-cabeza" aria-hidden="true"><span></span><span><span class="mr-a">●</span><span class="mr-b">○</span></span></p>`,
      html`<ul class="mr-filas" role="list">${filas}</ul>`,
      html`<p class="mr-pie">Escala de 0 a ${TOPE_REPRESENTACION} de cada 100. ${r.filas.some((f) => f.casosA < MIN_CASOS) ? `* Menos de ${MIN_CASOS} casos en la muestra.` : ""}</p>`);
    return r;
  }

  // -------------------------------------------------------------- leyenda
  function pintarLeyenda(a, wMax) {
    const grueso = (x) => Math.max(1.8, wMax * x / a.tope);
    const redondos = d3.ticks(0, a.tope, 4).filter((x) => x > 0 && grueso(x) >= 3);
    const muestras = [...new Set([redondos[0], redondos.at(-1)])].filter((x) => x != null);
    const muestra = (tipo, color) => (tipo === "linea"
      ? svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${color} stroke-width="2.5"/></svg>`
      : tipo === "punteada" ? svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${color} stroke-width="2" stroke-dasharray="4 3"/></svg>`
      : svg`<svg width="14" height="12" aria-hidden="true"><rect x="1" y="0" width="12" height="12" rx="2" fill=${color} /></svg>`);
    const item = (tipo, color, texto) => html`<li>${muestra(tipo, color)}<span>${texto}</span></li>`;
    const hayBajas = a.bajas > 0, hayContexto = a.contexto.some((d) => d.casos >= MIN_CASOS);
    // La leyenda solo lista marcas que existen en el mapa (R109).
    const items = [
      a.principales.length ? item("cuadro", a.tinta, a.foco == null ? `Los ${a.principales.length} flujos mayores` : `${a.llegan ? "Llegan a" : "Salen de"} ${nombre(a.foco)}`) : null,
      hayContexto ? item("linea", P.contexto, "Otros flujos") : null,
      hayBajas ? item("punteada", P.tinta2, `Menos de ${MIN_CASOS} casos en la muestra`) : null,
    ].filter(Boolean);
    leyendaCaja.replaceChildren(
      ...(items.length ? [html`<ul class="ml-items">${items}</ul>`] : []),
      html`<div class="ml-ancho"><span class="ml-ancho-titulo">Ancho de la flecha</span>
        <span class="ml-ancho-muestras">${muestras.map((x) => html`<span class="ml-ancho-item"><svg width="24" height=${Math.ceil(grueso(x)) + 2} aria-hidden="true"><rect x="1" y="1" width="22" height=${grueso(x)} rx="1.5" fill=${a.tinta} fill-opacity="0.8"/></svg><span>${entero(x)}</span></span>`)}<span>personas</span></span>
        <span class="ml-ancho-nota">Escala fija para este periodo, causa y edad: el ancho mayor equivale a ${entero(a.tope)} personas.</span>
      </div>`,
    );
  }

  // --------------------------------------------------------------- mapa
  let apilada = false;
  function revisarDisposicion() {
    const angosta = !matchMedia(CORTE_FRAMEWORK).matches || (raiz.clientWidth > 0 && raiz.clientWidth < ANCHO_APILADO);
    if (angosta !== apilada) { apilada = angosta; raiz.classList.toggle("apilada", apilada); return true; }
    return false;
  }

  function pintarMapa(a) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const W = Math.max(280, Math.round(zona.clientWidth || lienzo.clientWidth || 600));
    const caja = zona.getBoundingClientRect();
    let alto = null, marco = null, evitar = [];
    if (!apilada) {
      const H = Math.max(320, Math.round(zona.clientHeight));
      alto = H;
      // Dos acomodos, y se usa el que deja el mapa más grande (con un tope de
      // TOPE_MAPA px de ancho para que no crezca hasta los bordes):
      //  - columna: tarjeta, comparación y leyenda en una columna a la
      //    derecha, centrada de arriba a abajo, y el mapa centrado en el resto.
      //    Es el de las pantallas anchas.
      //  - banda: tarjeta y comparación arriba, leyenda abajo a la izquierda, y
      //    el mapa centrado en lo que queda bajo la banda. Es el de 1366 px.
      // Primero el acomodo «esquina»: el país ocupa todo el alto y la tarjeta
      // flota en la esquina noreste del encuadre (Texas, sin tierra
      // mexicana) y la leyenda en la suroeste (océano). Solo se usa si las
      // dos cajas caben ahí sin tapar ningún estado; con la comparación
      // abierta la tarjeta crece y casi siempre se vuelve al de banda.
      if (probarEsquina(W, H)) {
        const r = (el) => { const b = el.getBoundingClientRect(); return [b.left - caja.left - 6, b.top - caja.top - 6, b.right - caja.left + 6, b.bottom - caja.top + 6]; };
        marco = esquina.marco;
        evitar = [r(tarjeta), ...(comparacion.hidden ? [] : [r(comparacion)]), r(leyendaCaja)];
        return dibujarMapa(a, W, alto, marco, evitar);
      }
      const bandaCss = parseFloat(getComputedStyle(raiz).getPropertyValue("--mapa-banda")) || BANDA_REM;
      const colPx = COLUMNA_REM * rem;
      const anchoColumna = Math.min(W - colPx - 48, TOPE_MAPA, (H - 40) * ASPECTO_MAPA);
      const anchoBanda = Math.min(W - 28, TOPE_MAPA, (H - bandaCss * rem - 24) * ASPECTO_MAPA);
      const columna = anchoColumna >= 0.9 * anchoBanda;
      raiz.classList.toggle("en-columna", columna);
      if (columna && leyendaCaja.parentNode !== banda) banda.append(leyendaCaja);
      if (!columna && leyendaCaja.parentNode !== zona) zona.append(leyendaCaja);
      let area;
      if (columna) area = [16, 16, W - colPx - 32, H - 16];
      else {
        // La banda crece solo si la comparación se acomodó debajo de la
        // tarjeta (columna angosta); se mide después de cambiar de acomodo.
        const bajoBanda = Math.round(banda.getBoundingClientRect().bottom - caja.top) + 10;
        const reserva = Math.min(Math.max(Math.round(bandaCss * rem), bajoBanda), H - 200);
        area = [14, reserva, W - 14, H - 24];
      }
      // Rectángulo del mapa: con el tope de ancho, centrado en el área. La
      // proyección se ajusta dentro y se centra en los dos sentidos.
      const ancho = Math.min(area[2] - area[0], TOPE_MAPA), cx = (area[0] + area[2]) / 2;
      marco = [[Math.round(cx - ancho / 2), area[1]], [Math.round(cx + ancho / 2), area[3]]];
      const r = (el) => { const b = el.getBoundingClientRect(); return [b.left - caja.left - 6, b.top - caja.top - 6, b.right - caja.left + 6, b.bottom - caja.top + 6]; };
      evitar = [r(tarjeta), ...(comparacion.hidden ? [] : [r(comparacion)]), r(leyendaCaja)];
    } else {
      raiz.classList.remove("en-esquina");
      if (leyendaCaja.parentNode !== zona) { raiz.classList.remove("en-columna"); zona.append(leyendaCaja); }
    }
    return dibujarMapa(a, W, alto, marco, evitar);
  }

  // Prueba el acomodo «esquina» y lo deja puesto si sirve. El país se
  // encuadra en toda la zona (con el tope de ancho); la tarjeta se pega a la
  // esquina superior derecha del país y la leyenda a la inferior izquierda.
  // Se rasteriza el país en un lienzo y se cuentan los píxeles de tierra bajo
  // cada caja (con un margen para que un renglón más en la tarjeta, al elegir
  // un estado, no cambie el acomodo). Hasta 60 píxeles se toleran: son islas.
  const esquina = {marco: null};
  function probarEsquina(W, H) {
    const ancho = Math.min(W - 32, TOPE_MAPA), x0 = Math.round((W - ancho) / 2);
    const m = [[x0, 16], [x0 + ancho, H - 16]];
    const geoR = rebobinar(geo), p = proyectar(proyeccionMx(geoR), W, H, 10, m);
    const [[bx0, by0], [bx1, by1]] = d3.geoPath(p).bounds(geoR);
    raiz.classList.remove("en-columna");
    if (leyendaCaja.parentNode !== zona) zona.append(leyendaCaja);
    raiz.classList.add("en-esquina");
    raiz.style.setProperty("--esq-derecha", `${Math.max(12, Math.round(W - bx1))}px`);
    raiz.style.setProperty("--esq-arriba", `${Math.max(12, Math.round(by0))}px`);
    raiz.style.setProperty("--esq-izquierda", `${Math.max(12, Math.round(bx0))}px`);
    raiz.style.setProperty("--esq-abajo", `${Math.max(12, Math.round(H - by1))}px`);
    const caja = zona.getBoundingClientRect();
    const rect = (el, holgura = 0) => { const b = el.getBoundingClientRect(); return [b.left - caja.left - 6, b.top - caja.top - 6, b.right - caja.left + 6, b.bottom - caja.top + 6 + holgura]; };
    const cajas = [rect(banda, 40), rect(leyendaCaja)];
    const lienzoPrueba = document.createElement("canvas");
    lienzoPrueba.width = W; lienzoPrueba.height = H;
    const ctx = lienzoPrueba.getContext("2d", {willReadFrequently: true});
    ctx.beginPath(); d3.geoPath(p, ctx)(geoR); ctx.fill();
    const tierra = ([a0, b0, a1, b1]) => {
      const xa = Math.max(0, Math.floor(a0)), ya = Math.max(0, Math.floor(b0));
      const w = Math.min(W, Math.ceil(a1)) - xa, h = Math.min(H, Math.ceil(b1)) - ya;
      if (w <= 0 || h <= 0) return 0;
      const px = ctx.getImageData(xa, ya, w, h).data;
      let n = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 0) n++;
      return n;
    };
    const libre = cajas.every((c) => tierra(c) <= 60);
    if (libre) esquina.marco = m;
    else raiz.classList.remove("en-esquina");
    return libre;
  }

  function dibujarMapa(a, W, alto, marco, evitar) {
    const anchoDibujo = marco ? marco[1][0] - marco[0][0] : W;
    const wMax = Math.max(12, Math.min(38, anchoDibujo * 0.045));
    const {v, foco, llegan, salidas, llegadas} = a;
    const universo = (d) => (llegan && foco != null ? llegadas.get(d.destino) : salidas.get(d.origen));
    // Globo: la flecha (de dónde a dónde), qué parte de quienes salen del
    // origen (o llegan al destino, con un lugar elegido en «llegan») y cuántas
    // personas son de cuántas.
    const g = globo({
      grupo: (d) => `${nombre(d.origen)} → ${nombre(d.destino)}`,
      color: () => a.tinta,
      valor: (d) => (universo(d) ? (100 * d.personas) / universo(d) : null), formato: "pct",
      personas: (d) => d.personas, universo: (d) => universo(d) || null,
      unidad: llegan && foco != null ? "personas que llegaron" : "personas que salieron",
      precision: (d) => ({casos: d.casos}),
    });
    const dibujo = flechas(geo, [...a.principales, ...a.contexto], {
      ancho: W, alto, anchoTope: Infinity, marco, anchoMaximo: wMax, evitar, soloLienzo: true,
      origen: (d) => d.origen, destino: (d) => d.destino, valor: (d) => d.personas, casos: (d) => d.casos,
      foco, sentido: llegan ? "llegan" : "salen", maximo: a.n, fondo: 30, minimo: MIN_CASOS, tope: a.tope, color: a.tinta,
      rotulos: apilada ? 3 : 6, alElegir: elegirLugar, globo: g, prefijo: "mf",
      alElegirFlujo: alternarFijado, fijado,
      etiquetaLugar: (c) => (c === foco ? `${nombre(c)}, elegida. Enter para volver a todo el país` : `${nombre(c)}. Enter para ver a dónde se fueron y de dónde llegaron`),
    });
    marcas = dibujo.marcas ?? new Map();
    for (const [k, n] of marcas) {
      n.addEventListener("pointerenter", () => resaltar(k));
      n.addEventListener("pointerleave", () => resaltar(null));
      n.addEventListener("focus", () => resaltar(k));
      n.addEventListener("blur", () => resaltar(null));
    }
    lienzo.replaceChildren(dibujo);
    return wMax;
  }

  function pintarAviso(a) {
    if (a.principales.length) { aviso.hidden = true; aviso.replaceChildren(); return; }
    aviso.hidden = false;
    aviso.replaceChildren(html`<div class="mapa-vacio-caja" role="status">
      <p><strong>Sin flujos que dibujar.</strong> ${TEXTO_POCOS} Prueba con:</p>
      <div class="mt-botones">${ampliar(a.v)}</div>
    </div>`);
  }

  // -------------------------------------------------------------- tablas
  function pintarTablas(a, rep) {
    const {salidas, llegadas} = a;
    const filas = [...a.principales, ...a.contexto];
    const t1 = tablaDatos(filas, [
      {titulo: "Sale de", valor: (d) => nombre(d.origen), texto: true},
      {titulo: "Llega a", valor: (d) => nombre(d.destino), texto: true},
      {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
      {titulo: "Parte de las salidas del origen", valor: (d) => 100 * d.personas / (salidas.get(d.origen) || 1), formato: "pct"},
      {titulo: "Parte de las llegadas al destino", valor: (d) => 100 * d.personas / (llegadas.get(d.destino) || 1), formato: "pct"},
      {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
      {titulo: "Precisión", valor: (d) => (d.casos < MIN_CASOS ? "Poco precisa" : "Suficiente"), texto: true},
    ], {nombre: "mapa-flujos"});
    const abiertas = [...infoTabla.querySelectorAll("details")].map((d) => d.open);
    const tablas = [t1];
    if (rep) {
      tablas.push(tablaDatos(rep.filas, [
        {titulo: "Grupo", valor: (f) => f.rotulo, texto: true},
        {titulo: `${serieA(a.v)}, de cada 100`, valor: (f) => f.kA, formato: "de100"},
        {titulo: "Personas", valor: (f) => f.nA, formato: "conteo"},
        {titulo: "De un total de", valor: (f) => f.uA, formato: "conteo"},
        {titulo: "Casos en la muestra", valor: (f) => f.casosA, formato: "conteo"},
        {titulo: `${serieB(a.v)}, de cada 100`, valor: (f) => f.kB, formato: "de100"},
        {titulo: "Personas, comparación", valor: (f) => f.nB, formato: "conteo"},
        {titulo: "De un total de, comparación", valor: (f) => f.uB, formato: "conteo"},
      ], {titulo: "Ver los datos de la comparación", nombre: "mapa-comparacion"}));
    }
    tablas.forEach((t, i) => { if (abiertas[i]) t.open = true; });
    infoTabla.replaceChildren(...tablas);
  }

  // ------------------------------------------------------------------ URL
  function escribirURL() {
    const v = filtros.value, q = new URLSearchParams();
    for (const [k, p] of Object.entries(PARAMETRO)) {
      if (k === "sentido" && v.entidad === "todas") continue;
      if (String(v[k]) !== String(POR_OMISION[k])) q.set(p, String(v[k]));
    }
    if (fijado) q.set("fija", fijado);
    const texto = q.toString();
    const nueva = location.pathname + (texto ? "?" + texto : "") + location.hash;
    if (nueva !== location.pathname + location.search + location.hash) history.replaceState(history.state, "", nueva);
  }
  function leerURL() {
    const q = new URLSearchParams(location.search), cambios = {};
    for (const [k, p] of Object.entries(PARAMETRO)) {
      if (!q.has(p)) continue;
      const x = q.get(p);
      cambios[k] = k === "cuantos" ? +x : x;
    }
    const f = q.get("fija");
    return {cambios, fija: f && /^\d{2}-\d{2}$/.test(f) ? f : null};
  }

  // --------------------------------------------------------------- pintar
  function pintar() {
    if (!raiz.isConnected) return;
    const t0 = performance.now();
    ocultarGlobo();
    revisarDisposicion();
    const focoPrevio = document.activeElement;
    const claveFoco = focoPrevio?.dataset?.clave ?? null;
    const lugarFoco = focoPrevio?.classList?.contains("mapa-unidad") ? focoPrevio.getAttribute("aria-label")?.split(/[.,]/)[0] : null;
    const a = calcular(filtros.value);
    vistaActual = a;
    if (fijado != null && !a.principales.some((d) => d.clave === fijado)) fijado = null;
    pintarTarjeta();
    const rep = pintarComparacion(a);
    pintarLeyenda(a, Math.max(12, Math.min(38, (zona.clientWidth || 600) * 0.045)));
    const wMax = pintarMapa(a);
    pintarLeyenda(a, wMax);
    pintarAviso(a);
    pintarTablas(a, rep);
    aplicarFijado();
    escribirURL();
    // El foco vuelve a donde estaba: la misma flecha, el mismo lugar o el
    // título de la tarjeta tras «Ver todo lo que…».
    if (enfocarTitulo) { enfocarTitulo = false; tarjeta.querySelector(".mt-titulo")?.focus(); }
    else if (claveFoco && marcas.has(claveFoco) && !focoPrevio.isConnected) marcas.get(claveFoco).focus();
    else if (lugarFoco && !focoPrevio.isConnected) [...lienzo.querySelectorAll(".mapa-unidad")].find((n) => n.getAttribute("aria-label").startsWith(lugarFoco))?.focus();
    if (primera) {
      primera = false;
      // Entrada: UNA vez, solo opacidad (R167). Los repintados no animan.
      lienzo.classList.add("entrada");
      setTimeout(() => lienzo.classList.remove("entrada"), 1400);
    }
    raiz.dataset.pintado = String(+(raiz.dataset.pintado ?? 0) + 1);
    raiz.dataset.ms = (performance.now() - t0).toFixed(1);
  }

  // ------------------------------------------------------------ arranque
  const {cambios, fija} = leerURL();
  if (Object.keys(cambios).length) filtros.fijar(cambios);
  filtros.addEventListener("input", pintar);
  document.addEventListener("keydown", conEscape);
  alCambiarModo(pintar);
  let medida = {w: 0, h: 0};
  const vigia = new ResizeObserver(() => {
    const w = Math.round(zona.clientWidth), h = apilada ? 0 : Math.round(zona.clientHeight);
    const cambioDisposicion = revisarDisposicion();
    if (!cambioDisposicion && Math.abs(w - medida.w) < 2 && Math.abs(h - medida.h) < 2) return;
    medida = {w, h};
    pintar();
    if (fija && medida.w && !raiz.dataset.fijaLeida) { raiz.dataset.fijaLeida = "1"; if (marcas.has(fija)) fijarFlujo(fija); }
  });
  vigia.observe(zona);
  vigia.observe(raiz);
  raiz.filtros = filtros;
  raiz.pintar = pintar;
  return raiz;
}
