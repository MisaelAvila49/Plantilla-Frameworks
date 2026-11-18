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
export function portada(libro, {dibujo = null, explorar = "./seccion-modelo", metodo = "./metodologia", antetitulo = "Datos estadísticos · Social Data IBERO", logo = null} = {}) {
  return html`<div class="portada">
    <div class="portada-texto">
      <span class="portada-antetitulo">${antetitulo}</span>
      <h1 class="portada-titulo">${tituloCon(libro, "span")}</h1>
      <p class="portada-resumen">${libro.descripcion}</p>
      <div class="portada-botones">
        <a class="boton boton-principal" href=${explorar}>Explorar los datos</a>
        <a class="boton" href=${metodo}>Cómo se hizo</a>
      </div>
    </div>
    <div class="lugar-libro" aria-hidden="true">
      <div class="libro">
        <div class="hojas"></div>
        <div class="tapa">
          <span class="tapa-sello">Social Data Ibero</span>
          <div class="tapa-dibujo">${dibujo ?? ""}</div>
          <p class="tapa-titulo">${tituloCon(libro, "em")}</p>
          <div class="tapa-pie">
            <span class="tapa-lugar"><span>${libro.ciudad}</span><span>${romano(libro.anio)}</span></span>
            ${logo ? html`<img class="tapa-logo" src=${logo} alt="">` : ""}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// Rejilla de metadatos: autores con ORCID, afiliación, año, fuentes, DOI y licencia.
export function metadatos(libro) {
  const nombre = (a) => `${a.nombre} ${a.apellidos}`;
  const orcid = (a) => (a.orcid ? html`<a href=${`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener" aria-label=${`ORCID de ${nombre(a)}`}><svg class="orcid-icono" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="currentColor"/><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="700" fill=${P.fondo} font-family="sans-serif">iD</text></svg></a>` : "");
  const correo = (a) => (a.correo ? html`<a href=${`mailto:${a.correo}`} aria-label=${`Correo de ${nombre(a)}`}><svg class="correo-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><polyline points="22,7 12,14 2,7"/></svg></a>` : "");
  const pendiente = (t) => html`<span class="meta-valor meta-pendiente">${t}</span>`;
  return html`<section class="meta-rejilla" aria-label="Información editorial">
    <div class="meta-campo meta-campo--ancho">
      <span class="meta-rotulo">Autores</span>
      <ul class="autores">${libro.autores.map((a) => html`<li>${nombre(a)} ${orcid(a)} ${correo(a)} ${a.correspondencia ? html`<span class="autor-nota">autor de correspondencia</span>` : ""}</li>`)}</ul>
    </div>
    <div class="meta-campo"><span class="meta-rotulo">Afiliación</span><span class="meta-valor">${libro.afiliacion}</span><span class="meta-sub">${libro.institucion}</span></div>
    <div class="meta-campo"><span class="meta-rotulo">Año</span><span class="meta-valor">${libro.anio}</span></div>
    <div class="meta-campo"><span class="meta-rotulo">Fuentes</span><span class="meta-valor">${libro.fuentes}</span><span class="meta-sub">${libro.fuentesDetalle ?? ""}</span></div>
    <div class="meta-campo"><span class="meta-rotulo">DOI</span>${libro.doi ? html`<span class="meta-valor"><a href=${`https://doi.org/${libro.doi}`} target="_blank" rel="noopener">${libro.doi}</a></span>` : pendiente("por asignar")}</div>
    <div class="meta-campo"><span class="meta-rotulo">Licencia</span>${libro.licencia ? html`<span class="meta-valor">${libro.licencia}</span>` : pendiente("por definir")}</div>
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
