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
    label: 'Hardware y Equipos',
    shortLabel: 'Hardware',
    desc: 'PCs, laptops, impresoras, tóner, pantallas y partes físicas',
    icon: '🖥️',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    pillActiveClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50',
  },
  SOFTWARE: {
    id: 'SOFTWARE',
    label: 'Software y Aplicaciones',
    shortLabel: 'Software',
    desc: 'Sistema médico HIS, Windows, Office, antivirus y programas',
    icon: '💻',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    pillActiveClass: 'bg-purple-600 text-white border-purple-600 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50',
  },
  REDES: {
    id: 'REDES',
    label: 'Red y Conectividad',
    shortLabel: 'Redes',
    desc: 'Caída de enlace, Wi-Fi, switches, puntos de red y VPN',
    icon: '🌐',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pillActiveClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50',
  },
  ACCESOS: {
    id: 'ACCESOS',
    label: 'Accesos y Cuentas',
    shortLabel: 'Accesos',
    desc: 'Desbloqueo de contraseñas, permisos y cuentas de usuario',
    icon: '🔐',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    pillActiveClass: 'bg-amber-600 text-white border-amber-600 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50',
  },
  GENERAL: {
    id: 'GENERAL',
    label: 'General / Otro',
    shortLabel: 'General',
    desc: 'Atención general, dudas técnicas o caso sin clasificar',
    icon: '📦',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    pillActiveClass: 'bg-slate-800 text-white border-slate-800 shadow-xs',
    pillIdleClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
  },
};

export function getCategoriaConfig(categoria?: string | null): CategoriaConfig {
  const normalized = (categoria || 'GENERAL').toUpperCase() as CategoriaTicket;
  return TICKET_CATEGORIAS[normalized] || TICKET_CATEGORIAS.GENERAL;
}
