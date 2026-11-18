// formas/escalones.js
// ¿En qué lugar queda cada grupo? Para grupos con orden (edades, deciles):
// un escalón por grupo, con una figura parada en el valor del grupo («aquí
// está») y un bloque que marca la banda en la que se mueve (la mitad central
// u otro rango). Un umbral optativo cruza todos los escalones y la gráfica
// dice qué parte de cada grupo queda por encima.
// No: grupos sin orden (ahí va el lollipop), ni más de unos diez escalones.
import * as d3 from "npm:d3";
import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {PROPORCION, nuevoId, simbolos, refGlifo, usar, leyendaFiguras, partir} from "./unidad.js";

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

// datos: una fila por grupo, en su orden. grupo(d), valor(d) (donde se para
// la figura), bajo(d) y alto(d) (extremos de la banda, optativos). `dominio`:
// FIJO, el mismo con cualquier filtro. `umbral`: valor que cruza la gráfica
// (lo mueve un control del panel); `encima(d, umbral)`: qué parte del grupo,
// de 0 a 100, queda por encima. `nombres`: textos de la leyenda
// {valor, banda, umbral, sobre, encima}. El dato del globo lleva además
// `umbral` y `encima`.
export function escalones(datos, {ancho, grupo, valor, bajo = null, alto = null, dominio = [0, 100], formato = pct, formatoEje = pctMarca,
  umbral = null, encima = null, formatoEncima = (v) => pct(v, 0), nombres = {}, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const m = filas.length, [a, b] = dominio;
  const conUmbral = umbral != null, conBanda = Boolean(bajo && alto);
  // Margen izquierdo según la marca más larga del eje («100 %»).
  const ml = Math.ceil(Math.max(40, 14 + Math.max(...dominio.map((v) => String(formatoEje(v)).length)) * 7.4)), mr = 4, PW = ancho - ml - mr, cw = PW / m, margen = Math.min(6, cw * 0.08);
  const titulos = filas.map((d) => partir(String(grupo(d)), Math.max(5, Math.floor(cw / 7.4))));
  const altoTitulos = 16 * Math.max(...titulos.map((t) => t.length));
  const conEncima = conUmbral && Boolean(encima);
  const fw = acotar(cw * 0.3, 11, 17), fh = fw * PROPORCION;
  const mt = altoTitulos + (conEncima ? 20 : 0) + 10 + fh, PH = acotar(ancho * 0.42, 240, 360), mb = 26;
  const H = Math.ceil(mt + PH + mb);
  const y = (v) => mt + PH * (1 - (acotar(v, a, b) - a) / (b - a));

  const id = nuevoId("es");
  // Rejilla y eje. El umbral se rotula en el propio eje, en negrita, y las
  // marcas vecinas se quitan para que no se encimen.
  const marcas = d3.ticks(a, b, 4).filter((t) => !conUmbral || Math.abs(y(t) - y(umbral)) > 14);
  const eje = svg`<g aria-hidden="true">
    ${marcas.map((t) => svg`<g><line x1=${ml} x2=${ml + PW} y1=${y(t)} y2=${y(t)} stroke=${P.rejilla} /><text x=${ml - 7} y=${y(t) + 4} text-anchor="end" font-size=${TIPO.ejes} fill=${P.tinta2}>${formatoEje(t)}</text></g>`)}
  </g>`;

  const columnas = filas.map((d, i) => {
    const x0 = ml + i * cw, v = valor(d), cx = x0 + cw / 2;
    const e = conEncima ? encima(d, umbral) : null;
    const piezas = [];
    if (conBanda && bajo(d) != null && alto(d) != null) {
      const y1 = y(alto(d)), y2 = y(bajo(d)), yu = conUmbral ? acotar(y(umbral), y1, y2) : y1;
      // La parte de la banda que queda sobre el umbral va en un tono más intenso.
      if (conUmbral && yu > y1) piezas.push(svg`<rect x=${x0 + margen} y=${y1} width=${cw - 2 * margen} height=${yu - y1} fill=${P.rampa[2]} />`);
      if (y2 > yu) piezas.push(svg`<rect x=${x0 + margen} y=${yu} width=${cw - 2 * margen} height=${y2 - yu} fill=${P.rampa[1]} />`);
    }
    piezas.push(svg`<line x1=${x0 + margen} x2=${x0 + cw - margen} y1=${y(v)} y2=${y(v)} stroke=${P.tinta} stroke-width="4"/>`);
    piezas.push(usar(refGlifo(id, i), cx - fw / 2, y(v) - 2.5 - fh, fw, fh, P.tinta, {entra: (500 * i) / m}));
    const nodo = svg`<g class="marca-viva unidad-grupo" tabindex="0">
      <rect class="unidad-zona" x=${x0 + 1} y="1" width=${cw - 2} height=${H - 2} rx="5" fill="transparent" />
      <g stroke="none">${piezas}</g>
      ${titulos[i].map((t, k) => svg`<text aria-hidden="true" x=${cx} y=${13 + 16 * k} text-anchor="middle" font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${t}</text>`)}
      ${conEncima && e != null ? svg`<text aria-hidden="true" x=${cx} y=${altoTitulos + 15} text-anchor="middle" font-size="12" font-weight="700" fill=${P.tonoTexto}>${formatoEncima(e)}${cw >= 104 ? " por encima" : ""}</text>` : ""}
      <text aria-hidden="true" x=${cx} y=${y(v) + 17} text-anchor="middle" font-size=${TIPO.valor} font-weight="800" fill=${P.tinta} stroke=${P.fondo} stroke-width="3" paint-order="stroke" stroke-linejoin="round">${formato(v)}</text>
    </g>`;
    if (g) globoEn(nodo, g, {...d, umbral, encima: e});
    return nodo;
  });

  // Los escalones se unen con un trazo vertical fino entre el valor de un
  // grupo y el del siguiente: así se lee la escalera, no columnas sueltas.
  const peldanos = svg`<g aria-hidden="true" stroke=${P.tinta} stroke-width="1.4" stroke-linecap="round">${filas.slice(1).map((d, i) => {
    const xa = ml + (i + 1) * cw, ya = y(valor(filas[i])), yb = y(valor(d));
    return svg`<path fill="none" d=${`M${xa - margen},${ya}L${xa},${ya}L${xa},${yb}L${xa + margen},${yb}`} />`;
  })}</g>`;
  const linea = conUmbral ? svg`<g aria-hidden="true">
    <line x1=${ml - 4} x2=${ml + PW} y1=${y(umbral)} y2=${y(umbral)} stroke=${P.tinta} stroke-width="1.4" stroke-dasharray="5 4"/>
    <text x=${ml - 7} y=${y(umbral) + 4} text-anchor="end" font-size=${TIPO.ejes} font-weight="800" fill=${P.tinta}>${formatoEje(umbral)}</text>
  </g>` : "";

  const descripcion = `${m} grupos en orden. ${filas.map((d) => `${grupo(d)}: ${formato(valor(d))}${conEncima ? `, ${formatoEncima(encima(d, umbral))} por encima del umbral` : ""}`).join(". ")}.${conUmbral ? ` Umbral: ${formato(umbral)}.` : ""}`;
  const dibujo = svg`<svg class="escalones" role="group" aria-label=${descripcion} width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${simbolos(id)}${eje}${peldanos}${columnas}${linea}
  </svg>`;
  return html`<div class="forma">${leyendaFiguras([
    {color: P.tinta, texto: nombres.valor ?? "Valor del grupo"},
    conBanda ? {tipo: "cuadro", color: P.rampa[1], texto: nombres.banda ?? "Banda del grupo"} : null,
    conUmbral ? {tipo: "punteada", color: P.tinta, texto: nombres.umbral ?? `Umbral: ${formato(umbral)}`} : null,
    conUmbral && conBanda ? {tipo: "cuadro", color: P.rampa[2], texto: nombres.sobre ?? "Parte de la banda sobre el umbral"} : null,
    conEncima && nombres.encima ? {texto: nombres.encima} : null,
  ])}${dibujo}</div>`;
}
