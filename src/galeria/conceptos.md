---
title: Conceptos y diagramas
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para explicar un <span class="clave">concepto</span></h1>
  <p class="capitulo-entradilla">Quién cuenta en un indicador, cómo se achica el universo paso a paso y cómo se traslapan dos definiciones. Todas las cifras son datos de muestra.</p>
</header>

<!-- Tres diagramas de definición: árbol de la pregunta, embudo de universos
     y Euler de dos conjuntos. Cada uno lleva panel, globo y tabla como
     cualquier análisis. Los textos del árbol siguen la revisión de fuentes
     del libro de migración por violencia: universo de 5 años y más, cambio de
     municipio, entidad o país en los cinco años previos y causa principal
     declarada por un adulto del hogar. -->
<link rel="stylesheet" href="../formas-gE.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {globo} from "../components/globo.js";
import {panel, campo} from "../components/filtros.js";
import {significado, P} from "../components/paleta.js";
import {pct, personas, entero} from "../components/formato.js";
import {arbolPregunta} from "../components/formas/arbol-pregunta.js";
import {embudo} from "../components/formas/embudo.js";
import {euler} from "../components/formas/euler.js";
import {MUESTRA} from "../components/libro.js";
import {VERIFICA_MUESTRA} from "../components/muestra.js";

// Universos y definiciones de muestra (scripts/muestra_gE.mjs).
const numeros = (r) => Object.fromEntries(Object.entries(r).map(([k, x]) => [k, ["fuente", "edad", "sexo", "universo"].includes(k) ? x : +x]));
const universos = (await FileAttachment("../data/muestra/gE_universos.csv").csv()).map(numeros);
const definiciones = (await FileAttachment("../data/muestra/gE_euler.csv").csv()).map(numeros);

// SIGNIFICADO DEL COLOR EN ESTE CAPÍTULO. Rojo: cambió de residencia por
// violencia (cuenta en el indicador). Azul: cambió por otra causa. Gris: no
// cambió de municipio, o no especificó la causa. Las dos definiciones de
// población indígena del diagrama de Euler son identidad, no significado:
// van en los tonos de identidad, no en rojo ni azul.
const SIG = significado({rojo: "por violencia", azul: "por otra causa", gris: "sin movilidad o sin causa especificada", desfavorable: "baja"});
const FUENTES = [
  {valor: "2020", texto: "Censo 2020", fecha: "marzo de 2015", pregunta: "¿Por qué dejó de vivir en ese municipio o país?", clave: "clave 0601"},
  {valor: "2025", texto: "Encuesta Intercensal 2025", fecha: "octubre de 2020", pregunta: "¿Cuál fue el motivo principal por el que cambió su domicilio?", clave: "opción 14"},
];
const EDADES = [{valor: "5-17", texto: "5 a 17 años"}, {valor: "18+", texto: "18 años y más"}, {valor: "todas", texto: "5 años y más"}];
const SEXOS = [{valor: "todos", texto: "Mujeres y hombres"}, {valor: "m", texto: "Mujeres"}, {valor: "h", texto: "Hombres"}];
const fuenteDe = (v) => FUENTES.find((f) => f.valor === v);
const textoDe = (lista, v) => lista.find((x) => x.valor === v)?.texto ?? v;
// Suma de numeradores y denominadores de las filas elegidas: nunca se
// promedian porcentajes.
const sumar = (filas) => Object.fromEntries(Object.keys(filas[0] ?? {}).filter((k) => typeof filas[0][k] === "number").map((k) => [k, d3.sum(filas, (r) => r[k])]));
const elegir = (lista, v) => lista.filter((r) => r.fuente === v.fuente && (v.edad === "todas" || r.edad === v.edad) && (!v.sexo || v.sexo === "todos" || r.sexo === v.sexo));
const quienes = (v) => `${v.sexo === "m" ? "mujeres" : v.sexo === "h" ? "hombres" : "personas"} de ${textoDe(EDADES, v.edad)}`;
// Alto que se reserva antes de dibujar cada sección, medido en la página
// construida: [teléfono, escritorio, pantalla grande].
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
const panelBase = () => panel({grupos: [
  {leyenda: "De qué fuente", campos: [campo({id: "fuente", rotulo: "Fuente", inicial: "2020", opciones: FUENTES})]},
  {leyenda: "Entre quiénes", campos: [
    campo({id: "edad", rotulo: "Edad", inicial: "5-17", opciones: EDADES}),
    campo({id: "sexo", rotulo: "Sexo", inicial: "todos", opciones: SEXOS}),
  ]},
]});
```

<h2 id="arbol-pregunta" class="toc-anchor">Quién cuenta como migrante por violencia</h2>

```js
{
  // Sin el filtro de sexo: el reparto de mujeres y de hombres es casi igual y
  // el dibujo no cambiaría de forma legible (R70b). Está en el embudo.
  const filtros = panel({grupos: [
    {leyenda: "De qué fuente", campos: [campo({id: "fuente", rotulo: "Fuente", inicial: "2020", opciones: FUENTES})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "edad", rotulo: "Edad", inicial: "5-17", opciones: EDADES})]},
  ]});
  display(analisis({
    id: "arbol-pregunta", numero: 1, titulo: "Quién cuenta como migrante por violencia", panel: filtros, metodo: "m-fuentes", verifica: VERIFICA_MUESTRA, alto: reservar([888, 625, 542]),
    explica: ["El indicador se arma con dos preguntas del cuestionario, en orden. La primera pregunta dónde vivía cada persona cinco años antes: quien vivía en el mismo municipio no cambió de residencia y sale del camino. A quien vivía en otro municipio, otra entidad u otro país se le pregunta por qué dejó de vivir ahí, y solo quien responde inseguridad delictiva o violencia cuenta en el indicador.",
      "Cada respuesta dice cuántas personas la dieron y qué parte son de la caja de la que sale, y la barra al pie dibuja esa parte. La causa es una sola, la principal, y la declara un adulto del hogar por las niñas, niños y adolescentes. Si de 1,000,000 de personas 46,000 cambiaron de residencia y 3,000 de ellas por violencia, la caja final dice 6.5 % (3,000 de 46,000) y el indicador cuenta 3,000 personas, el 0.30 % de la población."],
    dibujar: ({v, ancho}) => {
      const f = fuenteDe(v.fuente), u = sumar(elegir(universos, v)), edad = textoDe(EDADES, v.edad);
      const cajas = [
        {id: "u", tipo: "universo", fila: 0, lado: 0, n: u.poblacion, texto: `Población de ${edad} en viviendas particulares`, frase: `es la población de ${edad} a la que se le hacen las dos preguntas`},
        {id: "q1", tipo: "pregunta", fila: 1, lado: 0, n: u.poblacion, sinCifra: true, texto: `¿En qué municipio, entidad o país vivía en ${f.fecha}?`, frase: "responde la primera pregunta"},
        {id: "sin", tipo: "gris", fila: 1, lado: 1, n: u.sin_movilidad, parte: (100 * u.sin_movilidad) / u.poblacion, texto: "En el mismo municipio: sin movilidad", frase: `de la población de ${edad} vivía en el mismo municipio cinco años antes`, padre: `la población de ${edad}`},
        {id: "q2", tipo: "pregunta", fila: 2, lado: 0, n: u.migrantes, parte: (100 * u.migrantes) / u.poblacion, texto: `En otro municipio, entidad o país. ${f.pregunta} Una sola causa, declarada por un adulto del hogar`, frase: `de la población de ${edad} cambió de municipio, de entidad o de país y responde la segunda pregunta`, padre: `la población de ${edad}`},
        {id: "otra", tipo: "azul", fila: 2, lado: 1, n: u.otra_causa, parte: (100 * u.otra_causa) / u.migrantes, texto: "Familia, trabajo, estudio u otra causa", frase: "de quienes cambiaron de residencia lo hicieron por otra causa", padre: "quienes cambiaron de residencia"},
        {id: "v", tipo: "rojo", fila: 3, lado: 0, n: u.violencia, parte: (100 * u.violencia) / u.migrantes, casos: u.casos_violencia, texto: `Por inseguridad delictiva o violencia (${f.clave}): cuenta en el indicador`, frase: "de quienes cambiaron de residencia lo hicieron por inseguridad delictiva o violencia", padre: "quienes cambiaron de residencia"},
        {id: "ne", tipo: "gris", fila: 3, lado: 1, n: u.no_especificado, parte: (100 * u.no_especificado) / u.migrantes, casos: u.casos_no_especificado, texto: "No especificó la causa", frase: "de quienes cambiaron de residencia no especificaron la causa", padre: "quienes cambiaron de residencia"},
      ];
      const color = (tipo) => ({universo: P.tinta, pregunta: P.regla, rojo: SIG.color("baja"), azul: SIG.color("sube"), gris: SIG.color("igual")})[tipo];
      const g = globo({
        donde: () => f.texto, cuando: () => edad, grupo: (c) => (c.tipo === "universo" ? "Universo" : c.tipo === "pregunta" ? "Pregunta" : SIG.etiqueta({rojo: "baja", azul: "sube", gris: "igual"}[c.tipo])),
        color: (c) => (["rojo", "azul", "gris"].includes(c.tipo) ? color(c.tipo) : P.tinta2),
        valor: (c) => c.parte ?? (100 * c.n) / u.poblacion, formato: "pct", frase: (c) => c.frase,
        personas: (c) => c.n, universo: (c) => (c.padre === "quienes cambiaron de residencia" ? u.migrantes : u.poblacion), apellido: (c) => (c.padre === "quienes cambiaron de residencia" ? "que cambiaron de residencia" : `de ${edad}`),
        comparacion: (c) => (c.parte != null && c.padre === "quienes cambiaron de residencia" ? `${pct((100 * c.n) / u.poblacion)} de la población de ${edad}` : null),
        precision: (c) => (c.casos != null ? {casos: c.casos} : null),
      });
      const dibujo = arbolPregunta(cajas, {
        ancho, universo: u.poblacion, color, globo: g,
        enlaces: [["u", "q1"], ["q1", "sin"], ["q1", "q2", "Otro lugar"], ["q2", "otra"], ["q2", "v"], ["q2", "ne"]],
        rotulosLeyenda: [{tipo: "cuadro", color: SIG.color("baja"), texto: "Cuenta en el indicador: por violencia"}, {tipo: "cuadro", color: SIG.color("sube"), texto: "Por otra causa"}, {tipo: "cuadro", color: SIG.color("igual"), texto: "Sin movilidad o sin causa"}, {tipo: "cuadro", color: P.apagado, texto: "Barra: parte de la caja de la que sale"}],
      });
      return {
        figura: {
          titulo: "Las dos preguntas que deciden quién cuenta como migrante por violencia",
          subtitulo: `${f.texto} · personas de ${edad} · residencia en ${f.fecha} y en la fecha de la entrevista`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada caja es una pregunta o una respuesta del cuestionario, con las personas que dieron esa respuesta.",
          cuerpo: dibujo,
        },
        tabla: {filas: cajas.filter((c) => !c.sinCifra), columnas: [
          {titulo: "Caja", valor: (c) => c.texto, texto: true},
          {titulo: "Personas", valor: (c) => c.n, formato: "conteo"},
          {titulo: "Parte de la caja de la que sale", valor: (c) => c.parte, formato: "pct"},
          {titulo: "Parte de la población", valor: (c) => (100 * c.n) / u.poblacion, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (c) => ({u: u.casos_poblacion, sin: null, q2: u.casos_migrantes, otra: null, v: u.casos_violencia, ne: u.casos_no_especificado})[c.id], formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="embudo" class="toc-anchor">Cómo se llega de la población a quienes cambiaron por violencia</h2>

```js
{
  const filtros = panelBase();
  display(analisis({
    id: "embudo", numero: 2, titulo: "Cómo se llega de la población a quienes cambiaron por violencia", panel: filtros, metodo: "m-fuentes", verifica: VERIFICA_MUESTRA, alto: reservar([615, 498, 453]),
    explica: ["Cada renglón es un paso y su barra es el 100 % del paso anterior. La parte llena es lo que pasa al renglón de abajo, que la amplía a todo el ancho. Así se ve por qué la cifra final es pequeña: si de 100 personas 5 cambiaron de residencia, y de esas 5, 1 lo hizo por violencia, el indicador es 1 de cada 100.",
      "El primer paso es la población de la edad elegida. El segundo, quienes vivían en otro municipio, entidad o país cinco años antes. El tercero, quienes declararon una causa, y el último, quienes declararon inseguridad delictiva o violencia."],
    dibujar: ({v, ancho}) => {
      const f = fuenteDe(v.fuente), u = sumar(elegir(universos, v)), edad = textoDe(EDADES, v.edad);
      const pasos = [
        {paso: `Población de ${edad}`, n: u.poblacion, casos: u.casos_poblacion},
        {paso: "Cambiaron de municipio, de entidad o de país", n: u.migrantes, casos: u.casos_migrantes},
        {paso: "Declararon una causa", n: u.migrantes - u.no_especificado, casos: u.casos_migrantes - u.casos_no_especificado},
        {paso: "Por inseguridad delictiva o violencia", n: u.violencia, casos: u.casos_violencia},
      ];
      const ultimo = pasos.length - 1;
      const color = (i) => (i >= ultimo - 1 ? SIG.color("baja") : P.serie);
      const g = globo({
        donde: () => f.texto, cuando: () => edad, grupo: (d) => `Paso ${d.i + 1} de ${pasos.length}`, color: (d) => (d.i === ultimo ? SIG.color("baja") : P.tonoTexto),
        valor: (d) => (d.i === 0 ? 100 : (100 * d.n) / d.anterior.n), formato: "pct",
        frase: (d) => (d.i === 0 ? `es el universo: ${d.paso.toLowerCase()}` : `del paso anterior: ${d.paso.toLowerCase()}`),
        personas: (d) => d.n, universo: (d) => (d.anterior ? d.anterior.n : null), apellido: (d) => (d.anterior ? `del paso anterior` : `de ${edad}`),
        comparacion: (d) => (d.i ? `${pct((100 * d.n) / d.total)} de la población de ${edad}` : null),
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = embudo(pasos, {ancho, color, globo: g,
        rotulosLeyenda: [{tipo: "cuadro", color: P.serie, texto: "Pasa al renglón de abajo"}, {tipo: "cuadro", color: SIG.color("baja"), texto: "Llega al indicador: por violencia"}, {tipo: "cuadro", color: P.apagado, texto: "Sale del camino"}]});
      return {
        figura: {
          titulo: "De la población a quienes cambiaron de residencia por violencia, paso a paso",
          subtitulo: `${f.texto} · ${quienes(v)} · cambio de residencia desde ${f.fecha}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es el total del paso anterior y su parte llena, las personas que pasan al paso siguiente.",
          cuerpo: dibujo,
        },
        tabla: {filas: pasos, columnas: [
          {titulo: "Paso", valor: (d) => d.paso, texto: true},
          {titulo: "Personas", valor: (d) => d.n, formato: "conteo"},
          {titulo: "Parte del paso anterior", valor: (d) => { const i = pasos.indexOf(d); return i ? (100 * d.n) / pasos[i - 1].n : null; }, formato: "pct"},
          {titulo: "Parte de la población", valor: (d) => (100 * d.n) / pasos[0].n, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="euler" class="toc-anchor">Cuántas personas hablan una lengua indígena, se consideran indígenas o las dos cosas</h2>

```js
{
  const UNIVERSOS = [
    {valor: "poblacion", texto: "Toda la población", frase: (e) => `la población de ${e}`},
    {valor: "migrantes", texto: "Cambiaron de residencia", frase: (e) => `las personas de ${e} que cambiaron de residencia`},
    {valor: "violencia", texto: "Cambiaron por violencia", frase: (e) => `las personas de ${e} que cambiaron de residencia por violencia`},
  ];
  const filtros = panel({grupos: [
    {leyenda: "De qué fuente", campos: [campo({id: "fuente", rotulo: "Fuente", inicial: "2020", opciones: FUENTES})]},
    {leyenda: "Entre quiénes", campos: [
      campo({id: "universo", rotulo: "Universo", inicial: "violencia", opciones: UNIVERSOS}),
      campo({id: "edad", rotulo: "Edad", inicial: "5-17", opciones: EDADES}),
    ]},
  ]});
  display(analisis({
    id: "euler", numero: 3, titulo: "Cuántas personas hablan una lengua indígena, se consideran indígenas o las dos cosas", panel: filtros, metodo: "m-fuentes", verifica: VERIFICA_MUESTRA, alto: reservar([787, 632, 456]),
    explica: ["Son dos maneras de contar a la población indígena. El círculo A son las personas que hablan una lengua indígena y el círculo B, las que se consideran indígenas. El área de cada círculo es su número de personas y la parte donde se enciman, quienes cumplen las dos. Si 100 personas hablan una lengua indígena y 83 de ellas también se consideran indígenas, la parte común es de 83 y “Solo A” es de 17.",
      "Las áreas se comparan dentro de la figura: la escala se ajusta para que el círculo mayor llene el alto, porque los universos difieren en cientos de veces. Las cifras de cada zona están junto al dibujo y en la tabla."],
    dibujar: ({v, ancho}) => {
      const f = fuenteDe(v.fuente), edad = textoDe(EDADES, v.edad), U = UNIVERSOS.find((x) => x.valor === v.universo);
      const d = sumar(definiciones.filter((r) => r.universo === v.universo && r.fuente === v.fuente && (v.edad === "todas" || r.edad === v.edad)));
      const colorA = P.categorias[0], colorB = P.categorias[1];
      const dibujo = euler({a: {nombre: "Habla una lengua indígena", n: d.hli}, b: {nombre: "Se considera indígena", n: d.auto}, ambos: d.ambos, universo: d.total}, {
        ancho, colorA, colorB, apellido: "del universo",
        globo: globo({
          donde: () => f.texto, cuando: () => edad, grupo: (z) => z.zona, color: (z) => z.color,
          valor: (z) => (100 * z.n) / z.universo, formato: "pct", frase: `de ${U.frase(edad)}`,
          personas: (z) => z.n, universo: (z) => z.universo, apellido: `de ${edad}`,
        }),
      });
      const z = dibujo.zonas ?? {};
      const filas = [
        {zona: "A · Habla una lengua indígena", n: d.hli, casos: d.casos_hli}, {zona: "B · Se considera indígena", n: d.auto, casos: d.casos_auto},
        {zona: "Las dos condiciones", n: z.ambos?.n, casos: d.casos_ambos}, {zona: "Solo A", n: z.a?.n, casos: null}, {zona: "Solo B", n: z.b?.n, casos: null},
      ];
      return {
        figura: {
          titulo: "Personas que hablan una lengua indígena y personas que se consideran indígenas",
          subtitulo: `${f.texto} · ${U.texto.toLowerCase()} · ${edad} · ${entero(d.total)} personas en el universo`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · el área de cada círculo es su número de personas y la parte encimada, quienes cumplen las dos condiciones.",
          cuerpo: dibujo,
        },
        tabla: {filas, columnas: [
          {titulo: "Zona", valor: (r) => r.zona, texto: true},
          {titulo: "Personas", valor: (r) => r.n, formato: "conteo"},
          {titulo: "Parte del universo", valor: (r) => (100 * r.n) / d.total, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (r) => r.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
