// formas/tabla-barras.js
// ¿Cuánto vale cada fila, con la cifra exacta y su tamaño a la vista? Una
// tabla que se busca por nombre, con una barra dentro de la celda (todas en
// la misma escala) y la cifra al final de la barra. La referencia (el
// nacional) es una raya punteada en cada celda y se rotula en el encabezado.
// No: menos de seis filas (barras) ni varias medidas que se cruzan (tabla
// de calor).
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, entero} from "../formato.js";
import {vacio} from "./comun.js";
import {globoCelda, itinerante} from "./tabla-interaccion.js";

// datos: una fila por unidad. nombre(d), valor(d) en %, cantidad(d) el
// numerador expandido (hogares, personas). `dominio`: FIJO. `destacar`:
// nombre de una fila que se marca. `incierta(d)`: asterisco.
export function tablaBarras(datos, {ancho, nombre, valor, cantidad = null, unidad = "personas", referencia = null, dominio = [0, 100], destacar = null, incierta = () => false,
  rotuloNombre = "Entidad", rotuloValor = "Porcentaje", rotuloCantidad = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).sort((a, b) => valor(b) - valor(a));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  // En angosto la columna del nombre se queda con más de la mitad: la barra
  // toma 40 % del ancho para que el viewBox casi no tenga que encogerla.
  const anchoBarra = angosto ? Math.max(120, Math.min(ancho - 150, Math.round(ancho * 0.4))) : Math.min(520, Math.round(ancho * 0.48));
  // La cifra va dentro de la celda, a la derecha de la barra: se reserva
  // espacio para ella dentro del mismo SVG.
  const reserva = 58;
  const x = (v) => ((Math.max(dominio[0], Math.min(dominio[1], v)) - dominio[0]) / (dominio[1] - dominio[0])) * (anchoBarra - reserva);
  const barra = (d) => {
    const v = valor(d), w = Math.max(1, x(v));
    const tono = destacar == null || nombre(d) === destacar ? P.serie : P.contexto;
    // Con viewBox, si la columna es más angosta que la barra el navegador
    // escala el dibujo completo en vez de recortar la cifra.
    return svg`<svg class="tb-barra" width=${anchoBarra} height="22" viewBox=${`0 0 ${anchoBarra} 22`} style="max-width: 100%; height: auto;" aria-hidden="true">
      <rect x="0" y="5" width=${w} height="12" rx="2" fill=${tono} />
      ${referencia ? svg`<line x1=${x(referencia.valor)} x2=${x(referencia.valor)} y1="0" y2="22" stroke=${P.tinta2} stroke-width="1.4" stroke-dasharray="3 2"/>` : ""}
      <text x=${w + 6} y="15.5" font-size="13" font-weight="600" fill=${P.tinta} stroke=${P.fondo} stroke-width="3" paint-order="stroke">${pct(v)}${incierta(d) ? " *" : ""}</text>
    </svg>`;
  };
  const cuerpo = filas.map((d) => globoCelda(html`<tr class=${nombre(d) === destacar ? "gB-destacada" : ""}>
    <th scope="row">${nombre(d)}</th>
    <td class="gB-celda-svg">${barra(d)}<span class="solo-lector">${pct(valor(d))}</span></td>
    ${!angosto && cantidad ? html`<td class="num">${entero(cantidad(d))}</td>` : ""}
  </tr>`, g, d));
  itinerante(cuerpo);
  return html`<div class="forma gB-forma gB-tabla">
    <table aria-label=${`${rotuloValor} por ${rotuloNombre.toLowerCase()}`}>
      <thead><tr>
        <th scope="col">${rotuloNombre}</th>
        <th scope="col">${rotuloValor}${referencia ? html`<span class="gB-th-nota">${svg`<svg width="16" height="10" aria-hidden="true"><line x1="1" y1="5" x2="15" y2="5" stroke=${P.tinta2} stroke-width="1.4" stroke-dasharray="3 2"/></svg>`} ${referencia.texto}</span>` : ""}</th>
        ${!angosto && cantidad ? html`<th scope="col" class="num">${rotuloCantidad ?? unidad[0].toUpperCase() + unidad.slice(1)}</th>` : ""}
      </tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>
  </div>`;
}
