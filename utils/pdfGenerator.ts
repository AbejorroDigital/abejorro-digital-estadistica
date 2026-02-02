import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VariableStats, METRIC_DEFINITIONS, InferentialResult } from '../types';

export const generatePDF = (
  stats: VariableStats[], 
  inferentialResults: InferentialResult[],
  fileName: string
) => {
  const doc = new jsPDF();
  const brandColor: [number, number, number] = [234, 179, 8]; // #eab308 (Yellow 500)
  const secondaryColor: [number, number, number] = [23, 23, 23]; // #171717 (Neutral 900)

  // Header with Branding
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 20, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Abejorro Digital - Informe Estadístico", 14, 13);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Archivo: ${fileName || 'Sin nombre'}`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 14, 35);

  let startY = 45;

  // --- SECTION 1: DESCRIPTIVE ---
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("1. Análisis Descriptivo", 14, startY);
  startY += 5;

  const categories = ['Tendencia', 'Dispersión', 'Posición', 'Forma'];
  
  categories.forEach((cat) => {
    const catMetrics = METRIC_DEFINITIONS.filter(m => m.category === cat);
    const tableHead = [['Variable', ...catMetrics.map(m => m.label)]];
    const tableBody = stats.map(stat => {
      return [
        stat.variableName,
        ...catMetrics.map(m => {
          const val = stat[m.id as keyof VariableStats];
          if (typeof val === 'number') {
            return Math.abs(val) < 0.001 && val !== 0 ? val.toExponential(2) : parseFloat(val.toFixed(3));
          }
          return val;
        })
      ];
    });

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

    startY = (doc as any).lastAutoTable.finalY + 10;
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }
  });

  // --- SECTION 2: INFERENTIAL ---
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
      // Box Title
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(res.title, 14, startY);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(res.description, 14, startY + 5);

      // Metrics Table for this result
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

      if (res.conclusion) {
         doc.setTextColor(180, 83, 9); // brand-700 approx (darkish orange/yellow)
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

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
     doc.setPage(i);
     doc.setFontSize(8);
     doc.setTextColor(150);
     doc.text(`Página ${i} de ${pageCount} - Generado por Abejorro Digital`, 105, 290, { align: 'center' });
  }

  doc.save('Abejorro_Reporte.pdf');
};