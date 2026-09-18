import React from 'react';
import { TicketKanbanCard } from './TicketKanbanCard';

interface ColumnConfig {
  id: string;
  title: string;
  subtitle: string;
  bgClass: string;
  borderClass: string;
  accentBar: string;
  badgeBg: string;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDesc: string;
}

interface TicketKanbanBoardProps {
  columnas: ColumnConfig[];
  activeTickets: any[];
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, estado: string) => Promise<void>;
  handleAbrirDetalle: (ticket: any) => void;
  handleMoverTicket: (id: string, nuevoEstado: string, estadoActual: string) => Promise<void>;
  handleCerrarTicket: (id: string, solucion?: string) => Promise<void>;
  handleCambiarPrioridad: (id: string, nuevaPrioridad: string) => Promise<void>;
  handleEliminarTicket: (id: string) => Promise<void>;
  getPriorityStyle: (priority: string) => any;
  hasActiveFilters: boolean;
  handleResetFilters: () => void;
}

export const TicketKanbanBoard: React.FC<TicketKanbanBoardProps> = ({
  columnas,
  activeTickets,
  activeDropdown,
  setActiveDropdown,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleAbrirDetalle,
  handleMoverTicket,
  handleCerrarTicket,
  handleCambiarPrioridad,
  handleEliminarTicket,
  getPriorityStyle,
  hasActiveFilters,
  handleResetFilters,
}) => {
  return (
    <div className="flex gap-4 md:gap-6 flex-1 min-h-[420px] overflow-x-auto pb-4 shrink-0 snap-x custom-scrollbar">
      {columnas.map((col) => {
        const colTickets = activeTickets.filter((t) => t.estado === col.id);
        return (
          <div
            key={col.id}
            className={`flex-1 min-w-[85vw] sm:min-w-[320px] snap-center rounded-2xl flex flex-col ${col.bgClass} border ${col.borderClass} shadow-xs overflow-hidden transition-all`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Acento superior de color */}
            <div className={`h-1.5 w-full ${col.accentBar} shrink-0`}></div>

            {/* Encabezado de Columna */}
            <div className="p-3.5 px-4 flex items-center justify-between border-b border-slate-200/70 bg-white/80 kanban-col-header backdrop-blur-xs shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{col.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">{col.subtitle}</p>
              </div>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${col.badgeBg}`}>
                {colTickets.length}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto space-y-3 pb-16 md:pb-3 custom-scrollbar">
              {colTickets.map((ticket) => (
                <TicketKanbanCard
                  key={ticket.id}
                  ticket={ticket}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  handleDragStart={handleDragStart}
                  handleAbrirDetalle={handleAbrirDetalle}
                  handleMoverTicket={handleMoverTicket}
                  handleCerrarTicket={handleCerrarTicket}
                  handleCambiarPrioridad={handleCambiarPrioridad}
                  handleEliminarTicket={handleEliminarTicket}
                  getPriorityStyle={getPriorityStyle}
                />
              ))}

              {colTickets.length === 0 && (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-300/60 rounded-2xl bg-white/40 kanban-empty-card hover:bg-white/70 transition-all duration-200 group/empty">
                  <div className="w-13 h-13 rounded-2xl bg-white kanban-empty-icon-box shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2.5 group-hover/empty:scale-105 group-hover/empty:shadow-xs transition-all duration-300">
                    {col.emptyIcon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">{col.emptyTitle}</h4>
                  <p className="text-xs text-slate-400 max-w-[210px] leading-relaxed mb-3">
                    {hasActiveFilters
                      ? 'No hay tickets en esta columna que coincidan con los filtros del tablero.'
                      : col.emptyDesc}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-blue-200"
                    >
                      Restablecer filtros
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 bg-white/90 kanban-empty-pill px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                      Arrastra tickets aquí
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
