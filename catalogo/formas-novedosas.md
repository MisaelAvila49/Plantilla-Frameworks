# Formas novedosas de gráfica: fichas, canteras y aplicación

Este catálogo reúne 18 formas de gráfica poco habituales, tomadas de capturas guardadas en `referencias/`, y documenta para cada una qué pregunta responde, por qué llama la atención y cómo se construiría con Observable Plot o D3 dentro del estilo de la casa. Casi todas las capturas provienen del boletín semanal «Data Vis Dispatch» de Datawrapper, que cada martes reseña lo publicado por redacciones y autores independientes. Después de las fichas se listan los 166 tipos de Data Viz Project clasificados por función, las convenciones que hacen reconocible una gráfica de Datawrapper, otras canteras donde buscar formas nuevas y una propuesta de aplicación al libro de migración por violencia. Todas las páginas se consultaron el 16 de noviembre de 2026 y el estado de cada enlace se detalla en la última sección.

Las formas que ya están fichadas en el catálogo general de visualización (beeswarm, ridgeline, waffle, isotipo, slope, bump, sankey) no se repiten aquí; lo que se documenta es la variante que las vuelve llamativas y lo que cuesta reproducirla.

## 1. Restricciones que condicionan cada receta

Cada receta se escribió para un libro de datos en Observable Framework, por lo que parte de las mismas reglas. El sitio es de fondo claro y ninguna gráfica se dibuja sobre fondo oscuro, aunque la referencia lo haga. No hay scrollytelling: cada análisis es una sección con su panel de filtros y sus globos, de modo que lo que en la referencia se cuenta por pasos aquí se resuelve con un selector o con anotaciones fijas. La animación ocurre una sola vez al entrar la sección. No se usa 3D real con WebGL; se aceptan pseudo-3D dibujados en SVG, como prismas isométricos o mapas de picos. Todo se construye con Plot o D3 en SVG o canvas, lleva tabla de respaldo y contraste medido, y ninguna paleta usa morado. El globo muestra siempre la estadística y a cuántas personas equivale.

La dificultad se gradúa en tres niveles. **Baja** significa que la forma sale con marcas y transformaciones nativas de Plot. **Media** indica que hace falta preparar los datos en el data loader o añadir una capa de D3 sobre la gráfica de Plot. **Alta** se reserva para la geometría propia (proyección manual, orden de pintado, polígonos calculados a mano), que además exige una verificación visual más larga en claro, oscuro, escritorio y 390 px.

## 2. Las 18 formas de referencia

| # | Forma | Nombre en inglés | Dificultad | Encaje |
|---|---|---|---|---|
| 01 | Líneas verticales con grupo destacado | Highlighted line chart (spaghetti) | Baja | Cabe |
| 02 | Mapa de prismas sobre rejilla | Gridded 3D bar map (prism map) | Alta | Cabe con adaptación: prismas isométricos en SVG sobre fondo claro |
| 03 | Pila pictórica | Pictorial stacked / pictorial bar chart | Media | Cabe |
| 04 | Mapa de puntos anotado | Annotated symbol map (pin map) | Baja | Cabe |
| 05 | Mapa de flujos con flechas anchas | Flow map | Media a alta | Cabe |
| 06 | Áreas superpuestas en paneles traslapados | Layered area chart, small multiples | Media | Cabe |
| 07 | Enjambre de burbujas sobre un eje de razón | Sized beeswarm (bubble swarm) | Baja a media | Cabe |
| 08 | Histograma de unidades pictóricas | Unit histogram (pictorial unit chart) | Media | Cabe con adaptación: sin narración por scroll |
| 09 | Escalones de percentil por grupo | Percentile steps («tú estás aquí») | Media | Cabe |
| 10 | Aluvial entre dos cortes | Alluvial diagram | Media | Cabe con adaptación: fondo claro |
| 11 | Anomalías con líneas de nivel | Contour-line anomaly chart | Media | Cabe |
| 12 | Multitud ilustrada con fracción sólida | Pictorial fraction chart (crowd) | Media | Cabe |
| 13 | Mapa de relieve sombreado | Shaded relief / topographic map | Media | Cabe solo como fondo de contexto |
| 14 | Pirámide de población como superficie 3D | 3D surface (waterfall plot) | Baja en su versión 2D | No cabe; versión 2D: mapa de calor edad × año |
| 15 | Multitud 3D de personas encuestadas | 3D unit visualization | Baja en su versión 2D | No cabe; versión 2D: enjambre de unidades |
| 16 | Barras apiladas unidas por flujos | Stacked bars with flows (alluvial bars) | Media | Cabe |
| 17 | Multitud de unidades con subgrupo resaltado | Pictorial unit chart (isotype crowd) | Media | Cabe |
| 18 | Mapa 3D extruido con altura y color redundantes | Extruded surface map | Baja en su versión 2D | No cabe tal cual; versión 2D: mapa de picos coloreado |

La columna de origen de cada ficha indica la entrega del Dispatch que reseñó la pieza. La asignación se hizo por coincidencia de medio y tema con el texto de la entrega; donde solo coincide el medio se anota como probable, y la captura 05 quedó sin origen determinado.

### 01 · Líneas verticales con grupo destacado

![Líneas por condado con los condados fronterizos destacados](referencias/01-lineas-por-condado-destacadas-nyt.png)

**Nombre en inglés:** highlighted line chart o spaghetti chart con resalte; en Data Viz Project corresponde a [Line Graph](https://datavizproject.com/data-type/line-chart/) y [Spline Graph](https://datavizproject.com/data-type/spline-graph/). **Origen:** The New York Times, probablemente reseñada en el [Dispatch del 10 de noviembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index).

**Pregunta que responde:** cómo se movió cada unidad territorial a lo largo de varias elecciones o levantamientos, y dónde queda un grupo de unidades respecto de todas las demás.

**Por qué funciona:** el tiempo corre de arriba hacia abajo (1988 arriba, 2026 abajo) y el valor va en el eje horizontal, lo que permite leer la gráfica como un recorrido y deja la columna angosta que pide un teléfono. Las cerca de 250 líneas de contexto se dibujan casi transparentes y solo el grupo elegido en las pestañas («Border», «Major Suburbs», «Major Cities») lleva trazo pleno. El color depende del lado del cero en que está cada tramo, así que una línea cambia de azul a rojo cuando cruza, y un único rótulo directo sobre el grupo sustituye a la leyenda.

**Receta:**

1. Dos capas de `Plot.line` con `x` = indicador, `y` = año, `z` = unidad y `curve: "bump-y"`; el eje `y` se invierte para que el tiempo baje.
2. La capa de contexto lleva todas las unidades con `strokeOpacity` entre 0.08 y 0.15; la capa destacada filtra por el grupo elegido en el panel de filtros y usa `strokeWidth: 2`.
3. El cambio de color al cruzar el valor de referencia se resuelve con un `linearGradient` horizontal en `userSpaceOnUse` cuyo corte coincide con `x(0)`, aplicado como `stroke`.
4. Un `Plot.text` con el nombre del grupo a media altura y `Plot.tip` con `Plot.pointerY` para el globo.
5. Con más de 2,000 líneas de contexto conviene pintarlas en canvas y dejar en SVG solo las destacadas.

**Dificultad:** baja. **Encaje:** cabe sin cambios; las pestañas pasan a ser un selector del panel de filtros.

### 02 · Mapa de prismas sobre rejilla

![Densidad comercial de París en prismas sobre una rejilla de 400 m](referencias/02-mapa-prismas-3d-paris.png)

**Nombre en inglés:** gridded 3D bar map o prism map; en Data Viz Project, [Bar Chart on a Map](https://datavizproject.com/data-type/map-bar-chart/). **Origen:** Victor Charbonnier para el #30DayMapChallenge, reseñado en el [Dispatch del 10 de noviembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index); según la entrega, el relieve se hizo en Blender.

**Pregunta que responde:** dónde se concentra una cantidad dentro de una ciudad y qué tan lejos queda el máximo del resto.

**Por qué funciona:** la unidad no es la colonia ni el distrito sino una celda regular de 400 m, por lo que las alturas son comparables entre sí. La altura y el color codifican la misma variable, y unas cuantas torres aisladas vuelven evidente la concentración. La captura no cabe tal cual por dos razones: es un render con iluminación, no una gráfica interactiva, y usa un fondo violeta oscuro.

**Receta:**

1. Agregar el dato a una rejilla cuadrada o hexagonal en el data loader, sobre coordenadas ya proyectadas, y conservar para cada celda su centro y su valor.
2. Aplicar una proyección isométrica manual: `X = (x − y)·cos 30°`, `Y = (x + y)·sen 30° − altura`.
3. Dibujar cada prisma como tres polígonos (tapa, cara izquierda y cara derecha) con tres tonos del mismo matiz, sobre fondo claro.
4. Ordenar de atrás hacia adelante por `x + y` antes de pintar, para que los prismas cercanos tapen a los lejanos.
5. Limitar la vista a unas 1,500 celdas y ofrecer en el panel un conmutador a la versión plana (rejilla coloreada), porque los prismas altos ocultan lo que tienen detrás.

**Dificultad:** alta. **Encaje:** cabe con adaptación. Cuando no se necesita la rejilla, el mapa de picos de la ficha 18 conserva la idea con dificultad baja.

### 03 · Pila pictórica

![Pilas de panqueques que comparan 2016 y 2026](referencias/03-pila-pictorica-panqueques-correctiv.png)

**Nombre en inglés:** [Pictorial Stacked Chart](https://datavizproject.com/data-type/pictorial-stacked-chart/) o [Pictorial Bar Chart](https://datavizproject.com/data-type/pictorial-bar-chart/). **Origen:** «The Pancake Index» de CORRECTIV, reseñado en el [Dispatch del 10 de noviembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index).

**Pregunta que responde:** cuánto de algo cotidiano alcanza hoy frente a hace diez años; es una comparación de dos magnitudes traducida a un objeto que se puede contar.

**Por qué funciona:** convierte un índice abstracto (poder adquisitivo) en una unidad concreta, y la pila conserva el eje numérico, por lo que sigue siendo una barra legible. El título es el hallazgo y la palabra «fewer» va en el mismo color que la anotación de cambio (−16.8 por ciento), de modo que el título hace de leyenda. La última unidad se dibuja parcial (16¾) y los controles permiten que el lector ponga su país y su ingreso.

**Receta:**

1. Expandir cada valor a sus unidades con `d3.range(Math.ceil(n))` y dibujarlas con `Plot.image`, con `x` = grupo y `y` = índice de la unidad.
2. Recortar la última unidad con un `clipPath` proporcional a la fracción sobrante.
3. Rotular el valor bajo cada pila con `Plot.text` y el cambio con un texto en el color de acento.
4. Llevar el selector y los deslizadores al panel de filtros con `Inputs.select` e `Inputs.range`.
5. Declarar en el pie cuánto representa cada unidad y repetir el valor exacto en la tabla de respaldo.

**Dificultad:** media. **Encaje:** cabe. Solo conviene cuando la unidad dibujada es algo contable y equivalente entre grupos; con tasas o porcentajes la pila deja de tener sentido.

### 04 · Mapa de puntos anotado

![Bases militares de Estados Unidos en Alemania, activas y antiguas](referencias/04-mapa-puntos-anotado-datawrapper.png)

**Nombre en inglés:** annotated symbol map; en Data Viz Project, [Pin Map](https://datavizproject.com/data-type/pin-map/) y [Bubble Map](https://datavizproject.com/data-type/bubble-map-chart/). **Origen:** [«From stationed to settled: U.S. bases in Germany»](https://www.datawrapper.de/blog/us-bases-germany), Weekly Chart de Alicia Madlangbayan del 5 de noviembre de 2026.

**Pregunta que responde:** dónde están los casos, cuáles siguen vigentes y qué explica que se agrupen ahí.

**Por qué funciona:** usa dos jerarquías de punto (grande y de color para lo vigente, pequeño y gris para lo antiguo), una zona rayada que aporta la explicación histórica y cinco rótulos con línea guía que nombran los lugares que el lector reconoce. La leyenda va arriba, en renglones, con la misma muestra que el mapa, y los países vecinos quedan en gris muy claro como contexto.

**Receta:**

1. `Plot.geo` para el fondo en gris claro y para la zona de contexto con un `pattern` SVG de rayas como relleno.
2. Dos capas de `Plot.dot`: la categoría de contexto con radio 3 y gris, la destacada con radio 6, color y borde blanco.
3. Una tabla pequeña de anotaciones (lugar, texto, `dx`, `dy`) que alimenta un `Plot.text` y un `Plot.link` o `Plot.arrow` para las líneas guía.
4. Leyenda en renglones fuera del lienzo y barra de escala calculada con la proyección.
5. A 390 px los rótulos pasan a una lista numerada bajo el mapa y en el mapa queda solo el número.

**Dificultad:** baja. **Encaje:** cabe.

### 05 · Mapa de flujos con flechas anchas

![Flechas anchas y curvas con íconos que convergen en un punto](referencias/05-mapa-flujos-flechas-anchas.png)

**Nombre en inglés:** [Flow Map](https://datavizproject.com/data-type/flow-map/). **Origen:** no determinado. El estilo corresponde a un mapa localizador de Datawrapper con íconos y flechas, funciones que el blog anunció el [11 de junio](https://www.datawrapper.de/blog/fifa-world-cup-locator-map-arrows) y el [4 de noviembre de 2026](https://www.datawrapper.de/blog/improved-icons-in-locator-maps), pero ninguna de las páginas consultadas describe este mapa.

**Pregunta que responde:** de dónde llega lo que se concentra en un lugar.

**Por qué funciona:** las flechas son anchas, grises y translúcidas, se desvanecen hacia el origen y terminan en una punta marcada, por lo que la dirección se entiende sin leyenda. Todas convergen en un punto negro, cada origen lleva un ícono dentro de un círculo blanco y un rótulo de dos renglones (qué y de dónde), y la curvatura evita que las flechas se encimen. En la captura el ancho es constante; para datos de migración ese ancho pasa a codificar el volumen del flujo.

**Receta:**

1. Elegir un destino (o un origen) en el panel de filtros y quedarse con los 8 a 12 flujos mayores; el resto se agrupa en la tabla de respaldo.
2. Primera versión con `Plot.arrow`: `x1`, `y1`, `x2`, `y2` como centroides proyectados, `bend: true`, `strokeWidth` proporcional al flujo, `strokeOpacity: 0.5` y `headLength` ajustado al ancho.
3. Versión completa con D3: curva de Bézier cuadrática entre centroides, polígono que se angosta hacia el origen, punta propia y un `linearGradient` de opacidad 0 a 0.6 en el sentido del flujo.
4. Rótulo de dos renglones en cada origen con `Plot.text` y un `Plot.dot` oscuro en el destino.
5. Globo con el flujo y el porcentaje que representa del total que llega al destino.

**Dificultad:** media con `Plot.arrow`, alta con flechas que se angostan. **Encaje:** cabe.

### 06 · Áreas superpuestas en paneles traslapados

![Gasto semanal en anuncios por estado, republicanos y demócratas](referencias/06-areas-pequenos-multiples-bloomberg.png)

**Nombre en inglés:** [Layered Area Chart](https://datavizproject.com/data-type/nested-area-chart/) en small multiples con traslape tipo ridgeline. **Origen:** Bloomberg, probablemente reseñada en el [Dispatch del 3 de noviembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge).

**Pregunta que responde:** cómo evolucionan dos series en varias unidades a la vez y en cuáles se separa una de la otra.

**Por qué funciona:** no son paneles independientes. Los siete comparten el eje de tiempo y la misma escala vertical, y cada panel invade al de arriba cuando su valor lo exige, lo que mantiene comparables las magnitudes entre estados sin gastar alto. Las dos series se superponen en lugar de apilarse, de modo que el área visible entre ambas es la brecha. El valor final se rotula junto al último punto, el eje de fechas aparece una sola vez y tres anotaciones explican los saltos.

**Receta:**

1. `Plot.areaY` y `Plot.lineY` por serie con `fy` = unidad, `fillOpacity: 0.25` y `curve: "monotone-x"`.
2. Para el traslape, fijar `y.range` con un valor que exceda la banda de la faceta (la técnica del ridgeline de Plot) y ordenar `fy` por el valor final.
3. `Plot.dot` y `Plot.text` filtrados al último punto de cada serie para el rótulo directo con valor.
4. Eje `x` solo en la primera faceta y nombre de la unidad a la izquierda con `fy: {axis: "left"}`.
5. Anotaciones desde una tabla aparte, con una línea guía corta.

**Dificultad:** media. **Encaje:** cabe.

### 07 · Enjambre de burbujas sobre un eje de razón

![Burbujas por contienda ordenadas según la razón de gasto entre partidos](referencias/07-enjambre-burbujas-nyt.png)

**Nombre en inglés:** sized beeswarm; en Data Viz Project, [Beeswarm Plot](https://datavizproject.com/data-type/beeswarm-blot/) y [Clustered Force Layout](https://datavizproject.com/data-type/clustered-force-layout/). **Origen:** The New York Times, probablemente la pieza sobre la guerra de anuncios reseñada en el [Dispatch del 3 de noviembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge).

**Pregunta que responde:** cómo se reparten muchas unidades a lo largo de una razón entre dos grupos y cuánto pesa cada una.

**Por qué funciona:** cada burbuja es una contienda, su área es el gasto y su posición vertical es la razón de gasto entre partidos, con «Even» al centro. Los extremos se recortan en «2x or more», por lo que los casos fuera de rango se amontonan en el borde sin estirar la escala. El color indica quién ganó ahí la vez anterior, el gris marca las contiendas reñidas y solo las burbujas grandes llevan nombre.

**Receta:**

1. `Plot.dot` con `Plot.dodgeX({anchor: "middle", padding: 1}, {y: razón, r: población})`; la transformación acepta `r` como canal y coloca primero las burbujas mayores.
2. Escala `y` logarítmica para la razón (0.5 a 2), con los valores recortados al dominio y los extremos rotulados como «el doble o más».
3. `Plot.ruleY` en 1 y líneas punteadas en 1.5 y 2, con los rótulos fuera del lienzo.
4. `Plot.text` con la misma transformación y un filtro por radio para nombrar solo las burbujas grandes.
5. Si el acomodo de `dodge` queda disparejo, calcular posiciones con `d3-force` (`forceY` hacia la escala, `forceX` al centro, `forceCollide` con el radio) corriendo 200 pasos antes de dibujar, sin animar.

**Dificultad:** baja con `dodge`, media con `d3-force`. **Encaje:** cabe.

### 08 · Histograma de unidades pictóricas

![Tazas apiladas por precio con la mediana marcada](referencias/08-histograma-pictorico-tazas.png)

**Nombre en inglés:** unit histogram; en Data Viz Project, [Pictorial Unit Chart](https://datavizproject.com/data-type/pictorial-unit-chart/) combinado con [Histogram](https://datavizproject.com/data-type/histogram/). **Origen:** «El cens del tallat», de Domestic Data Streamers y Cedra, reseñado en el [Dispatch del 27 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices).

**Pregunta que responde:** cómo se distribuye un valor entre casos individuales y dónde cae la mitad.

**Por qué funciona:** cada taza es un bar (836 precios), así que la altura de cada pila es un conteo que se puede verificar a ojo. La mediana va en un cartel clavado sobre la barra de 1.70 euros, el texto la traduce a lenguaje llano («la mitad cobra 1.70 o menos») y el lector marca antes su propia apuesta. La pieza original avanza por scroll; aquí la mediana y el texto quedan fijos.

**Receta:**

1. Redondear el valor al ancho de clase en el data loader y expandir cada caso (o cada N casos) a una unidad.
2. `Plot.dot` o `Plot.image` con `Plot.stackY` sobre `x` = clase, para que las unidades se apilen desde la base.
3. `Plot.ruleX` en la mediana ponderada y un `Plot.text` con marco para el cartel.
4. Globo por columna con `Plot.pointerX`: clase, número de casos y población que representan.
5. Con más de unas 1,500 unidades, subir el tamaño de la unidad («cada figura = 10 municipios») antes que encoger el ícono.

**Dificultad:** media con ícono, baja con puntos. **Encaje:** cabe con adaptación, sin la narración por pasos.

### 09 · Escalones de percentil por grupo

![Percentil de un patrimonio dado en cada grupo de edad](referencias/09-percentil-escalones-flowingdata.png)

**Nombre en inglés:** sin equivalente directo; lo más cercano en Data Viz Project es [Stepped Line Graph](https://datavizproject.com/data-type/stepped-line-graph/) y [Column Range](https://datavizproject.com/data-type/column-range/). **Origen:** «Rising to top net worth, by age», de FlowingData, reseñado en el [Dispatch del 27 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices).

**Pregunta que responde:** un mismo valor, en qué lugar de la distribución deja a una persona según el grupo con el que se compare.

**Por qué funciona:** el lector fija un valor con el deslizador y la gráfica devuelve seis posiciones, una por grupo de edad, con una figura humana parada en su percentil (39 entre los de 20 a 29 años, 10 entre los de 70 o más). La caja sobre cada figura tiene alto fijo y solo sirve de marco; lo que se lee es el escalón. Una frase generada con el valor elegido acompaña la gráfica.

**Receta:**

1. Calcular en el data loader, con factor de expansión, los percentiles 1 a 99 del indicador para cada grupo.
2. Con el valor de `Inputs.range`, buscar el percentil de cada grupo con `d3.bisect`.
3. `Plot.tickY` grueso en el percentil, `Plot.rect` de alto fijo encima y `Plot.image` con la figura apoyada en la marca.
4. Eje `y` de percentiles con marcas en 25, 50 y 75, y el número bajo cada escalón con `Plot.text`.
5. Frase generada bajo el panel de filtros y globo con el percentil y las personas del grupo que quedan por debajo.

**Dificultad:** media; el trabajo está en la tabla de percentiles. **Encaje:** cabe.

### 10 · Aluvial entre dos cortes

![Cobertura del suelo en 1990 y 2018 con las transiciones entre categorías](referencias/10-aluvial-cobertura-suelo-reuters.png)

**Nombre en inglés:** [Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/). **Origen:** Reuters, probablemente la pieza sobre el campo europeo y los incendios reseñada en el [Dispatch del 27 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices).

**Pregunta que responde:** qué parte de cada categoría se convirtió en otra entre dos momentos.

**Por qué funciona:** el tiempo baja de 1990 a 2018, cada cinta cambia gradualmente del color de origen al de destino y el porcentaje de cada categoría se rotula en ambos extremos. Una sola anotación, con palabras en el color de la categoría, dice el hallazgo. La ilustración superior tiene el ancho repartido igual que las categorías, así que funciona como leyenda. El fondo oscuro de la captura se sustituye por fondo claro.

**Receta:**

1. Preparar la matriz de transición (categoría inicial × categoría final) en el data loader.
2. `d3-sankey` con dos columnas de nodos; para la lectura vertical se intercambian `x` e `y` al dibujar.
3. Cada cinta lleva un `linearGradient` del color de origen al de destino y opacidad entre 0.45 y 0.6 sobre fondo claro.
4. Porcentajes en ambos extremos con texto en el color de la categoría, verificando contraste de 4.5:1.
5. Una anotación con línea guía sobre la transición principal y el resto en la tabla de respaldo.

**Dificultad:** media. **Encaje:** cabe con adaptación. Exige que las mismas unidades se observen en los dos cortes; con dos levantamientos independientes corresponde la forma de la ficha 16.

### 11 · Anomalías con líneas de nivel

![Anomalías de precipitación por país con los años extremos resaltados](referencias/11-crestas-anomalias-lluvia.png)

**Nombre en inglés:** sin nombre asentado; es pariente del [Horizon chart](https://xeno.graphics/horizon-chart/) y del [Contour Plot](https://datavizproject.com/data-type/contour-plot/). **Origen:** notas de campo del Pacífico de Polina Korneeva, reseñadas en el [Dispatch del 20 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps).

**Pregunta que responde:** cuánto se aparta cada año de lo normal en cada unidad y cuál fue el extremo de cada una.

**Por qué funciona:** no es un ridgeline. Cada renglón es un país con su línea base, y cada línea apilada representa 5 mm de anomalía, hacia arriba si llovió de más y hacia abajo si llovió de menos; la magnitud se lee dos veces, por la altura y por el número de líneas. Solo el año más húmedo y el más seco de cada país llevan relleno azul y cifra, y los países se ordenan por su anomalía mayor. Un recuadro «How to read» enseña la codificación con un ejemplo.

**Receta:**

1. Para cada nivel `L` (un paso, dos pasos, tres pasos), generar la serie `clamp(valor, −L, L)` por unidad.
2. `Plot.line` con `z` = nivel, `fy` = unidad, `curve: "basis"` y trazo fino en tinta.
3. `Plot.areaY` en el color de acento solo en la ventana del máximo y del mínimo, con `Plot.text` para la cifra.
4. Ordenar `fy` por la anomalía absoluta mayor y repetir el eje de años arriba y abajo.
5. Dibujar el recuadro «cómo leer» como una gráfica pequeña aparte, con el mismo código y un dato de ejemplo.

**Dificultad:** media. **Encaje:** cabe.

### 12 · Multitud ilustrada con fracción sólida

![Multitud de policías donde el 71 por ciento aparece en tinta plena](referencias/12-multitud-ilustrada-71pct-reuters.png)

**Nombre en inglés:** [Pictorial Fraction Chart](https://datavizproject.com/data-type/fraction-of-pictograms/) o [Pictorial Percentage Chart](https://datavizproject.com/data-type/pictorial-fraction-chart/) en disposición de multitud. **Origen:** Reuters, sobre la actuación policial en las protestas de India, reseñada en el [Dispatch del 20 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps).

**Pregunta que responde:** qué parte de un grupo comparte una opinión o condición.

**Por qué funciona:** el porcentaje se vuelve gente. La multitud está dibujada con las figuras propias del tema, la parte que cumple la condición va en tinta plena y el resto se desvanece, y una sola anotación con flecha dice la cifra y lo que significa. No hay ejes ni leyenda.

**Receta:**

1. Generar una vez, con semilla fija, las posiciones de 100 figuras (muestreo de Poisson dentro de una elipse) y ordenarlas por `y` para que las de adelante tapen a las de atrás.
2. Dibujar con `Plot.image` y tres a cinco siluetas SVG; las primeras `k` por posición horizontal van en tinta plena y el resto con opacidad 0.25.
3. Anotación con `Plot.text` y `Plot.arrow` con `bend`.
4. Globo sobre cada mitad con el porcentaje y las personas que representa.
5. En pequeños múltiples por grupo (sexo, lengua), bajar a 50 figuras por panel.

**Dificultad:** media. **Encaje:** cabe. El waffle de figuras de 10 × 10 es la versión de dificultad baja.

### 13 · Mapa de relieve sombreado

![Relieve de Japón con sombras proyectadas](referencias/13-mapa-relieve-japon.png)

**Nombre en inglés:** shaded relief map; en Data Viz Project, [Topographic Map](https://datavizproject.com/data-type/topographic-map/). **Origen:** Markku Ylisirniö, reseñado en el [Dispatch del 20 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps).

**Pregunta que responde:** ninguna estadística; muestra el terreno. Sirve de contexto cuando la geografía explica el dato (sierras, costas, aislamiento).

**Por qué funciona:** el sombreado y la sombra proyectada sobre el mar dan volumen sin 3D real, la paleta es de dos tonos naturales y los rótulos son pocos y pequeños.

**Receta:**

1. Generar fuera del sitio un sombreado (hillshade) a partir de un modelo digital de elevación y exportarlo en tonos claros como PNG o WebP, con su caja de coordenadas.
2. Colocarlo como imagen de fondo bajo las capas de `Plot.geo`, con la misma proyección y el mismo encuadre.
3. Dibujar encima los datos (puntos, flujos o contornos) con relleno translúcido para que el relieve se alcance a ver.
4. Verificar el contraste de los rótulos sobre la parte más oscura del sombreado.

**Dificultad:** media, por la alineación del ráster con la proyección. **Encaje:** cabe solo como fondo; por sí mismo no informa nada del tema.

### 14 · Pirámide de población como superficie 3D

![Superficie tridimensional de población por edad y año para Brasil](referencias/14-piramide-3d-superficie.png)

**Nombre en inglés:** 3D surface plot; en Data Viz Project lo más cercano es [Waterfall Plot](https://datavizproject.com/data-type/waterfall-plot/) y [Population Pyramid](https://datavizproject.com/data-type/population-pyramid-2/). **Origen:** la herramienta «Pyramid Scheme», reseñada por FlowingData y recogida en el [Dispatch del 13 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-13-2026-false-election-claims-a-total-blackout-and-bananas).

**Pregunta que responde:** cómo cambia la estructura por edad de una población a lo largo de 150 años.

**Por qué funciona:** junta en una sola figura lo que normalmente requiere una animación. La edad va en un eje, el año en otro y la población en la altura, el color recorre el tiempo y una línea roja marca el año elegido. No cabe en el estilo de la casa: es 3D con WebGL, sobre fondo oscuro y con reproducción en bucle.

**Versión 2D que conserva la idea:**

1. Mapa de calor con `Plot.cell` o `Plot.raster`: `x` = año, `y` = edad, color = población o porcentaje, con rampa de un solo tono y dominio fijo.
2. `Plot.ruleX` en el año elegido en el panel de filtros y, a un lado, el perfil por edad de ese año como barras horizontales.
3. Si se busca el efecto de relieve, dibujar los perfiles por edad de cada corte como líneas desplazadas (`Plot.areaY` con relleno del color del fondo y la opción `line`, disponible desde la versión 0.6.18 de Plot; en versiones anteriores, un `Plot.lineY` encima), del más antiguo al más reciente, con el último en color de acento.

**Dificultad:** baja para el mapa de calor, media para las líneas desplazadas. **Encaje:** no cabe; se usa la versión 2D.

### 15 · Multitud 3D de personas encuestadas

![Escena tridimensional donde cada figura es una persona encuestada](referencias/15-multitud-3d-pudding.png)

**Nombre en inglés:** 3D unit visualization; en Data Viz Project, [Pictorial Unit Chart](https://datavizproject.com/data-type/pictorial-unit-chart/). **Origen:** The Pudding, probablemente «Life after death?», reseñada en el [Dispatch del 6 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting).

**Pregunta que responde:** quiénes son, uno por uno, las personas detrás de un porcentaje de encuesta.

**Por qué funciona:** cada figura es una persona encuestada, con su edad, sexo, estado civil y respuesta en una ficha, y el color separa las respuestas. El lector recorre la multitud y los paneles resumen lo que ve. No cabe por cuatro razones: es 3D real, el fondo es oscuro, la paleta es morada y la historia avanza por scroll.

**Versión 2D que conserva la idea:**

1. Tomar el recuadro lateral de la propia captura: `Plot.dot` con `Plot.dodgeX`, `fx` = respuesta, `y` = edad y un punto por persona encuestada.
2. Con factor de expansión, redondear a figuras equivalentes («cada punto = 1,000 personas») y declararlo en el pie.
3. Color por respuesta con la paleta validada de la casa y la barra apilada de resumen encima.
4. Globo con la respuesta, el grupo, el porcentaje y la población.

**Dificultad:** baja. **Encaje:** no cabe; se usa la versión 2D.

### 16 · Barras apiladas unidas por flujos

![Escaños por partido en ocho elecciones, unidos por cintas](referencias/16-barras-apiladas-con-flujos-economist.png)

**Nombre en inglés:** stacked bars with flows; combina [Stacked Bar Chart](https://datavizproject.com/data-type/stacked-bar-chart/) y [Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/), y es cercano al [Stacked bump chart](https://xeno.graphics/stacked-bump-chart/). **Origen:** The Economist; el [Dispatch del 6 de octubre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting) la describe como un aluvial de los cambios de partido en el parlamento israelí dentro de una pieza de scrollytelling.

**Pregunta que responde:** cómo se recompone un total fijo entre varios cortes y de dónde viene cada bloque.

**Por qué funciona:** cada renglón es una elección con el mismo total (120 escaños), por lo que se lee como barra apilada normal, con su eje arriba y abajo. Las cintas entre renglones muestran fusiones, escisiones y crecimientos sin necesidad de un segundo gráfico. Los nombres van dentro de los segmentos, el color agrupa por bloque ideológico y un selector lleva a un partido concreto.

**Receta:**

1. `Plot.barX` con `Plot.stackX` y `fy` o `y` = corte; `offset: "normalize"` cuando lo que interesa es el reparto.
2. Recuperar la escala con `plot.scale("x")` y añadir una capa SVG con las cintas: para cada categoría, un camino que une su tramo en el corte superior con su tramo en el inferior, con curvas verticales (`d3.area` con `curveBumpY`) y opacidad 0.35.
3. Con dos levantamientos independientes, la cinta une la misma categoría y solo muestra cuánto creció o se encogió; con datos de transición reales, las cintas se dividen como en un aluvial con `d3-sankey`.
4. Rótulos dentro del segmento cuando el ancho supera unos 48 px; el resto se lee en el globo.
5. El selector «saltar a» pasa al panel de filtros y destaca una categoría dejando las demás al 25 por ciento de opacidad.

**Dificultad:** media. **Encaje:** cabe.

### 17 · Multitud de unidades con subgrupo resaltado

![1,453 figuras humanas con 112 resaltadas en tinta oscura](referencias/17-multitud-unidades-reuters.png)

**Nombre en inglés:** [Pictorial Unit Chart](https://datavizproject.com/data-type/pictorial-unit-chart/) o [Icon Count](https://datavizproject.com/data-type/icon-count/); en la tradición isotype, una multitud de unidades. **Origen:** «Finding closure», de Reuters, sobre la identificación por ADN en Nepal, reseñada en el [Dispatch del 29 de septiembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-september-29-2026-marine-heatwaves-interactive-maps-and-the-wnba).

**Pregunta que responde:** de un total de personas, cuántas están en una situación particular.

**Por qué funciona:** cada figura es una persona (1,453 en total). Las 112 identificadas se separan en su propio grupo y van en tinta oscura; las 1,341 restantes quedan en un tono claro del mismo color. El total se escribe en un hueco dentro de la multitud y cada grupo lleva su cifra grande con una flecha curva. Las siluetas varían de postura, lo que evita que se lea como una trama.

**Receta:**

1. Decidir el tamaño de la unidad para que queden entre 600 y 1,500 figuras, con valores redondos (1, 2 o 5 por una potencia de 10), y escribirlo en el pie.
2. Calcular posiciones en el data loader con `d3-force` (`forceCollide` más `forceX` y `forceY` hacia el centro de cada grupo) o con muestreo de Poisson en elipses de área proporcional al conteo; guardar el resultado para que la multitud no cambie entre cargas.
3. Dibujar con `<use>` de cuatro a seis siluetas SVG (o `Plot.image`); por encima de unas 1,500 figuras se pasa a canvas.
4. Subgrupo en tinta oscura o acento, resto en tono claro del mismo matiz, cifras grandes con `Plot.arrow` curvo.
5. Las figuras llevan `aria-hidden` y la figura completa un `aria-label` con las cifras; el globo por grupo da porcentaje y personas.

**Dificultad:** media. **Encaje:** cabe.

### 18 · Mapa 3D extruido con altura y color redundantes

![Europa extruida según la anomalía diaria de temperatura](referencias/18-mapa-3d-anomalia-europa.png)

**Nombre en inglés:** extruded surface map; en Data Viz Project lo más cercano es [Isoline Map](https://datavizproject.com/data-type/isoline-map/) y [Bar Chart on a Map](https://datavizproject.com/data-type/map-bar-chart/). **Origen:** Milos Popovic, un mapa por día de la anomalía de agosto, reseñado en el [Dispatch del 29 de septiembre de 2026](https://www.datawrapper.de/blog/data-vis-dispatch-september-29-2026-marine-heatwaves-interactive-maps-and-the-wnba).

**Pregunta que responde:** dónde y cuánto se aparta un valor de lo normal en un día dado.

**Por qué funciona:** la altura y el color codifican la misma anomalía con signo («lo cálido sube, lo frío se hunde»), y el propio pie aclara que no es elevación del terreno. A la izquierda, una tira de barras muestra la media de cada día con el día elegido marcado, y la rampa divergente va de azul a naranja con el cero en blanco. La figura es un render por trazado de rayos, por lo que no cabe como gráfica interactiva del sitio.

**Versión 2D que conserva la idea:**

1. `Plot.geo` con el contorno en gris claro y `Plot.spike` sobre los centroides (`Plot.geoCentroid`), con `length` = valor.
2. El mismo valor en `stroke` y `fill` con rampa de dominio fijo, para conservar la doble codificación de la referencia.
3. Para valores con signo, picos hacia arriba y hacia abajo con rampa divergente anclada en el valor de referencia.
4. Tira de barras con la serie resumida y el corte elegido marcado, encima del mapa.
5. Leyenda de longitud del pico (tres tamaños de ejemplo) fuera del lienzo.

**Dificultad:** baja. **Encaje:** no cabe tal cual; el mapa de picos cabe sin restricciones. Los picos pequeños se pierden, por lo que la forma conviene cuando importan los valores altos.

## 3. Data Viz Project: 166 tipos clasificados por función

[Data Viz Project](https://datavizproject.com/) es el índice de tipos de gráfica de la agencia Ferdio. Al 16 de noviembre de 2026 lista 166 tipos, cada uno con una página de ejemplos y con etiquetas de familia (Chart, Diagram, Geospatial, Plot, Table), función (comparison, concept visualisation, correlation, distribution, geographical data, part to whole, trend over time), forma y tipo de datos de entrada. El sitio asigna varias funciones a un mismo tipo; en la lista siguiente cada tipo aparece una sola vez, en la función para la que más se usa con datos de encuestas y censos, y por eso el reparto no coincide con los filtros del sitio. Los nombres se dejan en inglés, tal como aparecen en el índice, y las direcciones son las del propio sitio, incluidas sus erratas.

La estrella (★) marca 33 tipos que resultan novedosos frente a lo que ya se usa en los tableros y que son aprovechables con datos sociales: unidades e isotipos, proporciones, flujos origen-destino, brechas, cambio entre dos cortes, distribución de municipios y mapas que no son coropletas.

### Comparación de magnitudes (39)

[Bar Chart (Vertical)](https://datavizproject.com/data-type/bar-chart/) · [Bar Chart (Horizontal)](https://datavizproject.com/data-type/bar-chart-horizontal/) · [Grouped Bar Chart](https://datavizproject.com/data-type/grouped-bar-chart/) · [Radial Bar Chart](https://datavizproject.com/data-type/circular-bar-chart/) · [Triangle Bar Chart](https://datavizproject.com/data-type/triangle-bar-chart/) · [Curved Bar Chart](https://datavizproject.com/data-type/curved-bar-chart/) · [Multiple Series 3D Bar Chart](https://datavizproject.com/data-type/3d-bar-chart/) · ★ [Pictorial Bar Chart](https://datavizproject.com/data-type/pictorial-bar-chart/) · ★ [Pictorial Unit Chart](https://datavizproject.com/data-type/pictorial-unit-chart/) · ★ [Icon Count](https://datavizproject.com/data-type/icon-count/) · [Tally Chart](https://datavizproject.com/data-type/tally-chart/) · [Proportional Area Chart (Square)](https://datavizproject.com/data-type/proportional-area-chart/) · [Proportional Area Chart (Circle)](https://datavizproject.com/data-type/proportional-area-chart-circle/) · [Proportional Area Chart (Half Circle)](https://datavizproject.com/data-type/proportional-area-chart-half-circle/) · ★ [Proportional Area Chart (Icon)](https://datavizproject.com/data-type/proportional-area-chart-icon/) · [Nested Proportional Area Chart](https://datavizproject.com/data-type/layered-proportional-area-chart/) · [Lollipop Chart](https://datavizproject.com/data-type/lollipop-chart/) · [Dot Chart](https://datavizproject.com/data-type/dot-chart/) · [Dot Plot](https://datavizproject.com/data-type/dot-plot/) · ★ [Dumbbell Plot](https://datavizproject.com/data-type/dumbbell-plot/) · ★ [Span Chart](https://datavizproject.com/data-type/span-chart/) · [Column Range](https://datavizproject.com/data-type/column-range/) · [Bullet Graph](https://datavizproject.com/data-type/bullet-graph/) · ★ [Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) · [Population Pyramid](https://datavizproject.com/data-type/population-pyramid-2/) · [Radar Diagram](https://datavizproject.com/data-type/radar-diagram/) · [Polar Chart](https://datavizproject.com/data-type/polar-chart/) · [Polar Area Chart](https://datavizproject.com/data-type/polar-area-chart/) · [Pareto Chart](https://datavizproject.com/data-type/pareto-chart/) · [Waterfall Chart](https://datavizproject.com/data-type/waterfall-chart/) · [Error Bars](https://datavizproject.com/data-type/error-bars/) · [Table Chart](https://datavizproject.com/data-type/table-chart/) · [Comparison Chart](https://datavizproject.com/data-type/comparison-chart/) · [Scaled-up Number](https://datavizproject.com/data-type/number/) · [Icon and Number](https://datavizproject.com/data-type/scaled-up-number-with-icon/) · [Angular Gauge](https://datavizproject.com/data-type/angular-gauge-chart/) · [Solid Gauge Chart](https://datavizproject.com/data-type/angular-index-gauge/) · [Word Cloud](https://datavizproject.com/data-type/tag-cloud/) · [Chernoff Faces](https://datavizproject.com/data-type/chernoff-faces/)

### Distribución (17)

[Histogram](https://datavizproject.com/data-type/histogram/) · [Radial Histogram](https://datavizproject.com/data-type/radical-histogram/) · [Spiral Histogram](https://datavizproject.com/data-type/spiral-histogram/) · [Hanging Rootogram](https://datavizproject.com/data-type/rootogram/) · [Boxplot](https://datavizproject.com/data-type/box-plot/) · [Violin Plot](https://datavizproject.com/data-type/violin-plot/) · ★ [Beeswarm Plot](https://datavizproject.com/data-type/beeswarm-blot/) · [Jitter Plot](https://datavizproject.com/data-type/jitter-plot/) · ★ [Strip Plot](https://datavizproject.com/data-type/strip-plot/) · [Counts Plot](https://datavizproject.com/data-type/counts-plot/) · [Bagplot](https://datavizproject.com/data-type/bagplot/) · [Hexagonal Binning](https://datavizproject.com/data-type/hexagonal-binning/) · [Contour Plot](https://datavizproject.com/data-type/contour-plot/) · [Cluster Analysis](https://datavizproject.com/data-type/cluster-analysis/) · ★ [Clustered Force Layout](https://datavizproject.com/data-type/clustered-force-layout/) · [Range Area Chart](https://datavizproject.com/data-type/range-area-chart/) · ★ [Waterfall Plot](https://datavizproject.com/data-type/waterfall-plot/)

### Parte-todo (15)

[Pie Chart](https://datavizproject.com/data-type/pie-chart/) · [Donut Chart](https://datavizproject.com/data-type/donut-chart/) · [Semi Circle Donut Chart](https://datavizproject.com/data-type/semi-circle-donut-chart/) · [Multi-level Donut Chart](https://datavizproject.com/data-type/multi-level-donut-chart/) · [Multi-level Pie Chart](https://datavizproject.com/data-type/multilevel-pie-chart/) · [Stacked Bar Chart](https://datavizproject.com/data-type/stacked-bar-chart/) · ★ [Marimekko Chart](https://datavizproject.com/data-type/marimekko-chart/) · ★ [Waffle Chart](https://datavizproject.com/data-type/percentage-grid/) · ★ [Pictorial Percentage Chart](https://datavizproject.com/data-type/pictorial-fraction-chart/) · ★ [Pictorial Fraction Chart](https://datavizproject.com/data-type/fraction-of-pictograms/) · ★ [Pictorial Stacked Chart](https://datavizproject.com/data-type/pictorial-stacked-chart/) · [Progress Bar](https://datavizproject.com/data-type/progress-bar/) · [Funnel Chart](https://datavizproject.com/data-type/funnel-chart/) · [Pyramid Chart](https://datavizproject.com/data-type/pyramid-chart/) · [Compound Bubble and Pie Chart](https://datavizproject.com/data-type/compound-bubble-and-pie-chart/)

### Flujo y conexión (10)

★ [Sankey Diagram](https://datavizproject.com/data-type/sankey-diagram/) · ★ [Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/) · ★ [Parallel Sets](https://datavizproject.com/data-type/parallel-sets/) · ★ [Chord Diagram](https://datavizproject.com/data-type/chord-diagram/) · [Non-ribbon Chord Diagram](https://datavizproject.com/data-type/non-ribbon-chord-diagram/) · ★ [Arc Diagram](https://datavizproject.com/data-type/arc-diagram/) · [Network Visualisation](https://datavizproject.com/data-type/network-visualisation/) · [Sociogram](https://datavizproject.com/data-type/sociogram/) · [Hive Plot](https://datavizproject.com/data-type/hive-plot/) · [Radial Convergences](https://datavizproject.com/data-type/radial-convergences/)

### Relación entre variables (18)

[Scatter Plot](https://datavizproject.com/data-type/scatter-plot/) · ★ [Connected Scatter Plot](https://datavizproject.com/data-type/connected-scatter-plot/) · [Bubble Chart](https://datavizproject.com/data-type/bubble-chart/) · [Circular Bubble Chart](https://datavizproject.com/data-type/circular-bubble-chart/) · [3D Scatter Plot](https://datavizproject.com/data-type/3d-scatterplot/) · [Trendline](https://datavizproject.com/data-type/trendline/) · [Heat Map](https://datavizproject.com/data-type/heat-map/) · [Bubble-based Heat Map](https://datavizproject.com/data-type/bubble-based-heat-map/) · [Circular Heat Map](https://datavizproject.com/data-type/radial-heatmap/) · [Spiral Heat Map](https://datavizproject.com/data-type/spiral-heat-map/) · ★ [Ternary Plot](https://datavizproject.com/data-type/ternary-plot/) · [Ternary Contour Plot](https://datavizproject.com/data-type/ternary-contour-plot/) · [Parallel Coordinates](https://datavizproject.com/data-type/parallel-coordinates/) · [Taylor Diagram](https://datavizproject.com/data-type/taylor-diagram/) · [Nomogram](https://datavizproject.com/data-type/nomogram/) · [Phase Diagram](https://datavizproject.com/data-type/phase-diagram/) · [Venn Diagram](https://datavizproject.com/data-type/venn-diagram/) · [Euler Diagram](https://datavizproject.com/data-type/euler-diagram/)

### Cambio en el tiempo (27)

[Line Graph](https://datavizproject.com/data-type/line-chart/) · [Spline Graph](https://datavizproject.com/data-type/spline-graph/) · [Stepped Line Graph](https://datavizproject.com/data-type/stepped-line-graph/) · [Area Chart](https://datavizproject.com/data-type/area-chart/) · [Stacked Area Chart](https://datavizproject.com/data-type/stacked-area-chart/) · [Stacked Ordered Area Chart](https://datavizproject.com/data-type/stacked-ordered-area-chart/) · ★ [Layered Area Chart](https://datavizproject.com/data-type/nested-area-chart/) · [Stream Graph](https://datavizproject.com/data-type/stream-graph/) · [Sorted Stream Graph](https://datavizproject.com/data-type/sorted-stream-graph/) · [3D Stream Graph](https://datavizproject.com/data-type/three-dimensional-stream-graph/) · [Radial Line Graph](https://datavizproject.com/data-type/radical-line-graph/) · [Radial Area Chart](https://datavizproject.com/data-type/radial-area-chart/) · ★ [Slope Chart](https://datavizproject.com/data-type/slope-chart/) · ★ [Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) · [Sparkline](https://datavizproject.com/data-type/sparkline/) · [Column Sparkline](https://datavizproject.com/data-type/column-sparkline/) · [Win-loss Sparkline](https://datavizproject.com/data-type/win-loss-sparkline/) · [Fan Chart (Time Series)](https://datavizproject.com/data-type/fan-chart-time-series/) · [Candlestick Chart](https://datavizproject.com/data-type/candlestick-chart/) · [Kagi Chart](https://datavizproject.com/data-type/kagi-chart/) · [Renko Chart](https://datavizproject.com/data-type/renko-chart/) · [Control Chart](https://datavizproject.com/data-type/control-chart/) · [Timeline](https://datavizproject.com/data-type/timeline/) · [Scaled Timeline](https://datavizproject.com/data-type/scaled-timeline/) · [Bubble Timeline](https://datavizproject.com/data-type/bubble-timeline/) · [Gantt Chart](https://datavizproject.com/data-type/gannt-chart/) · [Development and Causes](https://datavizproject.com/data-type/development-causes/)

### Espacial (14)

[Choropleth Map](https://datavizproject.com/data-type/choropleth-map-2/) · ★ [Bubble Map](https://datavizproject.com/data-type/bubble-map-chart/) · ★ [Dot Density Map](https://datavizproject.com/data-type/dot-density-map/) · ★ [Flow Map](https://datavizproject.com/data-type/flow-map/) · ★ [Connection Map](https://datavizproject.com/data-type/connection-map/) · ★ [Cartogram](https://datavizproject.com/data-type/cartogram/) · ★ [Bar Chart on a Map](https://datavizproject.com/data-type/map-bar-chart/) · [Pie Chart on a Map](https://datavizproject.com/data-type/pie-chart-map/) · [Pin Map](https://datavizproject.com/data-type/pin-map/) · [Isoline Map](https://datavizproject.com/data-type/isoline-map/) · [Topographic Map](https://datavizproject.com/data-type/topographic-map/) · [Profile Map](https://datavizproject.com/data-type/profile-map/) · [Route Map](https://datavizproject.com/data-type/route-map/) · [Transit Map](https://datavizproject.com/data-type/transit-map/)

### Jerarquía (10)

[Treemap](https://datavizproject.com/data-type/treemap/) · [Convex Treemap](https://datavizproject.com/data-type/convex-treemap/) · [Sunburst Diagram](https://datavizproject.com/data-type/sunburst-diagram/) · [Icicle Diagram](https://datavizproject.com/data-type/partition-layer-chart/) · ★ [Packed Circle Chart](https://datavizproject.com/data-type/packed-circle-chart/) · [Dendrogram](https://datavizproject.com/data-type/dendrogram/) · [Hyperbolic Tree](https://datavizproject.com/data-type/hyperbolic-tree/) · [Organisational Chart](https://datavizproject.com/data-type/organisational-chart/) · [Fan Chart (Genealogy)](https://datavizproject.com/data-type/fan-chart-geneaology/) · [Mind Map](https://datavizproject.com/data-type/mind-map/)

### Concepto y proceso (sin datos cuantitativos) (16)

[Exploded View Drawing](https://datavizproject.com/data-type/exploded-view-drawing/) · [Illustration Diagram](https://datavizproject.com/data-type/illustration-explanation/) · [Step by Step Illustration](https://datavizproject.com/data-type/step-step-illustration/) · [Flow Chart](https://datavizproject.com/data-type/flow-chart/) · [Swimlane Flow Chart](https://datavizproject.com/data-type/swimlane-flow-chart/) · [Linear Process Diagram](https://datavizproject.com/data-type/linear-process-diagram/) · [Process Diagram](https://datavizproject.com/data-type/process-diagram-circle/) · [Cycle Diagram](https://datavizproject.com/data-type/cycle-diagram/) · [Fishbone Diagram](https://datavizproject.com/data-type/fishbone-diagram/) · [SWOT Analysis](https://datavizproject.com/data-type/swot-analysis/) · [Target Diagram](https://datavizproject.com/data-type/target-diagram/) · [Pyramid Diagram](https://datavizproject.com/data-type/pyramid-diagram/) · [Opposite Diagram](https://datavizproject.com/data-type/2x2-matrix/) · [Matrix Diagram](https://datavizproject.com/data-type/matrix-diagram/) · [Matrix Diagram (Roof Shaped)](https://datavizproject.com/data-type/matrix-diagramroof-shaped/) · [Matrix Diagram (Y-Shaped)](https://datavizproject.com/data-type/matrix-diagram-y-shaped/)

### Los 33 tipos marcados y para qué sirven

| Tipo | Grupo | Uso con encuestas y censos |
|---|---|---|
| [Pictorial Unit Chart](https://datavizproject.com/data-type/pictorial-unit-chart/) | Unidades | Cada figura equivale a N personas; base de las fichas 08, 15 y 17 |
| [Icon Count](https://datavizproject.com/data-type/icon-count/) | Unidades | Conteos pequeños donde cada caso importa (municipios, planteles) |
| [Pictorial Bar Chart](https://datavizproject.com/data-type/pictorial-bar-chart/) | Unidades | Barras formadas por un objeto del tema; ficha 03 |
| [Pictorial Stacked Chart](https://datavizproject.com/data-type/pictorial-stacked-chart/) | Unidades | Composición dentro de una silueta |
| [Pictorial Fraction Chart](https://datavizproject.com/data-type/fraction-of-pictograms/) | Proporciones | «k de cada 10» con figuras; ficha 12 |
| [Pictorial Percentage Chart](https://datavizproject.com/data-type/pictorial-fraction-chart/) | Proporciones | Un porcentaje como relleno parcial de una figura |
| [Proportional Area Chart (Icon)](https://datavizproject.com/data-type/proportional-area-chart-icon/) | Unidades | Dos o tres magnitudes muy desiguales |
| [Waffle Chart](https://datavizproject.com/data-type/percentage-grid/) | Proporciones | Porcentaje sobre una rejilla de 100; marca nativa de Plot |
| [Dumbbell Plot](https://datavizproject.com/data-type/dumbbell-plot/) | Brechas | Distancia entre dos grupos por categoría |
| [Span Chart](https://datavizproject.com/data-type/span-chart/) | Brechas | Rango entre el mínimo y el máximo municipal de cada entidad |
| [Butterfly Chart](https://datavizproject.com/data-type/butterfly-chart/) | Brechas | Dos grupos espejo sobre las mismas categorías (causas por sexo) |
| [Slope Chart](https://datavizproject.com/data-type/slope-chart/) | Dos cortes | Cambio 2020 a 2025 por entidad con una destacada |
| [Bump Chart](https://datavizproject.com/data-type/bump-chart-2/) | Dos cortes | Cambio de posición en un ranking entre levantamientos |
| [Connected Scatter Plot](https://datavizproject.com/data-type/connected-scatter-plot/) | Dos cortes | Trayectoria de una entidad en dos indicadores a la vez |
| [Sankey Diagram](https://datavizproject.com/data-type/sankey-diagram/) | Flujos | Volúmenes de origen a destino con anchos proporcionales |
| [Alluvial Diagram](https://datavizproject.com/data-type/alluvial-diagram/) | Flujos | Transiciones de categoría entre dos momentos; ficha 10 |
| [Parallel Sets](https://datavizproject.com/data-type/parallel-sets/) | Flujos | Cruce de tres o más variables categóricas (sexo, lengua, causa) |
| [Chord Diagram](https://datavizproject.com/data-type/chord-diagram/) | Flujos | Matriz origen-destino completa entre regiones, con ida y vuelta |
| [Arc Diagram](https://datavizproject.com/data-type/arc-diagram/) | Flujos | Flujos entre entidades ordenadas en una línea |
| [Flow Map](https://datavizproject.com/data-type/flow-map/) | Flujos y mapa | Flujos sobre el territorio; ficha 05 |
| [Connection Map](https://datavizproject.com/data-type/connection-map/) | Flujos y mapa | Vínculos entre lugares sin magnitud, o con la magnitud en la opacidad |
| [Beeswarm Plot](https://datavizproject.com/data-type/beeswarm-blot/) | Distribución | Cada punto un municipio a lo largo de un indicador; ficha 07 |
| [Strip Plot](https://datavizproject.com/data-type/strip-plot/) | Distribución | Municipios como marcas finas por entidad, con uno destacado |
| [Clustered Force Layout](https://datavizproject.com/data-type/clustered-force-layout/) | Distribución | Burbujas agrupadas por categoría con tamaño de población |
| [Ternary Plot](https://datavizproject.com/data-type/ternary-plot/) | Composición | Municipios según tres partes que suman 100 (por violencia, otra causa, sin movilidad) |
| [Packed Circle Chart](https://datavizproject.com/data-type/packed-circle-chart/) | Composición | Entidades y municipios como círculos anidados por tamaño |
| [Marimekko Chart](https://datavizproject.com/data-type/marimekko-chart/) | Composición | Reparto por causa donde el ancho es el tamaño del grupo |
| [Bubble Map](https://datavizproject.com/data-type/bubble-map-chart/) | Mapa | Conteos por municipio sin el sesgo de superficie de la coropleta |
| [Dot Density Map](https://datavizproject.com/data-type/dot-density-map/) | Mapa | Un punto por cada N personas dentro de su municipio |
| [Cartogram](https://datavizproject.com/data-type/cartogram/) | Mapa | Entidades con el tamaño de su población (rejilla de teselas o Dorling) |
| [Bar Chart on a Map](https://datavizproject.com/data-type/map-bar-chart/) | Mapa | Altura por lugar; fichas 02 y 18 |
| [Layered Area Chart](https://datavizproject.com/data-type/nested-area-chart/) | Tiempo | Dos series superpuestas donde el hueco es la brecha; ficha 06 |
| [Waterfall Plot](https://datavizproject.com/data-type/waterfall-plot/) | Tiempo | Perfiles por edad desplazados en el tiempo; versión 2D de la ficha 14 |

## 4. Datawrapper: qué ofrece y por qué se reconoce

### Tipos de gráfica

La [página de producto](https://www.datawrapper.de/charts) declara 23 tipos de gráfica y los agrupa en siete familias, que coinciden con las categorías de su documentación (la antigua Academy, que ahora vive en `/docs`). En [barras](https://www.datawrapper.de/docs/category/bar-charts) están las simples, divididas, apiladas, agrupadas, de bala y la pirámide de población; en [columnas](https://www.datawrapper.de/docs/category/column-charts), las simples, agrupadas, apiladas y las columnas múltiples; en [líneas y áreas](https://www.datawrapper.de/docs/category/line-area-charts), la línea, las líneas múltiples en paneles, el área, y las variantes de pendiente y de posiciones; en [pastel y dona](https://www.datawrapper.de/docs/category/pie-donut-charts), las simples, las múltiples y la dona electoral; en [puntos](https://www.datawrapper.de/docs/category/dot-plots), el dot plot, el de rangos y el de flechas; además del [diagrama de dispersión](https://www.datawrapper.de/docs/category/scatter-plots) y de las gráficas de [doble eje y cascada](https://www.datawrapper.de/docs/category/dual-axis-waterfall-charts).

En mapas ofrece [tres tipos](https://www.datawrapper.de/docs/maps-you-can-create-with-datawrapper): la coropleta, el mapa de símbolos (con las variantes de picos y de flechas) y el mapa localizador, que admite marcadores con ícono, líneas, áreas, sombreado de relieve y, desde junio de 2026, flechas. Las [tablas](https://www.datawrapper.de/docs/category/tables) aceptan mapas de calor, barras y líneas dentro de las celdas. La herramienta no trae de origen enjambres, aluviales, sankey ni gráficas de unidades; el propio equipo publica rodeos, como el [enjambre construido sobre un diagrama de dispersión](https://www.datawrapper.de/blog/life-expectancy-beeswarm-plot) con las posiciones calculadas fuera. Su [guía de tipos de gráfica](https://www.datawrapper.de/blog/chart-types-guide) recorre cerca de 40 formas según la pregunta que responden y sirve como árbol de decisión aunque no se use la herramienta.

### Convenciones de estilo

Una gráfica de Datawrapper se reconoce menos por su forma que por la disciplina del texto que la rodea. Las convenciones siguientes salen de sus guías sobre [texto](https://www.datawrapper.de/blog/text-in-data-visualizations), [énfasis con color](https://www.datawrapper.de/blog/emphasize-with-color-in-data-visualizations) y [título como clave de color](https://www.datawrapper.de/docs/how-to-turn-your-title-into-a-color-key), y de las capturas 03 y 04.

| Convención | Cómo se ve | Cómo se replica en Plot |
|---|---|---|
| El título dice el hallazgo en lenguaje llano | «is higher than ever» en lugar de «peaks»; las definiciones bajan a la descripción | Título de la figura generado con el dato; subtítulo con filtros y definición |
| Palabras del título en el color de la serie | Texto coloreado, fondo de color o subrayado; el subrayado conviene cuando el color es demasiado claro para texto | `<span>` con el color de la paleta dentro del título HTML; se mide el contraste del texto coloreado |
| Rótulos directos en vez de leyenda | El nombre va junto a la línea o al segmento; en móvil reaparece la clave arriba | `Plot.text` filtrado al último punto; leyenda solo en 390 px |
| Anotaciones con línea o flecha | Se anotan valores atípicos, elementos de diseño y contexto; en móvil las menos importantes se ocultan o bajan | Tabla de anotaciones con `Plot.text` y `Plot.arrow`; lista numerada bajo la figura en 390 px |
| Contexto en gris, pocos resaltes | Primero todo en gris y después se recolorea solo lo que sostiene el mensaje; el contexto puede ir en un tono apagado del mismo matiz | Dos capas, contexto y destacado, como en la ficha 01 |
| Notas y fuente al pie | Texto pequeño, delgado y gris para lo secundario | Pie de una frase con fuente y qué representa cada marca |
| Unidades donde se leen | En ejes, globos y anotaciones, no solo en la descripción; sin decimales de sobra | Formato único por indicador en toda la cadena |
| El globo recuerda qué se mide | «3.4% unemployed» en lugar de «3.4%» | Globo con dimensión, grupo, valor y población |
| Mapas localizadores con clave arriba | Clave en renglones, áreas con trama de rayas, líneas guía y barra de escala | Ficha 04 |
| Rangos de color escalonados | Escalas por pasos con cortes legibles en lugar de gradiente continuo | `color: {type: "threshold"}` con cortes fijos en una constante |

### Entregas con formas novedosas

Las trece direcciones siguientes se abrieron y se leyeron. La consulta recuperó el texto de cada entrega y no sus imágenes, por lo que la columna de formas resume lo que el texto describe y lo que se ve en las capturas de `referencias/`.

| Entrega | Fecha | Formas que reseña o muestra |
|---|---|---|
| [Dispatch: A blue wave, pi, and the pancake index](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | 10 nov 2026 | Mapa 3D de densidad comercial de París, índice de panqueques, mapa por condado con efecto de vaivén; capturas 01, 02 y 03 |
| [Dispatch: Midterm elections, Halloween candies, and the #30DayMapChallenge](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge) | 3 nov 2026 | Guerra de anuncios con transiciones, calculadora de mayoría del Senado, mapa de curvas de nivel en neón, lente interactiva sobre un mapa de puntos; capturas 06 y 07 |
| [Dispatch: Brazil elections, Apple's iPhone Duo, and coffee prices](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices) | 27 oct 2026 | Percentiles de patrimonio por edad, precios del café en Barcelona, bump chart dibujado a mano en los años cuarenta; capturas 08, 09 y 10 |
| [Dispatch: Work friendships, heat storms, and expensive stamps](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps) | 20 oct 2026 | Notas de campo con una forma visual por señal climática, relieve de Japón, archivo interactivo de fortunas; capturas 11, 12 y 13 |
| [Dispatch: False election claims, a total blackout, and bananas](https://www.datawrapper.de/blog/data-vis-dispatch-october-13-2026-false-election-claims-a-total-blackout-and-bananas) | 13 oct 2026 | Pirámide de población en 3D, vidas de premios Nobel como cientos de curvas de fondo con algunas destacadas, picos de densidad de población; captura 14 |
| [Dispatch: Brazil elections, FlyDubai plane, and ice melting](https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting) | 6 oct 2026 | Aluvial de cambios de partido, mapa con flechas de dirección del cambio por municipio; capturas 15 y 16 |
| [Dispatch: Marine heatwaves, London buses, and the WNBA](https://www.datawrapper.de/blog/data-vis-dispatch-september-29-2026-marine-heatwaves-interactive-maps-and-the-wnba) | 29 sep 2026 | Un mapa de anomalía por día, curva de campana animada, mapa de puntos donde cada punto es un voto; capturas 17 y 18 |
| [Dispatch: Big AI, low birth rates, and laughs](https://www.datawrapper.de/blog/data-vis-dispatch-september-22-2026-big-ai-low-birth-rates-and-laughs) | 22 sep 2026 | Cintas animadas de la risa por frecuencia, instalación física de cerámica con tubos por color |
| [Weekly Chart: U.S. bases in Germany](https://www.datawrapper.de/blog/us-bases-germany) | 5 nov 2026 | Mapa de puntos anotado; captura 04 |
| [Weekly Chart: In which stadiums will the World Cup favorites play?](https://www.datawrapper.de/blog/fifa-world-cup-locator-map-arrows) | 11 jun 2026 | Mapas localizadores con flechas que indican orden y dirección del recorrido |
| [Weekly Chart: How long will you live?](https://www.datawrapper.de/blog/life-expectancy-beeswarm-plot) | 4 jun 2026 | Enjambre en espejo por sexo, un punto por país |
| [Weekly Chart: People are still dying, we just stopped paying attention](https://www.datawrapper.de/blog/migration-mediterranean-sea) | 19 mar 2026 | Cada incidente de migración como un punto en el mapa, en lugar del total agregado |
| [Introducing spike maps](https://www.datawrapper.de/blog/spikemaps) | 8 oct 2020 | Mapa de picos: la longitud se compara mejor que el área y los símbolos se enciman menos |

Los archivos completos están en [Data Vis Dispatch](https://www.datawrapper.de/blog/category/data-vis-dispatch) y en [Weekly Charts](https://www.datawrapper.de/blog/category/weekly-charts). La cuenta de Datawrapper en X no se puede leer sin sesión iniciada; el Dispatch recoge lo mismo que ahí se difunde.

## 5. Otras canteras

| Cantera | Para qué sirve | Estado al 16 nov 2026 |
|---|---|---|
| [Observable Plot, documentación](https://observablehq.github.io/plot/) | Referencia de marcas y transformaciones; las recetas de este catálogo se apoyan en [waffle](https://observablehq.github.io/plot/marks/waffle) (desde la versión 0.6.16), [dodge](https://observablehq.github.io/plot/transforms/dodge), [arrow](https://observablehq.github.io/plot/marks/arrow), [vector y spike](https://observablehq.github.io/plot/marks/vector) e [image](https://observablehq.github.io/plot/marks/image) | Abierta |
| [Observable Plot, galería](https://observablehq.com/@observablehq/plot-gallery) | Ejemplos con código por tipo de marca, listos para copiar | No se pudo abrir (HTTP 429) |
| [D3, galería](https://observablehq.com/@d3/gallery) | Ejemplos de lo que Plot no cubre: sankey, cuerdas, fuerzas, empaquetado de círculos | No se pudo abrir (HTTP 429) |
| [D3, documentación](https://d3js.org/) | Módulos usados en las recetas: [d3-force](https://d3js.org/d3-force), [d3-shape](https://d3js.org/d3-shape/link), [d3-geo](https://d3js.org/d3-geo) y [d3-sankey](https://github.com/d3/d3-sankey) | Abierta |
| [Financial Times Visual Vocabulary](https://ft-interactive.github.io/visual-vocabulary/) | Cartel que ordena las formas por la relación que se quiere mostrar (desviación, correlación, ranking, distribución, cambio en el tiempo, magnitud, parte-todo, espacial, flujo); el [repositorio](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary) trae el cartel en varios idiomas | Abierta |
| [From Data to Viz](https://www.data-to-viz.com/) | Árbol de decisión que parte del tipo de datos y advierte los errores frecuentes de cada forma | Abierta |
| [The Data Visualisation Catalogue](https://datavizcatalogue.com/) | Ficha breve por tipo con anatomía, función y herramientas que lo generan | Abierta |
| [Xenographics](https://xeno.graphics/) | Colección de formas raras con su fuente original; de ahí salen el [OD map](https://xeno.graphics/od-map/), el [diagrama de Lexis](https://xeno.graphics/lexis-diagram/) y el [necklace map](https://xeno.graphics/necklace-map/) | Abierta |
| [Reuters Graphics](https://www.reuters.com/graphics/) | Piezas con multitudes de unidades, ilustración integrada al dato y anotación directa (capturas 10, 12 y 17) | Abierta |
| [The Pudding](https://pudding.cool/) | Ensayos visuales experimentales; útiles para ideas de unidad e interacción, casi siempre con scrollytelling que aquí no se replica | Abierta |
| [FlowingData](https://flowingdata.com/) | Reseñas diarias y gráficas propias con datos de encuestas; su [índice por tipo de gráfica](https://flowingdata.com/chart-types/) agrupa ejemplos por forma | Abierta |

## 6. Aplicación al libro de migración por violencia

El libro cuenta con personas de 5 a 17 años por tipo de movilidad (por violencia, por otra causa y sin movilidad) con edad, sexo y condición de habla de lengua indígena; una matriz origen-destino entre entidades y entre municipios; las causas de migración en 2020 y 2025; indicadores educativos por grupo, y viviendas con desplazamiento forzado por municipio. Con esos datos se proponen diez secciones, ordenadas de modo que no se repita la misma forma en dos secciones seguidas. Se priorizan las formas de unidades humanas, el mapa de flujos con flechas anchas, las barras apiladas unidas por flujos y el contraste entre destacado y contexto.

| # | Pregunta de la sección | Forma | Ficha | Notas de construcción |
|---|---|---|---|---|
| 1 | De todas las niñas, niños y adolescentes de 5 a 17 años, ¿cuántos se movieron por violencia? | Multitud de unidades con subgrupo resaltado | 17 | Cada figura equivale a N personas; por violencia en acento, otra causa en tono medio, sin movilidad en tono claro |
| 2 | De cada 100 que cambiaron de residencia, ¿cuántos lo hicieron por violencia según sexo y lengua indígena? | Multitud ilustrada con fracción sólida, en paneles | 12 | Cuatro paneles de 50 o 100 figuras; filtros de entidad y edad |
| 3 | ¿De dónde llegan quienes se desplazaron por violencia a una entidad, y hacia dónde salen? | Mapa de flujos con flechas anchas | 05 | Selector de entidad y de sentido (llegan o salen); los 8 a 12 flujos mayores, ancho proporcional al número de personas |
| 4 | ¿Cómo cambió el reparto de las causas de migración entre 2020 y 2025? | Barras apiladas unidas por flujos | 16 | Dos barras al 100 por ciento; las cintas unen la misma causa en ambos cortes |
| 5 | ¿Qué entidades expulsan y cuáles reciben? | Aluvial de entidad de origen a entidad de destino | 10 | Diez orígenes mayores y «otras»; la matriz completa va en la tabla y en un mapa de calor de respaldo |
| 6 | ¿Cómo se reparten los municipios según el porcentaje de viviendas con desplazamiento forzado? | Enjambre de burbujas con una entidad destacada | 07 y 01 | Cada burbuja un municipio, área igual a viviendas; la entidad elegida en color y el resto al fondo |
| 7 | ¿Dónde están los municipios con más viviendas desplazadas? | Mapa de picos con cinco o seis municipios anotados | 18 y 04 | Longitud y color con el mismo valor; rótulos con línea guía para los máximos |
| 8 | ¿Qué edades tienen quienes se desplazaron por violencia? | Histograma de unidades con la mediana marcada | 08 | Una columna por año de edad, de 5 a 17; cada figura equivale a N personas; comparar por sexo en dos paneles |
| 9 | ¿En cuánto se separan los indicadores educativos de quienes se movieron por violencia y de quienes no se movieron? | Áreas superpuestas por edad en paneles | 06 | Dos series por panel (por violencia y sin movilidad), un panel por indicador; el hueco entre ambas es la brecha |
| 10 | ¿Qué entidades subieron o bajaron en migración por violencia entre 2020 y 2025? | Líneas de dos cortes con grupo destacado | 01 | Con dos cortes es una gráfica de pendientes; las 32 entidades al fondo y la región elegida destacada |

Las secciones 1, 2 y 8 comparten la regla del tamaño de la unidad. El número de personas por figura se fija para que la sección más poblada quede entre 600 y 1,500 figuras, se redondea a 1, 2 o 5 por una potencia de 10 y se escribe en el pie («cada figura representa 5,000 personas»). Como las cifras vienen de una muestra expandida, el globo da el porcentaje y la población estimada, y los casos sin expandir se quedan en la tabla de respaldo. Cuando un grupo no alcanza una figura completa se dibuja una figura parcial o se rotula «menos de N», porque dejarlo en cero se leería como ausencia.

En la sección 4 es importante destacar un límite. Los dos cortes son levantamientos independientes y no un seguimiento de las mismas personas, por lo que las cintas solo pueden unir cada causa consigo misma y mostrar cuánto creció o se redujo su parte. Dibujar cintas que crucen de una causa a otra exigiría datos de transición que no existen, y la figura afirmaría algo que la fuente no mide. Por la misma razón el aluvial de la sección 5 sí es válido: la matriz origen-destino registra para cada persona su lugar de residencia anterior y el actual.

Las secciones 3, 5, 6 y 7 trabajan a nivel municipal o con celdas pequeñas de la matriz, donde la muestra se parte. Antes de dibujar un flujo o un municipio conviene fijar un mínimo de casos sin expandir y agrupar lo que quede por debajo en «otros», con el umbral declarado en el desplegable de explicación. De manera general, las diez formas mantienen la anatomía de sección de los tableros: título igual al del índice, panel de filtros, figura con pie de una frase y los tres desplegables de fuentes, explicación y tabla.

## 7. Estado de los enlaces

Todas las direcciones de este documento se probaron el 16 de noviembre de 2026. El índice de Data Viz Project se descargó completo y de él se extrajeron los 166 nombres con su dirección. Del blog de Datawrapper se abrieron y leyeron las trece entregas de la tabla de la sección 4, las guías de texto, énfasis con color y tipos de gráfica, y las páginas de documentación de título como clave de color y de tipos de mapa; las páginas de categoría de la documentación se abrieron para listar sus artículos. De las demás canteras se leyó el índice de Xenographics y la documentación de Plot (en su repositorio y en `observablehq.github.io/plot`); en las restantes solo se comprobó que la página responde. En total se probaron 224 direcciones distintas, de las cuales 222 respondieron con HTTP 200, con las excepciones siguientes.

| Página | Resultado |
|---|---|
| `observablehq.com/@observablehq/plot-gallery` y `observablehq.com/@d3/gallery` | HTTP 429 (límite de peticiones) en todos los intentos; se dejan enlazadas sin haber podido leerlas. La documentación de Plot sí se abrió en `observablehq.github.io/plot` |
| `x.com/Datawrapper` | No legible sin sesión; no se consultó |
| `blog.datawrapper.de/...` | Redirige a `www.datawrapper.de/blog/...`; la categoría del Weekly Chart es `weekly-charts`, en plural (con `weekly-chart` devuelve 404) |
| `academy.datawrapper.de/...` | Redirige a `www.datawrapper.de/docs/...`; la antigua categoría «chart types» ya no existe como página única y está repartida en siete categorías |
| Origen de la captura 05 | No se localizó la publicación de la que salió el mapa de flujos con íconos |

## 8. Formas encontradas en el Data Vis Dispatch y Weekly Charts (revisión con imágenes)

En esta revisión se miraron las gráficas y no solo el texto de las entregas. Se descargó el HTML de las 22 entregas más recientes del Data Vis Dispatch (del 2 de junio al 10 de noviembre de 2026) y de las 12 más recientes de Weekly Charts (del 27 de agosto al 12 de noviembre de 2026), se extrajeron las direcciones de sus imágenes y se abrieron en hojas de contacto de doce capturas, con la clave de cada una, para juzgar la forma. Las capturas elegidas se guardaron en `referencias/dispatch/` con el nombre `<fecha de la entrega>-<n.º de imagen>`; las de Weekly Charts llevan la fecha de publicación y el identificador de la gráfica de Datawrapper. Se descartaron las formas que ya están en la Plantilla (las 27 de `src/components/formas/`) o en las 18 fichas de la sección 2, así como fotografías, ilustraciones y renders sin una forma de fondo replicable.

La cobertura no fue pareja y conviene declararlo. Las entregas del 3 y del 10 de noviembre sirven sus imágenes desde el sitio de Datawrapper y se vieron completas. En las veinte anteriores el sitio ya no publica las imágenes (el campo de imagen llega vacío y los archivos responden 404), por lo que se recuperaron de las copias del Internet Archive; ese servicio limitó las descargas a unas pocas por minuto (HTTP 429), y para completar se usó la imagen de portada (`og:image`) de cada pieza original reseñada, que a veces es la gráfica y a veces una fotografía. Las entregas del 15 y del 22 de septiembre no tienen copia en el archivo. En Weekly Charts las gráficas son incrustaciones de Datawrapper y se descargaron como PNG desde `datawrapper.dwcdn.net/<id>/full.png`. El recuento exacto de imágenes vistas por entrega está en la sección 8.4.

Nueve de estas formas ya tienen componente, sección en la galería y verificadores en verde: D01 (`flechasCambio`), D03 (`riel`), D04 (`mosaicoTriangulos`), D05 (`mosaicoFracciones`), D06 (`barraMapa`), D07 (`semitonos`), D08 (`unidadesEspejo`), D14 (`ternario`) y D18 (`siluetaPuntos`). Están en la tabla maestra de `README.md` con la clave **P**.

### 8.1 Índice de formas

| N.º | Forma | Medio y fecha | Entrega | Imagen | Pregunta que responde | Dificultad | Cabe |
|---|---|---|---|---|---|---|---|
| D01 | Mapa de flechas inclinadas por unidad | The Washington Post, 4 nov 2026 (también The Economist, 9 nov, y The New York Times, 26 oct) | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-08.jpg`, `2026-11-10-19.jpg`, `2026-10-27-05.png` | ¿En qué municipios subió o bajó un indicador entre dos cortes, y cuánto? | Media | Sí |
| D02 | Flechas de cambio por región sobre el mapa | The New York Times, 18 oct 2026 | [Dispatch 20 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps) | `referencias/dispatch/2026-10-20-08.png` | ¿Cuánto cambió cada región entre dos cortes? | Baja | Sí |
| D03 | Riel de trayectoria con flecha final | The New York Times, 21 oct y 4 nov 2026 | [Dispatch 27 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices) | `referencias/dispatch/2026-10-27-13.png`, `2026-11-10-25.jpg` | ¿Cómo se movió cada grupo en tres o más cortes y hacia dónde terminó? | Baja | Sí |
| D04 | Mosaico de triángulos partidos | The Wall Street Journal, 17 oct 2026 | [Dispatch 20 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps) | `referencias/dispatch/2026-10-20-03.png` | ¿Cómo se comparan dos cortes o dos grupos en las 32 entidades a la vez? | Media | Sí |
| D05 | Mosaico de fracciones (un pastel por casilla) | The European Correspondent, 21 oct 2026 | [Dispatch 27 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices) | `referencias/dispatch/2026-10-27-17.png` | ¿Qué parte del total cumple la condición en cada entidad? | Media | Sí |
| D06 | Flujos que bajan de una barra al mapa | The Guardian, 31 oct 2026 | [Dispatch 3 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge) | `referencias/dispatch/2026-11-03-06.jpg` | ¿De qué se compone un total y a qué lugares llega cada parte? | Alta | Sí |
| D07 | Mapa de semitonos sobre rejilla hexagonal | IGN (Francia), #30DayMapChallenge, nov 2026 | [Dispatch 3 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge) | `referencias/dispatch/2026-11-03-24.jpg` | ¿Dónde se concentra una cantidad dentro del territorio? | Baja | Sí |
| D08 | Unidades apiladas a ambos lados del eje | The New York Times, 4 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-12.jpg` | ¿Cuántas personas hay de cada lado (sexo, causa) en cada edad o año? | Baja | Sí |
| D09 | Hemiciclo de unidades | NBC News, 29 oct 2026; Anadolu Agency, 26 oct 2026 | [Dispatch 3 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge) | `referencias/dispatch/2026-11-03-03.jpg`, `2026-10-27-07.png` | ¿Cómo se reparte un todo entre cuatro o cinco categorías ordenadas? | Media | Adaptada |
| D10 | Fichas en renglones por rango, con trama de cambio | The Guardian, 5 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-03.jpg` | ¿Cuántas entidades hay en cada rango y cuáles cambiaron de rango? | Baja | Sí |
| D11 | Curvas acumuladas de dos cortes con flechas | Our World in Data, 22 oct 2026 | [Dispatch 27 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices) | `referencias/dispatch/2026-10-27-16.png` | ¿Qué parte queda por debajo de cualquier umbral, en dos cortes o dos grupos? | Media | Sí |
| D12 | Mapa de burbujas por municipio con color de categoría | Arthur Welle, 26 oct 2026; SUR, jul 2026 | [Dispatch 27 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices) | `referencias/dispatch/2026-10-27-02.png`, `2026-07-07-06.png` | ¿Cuántas personas hay en cada municipio y cuál es su categoría dominante? | Baja | Sí |
| D13 | Galería de siluetas territoriales | Terence, #30DayMapChallenge, nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-32.jpg` | ¿Cómo se distribuye un indicador dentro de cada entidad, entidad por entidad? | Media | Sí |
| D14 | Triángulo ternario con estelas | USAFacts, reseñado por FlowingData, 29 may 2026 | [Dispatch 2 jun](https://www.datawrapper.de/blog/data-vis-dispatch-june-2-2026-extreme-weather-gambling-and-the-swiss-alps) | `referencias/dispatch/2026-06-02-04.jpg` | ¿Hacia cuál de tres categorías se movió la composición de cada unidad? | Media | Sí |
| D15 | Pares de círculos superpuestos | The European Correspondent, 27 may 2026 | [Dispatch 2 jun](https://www.datawrapper.de/blog/data-vis-dispatch-june-2-2026-extreme-weather-gambling-and-the-swiss-alps) | `referencias/dispatch/2026-06-02-07.png` | ¿Cuánto creció o se redujo cada unidad entre dos cortes? | Baja | Sí |
| D16 | Burbujas empaquetadas por grupo | The European Correspondent, 12 jun 2026 | [Dispatch 16 jun](https://www.datawrapper.de/blog/data-vis-dispatch-june-16-2026-the-swiss-population-cap-1-77-trillion-and-el-nino) | `referencias/dispatch/2026-06-16-04.png` | ¿Cuánto aporta cada unidad al total de su grupo? | Media | Sí |
| D17 | Cartograma de cuadros con columnas por región | The Guardian, 30 sep 2026 (portada de la pieza) | [Dispatch 6 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting) | `referencias/dispatch/2026-10-06-20.jpg` | ¿Qué categoría domina en cada unidad pequeña y cómo se compone su región? | Media | Sí |
| D18 | Silueta rellena de unidades | Georgios Karamanis, 18 oct 2026 | [Dispatch 20 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps) | `referencias/dispatch/2026-10-20-28.png` | ¿Cómo se reparte un total contable entre categorías? | Media | Sí |
| D19 | Antes y después en cuadros de unidades | CNN, 8 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-04.jpg` | ¿Cuántas unidades cambiaron de estado entre dos cortes? | Baja | Sí |
| D20 | Ladera de unidades con nivel de agua | The New York Times, 29 oct 2026 | [Dispatch 3 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge) | `referencias/dispatch/2026-11-03-01.jpg` | ¿Cuántas unidades quedan bajo un umbral que el lector mueve? | Media | Adaptada |
| D21 | Sankey de hilos, una hebra por unidad | The New York Times, 29 sep 2026 | [Dispatch 29 sep](https://www.datawrapper.de/blog/data-vis-dispatch-september-29-2026-marine-heatwaves-interactive-maps-and-the-wnba) | `referencias/dispatch/2026-09-29-06.png` | ¿Cómo se reparte el total de unas pocas fuentes entre muchas unidades? | Media | Adaptada |
| D22 | Renglones de triángulos por año | The European Correspondent, 16 jul 2026 | [Dispatch 21 jul](https://www.datawrapper.de/blog/data-vis-dispatch-july-21-2026-world-cup-champions-wildfire-smoke-and-humanoid-robots) | `referencias/dispatch/2026-07-21-12.png` | ¿Qué años se salieron del promedio en cada unidad? | Baja | Adaptada; pide series largas |
| D23 | Barras isométricas en pseudo-3D | The European Correspondent, 31 jul 2026 | [Dispatch 4 ago](https://www.datawrapper.de/blog/data-vis-dispatch-august-4-2026-fake-news-summer-and-a-total-solar-eclipse) | `referencias/dispatch/2026-08-04-08.jpg` | ¿Cuánto mide cada total y qué parte cumple la condición? | Media | Adaptada |
| D24 | Treemaps de dos cortes a escala | Financial Times, 9 jul 2026 | [Dispatch 14 jul](https://www.datawrapper.de/blog/data-vis-dispatch-july-14-2026) | `referencias/dispatch/2026-07-14-36.png` | ¿Cómo cambiaron el total y su composición entre dos cortes? | Baja | Adaptada; extiende `treemap` |
| D25 | Banda de percentiles 50 y 90 con media | Datawrapper, Weekly Chart, 27 ago 2026 | [Weekly Chart](https://www.datawrapper.de/blog/electric-cars-weight) | `referencias/dispatch/2026-08-27-dw-XOA9o.png` | ¿Dónde está la mitad central de cada grupo? | Baja | Adaptada; muy cercana a `franjas` |
| D26 | Tira de puntos por corte con resalte | Datawrapper, Weekly Chart, 15 oct 2026 | [Weekly Chart](https://www.datawrapper.de/blog/marathon-times) | `referencias/dispatch/2026-10-15-dw-kSpYX.png` | ¿Cuántos casos de cada corte superan un umbral? | Baja | Adaptada |
| D27 | Distribuciones pequeñas con banda de umbral | Datawrapper, Weekly Chart, 15 oct 2026 | [Weekly Chart](https://www.datawrapper.de/blog/marathon-times) | `referencias/dispatch/2026-10-15-dw-HzCAq.png` | ¿Se amontonan los casos justo antes de un umbral? | Baja | Adaptada |
| D28 | Trayectorias verticales por grupo | Der Spiegel, 4 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-26.jpg` | ¿Cómo se movió cada grupo de edad en varios cortes? | Baja | Adaptada; variante de `destacadas` |
| D29 | Flor de unidades (un pétalo por persona) | Viviana Graziano, nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-37.jpg` | ¿Cuántas personas hay en cada grupo? | Alta | Adaptada; más ilustración que lectura |
| D30 | Rosa polar | Cabinet of Infographic Curiosities, 9 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-38.jpg` | ¿Cómo se reparte un valor en un ciclo (meses)? | Media | No; los censos no traen ciclos |
| D31 | Barra serpenteante | CT Insider, 5 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-16.jpg` | ¿Quién ocupó cada lugar en una secuencia muy larga? | Alta | No |
| D32 | Columnas de racha | The New York Times, 4 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-11.jpg` | ¿Cuántos cortes seguidos lleva cada unidad en un estado? | Baja | No; pide muchos cortes |
| D33 | Barras radiales en anillo | Sonja Kuijpers, oct 2026 (sobre W. E. B. Du Bois) | [Dispatch 13 oct](https://www.datawrapper.de/blog/data-vis-dispatch-october-13-2026-false-election-claims-a-total-blackout-and-bananas) | `referencias/dispatch/2026-10-13-24.png` | ¿Cómo se comparan 50 unidades en una sola figura? | Media | No; las longitudes radiales se comparan mal |
| D34 | Cúmulo de círculos sin traslape (Dorling) | The Minnesota Star Tribune, 4 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-02.jpg` | ¿Dónde se concentra la población sin que los círculos se tapen? | Media | Sí |
| D35 | Tiras de eventos por unidad con marca de «ahora» | Flight Atlas, 10 nov 2026 | [Dispatch 10 nov](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index) | `referencias/dispatch/2026-11-10-36.jpg` | ¿Cuándo ocurrió cada evento de cada unidad? | Baja | No; pide datos de eventos |
| D36 | Reloj radial de estacionalidad | Bloomberg, 29 jun 2026 | [Dispatch 30 jun](https://www.datawrapper.de/blog/data-vis-dispatch-june-30-2026-venezuela-a-heat-dome-and-messi) | `referencias/dispatch/2026-06-30-29.png` | ¿En qué época del año se concentra un fenómeno? | Media | No |

### 8.2 Fichas de las mejores

Las fichas siguen el orden del índice. Cada una dice qué hace llamativa la forma, cómo se construiría en Plot o D3 dentro de las reglas de la sección 1, cómo reaccionaría a los filtros habituales del libro (entidad, año, sexo, edad y grupo) y un uso concreto con los datos de migración por violencia descritos en la sección 6. Donde la referencia usa fondo oscuro, morado o animación, la receta ya lo sustituye por la convención de la casa: fondo claro, rojo y azul para los dos conceptos del capítulo, gris para el contexto y el verde azulado del tema para las magnitudes.

### D01 · Mapa de flechas inclinadas por unidad

![Flechas por condado inclinadas hacia el partido que ganó terreno](referencias/dispatch/2026-11-10-08.jpg)

**Origen:** The Washington Post, «Where voters shifted toward Democrats in the 2026 midterms» ([Dispatch del 10 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index)); la misma forma aparece en The Economist (`2026-11-10-19.jpg`, con la base del triángulo proporcional a los votos contados) y en The New York Times sobre Brasil (`2026-10-27-05.png`).

**Por qué llama la atención:** cada municipio lleva una flecha corta que se inclina hacia la izquierda o hacia la derecha según el sentido del cambio entre dos cortes, y su largo es la magnitud del cambio. Miles de flechas juntas se leen como un viento que sopla en una dirección, y las zonas donde el viento se invierte saltan a la vista sin leyenda. A diferencia de una coropleta de cambio, la flecha conserva dos lecturas a la vez, el sentido y el tamaño, y el color repite el sentido para quien no distingue la inclinación.

**Receta:**

1. En el data loader, por municipio: centroide (longitud, latitud), valor en el corte inicial, valor en el corte final y diferencia en puntos porcentuales; se descartan los municipios por debajo del mínimo de casos declarado.
2. `Plot.vector(datos, {x: "lon", y: "lat", length: d => Math.abs(d.cambio), rotate: d => d.cambio > 0 ? 45 : -45, anchor: "start", stroke: d => d.cambio > 0 ? ROJO : AZUL, strokeWidth: 1.2})` sobre la misma proyección de `mapa-plano`; la escala `length` se fija con un dominio constante para que no cambie al filtrar.
3. El contorno de las entidades va debajo en gris claro con `Plot.geo` y `stroke: "none"` entre municipios.
4. Globo con `Plot.pointer` (es un mapa, ambos ejes continuos): municipio, valor en cada corte, diferencia y personas que representa la diferencia.
5. Con más de unas 2,500 flechas visibles conviene pintar el contexto en canvas; al elegir una entidad el mapa encuadra y la flecha engrosa.

**Filtros:** la entidad encuadra el mapa y deja las flechas del resto en gris tenue; el sexo y el grupo de edad recalculan la diferencia, de modo que las flechas cambian de largo y algunas de sentido, que es justo lo que se quiere comparar; el par de años es el propio cambio, por lo que el selector de año pasa a ser un selector de par de cortes (2015 a 2020 o 2020 a 2025).

**Ejemplo con migración:** cambio, entre 2020 y 2025, del porcentaje de personas de 5 a 17 años que migraron por violencia, por municipio. La flecha roja e inclinada a la derecha marca los municipios donde subió y la azul a la izquierda donde bajó; con sexo = mujeres se ve si el patrón se sostiene.

**Dificultad:** media. **Encaje:** cabe.

### D02 · Flechas de cambio por región sobre el mapa

![Flechas verticales anchas por región con el porcentaje de cambio](referencias/dispatch/2026-10-20-08.png)

**Origen:** The New York Times, «Legal Immigration Fell Sharply Under Trump Policies Adopted Early This Year» ([Dispatch del 20 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps)).

**Por qué llama la atención:** es la versión agregada de D01. Una flecha ancha y vertical por región, hacia arriba si creció y hacia abajo si cayó, con el largo proporcional al cambio porcentual y la cifra junto a la punta. Con una docena de flechas el mapa se lee en cinco segundos y el color (verde para lo que sube, rojo para lo que baja en la referencia) duplica el sentido.

**Receta:**

1. Agregar el indicador por entidad o región en dos cortes y calcular el cambio relativo.
2. `Plot.arrow` con `x1 = x2` en el centroide proyectado, `y1` en el centroide y `y2` desplazado por `k · cambio` píxeles, `strokeWidth` de 6 a 10 y `headLength` proporcional; también sirve `Plot.vector` con `rotate: 0` o `180` y `shape: "arrow"`.
3. `Plot.text` en la punta con la cifra y el nombre de la región, con `dy` según el sentido.
4. Rojo para el aumento del fenómeno estudiado y azul para la disminución, gris para los cambios dentro del margen de error.

**Filtros:** sexo, edad y grupo recalculan cada flecha; el par de cortes elige el cambio; la entidad pasa de 32 flechas a las de sus municipios mayores, sin cambiar la forma.

**Ejemplo con migración:** cambio entre 2020 y 2025 en el número de personas de 5 a 17 años que llegaron a cada entidad por violencia, con la cifra en por ciento y en personas en el globo.

**Dificultad:** baja. **Encaje:** cabe.

### D03 · Riel de trayectoria con flecha final

![Riel por grupo con los cortes anteriores como puntos y una flecha al corte más reciente](referencias/dispatch/2026-10-27-13.png)

**Origen:** The New York Times, «Democrats Have a Wide Lead in Our New Poll as Trump Slides» ([Dispatch del 27 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices)); una variante con la trayectoria doblada en gancho está en The New York Times, «Every Major Demographic Group Swung Left» (`2026-11-10-25.jpg`).

**Por qué llama la atención:** por cada grupo se dibuja un riel claro que va del valor mínimo al máximo de todos los cortes, puntos pequeños en los cortes intermedios y una flecha que termina en el corte más reciente. El riel enseña cuánto se ha movido el grupo en toda la serie y la flecha dice hacia dónde fue al final, algo que el dumbbell de dos puntos no puede decir con tres cortes.

**Receta:**

1. Tabla larga grupo × corte × valor, con el orden de los cortes explícito.
2. `Plot.link` por grupo de `min` a `max` con `strokeWidth: 12`, `strokeLinecap: "round"` y el color del grupo al 20 por ciento de opacidad.
3. `Plot.dot` en los cortes anteriores con radio 3 y el año en un `Plot.text` pequeño encima.
4. `Plot.arrow` del penúltimo al último corte, en el color del grupo, con la cifra final en la punta.
5. Para la variante en gancho, cada corte se desplaza unos píxeles en vertical dentro del renglón y se une con `Plot.line` y `curve: "bump-x"` antes de la flecha.

**Filtros:** el grupo elige los renglones (sexo, edad, lengua indígena, condición de movilidad); la entidad recalcula todos los valores; el año se vuelve irrelevante porque la forma ya muestra todos los cortes, así que el selector de año se oculta.

**Ejemplo con migración:** tasa de asistencia escolar de 2015, 2020 y 2025 para quienes migraron por violencia, por otra causa y sin movilidad, un renglón por grupo y por sexo.

**Dificultad:** baja. **Encaje:** cabe.

### D04 · Mosaico de triángulos partidos

![Rejilla de estados donde cada cuadro va partido en diagonal en dos triángulos de color](referencias/dispatch/2026-10-20-03.png)

**Origen:** The Wall Street Journal, «The Senate Race Republicans Never Expected to Sweat» ([Dispatch del 20 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps)).

**Por qué llama la atención:** es el mosaico de la Plantilla (un cuadro por entidad acomodado como el país) con cada cuadro partido en diagonal. El triángulo superior lleva un valor y el inferior otro, de modo que se comparan dos cortes o dos grupos en las 32 entidades sin duplicar el mapa. Los cuadros con dos triángulos del mismo tono se leen como estables y los que cambian de tono destacan solos.

**Receta:**

1. Reutilizar la rejilla `mx_state_grid3` de `formas/mosaico.js` para la posición de cada entidad.
2. Por entidad, dos polígonos: `[[x,y],[x+1,y],[x,y+1]]` y `[[x+1,y],[x+1,y+1],[x,y+1]]`; se dibujan con `Plot.geo` y `projection: {type: "identity", domain}` o con un `d3.path` propio.
3. El color sale de la misma escala de umbrales fija para ambos triángulos (rangos de presencia de la casa), así el mismo tono significa lo mismo arriba y abajo.
4. Abreviatura de la entidad con `Plot.text` en la esquina y una leyenda que enseñe con un cuadro de ejemplo cuál triángulo es cuál.
5. Globo por triángulo: entidad, corte o grupo, valor y población.

**Filtros:** el selector «Comparar» decide qué representan las mitades (2020 frente a 2025, hombres frente a mujeres, por violencia frente a otra causa); edad y grupo recalculan ambos triángulos; la entidad elegida lleva contorno grueso.

**Ejemplo con migración:** porcentaje de personas de 5 a 17 años que migraron por violencia en 2020 (triángulo superior) y en 2025 (inferior) en cada entidad.

**Dificultad:** media. **Encaje:** cabe.

### D05 · Mosaico de fracciones (un pastel por casilla)

![Rejilla de países con un pastel parcial en cada casilla](referencias/dispatch/2026-10-27-17.png)

**Origen:** The European Correspondent, «Priced out of Netflix» ([Dispatch del 27 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices)).

**Por qué llama la atención:** cada país es una casilla de la rejilla geográfica y dentro lleva un círculo que se llena como un reloj hasta la proporción, con el tono más oscuro cuanto más lleno. La proporción se lee dos veces, por el ángulo y por el color, y la rejilla conserva la geografía sin que el tamaño del territorio pese. Unas pocas anotaciones con línea guía señalan los extremos.

**Receta:**

1. Rejilla `mx_state_grid3` y, por entidad, la proporción `p` entre 0 y 1.
2. Fondo de cada casilla con `Plot.dot` de radio fijo y relleno gris muy claro; encima, el sector con `d3.arc().innerRadius(0).outerRadius(r).startAngle(0).endAngle(2π·p)` dibujado en una capa SVG propia o en el `render` de una marca de Plot.
3. Relleno del sector en una rampa de un tono de cuatro pasos con dominio fijo.
4. Anotaciones para el máximo y el mínimo, y el valor exacto en el globo.

**Filtros:** sexo, edad y grupo recalculan `p` y el reloj avanza o retrocede; el año cambia el corte; la entidad elegida lleva contorno y su cifra rotulada.

**Ejemplo con migración:** de cada 100 personas de 5 a 17 años que cambiaron de residencia en cada entidad, cuántas lo hicieron por violencia.

**Dificultad:** media. **Encaje:** cabe.

### D06 · Flujos que bajan de una barra al mapa

![Barra de donantes en lo alto que se divide en cintas que aterrizan en los estados](referencias/dispatch/2026-11-03-06.jpg)

**Origen:** The Guardian, «The staggering $446m Elon Musk has spent on the US midterms – visualized» ([Dispatch del 3 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge)).

**Por qué llama la atención:** arriba hay una barra con el total partido en sus fuentes; de cada fuente bajan cintas cuyo ancho es la cantidad y que se curvan hasta aterrizar en su destino sobre el mapa. Combina un sankey y un mapa de flujos en una sola figura: se lee de dónde sale, cuánto y a dónde llega, y el mapa conserva la geografía de los destinos.

**Receta:**

1. En el loader, para la entidad o el municipio de origen elegido: total de salidas por causa y destinos con su número de personas (los 10 a 15 mayores y «otros»).
2. Barra superior con `Plot.barX` apilada por causa, a ancho completo.
3. Para cada par causa-destino, una cinta con `d3.linkVertical()` (o un área entre dos Bézier) que parte del tramo de su causa en la barra y termina en el centroide proyectado del destino; ancho proporcional a las personas y opacidad 0.5.
4. Mapa debajo con `Plot.geo` en gris claro y un `Plot.dot` en cada destino con su rótulo y cifra.
5. Globo sobre cada cinta: causa, destino, personas y porcentaje del total que sale.

**Filtros:** la entidad elige el origen (o, con el selector de sentido, el destino y las cintas suben desde el mapa); sexo y edad recalculan anchos; el año cambia el corte; al elegir una causa las demás cintas pasan al 20 por ciento de opacidad.

**Ejemplo con migración:** de las personas de 5 a 17 años que salieron de Guerrero por violencia, a qué entidades llegaron, con la barra superior partida por sexo o por condición de habla de lengua indígena.

**Dificultad:** alta. **Encaje:** cabe.

### D07 · Mapa de semitonos sobre rejilla hexagonal

![Isla dibujada solo con puntos negros de distinto tamaño sobre una rejilla hexagonal](referencias/dispatch/2026-11-03-24.jpg)

**Origen:** IGN de Francia para el #30DayMapChallenge, «Les reliefs de Mayotte» ([Dispatch del 3 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge)).

**Por qué llama la atención:** el territorio se dibuja con puntos en una rejilla hexagonal regular y el tamaño de cada punto es la cantidad, como una trama de imprenta. No hay bordes ni rellenos, el mapa es una textura y las concentraciones se ven como manchas oscuras. Es el pariente plano del mapa de prismas de la ficha 02 y, en Plot, sale con una transformación nativa.

**Receta:**

1. Puntos de entrada: centroides de AGEB o de localidad con su conteo (o un punto por municipio si no hay más detalle).
2. `Plot.dot(datos, Plot.hexbin({r: "sum"}, {x: "lon", y: "lat", r: "personas", binWidth: 8}))` con la proyección del libro; `r: {range: [0, 4]}` para que el hexágono más lleno casi toque a sus vecinos.
3. Un solo color de tinta (gris oscuro o el verde azulado del tema) y, debajo, la silueta de la entidad en gris muy claro.
4. Rótulos de cinco a seis lugares con línea guía y un globo por hexágono con la suma y los municipios que agrupa.

**Filtros:** la entidad encuadra y la rejilla se recalcula a esa escala; sexo, edad y grupo cambian el tamaño de los puntos; con «Comparar con» se pintan en rojo los hexágonos donde el grupo supera un umbral.

**Ejemplo con migración:** viviendas con algún integrante desplazado de manera forzada, agregadas en hexágonos sobre la entidad elegida.

**Dificultad:** baja. **Encaje:** cabe.

### D08 · Unidades apiladas a ambos lados del eje

![Cuadros por año apilados hacia arriba para un partido y hacia abajo para el otro](referencias/dispatch/2026-11-10-12.jpg)

**Origen:** The New York Times, «There's No Modern Precedent for This Democratic Tsunami» ([Dispatch del 10 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index)).

**Por qué llama la atención:** sobre un eje horizontal de años, cada caso es un cuadro; los de un grupo se apilan hacia arriba en azul y los del otro hacia abajo en rojo pálido. Funciona como una pirámide acostada hecha de unidades contables: la altura de cada columna se cuenta a ojo y el contraste entre los dos lados es inmediato.

**Receta:**

1. Expandir cada valor a unidades («cada cuadro = N personas») en el loader.
2. `Plot.barY(unidades, Plot.stackY({x: "edad", y: d => d.grupo === A ? 1 : -1, fill: "grupo", inset: 1}))`; `stackY` apila los positivos hacia arriba y los negativos hacia abajo.
3. `Plot.ruleY([0])` grueso y los rótulos de los grupos dentro del lienzo, uno arriba y otro abajo.
4. Globo por columna con `Plot.pointerX`: categoría, personas de cada lado y diferencia.

**Filtros:** el eje x puede ser edad simple de 5 a 17 o año; la entidad y el grupo recalculan las columnas; el selector de «lados» decide qué se compara (hombres y mujeres, por violencia y por otra causa).

**Ejemplo con migración:** por cada año de edad de 5 a 17, niños arriba y niñas abajo entre quienes migraron por violencia; cada cuadro equivale a 500 personas.

**Dificultad:** baja. **Encaje:** cabe.

### D09 · Hemiciclo de unidades

![Hemiciclo de puntos por partido con el número de escaños al centro](referencias/dispatch/2026-11-03-03.jpg)

**Origen:** NBC News (Javier Zarracina) en el [Dispatch del 3 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-3-2026-midterm-elections-halloween-candies-and-the-30daymapchallenge); otra versión de Anadolu Agency en el del 27 de octubre (`2026-10-27-07.png`).

**Por qué llama la atención:** las unidades se acomodan en filas concéntricas de un semicírculo, con la cifra grande al centro. Se reconoce de inmediato como «un todo repartido», cabe en poco alto y admite resaltar un subgrupo como en las multitudes de la Plantilla.

**Receta:**

1. Calcular posiciones de `n` unidades en `k` filas de arco (radios de `r0` a `r1`), repartiendo puntos por fila en proporción a su longitud y ordenándolos por ángulo.
2. Asignar categorías por ángulo, de izquierda a derecha, para que cada una ocupe una cuña.
3. `Plot.dot` con `x`, `y` precalculados, `r` fijo y `fill` por categoría; `Plot.text` al centro con la cifra principal.
4. Debajo, la misma información como barra apilada delgada para quien no lee el abanico, y el detalle en la tabla.

**Filtros:** entidad, sexo y edad recalculan cuántas unidades van a cada cuña; el total de unidades se mantiene fijo («de cada 100») para que el abanico no cambie de tamaño.

**Ejemplo con migración:** de cada 100 personas de 5 a 17 años que migraron, cuántas lo hicieron por violencia, por motivos familiares, por trabajo o estudio y por otra causa.

**Dificultad:** media. **Encaje:** adaptada; la metáfora es parlamentaria y solo conviene con cuatro o cinco categorías ordenables.

### D10 · Fichas en renglones por rango, con trama de cambio

![Insignias hexagonales con siglas acomodadas en renglones por categoría](referencias/dispatch/2026-11-10-03.jpg)

**Origen:** The Guardian, «Where Trump and Republicans lost the midterms» ([Dispatch del 10 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index)).

**Por qué llama la atención:** cada unidad es una insignia con su abreviatura, acomodada en el renglón de su categoría; las que cambiaron de categoría llevan trama de rayas. Es una tabla que se ve como un objeto: se cuenta cuántas hay en cada rango y se identifica cada una por nombre sin buscar en un mapa.

**Receta:**

1. Por entidad: rango del indicador en el corte actual y en el anterior.
2. `x` = posición dentro del renglón (orden por valor), `y` = rango; `Plot.dot` con `symbol: "hexagon"`, `r: 14` y `fill` por rango.
3. `Plot.text` con la abreviatura en blanco o negro según el contraste medido; las que cambiaron de rango llevan un `pattern` SVG de rayas como relleno.
4. Globo: entidad, valor, rango anterior y rango actual.

**Filtros:** sexo, edad y grupo mueven insignias de renglón; el par de años define qué es «cambió»; la entidad elegida lleva borde grueso.

**Ejemplo con migración:** las 32 entidades en cinco renglones según el porcentaje de viviendas con desplazamiento forzado, con trama en las que subieron de rango entre 2020 y 2025.

**Dificultad:** baja. **Encaje:** cabe.

### D11 · Curvas acumuladas de dos cortes con flechas

![Dos curvas en S con flechas verticales que miden el cambio en varios umbrales](referencias/dispatch/2026-10-27-16.png)

**Origen:** Our World in Data, «No matter what poverty line you choose, the share of the global population below it has declined» ([Dispatch del 27 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices)).

**Por qué llama la atención:** dos distribuciones acumuladas (una por corte) y flechas verticales entre ellas en cinco o seis umbrales, cada una con su porcentaje en los dos extremos. Responde «da igual dónde pongas la línea» con una sola figura y evita discutir un único corte.

**Receta:**

1. En el loader, la distribución acumulada ponderada (con factor de expansión) del indicador por corte, en 50 a 100 puntos.
2. `Plot.line` por corte con `curve: "monotone-x"` y el color de cada corte.
3. Para una lista fija de umbrales, `Plot.arrow` de la curva antigua a la nueva y `Plot.text` con el porcentaje en cada extremo.
4. Eje x logarítmico si el indicador es de ingreso; globo con `Plot.pointerX` que dé la proporción por debajo del umbral en ambos cortes y las personas.

**Filtros:** entidad, sexo, edad y grupo recalculan ambas curvas; el par de cortes decide qué se compara.

**Ejemplo con migración:** proporción de personas de 5 a 17 años por debajo de cada nivel de escolaridad acumulada, quienes migraron por violencia frente a quienes no se movieron (en lugar de dos años, dos grupos).

**Dificultad:** media. **Encaje:** cabe.

### D12 · Mapa de burbujas por municipio con color de categoría

![Círculos por municipio de tamaño proporcional al margen y color por candidato ganador](referencias/dispatch/2026-10-27-02.png)

**Origen:** Arthur Welle, margen de votos por municipio en Brasil ([Dispatch del 27 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-27-2026-brazil-elections-apple-s-iphone-duo-and-coffee-prices)); con color secuencial, SUR sobre jugadores mundialistas por provincia (`2026-07-07-06.png`).

**Por qué llama la atención:** a diferencia de la coropleta, el tamaño del círculo es el número absoluto de personas y el color la categoría dominante; los municipios pequeños y extensos no pesan más de lo que deben y los grandes concentran la vista. Dos anotaciones sobre los círculos mayores bastan para orientar.

**Receta:**

1. Centroide, total de personas y categoría dominante por municipio.
2. `Plot.dot` con proyección, `r: "personas"` (escala raíz cuadrada, dominio fijo), `fill` por categoría con tres tonos y gris, `fillOpacity: 0.7`, `stroke: "white"`, ordenados de mayor a menor.
3. Fondo con `Plot.geo` de entidades en gris claro.
4. Anotaciones con `Plot.text` y `Plot.arrow` para los dos o tres mayores.

**Filtros:** entidad encuadra; sexo y edad cambian tamaños y, a veces, la categoría dominante; el año elige el corte.

**Ejemplo con migración:** municipios por número de personas que llegaron, con el color de la causa principal de llegada (violencia, familia, trabajo).

**Dificultad:** baja. **Encaje:** cabe.

### D13 · Galería de siluetas territoriales

![Pequeños múltiplos con la silueta de cada cuenca hidrográfica coloreada por dentro](referencias/dispatch/2026-11-10-32.jpg)

**Origen:** Terence, «States of water», #30DayMapChallenge ([Dispatch del 10 de noviembre](https://www.datawrapper.de/blog/data-vis-dispatch-november-10-2026-a-blue-wave-pi-and-the-pancake-index)).

**Por qué llama la atención:** cada territorio aparece aislado, con su propia forma reconocible y coloreado por dentro, en una rejilla ordenada por una cifra. La forma del territorio funciona como rótulo y la rejilla permite comparar 30 o 40 unidades que en un mapa nacional quedarían diminutas.

**Receta:**

1. Una gráfica pequeña por entidad, cada una con `projection: {type: "mercator", domain: entidad}` para que la silueta llene su casilla.
2. `Plot.geo` de los municipios de esa entidad con el color del indicador, escala de umbrales compartida entre todas las casillas.
3. Rejilla CSS de 4 a 8 columnas, ordenada por el valor de la entidad; nombre y cifra bajo cada silueta.
4. Un solo ResizeObserver para todas las casillas, como en el resto de la Plantilla.

**Filtros:** sexo, edad y grupo recolorean todas las siluetas a la vez; el año cambia el corte; elegir una entidad la lleva al principio y la agranda; el orden se recalcula con el filtro.

**Ejemplo con migración:** las 32 entidades con sus municipios coloreados por el porcentaje de viviendas con desplazamiento forzado, ordenadas de mayor a menor.

**Dificultad:** media. **Encaje:** cabe.

### D14 · Triángulo ternario con estelas

![Triángulo de composición en tres partes con la trayectoria de cada condado](referencias/dispatch/2026-06-02-04.jpg)

**Origen:** USAFacts, reseñado por FlowingData como «Voters shifting away from the two-party system» ([Dispatch del 2 de junio](https://www.datawrapper.de/blog/data-vis-dispatch-june-2-2026-extreme-weather-gambling-and-the-swiss-alps)).

**Por qué llama la atención:** cada unidad es un punto dentro de un triángulo cuyos vértices son el 100 por ciento de cada una de tres categorías, y una estela muestra cómo se movió entre cortes. Se ve de un golpe hacia qué vértice se desplaza todo el conjunto y cuáles unidades van a contracorriente.

**Receta:**

1. En el loader, por unidad y corte, las tres proporciones `a + b + c = 1` y su posición baricéntrica: `x = b + c/2`, `y = c·√3/2`.
2. Marco del triángulo con `Plot.line`, líneas guía cada 25 por ciento con `Plot.link` y rótulos de vértice fuera del área.
3. `Plot.line` con `z` = unidad para la estela (opacidad 0.3) y `Plot.dot` en el último corte, con tamaño por población y color por la categoría dominante.
4. Globo con las tres proporciones y la población; una gráfica pequeña de «cómo leer» con un solo punto de ejemplo.

**Filtros:** la entidad pasa de 32 puntos a los municipios de esa entidad; sexo y edad recalculan proporciones; con dos cortes la estela es un segmento, con tres o más es una curva.

**Ejemplo con migración:** composición de las causas de migración (violencia, familia, trabajo y estudio agrupados) por entidad en 2020 y 2025, con la estela marcando hacia qué causa se movió cada entidad.

**Dificultad:** media. **Encaje:** cabe; exige reducir a tres categorías.

### D15 · Pares de círculos superpuestos

![Pares de círculos por país, el de 2019 en gris detrás y el de 2025 encima en color](referencias/dispatch/2026-06-02-07.png)

**Origen:** The European Correspondent, «Are Europeans still going to the US?» ([Dispatch del 2 de junio](https://www.datawrapper.de/blog/data-vis-dispatch-june-2-2026-extreme-weather-gambling-and-the-swiss-alps)).

**Por qué llama la atención:** por país, un círculo gris para el corte anterior y encima uno de color para el actual, con el área proporcional a la cantidad; el anillo gris que asoma es lo que se perdió y el color dice si subió o bajó. La rejilla ordenada por tamaño hace que la vista baje de lo grande a lo pequeño.

**Receta:**

1. Por entidad, cantidad en dos cortes y cambio relativo.
2. Posiciones en rejilla (o `fx`/`fy` por índice) ordenadas por la cantidad del corte reciente.
3. Dos `Plot.dot` con la misma escala `r` de dominio fijo: el anterior en gris sin borde y el actual con `fill` en rojo o azul según el sentido y `fillOpacity: 0.85`.
4. Nombre y cambio en por ciento bajo cada par; globo con ambas cifras.

**Filtros:** sexo, edad y grupo cambian ambos círculos; el par de cortes es el selector de año; la entidad pasa a sus municipios mayores.

**Ejemplo con migración:** personas de 5 a 17 años que llegaron por violencia a cada entidad en 2020 (gris) y en 2025 (color).

**Dificultad:** baja. **Encaje:** cabe.

### D16 · Burbujas empaquetadas por grupo

![Burbujas de banderas agrupadas por liga, de tamaño proporcional al número de jugadores](referencias/dispatch/2026-06-16-04.png)

**Origen:** The European Correspondent, «A very European cup» ([Dispatch del 16 de junio](https://www.datawrapper.de/blog/data-vis-dispatch-june-16-2026-the-swiss-population-cap-1-77-trillion-and-el-nino)).

**Por qué llama la atención:** las unidades se empaquetan en racimos, uno por grupo, con el área proporcional a la cantidad; el racimo entero da el total del grupo y cada burbuja su parte. Es un treemap redondo que se lee más suelto y donde las unidades pequeñas siguen visibles.

**Receta:**

1. `d3.hierarchy` con dos niveles (grupo → unidad) y `d3.pack().size([w, h]).padding(3)`.
2. `Plot.dot` con `x`, `y` y `r` precalculados (`r: {type: "identity"}`), `fill` por grupo y opacidad 0.8.
3. Rótulo dentro de las burbujas que superan unos 18 px de radio y nombre del grupo sobre su racimo.
4. Globo con unidad, grupo, cantidad y porcentaje del grupo.

**Filtros:** sexo, edad y año recalculan el empaquetado; la entidad elegida queda resaltada en su racimo y las demás al 30 por ciento de opacidad.

**Ejemplo con migración:** municipios de destino de quienes migraron por violencia, agrupados por entidad, con el área igual al número de personas que llegaron.

**Dificultad:** media. **Encaje:** cabe.

### D17 · Cartograma de cuadros con columnas por región

![Mapa de cuadrados por distrito con columnas apiladas por región a los lados](referencias/dispatch/2026-10-06-20.jpg)

**Origen:** The Guardian, «How could Great Britain look under proportional representation?» ([Dispatch del 6 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-6-2026-brazil-elections-flydubai-plane-ice-melting)); la imagen guardada es la portada de la pieza original.

**Por qué llama la atención:** un cuadro por unidad pequeña acomodado como el territorio y, junto a cada región, una columna corta apilada con su composición. El mapa enseña dónde y la columna lateral resume la región sin tapar el mapa.

**Receta:**

1. Rejilla de municipios (hexagonal o cuadrada) generada una vez y guardada como CSV de posiciones.
2. `Plot.cell` o `Plot.dot` con `symbol: "square"` y color por categoría.
3. Para cada región, un `Plot.barY` apilado pequeño colocado en la posición de su etiqueta, con línea guía.

**Filtros:** la entidad encuadra la rejilla; sexo, edad y año recolorean cuadros y recalculan columnas.

**Ejemplo con migración:** municipios de una región coloreados por la causa principal de salida y, al lado, la composición de causas de la región.

**Dificultad:** media. **Encaje:** cabe; la rejilla de municipios hay que generarla y validarla una vez.

### D18 · Silueta rellena de unidades

![Silueta de una rana hecha de puntos, con franjas de color por familia](referencias/dispatch/2026-10-20-28.png)

**Origen:** Georgios Karamanis, «One frog, 8,018 species», #TidyTuesday en Bluesky ([Dispatch del 20 de octubre](https://www.datawrapper.de/blog/data-vis-dispatch-october-20-2026-work-friendships-heat-storms-and-expensive-stamps)).

**Por qué llama la atención:** las unidades (cada punto vale cinco especies) llenan la silueta del propio tema, y el color se reparte en franjas verticales por categoría, con una regla debajo que da el nombre y la cifra de cada franja. Es un waffle que tomó la forma del objeto: se lee como una barra apilada, porque las franjas son contiguas, y a la vez como una imagen.

**Receta:**

1. Elegir una silueta con significado para la sección (el contorno del país o de la entidad, o una figura infantil en SVG) y convertirla en polígono.
2. Generar una rejilla hexagonal de puntos y quedarse con los que caen dentro del polígono (`d3.polygonContains`); ajustar el paso de la rejilla hasta que el número de puntos sea el total dividido entre el valor de la unidad.
3. Ordenar los puntos por `x` y asignar categorías por cortes acumulados, para que cada categoría ocupe una franja vertical.
4. `Plot.dot` con `x`, `y` precalculados, `r` fijo y `fill` por categoría; la categoría de contexto en gris.
5. Debajo, `Plot.ruleX` y `Plot.text` con el nombre y la cifra de cada franja, alineados con sus bordes.

**Filtros:** sexo, edad y año recalculan los cortes y las franjas se ensanchan o se angostan; el número de puntos cambia con el total, por lo que conviene fijar el valor de la unidad por sección para que dos estados del filtro sean comparables; la entidad cambia la silueta si la silueta es el territorio.

**Ejemplo con migración:** la silueta de México llena con un punto por cada 1,000 personas de 5 a 17 años que cambiaron de residencia, con franjas por causa (violencia en rojo, otras causas en tonos de gris y verde azulado).

**Dificultad:** media. **Encaje:** cabe; la silueta debe representar el dato y no adornarlo.

### 8.3 TOP 8 para construir a continuación

El orden combina dos juicios. El impacto visual se estimó mirando las capturas a tamaño de hoja de contacto, que es lo más parecido a cómo se ve una sección al pasar por ella; la utilidad, por cuántas de las preguntas del libro de migración responde la forma y por lo bien que reacciona a los filtros. Se dejaron fuera formas vistosas cuya construcción no cabe en una sección (la flor de unidades, la barra serpenteante) y formas útiles que la Plantilla ya cubre de otra manera (la banda de percentiles frente a `franjas`).

| Lugar | Forma | Ficha | Por qué | Dificultad |
|---|---|---|---|---|
| 1 | Mapa de flechas inclinadas por unidad | D01 | Es la forma más llamativa de la revisión y la única que enseña el sentido y el tamaño del cambio de cada municipio a la vez; responde directamente «dónde subió y dónde bajó la migración por violencia entre 2020 y 2025» y cada filtro cambia el largo o el sentido de las flechas | Media |
| 2 | Flujos que bajan de una barra al mapa | D06 | Une en una figura la composición de las salidas y su destino geográfico, que en la Plantilla hoy exige un sankey y un mapa de flechas por separado | Alta |
| 3 | Mosaico de triángulos partidos | D04 | Reutiliza la rejilla de `mosaico.js` y le añade una segunda variable; dos cortes o dos grupos en las 32 entidades caben en un cuadro de 600 px | Media |
| 4 | Triángulo ternario con estelas | D14 | Es la forma natural para causas de migración en tres categorías y su cambio entre cortes; no hay nada parecido en la Plantilla | Media |
| 5 | Riel de trayectoria con flecha final | D03 | Resuelve el caso de tres cortes (2015, 2020, 2025) que el dumbbell y la pendiente no resuelven bien; se construye con tres marcas nativas | Baja |
| 6 | Unidades apiladas a ambos lados del eje | D08 | Convierte la comparación por edad y sexo en algo contable sin repetir la pirámide; complementa a `multitud` y `histograma-unidades` | Baja |
| 7 | Mapa de semitonos sobre rejilla hexagonal | D07 | Da un mapa de concentración muy vistoso con una sola transformación de Plot (`hexbin`) y evita el problema de la coropleta con municipios grandes y vacíos | Baja |
| 8 | Mosaico de fracciones | D05 | Lleva «k de cada 100» a las 32 entidades a la vez, con lectura doble por ángulo y color, sobre la misma rejilla que D04 | Media |

De manera general, el orden propuesto permite construir primero dos piezas de dificultad baja (D03 y D08) que ya sirven en el libro, reutilizar después la rejilla del mosaico en D04 y D05, y dejar para el final la pieza alta (D06), que conviene empezar con el mapa de flechas de D01 ya resuelto porque comparte la proyección y la lógica de origen y destino.

### 8.4 Cobertura de la revisión

Se abrieron las 22 entregas del Dispatch y las 12 de Weekly Charts; todas respondieron con HTTP 200. En total se miraron 339 imágenes: 139 capturas del propio Dispatch, 163 imágenes de portada de las piezas reseñadas y 37 de Weekly Charts (32 gráficas de Datawrapper exportadas como PNG y 5 imágenes de apoyo de las entradas). De ellas se guardaron 41 en `referencias/dispatch/`, las que muestran una forma que no estaba en la Plantilla ni en las 18 fichas; la de 2026-08-04-08 pesaba más de 2 MB y se guardó reducida a 2,000 px de lado.

| Entrega del Dispatch | Imágenes en la entrega | Capturas del Dispatch vistas | Portadas de la pieza original vistas |
|---|---|---|---|
| 10 nov 2026 | 40 | 40 | 0 |
| 3 nov 2026 | 38 | 38 | 0 |
| 27 oct 2026 | 34 | 29 | 3 |
| 20 oct 2026 | 33 | 4 | 15 |
| 13 oct 2026 | 25 | 3 | 10 |
| 6 oct 2026 | 42 | 2 | 15 |
| 29 sep 2026 | 26 | 2 | 10 |
| 22 sep 2026 | sin copia | 0 | 0 |
| 15 sep 2026 | sin copia | 0 | 0 |
| 8 sep 2026 | 31 | 2 | 14 |
| 1 sep 2026 | 21 | 2 | 10 |
| 11 ago 2026 | 31 | 0 | 13 |
| 4 ago 2026 | 25 | 2 | 13 |
| 28 jul 2026 | 28 | 2 | 13 |
| 21 jul 2026 | 25 | 2 | 14 |
| 14 jul 2026 | 46 | 2 | 15 |
| 7 jul 2026 | 22 | 2 | 4 |
| 30 jun 2026 | 31 | 2 | 2 |
| 23 jun 2026 | 30 | 2 | 2 |
| 16 jun 2026 | 28 | 2 | 3 |
| 9 jun 2026 | 32 | 0 | 2 |
| 2 jun 2026 | 24 | 1 | 5 |

Las limitaciones son tres y conviene tenerlas a la vista. La primera es que las entregas anteriores al 3 de noviembre se vieron de forma parcial: el sitio de Datawrapper dejó de servir sus imágenes (el contenido llega con el campo de imagen vacío y los archivos de `kirby.datawrapper.de` responden 404), y la copia del Internet Archive, que sí las conserva, devolvió HTTP 429 desde las primeras decenas de descargas y siguió limitando a una imagen cada dos o tres minutos. La segunda es que la portada de una pieza original (`og:image`) no siempre es la gráfica que reseñó el Dispatch: en The Guardian, la BBC y varios diarios es una fotografía, y en LinkedIn es el logotipo, por lo que menos de la mitad de las 163 portadas muestra una gráfica. La tercera es que las entregas del 15 y del 22 de septiembre no tienen ninguna copia en el archivo y no se pudieron ver. Con esto, la revisión es completa para el 3 y el 10 de noviembre y para Weekly Charts, casi completa para el 27 de octubre y una muestra en las demás; si se quiere cerrar el hueco, basta con volver a correr la descarga desde el archivo con una espera de unos 20 segundos entre imágenes, lo que tomaría unas tres horas para las 470 imágenes pendientes.
