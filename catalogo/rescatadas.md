# Formas rescatadas para el catálogo

Este documento justifica las 22 fichas de `fichas/rescatadas.js` y deja registradas las candidatas que se revisaron y no entraron, para no volver a discutirlas. Las fichas siguen el contrato común de `fichas/base.js` (script clásico que añade a `window.FICHAS`), dibujan una receta viva con Plot, D3 o HTML y se prueban en `prueba-rescatadas.html`, que reproduce el bloque base y los datos de ejemplo del catálogo con las mismas versiones de d3 (7.9.0) y Plot (0.6.17). Todas las cifras son de ejemplo.

## 1. Criterio

Se partió de cinco fuentes: las fichas de `CatalogoVisualizacion.md` y las secciones 9 a 11 de `GuiaVisualizacion.md`, las secciones 2, 3, 4, 5 y 8 de `formas-novedosas.md` (las 18 formas de referencia, los 33 tipos marcados de Data Viz Project y el índice D01 a D36 del Data Vis Dispatch), la tabla maestra de `README.md`, y las restricciones de `colores.md` y de `REGLAS.md` (R75, R76, R77, R93, R99, R100, R107 y R116). Antes de proponer una forma se comprobó que no tuviera ficha en `base.js` (43) ni en `plantilla.js` (22), ni componente en `src/components/formas/` (40 archivos).

Una candidata se rescató cuando cumplía las cuatro condiciones siguientes: sirve a un libro de datos de encuestas del INEGI para el público (migración, violencia, educación y pueblos indígenas, con preguntas de comparación entre grupos, territorio, cambio entre cortes, origen y destino, composición y precisión de las estimaciones); no está en «Formas que no usamos» ni en R75; no duplica una ficha o un componente existente; y se lee sin instrucciones. Entre dos candidatas parecidas se prefirió la que abría una familia o una forma de entrada que el catálogo no cubría. Por esto se dio peso a la familia Tabla, que no tenía ninguna ficha, a la entrada `intervalos` (precisión de las estimaciones) y a la función Concepto, que es la que explica quién cuenta en un indicador.

## 2. Fichas nuevas

| Ficha (`id`) | Nivel | Familia | Función | Entrada | Forma |
| --- | --- | --- | --- | --- | --- |
| Tabla con barras en la celda (`tabla-barras`) | Básico | tabla | comparacion | categoria-valor | barras, cuadrado |
| Tabla de calor (`tabla-calor`) | Intermedio | tabla | comparacion, distribucion | cruce | cuadrado |
| Tabla con minigráficas (`tabla-minigraficas`) | Intermedio | tabla | tiempo, comparacion | serie-tiempo, categoria-valor | linea, cuadrado |
| Tabla de estimaciones con su precisión (`tabla-precision`) | Intermedio | tabla | comparacion, distribucion | intervalos, categoria-valor | linea, puntos, cuadrado |
| Tabla origen-destino con totales (`tabla-od`) | Avanzado | tabla | flujo, comparacion | origen-destino | cuadrado, barras |
| Puntos con intervalo de confianza (`puntos-intervalo`) | Intermedio | trazado | comparacion, distribucion | intervalos, categoria-valor | puntos, linea |
| Diferencia con su margen de error (`diferencia-margen`) | Avanzado | trazado | comparacion | intervalos | puntos, linea |
| Gráfico de rango (`rango`) | Intermedio | trazado | distribucion, comparacion | intervalos, distribucion | linea, puntos |
| Puntos de tres series por fila (`puntos-series`) | Intermedio | trazado | comparacion | categoria-series | puntos, linea |
| Entradas y salidas con saldo (`saldo`) | Intermedio | grafica | flujo, comparacion | categoria-series, origen-destino | barras |
| Curvas acumuladas de dos grupos con flechas (`curvas-acumuladas`) | Avanzado | grafica | distribucion, comparacion | distribucion | linea |
| Curva de concentración (`concentracion`) | Avanzado | grafica | distribucion, geolocalizacion | distribucion, geo-valor | linea, area |
| Línea con banda de confianza (`linea-banda`) | Intermedio | grafica | tiempo, distribucion | serie-tiempo, intervalos | linea, area |
| Línea de vida de cortes comparables (`cortes-comparables`) | Intermedio | grafica | tiempo, concepto | intervalos, serie-tiempo | linea, puntos |
| Fichas por rango con marca de cambio (`fichas-rango`) | Intermedio | grafica | unidades, comparacion | geo-valor, dos-cortes | hexagono |
| Combinaciones de condiciones, UpSet (`combinaciones`) | Avanzado | grafica | parte-todo, comparacion | conteo, partes | barras, puntos |
| Diagrama de Euler de dos conjuntos (`euler`) | Avanzado | diagrama | parte-todo, concepto | conteo, partes | circulo |
| Árbol de la pregunta (`arbol-pregunta`) | Intermedio | diagrama | concepto, parte-todo | conteo, jerarquia | cuadrado, linea |
| Embudo de universos (`embudo`) | Intermedio | diagrama | parte-todo, concepto | conteo, partes | barras, area |
| Árbol de clasificación (`arbol-clasificacion`) | Intermedio | diagrama | jerarquia, concepto | jerarquia | linea, puntos |
| Mosaico de mini-series (`mosaico-series`) | Avanzado | mapa | tiempo, geolocalizacion | geo-valor, serie-tiempo | linea, cuadrado, mapa |
| Mosaico de burbujas con dos medidas (`mosaico-burbujas`) | Avanzado | mapa | geolocalizacion, comparacion | geo-valor, conteo | circulo, mapa |

El reparto queda en cinco tablas, cuatro trazados, siete gráficas, cuatro diagramas y dos mapas, y doce de las quince formas de entrada aparecen al menos una vez (faltan `dos-medidas`, `tres-partes` y `geo-puntos`, que ya cubren la dispersión, el ternario y los mapas de puntos). La función Concepto, que el catálogo no tenía, entra con cinco fichas, de las cuales el árbol de la pregunta y el embudo de universos responden directamente a la necesidad del libro de migración de explicar quién cuenta como migrante por violencia y por qué la cifra final es pequeña.

Los mapas usan la rejilla de entidades del propio catálogo (`ENT`, columnas y filas) y no necesitan geojson, por lo que no se añadió nada a `catalogo/datos/`. Se descartó incluir un geojson simplificado porque las dos formas que lo habrían pedido (galería de siluetas y cartograma de cuadros municipales, sección 3) necesitan geometría municipal, que no cabe en un archivo pequeño, y las dos fichas de mapa rescatadas se leen mejor en la rejilla, donde Tlaxcala y la Ciudad de México pesan lo mismo que Chihuahua.

## 3. Candidatas revisadas

| Forma | De dónde sale | Se rescata | Por qué |
| --- | --- | --- | --- |
| Tabla con barras en la celda | Datawrapper, tablas; DVP Table Chart | Sí | La familia Tabla no tenía fichas, y es lo que el lector busca cuando quiere encontrar su entidad y leer la cifra exacta |
| Tabla de calor | Datawrapper, tablas; DVP Heat Map | Sí | El heatmap de Plot no admite columnas de texto ni se lee como tabla; aquí cada celda imprime la cifra y el color repite la misma cifra con dominio fijo |
| Tabla con minigráficas | DVP Sparkline; Datawrapper, tablas | Sí | Resuelve «cómo le fue a mi entidad» con cinco o más cortes sin repetir 32 gráficas |
| Tabla de estimaciones con su precisión | CV Barras con intervalo; criterio de coeficiente de variación del INEGI | Sí | Es la tabla de respaldo que exigen las estimaciones de grupos pequeños, con precisión alta, moderada o baja a la vista |
| Matriz origen-destino ordenada | Ejemplo del encargo; CV Matriz de flujo | Sí, como `tabla-od` | La matriz de adyacencia ya existe en `base.js`; se rescata la versión en tabla con totales de salida y llegada, que es como el INEGI publica la matriz y añade una pregunta que la ficha existente no responde |
| Puntos con intervalo de confianza | DVP Dot Plot y Error Bars; Datawrapper range plots | Sí | No hay ficha de intervalos por grupo; los puntos de cuantiles de `base.js` sirven para dos lugares, no para ordenar doce |
| Barras con barra de error | CV Barras con intervalo | No | La barra ancla la lectura en el cero y el bigote queda tapado por la propia barra; los puntos con intervalo dicen lo mismo con menos tinta |
| Diferencia con su margen de error | CV Barras divergentes; R98 | Sí | Aplica la regla del gris de «no cambia» con error muestral; absorbe a las barras de desviación respecto al nacional |
| Barras divergentes de desviación | CV Barras divergentes | No, absorbida | Queda dentro de `diferencia-margen`, que añade el intervalo |
| Gráfico de rango (span) | DVP Span Chart (★) | Sí | Muestra que el promedio estatal esconde municipios extremos; las franjas con mediana responden cómo se reparten, no cuánto se separan los extremos |
| Puntos de tres series (Cleveland) | DVP Dot Chart; Datawrapper dot plots | Sí | El dumbbell se limita a dos grupos y remite a barras agrupadas para tres; los puntos en un renglón se leen mejor |
| Dumbbell con flecha | Datawrapper arrow plot | No | Con dos cortes es el riel de trayectoria (`riel`, D03) con un solo tramo |
| Pendiente con muchas unidades | Ejemplo del encargo | No | Ya está en `pendiente` y en `destacadas` (líneas con grupo destacado) |
| Entradas y salidas con saldo | DVP Butterfly Chart (★); colores.md 2.4 | Sí | El saldo neto esconde flujos grandes que se cancelan; usa la declaración «salen» en rojo y «llegan» en azul del libro de migración |
| Pequeños múltiples de líneas | Ejemplo del encargo; README «Mosaico de mini-series, por construir» | Sí, como `mosaico-series` | Estaba pendiente en la tabla maestra; en pantalla ancha usa la rejilla del país y en 390 px pasa a cuatro columnas ordenadas por valor |
| Mapa de símbolos con dos variables | Ejemplo del encargo; D12 | Sí, como `mosaico-burbujas` | Tamaño para el conteo y color para la tasa, sin caer en la coropleta de conteos (R77); se adapta a la rejilla porque D12 necesita centroides municipales |
| Cartograma de rejilla hexagonal | Ejemplo del encargo | No | Es el mosaico de entidades (`teselas`, componente `mosaico`) con otra forma de casilla |
| Waffle de entidades | Ejemplo del encargo | No, absorbido | Queda en `fichas-rango` (D10), que agrupa las 32 entidades por rango y marca las que cambiaron |
| Fichas en renglones por rango | D10 | Sí | No tenía componente; se lee como tabla y como objeto a la vez |
| Isotipo | CV Isotipo; DVP Pictorial Unit Chart | No | Cubierto por `multitud`, `fraccion`, `pila` e `histograma-unidades` |
| Línea de vida de cortes (Gantt) | DVP Gantt Chart y Timeline | Sí | Responde qué ediciones se pueden comparar; los quiebres de ejemplo vienen de casos reales del proyecto (nueva serie de la ENIGH en 2016, escala de nivel aprobado en 2024) |
| Curvas acumuladas de dos cortes | D11 | Sí | Evita discutir un solo umbral; aquí compara dos grupos en tres niveles de escolaridad |
| Curva de concentración (Lorenz) | CV Curva de Lorenz | Sí | Responde qué tan concentrado está un total en pocos municipios, pregunta central del territorio indígena |
| Diagrama de Pareto | CV Diagrama de Pareto | No | Con muchos municipios la curva de concentración dice lo mismo sin 2,469 barras |
| Línea con banda de confianza | CV Línea más banda; DVP Range Area y Fan Chart | Sí | Las series trimestrales de la ENOE necesitan mostrar qué cambios caben en el error |
| Gráfica de diferencia entre dos líneas | CV Gráfica de diferencia | No | Cubierta por `areas-superpuestas` (ficha 06) |
| Diagrama de Venn o Euler de dos conjuntos | DVP Venn y Euler | Sí, solo dos conjuntos | Hablar una lengua indígena y considerarse indígena es un traslape real del dato; con dos conjuntos las áreas pueden ser proporcionales |
| Venn de tres conjuntos | DVP Venn | No | Con tres conjuntos las áreas ya no pueden ser proporcionales; para tres o cuatro condiciones va `combinaciones` (UpSet) |
| Combinaciones de condiciones (UpSet) | Lex y colaboradores (2014) | Sí | Carencias que se acumulan en el mismo hogar; las barras dan la cifra y la matriz de puntos dice cuáles |
| Árbol de decisión de la pregunta | Ejemplo del encargo; DVP Flow Chart | Sí | Explica el indicador antes de mostrarlo; va una vez por capítulo |
| Embudo de universos | Ejemplo del encargo; DVP Funnel Chart | Sí | Cada barra es el cien por ciento del paso anterior, con lo que el lector ve por qué el denominador se achica |
| Árbol de clasificación (dendrograma) | CV Árbol jerárquico; DVP Dendrogram | Sí | Familias y agrupaciones del Catálogo INALI; treemap e icicle comparan tamaños, no muestran la clasificación |
| Mapa de flujos con matriz | Ejemplo del encargo | No | Cubierto por `mapaFlujos`, `barraMapa`, `sankey` y la matriz |
| Hemiciclo de unidades | D09 | No | Metáfora parlamentaria; solo sirve con cuatro o cinco categorías ordenables y compite con el waffle |
| Pares de círculos superpuestos | D15 | No | Compara áreas de círculo, que el ojo subestima; `riel`, `pendiente` y `pila` responden el cambio con longitud |
| Burbujas empaquetadas por grupo | D16 | No | Es empaquetado de círculos (R75) |
| Galería de siluetas territoriales | D13 | No | Necesita geometría municipal de las 32 entidades; se deja para cuando el catálogo tenga un loader de geodatos |
| Cartograma de cuadros con columnas | D17 | No | Pide una rejilla municipal generada y validada aparte |
| Antes y después en cuadros de unidades | D19 | No | Necesita las mismas unidades en los dos cortes (R78); para entidades lo cubre `fichas-rango` |
| Ladera con nivel de agua, sankey de hilos, triángulos por año, barras isométricas, treemaps de dos cortes, banda de percentiles, tira por corte, distribuciones con umbral, trayectorias verticales | D20 a D28 | No | Dependen de interacción continua, de series largas o duplican `franjas`, `destacadas`, `treemap` y `sankey`; los treemaps lado a lado están vetados por R77 |
| Flor de unidades, rosa polar, barra serpenteante, columnas de racha, barras radiales, tiras de eventos, reloj radial | D29 a D36 | No | Radiales (R75), sin ciclos en los censos o con datos de eventos que las encuestas no traen; el Dorling (D34) ya es ficha |
| Coordenadas paralelas, matriz de burbujas, dispersión facetada, cifra con minigráfica, gráfica con anotación | CV | No | No se leen sin instrucciones, o duplican `heatmap`, `dispersion`, `cifra` y `anotaciones` |
| Gráfico de bala (bullet) | DVP Bullet Graph | No | Las encuestas del INEGI casi nunca traen una meta contra la cual medir |
| Diagrama de Lexis, mapa OD, mapa de collar | Xenographics (sección 5) | No | Piden una leyenda que se aprende |

## 4. Convenciones de las recetas

Cada receta usa solo los globales del catálogo (`T`, `TIPO`, `ESTILO`, `HALO`, `GLOBO`, `FUENTE`, `titulo`, `subtitulo`, `pie`, `punto`, `formatear`, `diferencia`, `poblacion`, `colorCambio`, `ENT`, `azar`, `Plot` y `d3`) y no redefine ninguno. El archivo vive dentro de una función que se ejecuta al cargar, y la única pieza compartida es `globoHTML(contenedor)`, que da a las cinco tablas el mismo globo que `Plot.tip` (tamaño, relleno y contorno de la fila o celda bajo el puntero o el foco) y se publica también como `window.globoHTML` para que el código copiado de una ficha de tabla funcione en el catálogo.

En color se aplicaron tres decisiones. La primera es que la serie única y las magnitudes no van en rojo: cada receta toma `T.serie` si el catálogo lo define y, mientras no exista, el ocre de `T.categorica[2]`, que coincide con el tono `ocre` validado en `paleta.js`; el rojo y el azul quedan para lo que el libro declara (salen y llegan, por debajo y por encima del nacional, bajó de rango). La segunda es que las tablas de calor escriben la cifra siempre en `T.tinta` y su rampa se recorta, en cada tema, al tramo que conserva 4.5:1 contra esa tinta; se llegó a esto porque, con tinta clara u oscura según la luminosidad, las celdas del tramo medio del ocre quedaban entre 3.5:1 y 4.46:1 con cualquiera de las dos. La tercera es que las clases ordenadas de `fichas-rango` se reparten en cinco pasos igual de separados en luminosidad, con el más claro a 2:1 o más del fondo.

El globo lleva tres o cuatro renglones (dimensión, grupo, valor y población) y el contorno de hover usa `Plot.pointerY` o `Plot.pointerX` según el eje categórico, con `maxRadius: Infinity`. `Plot.pointer` a secas se usa solo donde los dos ejes son posición en una rejilla o en un diagrama (`fichas-rango`, `mosaico-burbujas`, `euler`, `arbol-pregunta`). En `euler` no hay contorno de la región, porque la lente no es una marca de Plot; el globo sí aparece en las tres regiones.

## 5. Verificación

La verificación se hizo con Playwright sobre Edge (`channel: "msedge"`) contra `prueba-rescatadas.html`, en 1366 y 390 px y en tema claro y oscuro, con el script `verificar-rescatadas.mjs` del directorio temporal de la sesión. En las cuatro combinaciones la consola quedó en cero errores, las 22 recetas dibujaron marcas reales (de 3 círculos y una línea en `euler` a 128 marcas en `mosaico-series`, y de 33 a 64 celdas en las tablas), no hubo desborde de página ni dentro del lienzo, y axe-core no reportó violaciones serias o críticas propias de las fichas. La única que persiste es de contraste en el tema oscuro: los 22 títulos que genera `titulo()` del bloque base usan `T.rojo` (#E8474F) sobre #1E1E1C, que da 4.32:1; afecta igual a las fichas de `base.js` y se corrige en el bloque base, no en las recetas (R40 ya pide el título en tinta oscura). Una prueba de hover sobre las 22 fichas confirmó que cada una abre su globo con tres o cuatro renglones y dibuja el contorno.

Las paletas que las recetas dibujan de verdad se leyeron del SVG y se pasaron por `scripts/validate_palette.js` de la Plantilla. Las clases ordenadas de `fichas-rango` pasan todas las pruebas en claro y en oscuro. Las dos paletas categóricas (`diferencia-margen` con rojo, gris y azul, y `puntos-series` con ocre y dos grises) pasan la separación con daltonismo, la separación con visión normal y el contraste con el fondo, y fallan solo las pruebas de croma y de banda de luminosidad en sus grises, que son grises a propósito porque significan «no se distingue del margen» y «grupo de comparación»; en `puntos-series` el gris claro lleva además contorno y cada serie su símbolo. Para que la paleta de signo pasara la separación con protanopía en oscuro, el gris se elige en la receta como el que más se aleja del rojo en luminosidad. Las rampas continuas de las tablas y del mosaico de burbujas empiezan cerca del fondo por diseño, porque el valor cero es el fondo; su paso más claro no alcanza 2:1 y las celdas se distinguen por la cifra escrita y el borde.

## 6. Pendiente

Quedan cuatro puntos abiertos. El primero es el contraste de `titulo()` en tema oscuro, que corresponde al bloque base del catálogo. El segundo es que, en tema oscuro, la rampa de las tablas de calor queda corta (llega a 0.68 del camino al ocre), por lo que las diferencias entre celdas se apoyan más en la cifra que en el color; si se decide que la tinta cambie de clara a oscura dentro de la tabla habría que aceptar celdas por debajo de 4.5:1. El tercero es que los rangos de precisión por coeficiente de variación (alta por debajo de 15 por ciento, moderada hasta 30 y baja desde 30) se citan como criterio del INEGI con verificación pendiente, porque no se localizó todavía el documento exacto que los publica; la ficha lo dice en su referencia. El cuarto es que los quiebres de `cortes-comparables` para la ENDIREH anterior a 2016 son ilustrativos y cada libro debe confirmarlos en la documentación de la encuesta, como dice el pie de la figura.
