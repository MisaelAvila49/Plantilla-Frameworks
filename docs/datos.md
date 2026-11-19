# Contrato de datos de un libro (plantilla)

Copiado del libro «Las personas con discapacidad en México» (noviembre de 2026), donde se probó con
Censo, EIC, ENIGH, ENADIS y ENDUTIH. Al empezar un libro se adapta: la llave de identidad
(`discapacidad` en ese libro) se cambia por la del tema, y `tema` por los capítulos propios.

Cada fuente tiene un loader en `scripts/datos/<fuente>.py` que lee los microdatos de disco, calcula
celdas agregadas y escribe Parquet en `src/data/indicadores/<fuente>_<tema>.parquet`. Los loaders se
corren a mano (`python -E scripts/datos/<fuente>.py`; con `-s` pandas no encuentra `dateutil` en esta máquina), no en el build: los microdatos pesan
gigas y no se versionan. Lo que se versiona es el Parquet chico que lee el navegador.

## Esquema largo (todas las fuentes)

`scripts/datos/comun.py` define `COLUMNAS`, `agregar()` (num, den, casos y error estándar por
linearización de Taylor con UPM dentro de estrato, en una sola pasada de DuckDB), `completar()`,
`escribir()`, `anotar_calculado()` y `guardia()`. No se edita `comun.py` sin acordarlo; si una fuente
necesita algo más, lo define en su propio loader.

| Columna | Valores |
| --- | --- |
| `tema` | página: `cuantas`, `escuela`, `trabajo`, `hogar`, `conectividad`, `discriminacion` |
| `clave` | id estable del indicador, en minúsculas con guion bajo (`prev_discapacidad`, `asiste_escuela`) |
| `indicador` | nombre visible, en lenguaje llano |
| `anio` | edición |
| `discapacidad` | `Con discapacidad`, `Sin discapacidad` y, solo en Censo/EIC, `Con limitación` (celdas excluyentes) |
| `sexo` | `Mujeres`, `Hombres` o `Todos` |
| `entidad` | nombre oficial o `Estados Unidos Mexicanos` |
| `rango_edad` | rangos que declare cada loader en su encabezado, o `Todos` |
| `tam_loc`, `decil`, `escolaridad`, `estrato`, `lengua` | cruces optativos, `Todos` si no aplica |
| `num`, `den` | sumas ponderadas (personas u hogares expandidos); el porcentaje NUNCA viaja |
| `casos` | registros de muestra en el denominador, sin expandir |
| `ee` | error estándar de num/den (proporción); VACÍO si no es estimable, nunca cero |
| `fuente`, `universo`, `encuesta` | textos para el pie y la tabla; `encuesta`: `censo`, `eic`, `enigh`, `enadis`, `endutih` |

En indicadores de pesos u horas (`num` es masa de dinero o tiempo), la clave termina en `_media` y el
loader agrega una columna `formato` = `pesos` | `horas`; `num/den` ya es la cifra final (no se
multiplica por cien). Montos de varias ediciones en pesos de 2024 con el INPC del periodo de
levantamiento (`src/data/inpc.csv`); si falta un índice, el loader aborta.

## Subgrupos con grado (`src/components/subgrupo.js`)

Cuando la población se parte en subgrupos que se traslapan (tipo de dificultad, lengua, programa que
recibe) y cada uno tiene un grado, el loader escribe un archivo APARTE del de siempre, con el esquema de
arriba más dos columnas; el archivo de siempre no se toca, porque las páginas lo suman y filas nuevas
duplicarían cifras.

| Columna | Valores |
| --- | --- |
| `subgrupo` | clave del subgrupo, o `Ninguno` en la fila de referencia: quien no está en ningún subgrupo, la misma para todos |
| `grado` | grado en ESE subgrupo (por ejemplo `Alto` y `Bajo`); `Ninguno` en la referencia |

Reglas: las filas de subgrupos distintos no se suman (una persona está en dos); dentro de un subgrupo los
grados son excluyentes y su suma es «en el subgrupo»; la comparación es con `Ninguno`, nunca con la suma
de los subgrupos; un grado no es la categoría excluyente que la fuente publique con el mismo nombre; y se
usa un solo nivel geográfico a la vez (país, entidades o tamaño de localidad). Las celdas chicas viajan
con `casos` y `ee` y la página decide el umbral. Ejemplo: `src/data/muestra/subgrupos.csv`
(`scripts/muestra_subgrupos.mjs`), que trae en el mismo archivo las filas sin subgrupo
(`subgrupo = Todos`) solo por ser una muestra.

## Rangos de los mapas (`RANGOS` de `src/components/vista-mapa.js`)

Cada indicador que se puede ver en mapa tiene cuatro cortes fijos y desiguales, medidos sobre las
entidades (y los municipios, si los hay) en todos los años, grupos y subgrupos, con la medición en el
comentario del componente. Un subgrupo que con los cortes comunes cae en uno o dos tonos lleva cortes
propios (`subgrupos`), y un indicador en pesos declara `unidad: "pesos"`.

## Definición de discapacidad

Grupo de Washington: una persona tiene discapacidad si declara **mucha dificultad** o **no poder**
hacer al menos una de las actividades preguntadas. En Censo y EIC, como en los criterios del INEGI para el cuestionario ampliado, el código 8 («se desconoce el grado») también cuenta como discapacidad; solo queda fuera quien tiene 9 en los seis dominios. Con esa regla la EIC 2025 reproduce al dígito las 6,357,086 personas publicadas. En Censo y EIC, **limitación** es poca dificultad
en alguna y ninguna mucha ni no puede. La condición mental del Censo (`DIS_MENTAL`, 5 sí, 6 no) se
reporta como indicador aparte, no dentro de la prevalencia de discapacidad, salvo que el cotejo con la
cifra oficial del INEGI muestre que la oficial la incluye; eso se documenta en el loader.

Antes de publicar una cifra se verifican los códigos contra los microdatos (conteos de valores),
nunca por el nombre de la columna. Escalas invertidas ya conocidas: ENIGH 2024 (1 = sin dificultad,
al revés que 2020 y 2022). Columnas que llegan como texto con retorno de carro pegado se limpian
antes de comparar.

## Verificación

Cada loader escribe su cifra nacional central con `anotar_calculado()` y deja en
`docs/verificacion/<fuente>.md` el cotejo contra el tabulado oficial: cifra publicada, tabla o página
exacta y URL, cifra calculada, diferencia y explicación. Sin tabla oficial equivalente, «verificación
pendiente» con la referencia más cercana; jamás una coincidencia inventada.
