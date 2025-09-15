import React, { useState } from 'react';
import type { AuthorReportData } from '../types';
import { AuthorDetail } from './AuthorDetail';

// Tell TypeScript that these libraries are loaded globally from the HTML
declare var jspdf: any;
declare var html2canvas: any;
declare var JSZip: any;

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


interface RoyaltyReportProps {
    data: AuthorReportData[];
}

export const RoyaltyReport: React.FC<RoyaltyReportProps> = ({ data }) => {
    const [isZipping, setIsZipping] = useState(false);

    const generatePdfBlob = async (element: HTMLElement): Promise<Blob> => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const canvasPdfWidth = pdfWidth;
        const canvasPdfHeight = canvasPdfWidth / ratio;

        let heightLeft = canvasPdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, canvasPdfWidth, canvasPdfHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - canvasPdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, canvasPdfWidth, canvasPdfHeight);
            heightLeft -= pdfHeight;
        }

        return pdf.output('blob');
    };

    const handleDownloadAll = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            
            // Temporarily expand all sections to ensure they are in the DOM for capture
            const allDetails = document.querySelectorAll<HTMLDetailsElement>('details.author-details-container');
            allDetails.forEach(d => d.open = true);

            // Allow DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const reportElements = document.querySelectorAll<HTMLElement>('.printable-content');
            
            for (const element of Array.from(reportElements)) {
                const authorName = element.dataset.authorName || 'unknown-author';
                const filename = `Report-${authorName.replace(/\s/g, '_')}.pdf`;
                const pdfBlob = await generatePdfBlob(element);
                zip.file(filename, pdfBlob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'RoyaltyReports.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
             // Restore original state
            allDetails.forEach(d => d.open = false);

        } catch (error) {
            console.error("Failed to generate ZIP file", error);
        } finally {
            setIsZipping(false);
        }
    };


    return (
        <div className="mt-10">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-bold text-slate-700">Royalty Reports</h2>
                 <button 
                    onClick={handleDownloadAll}
                    disabled={isZipping}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                    {isZipping ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Zipping...
                        </>
                    ) : (
                        <>
                            <DownloadIcon />
                            Download All as ZIP
                        </>
                    )}
                </button>
            </div>
            <div className="space-y-6">
                {data.map(authorReport => (
                    <AuthorDetail key={authorReport.authorInfo.idautor} report={authorReport} />
                ))}
            </div>
        </div>
    );
};