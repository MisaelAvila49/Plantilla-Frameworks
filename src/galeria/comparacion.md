---
title: Comparación
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para <span class="clave">comparar</span></h1>
  <p class="capitulo-entradilla">Brecha entre dos valores, ranking largo, cruce de dos dimensiones, dos grupos en el mapa, tres grupos por renglón y una cifra con su tendencia, más las barras de respaldo. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-composicion.css">
<link rel="stylesheet" href="../formas-gB.css">

```js
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, sentido, categorias, rampaTema, P} from "../components/paleta.js";
import {pct, puntos, margen, deA} from "../components/formato.js";
import {dumbbell, lollipop, heatmap, mosaicoTriangulos} from "../components/formas/index.js";
import {REGIONES, ENTIDADES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerIndicador, tasa, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";

const indicador = leerIndicador(await FileAttachment("../data/muestra/indicador.csv").csv());
const ANIOS = [...new Set(indicador.map((r) => r.anio))].sort((a, b) => a - b);

// Significado del color en este capítulo.
const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
// Dominios FIJOS, medidos sobre toda la muestra y no sobre la vista: el
// porcentaje más alto de una región es 39.7 % y el cambio más grande de una
// entidad entre dos años cualesquiera, de 30.3 puntos.
const DOMINIO_REGION = [0, 50];
const LIMITE_CAMBIO = 35;
const opcionesRegion = [{valor: "todas", texto: "Todo el país"}, ...REGIONES];
const deRegion = (v) => (r) => v.region === "todas" || r.region === v.region;
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px. Cuanto más se acerca al alto
// final, menos tiene que compensar el anclaje de scroll cuando la sección se
// dibuja por encima de la vista (docs/scroll-bug.md, «Pendiente»).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

<h2 id="brecha" class="toc-anchor">La brecha entre mujeres y hombres</h2>

```js
{
  const color = categorias(["Mujeres", "Hombres"]);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: (v) => conDato(indicador, "anio", deRegion(v)).sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "brecha", numero: 1, titulo: "La brecha entre mujeres y hombres", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA,
    explica: "Cada renglón es una entidad. Los dos puntos son el porcentaje de mujeres y el de hombres que cumplen la condición, y el segmento que los une es la brecha. Si las mujeres tienen 42 % y los hombres 37 %, la brecha es de 5.0 puntos. Las entidades van de la brecha más grande a la más chica.",
    dibujar: ({v, ancho}) => {
      const base = indicador.filter((r) => r.anio === v.anio && deRegion(v)(r));
      const filas = [...new Set(base.map((r) => r.cve))].map((cve) => {
        const m = base.find((r) => r.cve === cve && r.sexo === "Mujeres"), h = base.find((r) => r.cve === cve && r.sexo === "Hombres");
        return m && h ? {cve, entidad: m.entidad, anio: v.anio, m, h, brecha: m.pct - h.pct} : null;
      }).filter(Boolean);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio,
        grupo: (d) => (d.lado === "a" ? "Mujeres" : "Hombres"),
        color: (d) => color(d.lado === "a" ? "Mujeres" : "Hombres"),
        valor: (d) => d.v, formato: "pct",
        frase: (d) => `de ${d.lado === "a" ? "las mujeres" : "los hombres"} ${UNIVERSO} cumple la condición`,
        personas: (d) => (d.lado === "a" ? d.m.num : d.h.num), universo: (d) => (d.lado === "a" ? d.m.den : d.h.den),
        unidad: (d) => (d.lado === "a" ? "mujeres" : "hombres"), apellido: UNIVERSO,
        comparacion: (d) => `Brecha: ${puntos(d.brecha)}`,
        precision: (d) => { const r = d.lado === "a" ? d.m : d.h; return {valor: r.pct, ee: r.ee, casos: r.casos}; },
      });
      return {
        figura: {
          titulo: "Mujeres y hombres que cumplen la condición, por entidad",
          subtitulo: `Población ${UNIVERSO} · ${v.region === "todas" ? "Todas las entidades" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es el porcentaje de mujeres o de hombres de la entidad que cumple la condición, y el segmento es la brecha entre los dos.",
          cuerpo: dumbbell(filas, {ancho, etiqueta: (d) => d.entidad, a: (d) => d.m.pct, b: (d) => d.h.pct, nombreA: "Mujeres", nombreB: "Hombres", colorA: color("Mujeres"), colorB: color("Hombres"),
            orden: (p, q) => Math.abs(q.brecha) - Math.abs(p.brecha), rotuloX: "Porcentaje", globo: g}),
        },
        tabla: {filas: [...filas].sort((p, q) => Math.abs(q.brecha) - Math.abs(p.brecha)), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Mujeres", valor: (d) => d.m.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.m.ee, formato: (x) => margen(x)},
          {titulo: "Hombres", valor: (d) => d.h.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.h.ee, formato: (x) => margen(x)},
          {titulo: "Brecha", valor: (d) => d.brecha, formato: "puntos"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cambio" class="toc-anchor">Cuánto cambió cada entidad</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre qué años", campos: [
      campo({id: "desde", rotulo: "Desde", inicial: 2000, opciones: (v) => conDato(indicador, "anio", deRegion(v)).sort((a, b) => a - b).slice(0, -1)}),
      // Dependiente: «Hasta» solo ofrece años posteriores a «Desde».
      campo({id: "hasta", rotulo: "Hasta", inicial: 2020, opciones: (v) => conDato(indicador, "anio", deRegion(v)).filter((a) => a > v.desde).sort((a, b) => a - b)}),
    ]},
  ]});
  display(analisis({
    id: "cambio", numero: 2, titulo: "Cuánto cambió cada entidad", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA,
    explica: "Cada renglón es una entidad y el punto marca cuántos puntos cambió su porcentaje entre los dos años elegidos. Si pasó de 30 % a 25 %, el cambio es de −5.0 puntos. En rojo van las entidades donde el porcentaje baja, en azul donde sube y en gris donde el cambio no supera el margen de error.",
    dibujar: ({v, ancho}) => {
      const total = indicador.filter((r) => r.sexo === "Total" && deRegion(v)(r));
      const filas = [...new Set(total.map((r) => r.cve))].map((cve) => {
        const a = total.find((r) => r.cve === cve && r.anio === v.desde), b = total.find((r) => r.cve === cve && r.anio === v.hasta);
        if (!a || !b) return null;
        return {cve, entidad: a.entidad, a, b, cambio: b.pct - a.pct, s: sentido(a.pct, b.pct, {eeA: a.ee, eeB: b.ee})};
      }).filter(Boolean);
      const g = globo({
        donde: (d) => d.entidad, cuando: () => `${v.desde} a ${v.hasta}`,
        grupo: (d) => SIG.etiqueta(d.s), color: (d) => SIG.color(d.s),
        valor: (d) => d.cambio, formato: "puntos",
        frase: `de cambio en el porcentaje de la población ${UNIVERSO} que cumple la condición`,
        personas: (d) => d.b.num, universo: (d) => d.b.den, apellido: `${UNIVERSO} en ${v.hasta}`,
        comparacion: (d) => deA(d.a.pct, d.b.pct, pct),
      });
      const sinPar = new Set(total.map((r) => r.cve)).size - filas.length;
      return {
        figura: {
          titulo: "Cambio del porcentaje que cumple la condición, por entidad",
          subtitulo: `Población ${UNIVERSO} · ${v.region === "todas" ? "Todas las entidades" : `Región ${v.region}`} · ${v.desde} a ${v.hasta}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es el cambio en puntos del porcentaje de una entidad entre los dos años, en rojo si baja, azul si sube y gris si no cambia.",
          notas: [sinPar > 0 ? `${sinPar} ${sinPar === 1 ? "entidad no tiene" : "entidades no tienen"} dato en alguno de los dos años y no se ${sinPar === 1 ? "dibuja" : "dibujan"}.` : null],
          cuerpo: lollipop(filas, {ancho, etiqueta: (d) => d.entidad, valor: (d) => d.cambio, color: (d) => SIG.color(d.s), formato: puntos, formatoEje: (x) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x), dominioX: [-LIMITE_CAMBIO, LIMITE_CAMBIO], rotuloX: "Cambio, en puntos", globo: g}),
        },
        tabla: {filas: [...filas].sort((p, q) => p.cambio - q.cambio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: String(v.desde), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(v.hasta), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.cambio, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.a.ee, d.b.ee), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.s), texto: true},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cruce" class="toc-anchor">Regiones y años, en un solo cuadro</h2>

```js
{
  const escala = () => rampaTema(DOMINIO_REGION);
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]})]},
  ]});
  display(analisis({
    id: "cruce", numero: 3, titulo: "Regiones y años, en un solo cuadro", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA,
    explica: "Cada celda cruza una región con un año y dice qué parte de su población cumple la condición. El color es la misma cifra que la celda imprime: más oscuro, porcentaje más alto. La escala va de 0 a 50 % y es la misma con cualquier filtro.",
    dibujar: ({v, ancho}) => {
      const filas = REGIONES.flatMap((region) => ANIOS.map((anio) => ({region, anio, ...tasa(indicador.filter((r) => r.region === region && r.anio === anio && r.sexo === v.sexo))})));
      const g = globo({
        donde: (d) => d.region ?? d._y, cuando: (d) => d.anio ?? d._x,
        color: () => P.tonoTexto, valor: (d) => d.pct, formato: "pct",
        frase: `de la ${v.sexo === "Total" ? "población" : v.sexo.toLowerCase()} ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
      });
      return {
        figura: {
          titulo: "Población que cumple la condición, por región y año",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · 2000 - 2020`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada celda es el porcentaje de la población de una región que cumple la condición en un año, con el color de esa misma cifra.",
          cuerpo: heatmap(filas, {ancho: Math.min(ancho, 820), x: (d) => d.anio, y: (d) => d.region, valor: (d) => d.pct, escala: escala(), ordenX: ANIOS, ordenY: REGIONES,
            formatoCelda: (x) => pct(x), tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 10, 20, 30, 40, 50], formatoLeyenda: (x) => (x === 50 ? "50 o más" : String(x)), altoFila: 44, globo: g}),
        },
        tabla: {filas, columnas: [
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="mosaico-sexo" class="toc-anchor">Mujeres y hombres en el mapa, entidad por entidad</h2>

```js
{
  // Mismo color de identidad que la brecha de la sección 1: el rojo y el azul
  // de este capítulo hablan de cambio, no de sexo, así que aquí no se usan.
  const color = categorias(["Mujeres", "Hombres"]);
  // Dominio FIJO de la rampa: el porcentaje más alto de una entidad por sexo es 71.1 %.
  const DOMINIO_SEXO = [0, 75];
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "entidad", rotulo: "Entidad destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(indicador, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "mosaico-sexo", numero: 4, titulo: "Mujeres y hombres en el mapa, entidad por entidad", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([1143, 781, 857]),
    explica: ["Cada cuadro es una entidad, acomodada como en el mapa del país, y va partido en dos: el triángulo de arriba a la izquierda tiene el color del porcentaje de mujeres que cumplen la condición y el de abajo a la derecha, el de los hombres. Los dos usan la misma escala, así que un cuadro de un solo tono quiere decir que mujeres y hombres están parejos.",
      "La pastilla de la esquina dice la brecha, el porcentaje de mujeres menos el de hombres, en puntos: si las mujeres tienen 42 % y los hombres 37 %, dice +5.0 y su punto lleva el color de las mujeres. El punto va en gris cuando la diferencia no supera el margen de error, que con pocos casos en la muestra puede ser de varios puntos."],
    dibujar: ({v, ancho}) => {
      const base = indicador.filter((r) => r.anio === v.anio);
      const valores = new Map();
      for (const e of ENTIDADES) {
        const m = base.find((r) => r.cve === e.cve && r.sexo === "Mujeres") ?? null, h = base.find((r) => r.cve === e.cve && r.sexo === "Hombres") ?? null;
        if (!m && !h) continue;
        const s = m && h ? sentido(h.pct, m.pct, {eeA: h.ee, eeB: m.ee}) : null;
        valores.set(e.cve, {cve: e.cve, entidad: e.nombre, m, h, brecha: m && h ? m.pct - h.pct : null, mayor: s === "sube" ? "Mujeres" : s === "baja" ? "Hombres" : s ? "Parejos" : null});
      }
      const fila = (d) => (d._lado === "a" ? d.m : d.h);
      const sexoDe = (d) => (d._lado === "a" ? "Mujeres" : "Hombres");
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, grupo: sexoDe, color: (d) => color(sexoDe(d)),
        valor: (d) => fila(d)?.pct ?? null, formato: "pct",
        frase: (d) => `de ${d._lado === "a" ? "las mujeres" : "los hombres"} ${UNIVERSO} cumple la condición`,
        personas: (d) => fila(d)?.num, universo: (d) => fila(d)?.den, unidad: (d) => sexoDe(d).toLowerCase(), apellido: UNIVERSO,
        comparacion: (d) => (d.brecha == null ? null : `Brecha, mujeres menos hombres: ${puntos(d.brecha)}`),
        precision: (d) => { const r = fila(d); return r ? {valor: r.pct, ee: r.ee, casos: r.casos} : null; },
      });
      const nombre = ENTIDADES.find((e) => e.cve === v.entidad)?.nombre;
      // La pastilla lleva siempre la brecha, mujeres menos hombres, con signo.
      const corto = (x) => puntos(x).replace(/ puntos?$/, "");
      const tabla = [...valores.values()].filter((d) => d.brecha != null).sort((p, q) => Math.abs(q.brecha) - Math.abs(p.brecha));
      const conteo = (k) => tabla.filter((d) => d.mayor === k).length;
      return {
        kpis: [
          {etiqueta: "Entidades donde el porcentaje de las mujeres es mayor", cifra: String(conteo("Mujeres")), nota: `de ${tabla.length} con dato en ${v.anio}`},
          {etiqueta: "Donde el de los hombres es mayor", cifra: String(conteo("Hombres"))},
          {etiqueta: "Parejos, dentro del margen de error", cifra: String(conteo("Parejos"))},
        ],
        figura: {
          titulo: "Mujeres y hombres que cumplen la condición, por entidad",
          subtitulo: `Población ${UNIVERSO} · las 32 entidades · ${v.anio} · mujeres arriba y hombres abajo${nombre ? ` · se destaca ${nombre}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada cuadro es una entidad: arriba, el porcentaje de mujeres; abajo, el de hombres, y la pastilla dice quién es mayor y por cuánto.",
          cuerpo: mosaicoTriangulos(valores, {ancho: Math.min(ancho, 980), a: (d) => d.m?.pct ?? null, b: (d) => d.h?.pct ?? null, escala: rampaTema(DOMINIO_SEXO),
            nombreA: "Mujeres", nombreB: "Hombres", destacar: v.entidad,
            marca: (d) => (d.mayor ? {signo: "punto", color: d.mayor === "Parejos" ? P.gris : color(d.mayor), texto: corto(d.brecha)} : null),
            leyendaMarca: [{signo: "punto", color: color("Mujeres"), texto: "Mayor en mujeres"}, {signo: "punto", color: color("Hombres"), texto: "Mayor en hombres"}, {signo: "punto", color: P.gris, texto: "Parejos, dentro del margen de error · la cifra es mujeres menos hombres, en puntos"}],
            ordenAngosto: (p, q) => (q?.brecha ?? -1e9) - (p?.brecha ?? -1e9),
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 25, 50, 75], formatoLeyenda: (x) => (x === 75 ? "75 o más" : String(x)), globo: g}),
        },
        tabla: {filas: tabla, columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Mujeres", valor: (d) => d.m.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.m.ee, formato: (x) => margen(x)},
          {titulo: "Hombres", valor: (d) => d.h.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.h.ee, formato: (x) => margen(x)},
          {titulo: "Brecha", valor: (d) => d.brecha, formato: "puntos"},
          {titulo: "Mayor", valor: (d) => d.mayor, texto: true},
          {titulo: "Casos, mujeres", valor: (d) => d.m.casos, formato: "conteo"},
          {titulo: "Casos, hombres", valor: (d) => d.h.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

```js
// Formas de las secciones 5 a 9: se importan directo de su archivo.
import {barras} from "../components/formas/barras.js";
import {agrupadas} from "../components/formas/agrupadas.js";
import {ranking} from "../components/formas/ranking.js";
import {puntosSeries} from "../components/formas/puntos-series.js";
import {cifra} from "../components/formas/cifra.js";
import {pocoPrecisa} from "../components/formato.js";
import {leerTic, leerAsistenciaEdad, leerParticipacion, leerInternetIndigena, leerUsuarios, quienesSexo, unidadSexo, textoSexo} from "../components/muestra-gB.js";

const asistenciaEdad = leerAsistenciaEdad(await FileAttachment("../data/muestra/gB_asistencia_edad.csv").csv());
const participacion = leerParticipacion(await FileAttachment("../data/muestra/gB_participacion.csv").csv());
const internetIndigena = leerInternetIndigena(await FileAttachment("../data/muestra/gB_internet_indigena.csv").csv());
const usuarios = leerUsuarios(await FileAttachment("../data/muestra/gB_usuarios.csv").csv());
const tic = leerTic(await FileAttachment("../data/muestra/gB_tic_entidad.csv").csv());

const AMBITOS = [{valor: "Total", texto: "Todo el país"}, {valor: "Urbano", texto: "Localidades urbanas"}, {valor: "Rural", texto: "Localidades rurales"}];
const textoAmbito = (a) => AMBITOS.find((x) => x.valor === a)?.texto ?? a;
const SEXOS = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
const incierta = (d) => pocoPrecisa({valor: d.pct, ee: d.ee, casos: d.casos});
// Dominios FIJOS de estas secciones, medidos sobre toda la muestra: todas
// son porcentajes de 0 a 100 y la asistencia de 6 a 11 años llega a 98.0 %.
const DOMINIO_PCT = [0, 100];
// La cifra con tendencia: la serie de usuarios va de 29.7 % (rural, 2015) a
// 88.2 % (urbano, 2024); el eje de las líneas va de 20 a 100 en los tres.
const DOMINIO_USUARIOS = [20, 100];
const EDADES = [...new Set([...asistenciaEdad].sort((a, b) => a.orden - b.orden).map((d) => d.edad))];
const ESCOLARIDADES = ["Primaria", "Secundaria", "Media superior", "Superior"];
const GRUPOS_INDIGENA = ["Habla lengua indígena", "Se considera indígena, no habla", "Resto de la población"];
const FRASE_GRUPO = {
  "Habla lengua indígena": "donde la persona de referencia habla una lengua indígena",
  "Se considera indígena, no habla": "donde la persona de referencia se considera indígena y no habla una lengua indígena",
  "Resto de la población": "del resto de la población",
};
const INDICADORES_TIC = ["Internet", "Computadora", "Teléfono celular", "Televisión de paga"];
const enMinuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
```

<h2 id="barras" class="toc-anchor">Asistencia escolar por grupo de edad</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "ambito", rotulo: "Ámbito", inicial: "Total", opciones: AMBITOS})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(asistenciaEdad, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "barras", numero: 5, titulo: "Asistencia escolar por grupo de edad", entrada: "Forma base de respaldo: barras verticales para grupos que tienen un orden propio.",
    panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([482, 435, 456]),
    explica: "Cada barra es un grupo de edad y su altura es la parte de ese grupo que asiste a la escuela. Si de cada 100 jóvenes de 15 a 17 años asisten 76, la barra llega a 76.0 %. Los grupos van en el orden de la edad y no por su valor. Esta forma es el respaldo de las variantes llamativas de la galería: se usa cuando ninguna cabe.",
    dibujar: ({v, ancho}) => {
      const sel = asistenciaEdad.filter((d) => d.anio === v.anio && d.ambito === v.ambito && d.sexo === v.sexo);
      const previo = (d) => asistenciaEdad.find((r) => r.anio === v.anio - 2 && r.ambito === d.ambito && r.sexo === d.sexo && r.edad === d.edad);
      const g = globo({
        donde: textoAmbito(v.ambito), cuando: v.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: (d) => `de ${quienesSexo(d.sexo)} de ${d.edad} años asiste a la escuela`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: (d) => `de ${d.edad} años`,
        comparacion: (d) => (previo(d) ? `${v.anio - 2}: ${pct(previo(d).pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Población que asiste a la escuela, por grupo de edad",
          subtitulo: `${textoAmbito(v.ambito)} · ${textoSexo(v.sexo)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es el porcentaje de la población de ese grupo de edad que asiste a la escuela, con la cifra escrita encima.",
          cuerpo: barras(sel, {ancho: Math.min(ancho, 900), x: (d) => d.edad, valor: (d) => d.pct, orden: EDADES, dominioY: DOMINIO_PCT, rotuloY: "Porcentaje", incierta, globo: g}),
        },
        tabla: {filas: sel, columnas: [
          {titulo: "Grupo de edad", valor: (d) => `${d.edad} años`, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Población que asiste", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="puntos-series" class="toc-anchor">Internet en el hogar según la condición indígena</h2>

```js
{
  const color = categorias(GRUPOS_INDIGENA);
  const filtros = panel({grupos: [
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(internetIndigena, "anio").sort((a, b) => b - a)})]},
    {leyenda: "En qué orden", campos: [campo({id: "orden", rotulo: "Renglones, por", inicial: GRUPOS_INDIGENA[0], opciones: GRUPOS_INDIGENA})]},
  ]});
  display(analisis({
    id: "puntos-series", numero: 6, titulo: "Internet en el hogar según la condición indígena", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([698, 565, 546]),
    explica: "Cada renglón es una entidad y los tres símbolos son la parte de los hogares con internet en tres grupos, según la persona de referencia del hogar: si habla una lengua indígena, si se considera indígena sin hablarla, o el resto. La raya gris va del grupo más bajo al más alto. Si en una entidad los hogares hablantes tienen 31 % y el resto 74 %, la raya mide 43 puntos. El color y la forma del símbolo dicen el grupo.",
    dibujar: ({v, ancho}) => {
      const sel = internetIndigena.filter((d) => d.anio === v.anio);
      const resto = (d) => sel.find((r) => r.cve === d.cve && r.grupo === GRUPOS_INDIGENA[2]);
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, grupo: (d) => d.grupo, color: (d) => color(d.grupo),
        valor: (d) => d.pct, formato: "pct",
        frase: (d) => `de los hogares ${FRASE_GRUPO[d.grupo]} tiene internet`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: "hogares",
        comparacion: (d) => (d.grupo === GRUPOS_INDIGENA[2] || !resto(d) ? null : `Frente al resto de la población: ${puntos(d.pct - resto(d).pct)}`),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Hogares con internet según la condición indígena, por entidad",
          subtitulo: `Diez entidades · ${v.anio} · ordenadas por «${v.orden}»`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada símbolo es el porcentaje de hogares con internet de un grupo en la entidad, y la raya une al más bajo con el más alto.",
          cuerpo: puntosSeries(sel, {ancho, fila: (d) => d.entidad, serie: (d) => d.grupo, valor: (d) => d.pct, series: GRUPOS_INDIGENA, color, ordenPor: v.orden,
            dominioX: DOMINIO_PCT, rotuloX: "Porcentaje de hogares", incierta, corto: (n) => ENTIDADES.find((e) => e.nombre === n)?.corto ?? n, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => a.entidad.localeCompare(b.entidad) || a.orden - b.orden), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Grupo", valor: (d) => d.grupo, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Hogares con internet", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Hogares", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="agrupadas" class="toc-anchor">Participación laboral por escolaridad</h2>

```js
{
  const color = categorias(["Mujeres", "Hombres"]);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "ambito", rotulo: "Ámbito", inicial: "Total", opciones: AMBITOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(participacion, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "agrupadas", numero: 7, titulo: "Participación laboral por escolaridad", entrada: "Forma base de respaldo: barras agrupadas en facetas, para dos o tres series dentro de cada categoría.",
    panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([666, 481, 489]),
    explica: "Cada bloque es un nivel de escolaridad y dentro van dos barras, mujeres y hombres. La altura es la parte de ese grupo, de 25 a 64 años, que trabaja o busca trabajo. Si de cada 100 mujeres con primaria 41 trabajan o buscan trabajo, su barra llega a 41.0 %. Esta forma es respaldo: cuando la brecha es la pregunta, la galería usa el dumbbell de la sección 1.",
    dibujar: ({v, ancho}) => {
      const sel = participacion.filter((d) => d.anio === v.anio && d.ambito === v.ambito);
      const otro = (d) => sel.find((r) => r.escolaridad === d.escolaridad && r.sexo !== d.sexo);
      const g = globo({
        donde: (d) => `${textoAmbito(v.ambito)} · ${d.escolaridad}`, cuando: v.anio, grupo: (d) => d.sexo, color: (d) => color(d.sexo),
        valor: (d) => d.pct, formato: "pct",
        frase: (d) => `de ${quienesSexo(d.sexo)} de 25 a 64 años con ${enMinuscula(d.escolaridad)} trabaja o busca trabajo`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: (d) => unidadSexo(d.sexo), apellido: "de 25 a 64 años",
        comparacion: (d) => (otro(d) ? `${otro(d).sexo}: ${pct(otro(d).pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Mujeres y hombres de 25 a 64 años que trabajan o buscan trabajo, por escolaridad",
          subtitulo: `${textoAmbito(v.ambito)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es el porcentaje de mujeres o de hombres de 25 a 64 años con esa escolaridad que trabaja o busca trabajo.",
          cuerpo: agrupadas(sel, {ancho: Math.min(ancho, 980), faceta: (d) => d.escolaridad, serie: (d) => d.sexo, valor: (d) => d.pct, facetas: ESCOLARIDADES, series: ["Mujeres", "Hombres"],
            color, dominio: DOMINIO_PCT, rotulo: "Porcentaje", incierta, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => a.orden - b.orden), columnas: [
          {titulo: "Escolaridad", valor: (d) => d.escolaridad, texto: true},
          {titulo: "Sexo", valor: (d) => d.sexo, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Trabajan o buscan trabajo", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población de 25 a 64 años", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cifra" class="toc-anchor">Quiénes usan internet, la cifra y su tendencia</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año de la cifra", inicial: 2024, opciones: conDato(usuarios, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "cifra", numero: 8, titulo: "Quiénes usan internet, la cifra y su tendencia", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([838, 356, 338]),
    explica: "Cada bloque es un ámbito: todo el país, las localidades urbanas y las rurales. La cifra grande es la parte de la población de 6 años y más que usa internet en el año elegido, y debajo va el cambio desde el año anterior. Si pasó de 81.2 % a 83.1 %, el cambio es de +1.9 puntos. La línea muestra toda la serie en la misma escala para los tres bloques, y el punto marca el año elegido. El triángulo lleva el color del sentido del cambio, y va en gris cuando el cambio no supera el margen de error.",
    dibujar: ({v, ancho}) => {
      const sel = usuarios.filter((d) => d.sexo === v.sexo);
      const tarjetas = AMBITOS.map((a) => ({nombre: a.texto, filas: sel.filter((d) => d.ambito === a.valor)}));
      const previo = (d) => sel.find((r) => r.ambito === d.ambito && r.anio === d.anio - 1);
      const g = globo({
        donde: (d) => textoAmbito(d.ambito), cuando: (d) => d.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de ${quienesSexo(v.sexo)} de 6 años y más usa internet`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: "de 6 años y más",
        comparacion: (d) => (previo(d) ? `${d.anio - 1}: ${pct(previo(d).pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Población de 6 años y más que usa internet",
          subtitulo: `${textoSexo(v.sexo)} · cifra de ${v.anio} · serie 2015 - 2024`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la cifra grande es el porcentaje del año elegido y la línea, toda la serie en la misma escala para los tres ámbitos.",
          cuerpo: cifra(tarjetas, {ancho, x: (d) => d.anio, valor: (d) => d.pct, ee: (d) => d.ee, elegido: v.anio, dominioY: DOMINIO_USUARIOS, sig: SIG, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => a.ambito.localeCompare(b.ambito) || a.anio - b.anio), columnas: [
          {titulo: "Ámbito", valor: (d) => textoAmbito(d.ambito), texto: true},
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Personas que usan internet", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población de 6 años y más", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="ranking" class="toc-anchor">Hogares con cada servicio, de la entidad más alta a la más baja</h2>

```js
{
  const deIndicador = (v) => (r) => r.indicador === v.indicador && r.cve !== "00";
  const filtros = panel({grupos: [
    {leyenda: "Qué", campos: [campo({id: "indicador", rotulo: "Bien o servicio", inicial: "Internet", opciones: INDICADORES_TIC})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: (v) => conDato(tic, "anio", deIndicador(v)).sort((a, b) => b - a)})]},
    {leyenda: "Dónde", campos: [campo({id: "entidad", rotulo: "Entidad destacada", inicial: "ninguna", opciones: (v) => [{valor: "ninguna", texto: "Ninguna"},
      ...tic.filter((r) => deIndicador(v)(r) && r.anio === v.anio && r.pct != null).map((r) => ({valor: r.entidad, texto: r.entidad})).sort((a, b) => a.texto.localeCompare(b.texto))]})]},
  ]});
  display(analisis({
    id: "ranking", numero: 9, titulo: "Hogares con cada servicio, de la entidad más alta a la más baja", entrada: "Forma base de respaldo: barras horizontales ordenadas, para nombres largos o muchas filas.",
    panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([990, 925, 905]),
    explica: "Cada barra es una entidad y su largo es la parte de sus hogares que tiene el bien o servicio elegido. Las entidades van de la más alta a la más baja, y la raya punteada es el valor de todo el país. Si una entidad tiene 80.4 % y el país 73.8 %, su barra pasa la raya por 6.6 puntos. Al elegir una entidad, esa barra queda en el tono del libro y las demás en gris.",
    dibujar: ({v, ancho}) => {
      const todas = tic.filter((r) => deIndicador(v)(r) && r.anio === v.anio);
      const sel = todas.filter((r) => r.pct != null);
      const nac = tic.find((r) => r.cve === "00" && r.indicador === v.indicador && r.anio === v.anio);
      const sinDato = todas.filter((r) => r.pct == null).map((r) => r.entidad);
      const destacada = v.entidad === "ninguna" ? null : v.entidad;
      const servicio = enMinuscula(v.indicador);
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, color: (d) => (destacada == null || d.entidad === destacada ? P.tonoTexto : P.tinta2),
        valor: (d) => d.pct, formato: "pct",
        frase: `de los hogares tiene ${servicio}`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: "hogares",
        comparacion: () => (nac ? `Todo el país: ${pct(nac.pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: `Hogares con ${servicio}, por entidad`,
          subtitulo: `${v.indicador} · ${sel.length} entidades · ${v.anio}${destacada ? ` · se destaca ${destacada}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es el porcentaje de hogares de la entidad que tiene el bien o servicio elegido, y la raya punteada es el nacional.",
          notas: [sinDato.length ? `${sinDato.join(", ")} no ${sinDato.length === 1 ? "tiene" : "tienen"} dato publicable en ${v.anio}: pocos casos en la muestra.` : null],
          cuerpo: ranking(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, destacar: destacada, dominioX: DOMINIO_PCT,
            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, rotuloX: "Porcentaje de hogares",
            corto: (n) => ENTIDADES.find((e) => e.nombre === n)?.corto ?? n, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Hogares que lo tienen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Hogares", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
