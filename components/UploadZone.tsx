import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Activity } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 animate-fade-in-up">
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
      <input 
          id="file-upload" 
          name="file-upload" 
          type="file" 
          className="sr-only" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          ref={fileInputRef}
          onChange={handleChange}
      />
      
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
