/**
 * Crea un Web Worker mediante un Blob para procesamiento de datos en segundo plano.
 * @description Esta función encapsula toda la lógica de cálculo pesado (Lectura de Excel, 
 * Estadística Descriptiva e Inferencial) para evitar bloquear el hilo principal de la UI.
 * * @returns {string} Una URL de objeto que apunta al script del Worker generado.
 */
export const createWorker = () => {
  const workerCode = `
    // Importación de librerías externas dentro del entorno del Worker
    importScripts("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
    importScripts("https://unpkg.com/simple-statistics@7.8.3/dist/simple-statistics.min.js");

    const ss = self.ss; // Alias para la librería simple-statistics

    /**
     * Calcula la moda de un arreglo numérico.
     * @param {number[]} arr - Datos de la columna.
     * @returns {string} Representación textual de la(s) moda(s).
     */
    const mode = (arr) => {
      const frequency = {};
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
      if (modes.length > 5) return modes.slice(0, 5).join(', ') + "...";
      return modes.join(', ');
    };

    /**
     * Orquestador de estadísticas descriptivas.
     * Utiliza simple-statistics para robustez en cálculos complejos como asimetría y curtosis.
     */
    const calculateStats = (data, label) => {
      if (data.length === 0) return null;
      
      const meanVal = ss.mean(data);
      const minVal = ss.min(data);
      const maxVal = ss.max(data);
      const stdVal = ss.sampleStandardDeviation(data);
      const varVal = ss.sampleVariance(data);
      
      return {
        variableName: label,
        count: data.length,
        mean: meanVal,
        median: ss.median(data),
        mode: mode(data),
        stdDev: stdVal,
        variance: varVal,
        coeffVariation: meanVal !== 0 ? (stdVal / Math.abs(meanVal)) * 100 : 0,
        range: maxVal - minVal,
        min: minVal,
        max: maxVal,
        q1: ss.quantile(data, 0.25),
        q2: ss.median(data),
        q3: ss.quantile(data, 0.75),
        p10: ss.quantile(data, 0.10),
        p90: ss.quantile(data, 0.90),
        skewness: ss.sampleSkewness(data),
        kurtosis: ss.sampleKurtosis(data),
      };
    };

    /**
     * Calcula Intervalos de Confianza para la media.
     * @param {number[]} data - Arreglo de números.
     * @param {number} confidenceLevel - Nivel (0.95 o 0.99).
     */
    const calculateCI = (data, confidenceLevel) => {
      const n = data.length;
      const mean = ss.mean(data);
      const std = ss.sampleStandardDeviation(data);
      const z = confidenceLevel === 0.95 ? 1.96 : 2.576; 
      const margin = z * (std / Math.sqrt(n));
      return { lower: mean - margin, upper: mean + margin, mean };
    };

    /**
     * Realiza el análisis inferencial basado en el tipo de variables seleccionadas.
     * @description Identifica automáticamente si realizar estimaciones, correlaciones o pruebas t.
     */
    const performInferentialAnalysis = (var1Name, data1, var2Name, data2, data2IsCategorical) => {
       const results = [];

       // 1. ESTIMACIÓN (Variable Única)
       if (data1 && data1.length > 0) {
          const ci95 = calculateCI(data1, 0.95);
          const ci99 = calculateCI(data1, 0.99);
          
          results.push({
            title: \`Estimación Puntual e Intervalos: \${var1Name}\`,
            type: 'estimation',
            description: 'Intervalos de confianza para la media poblacional.',
            metrics: [
               { label: 'Media Muestral', value: ci95.mean.toFixed(4) },
               { label: 'IC 95%', value: \`[\${ci95.lower.toFixed(4)}, \${ci95.upper.toFixed(4)}]\` },
               { label: 'IC 99%', value: \`[\${ci99.lower.toFixed(4)}, \${ci99.upper.toFixed(4)}]\` }
            ]
          });
       }

       // 2. CORRELACIÓN Y REGRESIÓN (Dos Variables Numéricas)
       if (data1 && data2 && !data2IsCategorical && data1.length === data2.length) {
          const correlation = ss.sampleCorrelation(data1, data2);
          const r2 = Math.pow(correlation, 2);
          
          results.push({
             title: 'Correlación de Pearson',
             type: 'correlation',
             description: \`Relación lineal entre \${var1Name} (X) y \${var2Name} (Y).\`,
             metrics: [
                { label: 'Coeficiente (r)', value: correlation.toFixed(4) },
                { label: 'Interpretación', value: Math.abs(correlation) > 0.7 ? 'Fuerte' : Math.abs(correlation) > 0.3 ? 'Moderada' : 'Débil' }
             ]
          });

          const regression = ss.linearRegression(data1.map((v, i) => [v, data2[i]]));
          const m = regression.m;
          const b = regression.b;
          
          results.push({
             title: 'Regresión Lineal Simple',
             type: 'regression',
             description: 'Modelo predictivo y = mx + b',
             metrics: [
                { label: 'Pendiente (m)', value: m.toFixed(4) },
                { label: 'Intersección (b)', value: b.toFixed(4) },
                { label: 'R² (Coef. Det.)', value: r2.toFixed(4) },
                { label: 'Ecuación', value: \`y = \${m.toFixed(2)}x + \${b.toFixed(2)}\` }
             ]
          });
       }

       // 3. COMPARACIÓN DE GRUPOS (Numérica vs Categórica)
       if (data1 && data2 && data2IsCategorical) {
          const groups = {};
          data2.forEach((cat, i) => {
             if (!groups[cat]) groups[cat] = [];
             groups[cat].push(data1[i]);
          });
          const groupKeys = Object.keys(groups);

          if (groupKeys.length === 2) {
             try {
               const g1 = groups[groupKeys[0]];
               const g2 = groups[groupKeys[1]];
               const tVal = ss.tTestTwoSample(g1, g2);
               
               results.push({
                  title: 'Prueba t de Student (2 Grupos)',
                  type: 'hypothesis',
                  description: \`Comparación de medias entre \${groupKeys[0]} y \${groupKeys[1]}.\`,
                  metrics: [
                      { label: 'Estadístico t', value: tVal.toFixed(4) },
                      { label: 'Hipótesis Nula (H0)', value: 'Medias iguales' },
                      { label: 'Tamaño G1', value: g1.length },
                      { label: 'Tamaño G2', value: g2.length }
                  ],
                  conclusion: Math.abs(tVal) > 1.96 ? 'Posible diferencia significativa (t > 1.96)' : 'No hay evidencia fuerte de diferencia.'
               });
             } catch (e) {}
          }
          
          if (groupKeys.length > 2) {
             results.push({
                title: 'Análisis de Varianza (ANOVA)',
                type: 'anova',
                description: \`Comparación entre \${groupKeys.length} grupos detectados.\`,
                metrics: [
                   { label: 'Grupos', value: groupKeys.join(', ') },
                   { label: 'Nota', value: 'Se requiere una distribución F para obtener p-valor exacto.'}
                ]
             });
          }
       }
       return results;
    }

    /**
     * Escucha de mensajes del hilo principal.
     * Gestiona las peticiones de procesamiento de archivos y ejecución de análisis.
     */
    self.onmessage = (e) => {
      try {
        const { type, payload } = e.data;

        if (type === 'PROCESS_FILE') {
          const { fileData } = payload;
          const wb = XLSX.read(fileData, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawData = XLSX.utils.sheet_to_json(ws);

          if (!rawData || rawData.length === 0) {
            self.postMessage({ type: 'ERROR', payload: 'El archivo está vacío
