// src/components/catalogo-clasificacion.js
// Clasificación del Catálogo de formas: niveles, familias, entradas,
// funciones y formas. Es la MISMA lista de catalogo/CatalogoGraficas.html
// (bloque «Página»), copiada aquí sin dependencias para que la usen dos
// lados: el componente de la página (src/components/catalogo.js) y el
// generador de datos (scripts/catalogo_datos.mjs), que aborta si una ficha
// trae un código que no está en esta lista.
//
// Si se añade un código en el HTML se añade también aquí. El orden de cada
// lista es el orden de los grupos en la página; el de FUNCIONES sigue el del
// menú de la galería (Comparación, Distribución, Correlación, Parte de un
// todo, Tiempo, Flujo, Mapas, Unidades, Conceptos).

export const NIVELES = ["Básico", "Intermedio", "Avanzado", "Experimental"];
export const NIVELES_DESC = [
  "Una marca. Se lee sin explicación.",
  "Combina marcas o facetas. Se lee con título y leyenda.",
  "Necesita un cálculo previo con d3 o una leyenda que se aprende.",
  "Formas de autores de D3. Atraen, pero piden explicación y sirven para una sola historia.",
];

export const FAMILIAS = [
  {id: "grafica", nombre: "Gráfica", desc: "Barras, líneas y áreas sobre ejes: el valor se lee por largo o por posición."},
  {id: "diagrama", nombre: "Diagrama", desc: "Nodos, cintas y rectángulos que muestran flujos, conexiones y jerarquías."},
  {id: "mapa", nombre: "Mapa", desc: "El territorio es la base: dónde pasa, cuánto hay y de dónde a dónde se mueve."},
  {id: "trazado", nombre: "Trazado", desc: "Marcas sueltas sobre ejes de magnitud: dispersión, enjambres, cajas y hexágonos."},
  {id: "tabla", nombre: "Tabla", desc: "Celdas en rejilla con el valor escrito o pintado: heatmap, matriz y calendario."},
];

export const ENTRADAS = [
  {id: "categoria-valor", nombre: "Categoría y valor", desc: "Una fila por grupo con su valor.", cab: ["grupo", "valor"], filas: [["A", "64.8"], ["B", "97.6"], ["C", "33.9"]]},
  {id: "categoria-series", nombre: "Categoría y series", desc: "Una fila por grupo con dos o tres series.", cab: ["grupo", "serie 1", "serie 2"], filas: [["A", "34", "72"], ["B", "44", "75"], ["C", "53", "78"]]},
  {id: "partes", nombre: "Partes de un total", desc: "Partes que suman 100.", cab: ["parte", "%"], filas: [["Sí", "52"], ["No", "31"], ["No sabe", "17"]]},
  {id: "dos-medidas", nombre: "Dos medidas", desc: "Dos medidas por unidad.", cab: ["unidad", "x", "y"], filas: [["Oax", "45", "31"], ["Chis", "40", "28"], ["CDMX", "88", "1"]]},
  {id: "cruce", nombre: "Cruce de categorías", desc: "Un valor por cada fila y columna.", cab: ["fila", "columna", "valor"], filas: [["Sur", "2020", "41"], ["Sur", "2024", "47"], ["Norte", "2020", "63"]]},
  {id: "serie-tiempo", nombre: "Serie de tiempo", desc: "Un valor por fecha, de una o varias series.", cab: ["fecha", "valor"], filas: [["2018", "41"], ["2020", "47"], ["2022", "52"], ["2024", "58"]]},
  {id: "dos-cortes", nombre: "Antes y después", desc: "Dos cortes por unidad.", cab: ["unidad", "antes", "después"], filas: [["Oax", "41", "52"], ["Gro", "44", "47"], ["Yuc", "60", "67"]]},
  {id: "tres-partes", nombre: "Tres partes", desc: "Tres partes que suman 100 por unidad.", cab: ["unidad", "a", "b", "c"], filas: [["Oax", "50", "30", "20"], ["Jal", "35", "40", "25"], ["Son", "20", "45", "35"]]},
  {id: "intervalos", nombre: "Intervalos", desc: "Un inicio y un fin por fila.", cab: ["inicio", "fin"], filas: [["12", "31"], ["18", "44"], ["25", "60"]]},
  {id: "origen-destino", nombre: "Origen y destino", desc: "Cuánto va de un lugar o categoría a otro.", cab: ["origen", "destino", "valor"], filas: [["Oax", "CDMX", "120"], ["Gro", "Mor", "85"], ["Ver", "Pue", "60"]]},
  {id: "jerarquia", nombre: "Jerarquía", desc: "Partes que contienen otras partes.", cab: ["padre", "hijo", "valor"], filas: [["Sur", "Oax", "41"], ["Sur", "Chis", "55"], ["Norte", "Son", "29"]]},
  {id: "geo-valor", nombre: "Valor por lugar", desc: "Una clave geográfica con su valor.", cab: ["clave", "valor"], filas: [["20", "45"], ["07", "40"], ["12", "47"]]},
  {id: "geo-puntos", nombre: "Puntos con coordenadas", desc: "Latitud, longitud y valor.", cab: ["lat", "lon", "valor"], filas: [["17.1", "−96.7", "120"], ["16.8", "−93.1", "95"], ["19.4", "−99.1", "310"]]},
  {id: "conteo", nombre: "Personas contadas", desc: "Un total de personas por grupo.", cab: ["grupo", "personas"], filas: [["Sí", "1,240"], ["No", "860"], ["Otros", "95"]]},
  {id: "distribucion", nombre: "Valores sueltos", desc: "Un valor por unidad, muchas unidades.", cab: ["unidad", "valor"], filas: [["1", "7.4"], ["2", "9.1"], ["3", "8.6"], ["4", "9.6"]]},
];

export const FUNCIONES = [
  {id: "comparacion", nombre: "Comparación", desc: "Cuánto vale cada grupo, cuánto los separa y quién está arriba."},
  {id: "distribucion", nombre: "Distribución", desc: "Cómo se reparten los valores de una medida entre personas o lugares."},
  {id: "correlacion", nombre: "Correlación", desc: "Si dos medidas se mueven juntas y dónde se concentran."},
  {id: "parte-todo", nombre: "Parte de un todo", desc: "De qué se compone un total y cómo se llega de uno a otro."},
  {id: "jerarquia", nombre: "Jerarquía", desc: "Cómo se reparte un total entre partes que contienen otras partes."},
  {id: "tiempo", nombre: "Tendencia en el tiempo", desc: "Tendencias, comparaciones entre años y ciclos."},
  {id: "flujo", nombre: "Flujo y conexión", desc: "De dónde a dónde se mueve algo y quién se conecta con quién."},
  {id: "geolocalizacion", nombre: "Geolocalización", desc: "Dónde pasa, con tasas o con conteos, en mapa o en mosaico."},
  {id: "unidades", nombre: "Unidades", desc: "Personas contadas: figuras, cuadros o puntos que valen un número fijo."},
  {id: "concepto", nombre: "Concepto", desc: "Ideas o procesos que se explican con una figura, sin una cifra central."},
];

// Íconos de línea fina (viewBox 0 0 32 32). La clase «relleno» pinta con el
// color del texto; lo demás es trazo.
export const FORMAS = [
  {id: "cuadrado", nombre: "Cuadrado", desc: "Celdas, cuadros y rectángulos.", svg: '<rect x="7" y="7" width="18" height="18" rx="1.5"/>'},
  {id: "circulo", nombre: "Círculo", desc: "Burbujas y círculos cuyo tamaño o posición es el dato.", svg: '<circle cx="16" cy="16" r="10"/>'},
  {id: "area", nombre: "Área", desc: "Superficies, cintas y crestas.", svg: '<path d="M4 26V19l7-6 6 4 7-8 4 3v14z"/>'},
  {id: "triangulo", nombre: "Triángulo", desc: "Picos, triángulos partidos y triángulos de tres partes.", svg: '<path d="M16 6l11 19H5z"/>'},
  {id: "hexagono", nombre: "Hexágono", desc: "Rejillas hexagonales.", svg: '<path d="M16 5l9.5 5.5v11L16 27l-9.5-5.5v-11z"/>'},
  {id: "linea", nombre: "Línea", desc: "Líneas, tallos, flechas y arcos.", svg: '<path d="M4 23l7-8 6 4 11-11"/>'},
  {id: "barras", nombre: "Barras", desc: "Barras y franjas cuyo largo es el dato.", svg: '<path d="M5 27h22"/><rect x="7" y="15" width="4" height="12"/><rect x="14" y="8" width="4" height="19"/><rect x="21" y="18" width="4" height="9"/>'},
  {id: "puntos", nombre: "Puntos", desc: "Puntos sueltos sobre un eje o un territorio.", svg: '<circle class="relleno" cx="8" cy="22" r="2"/><circle class="relleno" cx="13" cy="15" r="2"/><circle class="relleno" cx="17" cy="20" r="2"/><circle class="relleno" cx="21" cy="11" r="2"/><circle class="relleno" cx="25" cy="16" r="2"/><circle class="relleno" cx="11" cy="9" r="2"/>'},
  {id: "figura", nombre: "Figura humana", desc: "Figuras que cuentan personas.", svg: '<circle cx="16" cy="8" r="3.5"/><path d="M11 28V17.5a5 5 0 0 1 10 0V28M11 21h10"/>'},
  {id: "mapa", nombre: "Mapa", desc: "El territorio dibujado.", svg: '<path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z"/><path d="M11 5v19M21 8v19"/>'},
];

export const DIMENSIONES = [
  {id: "familia", nombre: "Familia", lista: FAMILIAS, ayuda: "La familia de la forma, como en Data Viz Project. Trazado es lo que allá se llama Plot: marcas sueltas sobre ejes de magnitud."},
  {id: "entrada", nombre: "Entrada", lista: ENTRADAS, ayuda: "Elige la tabla que se parece a tus datos. Cada tarjeta dibuja sus encabezados y unos renglones de ejemplo; la fila se desplaza de lado. Una forma puede aceptar varias entradas: en la lista aparece una sola vez, bajo la primera."},
  {id: "funcion", nombre: "Función", lista: FUNCIONES, ayuda: "Qué quiere mostrar la gráfica. Una forma puede tener varias funciones: el número de cada botón las cuenta todas, y en la lista la forma aparece una sola vez, bajo la primera."},
  {id: "forma", nombre: "Forma", lista: FORMAS, ayuda: "La figura que dibuja. Una forma puede tener varias: el número de cada botón las cuenta todas, y en la lista la forma aparece una sola vez, bajo la primera."},
];
export const AGRUPAR_POR_OMISION = "funcion";

// Nombre visible de cada página de la galería, también de las que todavía
// no están en el menú (scripts/paginas.mjs manda cuando la página existe).
export const PAGINAS_GALERIA = {
  "/galeria/comparacion": "Comparación",
  "/galeria/precision": "Precisión e incertidumbre",
  "/galeria/tablas": "Tablas",
  "/galeria/distribucion": "Distribución",
  "/galeria/correlacion": "Correlación",
  "/galeria/parte-todo": "Parte de un todo",
  "/galeria/tiempo": "Tiempo",
  "/galeria/flujo": "Flujo",
  "/galeria/mapas": "Mapas",
  "/galeria/unidades": "Unidades",
  "/galeria/conceptos": "Conceptos y diagramas",
};
