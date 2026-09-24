import React from 'react';
import { Monitor, Palette, Sun, Moon, Bell } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PushNotificationModal } from '@/components/notifications/PushNotificationModal';

interface AppearanceTabProps {
  theme: 'light' | 'dark';
  toggleTheme: (theme: 'light' | 'dark') => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  theme,
  toggleTheme,
}) => {
  return (
    <div className="p-8 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
        <Monitor className="w-5 h-5 text-slate-600" /> Sistema y UI
      </h2>

      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Tema de la Aplicación
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => toggleTheme('light')}
              className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden group transition-all ${
                theme === 'light' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Sun className="w-6 h-6" />
              </div>
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-indigo-700' : 'text-slate-600'}`}>
                Claro (Por Defecto)
              </span>
              {theme === 'light' && <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>}
            </button>

            <button
              onClick={() => toggleTheme('dark')}
              className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden transition-all ${
                theme === 'dark' ? 'border-indigo-600 bg-slate-900' : 'border-slate-200 bg-slate-800 hover:bg-slate-900'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'
                }`}
              >
                <Moon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-white'}`}>
                Modo Oscuro (Terminal)
              </span>
              {theme === 'dark' && <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" /> Notificaciones en Celular (Push)
          </label>
          <p className="text-xs text-slate-500">
            Configura las alertas con sonido y vibración que llegan a la bandeja de tu teléfono fuera de la app.
          </p>
          <PushNotificationSettingsCard />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Integraciones Externas
          </label>
          <button className="w-full bg-[#36C5F0] hover:bg-[#2EB67D] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
            Vincular con Slack (Alertas)
          </button>
        </div>
      </div>
    </div>
  );
};

function PushNotificationSettingsCard() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const { isSubscribed } = usePushNotifications();

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSubscribed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Alertas en este Dispositivo</span>
              {isSubscribed ? (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Activas
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  Desactivadas
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Toca para gestionar o enviar una prueba</p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          Configurar &rarr;
        </span>
      </button>

      <PushNotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
