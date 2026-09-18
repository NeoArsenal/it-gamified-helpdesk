import React from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  User,
  Phone,
  CalendarClock,
  Zap,
  FileText,
  Edit3,
  CheckCircle2,
  Check,
  Play,
  Archive,
} from 'lucide-react';

interface TicketDetailModalProps {
  selectedTicket: any | null;
  setSelectedTicket: (ticket: any | null) => void;
  solucionInput: string;
  setSolucionInput: (val: string) => void;
  isEditingSolucion: boolean;
  setIsEditingSolucion: (val: boolean) => void;
  isSavingSolucion: boolean;
  handleGuardarSolucion: () => Promise<void>;
  handleCambiarPrioridad: (id: string, nuevaPrioridad: string) => Promise<void>;
  handleMoverTicket: (id: string, nuevoEstado: string, estadoActual: string) => Promise<void>;
  handleCerrarTicket: (id: string, solucion?: string) => Promise<void>;
  getPriorityStyle: (priority: string) => any;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  selectedTicket,
  setSelectedTicket,
  solucionInput,
  setSolucionInput,
  isEditingSolucion,
  setIsEditingSolucion,
  isSavingSolucion,
  handleGuardarSolucion,
  handleCambiarPrioridad,
  handleMoverTicket,
  handleCerrarTicket,
  getPriorityStyle,
}) => {
  if (!selectedTicket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => setSelectedTicket(null)} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header del Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-md">
                TIC-{selectedTicket.id.substring(0, 5).toUpperCase()}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                  getPriorityStyle(selectedTicket.prioridad).bg
                } ${getPriorityStyle(selectedTicket.prioridad).color} ${getPriorityStyle(selectedTicket.prioridad).border}`}
              >
                {getPriorityStyle(selectedTicket.prioridad).icon}
                {selectedTicket.prioridad}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                  selectedTicket.estado === 'CERRADO'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : selectedTicket.estado === 'RESUELTO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedTicket.estado === 'EN_PROGRESO'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedTicket.estado.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug break-words">
              {selectedTicket.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Panel de Decisión Técnica: Nivel de Emergencia / Importancia */}
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/40 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Decisión Técnica: Nivel de Emergencia / Importancia
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Haz clic para asignar o reclasificar la urgencia
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
              {[
                {
                  id: 'CRITICA',
                  label: '🚨 Crítica',
                  desc: 'Emergencia Total',
                  activeClass: 'bg-red-600 text-white shadow-md shadow-red-500/30 border-red-600 ring-2 ring-red-400/50',
                  idleClass: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
                },
                {
                  id: 'ALTA',
                  label: '⚠️ Alta',
                  desc: 'Muy Importante',
                  activeClass: 'bg-orange-500 text-white shadow-md shadow-orange-500/30 border-orange-500 ring-2 ring-orange-400/50',
                  idleClass: 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50',
                },
                {
                  id: 'MEDIA',
                  label: '⏱️ Media',
                  desc: 'Atención Normal',
                  activeClass: 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30 border-yellow-500 ring-2 ring-yellow-400/50',
                  idleClass: 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50',
                },
                {
                  id: 'BAJA',
                  label: '🟢 Baja',
                  desc: 'Rutinaria / Menor',
                  activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600 ring-2 ring-emerald-400/50',
                  idleClass: 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50',
                },
              ].map((prio) => {
                const isCurrent = selectedTicket.prioridad === prio.id;
                return (
                  <button
                    key={prio.id}
                    type="button"
                    onClick={() => handleCambiarPrioridad(selectedTicket.id, prio.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isCurrent ? prio.activeClass : prio.idleClass
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      {prio.label}
                      {isCurrent && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className={`text-[10px] ${isCurrent ? 'text-white/90' : 'text-slate-400'}`}>{prio.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadatos en Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Sede y Departamento
              </div>
              <div className="font-bold text-slate-800 text-sm">{selectedTicket.sede || 'No especificada'}</div>
              <div className="text-slate-600 font-medium">
                {selectedTicket.departamento} {selectedTicket.ubicacionEspecifica ? `· ${selectedTicket.ubicacionEspecifica}` : ''}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Solicitante
              </div>
              <div className="font-bold text-slate-800 text-sm">
                {selectedTicket.solicitanteNombre || 'Usuario no registrado'}
              </div>
              <div className="text-slate-600 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {selectedTicket.solicitanteContacto || 'Sin contacto directo'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 font-medium flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5 text-amber-500" /> Registro y Resolución
              </div>
              <div className="text-slate-700">
                <span className="font-semibold text-slate-900">Creado:</span>{' '}
                {selectedTicket.creadoEn ? new Date(selectedTicket.creadoEn).toLocaleString() : '-'}
              </div>
              {selectedTicket.resueltoEn && (
                <div className="text-emerald-700">
                  <span className="font-semibold text-emerald-900">Resuelto:</span>{' '}
                  {new Date(selectedTicket.resueltoEn).toLocaleString()}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Técnico Asignado & XP
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold overflow-hidden">
                    {selectedTicket.asignadoA?.avatar ? (
                      selectedTicket.asignadoA.avatar.length > 2 ? (
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedTicket.asignadoA.avatar}&backgroundColor=e2e8f0`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedTicket.asignadoA.avatar
                      )
                    ) : (
                      <User className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedTicket.asignadoA?.nombre || 'Sin asignar'}
                  </span>
                </div>
                <span className="font-black text-amber-600 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md text-xs">
                  +{selectedTicket.xpRecompensa} XP
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE SOLUCIÓN TÉCNICA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Diagnóstico y Solución Técnica
              </h3>
              {!isEditingSolucion && selectedTicket.solucion && (
                <button
                  type="button"
                  onClick={() => setIsEditingSolucion(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>

            {!isEditingSolucion && selectedTicket.solucion ? (
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl p-4.5 space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Solución Aplicada Registrada
                </div>
                <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.solucion}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={solucionInput}
                  onChange={(e) => setSolucionInput(e.target.value)}
                  placeholder="Escribe la causa raíz del incidente y el procedimiento técnico que se ejecutó para solucionarlo (ej: Cambio de cable de red, reinicio de spooler de impresión, parche de software)..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <div className="flex justify-end gap-2">
                  {selectedTicket.solucion && (
                    <button
                      type="button"
                      onClick={() => {
                        setSolucionInput(selectedTicket.solucion || '');
                        setIsEditingSolucion(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleGuardarSolucion}
                    disabled={isSavingSolucion || !solucionInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingSolucion ? 'Guardando...' : 'Guardar Solución'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer de Acciones del Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {selectedTicket.estado === 'ABIERTO' && (
              <button
                type="button"
                onClick={() => handleMoverTicket(selectedTicket.id, 'EN_PROGRESO', selectedTicket.estado)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Iniciar Progreso
              </button>
            )}
            {selectedTicket.estado === 'EN_PROGRESO' && (
              <button
                type="button"
                onClick={() => handleMoverTicket(selectedTicket.id, 'RESUELTO', selectedTicket.estado)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Resuelto
              </button>
            )}
            {selectedTicket.estado === 'RESUELTO' && (
              <button
                type="button"
                onClick={() => handleCerrarTicket(selectedTicket.id, solucionInput || selectedTicket.solucion)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" /> Cerrar Ticket Definitivamente
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(null);
            }}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
