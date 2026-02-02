export interface DataRow {
  [key: string]: string | number | null | undefined;
}

export interface VariableStats {
  variableName: string;
  count: number;
  mean: number;
  median: number;
  mode: string;
  stdDev: number;
  variance: number;
  coeffVariation: number;
  range: number;
  min: number;
  max: number;
  q1: number;
  q2: number;
  q3: number;
  p10: number;
  p90: number;
  skewness: number;
  kurtosis: number;
}

export interface InferentialResult {
  title: string;
  type: 'estimation' | 'hypothesis' | 'correlation' | 'regression' | 'anova' | 'nonparametric';
  description: string;
  metrics: { label: string; value: string | number; isSignificant?: boolean }[];
  conclusion?: string;
}

export interface MetricDefinition {
  id: keyof VariableStats;
  label: string;
  description: string;
  category: 'Tendencia' | 'Dispersión' | 'Posición' | 'Forma' | 'General';
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  { id: 'count', label: 'N', description: 'Conteo de observaciones numéricas válidas.', category: 'General' },
  { id: 'mean', label: 'Media', description: 'El promedio aritmético del conjunto de datos.', category: 'Tendencia' },
  { id: 'median', label: 'Mediana', description: 'El valor central que separa la mitad superior de la inferior del conjunto de datos.', category: 'Tendencia' },
  { id: 'mode', label: 'Moda', description: 'El valor que aparece con mayor frecuencia en el conjunto de datos.', category: 'Tendencia' },
  { id: 'stdDev', label: 'Desv. Est.', description: 'Desviación Estándar: Medida de la cantidad de variación o dispersión.', category: 'Dispersión' },
  { id: 'variance', label: 'Varianza', description: 'La esperanza de la desviación al cuadrado de una variable aleatoria respecto a su media.', category: 'Dispersión' },
  { id: 'coeffVariation', label: 'CV %', description: 'Coeficiente de Variación: La relación entre la desviación estándar y la media.', category: 'Dispersión' },
  { id: 'range', label: 'Rango', description: 'La diferencia entre el valor más grande y el más pequeño.', category: 'Dispersión' },
  { id: 'q1', label: 'Q1', description: 'Primer Cuartil (percentil 25).', category: 'Posición' },
  { id: 'q2', label: 'Q2', description: 'Segundo Cuartil (percentil 50), igual a la Mediana.', category: 'Posición' },
  { id: 'q3', label: 'Q3', description: 'Tercer Cuartil (percentil 75).', category: 'Posición' },
  { id: 'p10', label: 'P10', description: 'Percentil 10.', category: 'Posición' },
  { id: 'p90', label: 'P90', description: 'Percentil 90.', category: 'Posición' },
  { id: 'skewness', label: 'Asimetría', description: 'Medida de la asimetría de la distribución de probabilidad.', category: 'Forma' },
  { id: 'kurtosis', label: 'Curtosis', description: 'Medida de la "pesadez de las colas" de la distribución de probabilidad.', category: 'Forma' },
];