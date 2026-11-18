// formas/tabla-calor.js
// ¿Cómo se comparan varias medidas de la misma escala en cada fila, leyendo
// la cifra exacta? Una tabla con una columna por medida; cada celda imprime
// su cifra y su fondo tiene el color de esa MISMA cifra, con una rampa de una
// sola tinta y dominio fijo. Una celda sin dato va en el gris de «Sin dato»
// y lo dice. Cada celda tiene su globo, al cursor y al foco.
// No: columnas con unidades distintas (cada una pediría su propia rampa).
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pctEje, numero, SIN_DATO} from "../formato.js";
import {vacio, leyendaContinua} from "./comun.js";
import {globoCelda, itinerante, tintaContraste} from "./tabla-interaccion.js";

// datos: una fila por celda. fila(d), columna(d), valor(d) en % o null.
// `filas` y `columnas`: orden. `escala`: rampaTema(dominio) de paleta.js.
// `ordenPor`: columna por la que se ordenan las filas (de mayor a menor).
// `cortoColumna(c)`: encabezado corto en pantallas angostas; el nombre
// completo queda para el lector de pantalla.
export function tablaCalor(datos, {ancho, fila, columna, valor, columnas, filas = null, escala, ordenPor = null, cortoColumna = null, rotuloFila = "Entidad", tituloLeyenda = "Porcentaje", marcasLeyenda = null, formatoLeyenda = pctEje, globo: g}) {
  if (!datos.length) return vacio();
  const angosto = ancho < 560;
  const celdas = new Map(datos.map((d) => [`${fila(d)}|${columna(d)}`, d]));
  let nombres = filas ?? [...new Set(datos.map(fila))];
  if (ordenPor) {
    const v = (n) => valor(celdas.get(`${n}|${ordenPor}`) ?? {}) ?? -Infinity;
    nombres = [...nombres].sort((a, b) => v(b) - v(a));
  }
  const enfocables = [];
  const celda = (n, c) => {
    const d = celdas.get(`${n}|${c}`) ?? null;
    const v = d ? valor(d) : null;
    const fondo = v == null ? P.sinDato : escala(v);
    // El fondo va dos veces: en la celda (para que el contraste del texto se
    // pueda medir) y en un SVG detrás de la cifra (para la descarga y para
    // la huella de los verificadores, que leen las marcas del SVG).
    const td = html`<td class=${`tc-celda${v == null ? " tc-sin-dato" : ""}${c === ordenPor ? " tc-orden" : ""}`} style=${`background-color:${fondo}`}>
      ${svg`<svg class="tc-fondo" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 10 10"><rect width="10" height="10" fill=${fondo} /></svg>`}
      <span class="tc-cifra" style=${`color:${v == null ? P.tinta2 : tintaContraste(fondo)}`}>${v == null ? SIN_DATO : angosto ? numero(v, 0) : numero(v, 1)}</span>
    </td>`;
    enfocables.push(globoCelda(td, g, d ?? {_vacia: true, _fila: n, _columna: c}));
    return td;
  };
  const cuerpo = nombres.map((n) => html`<tr><th scope="row">${n}</th>${columnas.map((c) => celda(n, c))}</tr>`);
  itinerante(enfocables, {columnas: columnas.length});
  return html`<div class="forma gB-forma gB-tabla">
    ${leyendaContinua(escala, {titulo: tituloLeyenda, marcas: marcasLeyenda, formato: formatoLeyenda, ancho: Math.min(260, ancho - 70), rotuloSinDato: "Sin dato: pocos casos en la muestra"})}
    <table class="tc-tabla" aria-label=${`${tituloLeyenda} por ${rotuloFila.toLowerCase()} y medida`}>
      <thead><tr><th scope="col">${rotuloFila}</th>${columnas.map((c) => html`<th scope="col" class=${`num${c === ordenPor ? " tc-orden" : ""}`}>${angosto && cortoColumna ? [html`<span aria-hidden="true">${cortoColumna(c)}</span>`, html`<span class="solo-lector">${c}</span>`] : c}${c === ordenPor ? html`<span class="gB-th-nota">orden</span>` : ""}</th>`)}</tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>
  </div>`;
}
