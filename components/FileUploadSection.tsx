
import React from 'react';
import { FileUpload } from './FileUpload';

interface FileUploadSectionProps {
    onFilesParsed: (type: 'authors' | 'books' | 'sales', data: any[]) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({ onFilesParsed }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUpload label="Authors CSV" onFileParsed={(data) => onFilesParsed('authors', data)} />
            <FileUpload label="Books CSV" onFileParsed={(data) => onFilesParsed('books', data)} />
            <FileUpload label="Sales CSV" onFileParsed={(data) => onFilesParsed('sales', data)} />
        </div>
    );
};
