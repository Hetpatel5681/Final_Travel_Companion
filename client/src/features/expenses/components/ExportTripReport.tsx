import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportTripReportProps {
  elementId: string;
  tripTitle: string;
}

export const ExportTripReport = ({ elementId, tripTitle }: ExportTripReportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById(elementId);
    if (!input) return;

    try {
      setIsExporting(true);
      
      const canvas = await html2canvas(input, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${tripTitle.replace(/\s+/g, '_')}_Financial_Report.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to generate PDF. Make sure all images have CORS enabled.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExportPDF} 
      disabled={isExporting}
      className="bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 border border-white/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
    >
      {isExporting ? '⏳ Generating PDF...' : '🖨️ Export PDF'}
    </button>
  );
};
