export interface PuntosPorArea {
  ticketBaja: number;
  ticketMedia: number;
  ticketAlta: number;
  ticketCritica: number;
  activoReparado: number;
  activoRescatado: number;
  redRestaurada: number;
  guiaCreada: number;
  academiaNivel: number;
}

export interface ReglasGamificacion {
  puntosPorArea: PuntosPorArea;
  niveles: number[];
}

export interface TituloRPGConfig {
  id: string;
  minLevel: number;
  icon: string;
  desc: string;
}
