// src/components/formas/index.js
// Catálogo de formas de gráfica: UN ARCHIVO POR FORMA. Para añadir una forma
// nueva se crea su archivo en esta carpeta y se reexporta aquí; no hay un
// módulo monolítico. Toda forma:
//   - recibe los datos y un objeto de opciones con `ancho` y `globo`;
//   - toma sus colores de ../paleta.js y sus formatos de ../formato.js;
//   - no nombra el tema del libro: rótulos, unidades y categorías llegan por
//     parámetro;
//   - abre con un comentario que dice qué pregunta responde y cuándo NO usarla.

// Comparación
export {lollipop} from "./lollipop.js";
export {dumbbell} from "./dumbbell.js";
export {heatmap} from "./heatmap.js";
// Distribución
export {franjas} from "./franjas.js";
export {crestas} from "./crestas.js";
export {piramide} from "./piramide.js";
// Parte de un todo
export {treemap} from "./treemap.js";
export {barrasApiladas} from "./barras-apiladas.js";
// Unidades
export {waffle} from "./waffle.js";
export {multitud} from "./multitud.js";
export {fraccion, baseFraccion} from "./fraccion.js";
export {histogramaUnidades} from "./histograma-unidades.js";
export {pila} from "./pila.js";
export {escalones} from "./escalones.js";
export {tamanoUnidad, textoUnidad, leyendaFiguras} from "./unidad.js";
// Flujo
export {sankey} from "./sankey.js";
// Tiempo
export {lineas} from "./lineas.js";
export {pendiente} from "./pendiente.js";
// Mapas
export {mapaPlano, rebobinar} from "./mapa-plano.js";
export {coropleta} from "./coropleta.js";
export {mosaico} from "./mosaico.js";
export {bivariado, leyendaBivariada, cortesTerciles, tercil} from "./bivariado.js";
// Piezas comunes
export {TIPO, leyendaItems, leyendaContinua, vacio, viva, azarEstable} from "./comun.js";
// Flujos sobre el mapa y entre cortes, enjambre, picos y series destacadas
export {flechas} from "./flechas.js";
export {apiladasFlujo} from "./apiladas-flujo.js";
export {aluvial} from "./aluvial.js";
export {enjambre} from "./enjambre.js";
export {picos} from "./picos.js";
export {destacadas} from "./destacadas.js";
export {areasSuperpuestas} from "./areas-superpuestas.js";
// Territorio y flujo: flechas de cambio, semitonos, silueta de puntos y barra al mapa
export {flechasCambio} from "./flechas-cambio.js";
export {semitonos} from "./semitonos.js";
export {siluetaPuntos, unidadSilueta} from "./silueta-puntos.js";
export {barraMapa} from "./barra-mapa.js";

// Trayectorias, mosaicos partidos y de fracciones, ternario y unidades en espejo
export {riel} from "./riel.js";
export {mosaicoTriangulos, glifoSentido} from "./mosaico-triangulos.js";
export {mosaicoFracciones} from "./mosaico-fracciones.js";
export {ternario} from "./ternario.js";
export {unidadesEspejo} from "./unidades-espejo.js";

// Formas de las galerías ampliadas (comparación, distribución, tiempo, parte
// de un todo, flujo, mapas y conceptos). Solo la función principal de cada
// archivo; los ayudantes internos se importan del archivo cuando hacen falta.
export {agrupadas} from "./agrupadas.js";
export {barras} from "./barras.js";
export {ranking} from "./ranking.js";
export {cifra} from "./cifra.js";
export {contexto} from "./contexto.js";
export {rango} from "./rango.js";
export {puntosIntervalo} from "./puntos-intervalo.js";
export {diferenciaMargen, ladoDe} from "./diferencia-margen.js";
export {likert} from "./likert.js";
export {histograma} from "./histograma.js";
export {caja} from "./caja.js";
export {enjambrePuntos} from "./enjambre-puntos.js";
export {lluvia} from "./lluvia.js";
export {curvasAcumuladas} from "./curvas-acumuladas.js";
export {cuantiles, cuantilesDe, debajoDe} from "./cuantiles.js";
export {concentracion} from "./concentracion.js";
export {dispersion} from "./dispersion.js";
export {hexbin} from "./hexbin.js";
export {conectada} from "./conectada.js";
export {bump} from "./bump.js";
export {calendario} from "./calendario.js";
export {horizonte} from "./horizonte.js";
export {lineaBanda} from "./linea-banda.js";
export {franjasTiempo} from "./franjas-tiempo.js";
export {mosaicoSeries} from "./mosaico-series.js";
export {puntosSeries} from "./puntos-series.js";
export {cortesComparables} from "./cortes-comparables.js";
export {cascada} from "./cascada.js";
export {marimekko} from "./marimekko.js";
export {icicle} from "./icicle.js";
export {arbolClasificacion} from "./arbol-clasificacion.js";
export {combinaciones} from "./combinaciones.js";
export {tablaBarras} from "./tabla-barras.js";
export {tablaCalor} from "./tabla-calor.js";
export {tablaMinigraficas} from "./tabla-minigraficas.js";
export {tablaPrecision, nivelDe, PRECISION} from "./tabla-precision.js";
export {globoCelda} from "./tabla-interaccion.js";
export {saldo} from "./saldo.js";
export {matriz, rampaRaiz} from "./matriz.js";
export {tablaOD} from "./tabla-od.js";
export {arcos} from "./arcos.js";
export {conjuntos} from "./conjuntos.js";
export {red} from "./red.js";
export {burbujas} from "./burbujas.js";
export {dorling} from "./dorling.js";
export {densidad} from "./densidad.js";
export {mosaicoBurbujas} from "./mosaico-burbujas.js";
export {fichasRango, tonoRango, rangoDe} from "./fichas-rango.js";
export {mapaBase, proyectar} from "./mapa-base.js";
export {arbolPregunta} from "./arbol-pregunta.js";
export {embudo} from "./embudo.js";
export {euler} from "./euler.js";
