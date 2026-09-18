import React from 'react';
import { Search } from 'lucide-react';

interface PortalTicketLinkerProps {
  showLinkInput: boolean;
  setShowLinkInput: (val: boolean) => void;
  linkCodeInput: string;
  setLinkCodeInput: (val: string) => void;
  isLinkingTicket: boolean;
  linkMessage: { text: string; error?: boolean } | null;
  handleLinkTicket: (e: React.FormEvent) => Promise<void>;
}

export const PortalTicketLinker: React.FC<PortalTicketLinkerProps> = ({
  showLinkInput,
  setShowLinkInput,
  linkCodeInput,
  setLinkCodeInput,
  isLinkingTicket,
  linkMessage,
  handleLinkTicket,
}) => {
  if (!showLinkInput) {
    return (
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowLinkInput(true)}
          className="w-full text-center text-xs font-semibold text-slate-400 hover:text-indigo-600 py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          ¿Reportaste desde otro equipo? Vincular mi ticket aquí
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-slate-100">
      <form onSubmit={handleLinkTicket} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-indigo-600" /> Vincular Ticket
          </span>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={linkCodeInput}
            onChange={(e) => setLinkCodeInput(e.target.value)}
            placeholder="Ej: #TK-D02BC2 o teléfono..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLinkingTicket || !linkCodeInput.trim()}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            {isLinkingTicket ? 'Buscando...' : 'Vincular'}
          </button>
        </div>
        {linkMessage && (
          <p className={`text-[11px] font-bold ${linkMessage.error ? 'text-red-500' : 'text-emerald-600'}`}>
            {linkMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};
