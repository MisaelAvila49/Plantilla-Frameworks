---
title: Muestra de colores
toc: false
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Plantilla</span>
  <h1>Muestra de <span class="clave">colores</span></h1>
  <p class="capitulo-entradilla">Nueve propuestas de paleta para los libros de datos, puestas sobre las mismas cinco gráficas de muestra y con el resultado del validador de daltonismo y contraste en claro y en oscuro. El tono del libro se elige comparando aquí.</p>
</header>

<link rel="stylesheet" href="./colores.css">

```js
// El módulo de propuestas va PRIMERO: se suscribe al cambio de tema antes que
// nadie, para escribir su paleta antes de que se vuelvan a pintar las figuras.
import {PROPUESTAS, POR_ID, aplicarPropuesta, asegurar, vigente} from "./components/paletas-propuestas.js";
import {html} from "npm:htl";
import {P, MODO, rampaTema, rampaCambio, categorias, significado, sentido, alCambiarModo} from "./components/paleta.js";
import {figura} from "./components/seccion.js";
import {globo} from "./components/globo.js";
import {mosaico, barras, lineas, barrasApiladas, coropleta} from "./components/formas/index.js";
import {pct} from "./components/formato.js";
import {REGIONES, ENTIDADES, nombreEntidad} from "./components/geografia.js";
import {MUESTRA} from "./components/libro.js";
import {leerIndicador, leerComposicion, tasa, UNIVERSO} from "./components/muestra.js";

const indicador = leerIndicador(await FileAttachment("data/muestra/indicador.csv").csv());
const composicion = leerComposicion(await FileAttachment("data/muestra/composicion.csv").csv());
const geo = await FileAttachment("data/muestra/entidades.geojson").json();
// Resultado del validador, calculado en el build (data/paletas-propuestas.json.js).
const VALIDADOR = await FileAttachment("data/paletas-propuestas.json").json();
```

```js
// ----------------------------------------------------------- constantes
// Mismos dominios fijos que la galería de mapas: nivel de 0 a 80 % y cambio
// de −35 a +35 puntos (medidos sobre toda la muestra).
const DOMINIO_NIVEL = [0, 80];
const LIMITE_CAMBIO = 35;
const ANIO = 2020, DESDE = 2000;
const CATEGORIAS = ["Categoría A", "Categoría B", "Categoría C", "Otras"];
const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
const VEREDICTO = {pasa: "Pasa", aviso: "Pasa con avisos", falla: "No pasa"};
const ESTADO = {pasa: "Pasa", aviso: "Aviso", falla: "Falla"};
const resultados = new Map(VALIDADOR.propuestas.map((r) => [r.id, r]));

// Datos de las cinco figuras, calculados una vez.
const total = indicador.filter((r) => r.sexo === "Total");
const nivel = new Map(total.filter((r) => r.anio === ANIO).map((r) => [r.cve, r]));
const porRegion = REGIONES.map((region) => ({region, ...tasa(total.filter((r) => r.anio === ANIO && r.region === region))}));
const anios = [...new Set(indicador.map((r) => r.anio))].sort((a, b) => a - b);
const serieSexo = ["Mujeres", "Hombres"].flatMap((sexo) => anios.map((anio) => ({sexo, anio, ...tasa(indicador.filter((r) => r.sexo === sexo && r.anio === anio))})));
const reparto = composicion.filter((r) => r.region === "Nacional");
const cambio = new Map(ENTIDADES.map((e) => {
  const a = total.find((r) => r.cve === e.cve && r.anio === DESDE), b = total.find((r) => r.cve === e.cve && r.anio === ANIO);
  return a && b ? [e.cve, {cve: e.cve, entidad: e.nombre, a, b, cambio: b.pct - a.pct, s: sentido(a.pct, b.pct, {eeA: a.ee, eeB: b.ee})}] : null;
}).filter(Boolean));

// Propuesta inicial: la de la dirección (?propuesta=b) o la recomendada.
const inicial = new URLSearchParams(location.search).get("propuesta");
const estado = {elegida: POR_ID.has(inicial) ? inicial : (PROPUESTAS.find((p) => p.recomendada) ?? PROPUESTAS[0]).id};
aplicarPropuesta(estado.elegida);
```

```js
// --------------------------------------------------------------- piezas
const colores = (p) => (MODO.oscuro ? p.oscuro : p.claro);
const tira = (hex) => html`<span class="cm-tira" aria-hidden="true">${hex.map((h) => html`<span style=${{background: h}}></span>`)}</span>`;
const puntitos = (hex) => html`<span class="cm-puntos" aria-hidden="true">${hex.map((h) => html`<span style=${{background: h}}></span>`)}</span>`;
const celdas = (items, {nueve = false} = {}) => html`<ul class=${nueve ? "cm-celdas cm-nueve" : "cm-celdas"} style=${{"--n": items.length}}>${items.map(({hex, papel}) => html`<li>
  <span class="cm-celda" style=${{background: hex}} aria-hidden="true"></span>
  ${papel ? html`<span class="cm-papel">${papel}</span>` : ""}
  <span class="cm-hex">${hex}</span>
</li>`)}</ul>`;
const grupoMuestras = (titulo, contenido, {nota = null, ancho = false} = {}) => html`<div class=${ancho ? "cm-grupo cm-grupo-ancho" : "cm-grupo"}>
  <h3 class="cm-grupo-titulo">${titulo}</h3>${contenido}${nota ? html`<p class="cm-grupo-nota">${nota}</p>` : ""}
</div>`;

// Resumen: una tarjeta por propuesta, con los colores del tema vigente.
// Cada tarjeta también elige la propuesta.
// Cuántas comprobaciones obligatorias pasan, cuántas son aviso y cuántas fallan.
const cuenta = (t) => {
  const c = t.pruebas.filter((x) => !x.informativa).flatMap((x) => x.comprobaciones);
  const n = (e) => c.filter((x) => x.estado === e).length;
  return `${n("pasa")} de ${c.length} pasan, ${n("aviso")} ${n("aviso") === 1 ? "aviso" : "avisos"}${n("falla") ? `, ${n("falla")} ${n("falla") === 1 ? "falla" : "fallan"}` : ""}`;
};
function tarjeta(p) {
  const c = colores(p), r = resultados.get(p.id);
  const b = html`<button type="button" class=${p.recomendada ? "cm-tarjeta cm-tarjeta-recomendada" : "cm-tarjeta"} aria-pressed=${String(p.id === estado.elegida)}>
    ${p.recomendada ? html`<span class="cm-sello-recomendada">Recomendada</span>` : ""}
    <span class="cm-tarjeta-nombre"><span class="cm-letra">${p.letra}.</span>${p.nombre}</span>
    <span class="cm-tarjeta-fila"><span class="cm-tarjeta-rotulo">Magnitud</span>${tira(c.rampa)}</span>
    <span class="cm-tarjeta-fila"><span class="cm-tarjeta-rotulo">Serie y trío</span>${puntitos([c.serie])}${puntitos([...c.categorias, c.gris])}</span>
    <span class="cm-tarjeta-fila"><span class="cm-tarjeta-rotulo">Cambio</span>${tira(c.divergente)}</span>
    <span class="cm-cuenta">Claro: <strong>${VEREDICTO[r.claro.resultado]}</strong> · ${cuenta(r.claro)}</span>
    <span class="cm-cuenta">Oscuro: <strong>${VEREDICTO[r.oscuro.resultado]}</strong> · ${cuenta(r.oscuro)}</span>
  </button>`;
  b.addEventListener("click", () => elegir(p.id, {bajar: true}));
  return b;
}

// Selector de página, pegajoso: una pastilla por propuesta.
const selector = html`<nav class="cm-selector" aria-label="Elegir la propuesta de paleta"><span class="cm-selector-rotulo" aria-hidden="true">Propuesta</span></nav>`;
const pastillas = PROPUESTAS.map((p) => {
  const b = html`<button type="button" class="cm-pastilla" aria-pressed=${String(p.id === estado.elegida)}><span class="cm-letra">${p.letra}</span>${p.nombre.replace(/ \(.*\)$/, "").replace(/ de ColorBrewer$/, "").replace(/ de una tinta$/, "").replace(/ con acento rojo$/, "")}${/la actual de la Plantilla/.test(p.nombre) ? html`<span class="cm-pastilla-marca"> · actual</span>` : ""}${/el anterior/.test(p.nombre) ? html`<span class="cm-pastilla-marca"> · anterior</span>` : ""}${p.recomendada ? html`<span class="cm-pastilla-marca"> · recomendada</span>` : ""}</button>`;
  b.addEventListener("click", () => elegir(p.id));
  return b;
});
selector.append(...pastillas);

// --------------------------------------------------------------- figuras
// Las cinco formas de la Plantilla, con los mismos datos en cada propuesta.
function figuras(ancho) {
  const mitad = ancho > 900 ? Math.floor((ancho - 32) / 2) : ancho;
  const color = categorias(CATEGORIAS);
  const colorSexo = categorias(["Mujeres", "Hombres"]);
  const gNivel = globo({marca: (d) => d.entidad ?? nombreEntidad(d.cve), color: () => P.tonoTexto, valor: (d) => d.pct, formato: "pct", personas: (d) => d.num, universo: (d) => d.den, unidad: "habitantes"});
  const gRegion = globo({marca: (d) => d.region, color: () => P.tonoTexto, valor: (d) => d.pct, formato: "pct", personas: (d) => d.num, universo: (d) => d.den, unidad: "habitantes"});
  const gSexo = globo({marca: (d) => d.anio, grupo: (d) => d.sexo, color: (d) => colorSexo(d.sexo), valor: (d) => d.pct, formato: "pct", personas: (d) => d.num, universo: (d) => d.den, unidad: (d) => d.sexo.toLowerCase()});
  const gReparto = globo({marca: (d) => d.anio, grupo: (d) => d.categoria, color: (d) => color(d.categoria), valor: (d) => d.parte, formato: "pct", personas: (d) => d.personas, universo: (d) => d.total, unidad: "habitantes"});
  const gCambio = globo({marca: (d) => d.entidad ?? nombreEntidad(d.cve), grupo: (d) => (d.s ? SIG.etiqueta(d.s) : null), color: (d) => (d.s ? SIG.color(d.s) : null), valor: (d) => d.cambio, formato: "puntos"});
  const fila = (...nodos) => html`<div class="rejilla-figuras">${nodos}</div>`;
  return [
    figura({titulo: "Rampa de magnitud: población que cumple la condición, un cuadro por entidad", subtitulo: `Mujeres y hombres ${UNIVERSO} · ${ANIO} · escala fija de 0 a 80 %`, sello: MUESTRA,
      pie: "Datos de muestra de la Plantilla · cada cuadro es una entidad y su color, el porcentaje de la población de 5 años y más que cumple la condición."},
    mosaico(nivel, {ancho: Math.min(ancho, 980), valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), cifra: (x) => pct(x, 0),
      tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? "80 o más" : String(x)), globo: gNivel})),
    fila(
      figura({titulo: "Serie única: población que cumple la condición, por región", subtitulo: `Mujeres y hombres ${UNIVERSO} · ${ANIO}`, sello: MUESTRA,
        pie: "Datos de muestra de la Plantilla · cada barra es una región y su alto, el porcentaje de su población de 5 años y más que cumple la condición."},
      barras(porRegion, {ancho: mitad, x: (d) => d.region, valor: (d) => d.pct, orden: REGIONES, dominioY: DOMINIO_NIVEL, rotuloY: "Porcentaje", corto: (x) => x.replace("Centro-Occidente", "C.-Occ.").replace("Sur-Sureste", "Sur-Se."), globo: gRegion})),
      figura({titulo: "Dos series en el tiempo: mujeres y hombres", subtitulo: `Población ${UNIVERSO} · todo el país · ${anios[0]} - ${anios.at(-1)}`, sello: MUESTRA,
        pie: "Datos de muestra de la Plantilla · cada línea es un sexo y cada punto, el porcentaje de un año; usa los dos primeros tonos del trío."},
      lineas(serieSexo, {ancho: mitad, x: (d) => d.anio, y: (d) => d.pct, serie: (d) => d.sexo, color: (s) => colorSexo(s), dominioY: DOMINIO_NIVEL, rotuloY: "Porcentaje", globo: gSexo})),
    ),
    fila(
      figura({titulo: "Trío de categorías: reparto del total por año", subtitulo: `Todo el país · ${anios[0]} - ${anios.at(-1)} · tres categorías y «Otras» en gris`, sello: MUESTRA,
        pie: "Datos de muestra de la Plantilla · cada barra es un año y suma 100 %; cada tramo es la parte del total que corresponde a una categoría."},
      barrasApiladas(reparto, {ancho: mitad, fila: (d) => d.anio, categoria: (d) => d.categoria, valor: (d) => d.personas, categorias: CATEGORIAS, color, globo: gReparto})),
      figura({titulo: "Divergente: cambio del porcentaje por entidad", subtitulo: `Población ${UNIVERSO} · ${DESDE} a ${ANIO} · escala fija de −35 a +35 puntos`, sello: MUESTRA,
        pie: `Datos de muestra de la Plantilla · cada entidad se pinta con el cambio en puntos de su porcentaje, del lado desfavorable si ${SIG.rojo} y del favorable si sube.`},
      coropleta(geo, cambio, {ancho: mitad, valor: (d) => d.cambio, escala: rampaCambio(LIMITE_CAMBIO, {desfavorable: SIG.desfavorable}),
        tituloLeyenda: "Cambio, en puntos", marcasLeyenda: [-30, -15, 0, 15, 30], formatoLeyenda: (x) => (x > 0 ? `+${x}` : x < 0 ? `−${Math.abs(x)}` : "0"), rotuloSinDato: "Sin dato en alguno de los dos años", globo: gCambio})),
    ),
  ];
}

// ------------------------------------------------------------- validador
function columnaValidador(r) {
  return html`<div class="cm-modo">
    <h3 class="cm-modo-titulo">Tema ${r.modo}</h3>
    <p class="cm-modo-veredicto">Sobre el fondo ${r.fondo}: <strong>${VEREDICTO[r.resultado]}</strong></p>
    ${r.pruebas.map((x) => html`<details class="cm-prueba">
      <summary><span class=${`cm-estado cm-estado-${x.resultado}`}>${ESTADO[x.resultado]}</span> ${x.titulo}${x.informativa ? html` <span class="cm-informativa">(informativa)</span>` : ""}</summary>
      <div class="cm-prueba-cuerpo">
        ${puntitos(x.hex)}
        <ul>${x.comprobaciones.map((c) => html`<li><strong>${ESTADO[c.estado]}</strong> · ${c.nombre}: ${c.detalle}</li>`)}</ul>
        ${x.nota ? html`<p class="cm-grupo-nota">${x.nota}</p>` : ""}
      </div>
    </details>`)}
  </div>`;
}

// ---------------------------------------------------------------- página
const resumen = html`<div class="cm-resumenes"></div>`;
const detalle = html`<section class="cm-propuesta" aria-live="polite"></section>`;
const cuerpoFiguras = html`<div class="cm-figuras"></div>`;
const validador = html`<div class="cm-validador"></div>`;
let anchoActual = 0;

function pintarResumen() {
  // Primero las diseñadas para pasar el validador (con la recomendada a la
  // cabeza); debajo, la primera ronda para comparar.
  const disenadas = PROPUESTAS.filter((p) => p.disenada), primeras = PROPUESTAS.filter((p) => !p.disenada);
  resumen.replaceChildren(
    html`<h2 class="cm-resumen-titulo">Diseñadas para pasar el validador</h2>`,
    html`<p class="cm-guia-corta">Hechas en OKLCH a partir del rojo de la marca y probadas contra el validador hasta pasar todas las comprobaciones obligatorias en los dos temas. Solo los verdes azulados (matiz 165° a 195°) lo logran: los ocres y los verdes pino se confunden con el rojo con daltonismo, y los azules tinta chocan con el azul de «favorable».</p>`,
    html`<div class="cm-resumen">${disenadas.map(tarjeta)}</div>`,
    html`<h2 class="cm-resumen-titulo">Primera ronda, de mejor a peor resultado</h2>`,
    html`<div class="cm-resumen">${primeras.map(tarjeta)}</div>`,
  );
}
function pintarDetalle() {
  const p = vigente(), c = colores(p);
  const r = resultados.get(p.id);
  const tema = MODO.oscuro ? "oscuro" : "claro";
  detalle.replaceChildren(
    html`<h2 class="cm-titulo" id="propuesta"><span class="cm-letra">${p.letra}.</span> ${p.nombre}</h2>`,
    html`<p class="cm-texto">${p.idea}</p>`,
    html`<p class="cm-texto"><strong>Qué pasa con el rojo.</strong> ${p.rojo}</p>`,
    p.porque ? html`<div class="cm-porque">${p.recomendada ? html`<p class="cm-sello-recomendada">Recomendada para los libros de la Ibero</p>` : ""}<p class="cm-texto">${p.porque}</p></div>` : "",
    p.referencia ? html`<p class="cm-ref">Referencia: <a href=${p.referencia.url} target="_blank" rel="noopener">${p.referencia.texto}</a></p>` : "",
    html`<div class="cm-muestras">
      ${grupoMuestras(`Rampa de magnitud, nueve pasos (tema ${tema})`, celdas(c.rampa.map((hex, i) => ({hex, papel: i === 0 ? "Bajo" : i === 8 ? "Alto" : ""})), {nueve: true}), {ancho: true, nota: "El libro la usa continua, con dominio fijo; estos nueve pasos son sus anclas."})}
      ${grupoMuestras("Serie única y grises", celdas([{hex: c.serie, papel: "Serie"}, {hex: c.comparacion, papel: "Comparación"}, {hex: c.contexto, papel: "Contexto"}, {hex: c.gris, papel: "Sin cambio"}]))}
      ${grupoMuestras("Lo desfavorable y lo favorable", celdas([{hex: c.rojo, papel: "Desfavorable"}, {hex: c.azul, papel: "Favorable"}]))}
      ${grupoMuestras("Trío de categorías", celdas([...c.categorias.map((hex, i) => ({hex, papel: `Categoría ${i + 1}`})), {hex: c.gris, papel: "Otras"}]))}
      ${grupoMuestras("Divergente del cambio", celdas(c.divergente.map((hex, i) => ({hex, papel: i === 0 ? "Desfav." : i === 4 ? "Centro" : i === 8 ? "Fav." : ""})), {nueve: true}))}
    </div>`,
    html`<h2 class="cm-grupo-titulo" style="font-size: 1.1rem; margin-top: 0.6rem">Las cinco gráficas de muestra con esta propuesta</h2>`,
    cuerpoFiguras,
    html`<h2 class="cm-grupo-titulo" style="font-size: 1.1rem">Resultado del validador</h2>`,
    html`<p class="cm-pie-validador">Calculado en el build con el validador de la skill dataviz (scripts/validate_palette.js), las mismas excepciones de npm run verificar:paleta y el fondo real de cada tema, el ${VALIDADOR.calculado}. Se abre cada renglón para ver las comprobaciones. Las pruebas informativas no cuentan para el resultado.</p>`,
    validador,
  );
  validador.replaceChildren(columnaValidador(r.claro), columnaValidador(r.oscuro));
}
function pintarFiguras() {
  asegurar();
  const ancho = Math.max(280, Math.min(1320, Math.round(cuerpoFiguras.clientWidth || 900)));
  anchoActual = ancho;
  cuerpoFiguras.replaceChildren(...figuras(ancho));
}
function pintarTodo() {
  asegurar();
  for (const [i, p] of PROPUESTAS.entries()) pastillas[i].setAttribute("aria-pressed", String(p.id === estado.elegida));
  pintarResumen();
  pintarDetalle();
  pintarFiguras();
}
function elegir(id, {bajar = false} = {}) {
  estado.elegida = id;
  aplicarPropuesta(id);
  const url = new URL(location.href);
  url.searchParams.set("propuesta", id);
  history.replaceState(null, "", url);
  pintarTodo();
  if (bajar) selector.scrollIntoView({block: "start"});
}

alCambiarModo(() => pintarTodo());
new ResizeObserver(() => {
  const w = Math.round(cuerpoFiguras.clientWidth);
  if (w > 0 && Math.abs(w - anchoActual) >= 2) pintarFiguras();
}).observe(cuerpoFiguras);

display(html`<p class="cm-guia">Cada tarjeta resume una propuesta con los colores del tema que está activo y cuenta cuántas de las comprobaciones obligatorias del validador pasan en cada tema (el botón «Fondo oscuro» del menú cambia todas). Al elegir una, las muestras, las cinco gráficas y el validador de abajo pasan a esa propuesta; el resto del libro sigue con su tono. La rampa de referencia es <a href="https://colorbrewer2.org/#type=sequential&scheme=OrRd&n=9" target="_blank" rel="noopener">OrRd de ColorBrewer</a>.</p>`);
display(resumen);
display(selector);
display(detalle);
pintarTodo();
```
