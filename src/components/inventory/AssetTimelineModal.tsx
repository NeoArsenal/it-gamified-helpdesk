import React from 'react';
import { Package, X, QrCode, Clock, MapPin, User, Calendar, CheckCircle2, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';
import { getEstadoBadge, getDeviceIcon } from './inventory.utils';

interface AssetTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  onVerQr: (activo: any) => void;
}

export function AssetTimelineModal({
  isOpen,
  onClose,
  activo,
  onVerQr,
}: AssetTimelineModalProps) {
  if (!isOpen || !activo) return null;

  // Ordenar intervenciones de más reciente a más antigua
  const timelineItems = [...(activo.intervenciones || [])].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              {getDeviceIcon(activo.tipo)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight font-mono">
                  {activo.codigo}
                </h3>
                {getEstadoBadge(activo.estado)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activo.tipo} · {activo.marca} {activo.modelo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onVerQr(activo)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              title="Ver Código QR"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ficha Resumen */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Serie (S/N)</span>
            <span className="font-mono font-bold text-slate-800 truncate block mt-0.5" title={activo.numeroSerie || 'Sin S/N'}>
              {activo.numeroSerie || '-'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Factura / Guía</span>
            <span className="font-mono font-bold text-indigo-700 truncate block mt-0.5" title={activo.codigoFactura || 'Sin Factura'}>
              {activo.codigoFactura || '-'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ubicación</span>
            <span className="font-bold text-slate-800 truncate block mt-0.5" title={activo.sede || 'En Almacén TI'}>
              {activo.sede ? `${activo.sede} - ${activo.departamento || ''}` : 'En Almacén TI'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsable</span>
            <span className="font-bold text-slate-800 truncate block mt-0.5" title={activo.responsable || 'Sin asignar'}>
              {activo.responsable || 'Sin asignar'}
            </span>
          </div>
        </div>

        {/* Línea de Tiempo Estilo AliExpress / Logistics Tracking */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Trazabilidad de Movimientos y Eventos
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              {timelineItems.length} hitos registrados
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineItems.map((item: any, index: number) => {
              const isFirst = index === 0;
              const dateObj = new Date(item.fecha);
              const formattedDate = dateObj.toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={item.id || index} className="relative group">
                  {/* Nodo / Punto de la línea de tiempo */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isFirst
                        ? 'bg-blue-600 border-white text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100 scale-110'
                        : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isFirst ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Contenido del Hito */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-blue-50/70 border-blue-200/80 shadow-2xs'
                      : 'bg-slate-50/80 border-slate-200/70'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <span className={`text-[11px] font-mono font-bold ${
                        isFirst ? 'text-blue-700' : 'text-slate-500'
                      }`}>
                        {formattedDate} · {formattedTime}
                      </span>
                      {isFirst && (
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Último Estado
                        </span>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm font-semibold leading-relaxed whitespace-pre-wrap ${
                      isFirst ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Registro auditable con fecha y firma de técnico
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
