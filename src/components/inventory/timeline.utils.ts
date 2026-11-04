/**
 * Utilidades para interpretar los hitos de trazabilidad de activos.
 * El backend registra cada movimiento con un prefijo de categoría, p.ej.:
 *   "[TRASLADO] Equipo reasignado / trasladado.\nUbicación: A → B\nResponsable: X → Y"
 */

export type TimelineTag =
  | 'ALTA'
  | 'ASIGNACION'
  | 'TRASLADO'
  | 'ESTADO'
  | 'TALLER'
  | 'REPARADO'
  | 'BAJA'
  | 'RESCATE'
  | 'EDICION'
  | 'CARGO'
  | 'NOTA';

export interface ParsedTimelineItem {
  tag: TimelineTag;
  titulo: string;
  detalles: { campo: string; antes?: string; despues: string }[];
  url: string | null;
}

export const TIMELINE_TAG_META: Record<
  TimelineTag,
  { label: string; badge: string; card: string; dot: string }
> = {
  ALTA: { label: 'Alta', badge: 'bg-sky-600 text-white', card: 'bg-sky-50/70 border-sky-200', dot: 'bg-sky-600' },
  ASIGNACION: { label: 'Asignación', badge: 'bg-blue-600 text-white', card: 'bg-blue-50/70 border-blue-200', dot: 'bg-blue-600' },
  TRASLADO: { label: 'Traslado', badge: 'bg-violet-600 text-white', card: 'bg-violet-50/70 border-violet-200', dot: 'bg-violet-600' },
  ESTADO: { label: 'Estado', badge: 'bg-slate-700 text-white', card: 'bg-slate-50 border-slate-200', dot: 'bg-slate-600' },
  TALLER: { label: 'Taller', badge: 'bg-amber-500 text-white', card: 'bg-amber-50/70 border-amber-200', dot: 'bg-amber-500' },
  REPARADO: { label: 'Reparado', badge: 'bg-emerald-600 text-white', card: 'bg-emerald-50/70 border-emerald-200', dot: 'bg-emerald-600' },
  BAJA: { label: 'Baja', badge: 'bg-rose-600 text-white', card: 'bg-rose-50/70 border-rose-200', dot: 'bg-rose-600' },
  RESCATE: { label: 'Rescate', badge: 'bg-teal-600 text-white', card: 'bg-teal-50/70 border-teal-200', dot: 'bg-teal-600' },
  EDICION: { label: 'Edición', badge: 'bg-slate-500 text-white', card: 'bg-slate-50 border-slate-200', dot: 'bg-slate-500' },
  CARGO: { label: 'Acta Oficial', badge: 'bg-indigo-600 text-white', card: 'bg-indigo-50/70 border-indigo-200', dot: 'bg-indigo-600' },
  NOTA: { label: 'Nota', badge: 'bg-slate-400 text-white', card: 'bg-slate-50/80 border-slate-200', dot: 'bg-slate-400' },
};

const KNOWN_TAGS = Object.keys(TIMELINE_TAG_META) as TimelineTag[];

export function parseTimelineItem(descripcion: string = ''): ParsedTimelineItem {
  const raw = descripcion.trim();
  const tagMatch = raw.match(/^\[([A-ZÁÉÍÓÚ_]+)\]\s*/);
  let tag: TimelineTag = 'NOTA';
  let body = raw;

  if (tagMatch) {
    const t = tagMatch[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '') as TimelineTag;
    if (KNOWN_TAGS.includes(t)) {
      tag = t;
      body = raw.slice(tagMatch[0].length);
    }
  }

  const urlMatch = body.match(/https?:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0] : null;
  if (tag === 'CARGO') body = body.replace(/Archivo:\s*https?:\/\/[^\s]+/, '').trim();

  const [primera, ...resto] = body.split('\n');
  const detalles = resto
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((linea) => {
      const idx = linea.indexOf(':');
      if (idx === -1) return { campo: '', despues: linea };
      const campo = linea.slice(0, idx).trim();
      const valor = linea.slice(idx + 1).trim();
      const partes = valor.split('→');
      return partes.length === 2
        ? { campo, antes: partes[0].trim(), despues: partes[1].trim() }
        : { campo, despues: valor };
    });

  return { tag, titulo: (primera || '').trim(), detalles, url };
}

