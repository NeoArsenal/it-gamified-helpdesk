import React from 'react';
import { Clock, X, Building2, MapPin, User, Check } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-slate-200">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header del Drawer */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Historial de Tickets Cerrados
            </h3>
            <p className="text-[11px] text-slate-400">Toca un ticket para ver la solución y detalles</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
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
