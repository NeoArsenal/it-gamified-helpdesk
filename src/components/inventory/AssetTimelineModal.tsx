import React, { useEffect, useState } from 'react';
import { X, QrCode, Clock, FileText, ExternalLink, User, Loader2, ArrowRight } from 'lucide-react';
import { getEstadoBadge, getDeviceIcon } from './inventory.utils';
import { parseTimelineItem, TIMELINE_TAG_META, parseUtcDate } from './timeline.utils';
import { getActivo } from '@/services/api';

interface AssetTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  onVerQr: (activo: any) => void;
}

export function AssetTimelineModal({
  isOpen,
  onClose,
  activo: activoProp,
  onVerQr,
}: AssetTimelineModalProps) {
  // Datos frescos del activo (con nombre del técnico en cada hito)
  const [activo, setActivo] = useState<any | null>(activoProp);
  const [loadingFresh, setLoadingFresh] = useState(false);

  useEffect(() => {
    setActivo(activoProp);
    if (!isOpen || !activoProp?.id) return;

    let cancelled = false;
    setLoadingFresh(true);
    getActivo(activoProp.id)
      .then((fresh) => {
        if (!cancelled && fresh) setActivo(fresh);
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoadingFresh(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activoProp]);

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
                {(activo.fechaIngreso || activo.fechaRegistro) && (
                  <span className="text-slate-400 ml-1.5 font-normal">
                    · Ingreso: {parseUtcDate(activo.fechaIngreso || activo.fechaRegistro).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                )}
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

        {/* Línea de Tiempo de Trazabilidad */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Trazabilidad de Movimientos
              {loadingFresh && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              {timelineItems.length} hitos registrados
            </span>
          </div>

          {timelineItems.length === 0 && !loadingFresh && (
            <p className="text-xs text-slate-400 text-center py-6">
              Este equipo aún no tiene movimientos registrados.
            </p>
          )}

          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineItems.map((item: any, index: number) => {
              const isFirst = index === 0;
              const dateObj = parseUtcDate(item.fecha);
              const formattedDate = dateObj.toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const parsed = parseTimelineItem(item.descripcion);
              const meta = TIMELINE_TAG_META[parsed.tag];
              const tecnico = item.tecnicoNombre || (item.tecnicoId ? 'Técnico TI' : 'Sistema');

              return (
                <div key={item.id || index} className="relative group">
                  {/* Nodo de la línea de tiempo */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${meta.dot} ${
                      isFirst ? 'ring-4 ring-blue-100 scale-110' : ''
                    }`}
                  >
                    {parsed.tag === 'CARGO' ? (
                      <FileText className="w-3 h-3 text-white" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full bg-white ${isFirst ? 'animate-pulse' : ''}`} />
                    )}
                  </div>

                  {/* Contenido del Hito */}
                  <div className={`p-3 sm:p-3.5 rounded-2xl border shadow-2xs ${meta.card}`}>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${meta.badge}`}>
                          {meta.label}
                        </span>
                        {isFirst && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white border border-blue-300 text-blue-700">
                            Último
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {formattedDate} · {formattedTime}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {parsed.titulo}
                    </p>

                    {parsed.detalles.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {parsed.detalles.map((d, i) => (
                          <li key={i} className="text-[11px] sm:text-xs text-slate-700 flex flex-wrap items-center gap-1">
                            {d.campo && <span className="font-bold text-slate-500">{d.campo}:</span>}
                            {d.antes !== undefined ? (
                              <>
                                <span className="line-through text-slate-400">{d.antes}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-900">{d.despues}</span>
                              </>
                            ) : (
                              <span className="font-medium">{d.despues}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center gap-1 text-[10px] text-slate-500">
                      <User className="w-3 h-3" />
                      <span>
                        Registrado por <span className="font-bold text-slate-700">{tecnico}</span>
                      </span>
                    </div>

                    {/* Botón para abrir el PDF del Cargo almacenado en la nube */}
                    {parsed.tag === 'CARGO' && parsed.url && (
                      <div className="mt-2.5">
                        <a
                          href={parsed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all w-fit cursor-pointer active:scale-95"
                          title="Descargar o abrir el cargo firmado en PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Cargo Firmado</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 text-indigo-200" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Registro auditable con fecha y técnico responsable
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
