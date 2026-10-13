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

// Formatear el número de ticket estilo "N.º 412"
const formatTicketNumber = (ticket: any): string => {
  if (ticket.numero) {
    return `N.º ${ticket.numero}`;
  }
  const cleanId = String(ticket.id || '');
  const digits = cleanId.replace(/\D/g, '');
  if (digits.length >= 3) {
    return `N.º ${digits.slice(-3)}`;
  }
  return `N.º ${cleanId.substring(0, 4).toUpperCase()}`;
};

// Configuración de estilo según la urgencia/prioridad para el talón de boleto
const getPriorityStubConfig = (prioridad: string) => {
  switch (prioridad) {
    case 'CRITICA':
      return {
        stubBg: 'bg-rose-600 text-white',
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
  const ticketNumber = formatTicketNumber(ticket);

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, ticket.id)}
      onClick={() => handleAbrirDetalle(ticket)}
      className={`relative flex items-stretch rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-[0.99] group overflow-hidden ${
        activeDropdown === ticket.id ? 'z-40' : 'z-0'
      }`}
    >
      {/* 1. TALÓN DEL TICKET / BOLETO (Lado Izquierdo con N.º y Muescas Circulares) */}
      <div
        className={`w-11 sm:w-12 shrink-0 flex items-center justify-center relative select-none border-r-2 border-dashed border-slate-300 dark:border-slate-700 ${prio.stubBg}`}
      >
        <span className="-rotate-90 text-[11px] font-black tracking-widest whitespace-nowrap">
          {ticketNumber}
        </span>

        {/* Muesca circular superior del ticket */}
        <div className="absolute -top-2.5 -right-2 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 z-20 pointer-events-none ticket-notch" />

        {/* Muesca circular inferior del ticket */}
        <div className="absolute -bottom-2.5 -right-2 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 z-20 pointer-events-none ticket-notch" />
      </div>

      {/* 2. CUERPO PRINCIPAL DEL TICKET */}
      <div className="flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5">
        {/* Cabecera: Título y Opciones */}
        <div className="flex items-start justify-between gap-2 relative">
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {ticket.titulo}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
              {ticket.sede || 'Sede Central'} · {ticket.solicitanteNombre || 'Usuario TI'}
              {ticket.departamento ? ` (${ticket.departamento})` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {ticket.fotoUrl && (
              <span
                title="Incluye fotografía de evidencia"
                className="p-1 rounded-md text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/70"
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
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Más opciones de ticket"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown de Acciones y Cambio de Prioridad */}
              {activeDropdown === ticket.id && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(null);
                    }}
                  />
                  <div className="absolute right-0 top-8 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 ring-1 ring-black/10 max-h-[380px] overflow-y-auto">
                    {ticket.estado === 'ABIERTO' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 text-slate-400" /> Iniciar Progreso
                      </button>
                    )}
                    {ticket.estado === 'EN_PROGRESO' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-400" /> Marcar Resuelto
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoverTicket(ticket.id, 'ABIERTO', ticket.estado);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-400" /> Devolver a Abierto
                        </button>
                      </>
                    )}
                    {ticket.estado === 'RESUELTO' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCerrarTicket(ticket.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4 text-slate-400" /> Cerrar Ticket
                      </button>
                    )}

                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1.5" />
                    <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-indigo-500" /> Nivel de Emergencia
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
                        } ${ticket.prioridad === p.id ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}`}
                      >
                        <span>{p.label}</span>
                        {ticket.prioridad === p.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}

                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1.5" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarTicket(ticket.id);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar Ticket
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fila Inferior: Urgencia y Botón de Acción Directo ("Pasar a...") */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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

          {/* Botón de Acción Directo e Intuitivo */}
          <div className="shrink-0">
            {ticket.estado === 'ABIERTO' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado);
                }}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
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
