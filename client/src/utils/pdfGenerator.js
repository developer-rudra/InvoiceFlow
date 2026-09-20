import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Downloads an HTML element as a PDF document
 * @param {String} elementId The HTML element ID to print
 * @param {String} filename Output PDF filename
 */
export const downloadInvoicePDF = async (elementId = 'invoice-document', filename = 'Invoice.pdf') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return false;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('[PDF Export Error]', error);
    return false;
  }
};
