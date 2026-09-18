import React from 'react';
import { MapPin, User, Check, Play, Clock, CheckCircle2 } from 'lucide-react';

interface TicketShapeCardProps {
  ticket: any;
  isRecentlyCreated?: boolean;
}

export const TicketShapeCard: React.FC<TicketShapeCardProps> = ({
  ticket,
  isRecentlyCreated,
}) => {
  const isProgreso = ticket.estado === 'EN_PROGRESO';
  const isResuelto = ticket.estado === 'RESUELTO';
  const code = ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`;

  return (
    <div
      className={`relative bg-white rounded-3xl border-2 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden ${
        isResuelto
          ? 'border-emerald-400 ring-4 ring-emerald-500/10'
          : isRecentlyCreated
          ? 'border-indigo-500 ring-4 ring-indigo-500/15'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* 1. TALÓN SUPERIOR DEL TICKET (Stub) */}
      <div
        className={`px-5 pt-4 pb-3 flex items-center justify-between border-b border-dashed border-slate-200 transition-colors duration-500 ${
          isResuelto
            ? 'bg-emerald-50/90'
            : isProgreso
            ? 'bg-indigo-50/90'
            : 'bg-amber-50/70'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-mono text-[9px] font-black tracking-tighter text-slate-400 select-none hidden sm:block">
            |||| || ||| |||| |
          </div>
          <span
            className={`font-mono font-black text-sm md:text-base tracking-wider bg-white px-2.5 py-1 rounded-lg border shadow-xs ${
              isResuelto ? 'text-emerald-700 border-emerald-200' : 'text-indigo-700 border-indigo-100'
            }`}
          >
            #{code}
          </span>
          {isRecentlyCreated && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
              Tu Ticket
            </span>
          )}
        </div>

        {/* Badge de Estado Dinámico */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs transition-all duration-300 ${
            isResuelto
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isProgreso
              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isResuelto
                ? 'bg-emerald-600'
                : isProgreso
                ? 'bg-indigo-600 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <span>{isResuelto ? '¡RESUELTO!' : isProgreso ? 'TÉCNICO EN CAMINO' : 'EN ESPERA'}</span>
        </div>
      </div>

      {/* 2. MUESCAS TROQUELADAS LATERALES (Forma de Ticket) */}
      <div className="relative flex items-center justify-between h-4 -my-2 z-10 pointer-events-none">
        <div className="w-5 h-5 rounded-full bg-slate-50 border-r-2 border-slate-300 -ml-2.5 shadow-inner" />
        <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
        <div className="w-5 h-5 rounded-full bg-slate-50 border-l-2 border-slate-300 -mr-2.5 shadow-inner" />
      </div>

      {/* 3. CUERPO DEL TICKET */}
      <div className="p-5 md:p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Ilustración Duolingo */}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl border-2 overflow-hidden shadow-inner flex items-center justify-center p-1 transition-all duration-300 ${
              isResuelto ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                isResuelto
                  ? '/illustrations/ticket-resolved.jpg'
                  : isProgreso
                  ? '/illustrations/tech-running.jpg'
                  : '/illustrations/ticket-waiting.jpg'
              }
              alt={isResuelto ? 'Ticket resuelto' : isProgreso ? 'Técnico en camino' : 'Doctor esperando'}
              className="w-full h-full object-contain animate-in fade-in zoom-in duration-300"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className={`text-base sm:text-lg font-black leading-snug ${isResuelto ? 'text-emerald-950' : 'text-slate-800'}`}>
              {ticket.titulo}
            </h3>

            {/* Ubicación y Solicitante */}
            <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-600 justify-center sm:justify-start">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {ticket.sede} · {ticket.departamento} {ticket.ubicacionEspecifica ? `(${ticket.ubicacionEspecifica})` : ''}
              </span>
              {ticket.solicitanteNombre && (
                <span className="flex items-center gap-1 text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {ticket.solicitanteNombre}
                </span>
              )}
            </div>

            {/* Mensaje descriptivo del avance en tiempo real */}
            <p className={`text-xs ${isResuelto ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'}`}>
              {isResuelto
                ? ticket.solucion
                  ? `✅ Solución: ${ticket.solucion}`
                  : '🎉 ¡Problema solucionado con éxito por Sistemas!'
                : isProgreso
                ? ticket.tecnicoAsignado?.nombre
                  ? `👨‍💻 ${ticket.tecnicoAsignado.nombre} de Sistemas está atendiendo tu caso y va en camino.`
                  : '👨‍💻 El personal de Sistemas ya está en marcha hacia tu ubicación.'
                : '⏱️ Tu reporte está en cola y será asignado a un técnico en breve.'}
            </p>
          </div>
        </div>

        {/* 4. STEPPER / PROGRESO DEL TICKET */}
        <div className="pt-2 border-t border-slate-100">
          <div className="relative flex items-center justify-between px-3">
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full -z-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isResuelto ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: isResuelto ? '100%' : isProgreso ? '50%' : '10%' }}
              />
            </div>

            {/* Paso 1: Recibido */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">Recibido</span>
            </div>

            {/* Paso 2: En Camino */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shadow-sm transition-all duration-300 ${
                  isResuelto
                    ? 'bg-emerald-500 text-white'
                    : isProgreso
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isResuelto ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isProgreso ? <Play className="w-3.5 h-3.5 fill-white" /> : '2'}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${
                  isResuelto ? 'text-emerald-700 font-bold' : isProgreso ? 'text-indigo-700 font-black' : 'text-slate-400'
                }`}
              >
                En Camino
              </span>
            </div>

            {/* Paso 3: Terminado */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shadow-sm transition-all duration-300 ${
                  isResuelto
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isResuelto ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
              </div>
              <span
                className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${
                  isResuelto ? 'text-emerald-700 font-black' : 'text-slate-400'
                }`}
              >
                Resuelto
              </span>
            </div>
          </div>
        </div>

        {/* 5. PIE DEL TICKET: Fecha y Estado */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {isResuelto ? 'Resuelto' : 'Registrado'}:{' '}
            {isResuelto && (ticket.resueltoEn || ticket.actualizadoEn)
              ? new Date(ticket.resueltoEn || ticket.actualizadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
              : ticket.creadoEn
              ? new Date(ticket.creadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
          {isResuelto ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Caso Concluido
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              En atención activa
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
