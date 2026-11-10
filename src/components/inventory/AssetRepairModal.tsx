import React, { useState, useEffect } from 'react';
import { 
  Wrench, X, Check, Calendar, Clock, AlertTriangle, 
  Sparkles, History, CalendarDays, Loader2 
} from 'lucide-react';

interface AssetRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  onConfirmarReparado: (data: {
    solucion: string;
    fechaSalida: string;
  }) => Promise<void>;
}

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

  const plantillasSolucion = [
    'Mantenimiento preventivo, limpieza y cambio de pasta térmica',
    'Reemplazo de disco mecánico por unidad de estado sólido (SSD)',
    'Reemplazo de fuente de poder averiada',
    'Reinstalación limpia del sistema operativo y configuración',
    'Reparación de conector / cable de alimentación',
    'Limpieza de cabezales y calibración de rodillos',
  ];

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

            {/* Sugerencias rápidas con 1 clic */}
            <div className="mt-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sugerencias rápidas (toca para insertar):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {plantillasSolucion.map((plantilla, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAplicarPlantilla(plantilla)}
                    className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-pointer text-left"
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
