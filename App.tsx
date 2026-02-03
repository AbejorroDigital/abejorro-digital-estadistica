import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, AlertCircle, X, Loader2, BarChart2, Lightbulb } from 'lucide-react';
import { VariableStats, InferentialResult } from './types';
import { createWorker } from './utils/worker';
import { generatePDF } from './utils/pdfGenerator';
import { UploadZone } from './components/UploadZone';
import { ResultsTable } from './components/ResultsTable';
import { InferentialAnalysis } from './components/InferentialAnalysis';

/**
 * Componente Raíz - Abejorro Digital.
 * @description Actúa como el controlador principal de la aplicación. 
 * Gestiona el ciclo de vida del Web Worker, la carga de archivos binarios,
 * la navegación por pestañas y el flujo de estados de procesamiento.
 * @component
 */
export default function App() {
  // --- ESTADOS DE DATOS ESTADÍSTICOS ---
  const [stats, setStats] = useState<VariableStats[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  
  // --- ESTADOS DE CONTROL Y UI ---
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'descriptive' | 'inferential'>('descriptive');
  
  // --- ESTADOS DE ANÁLISIS INFERENCIAL ---
  const [inferentialResults, setInferentialResults] = useState<InferentialResult[]>([]);
  const [inferentialLoading, setInferentialLoading] = useState(false);
  
  /** * Referencia al Worker para persistencia entre renders.
   */
  const workerRef = useRef<Worker | null>(null);

  /**
   * Inicializa el Web Worker y establece el canal de escucha de mensajes.
   * @listens message - Escucha eventos 'SUCCESS_FILE', 'SUCCESS_INFERENTIAL' y 'ERROR'.
   */
  useEffect(() => {
    const workerUrl = createWorker();
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'SUCCESS_FILE') {
        setStats(payload.stats);
        setRawData(payload.rawData);
        setHeaders(payload.headers);
        setTotalRows(payload.count);
        setLoading(false);
      } else if (type === 'SUCCESS_INFERENTIAL') {
        setInferentialResults(payload);
        setInferentialLoading(false);
      } else if (type === 'ERROR') {
        setError(payload);
        setLoading(false);
        setInferentialLoading(false);
      }
    };

    // Limpieza al desmontar el componente
    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  /**
   * Procesa el archivo seleccionado convirtiéndolo a cadena binaria.
   * @param {File} file - Archivo obtenido del componente UploadZone.
   */
  const processFile = (file: File) => {
    setLoading(true);
    setError(null);
    setStats([]);
    setInferentialResults([]);
    setFileName(file.name);
    setActiveTab('descriptive');

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'PROCESS_FILE',
          payload: { fileData: binaryStr, fileName: file.name }
        });
      }
    };
    reader.onerror = () => {
      setError("Error al leer el archivo.");
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  /**
   * Envía una solicitud de análisis inferencial al Worker.
   * @param {string} var1 - Variable dependiente/principal.
   * @param {string} var2 - Variable independiente/comparativa.
   */
  const runInferential = (var1: string, var2: string) => {
     setInferentialLoading(true);
     if (workerRef.current) {
        workerRef.current.postMessage({
           type: 'RUN_INFERENTIAL',
           payload: { var1, var2, data: rawData }
        });
     }
  };

  /**
   * Dispara la generación del documento PDF con los resultados actuales.
   */
  const handleExportPDF = () => {
    if (stats.length > 0 && fileName) {
      generatePDF(stats, inferentialResults, fileName);
    }
  };

  /**
   * Reinicia la aplicación al estado de bienvenida.
   */
  const reset = () => {
    setStats([]);
    setRawData([]);
    setInferentialResults([]);
    setFileName(null);
    setError(null);
    setTotalRows(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header con identidad visual de marca */}
      <header className="bg-brand-900 border-b-4 border-brand-500 sticky top-0 z-40 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={reset}>
            <div className="bg-brand-500 p-2 rounded-full text-brand-900 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Abejorro Digital</h1>
              <p className="text-xs text-brand-400 font-medium tracking-wider uppercase">Estadística Profesional</p>
            </div>
          </div>
          {stats.length > 0 && (
             <div className="flex items-center space-x-3">
                <button 
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Nuevo Archivo
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-brand-900 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all active:scale-95"
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF Completo
                </button>
             </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {/* Notificaciones de Error */}
        {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 animate-fade-in-up">
              <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
                  </div>
                  <div className="ml-auto pl-3">
                      <button onClick={() => setError(null)} className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
              </div>
            </div>
        )}

        {/* Estado inicial: Zona de carga */}
        {stats.length === 0 && !loading && (
          <UploadZone onFileSelected={processFile} />
        )}

        {/* Pantalla de carga global */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 mt-8 animate-pulse">
            <Loader2 className="h-12 w-12 text-brand-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium text-lg">Procesando datos del enjambre...</p>
          </div>
        )}

        {/* Área principal de resultados post-carga */}
        {stats.length > 0 && !loading && (
          <div className="animate-fade-in-up">
            
            {/* Resumen del archivo procesado */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div>
                 <h2 className="text-lg font-bold text-slate-800">{fileName}</h2>
                 <p className="text-sm text-slate-500">{totalRows.toLocaleString()} registros procesados • {headers.length} columnas</p>
              </div>
            </div>

            {/* Navegación por Pestañas */}
            <div className="border-b border-slate-200 mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('descriptive')}
                  className={`${
                    activeTab === 'descriptive'
                      ? 'border-brand-500 text-brand-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  1. Análisis Descriptivo
                </button>
                <button
                  onClick={() => setActiveTab('inferential')}
                  className={`${
                    activeTab === 'inferential'
                      ? 'border-brand-500 text-brand-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  2. Análisis Inferencial
                </button>
              </nav>
            </div>

            {/* Contenido dinámico según pestaña activa */}
            <div className="min-h-[400px]">
              {activeTab === 'descriptive' ? (
                <ResultsTable stats={stats} />
              ) : (
                <InferentialAnalysis 
                  headers={headers} 
                  onRunAnalysis={runInferential}
                  results={inferentialResults}
                  isProcessing={inferentialLoading}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
