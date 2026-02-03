import { DataRow } from '../types';

/**
 * Normaliza los encabezados de una fila de datos.
 * @description Elimina espacios en blanco, caracteres invisibles (como BOM de UTF-8) 
 * y espacios de no ruptura (non-breaking spaces) tanto al inicio como al final 
 * de los nombres de las columnas. Esto garantiza que el acceso a las propiedades 
 * sea consistente durante el análisis.
 * * @param {any} row - Objeto que representa una fila cruda extraída del archivo.
 * @returns {DataRow} Un nuevo objeto con las claves (headers) limpias y sus valores originales.
 */
export const normalizeHeaders = (row: any): DataRow => {
  const normalized: DataRow = {};
  Object.keys(row).forEach(key => {
    // Expresión regular para limpiar espacios y caracteres Unicode invisibles
    const cleanKey = key.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if (cleanKey) {
      normalized[cleanKey] = row[key];
    }
  });
  return normalized;
};

/**
 * Sanitiza y convierte un valor crudo en un número válido o nulo.
 * @description Este proceso es crítico para la estadística:
 * 1. Si ya es un número, se mantiene.
 * 2. Si es una cadena, elimina espacios y trata de parsearlo.
 * 3. Si el valor es una cadena vacía o no es un número (NaN), devuelve null 
 * para que los cálculos estadísticos lo ignoren correctamente.
 * * @param {any} val - El valor extraído de una celda de la hoja de cálculo.
 * @returns {number | null} El valor convertido a número o null si no es numérico.
 */
export const sanitizeValue = (val: any): number | null => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return null;
    const parsed = parseFloat(trimmed);
    // Verificamos si el parseo fue exitoso
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};
