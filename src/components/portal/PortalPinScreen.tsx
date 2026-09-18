import React from 'react';
import { TicketIcon } from 'lucide-react';
import { LimatamboBrand } from '@/components/ui/LimatamboBrand';

interface PortalPinScreenProps {
  pin: string;
  setPin: (pin: string) => void;
  pinError: string;
  handleVerifyPin: (e: React.FormEvent) => Promise<void>;
  onDirectTrackerClick: () => void;
}

export const PortalPinScreen: React.FC<PortalPinScreenProps> = ({
  pin,
  setPin,
  pinError,
  handleVerifyPin,
  onDirectTrackerClick,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-in zoom-in-95 duration-500">
        <div className="mb-8">
          <LimatamboBrand subtitle="Ingresa el PIN de acceso para reportar un problema." />
        </div>

        <form onSubmit={handleVerifyPin}>
          <div className="relative mb-6">
            <div className="flex justify-center items-center gap-3">
              {[0, 1, 2, 3].map((index) => {
                const hasChar = pin.length > index;
                const isCurrent = pin.length === index;
                return (
                  <div
                    key={index}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      hasChar
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm scale-105'
                        : isCurrent
                        ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/15'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {hasChar ? (
                      <span className="w-4 h-4 bg-indigo-600 rounded-full shadow-xs transform scale-110 transition-transform" />
                    ) : (
                      <span className="w-2 h-2 bg-slate-300 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>

            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                setPin(val);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-transparent caret-transparent selection:bg-transparent"
              autoFocus
              autoComplete="off"
            />
          </div>

          {pinError && (
            <p className="text-red-500 text-sm text-center mb-4 font-bold animate-in fade-in">
              {pinError}
            </p>
          )}

          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            Entrar al Portal
          </button>
        </form>

        {/* Acceso Rápido para Consultar Tickets sin PIN */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={onDirectTrackerClick}
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-3 rounded-lg hover:bg-indigo-50 cursor-pointer"
          >
            <TicketIcon className="w-4 h-4" />
            Ver tickets en atención en vivo
          </button>
        </div>
      </div>
    </div>
  );
};
