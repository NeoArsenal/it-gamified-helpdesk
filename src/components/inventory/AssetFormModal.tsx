import React from 'react';
import { Package, X, Sparkles } from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingActivo: any | null;
  codigo: string;
  setCodigo: (val: string) => void;
  tipo: string;
  setTipo: (val: string) => void;
  modelo: string;
  setModelo: (val: string) => void;
  sede: string;
  setSede: (val: string) => void;
  departamento: string;
  setDepartamento: (val: string) => void;
  ubicacion: string;
  setUbicacion: (val: string) => void;
  responsable: string;
  setResponsable: (val: string) => void;
  estado: string;
  setEstado: (val: string) => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
  tiposDisponibles: string[];
  sedesList: string[];
  departamentosList: string[];
  onGuardar: (e: React.FormEvent) => void;
}

export function AssetFormModal({
  isOpen,
  onClose,
  editingActivo,
  codigo,
  setCodigo,
  tipo,
  setTipo,
  modelo,
  setModelo,
  sede,
  setSede,
  departamento,
  setDepartamento,
  ubicacion,
  setUbicacion,
  responsable,
  setResponsable,
  estado,
  setEstado,
  observaciones,
  setObservaciones,
  tiposDisponibles,
  sedesList,
  departamentosList,
  onGuardar,
}: AssetFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                {editingActivo ? `Editar Equipo: ${editingActivo.codigo}` : 'Registrar Nuevo Equipo'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Datos patrimoniales y de asignación en la empresa
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onGuardar} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Código Patrimonial <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCodigo(`ACT-${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                  title="Generar un código provisional al azar"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Ej: PC-042"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Equipo <span className="text-red-500">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {tiposDisponibles.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marca / Modelo
            </label>
            <input
              type="text"
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              placeholder="Ej: HP ProDesk 400 G6, Lenovo ThinkPad L14..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sede
              </label>
              <select
                value={sede}
                onChange={e => {
                  setSede(e.target.value);
                  setDepartamento('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" className="text-slate-500">Seleccionar Sede</option>
                {sedesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Departamento
              </label>
              <select
                value={departamento}
                onChange={e => setDepartamento(e.target.value)}
                disabled={!sede || departamentosList.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
              >
                <option value="" className="text-slate-500">Seleccionar Depto</option>
                {departamentosList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ubicación / Área Específica
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                placeholder="Ej: Oficina 501, Ventanilla 2..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsable / Asignado a
              </label>
              <input
                type="text"
                value={responsable}
                onChange={e => setResponsable(e.target.value)}
                placeholder="Ej: Dra. Gómez, Caja 1..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estado Inicial
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'OPERATIVO', label: '🟢 Operativo', desc: 'En funcionamiento' },
                { id: 'REPARACION', label: '🟡 En Taller', desc: 'Averiado / Diagnóstico' },
                { id: 'BAJA', label: '🔴 Chatarra', desc: 'Baja patrimonial' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEstado(opt.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    estado === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className={`text-[10px] ${estado === opt.id ? 'text-indigo-600 font-semibold' : 'text-slate-500 font-medium'}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones Técnicas / Diagnóstico
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Detalles de configuración, estado físico, fallas previas o componentes salvados..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {editingActivo ? 'Guardar Cambios' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
