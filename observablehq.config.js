// Plantilla de libro de datos de Social Data IBERO (Observable Framework).
//
// Para empezar un libro nuevo se copia esta carpeta y se edita el bloque
// LIBRO de abajo. De él salen el título del sitio, los metadatos Open Graph,
// la marca del menú, la portada, la cita, el crédito y el prefijo de las
// descargas, y el tono de tema. No se repite en ningún otro archivo.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {tokensCss, TONOS} from "./src/components/paleta.js";
import {menu} from "./scripts/paginas.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- LIBRO
export const LIBRO = {
  // Título completo y la palabra o frase del título que va en rojo.
  titulo: "Plantilla de libros de datos",
  clave: "libros de datos",
  // Identificador corto: prefijo de las descargas y llave de la cita BibTeX.
  slug: "plantilla-libro",
  // UN párrafo: es el resumen de la portada, la descripción para buscadores
  // y el abstract de CITATION.cff (este último se copia a mano).
  descripcion: "Es el punto de partida de los libros de datos de Social Data IBERO. Trae la anatomía de una sección, la galería y el catálogo de formas de gráfica, la muestra de colores, un mapa de flujos, los verificadores y el despliegue. Cada libro nuevo se crea copiándola. Todas sus cifras son datos de muestra.",
  // Autores en orden. `orcid` y `correo` son optativos.
  autores: [
    {nombre: "Nombre", apellidos: "Apellido Apellido", orcid: null, correo: "correo@ibero.mx", correspondencia: true},
    {nombre: "Nombre", apellidos: "Segundo Autor", orcid: null},
  ],
  afiliacion: "Social Data IBERO",
  institucion: "Universidad Iberoamericana, Ciudad de México",
  editorial: "Social Data IBERO, Universidad Iberoamericana",
  ciudad: "Ciudad de México",
  anio: 2026,
  fuentes: "Datos de muestra",
  doi: null,            // "10.5281/zenodo.0000000" cuando se emita
  licencia: null,       // "CC BY 4.0" cuando se defina
  credito: "Social Data IBERO, Universidad Iberoamericana",
  contacto: "socialdata@ibero.mx",
  sitio: "https://socialdata.ibero.mx",
  // Tono de tema: color de la serie única y de la rampa de magnitud. Un
  // nombre de TONOS (src/components/paleta.js) o un objeto {claro, oscuro}.
  // Rojo y azul quedan reservados para lo desfavorable y lo favorable.
  tono: "rojoIbero",
  // Imagen de vista previa. Cambia de NOMBRE cuando cambia la portada: las
  // redes guardan la vista previa por su dirección.
  imagenOg: "images/og-portada-2026-11.png",
};
if (typeof LIBRO.tono === "string" && !TONOS[LIBRO.tono]) throw new Error("LIBRO.tono no existe en TONOS de paleta.js");

// Descripción propia de cada página para buscadores y vistas previas. Va aquí
// y no en el front matter: Framework descarta las claves que no conoce.
const DESCRIPCIONES = {
  "/": LIBRO.descripcion,
  "/seccion-modelo": "Una sección completa con la anatomía estándar: filtros, cifras, figura y los tres desplegables.",
  "/mapa": "Mapa de flujos a pantalla completa: de qué entidad a qué entidad cambiaron de residencia las personas, con datos de muestra.",
  "/catalogo": "Índice de todas las formas de gráfica de la Plantilla, por familia, entrada, función y figura, con enlace a cada forma implementada en la galería.",
  "/colores": "Muestra de colores: nueve propuestas de paleta para los libros de datos sobre las mismas cinco gráficas de muestra, con el resultado del validador de daltonismo y contraste en claro y en oscuro.",
  "/metodologia": "Fuentes, universos y cómo se calculó cada análisis.",
  "/referencias": "Obras citadas y fuentes de datos.",
};

// Ruta base del sitio. En GitHub Pages el libro vive en /<repo>/; en local y
// en un dominio propio, en la raíz.
const BASE = process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY
  ? "/" + process.env.GITHUB_REPOSITORY.split("/")[1] + "/"
  : "/";
const SITE_URL = process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY
  ? `https://${process.env.GITHUB_REPOSITORY.split("/")[0]}.github.io${BASE}`
  : "http://localhost:3000/";

// El logo del menú se inlina como texto SVG: Framework no reescribe rutas
// dentro de `home`, así que una ruta relativa se rompe bajo un subdirectorio.
const logoSidebar = fs.readFileSync(path.join(__dirname, "src/images/social_data_original.svg")).toString("utf8");
const escapar = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default {
  title: LIBRO.titulo,
  root: "src",
  style: "estilo.css",
  // Newsreader para la lectura y los títulos; Schibsted Grotesk para la
  // interfaz, los rótulos y las cifras. Como hoja global, no con @import.
  globalStylesheets: [
    "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..700&family=Schibsted+Grotesk:wght@400..800&display=swap",
  ],
  toc: {label: "En esta página"},
  search: true,
  base: BASE,
  // Carpeta de salida: OBS_SALIDA permite que varios builds corran a la vez
  // sin pisarse. Por omisión, dist.
  output: process.env.OBS_SALIDA || "dist",
  pages: menu(),

  home: `<span class="sidebar-brand">
  <span class="sidebar-brand-logo" aria-hidden="true">${logoSidebar}</span>
  <span class="sidebar-brand-text"><span class="sidebar-brand-title">${escapar(LIBRO.titulo)}</span></span>
</span>`,

  // `head` es función para recibir el título y la ruta de cada página.
  head: ({title, path: ruta0}) => {
    const ruta = ruta0.replace(/\/index$/, "/");
    const descripcion = escapar(DESCRIPCIONES[ruta] ?? LIBRO.descripcion);
    const tituloCompleto = escapar(title && title !== LIBRO.titulo ? `${title} | ${LIBRO.titulo}` : LIBRO.titulo);
    const url = SITE_URL.replace(/\/$/, "") + ruta;
    const imagen = `${SITE_URL}${LIBRO.imagenOg}`;
    // Prefijo relativo hasta la raíz del sitio, para los enlaces que arma el
    // JavaScript (botón a Metodología, citas a Referencias).
    const raiz = "../".repeat(Math.max(0, ruta.split("/").length - 2)) || "./";
    return `<link rel="icon" href="/images/social_data_original.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<meta name="author" content="${escapar(LIBRO.credito)}">
<meta name="description" content="${descripcion}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapar(LIBRO.titulo)}">
<meta property="og:title" content="${tituloCompleto}">
<meta property="og:description" content="${descripcion}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imagen}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_MX">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${tituloCompleto}">
<meta name="twitter:description" content="${descripcion}">
<meta name="twitter:image" content="${imagen}">
<style id="tokens-color">${tokensCss(LIBRO.tono)}</style>
<script>
// El bloque LIBRO de la configuracion, para los componentes del navegador.
window.__LIBRO = ${JSON.stringify(LIBRO).replace(/</g, "\\u003c")};
window.__RAIZ = ${JSON.stringify(raiz)};
// Tema guardado ANTES de pintar. El libro es CLARO por omision, tambien para
// quien tenga el sistema en oscuro: el modo oscuro es una eleccion del lector.
(() => {
  document.documentElement.lang = "es";
  let tema = "claro";
  try {
    const guardado = localStorage.getItem("sdi-tema");
    if (guardado === "oscuro" || guardado === "claro") tema = guardado;
  } catch (e) { /* modo privado: sin preferencia guardada */ }
  document.documentElement.setAttribute("data-tema", tema);
})();
</script>
<script>
// Chrome del sitio: enlace de salto, boton de tema, paneles de filtros
// pegajosos y parches de accesibilidad sobre lo que Framework genera.
(() => {
  const medir = () => {
    const sidebar = document.querySelector("#observablehq-sidebar");
    if (sidebar && !sidebar.getAttribute("aria-label")) sidebar.setAttribute("aria-label", "Navegacion principal");
    const toc = document.querySelector("#observablehq-toc nav") ?? document.querySelector("#observablehq-toc");
    if (toc && !toc.getAttribute("aria-label")) toc.setAttribute("aria-label", "En esta pagina");
  };
  const salto = () => {
    const main = document.querySelector("#observablehq-main");
    if (!main || document.querySelector(".saltar-contenido")) return;
    const a = document.createElement("a");
    a.className = "saltar-contenido";
    a.href = "#observablehq-main";
    a.textContent = "Saltar al contenido";
    main.setAttribute("tabindex", "-1");
    document.body.insertBefore(a, document.body.firstChild);
  };
  const botonTema = () => {
    if (document.querySelector(".boton-tema")) return;
    const sidebar = document.querySelector("#observablehq-sidebar");
    const marca = sidebar && (sidebar.querySelector("li:has(.sidebar-brand)") ?? sidebar.querySelector(".sidebar-brand")?.closest("li") ?? sidebar.firstElementChild);
    if (!marca) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "boton-tema";
    const pintar = () => {
      const oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
      b.setAttribute("aria-pressed", String(oscuro));
      b.title = oscuro ? "Cambiar a fondo claro" : "Cambiar a fondo oscuro";
      b.innerHTML =
        '<span class="boton-tema-icono" aria-hidden="true">' +
        (oscuro
          ? '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11.5A7.5 7.5 0 0 1 8.5 3a7.5 7.5 0 1 0 8.5 8.5z"/></svg>'
          : '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="3.6"/><path d="M10 1.6v2M10 16.4v2M18.4 10h-2M3.6 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5 4.1 4.1"/></svg>') +
        "</span>" +
        '<span class="boton-tema-texto">Fondo oscuro</span>';
    };
    b.addEventListener("click", () => {
      const oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
      const nuevo = oscuro ? "claro" : "oscuro";
      document.documentElement.setAttribute("data-tema", nuevo);
      try { localStorage.setItem("sdi-tema", nuevo); } catch (e) { /* solo esta pestana */ }
      pintar();
      // Las graficas son SVG ya pintado: se avisa para que se redibujen.
      dispatchEvent(new CustomEvent("sdi:tema", {detail: {oscuro: !oscuro}}));
    });
    pintar();
    // <li> y no <div>: la marca vive dentro de un <ol>, que solo admite <li>.
    const caja = document.createElement("li");
    caja.className = "boton-tema-caja";
    caja.appendChild(b);
    marca.insertAdjacentElement("afterend", caja);
  };

  // Paneles de filtros pegajosos en todas las secciones, compactos al fijarse.
  // Un centinela de alto cero antes del panel dice cuando esta fijo. Al
  // compactarse el panel NO cambia el largo de la pagina: una reserva justo
  // despues toma el alto que el panel suelta. Sin eso, cerca del final de la
  // seccion la pagina tiembla sola (npm run verificar:quieto).
  let vigiaPanel = null;
  let yEstable = scrollY;
  addEventListener("scroll", () => { yEstable = scrollY; }, {passive: true});
  const panelesCompactos = () => {
    const posSiguiente = (panel) => {
      const sig = panel.reserva.nextElementSibling;
      const sec = panel.parentElement.getBoundingClientRect();
      return sig ? sig.getBoundingClientRect().top - sec.top : sec.height;
    };
    const fijar = (panel, pegar) => {
      if (panel.classList.contains("pegado") === pegar) return;
      const reserva = panel.reserva;
      if (!pegar) { panel.classList.remove("pegado", "abierto"); reserva.style.height = "0px"; reserva.style.marginTop = "0px"; return; }
      // Compactar y compensar pasa por un estado intermedio (panel ya chico,
      // reserva aun sin margen) que se mide con un layout forzado. Chrome
      // elige ahi su ancla de scroll; al volver el contenido a su lugar cree
      // que el ancla bajo y baja la pagina el alto que solto el panel. Al
      // SUBIR, el panel de la seccion de arriba se fija al asomar y cada paso
      // de rueda perdia ~150 px (docs/scroll-bug.md). El cambio neto es cero
      // por construccion: el anclaje se apaga solo durante la operacion.
      const raiz = document.documentElement;
      const anclaPrevia = raiz.style.overflowAnchor;
      raiz.style.overflowAnchor = "none";
      const antes = posSiguiente(panel);
      panel.classList.add("pegado");
      reserva.style.height = "1px";
      let margen = 0;
      for (let i = 0; i < 3; i++) {
        margen += antes - posSiguiente(panel);
        reserva.style.marginTop = margen + "px";
      }
      void raiz.offsetHeight;
      raiz.style.overflowAnchor = anclaPrevia;
    };
    // Se compacta solo cuando el contenido que sigue al panel ya llego a la
    // barra compacta. Antes de eso el panel completo queda fijo y tapa la
    // franja que soltaria al compactarse; si se compactara apenas se fija, la
    // reserva quedaria a la vista como un hueco vacio de unos 150 px bajo la
    // barra. El largo de la pagina sigue igual en los dos estados.
    const evaluar = (seccion, visible) => {
      for (const [panel, centinela] of seccion.panelesDentro ?? []) {
        if (!panel.classList.contains("pegado")) panel.alturaLlena = panel.offsetHeight;
        const umbral = Math.max(0, (panel.alturaLlena || 0) - (panel.alturaCompacta || 56));
        fijar(panel, visible && centinela.getBoundingClientRect().top < -umbral);
        if (panel.classList.contains("pegado")) panel.alturaCompacta = panel.offsetHeight;
      }
    };
    const seccionesVisibles = new Set();
    let pendiente = false;
    if (!vigiaPanel && "IntersectionObserver" in window) addEventListener("scroll", () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => { pendiente = false; for (const s of seccionesVisibles) evaluar(s, true); });
    }, {passive: true});
    vigiaPanel ??= ("IntersectionObserver" in window) ? new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) seccionesVisibles.add(e.target); else seccionesVisibles.delete(e.target);
        evaluar(e.target, e.isIntersecting);
      }
    }, {threshold: [0, 1]}) : null;
    let n = 0;
    // Un panel con data-sin-pegar (el del mapa a pantalla completa, que vive
    // en su propia columna con scroll) no se fija ni se compacta.
    for (const panel of document.querySelectorAll("#observablehq-main .panel-filtros:not([data-compacto]):not([data-sin-pegar])")) {
      panel.setAttribute("data-compacto", "");
      if (!panel.id) panel.id = "panel-filtros-" + (++n) + "-" + Math.random().toString(36).slice(2, 7);
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "panel-boton";
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-controls", panel.id);
      boton.textContent = "Filtros";
      boton.addEventListener("click", () => {
        const abierto = panel.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", String(abierto));
        boton.textContent = abierto ? "Cerrar filtros" : "Filtros";
      });
      panel.prepend(boton);
      // Al recibir el foco un control del panel fijo, el navegador lo trae a
      // la vista con la posicion que tenia antes de fijarse. Se devuelve.
      panel.addEventListener("focusin", () => {
        if (!panel.classList.contains("pegado")) return;
        const y = yEstable;
        requestAnimationFrame(() => { if (Math.abs(scrollY - y) > 40) scrollTo({top: y, behavior: "instant"}); });
      });
      const centinela = document.createElement("div");
      centinela.className = "panel-centinela";
      centinela.setAttribute("aria-hidden", "true");
      panel.before(centinela);
      const reserva = document.createElement("div");
      reserva.className = "panel-reserva";
      reserva.setAttribute("aria-hidden", "true");
      reserva.style.height = "0px";
      panel.after(reserva);
      panel.reserva = reserva;
      const seccion = panel.parentElement;
      seccion.panelesDentro ??= [];
      seccion.panelesDentro.push([panel, centinela]);
      vigiaPanel?.observe(seccion);
    }
  };

  const buscadorEnEspanol = () => {
    const input = document.querySelector("#observablehq-search input[type=search]");
    if (!input || input.placeholder === "Buscar") return;
    input.placeholder = "Buscar";
    input.setAttribute("aria-label", "Buscar en el sitio");
  };
  const accesibilidadChrome = () => {
    const sidebar = document.querySelector("#observablehq-sidebar");
    if (!sidebar) return;
    for (const t of sidebar.querySelectorAll("label[for='observablehq-sidebar-toggle']")) {
      if (t.textContent.trim()) continue;
      const s = document.createElement("span");
      s.className = "solo-lector";
      s.textContent = "Ocultar el menu";
      t.appendChild(s);
    }
    const toggle = document.querySelector("#observablehq-sidebar-toggle");
    if (toggle && !toggle.getAttribute("aria-label")) toggle.setAttribute("aria-label", "Mostrar u ocultar el menu");
    for (const ol of sidebar.querySelectorAll("ol")) {
      for (const hijo of [...ol.children]) {
        if (!/^(LI|SCRIPT|TEMPLATE)$/.test(hijo.tagName)) {
          const li = document.createElement("li");
          li.className = "li-envoltorio";
          ol.insertBefore(li, hijo);
          li.appendChild(hijo);
        }
      }
    }
  };
  const accesibilidadFiguras = () => {
    for (const g of document.querySelectorAll("#observablehq-main svg g[aria-label]:not([role])")) g.setAttribute("role", "group");
    for (const r of document.querySelectorAll('#observablehq-main svg rect[aria-label="frame"]')) r.removeAttribute("aria-label");
    for (const fig of document.querySelectorAll("#observablehq-main figure.figura")) {
      const titulo = fig.querySelector("h3")?.textContent?.trim();
      for (const svg of fig.querySelectorAll(".figura-cuerpo svg")) {
        if (svg.getAttribute("role") || svg.parentElement.closest("svg")) continue;
        // Un dibujo con marcas enfocables es un grupo; uno sin ellas, una imagen.
        svg.setAttribute("role", svg.querySelector("[tabindex]") ? "group" : "img");
        svg.setAttribute("aria-label", titulo ? "Grafica: " + titulo : "Grafica");
      }
    }
  };
  const arrancar = () => {
    medir();
    salto();
    botonTema();
    panelesCompactos();
    buscadorEnEspanol();
    accesibilidadChrome();
    accesibilidadFiguras();
    const main = document.querySelector("#observablehq-main");
    if (main && window.MutationObserver) {
      let pendiente = null;
      new MutationObserver(() => {
        if (pendiente) return;
        pendiente = setTimeout(() => { pendiente = null; accesibilidadFiguras(); panelesCompactos(); }, 120);
      }).observe(main, {childList: true, subtree: true});
    }
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
</script>`;
  },

  // Sin header: su enlace ya vive en el pie y en la marca del menú.

  footer: `<div class="pie-libro">
  <div class="instituciones-fila">
    <span class="instituciones-rotulo">Un proyecto de</span>
    <a class="instituciones-chip" href="https://ibero.mx" target="_blank" rel="noopener"><img src="/images/ibero/ibero-logo-color.webp" alt="Universidad Iberoamericana Ciudad de México"></a>
    <a class="instituciones-chip" href="${LIBRO.sitio}" target="_blank" rel="noopener"><img src="/images/social_data_original.svg" alt="Social Data IBERO"></a>
  </div>
  <div class="pie-rejilla">
    <div>
      <p class="pie-titulo">Explorar</p>
      <p><a href="/">Inicio</a></p>
      <p><a href="/seccion-modelo">Sección modelo</a></p>
      <p><a href="/mapa">Mapa de flujos</a></p>
      <p><a href="/catalogo">Catálogo de formas</a></p>
    </div>
    <div>
      <p class="pie-titulo">Datos y método</p>
      <p>Fuentes: ${escapar(LIBRO.fuentes)}</p>
      <p><a href="/metodologia">Metodología</a> · <a href="/referencias">Referencias</a></p>
    </div>
    <div>
      <p class="pie-titulo">Contacto</p>
      <p><a href="mailto:${LIBRO.contacto}">${LIBRO.contacto}</a></p>
      <p><a href="${LIBRO.sitio}" target="_blank" rel="noopener">${LIBRO.sitio.replace(/^https?:\/\//, "")}</a></p>
    </div>
  </div>
  <div class="pie-base">
    <span>&copy; ${LIBRO.anio} ${escapar(LIBRO.credito)}</span>
    <span>Construido con <a href="https://observablehq.com/framework/" target="_blank" rel="noopener">Observable Framework</a></span>
  </div>
</div>`,
};
