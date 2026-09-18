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

export const TITULOS_RPG: TituloRPGConfig[] = [
  { id: 'Técnico Novato', minLevel: 1, icon: '🔧', desc: 'Recién llegado a la mesa de ayuda.' },
  { id: 'Guardián de Hardware', minLevel: 5, icon: '🛡️', desc: 'Reparador de pantallas rotas y teclados sucios.' },
  { id: 'Hechicero de Redes', minLevel: 10, icon: '⚡', desc: 'Domina los routers y el Wi-Fi místico.' },
  { id: 'Señor de los Servidores', minLevel: 15, icon: '🏰', desc: 'Guardián del Data Center y los respaldos.' },
  { id: 'Paladín del Soporte', minLevel: 20, icon: '⚔️', desc: 'Leyenda viviente. Los usuarios no mienten en tu presencia.' },
];

