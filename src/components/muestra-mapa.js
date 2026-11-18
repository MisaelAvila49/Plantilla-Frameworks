// src/components/muestra-mapa.js
// Lectura de los datos de muestra del mapa de flujos (src/data/muestra/, que
// genera scripts/muestra_mapa.mjs) y las constantes que dependen de ellos.
// Como en muestra.js, los CSV se leen SIN tipado automático para no perder
// los ceros de las claves ("01"). Al cargar los datos reales del libro este
// módulo se sustituye por el suyo, con los mismos nombres de campo.

const numero = (x) => (x === "" || x == null ? null : +x);
const clave = (x) => String(x).padStart(2, "0");

// Personas que cambiaron de entidad: una fila por periodo, causa, grupo,
// edad, sexo y par origen-destino. `casos` son los casos sin expandir.
export const leerFlujosGrupos = (filas) => filas.map((r) => ({
  periodo: r.periodo, causa: r.causa, grupo: r.grupo, edad: r.edad, sexo: r.sexo,
  origen: clave(r.origen), destino: clave(r.destino), personas: numero(r.personas), casos: numero(r.casos),
}));

// Población residente y población que no cambió de entidad en el periodo.
export const leerPoblacionGrupos = (filas) => filas.map((r) => ({
  periodo: r.periodo, entidad: clave(r.entidad), grupo: r.grupo, edad: r.edad, sexo: r.sexo,
  poblacion: numero(r.poblacion), noMigrante: numero(r.no_migrante),
}));

// Ancho FIJO de las flechas: valor que corresponde al ancho máximo, una
// constante por periodo, causa y edad, igual con cualquier sexo, grupo o
// entidad. Medido con scripts/muestra_mapa.mjs (flujo mayor de cada
// combinación, ambos sexos, toda la población) y redondeado hacia arriba:
//   2015 - 2020  violencia 1,819 / 3,861 / 5,680 (5 a 17, 18 y más, todas);
//                otras 24,136 / 94,770 / 118,906; todas 24,982 / 97,140 / 122,122.
//   2020 - 2025  violencia 3,124 / 6,569 / 9,693; otras 18,201 / 79,764 / 95,830;
//                todas 18,929 / 80,843 / 97,423.
// Va por causa porque las otras causas mueven veinte veces más personas, y
// por edad porque la vista de 5 a 17 años es la principal del libro: con el
// tope de todas las edades, su flujo mayor quedaba en un tercio del grosor y
// las flechas no se leían a simple vista. Dentro de una misma edad, el ancho
// sí compara grupos, sexos y entidades.
export const TOPE_FLUJO = {
  "2015-2020": {
    violencia: {"5-17": 2000, "18+": 4000, todas: 6000},
    otras: {"5-17": 25000, "18+": 95000, todas: 120000},
    todas: {"5-17": 25000, "18+": 100000, todas: 125000},
  },
  "2020-2025": {
    violencia: {"5-17": 3500, "18+": 7000, todas: 10000},
    otras: {"5-17": 20000, "18+": 80000, todas: 100000},
    todas: {"5-17": 20000, "18+": 85000, todas: 100000},
  },
};
