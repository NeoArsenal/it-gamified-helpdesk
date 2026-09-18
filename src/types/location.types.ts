export interface Ubicacion {
  id: string;
  sede: string;
  departamento: string;
  area: string;
  creadoPorId?: string;
  creadoPor?: {
    id: string;
    nombre: string;
    avatar?: string;
  } | null;
  creadoEn?: string | Date;
}

export interface CreateUbicacionDTO {
  sede: string;
  departamento: string;
  area: string;
}
