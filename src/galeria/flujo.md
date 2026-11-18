---
title: Flujo
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para ver un <span class="clave">flujo</span></h1>
  <p class="capitulo-entradilla">De dónde a dónde: cuántos pasan de una categoría a otra entre dos o más cortes. Todas las cifras son datos de muestra.</p>
</header>

<!-- Once formas: barra que baja al mapa, flechas sobre el mapa, barras
     apiladas unidas por cintas, aluvial entre dos lados, entradas y salidas
     con saldo, sankey entre regiones, matriz de adyacencia, diagrama de
     arcos, conjuntos paralelos, tabla origen-destino con totales y red. El
     orden evita dos formas iguales seguidas (las de cintas y las de rejilla
     van separadas). Una forma nueva se añade como archivo en
     src/components/formas/ y aquí como una sección más, con la misma
     anatomía. -->
<link rel="stylesheet" href="../formas-flujo.css">
<link rel="stylesheet" href="../formas-territorio.css">
<link rel="stylesheet" href="../formas-gE.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {globo} from "../components/globo.js";
import {panel, campo} from "../components/filtros.js";
import {categorias, significado, P} from "../components/paleta.js";
import {personas} from "../components/formato.js";
import {barraMapa, flechas, apiladasFlujo, aluvial} from "../components/formas/index.js";
import {ENTIDADES, REGIONES, POR_CVE} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerOD, leerMotivos, PERIODO_OD, MIN_CASOS} from "../components/muestra-flujos.js";
import {leerODMotivo, MOTIVOS_OD} from "../components/muestra-territorio.js";

// Flujos entre entidades y reparto por motivo (scripts/muestra_flujos.mjs).
const od = leerOD(await FileAttachment("../data/muestra/od_entidades.csv").csv());
const motivos = leerMotivos(await FileAttachment("../data/muestra/motivos_cortes.csv").csv());
const geo = await FileAttachment("../data/muestra/entidades.geojson").json();
// Qué significan el rojo y el azul en los flujos entre entidades: rojo, las
// personas que salen de un lugar. Azul, las que llegan. Gris, el contexto.
const SIG_FLUJO = significado({rojo: "personas que salen", azul: "personas que llegan", gris: "otros flujos", desfavorable: "baja"});
const salidas = d3.rollup(od, (f) => d3.sum(f, (r) => r.personas), (r) => r.cveOrigen);
const llegadas = d3.rollup(od, (f) => d3.sum(f, (r) => r.personas), (r) => r.cveDestino);
const totalOD = d3.sum(od, (r) => r.personas);
// Ancho FIJO de las flechas: el flujo mayor de la muestra es de 80,267
// personas, así que 90,000 corresponde al ancho máximo con cualquier filtro.
const TOPE_FLUJO = 90000;
const MOTIVOS = ["Motivo A", "Motivo B", "Motivo C", "Otros motivos"];
const colorMotivo = categorias(MOTIVOS.slice(0, 3));
const cortoDe = new Map([...ENTIDADES.map((e) => [e.nombre, e.corto]), ["Otras", "Otras"]]);
```

<h2 id="barra-mapa" class="toc-anchor">A dónde llegan quienes salen de una entidad, y por qué salen</h2>

```js
{
  const odm = leerODMotivo(await FileAttachment("../data/muestra/od_motivo_sexo.csv").csv());
  const PARTES = {
    motivo: {texto: "Motivo", categorias: MOTIVOS_OD, de: (d) => d.motivo},
    sexo: {texto: "Sexo", categorias: ["Mujeres", "Hombres"], de: (d) => d.sexo},
  };
  const salidasDe = d3.rollup(odm, (f) => d3.sum(f, (r) => r.personas), (r) => r.cveOrigen);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "entidad", rotulo: "Entidad de salida", inicial: "12",
      opciones: ENTIDADES.filter((e) => salidasDe.get(e.cve) > 0).map((e) => ({valor: e.cve, texto: e.nombre}))})]},
    {leyenda: "Cómo se parte y qué se destaca", campos: [
      campo({id: "parte", rotulo: "Barra, partida por", inicial: "motivo", opciones: Object.entries(PARTES).map(([valor, p]) => ({valor, texto: p.texto}))}),
      // Dependiente: las categorías de la partición elegida.
      campo({id: "destacada", rotulo: "Categoría destacada", opciones: (v) => PARTES[v.parte ?? "motivo"].categorias}),
      campo({id: "cuantos", rotulo: "Destinos con cinta propia", inicial: 10, opciones: [8, 10, 12]}),
    ]},
  ]});
  display(analisis({
    id: "barra-mapa", numero: 1, titulo: "A dónde llegan quienes salen de una entidad, y por qué salen", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA,
    explica: ["La barra de arriba son todas las personas que salieron de la entidad elegida, partida por motivo o por sexo; el largo de cada tramo es su número de personas. De cada tramo bajan cintas que aterrizan en la entidad a la que llegaron, y su ancho es cuántas personas hicieron ese cambio. Si de 100,000 personas que salieron 20,000 llegaron a una misma entidad, su cinta ocupa la quinta parte de la barra.",
      `Al aterrizar, las cintas se angostan en la misma proporción todas, para que las entidades vecinas no se tapen; la leyenda dice cuánto. La categoría destacada va en rojo (personas que salen) y las demás en gris. Los destinos menores no tienen cinta propia: su parte baja en una cinta que se desvanece y está en la tabla. Una cinta en color punteada tiene menos de ${MIN_CASOS} casos en la muestra.`],
    dibujar: ({v, ancho}) => {
      const parte = PARTES[v.parte], foco = v.entidad, nombre = POR_CVE.get(foco).nombre;
      const tono = SIG_FLUJO.color("baja");
      const g = globo({
        marca: (d) => `${d.origen} → ${d.destino}`, grupo: (d) => d.categoria, color: (d) => (d.categoria === v.destacada ? tono : P.tinta2),
        valor: (d) => 100 * d.valor / d.total, formato: "pct",
        personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const gBarra = globo({
        grupo: (d) => d.categoria, color: (d) => (d.destacada ? tono : P.tinta2),
        valor: (d) => 100 * d.valor / d.total, formato: "pct",
        personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = barraMapa(geo, odm, {
        ancho, origen: (d) => d.cveOrigen, destino: (d) => d.cveDestino, categoria: parte.de, valor: (d) => d.personas, casos: (d) => d.casos,
        foco, categorias: parte.categorias, destacada: v.destacada, maximo: v.cuantos, minimo: MIN_CASOS, color: tono, globo: g, globoBarra: gBarra,
      });
      return {
        figura: {
          titulo: "Personas que salieron de una entidad, por motivo o sexo y entidad de llegada",
          subtitulo: `Salen de ${nombre} · barra partida por ${parte.texto.toLowerCase()} · se destaca: ${v.destacada} · los ${v.cuantos} destinos mayores · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la barra es el total que sale de la entidad y cada cinta, las personas de un tramo que llegaron a otra entidad.",
          notas: [dibujo.hayBajos ? `Las cintas en color punteadas tienen menos de ${MIN_CASOS} casos en la muestra y su cifra es poco precisa.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(dibujo.pares ?? [], (d) => (d.otras ? 1 : 0), (d) => -d.valor), columnas: [
          {titulo: "Llega a", valor: (d) => d.destino, texto: true},
          {titulo: parte.texto, valor: (d) => d.categoria, texto: true},
          {titulo: "Personas", valor: (d) => d.valor, formato: "conteo"},
          {titulo: `Parte de su ${parte.texto.toLowerCase()}`, valor: (d) => 100 * d.valor / d.totalCategoria, formato: "pct"},
          {titulo: "Parte de todas las salidas", valor: (d) => 100 * d.valor / d.total, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="flechas" class="toc-anchor">De qué entidad a qué entidad se mueven las personas</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "entidad", rotulo: "Entidad", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]})]},
    {leyenda: "Qué flujos", campos: [
      // Dependiente: el sentido solo decide algo cuando hay una entidad elegida.
      campo({id: "sentido", rotulo: "Sentido", inicial: "mayores", opciones: (v) => (v.entidad === "todas"
        ? [{valor: "mayores", texto: "Los mayores del país"}]
        : [{valor: "salen", texto: "Salen de la entidad"}, {valor: "llegan", texto: "Llegan a la entidad"}])}),
      campo({id: "cuantos", rotulo: "Flechas en color", inicial: 10, opciones: [8, 10, 12]}),
    ]},
  ]});
  display(analisis({
    id: "flechas", numero: 2, titulo: "De qué entidad a qué entidad se mueven las personas", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: ["Cada flecha une la entidad de donde salieron las personas con la entidad a la que llegaron, y apunta hacia la llegada. Mientras más ancha, más personas: una flecha de 40,000 personas mide el doble de ancho que una de 20,000, con cualquier filtro.",
      `Sin entidad elegida se ven los flujos mayores del país. Al elegir una entidad, o al tocarla en el mapa, se ven sus salidas en rojo o sus llegadas en azul. Las flechas grises son los demás flujos de la selección. Una flecha en color punteada tiene menos de ${MIN_CASOS} casos en la muestra, y los flujos grises con tan pocos casos no se dibujan.`],
    dibujar: ({v, ancho}) => {
      const foco = v.entidad === "todas" ? null : v.entidad, llegan = v.sentido === "llegan";
      const universo = (d) => (llegan ? llegadas.get(d.cveDestino) : salidas.get(d.cveOrigen));
      const g = globo({
        grupo: (d) => `${d.origen} → ${d.destino}`,
        color: () => (foco ? SIG_FLUJO.color(llegan ? "sube" : "baja") : P.tonoTexto),
        valor: (d) => (universo(d) ? 100 * d.personas / universo(d) : null), formato: "pct",
        personas: (d) => d.personas, universo, unidad: llegan ? "personas que llegaron" : "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = flechas(geo, od, {
        ancho, origen: (d) => d.cveOrigen, destino: (d) => d.cveDestino, valor: (d) => d.personas, casos: (d) => d.casos,
        foco, sentido: llegan ? "llegan" : "salen", maximo: v.cuantos, minimo: MIN_CASOS, tope: TOPE_FLUJO,
        alElegir: (cve) => filtros.fijar({entidad: cve === foco ? "todas" : cve}), globo: g,
      });
      const filas = [...(dibujo.dibujados ?? []), ...(dibujo.contexto ?? [])];
      const nombre = foco ? POR_CVE.get(foco).nombre : null;
      return {
        figura: {
          titulo: "Personas que cambiaron de entidad de residencia",
          subtitulo: `Los ${v.cuantos} flujos mayores ${foco ? `que ${llegan ? "llegan a" : "salen de"} ${nombre}` : "entre entidades · Todo el país"} · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada flecha va de la entidad de salida a la de llegada y su ancho es el número de personas que hicieron ese cambio.",
          notas: [dibujo.hayBajos ? `Las flechas punteadas tienen menos de ${MIN_CASOS} casos en la muestra y su cifra es poco precisa.` : null,
            dibujo.ocultos ? `${dibujo.ocultos} flujos menores con menos de ${MIN_CASOS} casos en la muestra no se dibujan; están en la tabla.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas, columnas: [
          {titulo: "Sale de", valor: (d) => d.origen, texto: true},
          {titulo: "Llega a", valor: (d) => d.destino, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte de las salidas del origen", valor: (d) => 100 * d.personas / salidas.get(d.cveOrigen), formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cortes" class="toc-anchor">Cómo cambia el reparto por motivo entre cortes</h2>

```js
{
  // Extremo FIJO del eje en personas, por ámbito: el corte con más personas.
  const topePersonas = d3.rollup(motivos, (f) => d3.max(d3.rollups(f, (c) => d3.sum(c, (r) => r.personas), (r) => r.corte), ([, t]) => t), (r) => r.ambito);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "ambito", rotulo: "Región", inicial: "Nacional", opciones: [{valor: "Nacional", texto: "Todo el país"}, ...REGIONES]})]},
    {leyenda: "Qué se resalta y cómo se mide", campos: [
      campo({id: "destacar", rotulo: "Motivo destacado", inicial: "ninguno", opciones: [{valor: "ninguno", texto: "Ninguno"}, ...MOTIVOS]}),
      campo({id: "medida", rotulo: "Barras", inicial: "parte", opciones: [{valor: "parte", texto: "Parte del total"}, {valor: "personas", texto: "Número de personas"}]}),
    ]},
  ]});
  display(analisis({
    id: "cortes", numero: 3, titulo: "Cómo cambia el reparto por motivo entre cortes", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: 420,
    explica: ["Cada barra es un corte y cada tramo, un motivo. El largo del tramo es la parte del total de personas de ese corte. Las cintas unen el tramo de un motivo con el del mismo motivo en el corte siguiente: si la cinta se ensancha, el motivo ganó parte. Si un motivo pasa de 20 % a 25 %, su cinta termina más ancha y el cambio es de +5.0 puntos.",
      "Los cortes son levantamientos independientes y no siguen a las mismas personas. Por eso ninguna cinta cruza de un motivo a otro: la figura no dice cuántas personas cambiaron de motivo."],
    dibujar: ({v, ancho}) => {
      const filas = motivos.filter((r) => r.ambito === v.ambito), destacar = v.destacar === "ninguno" ? null : v.destacar;
      const lugar = v.ambito === "Nacional" ? "Todo el país" : `Región ${v.ambito}`;
      const tinta = (m) => (m === "Otros motivos" ? P.tinta2 : colorMotivo(m));
      const g = globo({
        marca: (d) => d.motivo, grupo: (d) => d.corte, color: (d) => tinta(d.motivo),
        valor: (d) => d.parte, formato: "pct",
        personas: (d) => d.personas, universo: (d) => d.total, unidad: "personas del corte",
        precision: (d) => ({casos: d.casos}),
      });
      const gCinta = globo({
        marca: (d) => d.categoria, grupo: (d) => `${d.de.corte} a ${d.a.corte}`, color: (d) => tinta(d.categoria),
        valor: (d) => d.cambio, formato: "puntos",
      });
      const dibujo = apiladasFlujo(filas, {
        ancho, corte: (d) => d.corte, categoria: (d) => d.motivo, valor: (d) => d.personas, categorias: MOTIVOS, color: colorMotivo, destacar,
        absoluto: v.medida === "personas", tope: topePersonas.get(v.ambito), rotuloResto: "Los demás motivos", globo: g, globoCinta: gCinta,
      });
      return {
        figura: {
          titulo: "Motivo del cambio de residencia, por corte",
          subtitulo: `${lugar} · ${[...new Set(filas.map((r) => r.corte))].join(", ")} · ${v.medida === "personas" ? "número de personas" : "parte del total de cada corte"}${destacar ? ` · se destaca ${destacar.toLowerCase()}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es un corte y cada tramo un motivo, y las cintas unen el mismo motivo entre cortes independientes, sin seguir a las mismas personas.",
          cuerpo: dibujo,
        },
        tabla: {filas: dibujo.tramos ?? [], columnas: [
          {titulo: "Corte", valor: (d) => d.corte, texto: true},
          {titulo: "Motivo", valor: (d) => d.motivo, texto: true},
          {titulo: "Parte del total", valor: (d) => d.parte, formato: "pct"},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Total del corte", valor: (d) => d.total, formato: "conteo"},
          {titulo: "Cambio frente al corte anterior", valor: (d) => (d.anterior ? d.parte - d.anterior.parte : null), formato: "puntos"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="aluvial" class="toc-anchor">Qué entidades envían y cuáles reciben</h2>

```js
{
  const NODOS = 8;
  const mayores = (acceso) => d3.rollups(od, (f) => d3.sum(f, (r) => r.personas), acceso).sort((a, b) => b[1] - a[1]).slice(0, NODOS).map(([k]) => k);
  const deSalida = mayores((r) => r.origen), deLlegada = mayores((r) => r.destino);
  const filtros = panel({grupos: [
    {leyenda: "Qué se resalta", campos: [
      campo({id: "lado", rotulo: "Lado", inicial: "origen", opciones: [{valor: "origen", texto: "Las salidas de una entidad"}, {valor: "destino", texto: "Las llegadas a una entidad"}]}),
      // Dependiente: solo las entidades que tienen nodo propio en ese lado.
      campo({id: "entidad", rotulo: "Entidad destacada", opciones: (v) => (v.lado === "destino" ? deLlegada : deSalida)}),
    ]},
  ]});
  display(analisis({
    id: "aluvial", numero: 4, titulo: "Qué entidades envían y cuáles reciben", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA,
    explica: ["A la izquierda están las entidades de donde salen más personas y a la derecha las entidades a las que llegan más, cada lado ordenado de mayor a menor. Las demás se juntan en “Otras”. El alto de cada bloque es su número de personas y el porcentaje a su lado, su parte del total. Cada cinta une una salida con una llegada y su grosor es cuántas personas hicieron ese cambio.",
      "Las cintas de la entidad destacada conservan el color y las demás quedan en gris. Si de 200,000 personas que salieron de una entidad 50,000 llegaron a otra, la cinta que las une representa 25 de cada 100 de esas salidas."],
    dibujar: ({v, ancho}) => {
      const deDestino = v.lado === "destino", tono = SIG_FLUJO.color(deDestino ? "sube" : "baja");
      const nom = (n) => (n === "Otras" ? "Otras entidades" : n);
      const totalLado = (d) => (deDestino ? d.totalDestino : d.totalOrigen);
      const g = globo({
        grupo: (d) => `${nom(d.origen)} → ${nom(d.destino)}`, color: (d) => ((deDestino ? d.destino : d.origen) === v.entidad ? tono : P.tinta2),
        valor: (d) => (totalLado(d) ? 100 * d.valor / totalLado(d) : null), formato: "pct",
        personas: (d) => d.valor, universo: totalLado, unidad: deDestino ? "personas que llegaron" : "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const gNodo = globo({
        marca: (d) => nom(d.nombre), grupo: (d) => (d.lado === "origen" ? "Entidad de salida" : "Entidad de llegada"), color: (d) => (d.lado === v.lado && d.nombre === v.entidad ? tono : P.tinta2),
        valor: (d) => 100 * d.valor / d.total, formato: "pct",
        personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que cambiaron de entidad",
      });
      const dibujo = aluvial(od, {
        ancho, origen: (d) => d.origen, destino: (d) => d.destino, valor: (d) => d.personas, casos: (d) => d.casos, maximo: NODOS,
        destacar: {lado: v.lado, nombre: v.entidad}, color: tono, tituloOrigen: "Salen de", tituloDestino: "Llegan a", corto: (n) => cortoDe.get(n) ?? n,
        anotacion: (c) => (deDestino
          ? `De cada 100 personas que llegaron a ${c.destino}, ${Math.round(100 * c.valor / c.totalDestino)} salieron de ${c.origen}.`
          : `De cada 100 personas que salieron de ${c.origen}, ${Math.round(100 * c.valor / c.totalOrigen)} llegaron a ${c.destino}.`),
        globo: g, globoNodo: gNodo,
      });
      return {
        figura: {
          titulo: "Entidad de salida y entidad de llegada de quienes cambiaron de residencia",
          subtitulo: `Las ${NODOS} entidades mayores de cada lado y las demás agrupadas · se destacan las ${deDestino ? "llegadas a" : "salidas de"} ${v.entidad} · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada bloque es una entidad de salida o de llegada y cada cinta, las personas que pasaron de una a otra, con el grosor de su número.",
          cuerpo: dibujo,
        },
        tabla: {filas: [...(dibujo.pares ?? [])].sort((a, b) => b.valor - a.valor), columnas: [
          {titulo: "Sale de", valor: (d) => d.origen, texto: true},
          {titulo: "Llega a", valor: (d) => d.destino, texto: true},
          {titulo: "Personas", valor: (d) => d.valor, formato: "conteo"},
          {titulo: "Parte de las salidas del origen", valor: (d) => 100 * d.valor / d.totalOrigen, formato: "pct"},
          {titulo: "Parte de las llegadas al destino", valor: (d) => 100 * d.valor / d.totalDestino, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

```js
// Formas 5 a 11: saldo, sankey, matriz, arcos, conjuntos, tabla
// origen-destino y red. Cada componente se importa de su archivo.
import {saldo} from "../components/formas/saldo.js";
import {sankey} from "../components/formas/sankey.js";
import {matriz, rampaRaiz} from "../components/formas/matriz.js";
import {arcos} from "../components/formas/arcos.js";
import {conjuntos} from "../components/formas/conjuntos.js";
import {tablaOD} from "../components/formas/tabla-od.js";
import {red} from "../components/formas/red.js";
import {leyendaItems} from "../components/formas/comun.js";
import {rampaTema} from "../components/paleta.js";
import {entero, numero} from "../components/formato.js";
import {leerSeries} from "../components/muestra-flujos.js";

// Salidas y llegadas anuales por entidad, y flujos por periodo, causa y
// grupo de población (scripts/muestra_flujos.mjs y scripts/muestra_mapa.mjs).
const series = leerSeries(await FileAttachment("../data/muestra/series_entidades.csv").csv());
const flujosG = (await FileAttachment("../data/muestra/flujos_grupos.csv").csv()).map((r) => ({
  periodo: r.periodo, causa: r.causa, grupo: r.grupo, edad: r.edad, sexo: r.sexo,
  o: String(r.origen).padStart(2, "0"), d: String(r.destino).padStart(2, "0"), personas: +r.personas, casos: +r.casos,
}));
// Alto que se reserva antes de dibujar cada sección, medido en la página
// construida: [teléfono, escritorio, pantalla grande].
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
const PERIODOS_G = [{valor: "2015-2020", texto: "2015 - 2020"}, {valor: "2020-2025", texto: "2020 - 2025"}];
const CAUSAS_G = [{valor: "todas", texto: "Todas las causas"}, {valor: "violencia", texto: "Por violencia"}, {valor: "otras", texto: "Por otra causa"}];
const GRUPOS_G = [
  {valor: "total", texto: "Toda la población", apellido: ""},
  {valor: "hli", texto: "Habla una lengua indígena", apellido: "hablan una lengua indígena"},
  {valor: "indigena", texto: "Se considera indígena", apellido: "se consideran indígenas"},
  {valor: "afro", texto: "Se considera afrodescendiente", apellido: "se consideran afrodescendientes"},
  {valor: "discapacidad", texto: "Con discapacidad", apellido: "tienen alguna discapacidad"},
  {valor: "otro_pais", texto: "Nació en otro país", apellido: "nacieron en otro país"},
];
const textoDe = (lista, v) => lista.find((x) => String(x.valor) === String(v))?.texto ?? v;
const nombreDe = (k) => POR_CVE.get(k)?.nombre ?? k;
const cortoDe2 = (k) => POR_CVE.get(k)?.corto ?? k;
// Flujo de cada par de entidades de la matriz origen-destino, por clave.
const odPar = new Map(od.map((r) => [`${r.cveOrigen}-${r.cveDestino}`, r]));
// Escala FIJA de las celdas: el flujo mayor de la muestra es de 80,267
// personas; con la raíz cuadrada, 80,000 queda en el tono más oscuro.
const TOPE_CELDA = 80000;
const escalaCelda = rampaRaiz(rampaTema([0, 1]), TOPE_CELDA);
// Centro de cada entidad, para ordenar de norte a sur y de oeste a este.
const centroEnt = new Map(geo.features.map((f) => [ENTIDADES.find((e) => e.iso === f.properties.id)?.cve, d3.geoCentroid(f)]));
```

---

<h2 id="saldo" class="toc-anchor">Cuántas personas salen y cuántas llegan a cada entidad</h2>

```js
{
  // Extremos FIJOS del eje: en la muestra, la salida anual mayor es de
  // 322,533 personas y la llegada mayor, de 309,135 (350,000 con cualquier
  // filtro); por cada mil habitantes, 42.2 y 46.6 (50 con cualquier filtro).
  const MEDIDAS = {
    personas: {texto: "Número de personas", tope: 350000, marcas: [-300000, -150000, 0, 150000, 300000], eje: (v) => (v ? `${entero(v / 1000)} mil` : "0"),
      de: (d, k) => d[k], cifra: (v) => personas(v), rotuloEje: "← salen · miles de personas · llegan →"},
    tasa: {texto: "Por cada mil habitantes", tope: 50, marcas: [-50, -25, 0, 25, 50], eje: (v) => numero(v, 0),
      de: (d, k) => (k === "salen" ? d.tasaSalen : d.tasaLlegan), cifra: (v) => `${numero(v, 1)} por cada mil`, rotuloEje: "← salen · por cada mil habitantes · llegan →"},
  };
  const anios = [...new Set(series.map((r) => r.anio))].sort((a, b) => b - a);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...REGIONES]})]},
    {leyenda: "Cuándo y cómo se mide", campos: [
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: anios}),
      campo({id: "medida", rotulo: "Barras", inicial: "personas", opciones: Object.entries(MEDIDAS).map(([valor, m]) => ({valor, texto: m.texto}))}),
    ]},
  ]});
  display(analisis({
    id: "saldo", numero: 5, titulo: "Cuántas personas salen y cuántas llegan a cada entidad", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([1054, 1005, 986]),
    explica: ["Cada renglón es una entidad. La barra hacia la izquierda son las personas que salieron de ella a otra entidad en el año, y la barra hacia la derecha, las que llegaron. El punto marca el saldo, llegadas menos salidas, y su cifra va al final del renglón. Si llegaron 120,000 personas y salieron 90,000, el saldo es de +30,000.",
      "Los renglones van del saldo mayor al menor. Un saldo cercano a cero puede esconder dos barras largas: muchas personas salen y muchas llegan. La escala no cambia con los filtros, así que la misma barra quiere decir lo mismo en cualquier año."],
    dibujar: ({v, ancho}) => {
      const m = MEDIDAS[v.medida];
      const filas = series.filter((r) => r.anio === v.anio && (v.region === "todas" || r.region === v.region));
      const lugar = v.region === "todas" ? "Todo el país" : `Región ${v.region}`;
      const g = globo({
        marca: (d) => d.entidad, grupo: (d) => (d.sentido === "salen" ? "Salen" : "Llegan"), color: (d) => SIG_FLUJO.color(d.sentido === "salen" ? "baja" : "sube"),
        valor: (d) => MEDIDAS.tasa.de(d, d.sentido), formato: (x) => MEDIDAS.tasa.cifra(x),
        personas: (d) => d[d.sentido], universo: (d) => d.poblacion, unidad: "habitantes",
        precision: (d) => ({casos: d.casos}),
      });
      const gs = globo({
        marca: (d) => d.entidad, grupo: "Saldo, llegadas menos salidas", color: () => P.tinta,
        valor: (d) => (v.medida === "personas" ? d.llegan - d.salen : d.tasaLlegan - d.tasaSalen), formato: (x) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${m.cifra(Math.abs(x))}`,
      });
      const dibujo = saldo(filas, {
        ancho, nombre: (d) => d.entidad, corto: (d) => POR_CVE.get(d.cve)?.corto ?? d.entidad,
        salen: (d) => m.de(d, "salen"), llegan: (d) => m.de(d, "llegan"), tope: m.tope, marcas: m.marcas, formatoEje: m.eje,
        formato: (x) => (v.medida === "personas" ? entero(x) : numero(x, 1)),
        color: {salen: SIG_FLUJO.color("baja"), llegan: SIG_FLUJO.color("sube")},
        rotulos: {salen: "Salen de la entidad", llegan: "Llegan a la entidad", saldo: "Saldo: llegan menos salen", eje: m.rotuloEje}, globo: g, globoSaldo: gs,
      });
      return {
        figura: {
          titulo: "Personas que salen y que llegan a cada entidad, con su saldo",
          subtitulo: `${lugar} · ${v.anio} · ${m.texto.toLowerCase()} · ordenadas por saldo`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada renglón es una entidad: a la izquierda quienes salieron, a la derecha quienes llegaron, y el punto marca el saldo.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(filas, (d) => -(d.llegan - d.salen)), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Salen", valor: (d) => d.salen, formato: "conteo"},
          {titulo: "Llegan", valor: (d) => d.llegan, formato: "conteo"},
          {titulo: "Saldo", valor: (d) => d.llegan - d.salen, formato: (x) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${entero(Math.abs(x))}`},
          {titulo: "Salen por cada mil", valor: (d) => d.tasaSalen, formato: (x) => numero(x, 1)},
          {titulo: "Llegan por cada mil", valor: (d) => d.tasaLlegan, formato: (x) => numero(x, 1)},
          {titulo: "Población", valor: (d) => d.poblacion, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="sankey" class="toc-anchor">De qué región a qué región se mueven las personas</h2>

```js
{
  const corta = {"Centro-Occidente": "Centro-Occ."};
  const filtros = panel({grupos: [
    {leyenda: "Cuándo y por qué", campos: [
      campo({id: "periodo", rotulo: "Periodo", inicial: "2015-2020", opciones: PERIODOS_G}),
      campo({id: "causa", rotulo: "Causa del cambio", inicial: "todas", opciones: CAUSAS_G}),
    ]},
    {leyenda: "Qué se destaca", campos: [campo({id: "region", rotulo: "Región destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...REGIONES]})]},
  ]});
  display(analisis({
    id: "sankey", numero: 6, titulo: "De qué región a qué región se mueven las personas", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([571, 636, 616]),
    explica: ["A la izquierda está la región de donde salieron las personas y a la derecha, la región a la que llegaron. Cada cinta une una salida con una llegada y su grosor es cuántas personas hicieron ese cambio de entidad. Una cinta que vuelve a su misma región son cambios entre entidades de esa región. Si de 300,000 personas que salieron del Centro 60,000 llegaron al Norte, esa cinta es la quinta parte del bloque del Centro.",
      "Al destacar una región, sus salidas conservan el color y las demás quedan en gris. El alto de los bloques se compara dentro de la figura: cambia con el periodo y con la causa."],
    dibujar: ({v, ancho}) => {
      const angosto = ancho < 560;
      const reg = (k) => POR_CVE.get(k)?.region;
      const nombreR = (r) => (angosto ? corta[r] ?? r : r);
      const filas = flujosG.filter((r) => r.grupo === "total" && r.periodo === v.periodo && (v.causa === "todas" || r.causa === v.causa));
      const pares = d3.rollups(filas, (f) => ({personas: d3.sum(f, (r) => r.personas), casos: d3.sum(f, (r) => r.casos)}), (r) => reg(r.o), (r) => reg(r.d))
        .flatMap(([o, ds]) => ds.map(([d, x]) => ({origen: nombreR(o), destino: nombreR(d), regionO: o, regionD: d, ...x})));
      const total = d3.sum(pares, (p) => p.personas);
      const destacada = v.region === "ninguna" ? null : v.region;
      const color = (c) => (!destacada || c === nombreR(destacada) ? P.serie : P.contexto);
      const periodo = textoDe(PERIODOS_G, v.periodo);
      const g = globo({
        grupo: (d) => `${d.regionO} → ${d.regionD}`, color: (d) => color(d.origen),
        valor: (d) => (d.totalOrigen ? (100 * d.personas) / d.totalOrigen : null), formato: "pct",
        personas: (d) => d.personas, universo: (d) => d.totalOrigen, unidad: "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const gNodo = globo({
        marca: (d) => `Región ${REGIONES.find((r) => nombreR(r) === d.categoria) ?? d.categoria}`, grupo: (d) => d.etapa, color: (d) => color(d.categoria),
        valor: (d) => (100 * d.valor) / d.total, formato: "pct",
        personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que cambiaron de región",
      });
      const dibujo = sankey(pares, {
        ancho: angosto ? ancho - 32 : ancho, origen: (d) => d.origen, destino: (d) => d.destino, valor: (d) => d.personas,
        etapas: ["Salen de", "Llegan a"], categorias: REGIONES.map(nombreR), color, globo: g, globoNodo: gNodo,
      });
      const leyenda = destacada
        ? leyendaItems([{tipo: "cuadro", color: P.serie, texto: `Salen de la región ${destacada}`}, {tipo: "cuadro", color: P.contexto, texto: "Las demás regiones"}])
        : leyendaItems([{tipo: "cuadro", color: P.serie, texto: "Personas que cambiaron de entidad"}]);
      const contenedor = document.createElement("div");
      contenedor.className = "forma";
      const lienzo = document.createElement("div");
      lienzo.className = angosto ? "gE-sankey gE-angosto" : "gE-sankey";
      lienzo.append(dibujo);
      contenedor.append(leyenda, lienzo);
      return {
        figura: {
          titulo: "Personas que cambiaron de entidad, por región de salida y de llegada",
          subtitulo: `Todo el país · ${periodo} · ${textoDe(CAUSAS_G, v.causa).toLowerCase()}${destacada ? ` · se destaca la región ${destacada}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada cinta une la región de salida con la de llegada y su grosor es el número de personas que cambiaron de entidad.",
          cuerpo: contenedor,
        },
        tabla: {filas: d3.sort(pares, (p) => -p.personas), columnas: [
          {titulo: "Región de salida", valor: (d) => d.regionO, texto: true},
          {titulo: "Región de llegada", valor: (d) => d.regionD, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte de todos los cambios", valor: (d) => (100 * d.personas) / total, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="matriz" class="toc-anchor">Cuántas personas se mueven entre cada par de entidades</h2>

```js
{
  const movimiento = new Map(ENTIDADES.map((e) => [e.cve, (salidas.get(e.cve) ?? 0) + (llegadas.get(e.cve) ?? 0)]));
  const mayores = d3.sort(ENTIDADES.map((e) => e.cve), (k) => -movimiento.get(k)).slice(0, 12);
  const AMBITOS = [{valor: "mayores", texto: "Las 12 con más movimiento"}, ...REGIONES.map((r) => ({valor: r, texto: `Región ${r}`}))];
  const lugaresDe = (a) => (a === "mayores" ? mayores : ENTIDADES.filter((e) => e.region === a).map((e) => e.cve));
  const ORDENES = {
    movimiento: {texto: "De más a menos movimiento", fn: (ks) => d3.sort(ks, (k) => -movimiento.get(k))},
    norte: {texto: "De norte a sur", fn: (ks) => d3.sort(ks, (k) => -centroEnt.get(k)[1])},
    nombre: {texto: "Por nombre", fn: (ks) => [...ks].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), "es"))},
  };
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [
      campo({id: "ambito", rotulo: "Entidades", inicial: "mayores", opciones: AMBITOS}),
      // Dependiente: solo las entidades que están en la matriz.
      campo({id: "destacar", rotulo: "Entidad destacada", inicial: "ninguna", opciones: (v) => [{valor: "ninguna", texto: "Ninguna"}, ...d3.sort(lugaresDe(v.ambito ?? "mayores"), nombreDe).map((k) => ({valor: k, texto: nombreDe(k)}))]}),
    ]},
    {leyenda: "Cómo se ordena", campos: [campo({id: "orden", rotulo: "Renglones y columnas", inicial: "movimiento", opciones: Object.entries(ORDENES).map(([valor, o]) => ({valor, texto: o.texto}))})]},
  ]});
  display(analisis({
    id: "matriz", numero: 7, titulo: "Cuántas personas se mueven entre cada par de entidades", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([687, 787, 741]),
    explica: ["Cada renglón es la entidad de donde salieron las personas y cada columna, la entidad a la que llegaron. El color de la celda es cuántas personas hicieron ese cambio: más oscuro, más personas. La escala crece con la raíz cuadrada para que los flujos chicos se distingan del cero, y no cambia con los filtros. Una celda de 20,000 personas es más oscura que una de 5,000, aunque no cuatro veces más.",
      "La diagonal es la misma entidad y no cuenta como cambio. Al destacar una entidad, su renglón lleva contorno continuo (sus salidas) y su columna, contorno punteado (sus llegadas)."],
    dibujar: ({v, ancho}) => {
      const lugares = ORDENES[v.orden].fn(lugaresDe(v.ambito));
      const foco = v.destacar === "ninguna" ? null : v.destacar;
      const g = globo({
        grupo: (d) => `${d.origen} → ${d.destino}`, color: () => P.tonoTexto,
        valor: (d) => (salidas.get(d.cveOrigen) ? (100 * d.valor) / salidas.get(d.cveOrigen) : null), formato: "pct",
        personas: (d) => d.valor, universo: (d) => salidas.get(d.cveOrigen), unidad: "personas que salieron",
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = matriz(lugares, {
        ancho, valor: (o, d) => odPar.get(`${o}-${d}`)?.personas ?? null, casos: (o, d) => odPar.get(`${o}-${d}`)?.casos ?? null,
        nombre: nombreDe, corto: cortoDe2, escala: escalaCelda, marcas: [0, 5000, 20000, 45000, TOPE_CELDA], destacar: foco, globo: g,
      });
      const pares = lugares.flatMap((o) => lugares.filter((d) => d !== o).map((d) => odPar.get(`${o}-${d}`)).filter(Boolean));
      return {
        figura: {
          titulo: "Personas que cambiaron de entidad, por entidad de salida y de llegada",
          subtitulo: `${textoDe(AMBITOS, v.ambito)} · ${ORDENES[v.orden].texto.toLowerCase()}${foco ? ` · se destaca ${nombreDe(foco)}` : ""} · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada celda es el número de personas que cambiaron de la entidad del renglón a la de la columna.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(pares, (r) => -r.personas), columnas: [
          {titulo: "Sale de", valor: (d) => d.origen, texto: true},
          {titulo: "Llega a", valor: (d) => d.destino, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte de las salidas del origen", valor: (d) => (100 * d.personas) / salidas.get(d.cveOrigen), formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="arcos" class="toc-anchor">Qué entidades unen los flujos mayores</h2>

```js
{
  // Grosor FIJO de los arcos: 80,000 personas es el grosor máximo con
  // cualquier filtro (el flujo mayor de la muestra es de 80,267).
  const flujosArco = od.map((r) => ({o: r.cveOrigen, d: r.cveDestino, valor: r.personas, casos: r.casos}));
  const ORDENES = {
    norte: {texto: "De norte a sur", fn: () => d3.sort(ENTIDADES.map((e) => e.cve), (k) => -centroEnt.get(k)[1])},
    oeste: {texto: "De oeste a este", fn: () => d3.sort(ENTIDADES.map((e) => e.cve), (k) => centroEnt.get(k)[0])},
  };
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "entidad", rotulo: "Entidad", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]})]},
    {leyenda: "Qué se dibuja", campos: [
      campo({id: "orden", rotulo: "Orden de las entidades", inicial: "norte", opciones: Object.entries(ORDENES).map(([valor, o]) => ({valor, texto: o.texto}))}),
      campo({id: "cuantos", rotulo: "Flujos en color", inicial: 15, opciones: [10, 15, 25]}),
    ]},
  ]});
  display(analisis({
    id: "arcos", numero: 8, titulo: "Qué entidades unen los flujos mayores", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([549, 508, 536]),
    explica: ["Las 32 entidades van en fila, de norte a sur o de oeste a este. Cada arco une la entidad de donde salieron las personas con la entidad a la que llegaron, y su grosor es cuántas personas hicieron ese cambio: un arco de 80,000 personas es el más grueso con cualquier filtro. Un arco alto une entidades lejanas en ese orden.",
      "Sin entidad elegida se ven los flujos mayores del país. Al elegir una entidad, sus salidas van en rojo y sus llegadas en azul, y los flujos mayores de las demás quedan en gris como referencia."],
    dibujar: ({v, ancho}) => {
      const foco = v.entidad === "todas" ? null : v.entidad;
      const dibujo = arcos(ORDENES[v.orden].fn(), flujosArco, {
        ancho, nombre: nombreDe, corto: cortoDe2, foco, maximo: v.cuantos, tope: TOPE_CELDA,
        globo: globo({
          grupo: (d) => `${d.origen} → ${d.destino}`,
          color: (d) => (!foco ? P.tonoTexto : d.o === foco ? SIG_FLUJO.color("baja") : d.d === foco ? SIG_FLUJO.color("sube") : P.tinta2),
          valor: (d) => (salidas.get(d.o) ? (100 * d.valor) / salidas.get(d.o) : null), formato: "pct",
          personas: (d) => d.valor, universo: (d) => salidas.get(d.o), unidad: "personas que salieron",
          precision: (d) => ({casos: d.casos}),
        }),
        globoLugar: globo({
          grupo: (d) => `${d.nombre} · salen y llegan`, color: () => P.tonoTexto,
          valor: (d) => d.salen + d.llegan, formato: (x) => personas(x),
        }),
      });
      return {
        figura: {
          titulo: "Flujos mayores entre entidades, con las entidades en fila",
          subtitulo: `${foco ? `Salidas y llegadas de ${nombreDe(foco)}` : "Todo el país"} · los ${v.cuantos} flujos mayores · ${ORDENES[v.orden].texto.toLowerCase()} · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada arco une la entidad de salida con la de llegada y su grosor es el número de personas que hicieron ese cambio.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(dibujo.dibujados ?? [], (f) => -f.valor), columnas: [
          {titulo: "Sale de", valor: (d) => nombreDe(d.o), texto: true},
          {titulo: "Llega a", valor: (d) => nombreDe(d.d), texto: true},
          {titulo: "Personas", valor: (d) => d.valor, formato: "conteo"},
          {titulo: "Parte de las salidas del origen", valor: (d) => (100 * d.valor) / salidas.get(d.o), formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="conjuntos" class="toc-anchor">Cómo se reparten quienes cambiaron de entidad por edad, sexo y causa</h2>

```js
{
  const DIMS = [
    {id: "edad", titulo: "Edad", categorias: [{valor: "5-17", texto: "5 a 17 años"}, {valor: "18+", texto: "18 años y más"}], de: (d) => d.edad},
    {id: "sexo", titulo: "Sexo", categorias: [{valor: "m", texto: "Mujeres"}, {valor: "h", texto: "Hombres"}], de: (d) => d.sexo},
    {id: "causa", titulo: "Causa", categorias: [{valor: "violencia", texto: "Por violencia"}, {valor: "otras", texto: "Por otra causa"}], de: (d) => d.causa},
  ];
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "grupo", rotulo: "Grupo de población", inicial: "total", opciones: GRUPOS_G}),
      campo({id: "periodo", rotulo: "Periodo", inicial: "2015-2020", opciones: PERIODOS_G}),
    ]},
    {leyenda: "Qué se sigue", campos: [campo({id: "color", rotulo: "Listones, color por", inicial: "causa", opciones: DIMS.map((dm) => ({valor: dm.id, texto: dm.titulo}))})]},
  ]});
  display(analisis({
    id: "conjuntos", numero: 9, titulo: "Cómo se reparten quienes cambiaron de entidad por edad, sexo y causa", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([597, 575, 556]),
    explica: ["Hay tres columnas: edad, sexo y causa del cambio. En cada una, el alto de cada bloque es la parte de las personas que cambiaron de entidad que está en esa categoría. Los listones siguen a un mismo grupo de personas de una columna a la siguiente: el listón que va de “5 a 17 años” a “Mujeres” y luego a “Por violencia” son las niñas y adolescentes que cambiaron de entidad por violencia.",
      "El color de los listones sigue a una de las tres variables, la que se elija en el panel. Si 8 de cada 100 personas cambiaron por violencia, el bloque “Por violencia” mide 8 de cada 100 partes del alto."],
    dibujar: ({v, ancho}) => {
      const grupo = GRUPOS_G.find((x) => x.valor === v.grupo);
      const filas = flujosG.filter((r) => r.grupo === v.grupo && r.periodo === v.periodo);
      const dim = DIMS.find((dm) => dm.id === v.color);
      const color = categorias(dim.categorias.map((q) => q.texto));
      const periodo = textoDe(PERIODOS_G, v.periodo);
      const dibujo = conjuntos(filas, {
        ancho, dimensiones: DIMS, valor: (d) => d.personas, colorPor: v.color, color,
        globo: globo({
          grupo: (d) => d.combo.map((c) => c.texto).join(" · "), color: (d) => d.color,
          valor: (d) => (100 * d.valor) / d.total, formato: "pct",
          personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que cambiaron de entidad",
        }),
        globoNodo: globo({
          grupo: (d) => `${d.dim}: ${d.texto}`, color: () => P.tinta2,
          valor: (d) => (100 * d.valor) / d.total, formato: "pct",
          personas: (d) => d.valor, universo: (d) => d.total, unidad: "personas que cambiaron de entidad",
        }),
      });
      return {
        figura: {
          titulo: "Personas que cambiaron de entidad, por edad, sexo y causa",
          subtitulo: `${grupo.texto} · ${periodo} · el color sigue a ${dim.titulo.toLowerCase()}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada listón es un grupo de personas con la misma edad, sexo y causa, y su grosor es su número.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(dibujo.combos ?? [], (d) => -d.valor), columnas: [
          {titulo: "Edad", valor: (d) => d.edad, texto: true},
          {titulo: "Sexo", valor: (d) => d.sexo, texto: true},
          {titulo: "Causa", valor: (d) => d.causa, texto: true},
          {titulo: "Personas", valor: (d) => d.valor, formato: "conteo"},
          {titulo: "Parte del total", valor: (d) => (100 * d.valor) / d.total, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="tabla-od" class="toc-anchor">Cuántas personas se mueven entre las entidades de una región</h2>

```js
{
  // Largo FIJO de las barras de los totales: el total mayor dentro de una
  // región es de 232,339 llegadas (240,000 con cualquier filtro).
  const TOPE_TOTAL = 240000;
  const escalaParte = rampaTema([0, 100]);
  const CIFRAS = {personas: "Miles de personas", parte: "De cada 100 que salen"};
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Centro", opciones: REGIONES})]},
    {leyenda: "Qué dice cada celda", campos: [campo({id: "cifra", rotulo: "Cifra de la celda", inicial: "personas", opciones: Object.entries(CIFRAS).map(([valor, texto]) => ({valor, texto}))})]},
  ]});
  display(analisis({
    id: "tabla-od", numero: 10, titulo: "Cuántas personas se mueven entre las entidades de una región", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([640, 539, 494]),
    explica: ["Cada renglón es la entidad de donde salieron las personas y cada columna, la entidad a la que llegaron, solo entre las entidades de la región elegida. La celda dice cuántos miles de personas hicieron ese cambio, o de cada 100 personas que salieron de la entidad del renglón hacia la región, cuántas llegaron a la de la columna. Si de 50,000 salidas 20,000 fueron a una misma entidad, su celda dice 40.",
      "La columna “Salen” suma cada renglón y el renglón “Llegan” suma cada columna, con una barra de la misma escala en los dos. El color de la celda sigue a la cifra que la celda escribe."],
    dibujar: ({v, ancho}) => {
      const lugares = ENTIDADES.filter((e) => e.region === v.region).map((e) => e.cve);
      const valor = (o, d) => odPar.get(`${o}-${d}`)?.personas ?? null;
      const salenFila = new Map(lugares.map((o) => [o, d3.sum(lugares, (d) => (o === d ? 0 : valor(o, d) ?? 0))]));
      const parte = (v0, o) => (v0 == null ? null : (100 * v0) / salenFila.get(o));
      const enPersonas = v.cifra === "personas";
      const g = globo({
        grupo: (d) => `${d.origen} → ${d.destino}`, color: () => P.tonoTexto,
        valor: (d) => parte(d.valor, d.cveOrigen), formato: enPersonas ? "pct" : "de100",
        personas: (d) => d.valor, universo: (d) => salenFila.get(d.cveOrigen), unidad: "personas que salieron",
      });
      const totalLugar = (d) => (d.sentido === "salen" ? salidas : llegadas).get(ENTIDADES.find((e) => e.nombre === d.lugar)?.cve);
      const gt = globo({
        marca: (d) => d.lugar, grupo: (d) => (d.sentido === "salen" ? "Salen a la región" : "Llegan de la región"), color: (d) => SIG_FLUJO.color(d.sentido === "salen" ? "baja" : "sube"),
        valor: (d) => { const u = totalLugar(d); return d.valor == null || !u ? null : (100 * d.valor) / u; }, formato: "pct",
        personas: (d) => d.valor, universo: totalLugar, unidad: (d) => (d.sentido === "salen" ? "personas que salieron" : "personas que llegaron"),
      });
      const dibujo = tablaOD(lugares, {
        ancho, valor, nombre: nombreDe, corto: cortoDe2,
        cifra: (v0, o) => (enPersonas ? numero(v0 / 1000, 1) : entero(parte(v0, o))),
        color: (v0, o) => (enPersonas ? escalaCelda(v0) : escalaParte(parte(v0, o))),
        escala: enPersonas ? escalaCelda : escalaParte, tituloLeyenda: enPersonas ? "Personas" : "De cada 100 que salen",
        marcasLeyenda: enPersonas ? escalaCelda.marcas([0, 5000, 20000, 45000, TOPE_CELDA]) : [0, 25, 50, 75, 100],
        formatoLeyenda: enPersonas ? (t) => escalaCelda.formato(t) : (t) => String(t),
        topeTotal: TOPE_TOTAL, formatoTotal: (x) => numero(x / 1000, 1),
        colorSalen: SIG_FLUJO.color("baja"), colorLlegan: SIG_FLUJO.color("sube"), globo: g, globoTotal: gt,
      });
      const pares = lugares.flatMap((o) => lugares.filter((d) => d !== o).map((d) => odPar.get(`${o}-${d}`)).filter(Boolean));
      return {
        figura: {
          titulo: "Personas que cambiaron de entidad dentro de una región, con totales",
          subtitulo: `Región ${v.region} · ${CIFRAS[v.cifra].toLowerCase()} · totales en miles de personas · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada celda va de la entidad del renglón a la de la columna, y los totales suman cada renglón y cada columna.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(pares, (r) => -r.personas), columnas: [
          {titulo: "Sale de", valor: (d) => d.origen, texto: true},
          {titulo: "Llega a", valor: (d) => d.destino, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "De cada 100 que salen hacia la región", valor: (d) => parte(d.personas, d.cveOrigen), formato: "de100"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="red" class="toc-anchor">Qué entidades comparten más movimiento</h2>

```js
{
  // Tamaño FIJO de los círculos: la entidad con más movimiento (salidas más
  // llegadas) tiene 444,369 personas; 450,000 es el círculo mayor.
  const TOPE_RED = 450000;
  const pares = d3.rollups(od, (f) => ({valor: d3.sum(f, (r) => r.personas), casos: d3.sum(f, (r) => r.casos)}), (r) => [r.cveOrigen, r.cveDestino].sort().join("-"))
    .map(([k, x]) => ({a: k.slice(0, 2), b: k.slice(3), ...x}));
  const nodos = ENTIDADES.map((e) => ({id: e.cve, nombre: e.nombre, corto: e.corto, region: e.region, salen: salidas.get(e.cve) ?? 0, llegan: llegadas.get(e.cve) ?? 0, tamano: (salidas.get(e.cve) ?? 0) + (llegadas.get(e.cve) ?? 0)}));
  const filtros = panel({grupos: [
    {leyenda: "Qué se destaca", campos: [campo({id: "region", rotulo: "Región destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...REGIONES]})]},
    {leyenda: "Qué enlaces se dibujan", campos: [campo({id: "minimo", rotulo: "Enlaces de al menos", inicial: 15000, opciones: [10000, 15000, 20000].map((x) => ({valor: x, texto: `${entero(x)} personas`}))})]},
  ]});
  display(analisis({
    id: "red", numero: 11, titulo: "Qué entidades comparten más movimiento", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([835, 743, 721]),
    explica: ["Cada círculo es una entidad y su área es cuántas personas salieron de ella o llegaron a ella desde otra entidad. Una línea une dos entidades cuando entre ellas se movieron al menos las personas que dice el panel, sumando los dos sentidos, y su grosor es ese número. Si 9,000 personas fueron de una entidad a otra y 7,000 hicieron el camino contrario, su enlace es de 16,000.",
      "La posición no es geográfica: el acomodo junta a las entidades que comparten más movimiento y se calcula una sola vez, así que subir el mínimo solo quita líneas. Al destacar una región, sus entidades y los enlaces entre ellas conservan el color."],
    dibujar: ({v, ancho}) => {
      const region = v.region === "ninguna" ? null : v.region;
      const dibujo = red(nodos, pares, {
        ancho, base: 10000, minimo: v.minimo, tope: TOPE_RED, clave: "red-od", destacar: region ? (id) => POR_CVE.get(id)?.region === region : null,
        globo: globo({
          marca: (d) => `${d.nombre} · salen y llegan`, grupo: (d) => (region ? (d.region === region ? `Región ${region}` : "Otra región") : null), color: (d) => (!region || d.region === region ? P.tonoTexto : P.tinta2),
          valor: (d) => d.tamano, formato: (x) => personas(x),
        }),
        globoEnlace: globo({
          grupo: (d) => `${d.nombreA} y ${d.nombreB}, en los dos sentidos`, color: () => P.tonoTexto,
          valor: (d) => d.valor, formato: (x) => personas(x),
          precision: (d) => ({casos: d.casos}),
        }),
      });
      return {
        figura: {
          titulo: "Entidades unidas por el movimiento de personas entre ellas",
          subtitulo: `Todo el país · enlaces de ${entero(v.minimo)} personas o más${region ? ` · se destaca la región ${region}` : ""} · ${PERIODO_OD}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada círculo es una entidad con el área de su movimiento, y cada línea une dos entidades con mucho intercambio de personas.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(dibujo.enlaces ?? [], (e) => -e.valor), columnas: [
          {titulo: "Entidad", valor: (d) => nombreDe(d.a), texto: true},
          {titulo: "Entidad", valor: (d) => nombreDe(d.b), texto: true},
          {titulo: "Personas en los dos sentidos", valor: (d) => d.valor, formato: "conteo"},
          {titulo: "De la primera a la segunda", valor: (d) => odPar.get(`${d.a}-${d.b}`)?.personas, formato: "conteo"},
          {titulo: "De la segunda a la primera", valor: (d) => odPar.get(`${d.b}-${d.a}`)?.personas, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
