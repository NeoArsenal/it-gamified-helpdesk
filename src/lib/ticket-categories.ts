export type CategoriaTicket = 'HARDWARE' | 'SOFTWARE' | 'REDES' | 'ACCESOS' | 'GENERAL';

export interface CategoriaConfig {
  id: CategoriaTicket;
  label: string;
  shortLabel: string;
  desc: string;
  icon: string;
  badgeClass: string;
  pillActiveClass: string;
  pillIdleClass: string;
}

export const TICKET_CATEGORIAS: Record<CategoriaTicket, CategoriaConfig> = {
  HARDWARE: {
    id: 'HARDWARE',
    label: 'Hardware',
    shortLabel: 'Hardware',
    desc: 'Equipos físicos, periféricos e impresoras',
    icon: '🖥️',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    pillActiveClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
  SOFTWARE: {
    id: 'SOFTWARE',
    label: 'Software',
    shortLabel: 'Software',
    desc: 'Sistemas clínicos, programas y aplicaciones',
    icon: '💻',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    pillActiveClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
  REDES: {
    id: 'REDES',
    label: 'Redes',
    shortLabel: 'Redes',
    desc: 'Conectividad, enlaces y Wi-Fi',
    icon: '🌐',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pillActiveClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
  ACCESOS: {
    id: 'ACCESOS',
    label: 'Accesos',
    shortLabel: 'Accesos',
    desc: 'Cuentas de usuario y contraseñas',
    icon: '🔐',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    pillActiveClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
  GENERAL: {
    id: 'GENERAL',
    label: 'General',
    shortLabel: 'General',
    desc: 'Soporte general',
    icon: '📦',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    pillActiveClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
};

export function getCategoriaConfig(categoria?: string | null): CategoriaConfig {
  const normalized = (categoria || 'GENERAL').toUpperCase() as CategoriaTicket;
  return TICKET_CATEGORIAS[normalized] || TICKET_CATEGORIAS.GENERAL;
}

