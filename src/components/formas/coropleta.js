// formas/coropleta.js
// ¿Dónde es más alto y dónde más bajo? Una magnitud por entidad sobre el mapa
// real, con la rampa continua de una tinta y dominio fijo (o la divergente,
// si lo que se pinta es un cambio). La leyenda es una barra continua y la
// casilla «Sin dato» va aparte.
// No: conteos de personas (el territorio grande pesa de más; usar mosaico o
// un ranking) ni cuando el tamaño de la entidad distorsiona la lectura.
import {ISO_A_CVE} from "../geografia.js";
import {pctEje} from "../formato.js";
import {leyendaContinua, conLeyenda} from "./comun.js";
import {mapaPlano} from "./mapa-plano.js";

// valores: Map de clave de entidad (dos dígitos) al dato. `clave(f)` lee la
// clave del polígono (por omisión, del `id` ISO del geojson de entidades).
// `encuadre`: lista de claves a las que se acerca el mapa; `resaltar(d)`:
// con ella, las unidades que devuelven false van atenuadas.
export function coropleta(geo, valores, {ancho, valor, escala, clave = (f) => ISO_A_CVE.get(f.properties.id), encuadre = null, resaltar = null, destacar = null, tituloLeyenda = "", formatoLeyenda = pctEje, marcasLeyenda = null, rotuloSinDato = undefined, globo: g}) {
  const mapa = mapaPlano(geo, {
    ancho, globo: g,
    dato: (f) => {
      const d = valores.get(clave(f));
      return d == null ? {cve: clave(f), _sinDato: true} : d;
    },
    color: (d) => escala(d?._sinDato ? null : valor(d)),
    encuadre: encuadre ? (f) => encuadre.includes(clave(f)) : null,
    atenuar: resaltar ? (f) => { const d = valores.get(clave(f)); return d != null && !resaltar(d); } : null,
    contorno: destacar ? (f) => clave(f) === destacar : null,
  });
  return conLeyenda(leyendaContinua(escala, {titulo: tituloLeyenda, formato: formatoLeyenda, marcas: marcasLeyenda, ancho: Math.min(300, ancho - 30), rotuloSinDato}), mapa);
}
