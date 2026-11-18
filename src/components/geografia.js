// src/components/geografia.js
// Catálogo de entidades, regiones y rejilla del mosaico. Las claves se
// normalizan a dos dígitos al leer: sin ceros a la izquierda se pierden las
// entidades 01 a 09 sin aviso.

// [clave, ISO del geojson, nombre, abreviatura, región]
export const ENTIDADES = [
  ["01", "MX-AGU", "Aguascalientes", "AGS", "Centro-Occidente"], ["02", "MX-BCN", "Baja California", "BC", "Norte"],
  ["03", "MX-BCS", "Baja California Sur", "BCS", "Norte"], ["04", "MX-CAM", "Campeche", "CAMP", "Sur-Sureste"],
  ["05", "MX-COA", "Coahuila", "COAH", "Norte"], ["06", "MX-COL", "Colima", "COL", "Centro-Occidente"],
  ["07", "MX-CHP", "Chiapas", "CHIS", "Sur-Sureste"], ["08", "MX-CHH", "Chihuahua", "CHIH", "Norte"],
  ["09", "MX-CMX", "Ciudad de México", "CDMX", "Centro"], ["10", "MX-DUR", "Durango", "DGO", "Norte"],
  ["11", "MX-GUA", "Guanajuato", "GTO", "Centro-Occidente"], ["12", "MX-GRO", "Guerrero", "GRO", "Sur-Sureste"],
  ["13", "MX-HID", "Hidalgo", "HGO", "Centro"], ["14", "MX-JAL", "Jalisco", "JAL", "Centro-Occidente"],
  ["15", "MX-MEX", "Estado de México", "MÉX", "Centro"], ["16", "MX-MIC", "Michoacán", "MICH", "Centro-Occidente"],
  ["17", "MX-MOR", "Morelos", "MOR", "Centro"], ["18", "MX-NAY", "Nayarit", "NAY", "Centro-Occidente"],
  ["19", "MX-NLE", "Nuevo León", "NL", "Norte"], ["20", "MX-OAX", "Oaxaca", "OAX", "Sur-Sureste"],
  ["21", "MX-PUE", "Puebla", "PUE", "Centro"], ["22", "MX-QUE", "Querétaro", "QRO", "Centro"],
  ["23", "MX-ROO", "Quintana Roo", "QROO", "Sur-Sureste"], ["24", "MX-SLP", "San Luis Potosí", "SLP", "Centro-Occidente"],
  ["25", "MX-SIN", "Sinaloa", "SIN", "Norte"], ["26", "MX-SON", "Sonora", "SON", "Norte"],
  ["27", "MX-TAB", "Tabasco", "TAB", "Sur-Sureste"], ["28", "MX-TAM", "Tamaulipas", "TAMS", "Norte"],
  ["29", "MX-TLA", "Tlaxcala", "TLAX", "Centro"], ["30", "MX-VER", "Veracruz", "VER", "Sur-Sureste"],
  ["31", "MX-YUC", "Yucatán", "YUC", "Sur-Sureste"], ["32", "MX-ZAC", "Zacatecas", "ZAC", "Centro-Occidente"],
].map(([cve, iso, nombre, corto, region]) => ({cve, iso, nombre, corto, region}));

export const REGIONES = ["Norte", "Centro-Occidente", "Centro", "Sur-Sureste"];
export const POR_CVE = new Map(ENTIDADES.map((e) => [e.cve, e]));
export const ISO_A_CVE = new Map(ENTIDADES.map((e) => [e.iso, e.cve]));
export const normalizarClave = (x, largo = 2) => String(x ?? "").padStart(largo, "0");
export const nombreEntidad = (cve) => POR_CVE.get(normalizarClave(cve))?.nombre ?? "";

// Rejilla del mosaico: mx_state_grid3 del paquete geofacet (Ryan Hafen), una
// de las rejillas de México curadas para mapas de mosaico. [columna, fila].
// Se usa una rejilla publicada, no una inventada, y se cita en la metodología.
export const REJILLA = {
  "02": [0, 0], "26": [1, 0], "08": [2, 0], "05": [3, 0], "19": [4, 0], "28": [5, 0],
  "03": [0, 1], "25": [2, 1], "10": [3, 1], "32": [4, 1], "24": [5, 1],
  "18": [3, 2], "01": [4, 2], "11": [5, 2], "13": [6, 2],
  "06": [3, 3], "14": [4, 3], "22": [5, 3], "09": [6, 3], "21": [7, 3], "31": [10, 3], "23": [11, 3],
  "16": [4, 4], "15": [5, 4], "17": [6, 4], "29": [7, 4], "30": [8, 4], "27": [9, 4], "04": [10, 4],
  "12": [6, 5], "20": [7, 5], "07": [8, 5]};
export const REJILLA_COLUMNAS = 12, REJILLA_FILAS = 6;

// Proyección cónica conforme para el país; `dominio` es el geojson que encuadra.
export const proyeccionMx = (dominio) => ({type: "conic-conformal", parallels: [17.5, 29.5], rotate: [102, 0], domain: dominio});
