import React, { useState, useEffect } from 'react';
import { MapPin, Building2, User, X, Check, ArrowRight } from 'lucide-react';
import { getUbicacionesDepartamentos } from '@/services/api';

interface AssetAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  sedesList: string[];
  onGuardarAsignacion: (data: {
    sede: string;
    departamento: string;
    ubicacion: string;
    responsable: string;
  }) => Promise<void>;
}

export function AssetAssignModal({
  isOpen,
  onClose,
  activo,
  sedesList,
  onGuardarAsignacion,
}: AssetAssignModalProps) {
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activo) {
      setSede(activo.sede || '');
      setDepartamento(activo.departamento || '');
      setUbicacion(activo.ubicacion || '');
      setResponsable(activo.responsable || '');
    }
  }, [activo]);

  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede)
        .then((data) => setDepartamentosList(data))
        .catch(console.error);
    } else {
      setDepartamentosList([]);
    }
  }, [sede]);

  if (!isOpen || !activo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sede) {
      alert('Por favor selecciona una sede');
      return;
    }
    setIsSaving(true);
    try {
      await onGuardarAsignacion({
        sede,
        departamento: departamento.trim(),
        ubicacion: ubicacion.trim(),
        responsable: responsable.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                Asignar Ubicación y Responsable
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Sede <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={sede}
                onChange={(e) => {
                  setSede(e.target.value);
                  setDepartamento('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">Seleccionar Sede...</option>
                {sedesList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-500" /> Departamento
              </label>
              {departamentosList.length > 0 ? (
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">Seleccionar Departamento...</option>
                  {departamentosList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Ej: Rayos X, Admisión..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ubicación Específica / Consultorio / Piso
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Piso 3, Consultorio 304, Mostrador 1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" /> Responsable Asignado / Custodio
            </label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Ej: Dra. Gómez / Lic. Pérez / Admisión Central"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Confirmar Asignación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
