import React from 'react';
import { VariableStats, METRIC_DEFINITIONS } from '../types';
import { Tooltip } from './Tooltip';
import { AlertCircle } from 'lucide-react';

interface ResultsTableProps {
  stats: VariableStats[];
}

const formatValue = (val: string | number) => {
  if (typeof val === 'string') return val;
  if (val === 0) return 0;
  if (Math.abs(val) < 0.0001 || Math.abs(val) > 1000000) return val.toExponential(3);
  return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
};

// Memoized component to prevent re-renders on parent state changes (like tooltip interactions)
export const ResultsTable = React.memo(({ stats }: ResultsTableProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Estadística Descriptiva</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Análisis univariado para todas las columnas numéricas.</p>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                        Variable
                    </th>
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
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 sticky left-0 bg-white border-r border-slate-200">
                                {row.variableName}
                            </td>
                            {METRIC_DEFINITIONS.map((metric) => (
                                <td key={`${row.variableName}-${metric.id}`} className="px-3 py-4 text-sm text-slate-500 text-right font-mono">
                                    {formatValue(row[metric.id])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      
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
}, (prev, next) => prev.stats === next.stats); // Custom comparison check