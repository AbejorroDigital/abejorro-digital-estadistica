import { DataRow } from '../types';

export const normalizeHeaders = (row: any): DataRow => {
  const normalized: DataRow = {};
  Object.keys(row).forEach(key => {
    // Remove whitespace and invisible characters from headers
    const cleanKey = key.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if (cleanKey) {
      normalized[cleanKey] = row[key];
    }
  });
  return normalized;
};

export const sanitizeValue = (val: any): number | null => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return null;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};