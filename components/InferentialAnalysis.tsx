import React, { useState } from 'react';
import { InferentialResult } from '../types';
import { Calculator, ArrowRight, BookOpen } from 'lucide-react';

interface InferentialProps {
  headers: string[];
  onRunAnalysis: (var1: string, var2: string) => void;
  results: InferentialResult[];
  isProcessing: boolean;
}

export const InferentialAnalysis: React.FC<InferentialProps> = ({ headers, onRunAnalysis, results, isProcessing }) => {
  const [var1, setVar1] = useState<string>('');
  const [var2, setVar2] = useState<string>('');

  const handleRun = () => {
    if (var1) {
      onRunAnalysis(var1, var2);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-brand-500">
        <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
          <Calculator className="h-5 w-5 mr-2 text-brand-600" />
          Configuración de Análisis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Variable Principal (Numérica)</label>
            <select 
              value={var1} 
              onChange={(e) => setVar1(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
            >
              <option value="">Seleccionar variable...</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Variable Secundaria (Opcional)</label>
            <select 
              value={var2} 
              onChange={(e) => setVar2(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
            >
              <option value="">Ninguna (Solo Estimación)</option>
              {headers.filter(h => h !== var1).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <button
            onClick={handleRun}
            disabled={!var1 || isProcessing}
            className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${!var1 || isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-black'} 
              transition-colors w-full md:w-auto`}
          >
             {isProcessing ? 'Procesando...' : 'Ejecutar Motores'}
             <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        
        <p className="mt-4 text-xs text-slate-500">
          * Si selecciona dos variables numéricas, se ejecutará Regresión y Correlación. 
          * Si selecciona una numérica y una categórica, se intentará ANOVA o Prueba t.
        </p>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {results.map((res, idx) => (
            <div key={idx} className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                 <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{res.title}</h4>
                 <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    res.type === 'regression' ? 'bg-blue-100 text-blue-800' :
                    res.type === 'estimation' ? 'bg-green-100 text-green-800' :
                    'bg-brand-100 text-brand-800'
                 }`}>
                   {res.type}
                 </span>
              </div>
              <div className="p-4">
                 <p className="text-sm text-slate-600 mb-4 flex items-start">
                   <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-slate-400" />
                   {res.description}
                 </p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {res.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-50 p-3 rounded border border-slate-100">
                        <dt className="text-xs font-medium text-slate-500 truncate">{m.label}</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-900">{m.value}</dd>
                      </div>
                    ))}
                 </div>
                 {res.conclusion && (
                   <div className="mt-4 p-3 bg-brand-50 rounded border-l-4 border-brand-400 text-sm text-brand-900 font-medium">
                     Conclusión: {res.conclusion}
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};