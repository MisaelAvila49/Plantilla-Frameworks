// src/components/portada.js
// Portada editorial del libro: hero con la tapa en perspectiva, metadatos y
// «Cómo citar». Todo sale del bloque LIBRO de la configuración, así que el
// título, los autores, el año, el DOI y la cita no se escriben dos veces.

import {html, svg} from "npm:htl";
import {P, rampaClara} from "./paleta.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "./geografia.js";
import {aSlug} from "./formato.js";

const romano = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]
  .reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");

// Título con la palabra clave en rojo (dentro de <span class="clave"> o <em>).
function tituloCon(libro, etiqueta) {
  const {titulo, clave} = libro;
  const i = clave ? titulo.indexOf(clave) : -1;
  if (i < 0) return titulo;
  const marca = etiqueta === "em" ? html`<em>${clave}</em>` : html`<span class="clave">${clave}</span>`;
  return [titulo.slice(0, i), marca, titulo.slice(i + clave.length)];
}

// Dibujo de muestra para la tapa: el mosaico de las 32 entidades con la
// rampa del tono de tema. REPRESENTA el dato sin imprimir cifras ni rótulos
// que haya que leer a media escala. Usa la rampa clara en los dos temas,
// porque la tapa es un objeto claro también de noche. Cada libro lo cambia
// por un dibujo propio que sostenga su tesis.
export function tapaMosaico(valores, dominio = [0, 100]) {
  const c = 20, rampa = rampaClara();
  const cuadros = ENTIDADES.map((e) => {
    const [col, fila] = REJILLA[e.cve], v = valores.get(e.cve);
    const t = v == null ? null : (v - dominio[0]) / (dominio[1] - dominio[0]);
    return svg`<rect x=${col * c + 1.5} y=${fila * c + 1.5} width=${c - 3} height=${c - 3} rx="2.5" fill=${t == null ? P.tapaLomo : rampa(t)} />`;
  });
  return svg`<svg viewBox="0 0 ${REJILLA_COLUMNAS * c} ${REJILLA_FILAS * c}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${cuadros}</svg>`;
}

// Hero: texto a la izquierda y libro claro en perspectiva a la derecha.
// Dos composiciones de tapa:
// - `dibujo` (la de omisión): sello, dibujo al centro, título y pie con lugar y año.
// - `imagen`: la ilustración del tema, grande (R184). Sello rojo y título arriba,
//   la figura debajo y el año con el logo abajo, sobre papel crema. Se pasa
//   {url, izquierda, abajo, ancho}, en % del ancho de la tapa (cqw), para que
//   la figura no tape el título ni el pie. Si llega `imagen`, `dibujo` no se usa.
// Los dos botones llevan a `explorar` y a `metodo`; su texto se cambia con
// `textoExplorar` y `textoMetodo` (la Plantilla los usa para su propia portada).
export function portada(libro, {dibujo = null, imagen = null, explorar = "./seccion-modelo", metodo = "./metodologia", textoExplorar = "Explorar los datos", textoMetodo = "Cómo se hizo", antetitulo = "Datos estadísticos · Social Data IBERO", logo = null} = {}) {
  const conImagen = Boolean(imagen?.url);
  return html`<div class="portada">
    <div class="portada-texto">
      <span class="portada-antetitulo">${antetitulo}</span>
      <h1 class="portada-titulo">${tituloCon(libro, "span")}</h1>
      <p class="portada-resumen">${libro.descripcion}</p>
      <div class="portada-botones">
        <a class="boton boton-principal" href=${explorar}>${textoExplorar}</a>
        <a class="boton" href=${metodo}>${textoMetodo}</a>
      </div>
    </div>
    <div class="lugar-libro" aria-hidden="true">
      <div class=${conImagen ? "libro libro--imagen" : "libro"}>
        <div class="hojas"></div>
        ${conImagen ? tapaConImagen(libro, imagen, logo) : html`<div class="tapa">
          <span class="tapa-sello">Social Data Ibero</span>
          <div class="tapa-dibujo">${dibujo ?? ""}</div>
          <p class="tapa-titulo">${tituloCon(libro, "em")}</p>
          <div class="tapa-pie">
            <span class="tapa-lugar"><span>${libro.ciudad}</span><span>${romano(libro.anio)}</span></span>
            ${logosTapa(logo)}
          </div>
        </div>`}
      </div>
    </div>
  </div>`;
}

// Tapa con la ilustración del tema (opción `imagen` de portada()).
// Logos del pie de la tapa, juntos a la derecha (el año o el lugar va a la
// izquierda) y alineados por abajo. `logo` es una URL o una lista (proyectos
// conjuntos: el logo de cada institución, en el mismo tono monocromo); cada
// elemento es una URL o {url, clase}: la clase ajusta su tamaño (un logo muy
// ancho se ajusta por alto con `tapa-logo--ancho`).
const logosTapa = (logo) => {
  const lista = [logo].flat().filter(Boolean).map((l) => (typeof l === "string" ? {url: l} : l));
  return lista.length ? html`<span class="tapa-logos">${lista.map((l) => html`<img class=${`tapa-logo${l.clase ? " " + l.clase : ""}`} src=${l.url} alt="">`)}</span>` : "";
};

function tapaConImagen(libro, {url, izquierda = 8, abajo = 18, ancho = 80}, logo) {
  return html`<div class="tapa tapa--imagen">
    <span class="tapa-sello">Social Data Ibero</span>
    <p class="tapa-titulo">${tituloCon(libro, "em")}</p>
    <img class="tapa-imagen" src=${url} alt="" style=${`left:${izquierda}cqw;bottom:${abajo}cqw;width:${ancho}cqw`}>
    <div class="tapa-pie">
      <span class="tapa-anio">${romano(libro.anio)}</span>
      ${logosTapa(logo)}
    </div>
  </div>`;
}

// Bloque de metadatos (R185). Los autores van primero, en su propio renglón
// y en serif, con el ícono oficial de ORCID en su verde (#A6CE39, que es de
// la marca y no cambia con el tema) y el sobre del correo en rojo. Debajo, la
// rejilla de los demás datos: rótulo rojo en mayúsculas chicas (el mismo de
// los grupos de filtros y del número de sección), valor en peso normal y
// subtítulo en gris. Lo que falta («por asignar», «por definir») va en gris
// itálico.
const ICONO_ORCID = svg`<svg class="orcid-icono" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="#A6CE39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"/><path fill="#fff" d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"/></svg>`;

export function metadatos(libro) {
  const nombre = (a) => `${a.nombre} ${a.apellidos}`;
  // El nombre accesible incluye el texto visible «iD» del ícono (WCAG 2.5.3).
  const orcid = (a) => (a.orcid ? html`<a class="autor-orcid" href=${`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener" aria-label=${`ORCID iD de ${nombre(a)}`}>${ICONO_ORCID.cloneNode(true)}</a>` : "");
  const correo = (a) => (a.correo ? html`<a class="autor-correo" href=${`mailto:${a.correo}`} aria-label=${`Correo de ${nombre(a)}`}><svg class="correo-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><polyline points="22,7 12,14 2,7"/></svg></a>` : "");
  const pendiente = (t) => html`<span class="meta-valor meta-pendiente">${t}</span>`;
  const campo = (rotulo, valor, sub, clase = "") => html`<div class=${`meta-campo ${clase}`.trim()}><span class="meta-rotulo">${rotulo}</span>${valor}${sub ? html`<span class="meta-sub">${sub}</span>` : ""}</div>`;
  return html`<section class="meta-rejilla" aria-label="Información editorial">
    <div class="meta-autores">
      <span class="meta-rotulo">Autores</span>
      <ul class="autores">${libro.autores.map((a) => html`<li><span class="autor-nombre">${nombre(a)}</span>${orcid(a)}${correo(a)}${a.correspondencia ? html`<span class="autor-nota">autor de correspondencia</span>` : ""}</li>`)}</ul>
    </div>
    <div class="meta-datos">
      ${campo("Afiliación", html`<span class="meta-valor">${libro.afiliacion}</span>`, libro.institucion, "meta-campo--largo")}
      ${campo("Año", html`<span class="meta-valor">${libro.anio}</span>`)}
      ${campo("Fuentes", html`<span class="meta-valor">${libro.fuentes}</span>`, html`<a class="meta-enlace" href="./referencias">Ver las referencias</a>`, "meta-campo--largo")}
      ${campo("DOI", libro.doi ? html`<span class="meta-valor"><a class="meta-enlace" href=${`https://doi.org/${libro.doi}`} target="_blank" rel="noopener">${libro.doi}</a></span>` : pendiente("por asignar"))}
      ${campo("Licencia", libro.licencia ? html`<span class="meta-valor">${libro.licencia}</span>` : pendiente("por definir"))}
    </div>
  </section>`;
}

// Las cuatro citas, derivadas de LIBRO.
export function citas(libro) {
  const A = libro.autores, doi = libro.doi ? `https://doi.org/${libro.doi}` : "";
  const iniciales = (a) => a.nombre.split(/\s+/).map((p) => p[0] + ".").join(" ");
  const unir = (lista, y) => (lista.length <= 1 ? lista.join("") : lista.slice(0, -1).join(", ") + ` ${y} ` + lista.at(-1));
  const apa = unir(A.map((a) => `${a.apellidos}, ${iniciales(a)}`), "&").replace(/ & /, A.length > 2 ? ", & " : " & ");
  const chicago = unir(A.map((a, i) => (i === 0 ? `${a.apellidos}, ${a.nombre}` : `${a.nombre} ${a.apellidos}`)), "y");
  const ieee = unir(A.map((a) => `${iniciales(a)} ${a.apellidos}`), "y");
  const tex = (t) => t.replace(/[áéíóúÁÉÍÓÚñÑ]/g, (c) => ({á: "{\\'a}", é: "{\\'e}", í: "{\\'i}", ó: "{\\'o}", ú: "{\\'u}", Á: "{\\'A}", É: "{\\'E}", Í: "{\\'I}", Ó: "{\\'O}", Ú: "{\\'U}", ñ: "{\\~n}", Ñ: "{\\~N}"})[c]);
  const llave = `${aSlug(A[0]?.apellidos ?? "autor").replace(/-/g, "")}${libro.anio}${aSlug(libro.slug).replace(/-/g, "")}`;
  return {
    apa: {nombre: "APA 7", partes: [`${apa} (${libro.anio}). `, html`<em>${libro.titulo}</em>`, `. ${libro.editorial}.${doi ? " " + doi : ""}`]},
    chicago: {nombre: "Chicago", partes: [`${chicago}. `, html`<em>${libro.titulo}</em>`, `. ${libro.ciudad}: ${libro.editorial}, ${libro.anio}.${doi ? " " + doi + "." : ""}`]},
    ieee: {nombre: "IEEE", partes: [`${ieee}, `, html`<em>${libro.titulo}</em>`, `. ${libro.ciudad}: ${libro.editorial}, ${libro.anio}.${doi ? " [En línea]. Disponible en: " + doi : ""}`]},
    bibtex: {nombre: "BibTeX", codigo: `@misc{${llave},
  title     = {${tex(libro.titulo)}},
  author    = {${A.map((a) => tex(`${a.apellidos}, ${a.nombre}`)).join(" and ")}},
  year      = {${libro.anio}},
  publisher = {${tex(libro.editorial)}},
  address   = {${tex(libro.ciudad)}},
  howpublished = {Plataforma de datos}${libro.doi ? `,\n  doi       = {${libro.doi}}` : ""}
}`},
  };
}

// «Cómo citar»: pestañas APA, Chicago, IEEE y BibTeX, con botón de copiar.
export function comoCitar(libro) {
  const c = citas(libro), llaves = Object.keys(c);
  const aviso = html`<div class="cita-aviso" role="status" aria-live="polite"></div>`;
  const paneles = llaves.map((k, i) => {
    const texto = c[k].codigo ? html`<pre class="cita-texto">${c[k].codigo}</pre>` : html`<p class="cita-texto">${c[k].partes}</p>`;
    const copiar = html`<button type="button" class="cita-copiar" aria-label=${`Copiar la cita en formato ${c[k].nombre}`}>Copiar</button>`;
    copiar.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(texto.textContent.trim()); aviso.textContent = "Cita copiada al portapapeles."; }
      catch { aviso.textContent = "No se pudo copiar; selecciona el texto y cópialo a mano."; }
    });
    const panel = html`<div class="cita-panel" id=${`cita-${k}`} role="tabpanel" aria-labelledby=${`pestana-${k}`}>${texto}${copiar}</div>`;
    panel.hidden = i !== 0;
    return panel;
  });
  const pestanas = llaves.map((k, i) => {
    const b = html`<button type="button" class="cita-pestana" role="tab" id=${`pestana-${k}`} aria-controls=${`cita-${k}`} aria-selected=${String(i === 0)}>${c[k].nombre}</button>`;
    b.addEventListener("click", () => {
      pestanas.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      paneles.forEach((p, j) => { p.hidden = j !== i; });
    });
    return b;
  });
  return html`<section id="citar" class="cita-bloque" aria-labelledby="citar-titulo">
    <h2 id="citar-titulo">Cómo citar esta plataforma</h2>
    <p>Selecciona el formato que usa tu publicación.</p>
    <div class="cita-pestanas" role="tablist" aria-label="Formato de la cita">${pestanas}</div>
    ${paneles}
    ${aviso}
  </section>`;
}
