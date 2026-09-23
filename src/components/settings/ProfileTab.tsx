import React from 'react';
import { User, Volume2, ShieldAlert } from 'lucide-react';

interface ProfileTabProps {
  avatarSeed: string;
  setAvatarSeed: (seed: string) => void;
  alertasCriticas: boolean;
  setAlertasCriticas: (val: boolean) => void;
  // Propiedades opcionales para compatibilidad
  tituloRPG?: string;
  setTituloRPG?: (titulo: string) => void;
  userLevel?: number;
  musicaNivel?: boolean;
  setMusicaNivel?: (val: boolean) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  avatarSeed,
  setAvatarSeed,
  alertasCriticas,
  setAlertasCriticas,
}) => {
  return (
    <div className="p-6 md:p-8 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
        <User className="w-5 h-5 text-indigo-500" /> Preferencias del Técnico
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Avatar Profesional */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Avatar del Especialista</label>
            <p className="text-xs text-slate-500 mb-3">
              Identificador gráfico visible en tickets asignados e historial.
            </p>
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=e2e8f0`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 p-2 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors border border-slate-300 cursor-pointer shadow-xs"
              >
                Generar Nuevo Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones y Alertas Técnicas */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" /> Alertas Operativas
            </label>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Alertas de Tickets Críticos</p>
                    <p className="text-xs text-slate-500">Notificación y sonido de aviso cuando ingresa una emergencia técnica prioritaria.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertasCriticas}
                  onChange={(e) => setAlertasCriticas(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer shrink-0 ml-3"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

