---
title: Unidades
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas que <span class="clave">cuentan unidades</span></h1>
  <p class="capitulo-entradilla">Cada cuadro o cada figura es una unidad que se puede contar: una persona de cada cien o un número fijo de personas. Todas las cifras son datos de muestra.</p>
</header>

<!-- Familia de unidades: el cuadro de cien y las cinco formas de figuras
     humanas (multitud, fracción ilustrada, histograma de unidades, pila y
     escalones) y las unidades en espejo. Cada forma es un archivo en src/components/formas/ y aquí una
     sección con la anatomía de siempre. Los datos de las figuras salen de
     scripts/muestra_unidades.mjs y scripts/muestra_composicion.mjs. -->

<link rel="stylesheet" href="../formas-composicion.css">
<link rel="stylesheet" href="../formas-gC.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, campoUmbral, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, categorias, P} from "../components/paleta.js";
import {entero, deCada, cambioRelativo, pct} from "../components/formato.js";
import {waffle, multitud, fraccion, histogramaUnidades, pila, escalones, unidadesEspejo} from "../components/formas/index.js";
import {REGIONES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerIndicador, tasa, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerSituaciones, leerCondiciones, leerEdadCumplida, leerPilas, leerEscalones, SITUACIONES} from "../components/muestra-unidades.js";
import {leerEspejo, LADOS} from "../components/muestra-composicion.js";

const indicador = leerIndicador(await FileAttachment("../data/muestra/indicador.csv").csv());
const situaciones = leerSituaciones(await FileAttachment("../data/muestra/unidades_situacion.csv").csv());
const condiciones = leerCondiciones(await FileAttachment("../data/muestra/unidades_condicion.csv").csv());
const edadCumplida = leerEdadCumplida(await FileAttachment("../data/muestra/unidades_edad.csv").csv());
const pilas = leerPilas(await FileAttachment("../data/muestra/unidades_pila.csv").csv());
const porGrupoEdad = leerEscalones(await FileAttachment("../data/muestra/unidades_escalones.csv").csv());

// Significado de los colores en esta página: el rojo y el azul solo marcan a
// quienes dejan de cumplir o empiezan a cumplir la condición, y el signo de un
// cambio entre ediciones. Las cantidades de nivel van en el tono de tema y el
// resto, en gris.
const SIG = significado({rojo: "deja de cumplir la condición", azul: "empieza a cumplir la condición", gris: "sin cambio", desfavorable: "baja"});
const lugarDe = (region) => (region === "todas" ? "Todo el país" : `Región ${region}`);
const enRegion = (region) => (r) => region === "todas" || r.region === region;
const OPCIONES_REGION = [{valor: "todas", texto: "Todo el país"}, ...REGIONES];
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px. Cuanto más se acerca al alto
// final, menos tiene que compensar el anclaje de scroll cuando la sección se
// dibuja por encima de la vista (docs/scroll-bug.md, «Pendiente»).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

<h2 id="de-cada-cien" class="toc-anchor">De cada cien personas, cuántas cumplen la condición</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(indicador, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "de-cada-cien", numero: 1, titulo: "De cada cien personas, cuántas cumplen la condición", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([582, 360, 351]),
    explica: "Cada bloque tiene cien cuadros, uno por cada cien personas de la región. Los cuadros pintados son las que cumplen la condición. Si hay 36 cuadros pintados, 36 de cada 100 personas cumplen. La cifra se redondea a enteros; el porcentaje exacto está en el globo y en la tabla.",
    dibujar: ({v, ancho}) => {
      const filas = REGIONES.map((region) => ({region, anio: v.anio, ...tasa(indicador.filter((r) => r.region === region && r.anio === v.anio && r.sexo === v.sexo))}));
      const g = globo({
        grupo: (d) => `Región ${d.region}`, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "de100",
        personas: (d) => d.num, universo: (d) => d.den, unidad: v.sexo === "Total" ? "habitantes" : v.sexo.toLowerCase(),
      });
      return {
        figura: {
          titulo: "Personas que cumplen la condición de cada cien, por región",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada bloque es una región con cien cuadros; los cuadros pintados son las personas de cada cien que cumplen la condición.",
          cuerpo: waffle(filas, {ancho, etiqueta: (d) => d.region, valor: (d) => d.pct, color: () => P.serie, globo: g}),
        },
        tabla: {filas, columnas: [
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "De cada 100", valor: (d) => d.pct, formato: "de100"},
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

<h2 id="multitud" class="toc-anchor">Cuántas personas están en cada situación</h2>

```js
{
  // Color por situación (identidad fija, no por tamaño): quien deja de cumplir
  // y quien empieza llevan los semánticos; quien cumple en los dos años, el
  // tono de tema; quien no cumple, el gris de contexto.
  const colorDe = (s) => [P.rojo, P.azul, P.serie, P.contexto][SITUACIONES.indexOf(s)];
  const tintaDe = (s) => [P.rojo, P.azul, P.tonoTexto, P.tinta2][SITUACIONES.indexOf(s)];
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "region", rotulo: "Región", inicial: "todas", opciones: OPCIONES_REGION}),
      campo({id: "periodo", rotulo: "Periodo", inicial: "2010 a 2020", opciones: conDato(situaciones, "periodo").reverse()}),
    ]},
    {leyenda: "Cómo se acomodan las figuras", campos: [
      campo({id: "acomodo", rotulo: "Acomodo", inicial: "mancha", opciones: [{valor: "mancha", texto: "En grupos sueltos"}, {valor: "rejilla", texto: "En bloques compactos"}]}),
    ]},
  ]});
  display(analisis({
    id: "multitud", numero: 2, titulo: "Cuántas personas están en cada situación", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([893, 671, 711]),
    explica: "Cada figura representa un número fijo de personas, que se dice arriba de la gráfica. Las figuras de una misma situación van juntas y en su color, con el número de personas anotado. Si un grupo tiene 60 figuras y cada figura representa 10,000 personas, en esa situación hay unas 600,000 personas. El número de figuras se redondea y la cifra exacta está en la anotación, en el globo y en la tabla. El lugar de cada figura dentro de su grupo no significa nada.",
    dibujar: ({v, ancho}) => {
      const filas = SITUACIONES.map((situacion) => ({situacion, personas: d3.sum(situaciones.filter((r) => r.situacion === situacion && r.periodo === v.periodo).filter(enRegion(v.region)), (r) => r.personas)}));
      const g = globo({
        grupo: (d) => d.situacion, color: (d) => tintaDe(d.situacion),
        valor: (d) => (d.total ? 100 * d.personas / d.total : null), formato: "pct",
        personas: (d) => d.personas, universo: (d) => d.total, unidad: "habitantes",
      });
      const dibujo = multitud(filas, {ancho, grupo: (d) => d.situacion, valor: (d) => d.personas, color: (d) => colorDe(d.situacion), acomodo: v.acomodo, globo: g});
      return {
        figura: {
          titulo: "Personas en cada situación entre dos ediciones",
          subtitulo: `Población ${UNIVERSO} · ${lugarDe(v.region)} · ${v.periodo} · figuras ${v.acomodo === "mancha" ? "en grupos sueltos" : "en bloques compactos"}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada figura representa ${entero(dibujo.unidad)} personas ${UNIVERSO} y cada grupo de figuras, con su color, una situación entre las dos ediciones.`,
          cuerpo: dibujo,
        },
        tabla: {filas: dibujo.resumen, columnas: [
          {titulo: "Situación", valor: (d) => d.situacion, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte de la población", valor: (d) => 100 * d.personas / d.total, formato: "pct"},
          {titulo: "Población total", valor: (d) => d.total, formato: "conteo"},
          {titulo: "Figuras dibujadas", valor: (d) => d.figuras, formato: "conteo"},
          {titulo: "Personas por figura", valor: (d) => d.unidad, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="fraccion" class="toc-anchor">Qué tan frecuente es cada condición, por grupo</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Qué se mide", campos: [
      campo({id: "condicion", rotulo: "Condición", inicial: "Condición frecuente", opciones: conDato(condiciones, "condicion")}),
    ]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "comparacion", rotulo: "Comparar por", inicial: "Sexo", opciones: conDato(condiciones, "comparacion")}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(condiciones, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "fraccion", numero: 3, titulo: "Qué tan frecuente es cada condición, por grupo", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([840, 459, 440]),
    explica: "Cada grupo se dibuja como cien figuras. Las figuras en color son las personas de cada cien que cumplen la condición y las grises, las que no. Si hay 36 figuras en color, 36 de cada 100 personas cumplen. Cuando la condición es poco frecuente y menos de 1 de cada 100 la cumple, la cuenta se hace sobre 1,000 o sobre 10,000, y la gráfica lo dice. Por ejemplo, 0.42 % se escribe 4 de cada 1,000. Todos los grupos usan la misma base para que se puedan comparar.",
    dibujar: ({v, ancho}) => {
      const filas = condiciones.filter((r) => r.condicion === v.condicion && r.comparacion === v.comparacion && r.anio === v.anio);
      const g = globo({
        grupo: (d) => (v.comparacion === "Región" ? `Región ${d.grupo}` : v.comparacion === "Sexo" ? d.grupo : "Todo el país"), color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: (x, d) => deCada(x, d.base),
        personas: (d) => d.num, universo: (d) => d.den, unidad: (d) => (v.comparacion === "Sexo" ? d.grupo.toLowerCase() : "habitantes"),
        precision: (d) => ({valor: d.pct, casos: d.casos}),
      });
      const dibujo = fraccion(filas, {ancho, etiqueta: (d) => d.grupo, valor: (d) => d.pct, color: () => P.serie,
        acomodo: v.comparacion === "Sexo" ? "multitud" : "rejilla", rotulos: {cumple: "Cumplen la condición", resto: "No la cumplen"}, globo: g});
      const base = dibujo.base, unidades = base > 1000 ? "puntos" : "figuras";
      return {
        figura: {
          titulo: "Personas que cumplen la condición, de cada cien o de cada mil",
          subtitulo: `${v.condicion} · población ${UNIVERSO} · por ${v.comparacion.toLowerCase()} · ${v.anio} · de cada ${entero(base)}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada bloque es un grupo con ${entero(base)} ${unidades}, y las que van en color son las personas de cada ${entero(base)} que cumplen la condición.`,
          notas: [
            base > 100 ? `Menos de 1 de cada 100 personas cumple esta condición en alguno de los grupos, así que la cuenta se hace sobre ${entero(base)}.` : null,
            base > 1000 ? "Con diez mil unidades, cada una se dibuja como un punto." : null,
          ],
          cuerpo: dibujo,
        },
        tabla: {filas: dibujo.resumen, columnas: [
          {titulo: v.comparacion, valor: (d) => d.grupo, texto: true},
          {titulo: `De cada ${entero(base)}`, valor: (d) => d.pct, formato: (x) => deCada(x, base)},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="histograma-unidades" class="toc-anchor">A qué edad se concentran quienes cumplen la condición</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes", campos: [
      campo({id: "destacar", rotulo: "Destacar", inicial: "nadie", opciones: [{valor: "nadie", texto: "Sin destacar"}, "Mujeres", "Hombres"]}),
    ]},
    {leyenda: "Cuándo y con qué detalle", campos: [
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(edadCumplida, "anio").sort((a, b) => b - a)}),
      campo({id: "clase", rotulo: "Grupos de edad", inicial: 5, opciones: [{valor: 5, texto: "De 5 en 5 años"}, {valor: 10, texto: "De 10 en 10 años"}]}),
    ]},
  ]});
  display(analisis({
    id: "histograma-unidades", numero: 4, titulo: "A qué edad se concentran quienes cumplen la condición", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([557, 558, 597]),
    explica: "Cada figura representa un número fijo de personas que cumplen la condición, y las figuras se apilan sobre su grupo de edad. Una pila más alta quiere decir más personas de esa edad. Si una pila tiene 40 figuras y cada figura representa 5,000 personas, en ese grupo de edad hay unas 200,000 personas. La bandera marca la edad mediana: la mitad de las personas tiene esa edad o menos. Al destacar a las mujeres o a los hombres, sus figuras van en color en la parte baja de cada pila y el resto queda en gris.",
    dibujar: ({v, ancho}) => {
      const filas = edadCumplida.filter((r) => r.anio === v.anio);
      const destacado = v.destacar === "nadie" ? null : v.destacar;
      const g = globo({
        marca: (d) => `De ${d.desde} a ${d.hasta - 1} años`, grupo: destacado, color: P.tonoTexto,
        valor: (d) => 100 * (destacado ? d.destacadas : d.personas) / d.total, formato: "pct",
        personas: (d) => (destacado ? d.destacadas : d.personas), universo: (d) => d.total, unidad: "personas que cumplen la condición",
      });
      const dibujo = histogramaUnidades(filas, {ancho, valor: (d) => d.edad, peso: (d) => d.personas, clase: v.clase, dominio: [0, 100],
        destacar: destacado ? (d) => d.sexo === destacado : null, color: P.serie, nombreDestacado: destacado, nombreResto: destacado === "Mujeres" ? "Hombres" : "Mujeres",
        rotuloX: "Edad en años cumplidos", rotuloMediana: (m) => `Edad mediana: ${m} años`, notaMediana: (m) => `La mitad tiene ${m} años o menos`, globo: g});
      return {
        figura: {
          titulo: "Personas que cumplen la condición, por edad",
          subtitulo: `Todo el país · ${v.anio} · grupos de ${v.clase} años${destacado ? ` · ${destacado.toLowerCase()} en color` : " · mujeres y hombres"}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada figura representa ${entero(dibujo.unidad)} personas que cumplen la condición, apiladas según su edad, y la bandera marca la edad mediana.`,
          cuerpo: dibujo,
        },
        tabla: {filas: dibujo.resumen, columnas: [
          {titulo: "Edad", valor: (d) => `${d.desde} a ${d.hasta - 1} años`, texto: true},
          {titulo: "Personas que cumplen", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte del total", valor: (d) => 100 * d.personas / d.total, formato: "pct"},
          ...(destacado ? [{titulo: destacado, valor: (d) => d.destacadas, formato: "conteo"}] : []),
          {titulo: "Figuras dibujadas", valor: (d) => d.figuras, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="pila" class="toc-anchor">Cuántas personas cumplen la condición en cada edición</h2>

```js
{
  const EDICIONES = conDato(pilas, "anio").sort((a, b) => a - b);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: OPCIONES_REGION})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
      campo({id: "ediciones", rotulo: "Ediciones", inicial: "extremos", opciones: [{valor: "extremos", texto: "Primera y última"}, {valor: "todas", texto: "Las cinco ediciones"}]}),
    ]},
  ]});
  display(analisis({
    id: "pila", numero: 5, titulo: "Cuántas personas cumplen la condición en cada edición", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([604, 609, 609]),
    explica: "Cada pila es una edición y cada figura representa un número fijo de personas que cumplen la condición. La cifra sobre la pila es el número exacto de personas, y la última figura se dibuja incompleta cuando la cantidad no llega a una figura entera. La cifra con signo compara la primera edición con la última. Si se pasa de 500,000 a 450,000 personas, el cambio es de −10.0 %.",
    dibujar: ({v, ancho}) => {
      const anios = v.ediciones === "todas" ? EDICIONES : [EDICIONES[0], EDICIONES[EDICIONES.length - 1]];
      const filas = anios.map((anio) => ({anio, personas: d3.sum(pilas.filter((r) => r.anio === anio && (v.sexo === "Total" || r.sexo === v.sexo)).filter(enRegion(v.region)), (r) => r.personas)}));
      const quienes = v.sexo === "Total" ? "Mujeres y hombres" : v.sexo;
      const g = globo({
        grupo: (d) => d.anio, color: P.tonoTexto,
        // La pila cuenta personas y no hay un denominador: la cifra es el
        // número de personas que cumplen, con su unidad.
        valor: (d) => d.personas, formato: (x) => `${entero(x)} personas`,
      });
      const dibujo = pila(filas, {ancho, etiqueta: (d) => String(d.anio), valor: (d) => d.personas, color: () => P.serie,
        diferencia: "relativo", colorCambio: SIG.color, rotuloCambio: (a, b) => `de ${a.anio} a ${b.anio}`, globo: g});
      return {
        figura: {
          titulo: "Personas que cumplen la condición, por edición",
          subtitulo: `${quienes} ${UNIVERSO} · ${lugarDe(v.region)} · ${v.ediciones === "todas" ? `${anios.length} ediciones, ${anios[0]} - ${anios[anios.length - 1]}` : `${anios[0]} y ${anios[1]}`}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada figura representa ${entero(dibujo.unidad)} personas que cumplen la condición y la cifra con signo es el cambio entre la primera edición y la última.`,
          cuerpo: dibujo,
        },
        tabla: {filas: dibujo.resumen, columnas: [
          {titulo: "Edición", valor: (d) => d.anio, texto: true},
          {titulo: "Personas que cumplen", valor: (d) => d.personas, formato: "conteo"},
          {titulo: `Cambio frente a ${anios[0]}`, valor: (d) => d.cambio, formato: (x) => (x == null ? "" : cambioRelativo(x))},
          {titulo: "Figuras dibujadas", valor: (d) => d.figuras, formato: "numero"},
          {titulo: "Personas por figura", valor: (d) => d.unidad, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="escalones" class="toc-anchor">Dónde queda cada grupo de edad frente a un umbral</h2>

```js
{
  const GRUPOS = [...new Map(porGrupoEdad.map((r) => [r.orden, r.grupo])).entries()].sort((a, b) => a[0] - b[0]).map(([, grupo]) => grupo);
  const EDICION = 2020;
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: OPCIONES_REGION})]},
    {leyenda: "Qué unidades", campos: [campoUmbral({id: "umbral", rotulo: "Umbral del porcentaje", antes: "Unidades donde cumple", despues: "% o más del grupo de edad", min: 0, max: 100, paso: 5, inicial: 40})]},
  ]});
  display(analisis({
    id: "escalones", numero: 6, titulo: "Dónde queda cada grupo de edad frente a un umbral", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([751, 666, 673]),
    explica: "Hay un escalón por grupo de edad. La figura está parada en el porcentaje de personas de ese grupo que cumple la condición. El bloque cubre la mitad central de las unidades: deja fuera a la cuarta parte con los porcentajes más bajos y a la cuarta parte con los más altos. La línea punteada es el umbral que se elige arriba, y bajo el nombre de cada grupo se lee qué parte de sus unidades lo alcanza. Si el umbral es 40 % y 12 de 40 unidades tienen 40 % o más, se lee 30 %.",
    dibujar: ({v, ancho}) => {
      const filas = GRUPOS.map((grupo) => {
        const f = porGrupoEdad.filter((r) => r.grupo === grupo).filter(enRegion(v.region));
        const x = f.map((r) => r.pct).sort(d3.ascending), sobre = f.filter((r) => r.pct >= v.umbral);
        return {grupo, ...tasa(f), unidades: f.length, q1: d3.quantileSorted(x, 0.25), mediana: d3.quantileSorted(x, 0.5), q3: d3.quantileSorted(x, 0.75),
          unidadesSobre: sobre.length, parteSobre: f.length ? 100 * sobre.length / f.length : null};
      });
      const g = globo({
        grupo: (d) => `${d.grupo} años`, color: P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: "personas de esa edad",
      });
      // El bloque es su propia marca: su globo dice de dónde a dónde va la
      // mitad central de las unidades (un rango, sin renglón de población).
      const gBanda = globo({
        marca: (d) => `${d.grupo} años`, grupo: "Mitad central de las unidades", color: P.tinta2,
        valor: (d) => d.q1, formato: (x, d) => `${pct(d.q1)} a ${pct(d.q3)}`,
      });
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en cada grupo de edad",
          subtitulo: `${lugarDe(v.region)} · ${EDICION} · ${entero(filas[0].unidades)} unidades · umbral de ${v.umbral} %`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la figura marca el porcentaje de cada grupo de edad, el bloque es la mitad central de sus unidades y la línea punteada, el umbral.",
          cuerpo: escalones(filas, {ancho, grupo: (d) => d.grupo, valor: (d) => d.pct, bajo: (d) => d.q1, alto: (d) => d.q3, dominio: [0, 100],
            umbral: v.umbral, encima: (d) => d.parteSobre,
            nombres: {valor: "Porcentaje del grupo de edad", banda: "Mitad central de las unidades", umbral: `Umbral: ${v.umbral} %`, sobre: "Parte de la mitad central que alcanza el umbral", encima: "Bajo el nombre de cada grupo, la parte de sus unidades que alcanza el umbral"}, globo: g, globoBanda: gBanda}),
        },
        tabla: {filas, columnas: [
          {titulo: "Grupo de edad", valor: (d) => `${d.grupo} años`, texto: true},
          {titulo: "Porcentaje del grupo", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población del grupo", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Unidades", valor: (d) => d.unidades, formato: "conteo"},
          {titulo: "Cuarta parte más baja, hasta", valor: (d) => d.q1, formato: "pct"},
          {titulo: "Mediana de las unidades", valor: (d) => d.mediana, formato: "pct"},
          {titulo: "Cuarta parte más alta, desde", valor: (d) => d.q3, formato: "pct"},
          {titulo: `Unidades con ${v.umbral} % o más`, valor: (d) => d.unidadesSobre, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="espejo" class="toc-anchor">Cuántas personas hay de cada lado, por grupo de edad</h2>

```js
{
  const espejo = leerEspejo(await FileAttachment("../data/muestra/espejo_edades.csv").csv());
  const EDADES_ESPEJO = [...new Map(espejo.map((r) => [r.orden, r.edad])).entries()].sort((a, b) => a[0] - b[0]).map(([, e]) => e);
  // Color por lado: la comparación por sexo usa la identidad de categorías
  // (no rosa y azul); la de situación, el rojo y el azul declarados arriba.
  const colorSexo = categorias(LADOS["Sexo"]);
  const colorLado = (comparacion) => (l) => (comparacion === "Sexo" ? colorSexo(l) : SIG.color(l === "Empezó a cumplir" ? "sube" : "baja"));
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "region", rotulo: "Región", inicial: "todas", opciones: OPCIONES_REGION}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(espejo, "anio").sort((a, b) => b - a)}),
    ]},
    {leyenda: "Qué se compara", campos: [
      campo({id: "comparacion", rotulo: "Un lado y el otro", inicial: "Sexo", opciones: [{valor: "Sexo", texto: "Mujeres y hombres"}, {valor: "Situación", texto: "Empezaron y dejaron de cumplir"}]}),
      campo({id: "resaltar", rotulo: "Resaltar", inicial: "nadie", opciones: [{valor: "nadie", texto: "Sin resaltar"}, {valor: "rurales", texto: "Quienes viven en localidades rurales"}]}),
    ]},
  ]});
  display(analisis({
    id: "espejo", numero: 7, titulo: "Cuántas personas hay de cada lado, por grupo de edad", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([969, 656, 753]),
    explica: ["Cada cuadro representa un número fijo de personas que cumplen la condición, que se dice arriba de la gráfica. Hay una columna por grupo de edad: de un lado del eje se apilan las personas de un grupo y del otro, las del otro, así que la altura de cada pila se cuenta a ojo y los dos lados se comparan de un vistazo. La cifra exacta va al final de cada pila.",
      "Si una pila tiene 40 cuadros y cada cuadro representa 1,000 personas, de ese lado hay unas 40,000. Al resaltar a quienes viven en localidades rurales (de menos de 2,500 habitantes), sus cuadros van en color pleno junto al eje y el resto de la pila queda tenue. En un teléfono el eje se acuesta: un lado a la izquierda y el otro a la derecha."],
    dibujar: ({v, ancho}) => {
      const lados = LADOS[v.comparacion], color = colorLado(v.comparacion);
      const filas = d3.rollups(espejo.filter((r) => r.anio === v.anio && r.comparacion === v.comparacion).filter(enRegion(v.region)),
        (f) => ({edad: f[0].edad, orden: f[0].orden, lado: f[0].lado, personas: d3.sum(f, (r) => r.personas), rurales: d3.sum(f, (r) => r.rurales), casos: d3.sum(f, (r) => r.casos)}),
        (r) => r.edad, (r) => r.lado).flatMap(([, l]) => l.map(([, x]) => x));
      const resaltar = v.resaltar === "rurales";
      const nombreLado = (l) => (v.comparacion === "Sexo" ? l.toLowerCase() : l === "Empezó a cumplir" ? "quienes empezaron a cumplir" : "quienes dejaron de cumplir");
      const verbo = (l) => (l === "Empezó a cumplir" ? "empezaron a cumplir la condición" : l === "Dejó de cumplir" ? "dejaron de cumplir la condición" : `cumplen la condición`);
      const g = globo({
        marca: (d) => `De ${d._categoria} años`, grupo: (d) => d._lado, color: (d) => color(d._lado),
        // Cada pila cuenta personas sin denominador: la cifra es el número de
        // personas, y al resaltar, debajo van las de localidades rurales.
        valor: (d) => (d._sinDato ? null : d.personas), formato: (x) => `${entero(x)} personas`,
        personas: (d) => (resaltar ? d.resaltadas : null), unidad: "personas en localidades rurales",
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = unidadesEspejo(filas, {ancho, categoria: (d) => d.edad, lado: (d) => d.lado, valor: (d) => d.personas, lados, categorias: EDADES_ESPEJO, color,
        resaltado: resaltar ? (d) => d.rurales : null, nombreResaltado: "localidades rurales", rotulo: (e) => e, globo: g});
      const totales = lados.map((l) => d3.sum(filas.filter((r) => r.lado === l), (r) => r.personas));
      return {
        kpis: lados.map((l, i) => ({etiqueta: v.comparacion === "Sexo" ? `${l} que cumplen la condición` : `Personas que ${verbo(l).replace(" la condición", "")}`, cifra: entero(totales[i]), nota: i === 0 ? `${lugarDe(v.region)} · ${v.anio}` : null})),
        figura: {
          titulo: v.comparacion === "Sexo" ? "Mujeres y hombres que cumplen la condición, por grupo de edad" : "Quienes empezaron y quienes dejaron de cumplir la condición, por grupo de edad",
          subtitulo: `${lugarDe(v.region)} · ${v.anio} · ${nombreLado(lados[0])} y ${nombreLado(lados[1])}${resaltar ? " · en color pleno, quienes viven en localidades rurales" : ""}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada cuadro representa ${entero(dibujo.unidad)} personas; de un lado del eje, ${nombreLado(lados[0])}, y del otro, ${nombreLado(lados[1])}, por grupo de edad.`,
          cuerpo: dibujo,
        },
        tabla: {filas: [...filas].sort((a, b) => a.orden - b.orden || lados.indexOf(a.lado) - lados.indexOf(b.lado)), columnas: [
          {titulo: "Edad", valor: (d) => `${d.edad} años`, texto: true},
          {titulo: "Lado", valor: (d) => d.lado, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "En localidades rurales", valor: (d) => d.rurales, formato: "conteo"},
          {titulo: "Parte rural", valor: (d) => 100 * d.rurales / d.personas, formato: "pct"},
          {titulo: "Cuadros dibujados", valor: (d) => Math.max(1, Math.round(d.personas / dibujo.unidad)), formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

```js
import {fichasRango} from "../components/formas/fichas-rango.js";
import {rampaTema} from "../components/paleta.js";
import {margen} from "../components/formato.js";
```

<h2 id="fichas-rango" class="toc-anchor">En qué rango queda cada entidad y cuáles cambiaron</h2>

```js
{
  // Rangos FIJOS del porcentaje que cumple la condición, iguales con
  // cualquier filtro. Con la muestra de 2020, las 32 entidades se reparten
  // entre 4 y 9 por rango. El tono de cada rango sale de la rampa del tono
  // de tema por su orden; el triángulo del cambio usa el rojo y el azul que
  // esta página declara para el signo de un cambio entre ediciones.
  const RANGOS = [
    {min: 0, max: 15, texto: "Menos de 15 %"}, {min: 15, max: 30, texto: "De 15 a 30 %"}, {min: 30, max: 45, texto: "De 30 a 45 %"},
    {min: 45, max: 60, texto: "De 45 a 60 %"}, {min: 60, max: null, texto: "60 % o más"},
  ];
  const escala = rampaTema([0, 100]);
  const ANIOS = [...new Set(indicador.map((r) => r.anio))].sort((a, b) => b - a);
  const OPCIONES_SEXO_R = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
  const textoSexo = {Total: "Mujeres y hombres", Mujeres: "Mujeres", Hombres: "Hombres"};
  const filtros = panel({grupos: [
    {leyenda: "Cuándo", campos: [
      // Solo años con una edición anterior con qué comparar.
      campo({id: "anio", rotulo: "Fichas, año", inicial: 2020, opciones: ANIOS.filter((a) => ANIOS.some((b) => b < a))}),
      // Dependiente: solo años anteriores al de las fichas.
      campo({id: "comparar", rotulo: "Triángulos, comparar con", inicial: 2010, opciones: (v) => ANIOS.filter((a) => a < v.anio)}),
    ]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: OPCIONES_SEXO_R})]},
  ]});
  display(analisis({
    id: "fichas-rango", numero: 8, titulo: "En qué rango queda cada entidad y cuáles cambiaron", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([1385, 920, 655]),
    explica: ["Cada panel es un rango del porcentaje de la población que cumple la condición, del más alto al más bajo, con cuántas entidades tiene. Dentro del panel, las entidades del rango van como fichas con su abreviatura, acomodadas como en el mapa del país, y las demás quedan como casillas tenues que dibujan la forma del país.",
      "Un triángulo hacia arriba quiere decir que la entidad subió de rango desde el año de comparación, y uno hacia abajo, que bajó. Si una entidad está en el panel de 45 a 60 % con un triángulo hacia abajo, en el año de comparación estaba en el rango de 60 % o más. Una entidad sin dato en el año elegido va en su propio panel."],
    dibujar: ({v, ancho}) => {
      const del = (anio) => new Map(indicador.filter((r) => r.anio === anio && r.sexo === v.sexo).map((r) => [r.cve, r]));
      const ahora = del(v.anio), antes = del(v.comparar);
      const valores = new Map([...ahora].map(([cve, r]) => [cve, {...r, antes: antes.get(cve)?.pct ?? null}]));
      const g = globo({
        marca: (d) => d.nombre, grupo: (d) => (d._sinDato ? null : d._rango), color: P.tonoTexto,
        valor: (d) => (d._sinDato ? null : d.pct), formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: v.sexo === "Total" ? "habitantes" : v.sexo.toLowerCase(),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const dibujo = fichasRango(valores, {ancho, valor: (d) => d.pct, antes: (d) => d.antes, rangos: RANGOS, escala, colorCambio: (s) => SIG.color(s),
        textoCambio: {sube: `Subió de rango desde ${v.comparar}`, baja: `Bajó de rango desde ${v.comparar}`}, globo: g});
      const filas = (dibujo.filas ?? []).map((x) => ({nombre: x.e.nombre, rango: x.k >= 0 ? RANGOS[x.k].texto : null, rangoAntes: x.kA >= 0 ? RANGOS[x.kA].texto : null, ...(x.d ?? {})}));
      const cambiaron = (dibujo.filas ?? []).filter((x) => x.cambio).length;
      return {
        figura: {
          titulo: "Entidades según el porcentaje de su población que cumple la condición",
          subtitulo: `${textoSexo[v.sexo]} · ${v.anio} · ${entero(cambiaron)} entidades cambiaron de rango desde ${v.comparar}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada ficha es una entidad, en el panel de su rango y en su lugar del mapa. El triángulo marca si cambió de rango.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(filas, (r) => -(r.pct ?? -1)), columnas: [
          {titulo: "Entidad", valor: (d) => d.nombre, texto: true},
          {titulo: `Rango en ${v.anio}`, valor: (d) => d.rango, texto: true},
          {titulo: `Porcentaje en ${v.anio}`, valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen de error", valor: (d) => d.ee, formato: (e) => margen(e)},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: `Población ${UNIVERSO}`, valor: (d) => d.den, formato: "conteo"},
          {titulo: `Rango en ${v.comparar}`, valor: (d) => d.rangoAntes, texto: true},
          {titulo: `Porcentaje en ${v.comparar}`, valor: (d) => d.antes, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
