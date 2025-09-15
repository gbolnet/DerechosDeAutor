import React, { useState, useRef } from 'react';
import type { AuthorReportData } from '../types';

// Tell TypeScript that these libraries are loaded globally from the HTML
declare var jspdf: any;
declare var html2canvas: any;

interface AuthorDetailProps {
    report: AuthorReportData;
}

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

export const AuthorDetail: React.FC<AuthorDetailProps> = ({ report }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);
    const { authorInfo, bookCalculations, totalGananciaBruta, porcentajeRetencion, montoRetencion, gananciaNeta } = report;

    const handleDownloadPdf = async () => {
        const element = printableRef.current;
        if (!element) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, { 
                scale: 2, // Higher scale for better quality
                useCORS: true, 
                logging: false 
            });

            const imgData = canvas.toDataURL('image/png');
            // 'p' for portrait, 'mm' for millimeters, 'a4' for size
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const canvasPdfHeight = pdfWidth / ratio;
            
            let heightLeft = canvasPdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasPdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - canvasPdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasPdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`Report-${authorInfo.nombre.replace(/\s/g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };
    
    return (
        // Using <details> and <summary> for better accessibility and state management
        <details className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden author-details-container" onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
            <summary
                className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer list-none"
            >
                <div>
                    <h3 className="text-xl font-semibold text-blue-700">{authorInfo.nombre}</h3>
                    <p className="text-sm text-gray-500">NIF: {authorInfo.idautor}</p>
                </div>
                 <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </div>
            </summary>

            <div className="content-wrapper">
                <div ref={printableRef} className="printable-content p-6" data-author-name={authorInfo.nombre}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                             <h2 className="text-2xl font-bold text-slate-800 mb-2">Royalty Statement</h2>
                             <h3 className="text-lg font-semibold text-slate-600">{authorInfo.nombre}</h3>
                             <p className="text-sm text-slate-500">{authorInfo.domicilio}, {authorInfo.poblacion}, {authorInfo.provincia}</p>
                             <p className="text-sm text-slate-500">NIF: {authorInfo.idautor}</p>
                        </div>
                         <div className="text-right">
                           <p className="font-semibold">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Book Royalties</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Author Share</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookCalculations.map(book => (
                                    <tr key={book.isbn}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.titulo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{book.unidadesVendidas}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{book.regaliasTotalesLibro.toFixed(2)} €</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{(book.porcentajeDerechos * 100).toFixed(2)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">{book.gananciaBrutaAutor.toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-semibold text-gray-600">Total Gross Earnings:</span>
                                <span className="font-bold text-gray-800">{totalGananciaBruta.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-semibold text-gray-600">Retention ({porcentajeRetencion}%):</span>
                                <span className="font-bold text-red-500">-{montoRetencion.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between py-3 bg-gray-100 rounded-b-lg px-2 mt-2">
                                <span className="text-lg font-bold text-gray-800">Net Earnings:</span>
                                <span className="text-lg font-bold text-green-600">{gananciaNeta.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 text-right">
                    <button 
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {isDownloading ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                             <>
                                <PdfIcon />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </details>
    );
};