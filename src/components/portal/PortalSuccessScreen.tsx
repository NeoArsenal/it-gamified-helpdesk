import React from 'react';
import { CheckCircle2, Copy, CheckCheck, TicketIcon } from 'lucide-react';

interface PortalSuccessScreenProps {
  createdTicketInfo: any;
  copiedCode: boolean;
  copiarCodigoTicket: (code: string) => void;
  irAConsultarCreado: () => void;
  onReportAnother: () => void;
}

export const PortalSuccessScreen: React.FC<PortalSuccessScreenProps> = ({
  createdTicketInfo,
  copiedCode,
  copiarCodigoTicket,
  irAConsultarCreado,
  onReportAnother,
}) => {
  const ticketCode = createdTicketInfo?.id
    ? `TK-${createdTicketInfo.id.slice(0, 6).toUpperCase()}`
    : 'TK-REGISTRADO';

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-300">
        {/* Ilustración Duolingo Doctor Esperando */}
        <div className="relative w-36 h-36 mx-auto mb-4 overflow-hidden rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-inner flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/ticket-waiting.jpg"
            alt="Caso recibido en espera"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Reporte Enviado a Sistemas!
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-1">Tu ticket ya está en cola</h2>
        <p className="text-slate-500 text-xs md:text-sm mb-5">
          Quedó registrado en el acumulado y cambiará de estado al instante cuando el técnico lo tome.
        </p>

        {/* Tarjeta con Código de Ticket Duolingo Style */}
        <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 mb-6 relative">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Código de tu Ticket
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl md:text-3xl font-black text-indigo-700 font-mono tracking-wider">
              #{ticketCode}
            </span>
            <button
              onClick={() => copiarCodigoTicket(ticketCode)}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all shadow-xs cursor-pointer"
              title="Copiar código"
            >
              {copiedCode ? <CheckCheck className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {copiedCode && (
            <span className="text-xs text-emerald-600 font-bold mt-1 inline-block animate-in fade-in">
              ¡Código copiado al portapapeles!
            </span>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={irAConsultarCreado}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <TicketIcon className="w-5 h-5" />
            Ver Tickets en Atención
          </button>

          <button
            onClick={onReportAnother}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all text-sm cursor-pointer"
          >
            Reportar otro problema
          </button>
        </div>
      </div>
    </div>
  );
};
