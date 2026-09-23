import React from 'react';
import { 
  Wrench, Trash2, Recycle, QrCode, MapPin, Check, CheckCircle2 
} from 'lucide-react';
import { getDeviceIcon } from './inventory.utils';

interface AssetWorkshopBoardProps {
  activos: any[];
  isRescatando: string | null;
  onVerQr: (activo: any) => void;
  onMarcarReparado: (activo: any) => void;
  onDeclararChatarra: (activo: any) => void;
  onEliminar: (id: string, codigo: string) => void;
  onRescatar: (id: string, codigo: string) => void;
}

export function AssetWorkshopBoard({
  activos,
  isRescatando,
  onVerQr,
  onMarcarReparado,
  onDeclararChatarra,
  onEliminar,
  onRescatar,
}: AssetWorkshopBoardProps) {
  const equiposReparacion = activos.filter(a => a.estado === 'REPARACION');
  const equiposBaja = activos.filter(a => a.estado === 'BAJA');
  const equiposRescatados = activos.filter(a => a.estado === 'RESCATADO');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in">
      
      {/* Caja 1: En Reparación */}
      <div className="bg-amber-50/40 rounded-2xl border border-amber-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
        <div className="p-4 border-b border-amber-200/60 bg-amber-100/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">En Reparación</h3>
              <p className="text-[10px] text-slate-400">Equipos en diagnóstico y mantenimiento</p>
            </div>
          </div>
          <span className="bg-amber-200/70 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full">
            {equiposReparacion.length}
          </span>
        </div>

        <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
          {equiposReparacion.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    {getDeviceIcon(a.tipo)}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {a.codigo}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onVerQr(a)}
                  className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                  title="Ver QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                {a.observaciones || 'Falla reportada sin detalle.'}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{a.sede || 'Sin sede'} {a.departamento ? `- ${a.departamento}` : ''}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onMarcarReparado(a)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Marcar Reparado
                </button>
                <button
                  type="button"
                  onClick={() => onDeclararChatarra(a)}
                  className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Declarar Chatarra / Baja"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {equiposReparacion.length === 0 && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-amber-200/80 rounded-xl bg-white/50">
              <CheckCircle2 className="w-8 h-8 text-amber-500/80 mb-2" />
              <p className="font-bold text-slate-700 text-sm">¡Taller al día!</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                No hay equipos averiados esperando reparación.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Caja 2: Chatarra / Baja */}
      <div className="bg-rose-50/40 rounded-2xl border border-rose-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
        <div className="p-4 border-b border-rose-200/60 bg-rose-100/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Chatarra / Bajas</h3>
              <p className="text-[10px] text-slate-400">Equipos dados de baja para rescate</p>
            </div>
          </div>
          <span className="bg-rose-200/70 text-rose-800 text-xs font-black px-2.5 py-0.5 rounded-full">
            {equiposBaja.length}
          </span>
        </div>

        <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
          {equiposBaja.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group relative overflow-hidden">
              {isRescatando === a.id && (
                <div className="absolute inset-0 bg-emerald-50/90 z-20 flex flex-col items-center justify-center animate-pulse">
                  <Recycle className="w-8 h-8 text-emerald-600 animate-spin" />
                  <span className="text-emerald-700 text-xs font-black mt-1">+1000 XP RESCATADO</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                    {getDeviceIcon(a.tipo)}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {a.codigo}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEliminar(a.id, a.codigo)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                {a.observaciones || 'Equipo irreparable o de baja patrimonial.'}
              </p>

              <button
                type="button"
                onClick={() => onRescatar(a.id, a.codigo)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all group cursor-pointer"
              >
                <Recycle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-emerald-600" />
                Rescatar Piezas
              </button>
            </div>
          ))}

          {equiposBaja.length === 0 && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-rose-200/80 rounded-xl bg-white/50">
              <Trash2 className="w-8 h-8 text-rose-400/80 mb-2" />
              <p className="font-bold text-slate-700 text-sm">Sin equipos en baja</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                Los equipos declarados chatarra aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Caja 3: Piezas Rescatadas */}
      <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
        <div className="p-4 border-b border-emerald-200/60 bg-emerald-100/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Piezas Rescatadas</h3>
              <p className="text-[10px] text-slate-400">Repuestos útiles reciclados</p>
            </div>
          </div>
          <span className="bg-emerald-200/70 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
            {equiposRescatados.length}
          </span>
        </div>

        <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
          {equiposRescatados.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {a.codigo}
                    </span>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{a.tipo} · Componentes Salvados</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  +1000 XP
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                {a.observaciones || 'Piezas en inventario para repuesto.'}
              </p>

              <button
                type="button"
                onClick={() => onMarcarReparado(a)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reintegrar a Operativos
              </button>
            </div>
          ))}

          {equiposRescatados.length === 0 && (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-emerald-200/80 rounded-xl bg-white/50">
              <Recycle className="w-8 h-8 text-emerald-500/80 mb-2" />
              <p className="font-bold text-slate-700 text-sm">Sin piezas rescatadas</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                Canibaliza hardware útil de la chatarra para sumar puntos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
