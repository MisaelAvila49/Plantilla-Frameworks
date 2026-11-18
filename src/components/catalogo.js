// src/components/catalogo.js
// Página «Catálogo de formas» (/catalogo): índice de todas las formas, al
// estilo de Data Viz Project, que lleva a cada forma implementada en la
// galería. Recibe los metadatos de src/data/catalogo.json (los genera
// scripts/catalogo_datos.mjs) y el mapa de miniaturas de
// src/catalogo/miniaturas.js. No ejecuta recetas: solo dibuja tarjetas.
//
// Lógica tomada de catalogo/CatalogoGraficas.html (bloque «Página»): pestañas
// APG con activación automática (Todas, Familia, Entrada, Función, Forma),
// conteo por botón según los DEMÁS filtros, opciones sin fichas deshabilitadas,
// mini tablas de Entrada en un carril que se desplaza dentro de su caja,
// íconos de Forma, nivel, buscador sin acentos, chips de filtros activos,
// «Quitar filtros» y la selección en la URL (?vista=forma&forma=puntos&nivel=2&q=red).
//
// Cada tarjeta es UN enlace (miniatura, nombre, nivel, familia, marca,
// pregunta y «Ver implementada →»; su nombre accesible es ese mismo texto,
// en ese orden, para que coincida con lo que se ve) y lleva aparte su desplegable con «Úsala
// cuando», «Evítala cuando» y «Datos». Una forma en construcción no enlaza.

import {DIMENSIONES, NIVELES, NIVELES_DESC, FORMAS, AGRUPAR_POR_OMISION} from "./catalogo-clasificacion.js";
import {alCambiarModo} from "./paleta.js";

const RAIZ = () => globalThis.__RAIZ ?? "./";
const DIM = Object.fromEntries(DIMENSIONES.map((d) => [d.id, d]));
const VISTAS = ["todas", ...DIMENSIONES.map((d) => d.id)];
const escapar = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const sinAcentos = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nombreDe = (dim, id) => DIM[dim].lista.find((o) => o.id === id)?.nombre ?? id;
const oscuro = () => document.documentElement.getAttribute("data-tema") === "oscuro";

function pips(n) {
  return `<span class="cat-pips" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<i class="${i <= n ? "lleno" : ""}"></i>`).join("")}</span>`;
}
function silueta(forma) {
  const f = FORMAS.find((x) => x.id === forma) ?? FORMAS[0];
  return `<svg class="cat-silueta" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${f.svg}</svg>`;
}

export function catalogo({fichas}, {miniaturas = {}} = {}) {
  // ---------------------------------------------------------------- fichas
  const LISTA = fichas.map((f) => ({
    ...f,
    _texto: sinAcentos([f.nombre, f.pregunta, f.si, f.no, f.datosForma, f.paginaNombre,
      ...DIMENSIONES.flatMap((d) => f[d.id].map((v) => nombreDe(d.id, v)))].join(" ")),
  }));

  // ----------------------------------------------------------------- estado
  const estado = {vista: "todas", familia: null, entrada: null, funcion: null, forma: null, nivel: null, texto: ""};
  function leerURL() {
    const p = new URLSearchParams(location.search);
    estado.vista = VISTAS.includes(p.get("vista")) ? p.get("vista") : "todas";
    for (const d of DIMENSIONES) { const v = p.get(d.id); estado[d.id] = d.lista.some((o) => o.id === v) ? v : null; }
    const n = p.get("nivel");
    estado.nivel = /^[0-3]$/.test(n ?? "") ? n : null;
    estado.texto = (p.get("q") ?? "").trim();
  }
  function escribirURL() {
    const p = new URLSearchParams();
    if (estado.vista !== "todas") p.set("vista", estado.vista);
    for (const d of DIMENSIONES) if (estado[d.id]) p.set(d.id, estado[d.id]);
    if (estado.nivel != null) p.set("nivel", estado.nivel);
    if (estado.texto) p.set("q", estado.texto);
    const s = p.toString();
    const url = location.pathname + (s ? `?${s}` : "");
    if (url !== location.pathname + location.search) history.replaceState(history.state, "", url);
  }
  function cumple(f, excepto = null) {
    for (const d of DIMENSIONES) if (d.id !== excepto && estado[d.id] && !f[d.id].includes(estado[d.id])) return false;
    if (excepto !== "nivel" && estado.nivel != null && String(f.nivel) !== estado.nivel) return false;
    if (estado.texto && !f._texto.includes(sinAcentos(estado.texto))) return false;
    return true;
  }
  const hayFiltros = () => DIMENSIONES.some((d) => estado[d.id]) || estado.nivel != null || Boolean(estado.texto);

  // ------------------------------------------------------------------ barra
  const nodo = document.createElement("div");
  nodo.className = "cat";
  const cuentaOpcion = () => `<span class="cat-cuenta-opcion"><span class="solo-lector">, </span><span data-cuenta>0</span><span class="solo-lector"> formas</span></span>`;
  function botonOpcion(dim, o) {
    const comun = `type="button" data-dim="${dim}" data-valor="${o.id}" aria-pressed="false"`;
    if (dim === "entrada") {
      const celdas = [...o.cab.map((c) => `<span class="cab">${escapar(c)}</span>`), ...o.filas.flat().map((c) => `<span>${escapar(c)}</span>`)];
      return `<button class="cat-entrada" ${comun} title="${escapar(o.desc)}">
        <span class="cat-mini-tabla" style="--cols:${o.cab.length}" aria-hidden="true">${celdas.join("")}</span>
        <span class="cat-entrada-pie"><span>${escapar(o.nombre)}</span>${cuentaOpcion()}</span></button>`;
    }
    if (dim === "forma") {
      return `<button class="cat-icono" ${comun} title="${escapar(o.desc)}">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">${o.svg}</svg>
        <span>${escapar(o.nombre)}</span>${cuentaOpcion()}</button>`;
    }
    return `<button class="cat-pildora" ${comun} title="${escapar(o.desc)}">${escapar(o.nombre)} ${cuentaOpcion()}</button>`;
  }
  const cuerpoPanel = (d) => {
    const items = d.lista.map((o) => `<li>${botonOpcion(d.id, o)}</li>`).join("");
    if (d.id === "entrada") return `<div class="cat-carril">
        <button class="cat-flecha" type="button" data-desliza="-1" aria-label="Ver las entradas anteriores">‹</button>
        <ul class="cat-carril-desliza" aria-label="Formas de los datos de entrada">${items}</ul>
        <button class="cat-flecha" type="button" data-desliza="1" aria-label="Ver más entradas">›</button></div>`;
    return `<ul class="cat-opciones${d.id === "forma" ? " cat-iconos" : ""}" aria-label="${d.nombre}">${items}</ul>`;
  };
  const pestanas = [{id: "todas", nombre: "Todas"}, ...DIMENSIONES];
  nodo.innerHTML = `
    <div class="cat-barra" role="search" aria-label="Filtrar el catálogo">
      <div class="cat-barra-fila">
        <div class="cat-pestanas" role="tablist" aria-label="Buscar formas por">${pestanas.map((p) => `<button class="cat-pestana" role="tab" type="button" id="cat-pestana-${p.id}" data-vista="${p.id}"
          aria-controls="cat-panel-${p.id}" aria-selected="false" tabindex="-1">${p.nombre}<span class="cat-pestana-marca" data-marca hidden></span></button>`).join("")}</div>
        <span class="cat-cuenta" role="status" aria-live="polite"></span>
      </div>
      <div class="cat-paneles">
        <div class="cat-panel" role="tabpanel" id="cat-panel-todas" aria-labelledby="cat-pestana-todas" tabindex="0">
          <p class="cat-ayuda">Todas las formas que cumplen los filtros, agrupadas por lo que muestran. Las pestañas filtran por familia, por la forma de los datos de entrada, por función o por la figura que dibuja, y agrupan las tarjetas con esa misma clasificación.</p>
        </div>
        ${DIMENSIONES.map((d) => `<div class="cat-panel" role="tabpanel" id="cat-panel-${d.id}" aria-labelledby="cat-pestana-${d.id}" hidden>
          <p class="cat-ayuda">${d.ayuda}</p>${cuerpoPanel(d)}</div>`).join("")}
      </div>
      <div class="cat-fila">
        <fieldset class="cat-nivel"><legend>Nivel</legend>${[["todos", "Todos"], ...NIVELES.map((n, i) => [String(i), n])].map(([v, t]) =>
          `<button class="cat-chip" type="button" data-nivel="${v}" aria-pressed="false"${v !== "todos" ? ` title="${escapar(NIVELES_DESC[+v])}"` : ""}>${v !== "todos" ? pips(+v) : ""}${t}</button>`).join("")}</fieldset>
        <input class="cat-buscar" type="search" placeholder="Buscar forma o pregunta" aria-label="Buscar forma o pregunta" autocomplete="off">
        <div class="cat-activos" hidden></div>
        <button class="cat-boton cat-quitar" type="button">Quitar filtros</button>
      </div>
    </div>
    <ul class="cat-indice" aria-label="Grupos de la vista actual"></ul>
    <div class="cat-grupos"></div>
    <p class="cat-vacio" hidden>Ninguna forma coincide con esos filtros. Quita alguno o borra la búsqueda.</p>`;
  const $ = (s) => nodo.querySelector(s);
  const $$ = (s) => [...nodo.querySelectorAll(s)];

  // Una opción sin ninguna ficha no se ofrece.
  for (const d of DIMENSIONES) for (const o of d.lista) {
    if (!LISTA.some((f) => f[d.id].includes(o.id))) nodo.querySelector(`[data-dim="${d.id}"][data-valor="${o.id}"]`).closest("li").remove();
  }

  // Pestañas: patrón APG con activación automática, flechas, Inicio y Fin.
  const tl = $(".cat-pestanas");
  tl.addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) { estado.vista = b.dataset.vista; actualizar(); } });
  tl.addEventListener("keydown", (e) => {
    const tabs = [...tl.querySelectorAll("[role=tab]")], i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const j = {ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1}[e.key];
    if (j == null) return;
    e.preventDefault(); tabs[j].focus(); estado.vista = tabs[j].dataset.vista; actualizar();
  });
  $(".cat-paneles").addEventListener("click", (e) => {
    const flecha = e.target.closest("[data-desliza]");
    if (flecha) {
      const c = flecha.parentElement.querySelector(".cat-carril-desliza");
      const suave = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      c.scrollBy({left: +flecha.dataset.desliza * c.clientWidth * 0.8, behavior: suave ? "smooth" : "auto"});
      return;
    }
    const b = e.target.closest("[data-dim]");
    if (!b || b.disabled) return;
    estado[b.dataset.dim] = estado[b.dataset.dim] === b.dataset.valor ? null : b.dataset.valor;
    actualizar();
  });
  $(".cat-nivel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-nivel]");
    if (!b) return;
    estado.nivel = b.dataset.nivel === "todos" ? null : b.dataset.nivel;
    actualizar();
  });
  $(".cat-buscar").addEventListener("input", (e) => { estado.texto = e.target.value.trim(); actualizar(); });
  $(".cat-activos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-quitar]");
    if (!b) return;
    estado[b.dataset.quitar] = null;
    actualizar();
  });
  $(".cat-quitar").addEventListener("click", () => {
    for (const d of DIMENSIONES) estado[d.id] = null;
    estado.nivel = null; estado.texto = ""; $(".cat-buscar").value = "";
    actualizar();
  });
  $(".cat-indice").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-grupo]");
    if (!a) return;
    e.preventDefault();
    const h = nodo.querySelector(`#cat-titulo-${a.dataset.grupo}`);
    h?.closest("section").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
    h?.focus({preventScroll: true});
  });

  // --------------------------------------------------------------- tarjetas
  const imagenes = [];
  function tarjeta(f) {
    const li = document.createElement("li");
    li.className = "cat-item";
    const m = f.miniatura;
    let mini;
    if (m && miniaturas[m.claro]) {
      mini = `<img alt="" loading="lazy" decoding="async" width="${m.ancho}" height="${m.alto}">`;
    } else mini = silueta(f.forma[0]);
    const sello = f.enGaleria
      ? `<span class="cat-sello cat-sello-galeria">En la galería</span>`
      : `<span class="cat-sello cat-sello-obra">En construcción</span>`;
    const contenido = `
      <span class="cat-mini${m ? "" : " cat-mini-silueta"}">${mini}</span>
      <h3 class="cat-nombre">${escapar(f.nombre)}</h3>
      <span class="cat-meta"><span class="cat-nivel-ficha">${pips(f.nivel)}${NIVELES[f.nivel]}</span><span>${escapar(f.familia.map((v) => nombreDe("familia", v)).join(", "))}</span>${sello}</span>
      <p class="cat-pregunta">${escapar(f.pregunta)}</p>`;
    const datos = `<details class="cat-detalle">
        <summary>Cuándo usarla<span class="solo-lector">: ${escapar(f.nombre)}</span></summary>
        <dl class="cat-usos">
          <dt>Úsala cuando</dt><dd>${escapar(f.si)}</dd>
          <dt>Evítala cuando</dt><dd>${escapar(f.no)}</dd>
          <dt>Datos</dt><dd><code>${escapar(f.datosForma)}</code></dd>
        </dl>
      </details>`;
    li.innerHTML = f.enGaleria
      ? `<article class="cat-tarjeta" id="forma-${f.id}">
          <a class="cat-enlace" href="${escapar(RAIZ() + f.destino)}">${contenido}
            <span class="cat-ir">Ver implementada <span aria-hidden="true">→</span></span></a>
          ${datos}</article>`
      : `<article class="cat-tarjeta cat-en-obra" id="forma-${f.id}">
          <div class="cat-enlace">${contenido}
            <span class="cat-ir cat-ir-pendiente">Llegará a ${escapar(f.paginaNombre)}</span></div>
          ${datos}</article>`;
    const img = li.querySelector("img");
    if (img) {
      img._mini = m;
      // Si falta la versión oscura, se queda la clara.
      img.addEventListener("error", () => { if (img.dataset.tema === "oscuro") { img.dataset.tema = "claro-de-respaldo"; img.src = miniaturas[m.claro]; } });
      imagenes.push(img);
    }
    f.nodo = li;
  }
  for (const f of LISTA) tarjeta(f);
  function pintarMiniaturas() {
    const tema = oscuro() ? "oscuro" : "claro";
    for (const img of imagenes) {
      if (img.dataset.tema === tema) continue;
      const m = img._mini;
      img.dataset.tema = tema;
      img.src = (tema === "oscuro" && m.oscuro && miniaturas[m.oscuro]) || miniaturas[m.claro];
    }
  }
  pintarMiniaturas();
  alCambiarModo(pintarMiniaturas);

  // ------------------------------------------------- agrupar, filtrar, pintar
  function agrupacion() {
    const dim = estado.vista === "todas" ? AGRUPAR_POR_OMISION : estado.vista;
    return {dim, grupoDe: (f) => (estado[dim] && f[dim].includes(estado[dim]) ? estado[dim] : f[dim][0])};
  }
  function actualizar() {
    const visibles = LISTA.filter((f) => cumple(f));
    const {dim, grupoDe} = agrupacion();
    const grupos = DIM[dim].lista
      .map((g) => ({...g, fichas: visibles.filter((f) => grupoDe(f) === g.id).sort((a, b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre, "es"))}))
      .filter((g) => g.fichas.length);

    $(".cat-grupos").replaceChildren(...grupos.map((g) => {
      const sec = document.createElement("section");
      sec.className = "cat-grupo";
      sec.id = `grupo-${g.id}`;
      sec.setAttribute("aria-labelledby", `cat-titulo-${g.id}`);
      sec.innerHTML = `<h2 class="cat-grupo-titulo" id="cat-titulo-${g.id}" tabindex="-1">${escapar(g.nombre)} <span class="cat-grupo-cuenta">${g.fichas.length}</span></h2>
        <p class="cat-grupo-desc">${escapar(g.desc)}</p><ul class="cat-rejilla"></ul>`;
      sec.querySelector(".cat-rejilla").append(...g.fichas.map((f) => f.nodo));
      return sec;
    }));
    $(".cat-indice").innerHTML = grupos.map((g) => `<li><a href="#grupo-${g.id}" data-grupo="${g.id}">${escapar(g.nombre)}</a> <span>${g.fichas.length}</span></li>`).join("");
    $(".cat-vacio").hidden = visibles.length > 0;
    const n = visibles.length;
    const enGaleria = visibles.filter((f) => f.enGaleria).length;
    $(".cat-cuenta").innerHTML = `<b>${n}</b> ${n === 1 ? "forma" : "formas"} de ${LISTA.length} · ${enGaleria} en la galería`;

    for (const t of $$("[role=tab]")) {
      const sel = t.dataset.vista === estado.vista;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
      const marca = t.querySelector("[data-marca]"), activo = estado[t.dataset.vista];
      marca.hidden = !activo;
      marca.innerHTML = activo ? `1<span class="solo-lector"> filtro activo</span>` : "";
    }
    for (const p of $$("[role=tabpanel]")) p.hidden = p.id !== `cat-panel-${estado.vista}`;

    // Opciones: estado y cuenta según los DEMÁS filtros.
    for (const d of DIMENSIONES) {
      const base = LISTA.filter((f) => cumple(f, d.id));
      for (const b of $$(`[data-dim="${d.id}"]`)) {
        const k = base.filter((f) => f[d.id].includes(b.dataset.valor)).length;
        const pulsado = estado[d.id] === b.dataset.valor;
        b.setAttribute("aria-pressed", String(pulsado));
        b.disabled = !pulsado && k === 0;
        b.querySelector("[data-cuenta]").textContent = k;
      }
    }
    for (const b of $$("[data-nivel]")) b.setAttribute("aria-pressed", String((estado.nivel ?? "todos") === b.dataset.nivel));
    if ($(".cat-buscar").value.trim() !== estado.texto) $(".cat-buscar").value = estado.texto;

    const activos = DIMENSIONES.filter((d) => estado[d.id]);
    const caja = $(".cat-activos");
    caja.hidden = !activos.length;
    caja.innerHTML = activos.length ? `<span>Filtros:</span>` + activos.map((d) =>
      `<button class="cat-activo" type="button" data-quitar="${d.id}" aria-label="Quitar el filtro ${d.nombre}: ${escapar(nombreDe(d.id, estado[d.id]))}">${escapar(d.nombre)}: ${escapar(nombreDe(d.id, estado[d.id]))}<span aria-hidden="true">×</span></button>`).join("") : "";
    $(".cat-quitar").disabled = !hayFiltros();
    nodo.dataset.visibles = String(n);
    escribirURL();
  }

  leerURL();
  actualizar();
  return nodo;
}

// Enlace al catálogo HTML con las recetas copiables. scripts/postbuild.mjs
// lo copia a dist/catalogo-recetas/ junto con sus fichas y miniaturas; se
// arma aquí y no en el .md para que Framework no lo tome por una página.
export function enlaceRecetas() {
  const p = document.createElement("p");
  p.className = "cat-recetas";
  p.innerHTML = `El código de cada forma, con su vista previa viva y la llamada al componente de la Plantilla, está en el <a href="${escapar(RAIZ())}catalogo-recetas/CatalogoGraficas.html">catálogo de recetas copiables</a>.`;
  return p;
}
