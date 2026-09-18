import React from 'react';
import { Clock, Filter, ChevronDown, Building2, MapPin, User, Check } from 'lucide-react';

interface TicketHistoryTableProps {
  historyTickets: any[];
  filterHistorySede: string;
  setFilterHistorySede: (sede: string) => void;
  isSedeFilterOpen: boolean;
  setIsSedeFilterOpen: (val: boolean) => void;
  sedesDisponibles: string[];
  countPorSede: (sede: string) => number;
  handleAbrirDetalle: (ticket: any) => void;
}

export const TicketHistoryTable: React.FC<TicketHistoryTableProps> = ({
  historyTickets,
  filterHistorySede,
  setFilterHistorySede,
  isSedeFilterOpen,
  setIsSedeFilterOpen,
  sedesDisponibles,
  countPorSede,
  handleAbrirDetalle,
}) => {
  return (
    <div className="hidden md:flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 max-h-[340px]">
      <div className="p-3.5 px-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-indigo-600" /> Historial de Tickets Cerrados
          </h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
            {historyTickets.length} {historyTickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de Filtro por Sede Dinámico */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSedeFilterOpen(!isSedeFilterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                filterHistorySede !== 'TODAS'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/20 shadow-indigo-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
              title="Filtrar historial por sede"
            >
              <Filter className={`w-3.5 h-3.5 ${filterHistorySede !== 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500 font-normal">Sede:</span>
                <span className={filterHistorySede !== 'TODAS' ? 'text-indigo-700 font-black' : 'text-slate-900 font-bold'}>
                  {filterHistorySede === 'TODAS' ? 'Todas las sedes' : filterHistorySede}
                </span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isSedeFilterOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {/* Menú desplegable flotante de Sedes */}
            {isSedeFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSedeFilterOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Clasificar por Sede
                    </span>
                    {filterHistorySede !== 'TODAS' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterHistorySede('TODAS');
                          setIsSedeFilterOpen(false);
                        }}
                        className="text-indigo-600 hover:underline font-bold text-[10px] normal-case cursor-pointer"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>

                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterHistorySede('TODAS');
                        setIsSedeFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                        filterHistorySede === 'TODAS' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${filterHistorySede === 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>Todas las Sedes</span>
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        filterHistorySede === 'TODAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
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
                          onClick={() => {
                            setFilterHistorySede(sede);
                            setIsSedeFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{sede}</span>
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium hidden lg:inline">
            Haz clic en cualquier fila para ver la solución
          </span>
        </div>
      </div>

      <div className="overflow-auto p-0 w-full">
        {historyTickets.length > 0 ? (
          <div className="min-w-[700px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2.5 font-bold text-xs">Ticket</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Sede</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Asignado</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Registrado</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Resuelto</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Diagnóstico / Solución</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Recompensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleAbrirDetalle(ticket)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {ticket.titulo}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-medium text-slate-500">
                          TIC-{ticket.id.substring(0, 5).toUpperCase()}
                        </span>
                        {ticket.departamento && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500">{ticket.departamento}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {ticket.sede ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{ticket.sede}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">General</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold overflow-hidden shrink-0">
                        {ticket.asignadoA?.avatar ? (
                          ticket.asignadoA.avatar.length > 2 ? (
                            <img
                              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${ticket.asignadoA.avatar}&backgroundColor=e2e8f0`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            ticket.asignadoA.avatar
                          )
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <span className="truncate max-w-[120px] font-medium">
                        {ticket.asignadoA?.nombre || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      <div>{ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleDateString() : '-'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ticket.creadoEn
                          ? new Date(ticket.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {ticket.resueltoEn ? (
                        <>
                          <div>{new Date(ticket.resueltoEn).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(ticket.resueltoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {ticket.solucion ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 max-w-[220px] truncate"
                          title={ticket.solucion}
                        >
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{ticket.solucion}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin solución registrada</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        +{ticket.xpRecompensa} XP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm space-y-2">
            <p>
              {filterHistorySede !== 'TODAS'
                ? `No se encontraron tickets cerrados en la sede "${filterHistorySede}".`
                : 'No hay tickets cerrados en el historial.'}
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
  );
};
