import React from 'react';
import {
  MoreHorizontal,
  CalendarClock,
  MapPin,
  Clock,
  User,
  Play,
  CheckCircle2,
  RotateCcw,
  Archive,
  ShieldAlert,
  Check,
  Trash2,
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';

interface TicketKanbanCardProps {
  ticket: any;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleAbrirDetalle: (ticket: any) => void;
  handleMoverTicket: (id: string, nuevoEstado: string, estadoActual: string) => Promise<void>;
  handleCerrarTicket: (id: string, solucion?: string) => Promise<void>;
  handleCambiarPrioridad: (id: string, nuevaPrioridad: string) => Promise<void>;
  handleEliminarTicket: (id: string) => Promise<void>;
  getPriorityStyle: (priority: string) => any;
}

export const TicketKanbanCard: React.FC<TicketKanbanCardProps> = ({
  ticket,
  activeDropdown,
  setActiveDropdown,
  handleDragStart,
  handleAbrirDetalle,
  handleMoverTicket,
  handleCerrarTicket,
  handleCambiarPrioridad,
  handleEliminarTicket,
  getPriorityStyle,
}) => {
  const style = getPriorityStyle(ticket.prioridad);
  const shortId = `TIC-${ticket.id.substring(0, 5).toUpperCase()}`;

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, ticket.id)}
      onClick={() => handleAbrirDetalle(ticket)}
      className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 ease-out cursor-pointer active:scale-95 active:shadow-md group relative ${
        activeDropdown === ticket.id ? 'z-40' : 'z-0'
      }`}
    >
      {/* Efecto de brillo de fondo al hacer hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl overflow-hidden"></div>

      <div className={`flex justify-between items-start mb-2 relative ${activeDropdown === ticket.id ? 'z-50' : 'z-10'}`}>
        <span
          className={`flex items-center px-2 py-1 rounded-md text-[10px] font-bold border transform origin-left group-hover:scale-105 transition-transform duration-300 ${style.bg} ${style.color} ${style.border}`}
        >
          {style.icon} {ticket.prioridad}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id);
            }}
            className="p-1.5 bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown flotante (Menú de Acciones y Emergencia) */}
          {activeDropdown === ticket.id && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(null);
                }}
              />
              <div className="absolute right-0 top-8 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 ring-1 ring-black/10 max-h-[380px] overflow-y-auto">
                {ticket.estado === 'ABIERTO' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Iniciar Progreso
                  </button>
                )}
                {ticket.estado === 'EN_PROGRESO' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" /> Marcar Resuelto
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoverTicket(ticket.id, 'ABIERTO', ticket.estado);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Devolver a Abierto
                    </button>
                  </>
                )}
                {ticket.estado === 'RESUELTO' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCerrarTicket(ticket.id);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> Cerrar Ticket
                  </button>
                )}

                <div className="h-px w-full bg-slate-100 my-1.5" />
                <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-indigo-500" /> Nivel de Emergencia
                </div>
                {[
                  { id: 'CRITICA', label: '🚨 Crítica', color: 'text-red-700 hover:bg-red-50' },
                  { id: 'ALTA', label: '⚠️ Alta / Importante', color: 'text-orange-700 hover:bg-orange-50' },
                  { id: 'MEDIA', label: '⏱️ Media / Normal', color: 'text-yellow-700 hover:bg-yellow-50' },
                  { id: 'BAJA', label: '🟢 Baja / Rutinaria', color: 'text-green-700 hover:bg-green-50' },
                ].map((prio) => (
                  <button
                    key={prio.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCambiarPrioridad(ticket.id, prio.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      prio.color
                    } ${ticket.prioridad === prio.id ? 'bg-slate-100 font-bold' : ''}`}
                  >
                    <span>{prio.label}</span>
                    {ticket.prioridad === prio.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}

                <div className="h-px w-full bg-slate-100 my-1.5" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminarTicket(ticket.id);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Ticket
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug relative z-10 group-hover:text-blue-700 transition-colors">
        {ticket.titulo}
      </h4>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">{shortId}</p>
        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <CalendarClock className="w-3 h-3 group-hover:animate-pulse" />
          {ticket.creadoEn
            ? new Date(ticket.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '-'}
        </p>
      </div>

      <div className="text-xs text-slate-500 mb-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {ticket.sede} - {ticket.departamento}{' '}
          {ticket.ubicacionEspecifica ? `(${ticket.ubicacionEspecifica})` : ''}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />{' '}
          {new Date(ticket.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {(ticket.solicitanteNombre || ticket.solicitanteContacto) && (
          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            {ticket.solicitanteNombre || 'Usuario'}
            {ticket.solicitanteContacto && ` (${ticket.solicitanteContacto})`}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          {ticket.asignadoA ? (
            <UserAvatar
              avatar={ticket.asignadoA.avatar}
              name={ticket.asignadoA.nombre}
              size="xs"
              title={ticket.asignadoA.nombre}
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
            {ticket.asignadoA?.nombre || 'Sin asignar'}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 shrink-0">
          {ticket.tipo || ticket.categoria || 'Incidencia'}
        </span>
      </div>
    </div>
  );
};
