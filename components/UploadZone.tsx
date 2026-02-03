import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Activity } from 'lucide-react';

/**
 * Propiedades para el componente UploadZone.
 * @interface UploadZoneProps
 * @property {(file: File) => void} onFileSelected - Callback que se ejecuta cuando el usuario selecciona o suelta un archivo válido.
 */
interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

/**
 * Componente de Zona de Carga.
 * Proporciona una interfaz visual para que el usuario suba archivos mediante clic o arrastrar y soltar (Drag and Drop).
 * * @description Soporta múltiples formatos de hojas de cálculo y utiliza una entrada de archivo oculta 
 * activada mediante una referencia (`useRef`) para mantener una estética limpia.
 * * @component
 */
export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected }) => {
  // Referencia al input de tipo file oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para gestionar el estilo visual cuando un archivo está siendo arrastrado sobre la zona
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Previene el comportamiento por defecto y activa el estado visual de arrastre.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Desactiva el estado visual de arrastre cuando el cursor sale del área.
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Maneja la acción de soltar el archivo. 
   * Recupera el primer archivo detectado y lo envía al callback principal.
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  /**
   * Maneja la selección de archivos mediante el explorador de archivos estándar del sistema operativo.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 animate-fade-in-up">
      {/* Área interactiva principal */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50'
          }`}
      >
        <div className="space-y-2 text-center pointer-events-none">
          {/* Icono animado dinámico */}
          <div className={`mx-auto h-16 w-16 transition-colors flex items-center justify-center rounded-full
            ${isDragging ? 'text-brand-600 bg-white' : 'text-slate-400 bg-slate-50 group-hover:text-brand-500 group-hover:bg-white'}
          `}>
              <Upload className="h-10 w-10" />
          </div>
          <div className="flex text-sm text-slate-600 justify-center">
            <span className="relative rounded-md font-medium text-brand-600 focus-within:outline-none">
              Subir un archivo
            </span>
            <p className="pl-1">o arrastrar y soltar</p>
          </div>
          <p className="text-xs text-slate-500">
            XLSX, XLS, ODS, o CSV. (Soporta archivos grandes, recomendado &lt; 50MB)
          </p>
        </div>
      </div>

      {/* Input de tipo archivo oculto para accesibilidad y funcionalidad de clic */}
      <input 
          id="file-upload" 
          name="file-upload" 
          type="file" 
          className="sr-only" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          ref={fileInputRef}
          onChange={handleChange}
      />
      
      {/* Tarjetas informativas de características adicionales */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
              <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                       <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Formatos</h3>
              </div>
              <p className="text-slate-600 text-sm">Compatible con Excel (.xlsx, .xls), OpenOffice (.ods) y CSV. Detección automática de columnas.</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
              <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
                       <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Velocidad</h3>
              </div>
              <p className="text-slate-600 text-sm">Procesamiento en segundo plano (Web Workers) para analizar grandes volúmenes de datos sin interrupciones.</p>
          </div>
      </div>
    </div>
  );
};
