
export interface Author {
  idautor: string; // NIF
  nombre: string;
  domicilio: string;
  poblacion: string;
  provincia: string;
  cpostal: string;
  telefono: string;
  email:string;
  iban: string;
  retencion: number;
}

export interface Book {
  idlibro: string; // ISBN
  titulo: string;
  idautor: string; // NIF
  derechos: number; // Royalty percentage
}

export interface Sale {
  idlibro: string; // ISBN
  unidades: number;
  regalias: number;
}

export interface AggregatedSale {
  unidades: number;
  regalias: number;
}

export interface MissingAuthorDetail {
    idautor: string;
    idlibro: string;
    titulo: string;
}

export interface AuthorBookCalculation {
    isbn: string;
    titulo: string;
    unidadesVendidas: number;
    regaliasTotalesLibro: number;
    porcentajeDerechos: number;
    gananciaBrutaAutor: number;
}

export interface AuthorReportData {
    authorInfo: Author;
    bookCalculations: AuthorBookCalculation[];
    totalGananciaBruta: number;
    porcentajeRetencion: number;
    montoRetencion: number;
    gananciaNeta: number;
}
