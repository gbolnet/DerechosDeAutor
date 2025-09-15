
import type { Author, Book, Sale, AggregatedSale, AuthorReportData, AuthorBookCalculation, MissingAuthorDetail } from '../types';

const parseNumber = (str: string | number): number => {
    if (typeof str === 'number') return str;
    const cleanedStr = str.replace(/"/g, '').replace(',', '.');
    const num = parseFloat(cleanedStr);
    return isNaN(num) ? 0 : num;
};

const processAuthors = (rawAuthors: any[]): Author[] => {
    return rawAuthors.map(author => ({
        ...author,
        retencion: parseInt(author.retencion, 10) || 0,
    }));
};

const processBooks = (rawBooks: any[]): Book[] => {
    return rawBooks.map(book => ({
        ...book,
        derechos: parseNumber(book.derechos),
    }));
};

const processSales = (rawSales: any[]): Sale[] => {
    return rawSales.map(sale => ({
        idlibro: sale.idlibro,
        unidades: parseInt(sale.Uniddes, 10) || 0,
        regalias: parseNumber(sale.Regalias),
    }));
};

export const processData = (rawAuthors: any[], rawBooks: any[], rawSales: any[]) => {
    const authors: Author[] = processAuthors(rawAuthors);
    const books: Book[] = processBooks(rawBooks);
    const sales: Sale[] = processSales(rawSales);

    // New Validation: Check if author IDs in books file exist in authors file
    const authorIDs = new Set(authors.map(a => a.idautor));
    const missingAuthorDetails: MissingAuthorDetail[] = [];
    books.forEach(book => {
        if (!authorIDs.has(book.idautor)) {
            missingAuthorDetails.push({ 
                idautor: book.idautor, 
                idlibro: book.idlibro, 
                titulo: book.titulo 
            });
        }
    });

    if (missingAuthorDetails.length > 0) {
        return { 
            error: 'The following books have an author ID (NIF) that is not found in the authors file. Please add the author details and try again:', 
            missingAuthors: missingAuthorDetails 
        };
    }

    // Validation: Check for missing ISBNs in sales file
    const bookISBNs = new Set(books.map(b => b.idlibro));
    const missingISBNs: string[] = [];
    sales.forEach(sale => {
        if (!bookISBNs.has(sale.idlibro)) {
            missingISBNs.push(sale.idlibro);
        }
    });

    const uniqueMissingISBNs = [...new Set(missingISBNs)];
    if (uniqueMissingISBNs.length > 0) {
        return { 
            error: 'The following ISBNs from the sales file are missing in the books file. Please correct the data and try again:', 
            missingISBNs: uniqueMissingISBNs 
        };
    }

    // Aggregate Sales
    const aggregatedSales = new Map<string, AggregatedSale>();
    sales.forEach(sale => {
        const existing = aggregatedSales.get(sale.idlibro) || { unidades: 0, regalias: 0 };
        existing.unidades += sale.unidades;
        existing.regalias += sale.regalias;
        aggregatedSales.set(sale.idlibro, existing);
    });

    // Calculate Royalties
    const booksByAuthor = new Map<string, Book[]>();
    books.forEach(book => {
        const authorBooks = booksByAuthor.get(book.idautor) || [];
        authorBooks.push(book);
        booksByAuthor.set(book.idautor, authorBooks);
    });

    const reportData: AuthorReportData[] = authors.map(author => {
        const authorBooks = booksByAuthor.get(author.idautor) || [];
        
        const bookCalculations: AuthorBookCalculation[] = authorBooks
            .map(book => {
                const saleData = aggregatedSales.get(book.idlibro) || { unidades: 0, regalias: 0 };
                const gananciaBrutaAutor = saleData.regalias * book.derechos;

                return {
                    isbn: book.idlibro,
                    titulo: book.titulo,
                    unidadesVendidas: saleData.unidades,
                    regaliasTotalesLibro: saleData.regalias,
                    porcentajeDerechos: book.derechos,
                    gananciaBrutaAutor: gananciaBrutaAutor,
                };
            })
            .filter(calc => calc.unidadesVendidas > 0);
        
        const totalGananciaBruta = bookCalculations.reduce((sum, calc) => sum + calc.gananciaBrutaAutor, 0);
        const montoRetencion = totalGananciaBruta * (author.retencion / 100);
        const gananciaNeta = totalGananciaBruta - montoRetencion;

        return {
            authorInfo: author,
            bookCalculations,
            totalGananciaBruta,
            porcentajeRetencion: author.retencion,
            montoRetencion,
            gananciaNeta,
        };
    }).filter(report => report.totalGananciaBruta > 0) // Only include authors with earnings
      .sort((a, b) => a.authorInfo.nombre.localeCompare(b.authorInfo.nombre));


    return { reportData };
};
