import React from 'react';
import { Monitor, Palette, Sun, Moon, Bell } from 'lucide-react';

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
