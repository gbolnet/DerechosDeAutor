
import React from 'react';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Instructions: React.FC = () => {
    return (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
                <InfoIcon />
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">How to Use</h2>
                    <p className="text-gray-600">
                        Upload the three required CSV files: one for authors, one for books, and one for sales data. Once all files are selected and their names appear, click the "Calculate Royalties" button to process the data and generate the reports.
                    </p>
                </div>
            </div>
        </div>
    );
};
