// formas/flechas-cambio.js
// ¿En qué unidades subió o bajó un indicador entre dos cortes, y cuánto?
// Mapa de flechas inclinadas: cada unidad (entidad o municipio) lleva una
// flecha corta que nace en su punto y se inclina hacia la derecha si el
// indicador sube y hacia la izquierda si baja. La INCLINACIÓN y el LARGO
// crecen con el tamaño del cambio, y el color repite el sentido con el rojo y
// el azul que el capítulo declara. Miles de flechas juntas se leen como un
// viento: las zonas donde sopla al revés saltan a la vista sin leyenda.
// Las unidades con pocos casos en la muestra no llevan flecha: van como un
// punto gris tenue, y su cifra sigue en el globo y en la tabla.
// El largo y la inclinación usan un límite FIJO (`limite`), el mismo con
// cualquier filtro: más allá del límite la flecha ya no crece.
// No: niveles (coropleta), conteos (picos o burbujas), más de unas 2,500
// unidades a la vista (las flechas se vuelven una mancha), ni un cambio entre
// ediciones que no son comparables.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {puntos as fPuntos} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {lienzo, rotulo, colocar, guia, anchoTexto} from "./anotaciones.js";

const GRADO = Math.PI / 180;
// Inclinación respecto de la vertical: de 12° (cambio mínimo) a 72° (límite).
const INCLINA = [12, 72];
const r1 = (v) => Math.round(v * 10) / 10;

// Polígono de una flecha que nace en (x, y), de largo `L` e inclinación `a`
// (radianes desde la vertical; positiva hacia la derecha). Una sola pieza:
// asta y punta, sin trazo, para que miles de flechas pesen poco.
function trazo(x, y, L, a, {asta = 0.75, punta = 4.2, ala = 2.6} = {}) {
  const ux = Math.sin(a), uy = -Math.cos(a), nx = -uy, ny = ux;
  const hl = Math.min(punta, L * 0.55), hh = ala * Math.min(1, hl / punta + 0.25);
  const qx = x + ux * L, qy = y + uy * L, cx = qx - ux * hl, cy = qy - uy * hl;
  const pts = [[x + nx * asta, y + ny * asta], [cx + nx * asta, cy + ny * asta], [cx + nx * hh, cy + ny * hh], [qx, qy],
    [cx - nx * hh, cy - ny * hh], [cx - nx * asta, cy - ny * asta], [x - nx * asta, y - ny * asta]];
  return {d: "M" + pts.map(([px, py]) => `${r1(px)},${r1(py)}`).join("L") + "Z", punta: [qx, qy]};
}

// geo: FeatureCollection del fondo. unidades: una fila por unidad, con su
// cambio ya calculado. posicion(d): [longitud, latitud]. cambio(d): el cambio
// con signo (por ejemplo, en puntos). signo(d): "sube", "baja" o "igual" (sale
// de `sentido()` de paleta.js, la única definición del punto neutro). sig: el
// `significado()` del capítulo, que da el color y el nombre de cada sentido.
// limite: cambio al que corresponde la flecha más larga e inclinada. Es una
// constante del capítulo, medida sobre todos los datos.
// pocos(d): true si la unidad tiene pocos casos (va sin flecha). enFoco(d):
// false para las unidades que quedan a la vista pero fuera de lo elegido (van
// en gris tenue). encuadre(f): polígonos a los que se acerca el mapa.
// anotar: cuántas flechas llevan nombre y cifra (por omisión, 5 o 3).
export function flechasCambio(geo, unidades, {
  ancho, posicion, cambio, signo, sig, limite, nombre = () => "", pocos = null, enFoco = null, encuadre = null,
  anotar = null, formato = fPuntos, formatoLeyenda = null, titulo = "Cambio", rotuloPocos = "Pocos casos en la muestra: sin flecha", globo: g,
}) {
  if (!(limite > 0)) throw new Error("flechasCambio(): falta `limite`, el cambio fijo al que corresponde la flecha más larga.");
  if (!sig?.color) throw new Error("flechasCambio(): falta `sig`, el significado del rojo y el azul en el capítulo.");
  const angosto = ancho < 520;
  const mapa = mapaBase(geo, {ancho, encuadre, margen: angosto ? 6 : 12, relleno: () => P.fondo2, borde: () => P.borde, grosor: () => (angosto ? 0.5 : 0.7)});
  const {W, H} = mapa;
  const L = Math.max(13, Math.min(30, W * 0.032));
  const FORMA_LLAVE = {asta: 0.75, punta: 4.2, ala: 2.6};
  const forma = angosto ? {asta: 0.55, punta: 3.1, ala: 1.9} : FORMA_LLAVE;
  const geometria = (v) => {
    const t = Math.min(1, Math.abs(v) / limite);
    return {largo: L * (0.3 + 0.7 * t), inclina: Math.sign(v) * (INCLINA[0] + (INCLINA[1] - INCLINA[0]) * t) * GRADO};
  };

  // Unidades a la vista, con su punto en pantalla.
  const vistas = unidades.map((d) => {
    const pos = posicion(d), c = cambio(d);
    const p = pos ? mapa.proyeccion(pos) : null;
    if (!p || p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return null;
    return {d, x: p[0], y: p[1], c, s: c == null ? null : signo(d), poco: Boolean(pocos?.(d)) || c == null, foco: enFoco ? Boolean(enFoco(d)) : true};
  }).filter(Boolean);
  if (!vistas.some((m) => !m.poco && m.foco)) return vacio("Sin unidades con dato suficiente para esta selección.");

  // Anotadas: los cambios mayores, uno de cada sentido primero, separados
  // entre sí para que los rótulos caigan en zonas distintas.
  const cuantas = anotar ?? (angosto ? 3 : 5), separacion = angosto ? 46 : 74;
  const candidatas = d3.sort(vistas.filter((m) => m.foco && !m.poco && m.s !== "igual"), (m) => -Math.abs(m.c));
  const anotadas = [];
  const lejos = (m) => anotadas.every((a) => Math.hypot(a.x - m.x, a.y - m.y) > separacion);
  for (const s of ["baja", "sube"]) { const m = candidatas.find((q) => q.s === s && lejos(q)); if (m && anotadas.length < cuantas) anotadas.push(m); }
  for (const m of candidatas) { if (anotadas.length >= cuantas) break; if (!anotadas.includes(m) && lejos(m)) anotadas.push(m); }
  const conNota = new Set(anotadas);

  // Marcas: primero los puntos de pocos casos y el contexto, luego las
  // flechas de menor a mayor cambio, para que las grandes queden encima.
  const orden = [...vistas].sort((a, b) => (a.poco - b.poco) * -1 || (a.foco - b.foco) || Math.abs(a.c ?? 0) - Math.abs(b.c ?? 0));
  const marcas = orden.map((m) => {
    let nodo;
    if (m.poco) {
      nodo = svg`<g class="marca-viva fc-punto fc-aparece" style=${`--i:${Math.round(m.x / W * 30)}`}>
        <circle cx=${r1(m.x)} cy=${r1(m.y)} r=${angosto ? 3 : 4} fill="transparent" />
        <circle cx=${r1(m.x)} cy=${r1(m.y)} r=${angosto ? 0.9 : 1.2} fill=${P.contexto} />
      </g>`;
    } else {
      const {largo, inclina} = geometria(m.s === "igual" ? 0 : m.c);
      const a = m.s === "igual" ? 0 : inclina;
      const t = trazo(m.x, m.y, m.s === "igual" ? L * 0.26 : largo, a, forma);
      const tinta = m.foco ? sig.color(m.s) : P.contexto;
      m.punta = t.punta;
      nodo = svg`<g class=${`marca-viva fc-flecha ${a >= 0 ? "fc-der" : "fc-izq"}`} tabindex=${conNota.has(m) ? 0 : null} style=${`--i:${Math.round(m.x / W * 30)}`}>
        <line x1=${r1(m.x)} y1=${r1(m.y)} x2=${r1(t.punta[0])} y2=${r1(t.punta[1])} stroke="transparent" stroke-width=${angosto ? 5 : 7} stroke-linecap="round" />
        <path class="fc-trazo" d=${t.d} fill=${tinta} fill-opacity=${m.foco ? 0.92 : 0.5} />
      </g>`;
    }
    if (g) globoEn(nodo, g, m.d);
    return nodo;
  });

  // Rótulos de las anotadas: nombre y cifra, con línea guía hasta la punta.
  const tam = angosto ? 11.5 : TIPO.valor;
  const etiquetas = anotadas.map((m) => {
    const renglones = [{texto: String(nombre(m.d)), peso: 700}, {texto: formato(m.c), color: P.tinta2}];
    return {x: m.punta[0], y: m.punta[1], w: Math.max(...renglones.map((r) => anchoTexto(r.texto, tam, r.peso ?? 400))), h: 2 * tam * 1.22 + 3, renglones, separacion: 12};
  });
  const puntas = anotadas.map((m) => [m.punta[0] - 4, m.punta[1] - 4, m.punta[0] + 4, m.punta[1] + 4]);
  const notas = colocar(etiquetas, {ancho: W, alto: H, obstaculos: puntas}).filter((e) => e.cabe).map((e) => svg`<g>
    ${guia(e.x, e.y, e.caja)}
    ${rotulo(e.tx, e.caja[1] + tam, e.renglones, {ancla: e.ancla, tam})}
  </g>`);

  const conFlecha = vistas.filter((m) => m.foco && !m.poco);
  const cuenta = (s) => conFlecha.filter((m) => m.s === s).length;
  const nPocos = vistas.filter((m) => m.foco && m.poco).length;
  const mayor = (s) => d3.greatest(conFlecha.filter((m) => m.s === s), (m) => Math.abs(m.c));
  const sube = mayor("sube"), baja = mayor("baja");
  const etiqueta = `Mapa de ${conFlecha.length} flechas, una por unidad: ${cuenta("sube")} ${sig.etiqueta("sube")}, ${cuenta("baja")} ${sig.etiqueta("baja")} y ${cuenta("igual")} ${sig.etiqueta("igual")}` +
    `${nPocos ? `; ${nPocos} con pocos casos, sin flecha` : ""}.` +
    `${sube ? ` El mayor aumento: ${nombre(sube.d)}, ${formato(sube.c)}.` : ""}${baja ? ` La mayor baja: ${nombre(baja.d)}, ${formato(baja.c)}.` : ""}`;
  const dibujo = lienzo({clase: "flechas-cambio", ancho: W, alto: H, etiqueta},
    mapa.capa, svg`<g class="fc-marcas">${marcas}</g>`, svg`<g aria-hidden="true" pointer-events="none" class="fc-notas">${notas}</g>`);

  // Llave de lectura fuera del lienzo: tres flechas de cada sentido, de un
  // cambio chico al límite, con su cifra. Enseña que crecen a la vez el largo
  // y la inclinación.
  const corto = formatoLeyenda ?? ((v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${d3.format(",~r")(+Math.abs(v).toPrecision(2))}`);
  const muestras = [limite / 4, limite / 2, limite];
  const llave = (s) => {
    const signoV = s === "sube" ? 1 : -1, paso = angosto ? 34 : 40, altoL = Math.ceil(L) + 24, anchoL = paso * muestras.length + 10;
    return svg`<svg width=${anchoL} height=${altoL} viewBox="0 0 ${anchoL} ${altoL}" aria-hidden="true">
      ${muestras.map((v, i) => {
        const {largo, inclina} = geometria(signoV * v);
        const x = 10 + i * paso + (signoV < 0 ? paso * 0.55 : 0), y = altoL - 16;
        // El largo y la inclinación son los del mapa (codifican el cambio);
        // el grosor no codifica nada, así que en la llave va el de escritorio
        // para que se lea también a 390 px.
        const t = trazo(x, y, largo, inclina, FORMA_LLAVE);
        return svg`<g><path d=${t.d} fill=${sig.color(s)} /><text x=${x} y=${altoL - 3} font-size="11" text-anchor="middle" fill=${P.tinta2}>${corto(signoV * v)}${i === muestras.length - 1 ? "+" : ""}</text></g>`;
      })}
    </svg>`;
  };
  const hayIgual = conFlecha.some((m) => m.s === "igual");
  const leyenda = html`<div class="forma-leyendas fc-leyenda" role="img" aria-label=${`${titulo}: hacia la derecha ${sig.etiqueta("sube")}, hacia la izquierda ${sig.etiqueta("baja")}. Mientras más grande el cambio, más larga e inclinada la flecha; el tope es ${corto(limite)}.`}>
    <span class="fc-leyenda-titulo">${titulo}</span>
    <span class="leyenda-item fc-llave"><span>← ${sig.etiqueta("baja")}</span>${llave("baja")}</span>
    <span class="leyenda-item fc-llave"><span>${sig.etiqueta("sube")} →</span>${llave("sube")}</span>
    ${hayIgual ? html`<span class="leyenda-item"><svg width="10" height="16" aria-hidden="true"><path d=${trazo(5, 15, L * 0.26, 0, forma).d} fill=${sig.color("igual")} /></svg><span>${sig.etiqueta("igual")}</span></span>` : ""}
    ${nPocos ? html`<span class="leyenda-item"><svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="2" fill=${P.contexto} /></svg><span>${rotuloPocos}</span></span>` : ""}
  </div>`;
  const nodo = html`<div class="forma forma-flechas-cambio">${leyenda}${dibujo}</div>`;
  nodo.anotadas = anotadas.map((m) => m.d);
  nodo.conteo = {sube: cuenta("sube"), baja: cuenta("baja"), igual: cuenta("igual"), pocos: nPocos, total: conFlecha.length};
  return nodo;
}
