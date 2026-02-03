/**
 * Utilidades matemáticas para el cálculo de indicadores estadísticos.
 */

/**
 * Ordena un arreglo de números de forma ascendente sin mutar el original.
 * @param {number[]} arr - Conjunto de números a ordenar.
 * @returns {number[]} Nuevo arreglo ordenado.
 */
const asc = (arr: number[]) => arr.slice().sort((a, b) => a - b);

/**
 * Calcula la sumatoria total de los elementos de un arreglo.
 * @param {number[]} arr - Arreglo numérico.
 * @returns {number} Suma total.
 */
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * Calcula el promedio aritmético (Media).
 * @param {number[]} arr - Arreglo numérico.
 * @returns {number} Promedio.
 */
const mean = (arr: number[]) => sum(arr) / arr.length;

/**
 * Calcula la Varianza Muestral.
 * @description Utiliza (n - 1) en el denominador para proporcionar un estimador insesgado.
 * @param {number[]} arr - Arreglo numérico.
 * @param {number} meanVal - Media aritmética previamente calculada.
 * @returns {number} Varianza de la muestra.
 */
const variance = (arr: number[], meanVal: number) => {
  if (arr.length < 2) return 0;
  return arr.reduce((acc, val) => acc + Math.pow(val - meanVal, 2), 0) / (arr.length - 1);
};

/**
 * Calcula la Desviación Estándar.
 * @param {number} varianceVal - Varianza previamente calculada.
 * @returns {number} Desviación estándar.
 */
const stdDev = (varianceVal: number) => Math.sqrt(varianceVal);

/**
 * Calcula un cuantil específico mediante interpolación lineal.
 * @param {number[]} sortedArr - Arreglo numérico ya ordenado de forma ascendente.
 * @param {number} q - Valor del cuantil entre 0 y 1 (ej: 0.5 para la mediana).
 * @returns {number} Valor del cuantil.
 */
const quantile = (sortedArr: number[], q: number) => {
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  } else {
    return sortedArr[base];
  }
};

/**
 * Identifica la Moda de un conjunto de datos.
 * @description Si hay más de 5 modas, devuelve las primeras 5 seguidas de puntos suspensivos.
 * @param {number[]} arr - Arreglo numérico.
 * @returns {string} Una cadena con la(s) moda(s) o "Sin Moda".
 */
const mode = (arr: number[]): string => {
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  
  arr.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) maxFreq = frequency[num];
  });

  if (maxFreq === 1) return "Sin Moda";

  const modes = Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFreq)
    .map(Number)
    .sort((a, b) => a - b);

  if (modes.length > 5) return `${modes.slice(0, 5).join(', ')}...`;
  return modes.join(', ');
};

/**
 * Calcula el Coeficiente de Asimetría de Fisher.
 * @description Indica si los datos se distribuyen uniformemente alrededor de la media.
 * @param {number[]} arr - Arreglo numérico.
 * @param {number} meanVal - Media aritmética.
 * @param {number} stdDevVal - Desviación estándar.
 * @returns {number} Valor de asimetría.
 */
const skewness = (arr: number[], meanVal: number, stdDevVal: number) => {
  if (arr.length < 3 || stdDevVal === 0) return 0;
  const n = arr.length;
  const cubedDiffs = arr.reduce((acc, val) => acc + Math.pow(val - meanVal, 3), 0);
  return (n * cubedDiffs) / ((n - 1) * (n - 2) * Math.pow(stdDevVal, 3));
};

/**
 * Calcula la Curtosis (Exceso de curtosis).
 * @description Mide el grado de concentración de los valores alrededor de la zona central de la distribución.
 * @param {number[]} arr - Arreglo numérico.
 * @param {number} meanVal - Media aritmética.
 * @param {number} stdDevVal - Desviación estándar.
 * @returns {number} Valor de curtosis.
 */
const kurtosis = (arr: number[], meanVal: number, stdDevVal: number) => {
  if (arr.length < 4 || stdDevVal === 0) return 0;
  const n = arr.length;
  const fourthDiffs = arr.reduce((acc, val) => acc + Math.pow(val - meanVal, 4), 0);
  return ((n * (n + 1) * fourthDiffs) / ((n - 1) * (n - 2) * (n - 3) * Math.pow(stdDevVal, 4))) - ((3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3)));
};

/**
 * Ejecuta el análisis descriptivo completo sobre un set de datos.
 * @param {number[]} data - Arreglo con los datos numéricos de una columna.
 * @param {string} label - Nombre de la variable analizada.
 * @returns {Object|null} Objeto con todos los indicadores estadísticos calculados.
 */
export const calculateStats = (data: number[], label: string) => {
  if (data.length === 0) return null;

  const sorted = asc(data);
  const n = sorted.length;
  const minVal = sorted[0];
  const maxVal = sorted[n - 1];
  const meanVal = mean(sorted);
  const varVal = variance(sorted, meanVal);
  const stdVal = stdDev(varVal);
  
  return {
    variableName: label,
    count: n,
    mean: meanVal,
    median: quantile(sorted, 0.5),
    mode: mode(sorted),
    stdDev: stdVal,
    variance: varVal,
    coeffVariation: meanVal !== 0 ? (stdVal / Math.abs(meanVal)) * 100 : 0,
    range: maxVal - minVal,
    min: minVal,
    max: maxVal,
    q1: quantile(sorted, 0.25),
    q2: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    p10: quantile(sorted, 0.10),
    p90: quantile(sorted, 0.90),
    skewness: skewness(sorted, meanVal, stdVal),
    kurtosis: kurtosis(sorted, meanVal, stdVal),
  };
};
