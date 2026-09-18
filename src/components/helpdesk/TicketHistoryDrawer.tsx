import React, { useRef, useEffect } from 'react';
import { Clock, X, Building2, MapPin, User, Check, FileSpreadsheet } from 'lucide-react';
import { exportTicketsToCsv } from '@/lib/export-utils';
import { toast } from 'sonner';

interface TicketHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyTickets: any[];
  filterHistorySede: string;
  setFilterHistorySede: (sede: string) => void;
  sedesDisponibles: string[];
  countPorSede: (sede: string) => number;
  handleAbrirDetalle: (ticket: any) => void;
  searchQuery: string;
}

export const TicketHistoryDrawer: React.FC<TicketHistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyTickets,
  filterHistorySede,
  setFilterHistorySede,
  sedesDisponibles,
  countPorSede,
  handleAbrirDetalle,
  searchQuery,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Restablecer posición limpia cuando se abre
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      drawerRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'none';
      drawerRef.current.style.willChange = 'transform';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;
    if (diff > 0 && drawerRef.current) {
      // Movimiento nativo acelerado por GPU sin re-renderizar React
      drawerRef.current.style.transform = `translate3d(0, ${diff}px, 0)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = currentYRef.current - startYRef.current;

    if (!drawerRef.current) return;

    if (diff > 90) {
      // Deslizado suficiente: animación nativa de salida
      drawerRef.current.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      drawerRef.current.style.transform = 'translate3d(0, 100%, 0)';
      setTimeout(() => {
        onClose();
        if (drawerRef.current) {
          drawerRef.current.style.willChange = 'auto';
        }
      }, 190);
    } else {
      // Rebotar elásticamente a su posición original
      drawerRef.current.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)';
      drawerRef.current.style.transform = 'translate3d(0, 0, 0)';
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.style.willChange = 'auto';
        }
      }, 250);
    }
  };

  const triggerClose = () => {
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      drawerRef.current.style.transform = 'translate3d(0, 100%, 0)';
    }
    setTimeout(() => {
      onClose();
    }, 190);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/70 flex flex-col justify-end md:hidden animate-in fade-in duration-200 overscroll-contain">
      <div className="fixed inset-0" onClick={triggerClose} />
      <div 
        ref={drawerRef}
        className="relative z-10 bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col border-t border-slate-200 overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {/* Grab Handle interactivo (Touch Swipe Down to Close con Física Nativa) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={triggerClose}
          className="pt-3 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none w-full group"
          title="Desliza hacia abajo o toca para cerrar"
        >
          <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 group-active:bg-indigo-500 rounded-full transition-colors" />
        </div>

        {/* Header del Drawer (también sensible al arrastre hacia abajo) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between touch-none select-none"
        >
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Historial de Tickets Cerrados
            </h3>
            <p className="text-[11px] text-slate-400">Desliza hacia abajo para cerrar o toca un ticket</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  if (historyTickets.length === 0) {
                    toast.error('No hay tickets para exportar');
                    return;
                  }
                  const sedeLabel = filterHistorySede === 'TODAS' ? 'todas' : filterHistorySede.toLowerCase().replace(/\s+/g, '-');
                  exportTicketsToCsv(historyTickets, `historial-tickets_${sedeLabel}`);
                  toast.success(`Se exportaron ${historyTickets.length} tickets a Excel`);
                } catch (err: any) {
                  toast.error(err?.message || 'Error al exportar tickets');
                }
              }}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={triggerClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Sedes en Drawer Móvil */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setFilterHistorySede('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              filterHistorySede === 'TODAS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Todas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterHistorySede === 'TODAS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {countPorSede('TODAS')}
            </span>
          </button>
          {sedesDisponibles.map((sede) => {
            const count = countPorSede(sede);
            const isSelected = filterHistorySede.toLowerCase().trim() === sede.toLowerCase().trim();
            return (
              <button
                key={sede}
                type="button"
                onClick={() => setFilterHistorySede(sede)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{sede}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Tickets Cerrados en Drawer */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1 overscroll-contain custom-scrollbar">
          {historyTickets.length > 0 ? (
            historyTickets.map((ticket) => {
              const shortId = `TIC-${ticket.id.substring(0, 5).toUpperCase()}`;
              return (
                <div
                  key={ticket.id}
                  onClick={() => handleAbrirDetalle(ticket)}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 active:bg-indigo-100/50 border border-slate-200 rounded-xl transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                      {shortId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {ticket.solucion ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Solución
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Sin nota</span>
                      )}
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        +{ticket.xpRecompensa} XP
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs leading-snug">{ticket.titulo}</h4>

                  {ticket.sede && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>
                        {ticket.sede} {ticket.departamento ? `· ${ticket.departamento}` : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ticket.asignadoA?.nombre || 'Técnico'}</span>
                    </div>
                    <div>
                      {ticket.resueltoEn
                        ? new Date(ticket.resueltoEn).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : '-'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <p>
                {filterHistorySede !== 'TODAS'
                  ? `No hay tickets cerrados registrados en la sede "${filterHistorySede}".`
                  : searchQuery
                  ? 'No se encontraron tickets cerrados con ese criterio.'
                  : 'No hay tickets cerrados aún.'}
              </p>
              {filterHistorySede !== 'TODAS' && (
                <button
                  type="button"
                  onClick={() => setFilterHistorySede('TODAS')}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Ver todas las sedes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
