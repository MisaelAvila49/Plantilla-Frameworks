// src/components/seccion.js
// ANATOMÍA DE UNA SECCIÓN, en un solo componente compartido por todas las
// páginas (no hay una copia de `analisis()` por página):
//
//   <h2 id="…" class="toc-anchor">Título</h2>   ancla estática en el .md (índice)
//   cabecera      número, título (el MISMO texto del ancla) y entradilla optativa
//   panel         filtros de esta gráfica (filtros.js)
//   cuerpo        cifras (kpis) y figura: título, subtítulo generado con los
//                 filtros, leyenda, gráfica, pie de una frase, notas y descarga
//   desplegables  siempre tres, idénticos cerrados y en este orden:
//                 «Fuentes y verificación», «¿Qué quiere decir este
//                 análisis?» y «Ver los datos»
//
// Sin párrafo de introducción. Cada sección se dibuja al acercarse a la
// pantalla y se vuelve a dibujar al cambiar un filtro, el tema o el ancho.

import {html} from "npm:htl";
import {conDescarga} from "./descargar.js";
import {alAcercarse} from "./diferido.js";
import {alCambiarModo} from "./paleta.js";
import {formatear, entero, SIN_DATO} from "./formato.js";

const RAIZ = () => globalThis.__RAIZ ?? "./";
const ANCHO_MAXIMO = 1320;

// ------------------------------------------------------------- cabecera
export function seccion({numero = null, titulo, entrada = null}) {
  return html`<header class="seccion-cabecera">
    ${numero != null ? html`<span class="seccion-numero" aria-hidden="true">${String(numero).padStart(2, "0")}</span>` : ""}
    <p class="seccion-titulo" aria-hidden="true">${titulo}</p>
    ${entrada ? html`<p class="seccion-entrada">${entrada}</p>` : ""}
  </header>`;
}

// ---------------------------------------------------------------- cifras
// tarjetas: [{etiqueta, cifra, nota}]. Solo la primera lleva el acento rojo.
export function kpis(tarjetas) {
  return html`<div class="kpis">${tarjetas.filter(Boolean).map((t, i) => html`<div class=${i === 0 ? "kpi kpi-principal" : "kpi"}>
    <span class="kpi-etiqueta">${t.etiqueta}</span>
    <strong class="kpi-cifra">${t.cifra}</strong>
    ${t.nota ? html`<span class="kpi-nota">${t.nota}</span>` : ""}
  </div>`)}</div>`;
}

// ---------------------------------------------------------------- figura
// titulo: nombra lo que se mide (no lo que se concluye). subtitulo: generado,
// dice qué filtros se aplicaron. pie: UNA frase de 12 a 35 palabras,
// «fuente · qué representa cada marca». sello: rótulo visible («Datos de
// muestra»). notas: salvedades que aplican a lo elegido.
export function figura({titulo, subtitulo = null, pie = null, sello = null, notas = null, descarga = true}, ...hijos) {
  const nodo = html`<figure class="figura">
    <div class="figura-encabezado">
      <h3 class="figura-titulo">${titulo}</h3>
      ${sello ? html`<span class="figura-sello">${sello}</span>` : ""}
    </div>
    ${subtitulo ? html`<p class="figura-subtitulo">${subtitulo}</p>` : ""}
    <div class="figura-cuerpo">${hijos.flat().filter(Boolean)}</div>
    ${pie ? html`<figcaption class="figura-pie">${pie}</figcaption>` : ""}
    ${notas?.filter(Boolean).length ? html`<p class="figura-notas"><strong>Notas.</strong> ${notas.filter(Boolean).join(" ")}</p>` : ""}
  </figure>`;
  return descarga ? conDescarga(nodo) : nodo;
}

// ----------------------------------------------------------- desplegables
// «¿Qué quiere decir este análisis?»: la LECTURA, en palabras llanas y con un
// ejemplo con números. El método vive una sola vez en Metodología; el botón
// lleva al ancla de su apartado (`m-…`).
export function explicacion(texto, anclaMetodologia = null) {
  const parrafos = [texto].flat().filter(Boolean);
  return html`<details class="desplegable explica-analisis">
    <summary>¿Qué quiere decir este análisis?</summary>
    <div class="desplegable-cuerpo">
      ${parrafos.map((p) => html`<p>${p}</p>`)}
      ${anclaMetodologia ? html`<a class="boton-metodo" href=${`${RAIZ()}metodologia#${anclaMetodologia}`}>Cómo se calculó, en la Metodología →</a>` : ""}
    </div>
  </details>`;
}

// «Fuentes y verificación»: de dónde sale el dato (enlace a Referencias) y
// contra qué tabla OFICIAL se cotejó la cifra central, con el resultado
// calculado. Sin tabla equivalente se escribe «Verificación pendiente» con la
// referencia más cercana; nunca se inventa.
//   verificado({fuentes: [{id, texto}], cotejo: {id, texto, calculado, publicado}, pendiente: "…"})
export function verificado({fuentes = [], cotejo = null, pendiente = null} = {}) {
  const ref = (f) => html`<a class="cita" href=${`${RAIZ()}referencias#${f.id}`}>${f.texto}</a>`;
  return html`<details class="desplegable verificado">
    <summary>Fuentes y verificación</summary>
    <div class="desplegable-cuerpo">
      <dl class="ficha">
        <dt>Fuente de los datos</dt>
        <dd>${fuentes.length ? fuentes.map((f, i) => [i ? "; " : "", ref(f)]) : SIN_DATO}</dd>
        ${cotejo
          ? [html`<dt>Verificado con</dt>`, html`<dd>${ref(cotejo)}</dd>`, html`<dt>Resultado</dt>`, html`<dd>Calculado: ${cotejo.calculado}. Publicado: ${cotejo.publicado}.</dd>`]
          : [html`<dt>Verificación</dt>`, html`<dd><span class="estado-pendiente">Verificación pendiente.</span> ${pendiente ?? ""}</dd>`]}
      </dl>
    </div>
  </details>`;
}

// «Ver los datos»: la tabla de respaldo. Aquí va lo que NO va en el globo:
// margen de error, casos de la muestra, numerador y denominador.
//   columnas: [{titulo, valor: (d) => …, formato: "pct" | "conteo" | … | fn, texto: true}]
export function tablaDatos(filas, columnas, {titulo = "Ver los datos", nombre = "datos"} = {}) {
  const celda = (c, d) => {
    const x = c.valor(d);
    if (c.texto) return x == null || x === "" ? SIN_DATO : String(x);
    if (typeof c.formato === "function") return c.formato(x, d);
    return c.formato ? formatear(x, c.formato) : x == null ? SIN_DATO : String(x);
  };
  const csv = () => [columnas.map((c) => c.titulo), ...filas.map((d) => columnas.map((c) => c.valor(d) ?? ""))]
    .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
  const boton = html`<button type="button" class="tabla-csv">Descargar CSV</button>`;
  boton.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob(["﻿" + csv()], {type: "text/csv;charset=utf-8"}));
    const a = html`<a href=${url} download=${`${globalThis.__LIBRO?.slug ?? "libro"}-${nombre}.csv`}></a>`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return html`<details class="desplegable tabla-datos">
    <summary>${titulo}</summary>
    <div class="desplegable-cuerpo">
      <div class="tabla-marco" tabindex="0" role="region" aria-label="Tabla de datos de la gráfica">
        <table>
          <thead><tr>${columnas.map((c) => html`<th scope="col" class=${c.texto ? "" : "num"}>${c.titulo}</th>`)}</tr></thead>
          <tbody>${filas.map((d) => html`<tr>${columnas.map((c) => html`<td class=${c.texto ? "" : "num"}>${celda(c, d)}</td>`)}</tr>`)}</tbody>
        </table>
      </div>
      <p class="tabla-pie">${entero(filas.length)} ${filas.length === 1 ? "fila" : "filas"} ${boton}</p>
    </div>
  </details>`;
}

// --------------------------------------------------------- ancho medido
// Un solo ResizeObserver por página: avisa a cada sección cuando cambia el
// ancho de su cuerpo. El ancho se mide en el DOM, no se calcula.
const medidos = new Map();
let observador = null;
function alCambiarAncho(el, fn) {
  observador ??= new ResizeObserver((entradas) => {
    for (const e of entradas) {
      const reg = medidos.get(e.target);
      const w = Math.round(e.contentRect.width);
      if (reg && w > 0 && Math.abs(w - reg.ancho) >= 2) { reg.ancho = w; reg.fn(w); }
    }
  });
  medidos.set(el, {ancho: Math.round(el.clientWidth), fn});
  observador.observe(el);
}

// ------------------------------------------------------------- analisis
// Arma la sección completa. `dibujar({v, ancho})` devuelve
//   {kpis: [...], figura: {titulo, subtitulo, pie, sello, notas, cuerpo},
//    tabla: {filas, columnas}}
// o `figuras: [...]` para dos gráficas en rejilla. `v` es la selección del
// panel. `explica`: texto o párrafos; `metodo`: ancla `m-…` de Metodología;
// `verifica`: argumentos de `verificado()`.
export function analisis({id, numero = null, titulo, entrada = null, panel = null, dibujar, explica, metodo = null, verifica = {}, alto = 520}) {
  const cuerpo = html`<div class="seccion-cuerpo"></div>`;
  const huecoTabla = html`<div class="hueco-tabla"></div>`;
  const nodo = html`<section class="analisis" data-analisis=${id} aria-labelledby=${id}>
    ${seccion({numero, titulo, entrada})}
    ${panel ?? ""}
    ${cuerpo}
    <div class="desplegables">
      ${verificado(verifica)}
      ${explicacion(explica, metodo)}
      ${huecoTabla}
    </div>
  </section>`;

  // Cada panel es una región con nombre propio para el lector de pantalla.
  panel?.setAttribute("aria-label", `Filtros de «${titulo}»`);

  let visto = false, abierta = false;
  function pintar() {
    if (!visto) return;
    const ancho = Math.max(280, Math.min(ANCHO_MAXIMO, Math.round(cuerpo.clientWidth)));
    try {
      const r = dibujar({v: panel?.value ?? {}, ancho});
      const figuras = (r.figuras ?? [r.figura]).filter(Boolean);
      const bloques = figuras.map((f) => figura(f, f.cuerpo));
      cuerpo.replaceChildren(
        ...(r.kpis?.length ? [kpis(r.kpis)] : []),
        figuras.length > 1 ? html`<div class="rejilla-figuras">${bloques}</div>` : bloques[0] ?? "",
      );
      abierta = huecoTabla.querySelector("details")?.open ?? abierta;
      if (r.tabla) {
        const t = tablaDatos(r.tabla.filas, r.tabla.columnas, {nombre: id});
        t.open = abierta;
        huecoTabla.replaceChildren(t);
      } else huecoTabla.replaceChildren();
      nodo.dataset.pintado = String(+(nodo.dataset.pintado ?? 0) + 1);
      delete nodo.dataset.error;
    } catch (error) {
      console.error(`Sección ${id}:`, error);
      nodo.dataset.error = String(error?.message ?? error);
      cuerpo.replaceChildren(html`<p class="figura-error" role="alert">No se pudo dibujar esta gráfica: ${String(error?.message ?? error)}</p>`);
    }
  }

  alAcercarse(cuerpo, () => {
    visto = true;
    pintar();
    // La animación de entrada corre UNA vez; los repintados por filtro no.
    cuerpo.classList.add("en-vista");
    setTimeout(() => cuerpo.classList.add("animada"), 1200);
    alCambiarAncho(cuerpo, pintar);
  }, {alto});
  panel?.addEventListener("input", pintar);
  alCambiarModo(pintar);
  nodo.pintar = pintar;
  return nodo;
}
