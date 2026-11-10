import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, X, Check, Calendar, Clock, AlertTriangle, 
  Sparkles, History, CalendarDays, Loader2 
} from 'lucide-react';
import { getDeviceIcon } from './inventory.utils';

interface AssetRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  onConfirmarReparado: (data: {
    solucion: string;
    fechaSalida: string;
  }) => Promise<void>;
}

const SUGERENCIAS_POR_TIPO: Record<string, string[]> = {
  PC: [
    'Mantenimiento preventivo, sopleteado y cambio de pasta térmica',
    'Reemplazo de disco mecánico por SSD y migración de datos',
    'Cambio de fuente de poder averiada por nueva unidad certificada',
    'Ampliación / sustitución de memoria RAM defectuosa',
    'Reinstalación limpia de sistema operativo, controladores y software clínico',
    'Sustitución de pila CMOS (CR2032) y reconfiguración de BIOS',
  ],
  LAPTOP: [
    'Mantenimiento interno, limpieza de disipador y cambio de pasta térmica',
    'Reemplazo de batería degradada por repuesto original',
    'Reemplazo de cargador / adaptador de corriente dañado',
    'Cambio de teclado / reparación de panel táctil (touchpad)',
    'Sustitución de pantalla LCD / ajuste y lubricación de bisagras',
    'Actualización a unidad de estado sólido (SSD) y optimización',
  ],
  IMPRESORA: [
    'Limpieza profunda de cabezales y purga de conductos de tinta',
    'Desatasco de papel y limpieza con alcohol isopropílico de rodillos de tracción (pick-up)',
    'Reemplazo de cartucho de tóner / tambor (drum) agotado',
    'Sustitución de filmina de teflón del fusor y engranajes',
    'Reemplazo / reseteo de almohadillas de desecho (waste ink pad)',
    'Configuración de red Wi-Fi / IP estática y reinstalación de cola de impresión',
  ],
  MONITOR: [
    'Reemplazo de fuente externa / adaptador de poder 12V/19V averiado',
    'Sustitución de cable de video (HDMI / DisplayPort / VGA) deteriorado',
    'Reparación de placa fuente interna / condensadores hinchados',
    'Ajuste y calibración de panel, resolución y frecuencia',
    'Reparación de botonera frontal / panel táctil de encendido',
  ],
  SERVIDOR: [
    'Mantenimiento preventivo de ventiladores hot-swap y fuentes redundantes',
    'Reemplazo de disco rígido defectuoso en arreglo RAID y reconstrucción',
    'Actualización de firmware de controladora iDRAC / ILO y BIOS',
    'Limpieza de bahías y verificación de módulos de memoria ECC',
    'Verificación de servicios críticos y copias de seguridad',
  ],
  RED: [
    'Reinicio de fábrica y recarga de configuración de VLANs y puertos',
    'Reemplazo de patch cord de red UTP Cat6 y crimpado de conectores RJ45',
    'Sustitución de puerto PoE averiado / inyector de corriente',
    'Actualización de firmware y verificación de estabilidad de enlace',
    'Cambio de fuente de alimentación de switch/router',
  ],
  POS: [
    'Limpieza de cabezal térmico y sensor de fin de papel',
    'Reemplazo de batería interna recargable',
    'Actualización de aplicación de punto de venta y conexión TLS',
    'Sustitución de cable de comunicación USB / Serial',
  ],
};

const getSugerenciasPorTipo = (tipo: string = ''): string[] => {
  const t = (tipo || '').toUpperCase();
  if (t.includes('LAPTOP') || t.includes('PORTÁTIL') || t.includes('NOTEBOOK')) return SUGERENCIAS_POR_TIPO.LAPTOP;
  if (t.includes('IMPRESORA') || t.includes('TÉRMICA') || t.includes('MULTIFUNCIONAL') || t.includes('EPSON') || t.includes('HP') || t.includes('ZEBRA')) return SUGERENCIAS_POR_TIPO.IMPRESORA;
  if (t.includes('MONITOR') || t.includes('PANTALLA')) return SUGERENCIAS_POR_TIPO.MONITOR;
  if (t.includes('SERVIDOR') || t.includes('SERVER')) return SUGERENCIAS_POR_TIPO.SERVIDOR;
  if (t.includes('SWITCH') || t.includes('ROUTER') || t.includes('RED') || t.includes('ACCESS POINT') || t.includes('AP')) return SUGERENCIAS_POR_TIPO.RED;
  if (t.includes('POS') || t.includes('TABLET') || t.includes('CELULAR')) return SUGERENCIAS_POR_TIPO.POS;
  if (t.includes('PC') || t.includes('DESKTOP') || t.includes('COMPUTADORA')) return SUGERENCIAS_POR_TIPO.PC;

  return [
    'Mantenimiento preventivo, limpieza interna y verificación de componentes',
    'Reemplazo de piezas averiadas y aseguramiento de cableado',
    'Reemplazo de adaptador / cable de alimentación',
    'Actualización de software / firmware y pruebas operativas completadas',
  ];
};

export function AssetRepairModal({
  isOpen,
  onClose,
  activo,
  onConfirmarReparado,
}: AssetRepairModalProps) {
  const [solucion, setSolucion] = useState('');
  const [modoFecha, setModoFecha] = useState<'HOY' | 'AYER' | 'OTRA'>('HOY');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fechas ISO base
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().split('T')[0];

  useEffect(() => {
    if (activo) {
      setSolucion('');
      setModoFecha('HOY');
      setFechaPersonalizada(todayIso);
    }
  }, [activo]);

  if (!isOpen || !activo) return null;

  const getFechaSeleccionada = () => {
    if (modoFecha === 'HOY') return todayIso;
    if (modoFecha === 'AYER') return yesterdayIso;
    return fechaPersonalizada || todayIso;
  };

  const getFechaFormateada = () => {
    try {
      const parts = getFechaSeleccionada().split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return new Intl.DateTimeFormat('es-PE', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(d);
    } catch {
      return getFechaSeleccionada();
    }
  };

  const sugerencias = useMemo(() => getSugerenciasPorTipo(activo?.tipo), [activo?.tipo]);

  const handleAplicarPlantilla = (texto: string) => {
    if (!solucion.trim()) {
      setSolucion(texto);
    } else if (!solucion.includes(texto)) {
      setSolucion(`${solucion.trim()}. ${texto}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solucion.trim()) return;

    setIsSubmitting(true);
    try {
      const fechaElegida = getFechaSeleccionada();
      // Formato ISO timestamp a mediodía para evitar desfaces de zona horaria
      const fechaIsoFinal = `${fechaElegida}T12:00:00Z`;
      
      await onConfirmarReparado({
        solucion: solucion.trim(),
        fechaSalida: fechaIsoFinal,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                Salida de Taller y Reparación
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Equipo: <strong className="text-slate-800 font-mono">{activo.codigo}</strong> ({activo.tipo} {activo.marca} {activo.modelo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Falla técnica reportada originalmente */}
          {activo.observaciones && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                  Falla reportada al ingresar a taller:
                </span>
                <p className="mt-0.5 font-medium leading-relaxed">
                  {activo.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* Bloque 1: Solución Técnica / Trabajo Realizado */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>¿Qué trabajo técnico o solución se realizó?</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Requerido</span>
            </div>

            <textarea
              required
              rows={3}
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              placeholder="Ej: Se reemplazó el disco mecánico averiado por un SSD de 480GB, instalación limpia del sistema y mantenimiento preventivo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
            />

            {/* Sugerencias rápidas específicas según tipo de equipo */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Sugerencias para {activo.tipo || 'este equipo'} (toca para insertar):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sugerencias.map((plantilla, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAplicarPlantilla(plantilla)}
                    className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer text-left active:scale-95 leading-snug"
                    title="Insertar en la solución técnica"
                  >
                    + {plantilla}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bloque 2: Fecha de Conclusión / Salida de Reparación */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fecha de Salida / Conclusión del Arreglo</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {modoFecha === 'HOY' && 'Hoy'}
                {modoFecha === 'AYER' && 'Ayer'}
                {modoFecha === 'OTRA' && 'Fecha histórica'}
              </span>
            </div>

            {/* Segmentado de 3 botones: Hoy, Ayer, Otra Fecha */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setModoFecha('HOY')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  modoFecha === 'HOY'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hoy</span>
              </button>

              <button
                type="button"
                onClick={() => setModoFecha('AYER')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  modoFecha === 'AYER'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Ayer</span>
              </button>

              <button
                type="button"
                onClick={() => setModoFecha('OTRA')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  modoFecha === 'OTRA'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                <span>Otra fecha</span>
              </button>
            </div>

            {/* Selector de fecha personalizada si elige "Otra fecha" */}
            {modoFecha === 'OTRA' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="date"
                  max={todayIso}
                  value={fechaPersonalizada}
                  onChange={(e) => setFechaPersonalizada(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                />
              </div>
            )}

            {/* Aviso informativo de la fecha asignada */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 border border-slate-200/60 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium text-slate-700 capitalize">
                Se registrará con fecha:{' '}
                <strong className="font-bold text-slate-900">
                  {getFechaFormateada()}
                </strong>
              </span>
            </div>
          </div>

          {/* Banner Informativo */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-950">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <p className="font-bold text-emerald-950">Reactivación Inmediata</p>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                El estado del equipo pasará automáticamente a <strong>OPERATIVO</strong> y este informe técnico se grabará de forma permanente en su historial de trazabilidad.
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !solucion.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Devolver a Operativo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

