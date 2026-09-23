export type EstadoTicket = 'ABIERTO' | 'EN_PROGRESO' | 'RESUELTO' | 'CERRADO';
export type PrioridadTicket = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface TicketTecnicoAsignado {
  id?: string;
  nombre: string;
  avatar?: string;
  rol?: string;
}

export interface Ticket {
  id: string;
  ticketCode?: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  asignadoAId?: string | null;
  asignadoA?: TicketTecnicoAsignado | null;
  tecnicoAsignado?: TicketTecnicoAsignado | null;
  solicitante?: string;
  solicitanteNombre?: string;
  solicitanteContacto?: string;
  sede: string;
  departamento: string;
  ubicacionEspecifica?: string;
  solucion?: string;
  creadoEn: string | Date;
  actualizadoEn?: string | Date;
  resueltoEn?: string | Date | null;
}

export interface CreateTicketDTO {
  titulo: string;
  descripcion?: string;
  prioridad?: PrioridadTicket;
  sede: string;
  departamento: string;
  ubicacionEspecifica?: string;
  solicitanteNombre?: string;
  solicitanteContacto?: string;
  website?: string; // honeypot
}

export interface UpdateTicketDTO {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  asignadoAId?: string | null;
  solucion?: string;
  resueltoEn?: string | Date | null;
}
