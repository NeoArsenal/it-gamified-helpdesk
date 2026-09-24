import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, AlertTriangle, ShieldCheck, Trash2, Package } from 'lucide-react';

interface AssetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  onGuardarCambioEstado: (data: {
    nuevoEstado: string;
    observaciones: string;
  }) => Promise<void>;
}

export function AssetStatusModal({
  isOpen,
  onClose,
  activo,
  onGuardarCambioEstado,
}: AssetStatusModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState('OPERATIVO');
  const [observaciones, setObservaciones] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activo) {
      setNuevoEstado(activo.estado || 'OPERATIVO');
      setObservaciones('');
    }
  }, [activo]);

  if (!isOpen || !activo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onGuardarCambioEstado({
        nuevoEstado,
        observaciones: observaciones.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const estadosOpciones = [
    {
      id: 'OPERATIVO',
      label: 'Operativo',
      desc: 'En funcionamiento y listo en sede',
      icon: ShieldCheck,
      color: 'text-emerald-700 border-emerald-300 bg-emerald-50/70',
      activeRing: 'ring-2 ring-emerald-500',
    },
    {
      id: 'REPARACION',
      label: 'En Taller (Falla)',
      desc: 'Desperfecto técnico o mantenimiento',
      icon: Wrench,
      color: 'text-amber-700 border-amber-300 bg-amber-50/70',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'DISPONIBLE',
      label: 'En Almacén TI',
      desc: 'Retirado de sede, disponible en bodega',
      icon: Package,
      color: 'text-blue-700 border-blue-300 bg-blue-50/70',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'BAJA',
      label: 'Chatarra / Baja',
      desc: 'Inoperativo definitivo / Descarte',
      icon: Trash2,
      color: 'text-rose-700 border-rose-300 bg-rose-50/70',
      activeRing: 'ring-2 ring-rose-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                Reportar Falla o Cambiar Estado
              </h3>
              <p className="text-xs text-slate-400">
                Equipo: <span className="font-bold text-slate-700">{activo.codigo}</span> ({activo.tipo} {activo.marca} {activo.modelo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Seleccionar Nuevo Estado Operativo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {estadosOpciones.map((opt) => {
                const isSelected = nuevoEstado === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNuevoEstado(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected ? `${opt.color} ${opt.activeRing} shadow-sm` : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Diagnóstico Técnico / Motivo de la Falla</span>
              <span className="text-[10px] font-normal text-slate-400">Se registrará en la Trazabilidad</span>
            </label>
            <textarea
              required
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Describe la falla presentada (ej: No enciende, pantalla azul, cable de red roto, mantenimiento preventivo)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !observaciones.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Actualizar Estado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
