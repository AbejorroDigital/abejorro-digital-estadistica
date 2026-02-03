import React from 'react';
import { VariableStats, METRIC_DEFINITIONS } from '../types';
import { Tooltip } from './Tooltip';
import { AlertCircle } from 'lucide-react';

/**
 * Propiedades para el componente ResultsTable.
 * @interface ResultsTableProps
 * @property {VariableStats[]} stats - Arreglo de objetos con los cálculos descriptivos de cada variable.
 */
interface ResultsTableProps {
  stats: VariableStats[];
}

/**
 * Utilidad para dar formato a los valores numéricos estadísticos.
 * Maneja notación científica para números muy pequeños/grandes y 
 * aplica formato local (es-ES) con precisión de 2 a 3 decimales.
 * * @param {string | number} val - El valor a formatear.
 * @returns {string | number} El valor transformado para su visualización.
 */
const formatValue = (val: string | number) => {
  if (typeof val === 'string') return val;
  if (val === 0) return 0;
  // Si el número es extremadamente pequeño o grande, usamos notación exponencial
  if (Math.abs(val) < 0.0001 || Math.abs(val) > 1000000) return val.toExponential(3);
  // Formato estándar con separadores de miles y decimales según región de España
  return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
};

/**
 * Componente de Tabla de Resultados.
 * Presenta la Estadística Descriptiva en un formato tabular con columnas fijas y tooltips informativos.
 * * Se utiliza `React.memo` con una función de comparación personalizada para evitar 
 * re-renderizados innecesarios, optimizando el rendimiento cuando el usuario interactúa 
 * con otros elementos de la UI.
 * * @component
 */
export const ResultsTable = React.memo(({ stats }: ResultsTableProps) => {
  return (
    <div className="space-y-4">
      {/* Contenedor principal de la tabla con sombras y bordes redondeados */}
      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Estadística Descriptiva</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Análisis univariado para todas las columnas numéricas.</p>
        </div>

        {/* Contenedor con scroll horizontal para asegurar responsividad en móviles */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                <tr>
                    {/* La columna "Variable" permanece fija a la izquierda mediante 'sticky' */}
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                        Variable
                    </th>
                    {/* Generación dinámica de encabezados basados en las definiciones de métricas */}
                    {METRIC_DEFINITIONS.map((metric) => (
                        <th key={metric.id} scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">
                            <Tooltip content={metric.description}>
                                <span className="border-b border-dotted border-slate-400 cursor-help">{metric.label}</span>
                            </Tooltip>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                    {stats.map((row) => (
                        <tr key={row.variableName} className="hover:bg-slate-50 transition-colors">
                            {/* Nombre de la variable con fondo sólido para evitar transparencia al hacer scroll horizontal */}
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 sticky left-0 bg-white border-r border-slate-200">
                                {row.variableName}
                            </td>
                            {/* Renderizado de cada métrica calculada para la fila actual */}
                            {METRIC_DEFINITIONS.map((metric) => (
                                <td key={`${row.variableName}-${metric.id}`} className="px-3 py-4 text-sm text-slate-500 text-right font-mono">
                                    {formatValue(row[metric.id as keyof VariableStats] as number | string)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      
      {/* Nota informativa inferior */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
        <div className="flex">
            <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
                <p className="text-sm text-blue-700">
                    Consejo: Pase el ratón sobre los encabezados de las columnas para ver la definición de cada medida estadística.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.stats === next.stats); // Verificación de igualdad para evitar renders si los datos no han cambiado
