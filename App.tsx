
import React, { useState, useCallback } from 'react';
import type { Author, Book, Sale, AuthorReportData, MissingAuthorDetail } from './types';
import { FileUploadSection } from './components/FileUploadSection';
import { RoyaltyReport } from './components/RoyaltyReport';
import { processData } from './services/dataProcessor';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';

const App: React.FC = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    const [validationError, setValidationError] = useState<string | null>(null);
    const [missingISBNs, setMissingISBNs] = useState<string[]>([]);
    const [missingAuthors, setMissingAuthors] = useState<MissingAuthorDetail[]>([]);
    const [reportData, setReportData] = useState<AuthorReportData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFilesParsed = useCallback((type: 'authors' | 'books' | 'sales', data: any[]) => {
        if (type === 'authors') setAuthors(data as Author[]);
        if (type === 'books') setBooks(data as Book[]);
        if (type === 'sales') setSales(data as Sale[]);
    }, []);
    
    const areFilesReady = authors.length > 0 && books.length > 0 && sales.length > 0;

    const handleCalculate = () => {
        setIsLoading(true);
        setValidationError(null);
        setMissingISBNs([]);
        setMissingAuthors([]);
        setReportData([]);

        // Simulate async processing for better UX
        setTimeout(() => {
            try {
                const result = processData(authors, books, sales);
                if (result.error) {
                    setValidationError(result.error);
                    setMissingISBNs(result.missingISBNs || []);
                    setMissingAuthors(result.missingAuthors || []);
                } else {
                    setReportData(result.reportData || []);
                }
            } catch (e) {
                const error = e as Error;
                setValidationError(`An unexpected error occurred: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <Instructions />
                <FileUploadSection onFilesParsed={handleFilesParsed} />

                <div className="mt-8 text-center">
                    <button
                        onClick={handleCalculate}
                        disabled={!areFilesReady || isLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {isLoading ? (
                             <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : 'Calculate Royalties'}
                    </button>
                </div>

                {validationError && (
                    <div className="mt-8 p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Validation Error</h3>
                        <p className="mb-4">{validationError}</p>
                        {missingISBNs.length > 0 && (
                            <div className="mt-2">
                                <p className="font-semibold">Missing ISBNs:</p>
                                <ul className="list-disc list-inside mt-1 font-mono text-sm bg-red-50 p-2 rounded">
                                    {missingISBNs.map(isbn => <li key={isbn}>{isbn}</li>)}
                                </ul>
                            </div>
                        )}
                        {missingAuthors.length > 0 && (
                             <div className="mt-2">
                                <p className="font-semibold">Books with undefined Authors (NIF):</p>
                                <ul className="list-disc list-inside mt-1 font-mono text-sm space-y-1 bg-red-50 p-3 rounded">
                                    {missingAuthors.map(detail => (
                                        <li key={detail.idlibro}>
                                            <span className="font-semibold">{`NIF: ${detail.idautor}`}</span> - Book: "{detail.titulo}" (ISBN: {detail.idlibro})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                
                {reportData.length > 0 && !validationError && (
                     <RoyaltyReport data={reportData} />
                )}

            </main>
        </div>
    );
};

export default App;
