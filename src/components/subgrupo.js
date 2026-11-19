// src/components/subgrupo.js
// FILTRO DE SUBGRUPO CON GRADO, en un solo componente para todo el libro.
// Generaliza el «tipo de dificultad» del libro de discapacidad: una población
// se parte en subgrupos que NO son excluyentes (una persona puede estar en
// dos: tipo de dificultad, lengua, programa que recibe) y cada subgrupo tiene
// un grado (mucha o poca dificultad, uso diario u ocasional). Da:
//
//   - los dos campos del grupo rotulado del panel (`grupoSubgrupo()`, o
//     `campoSubgrupo()` y `campoGrado()` sueltos); el grado se oculta con
//     «Todos los subgrupos» y el panel oculta el grupo entero si no queda
//     ningún campo visible;
//   - `seleccionarSubgrupo()`, que devuelve las filas que la sección suma,
//     con un campo `grupo` (FOCO o REFERENCIA) y los rótulos, universos y
//     colores que cambian con la selección.
//
// Contrato de datos (docs/datos.md de la Plantilla, «Subgrupos con grado»):
//   - el archivo SIN subgrupo trae la comparación de siempre en la columna
//     `grupo` (por omisión «Con la condición» / «Sin la condición»);
//   - el archivo POR subgrupo trae `subgrupo` y `grado`, y una fila de
//     referencia `subgrupo = Ninguno` (quien no está en ningún subgrupo), la
//     misma para todos los subgrupos.
// Reglas que el componente hace cumplir:
//   1. Las filas de subgrupos distintos no se suman: se elige UNO.
//   2. Dentro de un subgrupo, los grados son excluyentes; la comparación es
//      siempre con la referencia «Ninguno», nunca con la suma de subgrupos.
//   3. Un nivel geográfico a la vez: `nivel(r)` filtra las filas del archivo
//      por subgrupo (país o entidades) y nunca se mezclan.
//   4. Las celdas con menos de 30 casos no se esconden con un subgrupo
//      elegido: viajan con `casos` y la sección las marca (R149).

import {campo} from "./filtros.js";
import {P} from "./paleta.js";
import {tasaPorGrupo} from "./agregar.js";

export const TODOS = "todos";
export const FOCO = "foco", REFERENCIA = "referencia", NINGUNO = "Ninguno";

// subgrupos: [{valor, texto, corto}] y grados: [{valor, texto, corto}], el
// primero es el grado por omisión. El rótulo del grupo es «texto del
// subgrupo, corto del grado» («Cuida a alguien, todos los días»); un `para`
// optativo en el subgrupo («con dificultad para ver») sustituye al texto.
export function catalogo({subgrupos, grados, todos = "Todos los subgrupos", foco = "Con la condición", referencia = "Sin la condición",
  referenciaSubgrupo = "En ningún subgrupo", unidad = "personas"}) {
  return {subgrupos, grados, todos, foco, referencia, referenciaSubgrupo, unidad};
}

// `disponible(valor, v)`: optativa, true si el subgrupo o el grado tiene dato
// para la selección vigente (R54). Sin ella se ofrecen todos.
export function campoSubgrupo(cat, {id = "subgrupo", rotulo = "Subgrupo", inicial = TODOS, disponible = null} = {}) {
  return campo({id, rotulo, inicial, opciones: (v) => [{valor: TODOS, texto: cat.todos},
    ...cat.subgrupos.filter((s) => !disponible || disponible(s.valor, v)).map((s) => ({valor: s.valor, texto: s.texto}))]});
}
export function campoGrado(cat, {id = "grado", subgrupo = "subgrupo", rotulo = "Grado", inicial = null, disponible = null} = {}) {
  return campo({id, rotulo, inicial: inicial ?? cat.grados[0].valor,
    opciones: (v) => cat.grados.filter((g) => !disponible || disponible(g.valor, v)).map((g) => ({valor: g.valor, texto: g.texto})),
    oculto: (v) => !v[subgrupo] || v[subgrupo] === TODOS});
}
// El grupo rotulado del panel, listo para `panel({grupos: [...]})`.
export function grupoSubgrupo(cat, {leyenda = "Subgrupo", subgrupo = {}, grado = {}} = {}) {
  return {leyenda, campos: [campoSubgrupo(cat, subgrupo), campoGrado(cat, {subgrupo: subgrupo.id ?? "subgrupo", ...grado})]};
}
export const conSubgrupo = (v, id = "subgrupo") => Boolean(v[id]) && v[id] !== TODOS;

// Rótulos de la selección: texto del grupo, universo del globo (dos o tres
// palabras) y texto para el subtítulo.
export function rotulos(cat, {subgrupo = TODOS, grado = null} = {}) {
  const s = cat.subgrupos.find((x) => x.valor === subgrupo);
  if (!s) return {[FOCO]: {texto: cat.foco, corto: cat.foco, unidad: `${cat.unidad} ${cat.foco.toLowerCase()}`},
    [REFERENCIA]: {texto: cat.referencia, corto: cat.referencia, unidad: `${cat.unidad} ${cat.referencia.toLowerCase()}`}, seleccion: cat.todos};
  const g = cat.grados.find((x) => x.valor === grado) ?? cat.grados[0];
  return {
    [FOCO]: {texto: `${s.para ?? s.texto}, ${g.corto ?? g.texto}`, corto: `${s.corto ?? s.texto} · ${g.corto ?? g.texto}`, unidad: `${cat.unidad} de ese subgrupo`},
    [REFERENCIA]: {texto: cat.referenciaSubgrupo, corto: cat.referenciaSubgrupo, unidad: `${cat.unidad} en ningún subgrupo`},
    seleccion: `${s.para ?? s.texto}, ${g.corto ?? g.texto}`,
  };
}

// seleccionarSubgrupo({cat, base, porSubgrupo, v, nivel, grupoBase})
//   base         filas sin subgrupo; `grupoBase(r)` devuelve FOCO, REFERENCIA o null
//   porSubgrupo  filas con `subgrupo` y `grado`
//   v            selección del panel (lee v[subgrupoId] y v[gradoId])
//   nivel(r)     filtro del nivel geográfico del archivo por subgrupo
// Devuelve {filas, grupos, esSubgrupo, subgrupo, grado, seleccion, texto(g),
// corto(g), unidad(g), color(g), tasa(llaves, formato)}.
export function seleccionarSubgrupo({cat, base = [], porSubgrupo = [], v = {}, nivel = () => true,
  grupoBase = (r) => (r.grupo === cat.foco ? FOCO : r.grupo === cat.referencia ? REFERENCIA : null), subgrupoId = "subgrupo", gradoId = "grado"}) {
  const subgrupo = v[subgrupoId] ?? TODOS;
  const esSubgrupo = subgrupo !== TODOS;
  const grado = esSubgrupo ? v[gradoId] ?? cat.grados[0].valor : null;
  const r = rotulos(cat, {subgrupo, grado});
  const filas = [];
  if (!esSubgrupo) {
    for (const d of base) { const g = grupoBase(d); if (g) filas.push({...d, grupo: g}); }
  } else {
    for (const d of porSubgrupo) {
      if (!nivel(d)) continue;
      if (d.subgrupo === subgrupo && d.grado === grado) filas.push({...d, grupo: FOCO});
      else if (d.subgrupo === NINGUNO) filas.push({...d, grupo: REFERENCIA});
    }
  }
  const grupos = [FOCO, REFERENCIA].filter((g) => filas.some((d) => d.grupo === g));
  return {
    filas, grupos, esSubgrupo, subgrupo, grado, seleccion: r.seleccion,
    texto: (g) => r[g]?.texto ?? g, corto: (g) => r[g]?.corto ?? g, unidad: (g) => r[g]?.unidad ?? cat.unidad,
    color: (g) => (g === FOCO ? P.serie : P.comparacion),
    tasa: (llaves = [], formato = "pct") => tasaPorGrupo(filas, ["grupo", ...llaves], formato),
  };
}
