---
title: Metodología
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Cómo se hizo</span>
  <h1><span class="clave">Metodología</span></h1>
  <p class="capitulo-entradilla">El método de cada análisis vive aquí, una sola vez. Los apartados se agrupan por método compartido y cada gráfica enlaza al suyo con el botón «Cómo se calculó».</p>
</header>

<!--
  PLANTILLA DE APARTADO. Cada apartado lleva:
    - un <h2 id="m-…" class="toc-anchor"> con el texto del título (índice);
    - un encabezado visible cuyo antetítulo dice a qué análisis sirve;
    - el supuesto con un ejemplo numérico llano, su prueba con cifras y las
      alternativas que se descartaron.
  Se actualiza en el mismo commit que la gráfica.
-->

<h2 id="m-fuentes" class="toc-anchor">Fuentes y universos</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Todos los análisis</span>
  <p class="metodo-titulo" aria-hidden="true">Fuentes y universos</p>
</div>
<div class="texto-largo">

Esta plantilla no usa ninguna fuente real. Todas las cifras son datos de muestra que genera el script `scripts/generar_muestra.mjs` con una semilla fija, de modo que dos corridas producen los mismos archivos. Los nombres de las 32 entidades se usan solo para que los mapas, el mosaico y los filtros tengan con qué dibujarse <a class="cita" href="./referencias#muestra-2026">(Datos de muestra, 2026)</a>.

En un libro real, este apartado dice de qué programa estadístico sale cada dato, cuál es su universo (por ejemplo, la población de 5 años y más) y qué ediciones no son comparables entre sí. Las fuentes se citan una vez, en Referencias, con una entrada por programa estadístico.

</div>

---

<h2 id="m-indicador" class="toc-anchor">Porcentaje por entidad</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Sección modelo · 01 · Comparación · Mapas</span>
  <p class="metodo-titulo" aria-hidden="true">Porcentaje por entidad</p>
</div>
<div class="texto-largo">

El porcentaje de cada entidad es el número de personas que cumplen la condición entre la población del universo, por cien. Si en una entidad cumplen 400 de 1,000 personas, el porcentaje es 40 %.

La cifra de una región o del país no es el promedio de los porcentajes de sus entidades: se suman las personas que cumplen y se divide entre la suma de la población. Con dos entidades de 40 % y 10 % que tienen 1,000 y 9,000 personas, el promedio simple daría 25 %, pero cumplen 1,300 de 10,000, es decir, 13 %.

</div>

---

<h2 id="m-cambio" class="toc-anchor">Cambio entre dos ediciones</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Comparación · Distribución · Tiempo · Mapas</span>
  <p class="metodo-titulo" aria-hidden="true">Cambio entre dos ediciones</p>
</div>
<div class="texto-largo">

El cambio es la diferencia entre el porcentaje del último año y el del primero, y se escribe en puntos. Si una entidad pasó de 30 % a 25 %, el cambio es de −5.0 puntos.

El color sigue una sola regla en todo el libro. El rojo marca lo que se pierde o lo desfavorable, el azul lo que se gana o lo favorable y el gris lo que no cambia. Cada capítulo declara qué quiere decir cada color en su tema. Un cambio se pinta en gris cuando no supera el margen de error combinado de las dos ediciones o, si no hay error muestral, cuando es menor a 0.05 puntos, que es lo que se escribiría como 0.0.

</div>

---

<h2 id="m-distribucion" class="toc-anchor">Mitad central, mediana y curvas suavizadas</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Distribución</span>
  <p class="metodo-titulo" aria-hidden="true">Mitad central, mediana y curvas suavizadas</p>
</div>
<div class="texto-largo">

La franja gris de cada renglón cubre la mitad central de las unidades: deja fuera a la cuarta parte con los valores más bajos y a la cuarta parte con los más altos. La raya punteada es la mediana, el valor de la unidad de en medio.

Las crestas son curvas suavizadas. Cada unidad aporta un poco a los valores vecinos, unos 4 puntos hacia cada lado; por eso una cresta puede empezar un poco antes del valor más bajo. Los puntos dentro de la curva son las unidades reales y su altura no significa nada: solo los separa.

</div>

---

<h2 id="m-correlacion" class="toc-anchor">Dos medidas a la vez</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Relación entre dos medidas</span>
  <p class="metodo-titulo" aria-hidden="true">Dos medidas a la vez</p>
</div>
<div class="texto-largo">

La dispersión coloca cada entidad por dos medidas de la misma edición: la parte de sus hogares con internet a lo ancho y la otra medida a lo alto. Las dos rayas punteadas son las medianas de la vista y parten el plano en cuatro cuartos. Si en una vista 20 de 32 entidades caen en los cuartos de arriba a la derecha y abajo a la izquierda, la mayoría tiene las dos medidas del mismo lado de la mediana. Eso describe que coinciden, no que una cause la otra, y vale para las entidades, no para las personas que viven en ellas: una entidad con más internet y más escolaridad puede tener hogares con internet y poca escolaridad.

El hexbin cuenta personas, no entidades. Cada hexágono junta a las personas con una edad y unas horas de trabajo parecidas, unos 4 años y unas 10 horas, y su cifra es la parte del total que cae ahí, con el factor de expansión. Los hexágonos con menos de 30 casos en la muestra llevan trama porque su cifra es poco precisa.

La conectada sigue a un mismo grupo de una edición a otra. Los montos van en pesos de 2024. En los datos de muestra ya vienen así; en un libro real se ajustan con el índice de precios del periodo de levantamiento de cada edición, porque sin ese ajuste una subida del ingreso sería sobre todo inflación.

El mapa bivariado parte cada medida en tres niveles con cortes fijos, medidos una sola vez sobre todas las ediciones, de modo que un color dice lo mismo con cualquier filtro. El método de los mapas está en el apartado de mapas.

Se descartó escribir un coeficiente de correlación en la figura: con 32 entidades un solo valor lejano lo mueve mucho y el lector no sabe si 0.4 es mucho o poco.

</div>

---

<h2 id="m-unidades" class="toc-anchor">Figuras que cuentan personas</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Unidades</span>
  <p class="metodo-titulo" aria-hidden="true">Figuras que cuentan personas</p>
</div>
<div class="texto-largo">

En la multitud, el histograma de unidades y la pila, cada figura representa un número fijo de personas. Ese número se elige para que la gráfica tenga entre unas 300 y 1,500 figuras, se redondea a 1, 2 o 5 por una potencia de 10 y se escribe arriba de la gráfica y en el pie. Si cada figura representa 5,000 personas y un grupo tiene 412,000, se dibujan 82 figuras. El número de figuras se redondea, así que la cifra exacta va en la anotación, en el globo y en la tabla. Un grupo que no llega a media figura se dibuja como una figura en contorno, y en la pila la última figura se dibuja incompleta en proporción a lo que falta.

En la fracción, cada grupo es un bloque de cien figuras y las que van en color son las personas de cada cien que cumplen la condición. Cuando en algún grupo cumple menos de 1 de cada 100, la cuenta se hace sobre 1,000 o sobre 10,000 en todos los grupos a la vez, para que sigan comparándose con la misma base. Con 0.42 % se escribe 4 de cada 1,000.

El lugar de cada figura dentro de su grupo no significa nada: las posiciones salen de un generador con semilla fija para que no cambien entre cargas. En el histograma, la edad mediana es la de la persona de en medio cuando todas se ordenan por edad, con su factor de expansión.

</div>

---

<h2 id="m-mapas" class="toc-anchor">Mapas y mosaico de entidades</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Mapas</span>
  <p class="metodo-titulo" aria-hidden="true">Mapas y mosaico de entidades</p>
</div>
<div class="texto-largo">

Los mapas pintan el porcentaje con una escala continua de una sola tinta y dominio fijo de 0 a 100, la misma con cualquier filtro. Las entidades sin dato van en gris y se rotulan aparte de la escala. Al elegir una región el mapa se acerca a ella; lo demás no se dibuja.

El mosaico acomoda un cuadro por entidad con la rejilla `mx_state_grid3` del paquete geofacet <a class="cita" href="./referencias#hafen-2025">(Hafen, 2025)</a>, para que todas las entidades tengan el mismo peso visual.

Cuando el mapa es una vista de la sección («Ver como: gráfica / mapa por entidad / mapa por municipio»), toma la selección del panel y pinta cada lugar en uno de cinco rangos fijos y desiguales por indicador, cuyos cuatro cortes se eligen midiendo la distribución de las entidades (y de los municipios, si los hay) en todos los años, grupos y subgrupos, de modo que el valor nacional caiga en un rango intermedio y las entidades ocupen al menos tres tonos. Los cortes nunca se calculan sobre la vista, porque cambiarían con cada filtro. Un subgrupo que con los cortes comunes cae en uno o dos tonos lleva cortes propios, y la tira de rangos dice cuáles usa. En el indicador de muestra los cortes son 5, 10, 20 y 35 %, y 1, 2.5, 5 y 15 % para el subgrupo C. El mapa por municipio solo se ofrece con una fuente representativa a ese nivel, como un censo o una encuesta intercensal; las encuestas por hogares llegan a entidad. Los lugares con menos de 30 casos en la muestra llevan trama, los que no tienen dato van en gris con su casilla, y la diferencia entre el grupo elegido y su referencia se pinta con la rampa divergente: rojo lo desfavorable, azul lo favorable y gris en el cero.

</div>

---

<h2 id="m-mapa-flujos" class="toc-anchor">Mapa de flujos entre entidades</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Mapa de flujos</span>
  <p class="metodo-titulo" aria-hidden="true">Mapa de flujos entre entidades</p>
</div>
<div class="texto-largo">

Cada flecha es un par de entidades: la de residencia al inicio del periodo y la de residencia al final. Su cifra es el número de personas expandido con el factor de la muestra, y su ancho es proporcional a esa cifra con una escala fija por periodo, causa y edad, la misma con cualquier sexo, grupo o entidad. Si el ancho mayor equivale a 2,000 personas, una flecha de 1,000 mide la mitad en cualquier vista de esa edad. Las otras causas mueven cerca de veinte veces más personas que la violencia, y las personas adultas más que las de 5 a 17 años; por eso la escala cambia con la causa y la edad, y la leyenda dice a cuántas personas equivale el ancho.

“Todas las causas”, “Todas las edades” y “Mujeres y hombres” se calculan sumando las filas de cada causa, edad y sexo, que no se traslapan. Los grupos de población sí se traslapan (una persona puede hablar una lengua indígena y además considerarse indígena) y nunca se suman entre sí. En “De cada 100”, el renglón de un grupo divide a las personas del grupo entre todas las de la selección. Por ejemplo, si de Guerrero salieron 1,000 personas de 5 a 17 años por violencia y 150 hablan una lengua indígena, el renglón dice 15 de cada 100. “Quienes no cambiaron de entidad” son las personas que vivían en la misma entidad al inicio y al final del periodo.

Una flecha con menos de 30 casos en la muestra se dibuja punteada y su cifra es poco precisa. Un flujo gris con menos de 30 casos no se dibuja y queda en la tabla. Cuando ninguna flecha de color alcanza los 30 casos, el mapa lo dice y ofrece ampliar la selección. Con datos reales, el margen de error de cada flujo va en la tabla y se calcula con el diseño de la muestra.

</div>

---

<h2 id="m-precision" class="toc-anchor">Márgenes de error y precisión</h2>
<div class="metodo-cabecera">
  <span class="metodo-sirve">Todos los análisis con muestra</span>
  <p class="metodo-titulo" aria-hidden="true">Márgenes de error y precisión</p>
</div>
<div class="texto-largo">

El margen de error de cada cifra está en la tabla «Ver los datos» de su gráfica, no en el globo. El globo solo avisa, en un renglón, cuando la estimación es poco precisa: menos de 30 casos en la muestra o un error mayor a 30 % de la cifra.

En un libro real el error se calcula con el diseño muestral de la encuesta (estratos y unidades primarias), nunca con la fórmula de una muestra simple, y cuando no se puede estimar la celda queda vacía.

</div>
