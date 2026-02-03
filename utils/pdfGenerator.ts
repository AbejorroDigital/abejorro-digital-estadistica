import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VariableStats, METRIC_DEFINITIONS, InferentialResult } from '../types';

/**
 * Genera y descarga un informe estadístico profesional en formato PDF.
 * @description Esta utilidad utiliza `jsPDF` y `jspdf-autotable` para crear un documento 
 * estructurado que incluye branding personalizado, metadatos del archivo, 
 * tablas de estadística descriptiva por categorías y resultados inferenciales con conclusiones.
 * * @param {VariableStats[]} stats - Arreglo de métricas descriptivas calculadas.
 * @param {InferentialResult[]} inferentialResults - Arreglo de análisis inferenciales realizados (Regresión, etc.).
 * @param {string} fileName - Nombre del archivo original para incluir en el encabezado.
 * * @returns {void} Dispara la descarga del archivo 'Abejorro_Reporte.pdf'.
 */
export const generatePDF = (
  stats: VariableStats[], 
  inferentialResults: InferentialResult[],
  fileName: string
) => {
  const doc = new jsPDF();
  
  // Configuración de la paleta de colores de marca (Branding)
  const brandColor: [number, number, number] = [234, 179, 8]; // Amarillo Abejorro (#eab308)
  const secondaryColor: [number, number, number] = [23, 23, 23]; // Negro Neutro (#171717)

  /** * ENCABEZADO Y BRANDING
   * Crea una barra superior sólida y coloca el título del informe.
   */
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 20, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Abejorro Digital - Informe Estadístico", 14, 13);

  // Metadatos del informe
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Archivo: ${fileName || 'Sin nombre'}`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 14, 35);

  let startY = 45;

  /**
   * SECCIÓN 1: ESTADÍSTICA DESCRIPTIVA
   * Organiza las métricas en tablas agrupadas por categorías (Tendencia, Dispersión, etc.).
   */
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("1. Análisis Descriptivo", 14, startY);
  startY += 5;

  const categories = ['Tendencia', 'Dispersión', 'Posición', 'Forma'];
  
  categories.forEach((cat) => {
    // Filtrar métricas que pertenecen a la categoría actual
    const catMetrics = METRIC_DEFINITIONS.filter(m => m.category === cat);
    const tableHead = [['Variable', ...catMetrics.map(m => m.label)]];
    
    // Mapeo de datos para la tabla, aplicando formato numérico o exponencial si es necesario
    const tableBody = stats.map(stat => {
      return [
        stat.variableName,
        ...catMetrics.map(m => {
          const val = stat[m.id as keyof VariableStats];
          if (typeof val === 'number') {
            // Manejo de números muy pequeños para evitar ceros visuales engañosos
            return Math.abs(val) < 0.001 && val !== 0 ? val.toExponential(2) : parseFloat(val.toFixed(3));
          }
          return val;
        })
      ];
    });

    // Generación de tabla automática con autoTable
    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: startY + 2,
      theme: 'grid',
      headStyles: { 
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
      }, 
      styles: { fontSize: 7, cellPadding: 1.5 },
      margin: { top: 10 },
    });

    // Actualización de la posición Y para la siguiente tabla o sección
    startY = (doc as any).lastAutoTable.finalY + 10;
    
    // Control de salto de página preventivo
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }
  });

  /**
   * SECCIÓN 2: ESTADÍSTICA INFERENCIAL
   * Renderiza los resultados de correlación, regresión o estimación si existen.
   */
  if (inferentialResults.length > 0) {
    if (startY > 240) {
      doc.addPage();
      startY = 20;
    } else {
      startY += 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("2. Análisis Inferencial y Pruebas", 14, startY);
    startY += 8;

    inferentialResults.forEach(res => {
      // Título del análisis específico
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(res.title, 14, startY);
      
      // Descripción narrativa del análisis
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(res.description, 14, startY + 5);

      // Tabla de métricas específicas del resultado inferencial
      const metricsData = res.metrics.map(m => [m.label, m.value]);
      
      autoTable(doc, {
        body: metricsData,
        startY: startY + 8,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
           0: { fontStyle: 'bold', cellWidth: 50 },
           1: { cellWidth: 'auto' }
        },
        margin: { left: 14 }
      });

      let nextY = (doc as any).lastAutoTable.finalY;

      // Inserción de la conclusión interpretativa si está disponible
      if (res.conclusion) {
         doc.setTextColor(180, 83, 9); // Color énfasis para conclusiones
         doc.setFont("helvetica", "italic");
         doc.text(`Conclusión: ${res.conclusion}`, 14, nextY + 5);
         nextY += 10;
      } else {
         nextY += 5;
      }

      startY = nextY + 5;
      if (startY > 270) {
          doc.addPage();
          startY = 20;
      }
    });
  }

  /**
   * PIE DE PÁGINA (Paginación)
   * Recorre todas las páginas generadas para añadir el número de página y branding final.
   */
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
     doc.setPage(i);
     doc.setFontSize(8);
     doc.setTextColor(150);
     doc.text(`Página ${i} de ${pageCount} - Generado por Abejorro Digital`, 105, 290, { align: 'center' });
  }

  // Guardado del archivo en el cliente
  doc.save('Abejorro_Reporte.pdf');
};
