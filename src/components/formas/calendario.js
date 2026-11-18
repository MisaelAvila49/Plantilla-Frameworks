// formas/calendario.js
// ¿Cómo varía día con día? Un cuadro por día, acomodado como en un
// calendario de pared: un bloque por mes, las columnas son los días de la
// semana (lunes a domingo) y los renglones, las semanas. El color es la
// cifra del día en la rampa de una tinta con dominio FIJO, así que el ritmo
// de la semana, los días festivos y las temporadas se ven sin leer números.
// No: datos mensuales o anuales (líneas), ni cuando hay que leer el valor
// exacto de cada día (la tabla).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {globoEn, mostrarGlobo, ocultarGlobo} from "../globo.js";
import {vacio, leyendaContinua, TIPO} from "./comun.js";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const lunesPrimero = (f) => (f.getUTCDay() + 6) % 7;

// datos: una fila por día de UN año. fecha(d) devuelve un Date en UTC.
// valor(d): la cifra del día, o null (Sin dato). escala: rampaTema(dominio).
// formato: cómo se escribe la cifra en el rótulo accesible del mes.
export function calendario(datos, {ancho, fecha, valor, escala, formato = (v) => String(v), tituloLeyenda = "", marcasLeyenda = null, formatoLeyenda = undefined,
  globo: g}) {
  if (!datos.length) return vacio();
  const anio = fecha(datos[0]).getUTCFullYear();
  const porDia = new Map(datos.map((d) => [+fecha(d), d]));
  const columnas = ancho >= 900 ? 6 : ancho >= 560 ? 4 : 3;
  const hueco = ancho < 560 ? 10 : 18;
  const anchoMes = (ancho - (columnas - 1) * hueco) / columnas;
  const celda = Math.min(26, Math.floor(anchoMes / 7));
  const cabeza = 36;
  const altoMes = cabeza + 6 * celda;
  const renglones = Math.ceil(12 / columnas);
  const H = renglones * (altoMes + 14);

  const meses = d3.range(12).map((m) => {
    const x0 = (m % columnas) * (anchoMes + hueco), y0 = Math.floor(m / columnas) * (altoMes + 14);
    const primero = new Date(Date.UTC(anio, m, 1));
    const desfase = lunesPrimero(primero);
    const dias = d3.utcDays(primero, new Date(Date.UTC(anio, m + 1, 1)));
    const delMes = dias.map((f) => porDia.get(+f) ?? {_fecha: f, _sinDato: true});
    const cuadros = dias.map((f, i) => {
      const d = delMes[i];
      const v = d._sinDato ? null : valor(d);
      const fila = Math.floor((f.getUTCDate() - 1 + desfase) / 7);
      const nodo = svg`<rect class="marca-viva cal-dia" x=${x0 + lunesPrimero(f) * celda + 1} y=${y0 + cabeza + fila * celda + 1} width=${celda - 2} height=${celda - 2} rx="2"
        fill=${v == null ? P.sinDato : escala(v)} />`;
      if (g && !d._sinDato) globoEn(nodo, g, d);
      return nodo;
    });
    // El mes es la parada de teclado (doce, no 365): al enfocarlo abre el
    // globo del día con la cifra más alta y su nombre accesible resume el mes.
    const conDato = delMes.filter((d) => !d._sinDato && valor(d) != null);
    const mayor = d3.greatest(conDato, valor), menor = d3.least(conDato, valor);
    const etiqueta = conDato.length
      ? `${MESES[m]} de ${anio}: el día más alto es el ${fecha(mayor).getUTCDate()}, con ${formato(valor(mayor))}, y el más bajo el ${fecha(menor).getUTCDate()}, con ${formato(valor(menor))}.`
      : `${MESES[m]} de ${anio}: sin dato.`;
    const grupo = svg`<g class="cal-mes" tabindex="0" role="img" aria-label=${etiqueta}>
      <rect class="cal-marco" x=${x0 - 3} y=${y0 - 2} width=${7 * celda + 6} height=${altoMes + 6} rx="4" fill="none" stroke="none" pointer-events="none" />
      <text x=${x0 + 1} y=${y0 + 13} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${MESES[m]}</text>
      ${DIAS.map((t, k) => svg`<text x=${x0 + k * celda + celda / 2} y=${y0 + cabeza - 6} text-anchor="middle" font-size="10.5" fill=${P.tinta2}>${t}</text>`)}
      ${cuadros}
    </g>`;
    if (g && mayor) {
      grupo.addEventListener("focus", () => { const c = grupo.getBoundingClientRect(); mostrarGlobo(g.html(mayor), c.left + c.width / 2, c.top + 20); });
      grupo.addEventListener("blur", ocultarGlobo);
    }
    return grupo;
  });
  const dibujo = svg`<svg class="calendario" role="group" aria-label=${`Calendario de ${anio}: un cuadro por día, un bloque por mes.`} width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}"
    style="max-width:100%;height:auto;font-family:var(--sans-serif)">${meses}</svg>`;
  const sinDato = datos.length < 365 || datos.some((d) => valor(d) == null);
  return html`<div class="forma">${leyendaContinua(escala, {titulo: tituloLeyenda, marcas: marcasLeyenda, formato: formatoLeyenda, ancho: Math.min(300, ancho - 70), sinDato})}${dibujo}</div>`;
}
