import React from 'react';
import { User, Volume2, Lock, Check } from 'lucide-react';
import { TITULOS_RPG } from '@/types';

interface ProfileTabProps {
  avatarSeed: string;
  setAvatarSeed: (seed: string) => void;
  tituloRPG: string;
  setTituloRPG: (titulo: string) => void;
  userLevel: number;
  musicaNivel: boolean;
  setMusicaNivel: (val: boolean) => void;
  alertasCriticas: boolean;
  setAlertasCriticas: (val: boolean) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  avatarSeed,
  setAvatarSeed,
  tituloRPG,
  setTituloRPG,
  userLevel,
  musicaNivel,
  setMusicaNivel,
  alertasCriticas,
  setAlertasCriticas,
}) => {
  return (
    <div className="p-8 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
        <User className="w-5 h-5 text-indigo-500" /> Preferencias del Técnico
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Avatar y Clase */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Avatar de Héroe</label>
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=e2e8f0`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 p-2 shadow-sm"
              />
              <button
                onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-300"
              >
                Generar Avatar Aleatorio
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Título / Clase de RPG</label>
            <div className="space-y-2">
              {TITULOS_RPG.map((titulo) => {
                const isUnlocked = userLevel >= titulo.minLevel;
                const isSelected = tituloRPG === titulo.id;

                return (
                  <div
                    key={titulo.id}
                    onClick={() => {
                      if (isUnlocked) setTituloRPG(titulo.id);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      isUnlocked
                        ? isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm cursor-default'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg ${
                        isUnlocked ? 'bg-white shadow-sm' : 'bg-slate-200'
                      }`}
                    >
                      {isUnlocked ? titulo.icon : <Lock className="w-4 h-4 text-slate-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {titulo.id}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{titulo.desc}</p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                      {!isUnlocked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                          Requiere Lvl {titulo.minLevel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Alertas y Sonidos
            </label>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Música de Subida de Nivel</p>
                  <p className="text-xs text-slate-500">Reproducir sonido épico al ganar medallas.</p>
                </div>
                <input
                  type="checkbox"
                  checked={musicaNivel}
                  onChange={(e) => setMusicaNivel(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-semibold text-sm text-slate-800">Alertas de Tickets Críticos</p>
                  <p className="text-xs text-slate-500">Sonido de alarma cuando ingresa una emergencia.</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertasCriticas}
                  onChange={(e) => setAlertasCriticas(e.target.checked)}
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
