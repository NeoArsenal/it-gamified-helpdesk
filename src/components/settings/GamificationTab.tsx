import React from 'react';
import { Gamepad2, RotateCcw, Save, Shield, Award, Cpu, Trophy } from 'lucide-react';
import { TITULOS_RPG, PuntosPorArea } from '@/types';

interface GamificationTabProps {
  reglasXP: PuntosPorArea;
  setReglasXP: React.Dispatch<React.SetStateAction<PuntosPorArea>>;
  nivelesConfig: number[];
  isSavingGamificacion: boolean;
  handleResetGamificacion: () => void;
  handleSaveGamificacion: () => Promise<void>;
  handleNivelChange: (index: number, val: number) => void;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({
  reglasXP,
  setReglasXP,
  nivelesConfig,
  isSavingGamificacion,
  handleResetGamificacion,
  handleSaveGamificacion,
  handleNivelChange,
}) => {
  return (
    <div className="p-6 md:p-8 animate-in slide-in-from-right-4 duration-300 space-y-8">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-500" /> Reglas de Gamificación y Escala de Niveles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Define los puntos otorgados por cada área y la progresión de rangos de los técnicos.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetGamificacion}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Restablece los valores estándar sugeridos"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Valores Sugeridos
          </button>
          <button
            type="button"
            onClick={handleSaveGamificacion}
            disabled={isSavingGamificacion}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Save className={`w-3.5 h-3.5 ${isSavingGamificacion ? 'animate-spin' : ''}`} />
            {isSavingGamificacion ? 'Guardando...' : 'Guardar Reglas'}
          </button>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Economía Dinámica de XP y Niveles de Soporte TI</p>
            <p className="text-amber-700 leading-relaxed">
              Los puntos configurados a continuación se aplican en tiempo real al resolver tickets clínicos, reparar equipos, estabilizar infraestructura y capacitarse en la Academia. Los cambios quedan registrados y sincronizados con la base de datos central.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas para Áreas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MESA DE AYUDA (TICKETS) */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" /> Mesa de Ayuda (Tickets Resueltos)
            </h3>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Área Principal</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'ticketCritica', label: 'Prioridad Crítica', color: 'bg-red-100 text-red-700 border-red-200', desc: 'Fallas de quirófano, emergencias clínicas o caída total' },
              { key: 'ticketAlta', label: 'Prioridad Alta', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Afecta directamente la atención de pacientes (Farmacia, Admisión)' },
              { key: 'ticketMedia', label: 'Prioridad Media', color: 'bg-amber-100 text-amber-700 border-amber-200', desc: 'Problemas operativos estándar (impresoras, software)' },
              { key: 'ticketBaja', label: 'Prioridad Baja', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', desc: 'Consultas menores, periféricos o solicitudes rutinarias' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${item.color}`}>
                    {item.label}
                  </span>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={(reglasXP as any)[item.key]}
                    onChange={(e) => setReglasXP({ ...reglasXP, [item.key]: Number(e.target.value) || 0 })}
                    className="w-20 text-center font-black text-sm bg-slate-50 border-2 border-slate-200 rounded-lg py-1.5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <span className="text-xs font-bold text-slate-400">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. OTRAS ÁREAS TÉCNICAS */}
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" /> Inventario, Redes y Formación
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Áreas Especiales</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'activoRescatado', icon: '♻️', label: 'Rescatar Chatarra (Hardware)', desc: 'Recuperar equipo dado de baja ahorrando costos a la clínica' },
              { key: 'activoReparado', icon: '🛠️', label: 'Reparación Exitosa de Activo', desc: 'Diagnosticar y reparar hardware devolviéndolo a Operativo' },
              { key: 'redRestaurada', icon: '⚡', label: 'Restaurar Nodo / Switch (Redes)', desc: 'Reactivar switches o routers caídos en infraestructura hospitalaria' },
              { key: 'guiaCreada', icon: '📖', label: 'Publicar Guía / Manual Técnico', desc: 'Aporte a la Base de Conocimientos para soluciones rápidas' },
              { key: 'academiaNivel', icon: '🎓', label: 'Completar Nivel de Academia', desc: 'Aprobación de módulos de capacitación técnica' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={(reglasXP as any)[item.key]}
                    onChange={(e) => setReglasXP({ ...reglasXP, [item.key]: Number(e.target.value) || 0 })}
                    className="w-20 text-center font-black text-sm bg-slate-50 border-2 border-slate-200 rounded-lg py-1.5 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  />
                  <span className="text-xs font-bold text-slate-400">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PROGRESIÓN DE NIVELES (NIVEL 1 AL 20) */}
      <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Escala y Umbrales de Nivel (Nivel 1 al 20)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Personaliza el XP acumulado requerido por cada nivel. Los títulos RPG se desbloquean según el rango alcanzado.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Máximo Nivel 20: {(nivelesConfig[19] || 120000).toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Grid de Niveles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {nivelesConfig.map((xpReq, idx) => {
            const nivelNum = idx + 1;
            const rpgTitle = TITULOS_RPG.slice().reverse().find((t) => nivelNum >= t.minLevel);
            const isMilestone = [1, 5, 10, 15, 20].includes(nivelNum);

            return (
              <div
                key={nivelNum}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isMilestone
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    isMilestone ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Lvl {nivelNum}
                  </span>
                  {rpgTitle && isMilestone && (
                    <span className="text-sm" title={rpgTitle.id}>{rpgTitle.icon}</span>
                  )}
                </div>

                {isMilestone && (
                  <p className="text-[10px] font-bold text-amber-800 truncate mb-1" title={rpgTitle?.id}>
                    {rpgTitle?.id}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-auto">
                  <input
                    type="number"
                    min="0"
                    step="250"
                    disabled={idx === 0}
                    value={xpReq}
                    onChange={(e) => handleNivelChange(idx, Number(e.target.value) || 0)}
                    className="w-full text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded py-1 focus:border-amber-500 focus:bg-white outline-none disabled:opacity-50"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">XP</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Inferior Guardar */}
        <div className="pt-4 flex justify-end border-t border-slate-200/60">
          <button
            type="button"
            onClick={handleSaveGamificacion}
            disabled={isSavingGamificacion}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Save className={`w-4 h-4 ${isSavingGamificacion ? 'animate-spin' : ''}`} />
            {isSavingGamificacion ? 'Guardando Cambios...' : 'Guardar Reglas de Gamificación'}
          </button>
        </div>
      </div>
    </div>
  );
};
