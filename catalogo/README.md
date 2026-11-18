# Catálogo de formas de gráfica

Índice del catálogo de la Plantilla. Sirve para elegir la forma de cada análisis de un libro de datos y para saber dónde está su receta o su componente. Las reglas que gobiernan la elección están en [`../REGLAS.md`](../REGLAS.md), sección 6 (R71 a R91). La regla de color está en [`colores.md`](colores.md).

## 1. Qué hay en esta carpeta

| Archivo | Qué aporta | Cómo se usa |
| --- | --- | --- |
| [`README.md`](README.md) | Árbol de decisión, tabla maestra de formas, correcciones a los catálogos copiados y canteras | Punto de entrada |
| [`colores.md`](colores.md) | Papeles de color, declaración del significado por capítulo y prohibiciones | Se copia al libro nuevo y se llena la declaración |
| [`formas-novedosas.md`](formas-novedosas.md) | 18 fichas de formas poco habituales con receta en Plot o D3, dificultad y encaje. Los 166 tipos de Data Viz Project por función. Convenciones de Datawrapper. Canteras con el estado de cada enlace | Primera consulta cuando se busca una forma llamativa |
| [`referencias/`](referencias/) | Las 18 capturas que respaldan las fichas | Se miran junto con la ficha |
| [`GuiaVisualizacion.md`](GuiaVisualizacion.md) | Versión operativa para escribir una gráfica: bloque base que se pega, tamaños, etiquetas, tabla de elección por pregunta (sección 9) y 25 recetas completas (secciones 10 y 11) | Recetas de las formas base |
| [`CatalogoVisualizacion.md`](CatalogoVisualizacion.md) | Especificación de la biblioteca: 75 fichas en nueve categorías, cada una con marcas, transformaciones, condición de uso y papel del color, más las reglas transversales y la accesibilidad medida | Consulta cuando la Guía no trae la receta |
| [`CatalogoGraficas.html`](CatalogoGraficas.html) | Catálogo navegable al estilo de Data Viz Project: pestañas por familia, entrada (forma de los datos), función y forma, más nivel y búsqueda. Cada ficha dice la pregunta, cuándo sí y cuándo no, la forma de los datos, y trae la receta viva o la miniatura con la llamada al componente de la Plantilla | Se abre con doble clic (funciona por `file://`) para ver la forma antes de elegirla. Uso en 1.1 |
| [`fichas/`](fichas/) | Las fichas del catálogo, en scripts clásicos: `base.js` (las 43 originales, con receta viva), `plantilla.js` (los componentes de `src/components/formas/` sin ficha previa) y `rescatadas.js` (formas recuperadas de otros catálogos). El contrato de una ficha está al inicio de `base.js` | Se edita para añadir o corregir una ficha (sección 5) |
| [`miniaturas/`](miniaturas/) | Capturas de la galería construida para las fichas sin receta viva, en claro (`<id>.png`) y oscuro (`<id>-oscuro.png`) | Se regeneran con `herramientas/` |
| [`herramientas/`](herramientas/) | `miniaturas.mjs` (captura las miniaturas desde `dist/`), `reducir_miniaturas.py` (las baja a 256 colores) y `verificar_catalogo.mjs` (consola, filtros, URL, teclado, axe y desborde del catálogo) | Se corren desde la carpeta `Plantilla` |
| `CatalogoGraficas-anterior.html` | Respaldo del catálogo antes de la navegación por pestañas (noviembre de 2026), con las 43 fichas dentro del HTML | Solo de consulta |

`GuiaVisualizacion.md`, `CatalogoVisualizacion.md` y el catálogo HTML son copias de los catálogos de la carpeta `Framework`, que se conservan ahí sin cambios. A cada copia se le añadió al inicio una nota de tres líneas que remite a `REGLAS.md`. Son anteriores a las decisiones de noviembre de 2026 y no se siguen donde las contradicen (sección 4).

### 1.1 Cómo se usa el catálogo

El catálogo se abre con doble clic sobre `CatalogoGraficas.html`; no necesita servidor porque las fichas se cargan como scripts clásicos y no como módulos, y solo pide internet para las librerías (d3, Plot, d3-sankey y topojson-client) y las fuentes. La barra de navegación tiene cinco pestañas que siguen la clasificación de [Data Viz Project](https://datavizproject.com/). **Todas** muestra las fichas agrupadas por su función principal. **Familia** separa gráfica, diagrama, mapa, trazado (lo que Data Viz Project llama Plot: marcas sueltas sobre ejes de magnitud, como la dispersión, el enjambre o el hexbin) y tabla. **Entrada** muestra una fila desplazable de tablas pequeñas, una por forma de los datos, para elegir la que se parece a los datos que se tienen. **Función** separa comparación, concepto, correlación, distribución, geolocalización, parte de un todo, tendencia en el tiempo, flujo y conexión, jerarquía y unidades. **Forma** muestra íconos de línea fina con la figura que dibuja la gráfica.

Cada pestaña filtra y, además, agrupa las fichas por su propia clasificación. Los filtros de las cuatro pestañas se combinan entre sí, con el nivel y con la búsqueda, y cada botón dice cuántas fichas quedarían al elegirlo; un botón que dejaría la vista vacía se desactiva, y una opción sin ninguna ficha no se ofrece. Como una ficha puede tener varias entradas, funciones o formas, el número de un botón las cuenta todas, mientras que en la lista la ficha aparece una sola vez, bajo la primera de su clasificación (o bajo la elegida, si hay filtro). La selección queda en la dirección de la página, por ejemplo `CatalogoGraficas.html#vista=forma&familia=mapa&forma=puntos&nivel=2&q=semitonos`, de modo que una búsqueda se comparte copiando el enlace, y `#ficha-<id>` lleva directo a una ficha. «Quitar filtros» limpia todo menos la pestaña abierta.

Las fichas con receta viva dibujan su ejemplo con Plot o D3 y traen el código que lo produce, listo para copiar después del bloque base. Las fichas de componentes de la Plantilla que dependen de Framework muestran una miniatura de la galería construida y, en el desplegable «En la Plantilla», el archivo del componente, la sección de la galería que lo usa y una llamada mínima tomada de esa sección. Cuando la receta viva y el componente coinciden en una ficha, manda el componente: la receta sirve para ver la forma y para prototipar, y el libro se escribe con `src/components/formas/`.


---

## 2. Cómo elegir la forma

### 2.1 Procedimiento

1. **Escribir la pregunta del análisis en una frase.** Si no cabe en una frase, son dos análisis.
2. **Ubicar la pregunta en el árbol** (2.2) y tomar la forma base y su variante llamativa.
3. **Confirmar con la densidad.** Un panel: la forma tal cual. De dos a cuatro paneles: la misma forma en facetas con escala compartida. Más de cuatro: heatmap.
4. **Confirmar con el dato.** Casos de muestra por celda (mínimo 30), número de cortes en el tiempo, si los cortes observan a las mismas unidades y si las ediciones son comparables.
5. **Preferir la variante llamativa** cuando el valor sigue leyéndose por posición o por otro canal con leyenda.
6. **Revisar el encaje.** Sin narración por pasos, sin 3D real, sin fondo oscuro, sin animación en bucle y sin morado.
7. **Anotar la forma en el inventario del capítulo** con su alternativa, y comprobar que no repite la de la sección anterior ni la de la siguiente. La alternativa es la forma que tolera menos muestra.

### 2.2 Árbol de decisión por pregunta

Los números entre paréntesis son fichas de `formas-novedosas.md`.

```text
¿Qué pregunta responde el análisis?
│
├─ Un solo número es la respuesta ......... cifra destacada, sin gráfica
│
├─ ¿Cuántos de cada 100?
│   ├─ menos de 1 de cada 100 ............. cambiar la base, o cifra destacada
│   ├─ un grupo, con gente ................ multitud ilustrada con fracción sólida (12)
│   ├─ un total y un subgrupo ............. multitud de unidades con subgrupo resaltado (17)
│   └─ dos a cuatro grupos ................ waffle de 10 × 10
│
├─ ¿Cuánto separa a dos grupos?
│   ├─ por categoría ...................... dumbbell ordenado por brecha
│   └─ a lo largo de la edad o del tiempo . áreas superpuestas en paneles (06)
│
├─ ¿Quién está arriba y quién abajo?
│   ├─ hasta 12 grupos .................... barras
│   └─ muchas filas ....................... lollipop
│
├─ ¿Cómo cambió en el tiempo?
│   ├─ dos o tres cortes .................. pendiente · flechas · líneas con grupo destacado (01)
│   ├─ cinco puntos o más ................. líneas con etiqueta al final · líneas con contexto
│   ├─ cuánto se aparta de lo normal ...... anomalías con líneas de nivel (11)
│   └─ cuánto queda de lo que había ....... serie indexada a base 100
│
├─ ¿De qué se compone el total?
│   ├─ pocas partes ....................... barras apiladas al 100 %
│   ├─ 12 partes o más, o con jerarquía ... treemap jerárquico con migas
│   ├─ el mismo total en varios cortes .... barras apiladas unidas por flujos (16)
│   └─ escala ordenada con punto neutro ... apilada divergente
│
├─ ¿Cómo varía un valor entre dos categorías cruzadas?
│   └─ ................................... heatmap con el valor en la celda
│
├─ ¿Cómo se reparten muchas unidades?
│   ├─ hasta unas 500 ..................... enjambre · enjambre de burbujas sobre un eje de razón (07)
│   ├─ por grupos, cinco o más ............ crestas con puntos · franjas con mediana
│   ├─ casos que se pueden contar ......... histograma de unidades (08)
│   ├─ edad y sexo ........................ pirámide
│   └─ dónde queda un valor dado .......... escalones de percentil (09)
│
├─ ¿De dónde a dónde se mueve?
│   ├─ sobre el territorio ................ mapa de flujos con flechas anchas (05), con una entidad elegida
│   ├─ entre etapas, hasta 8 nodos ........ sankey
│   ├─ entre dos momentos ................. aluvial (10), solo con las mismas unidades en ambos
│   └─ todos contra todos ................. matriz de adyacencia ordenada por volumen
│
├─ ¿Dónde pasa?
│   ├─ es una tasa ........................ coropleta con rampa continua · mosaico de entidades
│   ├─ es un conteo ....................... burbujas · picos (18) · prismas sobre rejilla (02)
│   └─ son casos con nombre ............... mapa de puntos anotado (04)
│
└─ ¿Se relacionan dos medidas?
    ├─ decenas o cientos de puntos ........ dispersión
    └─ miles de puntos .................... hexbin
```

### 2.3 Cortes que obligan a cambiar de forma

| Condición del dato | Consecuencia |
| --- | --- |
| Menos de cinco puntos en el tiempo | No hay línea: pendiente, flechas o dumbbell |
| Dos levantamientos independientes | Las cintas solo unen cada categoría consigo misma (ficha 16). No hay aluvial |
| Ediciones con categorías distintas | No se unen. Bloques separados con nota |
| El dato es un conteo | No hay coropleta: burbujas o picos |
| Más de ocho nodos por etapa | No hay sankey completo: una entidad elegida y “Otras” |
| Más de unos 500 puntos | No hay enjambre: crestas, franjas o una entidad a la vez |
| Menos de cinco grupos | No hay crestas ni violines |
| Menos de 12 partes sin jerarquía | No hay treemap: apiladas o lollipop |
| Proporción menor a 1 de cada 100 | No hay waffle sobre esa base |
| Menos de 30 casos de muestra en la celda | La marca va con trama y asterisco, o se agrupa en “otros” |
| Columna de 390 px | La matriz se sustituye por el ranking de la entidad elegida, y los rótulos de un mapa anotado pasan a una lista numerada |

---

## 3. Tabla maestra de formas

Claves de la columna de receta. **G**: `GuiaVisualizacion.md`, con su sección. **CV**: ficha de `CatalogoVisualizacion.md`. **H**: ficha de `CatalogoGraficas.html`. **N**: ficha de `formas-novedosas.md`. **PL**: función en `perdida-lengua/src/components/`, con su archivo. **P**: función de esta Plantilla en `src/components/formas/`, con su archivo; está en la galería y pasa los verificadores. Cuando la Plantilla tenga el componente en `src/components/`, manda el de la Plantilla.

La última columna da el `id` de la ficha en el catálogo navegable: se abre con `CatalogoGraficas.html#ficha-<id>`. Una raya indica que la forma todavía no tiene ficha. Las fichas de `rescatadas.js` cambian mientras se incorporan, así que su `id` se confirma en el catálogo.

Dificultad. **Baja**: existe un componente y basta adaptar los datos, o la forma sale con marcas nativas de Plot. **Media**: hay receta pero no componente, o hace falta preparar los datos en el loader. **Alta**: geometría o interacción propias, con verificación visual más larga.

| Forma | Familia | Pregunta que responde | Cuándo no usarla | Receta o componente | Dificultad | Ficha |
| --- | --- | --- | --- | --- | --- | --- |
| Cifra destacada | Cifra | Un solo número es la respuesta | Varios números que se comparan entre sí | CV Cifra destacada · H Cifra con tendencia · PL `kpis` (`graficas.js`) | Baja | `cifra` |
| Barras verticales | Comparación | ¿Cuánto vale cada grupo? | Nombres largos o más de 12 grupos. Más de cuatro paneles | G 10.1 · H | Baja | `barras` |
| Barras agrupadas en facetas | Comparación | Pocos grupos en dos a cuatro paneles | Más de tres series. Más de cuatro paneles | H · PL `barrasAgrupadas` (`graficas.js`) | Baja | `agrupadas` |
| Dumbbell | Comparación | ¿Cuánto separa a dos grupos en cada categoría? | Tres o más grupos por fila | G 10.3 · PL `dumbbell` (`formas.js`) | Baja | `dumbbell` |
| Unidades a ambos lados del eje | Comparación | ¿Cuántas personas hay de cada lado (mujeres y hombres, origen y destino) en cada grupo? | Más de dos lados. Más de unas diez categorías sin orden. Tasas: cada cuadro cuenta personas | N D08 · P `unidadesEspejo` (`unidades-espejo.js`) | Media | `unidades-espejo` |
| Áreas superpuestas en paneles traslapados | Comparación | ¿En qué unidades se separan dos series? | — | N 06 | Media | `areas-superpuestas` |
| Waffle | Proporción | ¿Cuántos de cada 100? | Más de cuatro grupos o diferencias de décimas. Menos de 1 de cada 100. Columna de 260 px | G 11.4 · PL `waffle`, `unidades` (`formas.js`) | Baja | `waffle` |
| Multitud ilustrada con fracción sólida | Proporción | ¿Qué parte de un grupo comparte una condición? | — | N 12 | Media | `fraccion` |
| Multitud de unidades con subgrupo resaltado | Unidades | De un total de personas, ¿cuántas están en una situación? | No hay unidad redonda que deje entre 600 y 1,500 figuras | N 17 | Media | `multitud` |
| Silueta rellena de puntos | Unidades | ¿Cuántas personas hay en cada situación, dentro de una figura que significa algo para el tema? | Más de cinco o seis categorías. Una silueta que solo adorna | N D18 · P `siluetaPuntos` (`silueta-puntos.js`) | Media | `silueta-puntos` |
| Mosaico de fracciones | Proporción | ¿Qué parte cumple en cada entidad, con el mismo peso visual? | Comparar décimas entre entidades. Valores que no son parte de un todo | N D05 · P `mosaicoFracciones` (`mosaico-fracciones.js`) | Media | `mosaico-fracciones` |
| Pila pictórica | Unidades | ¿Cuánto alcanza hoy frente a antes? | Tasas o porcentajes | N 03 | Media | `pila` |
| Barras horizontales ordenadas | Ranking | ¿Quién está arriba y quién abajo? | Categorías con orden propio (edad, decil) | G 10.2 · H | Baja | `ranking` |
| Lollipop | Ranking | ¿Cómo se ordenan muchas categorías? | Pocas filas | G 11.5 · PL `lollipop` (`formas.js`) | Baja | `lollipop` |
| Bump chart | Ranking | ¿Qué lugar ocupa cada quien año con año? | Importa la distancia entre valores | G 11.6 · PL `bump` (`formas.js`) | Baja | `bump` |
| Histograma | Distribución | ¿Cómo se reparten los valores de una medida? | Comparar más de dos grupos | G 11.1 · H | Baja | `histograma` |
| Histograma de unidades pictóricas | Distribución | ¿Cómo se distribuye un valor entre casos y dónde cae la mitad? | Más de unas 1,500 unidades sin subir el tamaño de la unidad | N 08 | Media | `histograma-unidades` |
| Caja | Distribución | ¿Cómo se comparan las distribuciones de varios grupos? | Pocos casos por grupo | G 11.2 · H | Baja | `caja` |
| Enjambre | Distribución | ¿Dónde cae cada unidad y cómo se agrupan? | Miles de unidades. Más de unos 500 puntos | H · CV Beeswarm | Media | `enjambre` |
| Enjambre de burbujas sobre un eje de razón | Distribución | ¿Cómo se reparten muchas unidades a lo largo de una razón y cuánto pesa cada una? | Más de unos 500 puntos | N 07 | Media | `enjambre-burbujas` |
| Franjas con mediana | Distribución | ¿Cómo cambió cada unidad dentro de su grupo? | — | PL `franjas` (`reporte.js`) | Baja | `franjas-mediana` |
| Crestas con puntos | Distribución | ¿Cómo se desplaza una distribución entre años o grupos? | Menos de cinco grupos. Hay que leer valores exactos | H · PL `crestas` (`reporte.js`) | Baja | `crestas` |
| Pirámide | Distribución | ¿Cómo se compone la población por edad y sexo? | Comparar muchos lugares. Grupos de edad de anchos distintos | G 11.3 · PL `piramide` (`reporte.js`) | Baja | `piramide` |
| Escalones de percentil por grupo | Distribución | ¿En qué lugar de la distribución deja un valor a una persona según el grupo? | — | N 09 | Media | `escalones` |
| Puntos de cuantiles | Distribución | ¿Qué tan segura es esta cifra de encuesta? | La muestra es grande y el intervalo es angosto | H | Media | `cuantiles` |
| Líneas con etiqueta al final | Tiempo | ¿Cómo evoluciona una serie larga? | Dos o tres años. Menos de cinco puntos | G 10.5 · PL `serieLarga` (`reporte.js`) | Baja | `lineas` |
| Líneas con contexto | Tiempo | ¿Cómo les fue a unos pocos frente a los demás? | Todas las series importan por igual | G 10.5 · H | Media | `contexto` |
| Líneas verticales con grupo destacado | Tiempo | ¿Cómo se movió cada unidad y dónde queda un grupo frente a las demás? | — | N 01 | Baja | `destacadas` |
| Pendiente | Tiempo | ¿Cómo cambió entre dos o tres años? | Series largas | G 10.4 · PL `pendiente` (`graficas.js`) | Baja | `pendiente` |
| Flechas | Tiempo | ¿De qué valor a qué valor pasó cada fila? | — | PL `flechas` (`reporte.js`) | Baja | — |
| Riel de trayectoria con flecha final | Tiempo | ¿Hacia dónde se movió cada grupo en tres a cinco cortes, y si dio la vuelta? | Más de cinco cortes. Más de unas quince unidades | N D03 · P `riel` (`riel.js`) | Media | `riel` |
| Mosaico de triángulos partidos | Tiempo | ¿Cuánto y hacia dónde cambió cada entidad entre dos años? | Más de dos valores por entidad. Conteos | N D04 · P `mosaicoTriangulos` (`mosaico-triangulos.js`) | Media | `mosaico-triangulos` |
| Serie indexada a base 100 | Tiempo | ¿Cuánto queda de lo que había? | — | CV Serie indexada · PL `fichasLenguas` (`reporte.js`) | Baja | — |
| Anomalías con líneas de nivel | Tiempo | ¿Cuánto se aparta cada año de lo normal y cuál fue el extremo? | — | N 11 | Media | — |
| Mosaico de mini-series | Tiempo | ¿Cómo evoluciona cada entidad, todas a la vez? | Menos de cinco puntos por entidad | Por construir sobre PL `mosaico` (`formas.js`) | Media | `mosaico-series` |
| Barras apiladas al 100 % | Parte-todo | ¿De qué se compone el total de cada grupo? | Más de tres partes sin orden. Se quiere comparar el tercer segmento | G 10.6 · PL `apiladas100` (`graficas.js`), `barrasRiesgo` (`riesgo.js`) | Baja | `apiladas` |
| Barras apiladas unidas por flujos | Parte-todo | ¿Cómo se recompone un total fijo entre varios cortes? | Se dibujan cruces entre categorías sin datos de transición | N 16 | Media | `apiladas-flujo` |
| Triángulo ternario con estelas | Parte-todo | ¿Hacia cuál de tres partes se movió la composición de cada unidad? | Más de tres partes. Partes que no suman un todo. Cifras exactas | N D14 · P `ternario` (`ternario.js`) | Alta | `ternario` |
| Apilada divergente | Parte-todo | ¿Qué tan de acuerdo están? | Respuestas sin orden | G 10.11 · PL `likert` (`formas.js`) | Baja | `likert` |
| Treemap jerárquico | Parte-todo | ¿Cómo se reparte un total entre muchas partes? | Menos de 12 partes sin jerarquía. Dos treemaps lado a lado | G 11.11 · PL `treemapJerarquico` (`formas.js`) | Baja | `treemap` |
| Marimekko | Parte-todo | ¿Cómo se compone cada grupo cuando los grupos son de tamaños distintos? | Grupos de tamaño parecido. Lectura precisa. Un grupo tan chico que su columna no se ve | H · CV Marimekko | Media | `marimekko` |
| Cascada | Parte-todo | ¿Qué partes explican el cambio de un total? | Las partes no suman el total | G 11.7 · H | Media | `cascada` |
| Heatmap | Relación | ¿Cómo varía un valor entre dos categorías cruzadas? | Pocas celdas. Una magnitud sin punto medio pintada con rampa divergente | G 10.7 · PL `heatmapIndicadores` (`graficas.js`), `heatmapEdad` (`lengua.js`) | Baja | `heatmap` |
| Mapa de calor edad × año | Relación | ¿Cómo cambia la estructura por edad a lo largo del tiempo? | — | N 14, versión 2D | Baja | — |
| Dispersión | Relación | ¿Se relacionan dos medidas? | Miles de puntos | G 10.8 · H | Media | `dispersion` |
| Hexbin | Relación | ¿Se relacionan dos medidas con miles de puntos? | Pocas unidades con nombre | G 11.9 · H | Media | `hexbin` |
| Coropleta | Mapa | ¿Dónde pasa? (tasas) | Conteos | G 10.9 · PL `coropleta` (`formas.js`), `mapaPlano` (`mapa-plano.js`) | Baja | `coropleta` |
| Mapa de categorías | Mapa | ¿En qué clase cae cada lugar? | Una magnitud continua. Más de tres clases con color | P `mapaPlano` (`mapa-plano.js`) · H | Baja | `mapa-categorias` |
| Mosaico de entidades | Mapa | ¿Cómo va cada entidad, con el mismo peso visual? | Importa el tamaño real | H · PL `mosaico` (`formas.js`) | Baja | `teselas` |
| Mapa de burbujas | Mapa | ¿Cuántos hay en cada lugar? (conteos) | Tasas | G 11.10 · PL `burbujas` (`formas.js`) | Baja | `burbujas` |
| Mapa de picos | Mapa | ¿Dónde se concentran los conteos, sin que el territorio grande domine? | Unidades muy juntas. Los picos pequeños se pierden | N 18 · H Mapa de agujas · CV Mapa de espigas | Baja | `agujas` |
| Mapa de flechas inclinadas por unidad | Mapa | ¿Hacia dónde cambió cada municipio y cuánto? | Niveles (coropleta). Conteos. Más de unas 2,500 unidades a la vista | N D01 · P `flechasCambio` (`flechas-cambio.js`) | Alta | `flechas-cambio` |
| Mapa de semitonos sobre rejilla hexagonal | Mapa | ¿Dónde se concentra una cantidad dentro del territorio? | Tasas o porcentajes | N D07 · P `semitonos` (`semitonos.js`) | Media | `semitonos` |
| Mapa de puntos anotado | Mapa | ¿Dónde están los casos y cuáles siguen vigentes? | — | N 04 | Baja | — |
| Mapa de prismas sobre rejilla | Mapa | ¿Dónde se concentra una cantidad dentro de una ciudad? | Más de unas 1,500 celdas. Los prismas altos ocultan lo que tienen detrás, por lo que se ofrece la versión plana | N 02 | Alta | — |
| Mapa de relieve sombreado | Mapa | Ninguna estadística: da contexto de terreno | Como gráfica principal | N 13 | Media | — |
| Sankey | Flujo | ¿De dónde a dónde se mueve algo? | Muchos orígenes y destinos: más de ocho nodos por etapa | G 11.13 · PL `sankey` (`formas.js`) | Baja | `sankey` |
| Flujos que bajan de una barra al mapa | Flujo | ¿A dónde van quienes salen de un lugar y por qué motivo? | Más de unas cuatro categorías. Más de 12 destinos con cinta propia. Tasas | N D06 · P `barraMapa` (`barra-mapa.js`) | Alta | `barra-mapa` |
| Aluvial entre dos cortes | Flujo | ¿Qué parte de cada categoría se convirtió en otra? | Los cortes son levantamientos independientes | N 10 · PL `aluvialRiesgo` (`riesgo.js`) | Media | `aluvial` |
| Mapa de flujos con flechas anchas | Flujo | ¿De dónde llega lo que se concentra en un lugar? | Sin una entidad elegida. Más de unos 50 arcos | N 05 · CV Mapa de arcos | Media a alta | `flechas` |
| Mapa de flujos a pantalla completa | Flujo | ¿De qué lugar a qué lugar se mueven las personas, quiénes son y a dónde siguen? | Dentro de una sección del libro (va en página propia). Tasas: el ancho es un conteo. Más de 20 flechas de color | P `mapaFlujos` (`src/components/mapa-flujos.js`, dibuja con `flechas` y `mapaBase`). Decisiones en `docs/mapa-flujos.md` | Alta | — |
| Matriz de adyacencia | Flujo | ¿Cuánto se mueve entre cada par de lugares? | Pocos flujos. Columna de 390 px | H · CV Matriz de flujo | Media | `matriz` |
| Conjuntos paralelos | Flujo | ¿Cómo se reparte un total entre tres categorías a la vez? | Más de tres variables | H | Media | `conjuntos` |
| Enjambre de unidades | Unidades | ¿Quiénes son, uno por uno, quienes están detrás de un porcentaje? | — | N 15, versión 2D | Baja | — |
| Forma figurativa del tema | Figurativa | ¿Cómo se ven todas las unidades de un vistazo? | El valor no se lee por otro canal con leyenda, o la figura no significa nada para el tema | PL `virgula` (en la página `hablantes.md`) | Alta | — |

Las formas que no se usan están en `REGLAS.md`, R75.

---

## 4. Dónde se corrigen los catálogos copiados

Los tres catálogos se copiaron sin editar, salvo la nota inicial. Esta sección lista cada punto donde `REGLAS.md`, `colores.md` o `formas-novedosas.md` los corrigen. Al usar una receta de los catálogos se aplica la corrección.

### 4.1 Color

| Qué dice el catálogo | Dónde | Qué se aplica |
| --- | --- | --- |
| La serie única va en rojo plano (`T.rojo`, `ROJO`) | Guía 3.1, fila “Ninguno”, y recetas 10.1, 10.2, 11.1, 11.4, 11.5 y 11.10. CV, sección de paleta | La serie única va en el tono de tema (R99) |
| La rampa de magnitud va del papel al rojo de marca (`SECUENCIAL`, `T.secuencial`, `T.relleno`) | Guía, bloque base y 3.1. CV, sección de paleta. H, objeto de tema | Rampa continua del tono de tema (R99) |
| El rojo marca siempre lo desfavorable, según `sentido` | Guía, regla de oro 3. CV, `CAMBIO` y `colorCambio` | Rojo y azul llevan el significado que declara el capítulo (R95). “En desventaja” y “en ventaja” es una declaración posible |
| La identidad usa rojo, azul y ámbar. El tema va en rojo y el resto en azul. El sexo va en ámbar y azul | Guía 3.1. CV, `PALETA`, `PAR_TEMA` y `PAR_SEXO` | Pendiente de decidir (P1 de `REGLAS.md`). Mientras tanto, rojo y azul no se usan para identidad en un capítulo que ya les dio significado |
| Cortes por cuantiles en el mapa de teselas | CV, ficha Coropleta municipal | Rampa continua con dominio fijo (R100, R101) |

`CatalogoGraficas.html` ya aplica estas correcciones (noviembre de 2026): su bloque base toma de `src/components/paleta.js` el tono de tema (`T.serie`), la rampa de magnitud (`T.secuencial`), la identidad verde azulado, ocre y terracota (`T.categorica`) y el par mujeres y hombres. En sus recetas el rojo queda solo donde tiene significado: la cifra principal y las salidas de un lugar elegido. Al cambiar `paleta.js` hay que copiar sus valores al objeto `TEMAS` del catálogo y correr `node catalogo/herramientas/verificar_catalogo.mjs`. GuiaVisualizacion.md y CatalogoVisualizacion.md siguen sin tocar y la tabla de arriba vale para ellos.

Lo que se conserva de los catálogos en materia de color: tres tonos más “Otras”, color por entidad y no por frecuencia, resalte con contorno u opacidad, rampa por valor, dominio fijo, divergente con centro gris y validación con `validate_palette.js`.

### 4.2 Ejemplos que usan morado

| Ejemplo | Dónde | Qué se hace |
| --- | --- | --- |
| `PALETA_EXTENDIDA`, que incluye `#8C4799` en claro y `#A768B8` en oscuro | CV, sección de paleta, y las 14 fichas que la usan: Barras agrupadas, Histograma apilado, Área apilada, Área apilada al 100%, Streamgraph, Barras apiladas, Barras apiladas al 100%, Waffle, Waffle apilado, Isotipo, Marimekko, Treemap, Icicle y Sankey | No se usa. Tres tonos más “Otras” (R107) |
| Paleta bivariada de 3 × 3, cuya esquina es `#4A3A62` en claro y `#B49AD6` en oscuro | CV, sección de paleta y ficha Mapa bivariado. Guía, bloque base y receta 10.10. H, ficha Mapa bivariado | El mapa bivariado no se usa mientras no se decida (P6 de `REGLAS.md`) |
| `RAMPA_MORADA` (BuPu) en el mapa de teselas | CV, ficha Coropleta municipal | Rampa del tono de tema |
| Rojo categórico corrido a magenta en modo oscuro (`#EE4C7C`) | CV, sección de paleta. Guía, sección 4 | Se revisa al validar la paleta del libro en modo oscuro. El valor vigente es el de `paleta.js` |
| Captura 15 con paleta morada y captura 02 con fondo violeta | `referencias/` y `formas-novedosas.md` | Ya están marcadas como “no cabe” o “cabe con adaptación”. Se usa la versión en fondo claro y con la paleta del libro |

### 4.3 Formas descartadas

| Forma | Qué dicen los catálogos | Qué se aplica |
| --- | --- | --- |
| Streamgraph | CV conserva una ficha como forma “expresiva, no analítica”. La Guía (9.3) y H la descartan | Descartada |
| Diagrama de cuerdas | La Guía (9.3) y H lo descartan. CV ofrece en su lugar la Matriz de flujo. La lista de Data Viz Project de `formas-novedosas.md` lo marca con estrella | Descartado mientras no se decida (P4 de `REGLAS.md`). Va la matriz, el sankey o el mapa de flujos |
| Empaquetado de círculos | La Guía (9.3) y H lo descartan. `formas-novedosas.md` lo marca con estrella | Descartado mientras no se decida (P4) |
| Pastel y dona, radar, doble eje, sunburst, barras y áreas radiales, glifos de flor, nube de palabras, velocímetro, barra única | Descartados en los tres | Descartados |
| 3D | Los tres descartan “3D de cualquier tipo” | El 3D real sigue descartado. Se admiten pseudo-3D en SVG: prismas isométricos (N 02) y mapas de picos (N 18). Para las capturas 14 y 15 se usa la versión 2D de su ficha |
| “Ideas para historias interactivas” | H las lista aparte porque dependen de animación o de que el lector dibuje | No se usan en un libro de datos |

### 4.4 Globos, textos y anatomía

| Qué dice el catálogo | Dónde | Qué se aplica |
| --- | --- | --- |
| El globo lleva tres o cuatro renglones: dimensión, grupo, valor y población | Guía, regla de oro 6, sección 8.2 y lista de la sección 14. CV, Cifras y unidades. `formas-novedosas.md`, tabla de convenciones | Norma de seis papeles con frase del denominador y personas (R116) |
| La población del globo va abreviada | Recetas con `poblacionCorta` | Entero completo con unidad (R127) |
| El título de la gráfica va en rojo | Guía 5.1 y bloque base. CV, Anatomía de la figura | Título en tinta oscura (R40) |
| El título dice el hallazgo | `formas-novedosas.md`, convenciones de Datawrapper | El título nombra lo que se mide (R40) |
| Rangos de color escalonados | `formas-novedosas.md`, convenciones de Datawrapper | Rampa continua para la presencia (R100). Las clases quedan para clasificaciones ordenadas (R109) |
| “Fuentes y verificación” incluye la fuente de los datos y lecturas | CV, Anatomía de la figura | Solo la verificación. Las fuentes de datos van en Referencias (R136, R138) |
| En el libro de migración: por violencia en acento, otra causa en tono medio, sin movilidad en tono claro | `formas-novedosas.md`, sección 6, fila 1 | Por violencia en rojo, otra causa en azul, sin movilidad en gris (`colores.md`, 2.4) |

---

## 5. Dónde buscar más

Canteras ya verificadas, con el detalle y el estado de cada enlace en `formas-novedosas.md`, secciones 3, 4, 5 y 7.

| Cantera | Para qué sirve |
| --- | --- |
| [Data Viz Project](https://datavizproject.com/) | Índice de 166 tipos de gráfica con ejemplos. `formas-novedosas.md` los clasifica por función y marca 33 aprovechables con datos de encuestas y censos |
| [Data Vis Dispatch](https://www.datawrapper.de/blog/category/data-vis-dispatch) de Datawrapper | Reseña semanal de lo publicado por redacciones y autores. De ahí salen casi todas las capturas de `referencias/` |
| [Weekly Charts](https://www.datawrapper.de/blog/category/weekly-charts) de Datawrapper | Una gráfica comentada por semana, con sus decisiones de texto y color |
| [Guía de tipos de gráfica](https://www.datawrapper.de/blog/chart-types-guide) de Datawrapper | Cerca de 40 formas ordenadas por la pregunta que responden |
| [Observable Plot, documentación](https://observablehq.github.io/plot/) | Marcas y transformaciones en que se apoyan las recetas: waffle, dodge, arrow, vector, spike e image |
| [D3, documentación](https://d3js.org/) | Lo que Plot no cubre: `d3-force`, `d3-shape`, `d3-geo` y `d3-sankey` |
| [Financial Times Visual Vocabulary](https://ft-interactive.github.io/visual-vocabulary/) | Cartel que ordena las formas por la relación que se quiere mostrar |
| [From Data to Viz](https://www.data-to-viz.com/) | Árbol de decisión por tipo de datos, con los errores frecuentes de cada forma |
| [The Data Visualisation Catalogue](https://datavizcatalogue.com/) | Ficha breve por tipo, con anatomía y función |
| [Xenographics](https://xeno.graphics/) | Formas raras con su fuente original |
| [Reuters Graphics](https://www.reuters.com/graphics/) | Multitudes de unidades, ilustración integrada al dato y anotación directa |
| [The Pudding](https://pudding.cool/) | Ideas de unidad e interacción. Casi siempre con narración por pasos, que aquí no se replica |
| [FlowingData](https://flowingdata.com/) | Gráficas con datos de encuestas, con [índice por tipo](https://flowingdata.com/chart-types/) |

Las galerías de Observable (`observablehq.com/@observablehq/plot-gallery` y `observablehq.com/@d3/gallery`) no se pudieron abrir en la revisión del 16 de noviembre de 2026 por límite de peticiones, y quedan sin verificar.

### Cómo se incorpora una forma nueva

1. Guardar la captura en `referencias/` con número consecutivo y nombre descriptivo.
2. Escribir su ficha en `formas-novedosas.md` con los mismos campos: nombre en inglés, origen, pregunta que responde, por qué funciona, receta, dificultad y encaje.
3. Revisar el encaje contra `REGLAS.md`: fondo claro, sin narración por pasos, sin 3D real, sin morado, animación una sola vez, tabla de respaldo y globo con personas. Si no cabe, se documenta la versión que conserva la idea.
4. Añadir la fila a la tabla maestra de este archivo, con el `id` de su ficha en la última columna, y, si responde una pregunta nueva, una rama al árbol.
5. Añadir su ficha al catálogo navegable, como se describe a continuación.

#### La ficha del catálogo

La ficha se añade en el archivo de `fichas/` que le corresponde: `plantilla.js` si la forma ya es un componente de `src/components/formas/`, `base.js` si solo tiene receta, y `rescatadas.js` si viene de otro catálogo. Cada archivo es un script clásico que agrega sus fichas con `window.FICHAS = (window.FICHAS || []).concat([...])`, y el contrato completo, con la lista de globales que una receta puede usar, está al inicio de `fichas/base.js`. Si la forma ya tiene ficha y lo nuevo es su componente, no se crea otra: se llena el campo `plantilla` de la ficha que existe, como se hizo con el sankey, el treemap o la coropleta.

Los campos de texto son los mismos de siempre: `nombre`, `pregunta` en una frase, `si` y `no` (cuándo usarla y cuándo evitarla, tomados de la cabecera del componente cuando lo hay), `datosForma` con la forma de los datos (`"[{grupo, valor}]"`) y `fuentes` con la referencia de origen. El `nivel` va de 0 (básico) a 3 (experimental) con la misma escala del encabezado del catálogo, y `estado` dice si la forma está en la Plantilla (`"plantilla"`), si solo tiene la receta de la ficha (`"receta"`) o si todavía es una idea (`"idea"`).

La clasificación se elige respondiendo cuatro preguntas. La `familia` es una sola y dice cómo se dibuja: gráfica si el valor se lee por largo o posición sobre ejes, diagrama si son nodos, cintas o rectángulos anidados, mapa si la base es el territorio, trazado si son marcas sueltas sobre dos ejes de magnitud y tabla si es una rejilla de celdas. La `entrada` es la lista de formas de los datos que la forma acepta, con los códigos de la tabla de abajo; se pone primero la más habitual, porque la primera es la que agrupa la ficha. La `funcion` es la lista de lo que la forma deja ver (`comparacion`, `concepto`, `correlacion`, `distribucion`, `geolocalizacion`, `parte-todo`, `tiempo`, `flujo`, `jerarquia`, `unidades`), también con la principal primero, que es la que agrupa la vista inicial. La `forma` es la lista de figuras que se ven (`cuadrado`, `circulo`, `area`, `triangulo`, `hexagono`, `linea`, `barras`, `puntos`, `figura`, `mapa`): se ponen las que alguien buscaría al recordar la gráfica, no todas las marcas que contiene. Un código que el catálogo no reconoce no rompe la página, pero se avisa en la consola y la ficha cae en el grupo «Sin clasificar».

| Código de entrada | Datos |
| --- | --- |
| `categoria-valor` | grupo, valor |
| `categoria-series` | grupo, serie 1, serie 2 |
| `partes` | partes que suman 100 |
| `dos-medidas` | unidad, x, y |
| `cruce` | fila × columna → valor |
| `serie-tiempo` | fecha, valor |
| `dos-cortes` | unidad, antes, después |
| `tres-partes` | unidad, a, b, c que suman 100 |
| `intervalos` | inicio, fin |
| `origen-destino` | origen, destino, valor |
| `jerarquia` | padre, hijo, valor |
| `geo-valor` | clave geográfica, valor |
| `geo-puntos` | lat, lon, valor |
| `conteo` | un total de personas por grupo |
| `distribucion` | valores sueltos por unidad |

La vista previa puede ser una receta viva o una miniatura. Se escribe receta viva (`datos` y `receta(datos, width)`, que devuelve un nodo) cuando la forma se dibuja con Plot o D3 y las globales del catálogo, sin `FileAttachment`, sin `paleta.js` y sin módulos de Framework; las cifras de ejemplo salen de `ENT`, `azar` y `normal`, y los colores, de `T`, nunca de un hexadecimal suelto. Se usa miniatura (`imagen: "miniaturas/<id>.png"`, con `datos` y `receta` en `null`) cuando la forma es un componente de la Plantilla que depende de Framework, porque copiarlo a una receta duplicaría código que se desincroniza; en ese caso el bloque `plantilla` es obligatorio, con `componente`, `galeria` (`"src/galeria/x.md#ancla"`, o `null` si la forma todavía no está en la galería) y `uso`, la llamada mínima copiada de la galería con su `import`.

Las miniaturas se regeneran desde la carpeta `Plantilla`, con `dist/` construido y sin un build ni un verificador corriendo, con `node catalogo/herramientas/miniaturas.mjs` (todas) o `node catalogo/herramientas/miniaturas.mjs <id>` (una), seguido de `python catalogo/herramientas/reducir_miniaturas.py`. El script lee las fichas que tienen `imagen` y `plantilla.galeria`, abre esa sección de la galería en una ventana de 760 px a 2x, espera a que la figura se dibuje y recorta su cuerpo con 10 px de margen, en claro y en oscuro; la reducción a 256 colores baja el peso cerca de 60 por ciento sin cambio visible, porque las figuras son tintas planas. Una forma que no está en la galería no tiene miniatura automática, y lo correcto es añadirle su sección a la galería antes que capturarla de otra página.

Antes de dar la ficha por buena se corre `node catalogo/herramientas/verificar_catalogo.mjs`, que abre el catálogo por `file://` y por http y comprueba que no haya errores de consola, que cada receta dibuje, que cada miniatura cargue, que cada opción de cada pestaña devuelva al menos una ficha y quede en la dirección, que la combinación y «Quitar filtros» funcionen, que las pestañas respondan al teclado y que axe no encuentre fallas graves en claro ni en oscuro, a 1366 y a 390 px, sin desplazamiento horizontal de la página. Después se mira la ficha en los dos temas: una prueba que pasa no dice si la miniatura se lee o si el ejemplo tiene sentido.
