import React, { useState, useRef } from 'react';

interface FileUploadProps {
    label: string;
    onFileParsed: (data: any[]) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileParsed }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Robust CSV parser that handles commas within quoted fields
    const parseCSV = (text: string): any[] => {
        const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        if (lines.length < 2) {
            return [];
        }

        const parseLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // This is an escaped quote ""
                        current += '"';
                        i++; // Skip the second quote of the pair
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current);
            return result;
        };

        const headerLine = lines.shift() as string;
        const header = parseLine(headerLine).map(h => h.trim().replace(/"/g, ''));

        const rows = [];
        for (const line of lines) {
            if (!line.trim()) {
                continue;
            }

            const values = parseLine(line);

            if (values.length === header.length) {
                const obj: { [key: string]: string } = {};
                for (let j = 0; j < header.length; j++) {
                     // The main fix is correctly splitting the line; we can keep the value cleaning logic.
                    obj[header[j]] = values[j].trim().replace(/"/g, '');
                }
                rows.push(obj);
            } else {
                console.warn(`Skipping line in ${label} due to column mismatch. Expected ${header.length}, got ${values.length}. Line: ${line}`);
            }
        }
        return rows;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const parsedData = parseCSV(text);
                onFileParsed(parsedData);
            };
            reader.readAsText(file);
        }
    };
    
    const handleClick = () => {
        fileInputRef.current?.click();
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />
            {!fileName ? (
                <button onClick={handleClick} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors w-full">
                    <UploadIcon />
                    <span className="mt-2 text-sm font-medium text-gray-600">Click to upload {label}</span>
                    <span className="mt-1 text-xs text-gray-500">CSV file required</span>
                </button>
            ) : (
                <div className="flex items-center text-green-600 font-medium">
                    <CheckCircleIcon />
                    <span className="ml-2">{fileName}</span>
                </div>
            )}
        </div>
    );
};