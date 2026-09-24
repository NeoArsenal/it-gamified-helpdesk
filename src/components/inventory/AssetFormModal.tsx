import React from 'react';
import { Package, X, Sparkles, Tag, Layers, Hash, ReceiptText } from 'lucide-react';

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
  codigoFactura: string;
  setCodigoFactura: (val: string) => void;
  tiposDisponibles: string[];
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
  codigoFactura,
  setCodigoFactura,
  tiposDisponibles,
  onGuardar,
}: AssetFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                {editingActivo ? `Editar Datos: ${editingActivo.codigo}` : 'Registrar Nuevo Equipo'}
              </h3>
              <p className="text-xs text-slate-400">
                Alta de hardware en almacén con comprobante y número de serie
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

        {/* Cuerpo del Formulario */}
        <form onSubmit={onGuardar} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
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

          {/* Bloque 2: Marca & Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={e => setMarca(e.target.value)}
                placeholder="Ej: HP, Lenovo, Dell, Epson..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" /> Modelo
              </label>
              <input
                type="text"
                value={modelo}
                onChange={e => setModelo(e.target.value)}
                placeholder="Ej: ProDesk 400 G6, ThinkPad L14..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bloque 3: Número de Serie (S/N) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> Número de Serie (S/N)
            </label>
            <input
              type="text"
              value={numeroSerie}
              onChange={e => setNumeroSerie(e.target.value)}
              placeholder="EJ: SN-4CE0460XYZ O SERIE DE FÁBRICA GRABADA EN EL CHASIS"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
            />
          </div>

          {/* Bloque 4: Código de Factura / Guía de Ingreso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ReceiptText className="w-3.5 h-3.5 text-indigo-600" /> Código de Factura / Guía de Compra
              </span>
              <span className="text-[11px] font-normal text-slate-400">Contabilidad / Almacén</span>
            </label>
            <input
              type="text"
              value={codigoFactura}
              onChange={e => setCodigoFactura(e.target.value)}
              placeholder="Ej: F001-002345 o GR-2026-089"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
            />
          </div>

          {/* Banner Informativo de Alta */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-900">
            <span className="text-base shrink-0">📦</span>
            <div>
              <p className="font-bold text-indigo-950">Ingreso a Almacén TI</p>
              <p className="text-indigo-700/90 mt-0.5 leading-relaxed">
                El equipo se guardará como <strong>Disponible en Almacén</strong>. Luego podrás asignarlo a una sede, departamento y responsable con trazabilidad completa.
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>{editingActivo ? 'Guardar Cambios' : 'Registrar Equipo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
