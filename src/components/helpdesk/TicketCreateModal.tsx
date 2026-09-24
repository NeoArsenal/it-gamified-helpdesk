import React from 'react';
import { X, Ticket as TicketIcon } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface TicketCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nuevoTitulo: string;
  setNuevoTitulo: (val: string) => void;
  nuevaSede: string;
  setNuevaSede: (val: string) => void;
  nuevoDepartamento: string;
  setNuevoDepartamento: (val: string) => void;
  nuevaArea: string;
  setNuevaArea: (val: string) => void;
  sedesList: string[];
  departamentosList: string[];
  areasList: string[];
  handleCrearTicket: (e: React.FormEvent) => Promise<void>;
}

export const TicketCreateModal: React.FC<TicketCreateModalProps> = ({
  isOpen,
  onClose,
  nuevoTitulo,
  setNuevoTitulo,
  nuevaSede,
  setNuevaSede,
  nuevoDepartamento,
  setNuevoDepartamento,
  nuevaArea,
  setNuevaArea,
  sedesList,
  departamentosList,
  areasList,
  handleCrearTicket,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-[92vw] sm:w-full max-w-md p-5 sm:p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <TicketIcon className="w-5 h-5 text-blue-600" /> Crear Nuevo Ticket
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Ingresa los detalles básicos del incidente. La hora de registro es automática.
        </p>

        <form onSubmit={handleCrearTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título del Ticket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              placeholder="Ej: Impresora no conecta, Pantalla azul..."
              className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Sede</label>
              <CustomSelect
                value={nuevaSede}
                onChange={setNuevaSede}
                options={sedesList}
                placeholder="Selecciona sede"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Departamento</label>
              <CustomSelect
                value={nuevoDepartamento}
                onChange={setNuevoDepartamento}
                options={departamentosList}
                placeholder="Selecciona departamento"
              />
            </div>
          </div>

          {areasList.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Área Específica</label>
              <div className="flex flex-wrap gap-2">
                {areasList.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setNuevaArea(area)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      nuevaArea === area
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-center cursor-pointer"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
