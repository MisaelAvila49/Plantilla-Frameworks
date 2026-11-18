# Regla de color de los libros de datos

Regla lista para copiar a cada libro nuevo. Resume la sección 7 de [`../REGLAS.md`](../REGLAS.md) (reglas R92 a R114) y añade lo que hace falta para aplicarla: la tabla de papeles, la forma de declarar el significado por capítulo con dos libros de ejemplo, y la lista de prohibiciones. Si este archivo y `REGLAS.md` difieren, manda `REGLAS.md`.

Los valores hexadecimales vigentes de todos los papeles están en un solo lugar: **(ver `src/components/paleta.js`, fuente única)**. Este documento no fija valores. Donde cita un hexadecimal lo hace para que el papel se reconozca, y lo dice.

La regla en una frase: el color dice una sola cosa a la vez. El rojo y el azul llevan el significado que el capítulo declara, el gris dice que no hay diferencia o que no hay dato, y todo lo que es un nivel se pinta con una sola tinta en el tono de tema del libro. No hay morado.

---

## 1. Papeles

Cada color de una gráfica cumple uno de estos papeles. Si una gráfica necesita un color que no cabe en ninguno, primero se agrega el papel al módulo, se valida y después se usa.

| Papel | Para qué se usa | Para qué no | Valor |
| --- | --- | --- | --- |
| **Rojo de marca** | Interfaz: botón principal, antetítulo, número de sección, cifra principal, palabra clave del h1, estados activos. Un solo acento por bloque | No pinta marcas de una gráfica | (ver `src/components/paleta.js`, fuente única) |
| **Rojo semántico** | El significado que el capítulo declaró para el rojo (se pierde, salen, por violencia, en desventaja) | Nada que el capítulo no haya declarado | (ver `src/components/paleta.js`, fuente única) |
| **Azul semántico** | El significado que el capítulo declaró para el azul (se gana, llegan, otra causa, en ventaja) | Nada que el capítulo no haya declarado | (ver `src/components/paleta.js`, fuente única) |
| **Gris semántico** | No cambia, no hay diferencia que se distinga del margen de error, o la categoría neutra que el capítulo declaró (sin movilidad) | No se usa para “sin dato” | (ver `src/components/paleta.js`, fuente única) |
| **Rampa divergente** | Grado de lo que el rojo y el azul significan: rojos de claro a oscuro, gris al centro, azules de claro a oscuro. En clases o continua | Magnitudes sin punto medio | (ver `src/components/paleta.js`, fuente única) |
| **Tono de tema** | Serie única sin comparación. Barras, líneas, puntos y picos de un nivel | No expresa cambio ni signo | (ver `src/components/paleta.js`, fuente única). Por omisión, verde azulado |
| **Rampa del tono de tema** | Magnitudes de nivel en mapas, celdas y mosaicos: una sola tinta, del claro al oscuro, continua, con dominio fijo | No se parte en rangos calculados | (ver `src/components/paleta.js`, fuente única) |
| **Sin dato** | Unidad sin dato o bajo el filtro. Casilla propia en la leyenda | No forma parte de ninguna rampa | (ver `src/components/paleta.js`, fuente única) |
| **Atenuado** | Lo que queda fuera de la selección, el residuo no asignado de un treemap | No forma parte de ninguna rampa | (ver `src/components/paleta.js`, fuente única) |
| **Grises de contexto** | Marcas al fondo, líneas de referencia, rejilla, medianas y franjas de resumen. Un tono por uso, nunca una opacidad sobre negro | — | (ver `src/components/paleta.js`, fuente única) |
| **Tinta sobre relleno** | Texto encima de un relleno: clara u oscura según la luminancia del relleno | — | Se calcula |
| **Identidad** | Categorías sin orden que no son el significado del capítulo. Máximo tres tonos más gris para “Otras” | — | Pendiente de decidir (P1 y P2 de `REGLAS.md`, sección 17) |

Tres precisiones sobre la tabla.

El rojo de marca y el rojo semántico pueden compartir tono, como ocurría en `perdida-lengua`, pero son papeles distintos y el módulo los nombra por separado. Así, si un libro necesita separarlos, se cambia una constante y no cuarenta usos.

Los valores de partida heredados de `perdida-lengua` sirven solo para reconocer cada papel: rojo `#C4101B` en claro y `#E8474F` en oscuro, azul `#2166AC` en claro y `#7FB6EA` en oscuro, atenuado `#d9d8d2` en claro y `#4a4a45` en oscuro. El texto rojo chico sobre superficies grises usa `#c4101b` en claro y `#f27076` en oscuro, porque `#e30a18` sobre `#f6f6f6` da 4.495:1 y no pasa. Si alguno difiere de `paleta.js`, manda `paleta.js`.

El tono de tema no puede ser rojo, azul ni morado. Se elige probando candidatos con el validador junto al rojo y al azul, en los dos temas, y su paso más claro tiene que distinguirse del fondo sin necesidad de borde.

---

## 2. Cómo se declara el significado por capítulo

El rojo y el azul no significan lo mismo en todos los libros ni en todos los capítulos de un libro. La regla es que **dentro de un capítulo significan una sola cosa**, y que cuando el tema del capítulo cambia, el significado cambia con él, porque ya no se mide lo mismo. Por eso cada capítulo lo declara.

### 2.1 Dónde se declara

La declaración se escribe una vez y se lee desde tres lugares.

1. **En la página del capítulo**, al inicio del código, como una constante. De ahí la toman las leyendas y los globos.
2. **En las leyendas** de las gráficas que usan rojo y azul, con las mismas palabras.
3. **En Metodología**, en el apartado transversal sobre el significado de los colores, con una fila por capítulo.

Forma sugerida de la constante. El nombre definitivo lo fija el módulo de paleta.

```js
// Significado del color en este capítulo.
// Lo leen las leyendas, los globos y la Metodología. No se repite a mano.
const COLOR_CAPITULO = {
  rojo: "se pierde",
  azul: "se gana",
  gris: "no cambia, o el cambio no se distingue del margen de error",
};
```

Un capítulo que solo mide niveles lo declara de forma expresa:

```js
// Este capítulo mide niveles. No usa rojo ni azul.
const COLOR_CAPITULO = null;
```

### 2.2 Qué debe decir una declaración

1. Qué significa el rojo, en dos o tres palabras que se puedan poner en una leyenda.
2. Qué significa el azul, con la palabra opuesta.
3. Qué significa el gris: la ausencia de diferencia, o la categoría neutra.
4. Si el capítulo tiene grados, cuántos pasos de rojo y de azul usa y qué nombra cada uno.

### 2.3 Ejemplo: libro de lenguas indígenas

| Capítulo | Qué mide | Rojo | Azul | Gris | Tono de tema |
| --- | --- | --- | --- | --- | --- |
| Las lenguas indígenas de México | Niveles: qué parte habla, qué parte se considera indígena, cuántos hablantes tiene cada lengua | No se usa | No se usa | Sin dato y atenuado | Toda la magnitud: mapa, vírgula, mosaico y picos |
| Lenguas indígenas en riesgo | Cambio en el tiempo y transmisión entre generaciones | **Se pierde**: baja la parte de la población que habla, la lengua no pasa a la generación siguiente | **Se gana**: sube | No cambia, o el cambio no supera el margen de error | Niveles dentro del capítulo: serie larga, pirámide, hogares, reparto por edad |

Dentro del segundo capítulo, los grados de riesgo usan tres rojos (muy alto, alto y mediano) y un azul (no inmediato), los mismos en las barras, el flujo y las fichas. El reparto de los hablantes por edad es un nivel y va en el tono de tema, no en una rampa de rojo a amarillo.

### 2.4 Ejemplo: libro de migración por violencia

| Capítulo o grupo de análisis | Qué mide | Rojo | Azul | Gris |
| --- | --- | --- | --- | --- |
| Magnitud y motivos | Quiénes cambiaron de residencia y por qué | **Por violencia** | **Por otra causa** | **Sin movilidad** |
| Origen y recepción | De dónde salen y a dónde llegan | **Salen** | **Llegan** | Los flujos que no son de la entidad elegida |
| Condiciones educativas y desigualdades | Brecha entre grupos en cada indicador | **En desventaja** | **En ventaja** | Sin diferencia que se distinga del margen de error |

En este libro el significado cambia tres veces, y cada cambio coincide con un cambio de tema. Un lector que pasa de “Por violencia” a “Salen” encuentra la declaración nueva en la primera leyenda del capítulo. Los capítulos que no aparecen en la tabla se declaran antes de dibujar su primera gráfica.

### 2.5 Reglas de la declaración

1. Una declaración por capítulo. No hay dos significados del rojo en la misma página.
2. El tono dice el signo del estado actual y la intensidad dice el grado. Un municipio que sigue perdiendo va en rojo aunque pierda más lento.
3. El color conserva su significado aunque la aritmética invierta el signo. Dividir dos cantidades negativas da un número positivo, y la marca sigue en rojo.
4. La cifra del globo toma el color de la marca.
5. Si una gráfica del capítulo no mide lo declarado, no usa rojo ni azul.

---

## 3. Tono de tema y rampas

1. **Una sola tinta.** La rampa de magnitud va del paso claro al paso oscuro del tono de tema, interpolada en Lab. No pasa por otros tonos. En `perdida-lengua` una rampa de dos tonos duró 23 minutos, porque sus pasos intermedios eran azulados y el azul ya significaba “sube”.
2. **Continua.** La presencia (qué parte de una población tiene un atributo) no se pinta con rangos fijos ni con cortes calculados.
3. **Dominio fijo.** De 0 a 100 en la presencia. En otras magnitudes, una constante del módulo elegida midiendo el máximo real, con el extremo rotulado “N o más”. El dominio es igual con cualquier filtro, lugar o año.
4. **La misma rampa en todas las figuras que se comparan** dentro del libro.
5. **Por valor.** El tono más oscuro cae en el valor más alto, no en el año más reciente ni en la primera fila.
6. **La celda dice lo que pinta.** El color de una celda codifica la misma cifra que la celda imprime.
7. **Divergente solo con punto medio.** Una magnitud sin centro natural usa la rampa del tono de tema. La divergente lleva el centro en gris y no en el color del fondo, porque el fondo ya significa “sin dato”.
8. **Variante oscura dentro del módulo.** Toda rampa tiene su versión de tema oscuro en `paleta.js`. Ninguna gráfica la resuelve con un ternario.

---

## 4. El gris de “no cambia”

Una sola función decide si una diferencia es baja, sube o igual, y la usan todas las gráficas del libro.

| Caso | Criterio de “igual” |
| --- | --- |
| La cifra tiene error muestral | La diferencia no supera 1.96 veces el error combinado de los dos valores |
| La cifra no tiene error muestral | La diferencia es menor que lo que se escribiría como cero (0.05 puntos) |

No se usa el cero estricto. En `perdida-lengua` convivían las tres definiciones y la misma diferencia salía gris en una gráfica y azul en otra.

---

## 5. Prohibiciones

1. **Morado.** Ningún tono morado, violeta o magenta, en ninguna paleta, rampa, hoja de estilos de gráfica ni ejemplo. Única excepción (R93): la esquina «los dos altos» de `P.bivariado`, donde el morado sale de mezclar el rojo y el azul de los dos ejes.
2. **Hexadecimales fuera de `paleta.js`.** Ningún componente ni página escribe un color.
3. **Ternarios de tema fuera de `paleta.js`.** El modo oscuro se resuelve en el módulo.
4. **Rojo o azul sin significado declarado.** Tampoco como color de identidad de una categoría cualquiera.
5. **Dos significados del rojo en la misma página.**
6. **Rampa de dos tonos para una magnitud** cuando alguno de sus tonos ya significa otra cosa en el libro.
7. **Dominio calculado sobre la vista** (mínimo y máximo, cuantiles, Dalenius-Hodges) para la presencia.
8. **Esquemas de Plot o de D3** (`"reds"`, `"tableau10"`, `interpolateYlGnBu`) y rampas arcoíris (`turbo`, `rainbow`).
9. **Rosa y azul para el sexo.**
10. **Un cuarto tono categórico.** A partir del cuarto grupo, “Otras” en gris.
11. **Color asignado por posición o por frecuencia.** Se asigna por categoría o por entidad.
12. **Otro color para resaltar.** Se resalta con contorno u opacidad.
13. **Colores de estado (bien, aviso) para pintar un grupo.**
14. **`stroke: "#fff"` entre polígonos de un mapa.** Se usa `stroke: "none"`.
15. **“Sin dato” dentro de la rampa,** o pintado con el color del fondo.
16. **Un ítem de leyenda que no corresponde a ninguna marca.**
17. **El nombre de un color escrito a mano en un texto visible.**
18. **Un `color-mix` con transparencia para texto sin medir su contraste.**
19. **El gris de las líneas para escribir cifras.** No da 4.5:1.

---

## 6. Comprobación

Antes de aprobar una paleta y antes de entregar el libro.

```bash
# 1. Toda paleta categórica de tres o más series, en los dos temas
node scripts/validate_palette.js "hex,hex,hex" --mode light
node scripts/validate_palette.js "hex,hex,hex" --mode dark

# 2. Las paletas que el libro dibuja de verdad
npm run verificar:paleta

# 3. Ningún hexadecimal fuera del módulo de paleta (debe dar cero líneas)
grep -rnE "#[0-9a-fA-F]{6}\b" src/components src/*.md | grep -v "paleta.js"

# 4. Ningún ternario de tema fuera del módulo (debe dar cero líneas)
grep -rn "oscuro ?" src/components src/*.md | grep -v "paleta.js"

# 5. Ningún morado, ni por nombre ni por tono conocido (debe dar cero líneas).
#    Se excluyen la matriz bivariada (excepción de R93) y su componente.
grep -rniE "morad|violeta|purple|magenta|BuPu|88419d|4d004b|8c96c6|8c6bb1|6e016b|a77cc3|cfb5df|9163b6|b389cf|6a2c7d|c51b7d|8c4799|a768b8|4a3a62|c2aae2" src scripts | grep -v "bivariado"
```

La lista de tonos del paso 5 reúne los morados que aparecen en `perdida-lengua` y en los tres catálogos copiados. Además de los comandos, cada capítulo se abre en claro y en oscuro para comprobar tres cosas a la vista: que la primera leyenda con rojo y azul dice el significado declarado, que el paso más claro de la rampa se distingue del fondo y que ninguna cifra de globo queda en tinta cuando su marca tiene color.
