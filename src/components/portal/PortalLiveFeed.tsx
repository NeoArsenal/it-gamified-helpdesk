import React from 'react';
import { RefreshCw, CheckCircle2, TicketIcon } from 'lucide-react';
import { TicketShapeCard } from './TicketShapeCard';
import { PortalTicketLinker } from './PortalTicketLinker';

interface PortalLiveFeedProps {
  activeTickets: any[];
  myTicketIds: string[];
  isLoadingActive: boolean;
  lastUpdatedTime: Date;
  createdTicketInfo?: any;
  cargarTicketsActivos: () => void;
  onNavigateToReport: () => void;
  showLinkInput: boolean;
  setShowLinkInput: (val: boolean) => void;
  linkCodeInput: string;
  setLinkCodeInput: (val: string) => void;
  isLinkingTicket: boolean;
  linkMessage: { text: string; error?: boolean } | null;
  handleLinkTicket: (e: React.FormEvent) => Promise<void>;
}

export const PortalLiveFeed: React.FC<PortalLiveFeedProps> = ({
  activeTickets,
  myTicketIds,
  isLoadingActive,
  lastUpdatedTime,
  createdTicketInfo,
  cargarTicketsActivos,
  onNavigateToReport,
  showLinkInput,
  setShowLinkInput,
  linkCodeInput,
  setLinkCodeInput,
  isLinkingTicket,
  linkMessage,
  handleLinkTicket,
}) => {
  const myActiveTickets = activeTickets.filter((tk) => myTicketIds.includes(tk.id));

  return (
    <div className="space-y-5">
      {/* Barra de Estado en Tiempo Real (Sleek, Privada) */}
      <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 tracking-tight">
                {myActiveTickets.length === 1
                  ? '1 Ticket tuyo en atención'
                  : `${myActiveTickets.length} Tickets tuyos en atención`}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                En Vivo
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Actualizado: {lastUpdatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <button
          onClick={() => cargarTicketsActivos()}
          disabled={isLoadingActive}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
          title="Refrescar manualmente"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActive ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Lista de Tickets del Dispositivo en Forma de Ticket */}
      {myActiveTickets.length > 0 ? (
        <div className="space-y-5">
          {myActiveTickets.map((tk) => {
            const isMine = createdTicketInfo?.id && tk.id === createdTicketInfo.id;
            return (
              <TicketShapeCard
                key={tk.id}
                ticket={tk}
                isRecentlyCreated={Boolean(isMine)}
              />
            );
          })}
        </div>
      ) : isLoadingActive ? (
        <div className="p-10 text-center text-slate-400 animate-pulse">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold">Cargando tus tickets...</p>
        </div>
      ) : (
        /* Estado Vacío: ¡No hay tickets en este equipo! */
        <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-800">
              ¡No tienes tickets activos en este equipo!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Los reportes que generes desde este celular aparecerán aquí con su seguimiento en vivo.
            </p>
          </div>
          <button
            onClick={onNavigateToReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <TicketIcon className="w-4 h-4" />
            Reportar un Problema Ahora
          </button>
        </div>
      )}

      {/* Herramienta para vincular ticket si reportó desde otro equipo */}
      <PortalTicketLinker
        showLinkInput={showLinkInput}
        setShowLinkInput={setShowLinkInput}
        linkCodeInput={linkCodeInput}
        setLinkCodeInput={setLinkCodeInput}
        isLinkingTicket={isLinkingTicket}
        linkMessage={linkMessage}
        handleLinkTicket={handleLinkTicket}
      />

      {/* Nota explicativa de privacidad */}
      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900/80 text-center font-medium">
        🔒 <strong>Privacidad por equipo:</strong> Esta lista es exclusiva de este dispositivo. Nadie más puede ver tus reportes desde otros celulares.
      </div>
    </div>
  );
};
