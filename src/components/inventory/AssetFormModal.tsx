import React from 'react';
import { Package, X, Sparkles, Tag, Layers, Hash, MapPin, Building2, User, FileText } from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingActivo: any | null;
  codigo: string;
  setCodigo: (val: string) => void;
  tipo: string;
  setTipo: (val: string) => void;
  marca: string;
  setMarca: (val: string) => void;
  modelo: string;
  setModelo: (val: string) => void;
  numeroSerie: string;
  setNumeroSerie: (val: string) => void;
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
  marca,
  setMarca,
  modelo,
  setModelo,
  numeroSerie,
  setNumeroSerie,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                {editingActivo ? `Editar Equipo: ${editingActivo.codigo}` : 'Registrar Nuevo Equipo'}
              </h3>
              <p className="text-xs text-slate-400">
                Ficha patrimonial, asignación y número de serie
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario con Scroll Suave */}
        <form onSubmit={onGuardar} className="p-4 sm:p-6 space-y-4 sm:space-y-4.5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Bloque 1: Código Patrimonial & Tipo de Equipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Código Patrimonial <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCodigo(`ACT-${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1 transition-colors bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                  title="Generar un código automático"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Auto
                </button>
              </div>
              <input
                type="text"
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Ej: PC-042"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipo de Equipo <span className="text-red-500">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                {tiposDisponibles.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloque 2: Marca y Modelo Desacoplados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={e => setMarca(e.target.value)}
                placeholder="Ej: HP, Lenovo, Dell, Epson..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Modelo
              </label>
              <input
                type="text"
                value={modelo}
                onChange={e => setModelo(e.target.value)}
                placeholder="Ej: ProDesk 400 G6, ThinkPad L14..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bloque 3: Número de Serie (S/N) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> Número de Serie (S/N)
            </label>
            <input
              type="text"
              value={numeroSerie}
              onChange={e => setNumeroSerie(e.target.value)}
              placeholder="Ej: SN-4CE0460XYZ o serie de fábrica grabada en el chasis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
            />
          </div>

          {/* Bloque 4: Sede & Departamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Sede
              </label>
              <select
                value={sede}
                onChange={e => {
                  setSede(e.target.value);
                  setDepartamento('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="" className="text-slate-500">Seleccionar Sede</option>
                {sedesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Departamento
              </label>
              <select
                value={departamento}
                onChange={e => setDepartamento(e.target.value)}
                disabled={!sede || departamentosList.length === 0}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="" className="text-slate-500">Seleccionar Departamento</option>
                {departamentosList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloque 5: Ubicación Específica & Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ubicación / Área Específica
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                placeholder="Ej: Oficina 501, Piso 3, Ventanilla 2..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Responsable / Asignado a
              </label>
              <input
                type="text"
                value={responsable}
                onChange={e => setResponsable(e.target.value)}
                placeholder="Ej: Dra. Gómez, Lic. Pérez..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bloque 6: Estado Inicial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Estado Operativo Inicial
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'OPERATIVO', label: '🟢 Operativo', desc: 'En funcionamiento' },
                { id: 'REPARACION', label: '🟡 En Taller', desc: 'Diagnóstico' },
                { id: 'BAJA', label: '🔴 Chatarra', desc: 'Baja patrimonial' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEstado(opt.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    estado === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                  <span className={`text-[10px] hidden xs:inline sm:inline ${estado === opt.id ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloque 7: Observaciones Técnicas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Observaciones Técnicas / Diagnóstico
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Detalles de configuración, estado físico, periféricos incluidos, fallas previas..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              {editingActivo ? 'Guardar Cambios' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

