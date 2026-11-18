// formas/tabla-minigraficas.js
// ¿Cómo le fue a cada fila en el tiempo, con su último valor y su cambio
// escritos? Una tabla con una minigráfica de línea por fila, TODAS en la
// misma escala (dominio fijo), el valor del último corte y el cambio desde el
// primero, con el triángulo del color que declara el capítulo.
// No: dos o tres cortes (pendiente o flechas: una línea sugiere continuidad
// que no se midió).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, sentido} from "../paleta.js";
import {pct, puntos} from "../formato.js";
import {vacio} from "./comun.js";
import {globoCelda, itinerante, glifo} from "./tabla-interaccion.js";

// datos: [{nombre, filas: [...]}] una entrada por renglón con su serie.
// x(d) corte (año), valor(d) en %, ee(d) error (para el gris de «sin
// cambio claro»). `dominio`: FIJO del eje vertical. `cortes`: lista de
// cortes en orden. `orden`: "ultimo" | "cambio". `sig`: significado().
export function tablaMinigraficas(datos, {ancho, x, valor, ee = () => null, cortes, dominio, orden = "ultimo", sig, rotuloNombre = "Entidad", globo: g}) {
  const renglones = datos.map((r) => {
    const serie = r.filas.filter((d) => valor(d) != null).sort((a, b) => x(a) - x(b));
    if (serie.length < 2) return null;
    const a = serie[0], b = serie.at(-1);
    return {...r, serie, a, b, cambio: valor(b) - valor(a), s: sentido(valor(a), valor(b), {eeA: ee(a), eeB: ee(b)})};
  }).filter(Boolean).sort((p, q) => (orden === "cambio" ? q.cambio - p.cambio : valor(q.b) - valor(p.b)));
  if (!renglones.length) return vacio();
  const angosto = ancho < 560;
  const w = angosto ? 64 : Math.min(240, Math.round(ancho * 0.24)), h = 30;
  const sx = d3.scaleLinear([cortes[0], cortes.at(-1)], [4, w - 5]), sy = d3.scaleLinear(dominio, [h - 3, 3]).clamp(true);
  const linea = d3.line((d) => sx(x(d)), (d) => sy(valor(d)));
  const mini = (r) => svg`<svg class="tm-linea" width=${w} height=${h} aria-hidden="true">
    <line x1="4" x2=${w - 5} y1=${sy(dominio[0])} y2=${sy(dominio[0])} stroke=${P.rejilla} />
    <path d=${linea(r.serie)} fill="none" stroke=${P.serie} stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx=${sx(x(r.b))} cy=${sy(valor(r.b))} r="3.2" fill=${P.serie} />
  </svg>`;
  const cuerpo = renglones.map((r) => globoCelda(html`<tr>
    <th scope="row">${r.nombre}</th>
    <td class="gB-celda-svg">${mini(r)}</td>
    <td class="num gB-fuerte">${pct(valor(r.b))}</td>
    <td class="num tm-cambio">${glifo(r.s, sig.color(r.s), 10)} ${puntos(r.cambio).replace(/ puntos?$/, "")}<span class="solo-lector"> puntos, ${sig.etiqueta(r.s)}</span></td>
  </tr>`, g, r));
  itinerante(cuerpo);
  const presentes = new Set(renglones.map((r) => r.s));
  return html`<div class="forma gB-forma gB-tabla">
    <div class="leyenda-items">${["baja", "sube", "igual"].filter((k) => presentes.has(k)).map((k) => html`<span class="leyenda-item">${glifo(k, sig.color(k), 10)}<span>${sig.etiqueta(k)}</span></span>`)}</div>
    <table aria-label=${`Serie de ${cortes[0]} a ${cortes.at(-1)} por ${rotuloNombre.toLowerCase()}`}>
      <thead><tr>
        <th scope="col">${rotuloNombre}</th>
        <th scope="col">${cortes[0]} - ${cortes.at(-1)}<span class="gB-th-nota">escala de ${dominio[0]} a ${dominio[1]} %</span></th>
        <th scope="col" class=${`num${orden === "ultimo" ? " tc-orden" : ""}`}>${cortes.at(-1)}</th>
        <th scope="col" class=${`num${orden === "cambio" ? " tc-orden" : ""}`}>Cambio${angosto ? "" : ", en puntos"}</th>
      </tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>
  </div>`;
}
