---
title: Sección modelo
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Plantilla</span>
  <h1>Sección <span class="clave">modelo</span></h1>
  <p class="capitulo-entradilla">Una sección completa con la anatomía estándar. Cada análisis de un libro se arma igual: ancla para el índice, panel de filtros, cifras, figura y tres desplegables.</p>
</header>

```js
import {analisis} from "./components/seccion.js";
import {panel, campo, conDato} from "./components/filtros.js";
import {globo} from "./components/globo.js";
import {significado, sentido, P} from "./components/paleta.js";
import {pct, puntos, personas, margen, entero} from "./components/formato.js";
import {lollipop} from "./components/formas/index.js";
import {REGIONES} from "./components/geografia.js";
import {MUESTRA} from "./components/libro.js";
import {leerIndicador, tasa, UNIVERSO, VERIFICA_MUESTRA} from "./components/muestra.js";

const indicador = leerIndicador(await FileAttachment("data/muestra/indicador.csv").csv());
```

```js
// SIGNIFICADO DEL COLOR EN ESTE CAPÍTULO. Se declara una vez, arriba de la
// página, y de aquí salen el color de cada marca y las leyendas. En esta
// sección no se dibuja ningún cambio, así que no se usa; queda como modelo.
const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio", desfavorable: "baja"});

// Dominio FIJO del eje y de las rampas de este indicador: una constante del
// capítulo, igual con cualquier filtro.
const DOMINIO = [0, 100];

// Ancla de Metodología de cada análisis, por id interno (no por número).
const METODO = {ranking: "m-indicador"};
```

<!-- Ancla del índice: h2 real, texto estático e IGUAL al título de la sección. -->
<h2 id="ranking" class="toc-anchor">El indicador de muestra en cada entidad</h2>

```js
// PANEL DE FILTROS de esta gráfica. De lo grande a lo específico; cada
// selector ofrece solo lo que tiene dato para la selección vigente.
const anios = (v) => conDato(indicador, "anio", (r) => (v.entidad === "todas" || r.entidad === v.entidad)).sort((a, b) => b - a);
const filtros = panel({grupos: [
  {leyenda: "Dónde", campos: [
    campo({id: "region", rotulo: "Región", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...REGIONES]}),
    campo({id: "entidad", rotulo: "Destacar entidad", inicial: "todas",
      // Dependiente: solo las entidades de la región elegida y con dato.
      opciones: (v) => [{valor: "todas", texto: "Ninguna"}, ...conDato(indicador, "entidad", (r) => v.region === "todas" || r.region === v.region).sort((a, b) => a.localeCompare(b, "es"))],
    }),
  ]},
  {leyenda: "Entre quiénes y cuándo", campos: [
    campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
    campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: anios}),
  ]},
]});
```

```js
display(analisis({
  id: "ranking",
  numero: 1,
  titulo: "El indicador de muestra en cada entidad",
  panel: filtros,
  metodo: METODO.ranking,
  verifica: VERIFICA_MUESTRA,
  explica: [
    "Cada renglón es una entidad y el punto marca qué parte de su población de 5 años y más cumple la condición. Las entidades van de la más alta a la más baja. Si una entidad tiene 40 %, quiere decir que 40 de cada 100 personas de ese universo cumplen.",
    "El porcentaje se calcula sobre la población de 5 años y más de cada entidad, del sexo y el año elegidos. Una entidad sin dato en el año elegido no aparece en la lista.",
  ],
  dibujar: ({v, ancho}) => {
    const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo && (v.region === "todas" || r.region === v.region));
    const pais = tasa(filas);
    const orden = [...filas].sort((a, b) => b.pct - a.pct);
    const alta = orden[0], baja = orden.at(-1);
    const ambito = v.region === "todas" ? "el país" : `la región ${v.region}`;
    const quienes = v.sexo === "Total" ? "población" : v.sexo.toLowerCase();
    const destacada = v.entidad === "todas" ? null : v.entidad;

    // GLOBO NORMADO: contexto, cifra en el color de la serie, frase con el
    // denominador, personas como numerador y una sola comparación.
    const g = globo({
      donde: (d) => d.entidad,
      cuando: (d) => d.anio,
      color: (d) => (destacada == null || d.entidad === destacada ? P.serie : P.tinta2),
      valor: (d) => d.pct,
      formato: "pct",
      frase: `de la ${quienes} ${UNIVERSO} cumple la condición`,
      personas: (d) => d.num,
      universo: (d) => d.den,
      apellido: UNIVERSO,
      comparacion: () => `En ${ambito}: ${pct(pais.pct)}`,
      precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
    });

    return {
      kpis: [
        {etiqueta: `En ${ambito}, ${v.anio}`, cifra: pct(pais.pct), nota: personas(pais.num, {universo: pais.den, apellido: UNIVERSO})},
        alta && {etiqueta: "La entidad más alta", cifra: pct(alta.pct), nota: alta.entidad},
        baja && {etiqueta: "La entidad más baja", cifra: pct(baja.pct), nota: baja.entidad},
      ],
      figura: {
        titulo: "Población que cumple la condición, por entidad",
        subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.region === "todas" ? "Todas las entidades" : `Región ${v.region}`} · ${v.anio}${destacada ? ` · se destaca ${destacada}` : ""}`,
        sello: MUESTRA,
        pie: "Datos de muestra de la Plantilla · cada punto es una entidad y su posición es el porcentaje de la población de 5 años y más que cumple la condición.",
        notas: [filas.length < (v.region === "todas" ? 32 : 0) ? `En ${v.anio} hay ${32 - filas.length} entidades sin dato, que no se dibujan.` : null],
        cuerpo: lollipop(filas, {ancho, etiqueta: (d) => d.entidad, valor: (d) => d.pct, destacar: destacada, dominioX: DOMINIO, rotuloX: "Porcentaje", globo: g}),
      },
      tabla: {
        filas: orden,
        columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen de error (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ],
      },
    };
  },
}));
```
