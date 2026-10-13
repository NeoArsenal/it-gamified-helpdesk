import React from 'react';
import {
  MoreHorizontal,
  Archive,
  ShieldAlert,
  Check,
  Trash2,
  Camera,
  Play,
  CheckCircle2,
  RotateCcw,
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
  getPriorityStyle?: (priority: string) => any;
}

// Formatear el código de ticket en formato oficial "TIC-XXXXX"
const formatTicketCode = (ticket: any): string => {
  if (ticket.codigo) {
    return ticket.codigo.toUpperCase();
  }
  const idStr = String(ticket.id || '');
  return `TIC-${idStr.substring(0, 5).toUpperCase()}`;
};

// Configuración de estilo según la urgencia/prioridad para el talón de boleto
const getPriorityStubConfig = (prioridad: string) => {
  switch (prioridad) {
    case 'CRITICA':
      return {
        stubBg: 'bg-rose-500 text-white',
        label: 'Urgencia crítica',
        textColor: 'text-rose-600 dark:text-rose-400 font-extrabold',
      };
    case 'ALTA':
      return {
        stubBg: 'bg-[#ff5545] text-white',
        label: 'Urgencia alta',
        textColor: 'text-[#ff5545] dark:text-red-400 font-extrabold',
      };
    case 'MEDIA':
      return {
        stubBg: 'bg-[#ffb703] text-slate-900',
        label: 'Urgencia media',
        textColor: 'text-amber-600 dark:text-amber-400 font-extrabold',
      };
    case 'BAJA':
    default:
      return {
        stubBg: 'bg-[#2ec4b6] text-slate-900',
        label: 'Urgencia baja',
        textColor: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
      };
  }
};

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
}) => {
  const prio = getPriorityStubConfig(ticket.prioridad);
  const ticketCode = formatTicketCode(ticket);

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, ticket.id)}
      onClick={() => handleAbrirDetalle(ticket)}
      className={`relative flex items-stretch rounded-2xl bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-[0.99] group border border-transparent ${
        activeDropdown === ticket.id ? 'z-50' : 'z-10'
      }`}
    >
      {/* 1. TALÓN DEL TICKET / BOLETO (Con TIC-XXXXX y Muescas sin borde oscuro) */}
      <div
        className={`w-12 sm:w-13 shrink-0 rounded-l-2xl flex items-center justify-center relative select-none border-r-2 border-dashed border-white/60 ${prio.stubBg}`}
      >
        <span className="-rotate-90 text-[10.5px] sm:text-[11px] font-mono font-black tracking-wider whitespace-nowrap">
          {ticketCode}
        </span>

        {/* Muesca circular superior del ticket (color claro sin contorno negro) */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-50 z-20 pointer-events-none ticket-notch" />

        {/* Muesca circular inferior del ticket */}
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-slate-50 z-20 pointer-events-none ticket-notch" />
      </div>

      {/* 2. CUERPO PRINCIPAL DEL TICKET (Fondo blanco nítido y redondeado) */}
      <div className="flex-1 min-w-0 p-3.5 sm:p-4 rounded-r-2xl bg-white flex flex-col justify-between space-y-2.5">
        {/* Cabecera: Título y Opciones */}
        <div className="flex items-start justify-between gap-2 relative">
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {ticket.titulo}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {ticket.sede || 'Sede Central'} · {ticket.solicitanteNombre || 'Usuario TI'}
              {ticket.departamento ? ` (${ticket.departamento})` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {ticket.fotoUrl && (
              <span
                title="Incluye fotografía de evidencia"
                className="p-1 rounded-md text-indigo-600 bg-indigo-50 border border-indigo-200/70"
              >
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Menú de 3 puntos */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Más opciones de ticket"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown de Acciones Completo (Flotante sin recorte de overflow) */}
              {activeDropdown === ticket.id && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(null);
                    }}
                  />
                  <div className="absolute right-0 top-9 w-60 max-h-[380px] overflow-y-auto custom-scrollbar bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 ring-1 ring-black/5">
                    {ticket.estado === 'ABIERTO' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 text-slate-400" /> Iniciar Progreso
                      </button>
                    )}
                    {ticket.estado === 'EN_PROGRESO' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-400" /> Marcar Resuelto
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoverTicket(ticket.id, 'ABIERTO', ticket.estado);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-400" /> Devolver a Abierto
                        </button>
                      </>
                    )}
                    {ticket.estado === 'RESUELTO' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCerrarTicket(ticket.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4 text-slate-400" /> Cerrar Ticket
                      </button>
                    )}

                    <div className="h-px w-full bg-slate-100 my-1.5" />
                    <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Nivel de Emergencia
                    </div>
                    {[
                      { id: 'CRITICA', label: '🚨 Crítica', color: 'text-red-700 hover:bg-red-50' },
                      { id: 'ALTA', label: '⚠️ Alta / Importante', color: 'text-orange-700 hover:bg-orange-50' },
                      { id: 'MEDIA', label: '⏱️ Media / Normal', color: 'text-yellow-700 hover:bg-yellow-50' },
                      { id: 'BAJA', label: '🟢 Baja / Rutinaria', color: 'text-green-700 hover:bg-green-50' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCambiarPrioridad(ticket.id, p.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          p.color
                        } ${ticket.prioridad === p.id ? 'bg-slate-100 font-bold' : ''}`}
                      >
                        <span>{p.label}</span>
                        {ticket.prioridad === p.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}

                    <div className="h-px w-full bg-slate-100 my-1.5" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarTicket(ticket.id);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar Ticket
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fila Inferior: Urgencia y Botón de Acción Directo Adaptado al Tema Claro */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {/* Indicador de Urgencia y Asignado */}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs ${prio.textColor} shrink-0`}>
              {prio.label}
            </span>
            {ticket.asignadoA && (
              <div className="hidden sm:flex items-center gap-1.5 truncate">
                <UserAvatar
                  avatar={ticket.asignadoA.avatar}
                  name={ticket.asignadoA.nombre}
                  size="xs"
                />
              </div>
            )}
          </div>

          {/* Botones de Acción Luminosos y Claros para el modo claro */}
          <div className="shrink-0">
            {ticket.estado === 'ABIERTO' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado);
                }}
                className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                title="Comenzar a resolver este ticket"
              >
                <span>Pasar a en progreso</span>
              </button>
            )}

            {ticket.estado === 'EN_PROGRESO' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado);
                }}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                title="Marcar ticket como resuelto"
              >
                <span>Pasar a resuelto</span>
              </button>
            )}

            {ticket.estado === 'RESUELTO' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCerrarTicket(ticket.id);
                }}
                className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                title="Archivar en el historial de tickets cerrados"
              >
                <span>Cerrar ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
