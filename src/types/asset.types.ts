export type EstadoActivo = 'OPERATIVO' | 'MANTENIMIENTO' | 'DE_BAJA' | 'EN_PRESTAMO';

export interface IntervencionActivo {
  id?: string;
  fecha: string | Date;
  tipo: string;
  descripcion: string;
  tecnico?: string;
  costo?: number;
}

export interface Activo {
  id: string;
  codigoInventario: string;
  nombre: string;
  categoria: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  sede: string;
  departamento: string;
  ubicacionDetallada?: string;
  estado: EstadoActivo;
  ipAsignada?: string;
  macAddress?: string;
  especificaciones?: Record<string, any>;
  intervenciones?: IntervencionActivo[];
  creadoEn?: string | Date;
  actualizadoEn?: string | Date;
}

export interface CreateActivoDTO {
  codigoInventario: string;
  nombre: string;
  categoria: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  sede: string;
  departamento: string;
  ubicacionDetallada?: string;
  estado?: EstadoActivo;
  ipAsignada?: string;
  macAddress?: string;
  especificaciones?: Record<string, any>;
}
