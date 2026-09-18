import React from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { Ubicacion } from '@/types';

interface LocationsTabProps {
  ubicaciones: Ubicacion[];
  nuevaSede: string;
  setNuevaSede: (val: string) => void;
  nuevoDepto: string;
  setNuevoDepto: (val: string) => void;
  nuevaArea: string;
  setNuevaArea: (val: string) => void;
  isCreandoNuevaSede: boolean;
  setIsCreandoNuevaSede: (val: boolean) => void;
  nuevaSedeTexto: string;
  setNuevaSedeTexto: (val: string) => void;
  isCreandoNuevoDepto: boolean;
  setIsCreandoNuevoDepto: (val: boolean) => void;
  nuevoDeptoTexto: string;
  setNuevoDeptoTexto: (val: string) => void;
  sedesExistentes: string[];
  departamentosDisponibles: string[];
  handleCrearUbicacion: (e: React.FormEvent) => Promise<void>;
  handleEliminarUbicacion: (id: string) => Promise<void>;
}

export const LocationsTab: React.FC<LocationsTabProps> = ({
  ubicaciones,
  nuevaSede,
  setNuevaSede,
  nuevoDepto,
  setNuevoDepto,
  nuevaArea,
  setNuevaArea,
  isCreandoNuevaSede,
  setIsCreandoNuevaSede,
  nuevaSedeTexto,
  setNuevaSedeTexto,
  isCreandoNuevoDepto,
  setIsCreandoNuevoDepto,
  nuevoDeptoTexto,
  setNuevoDeptoTexto,
  sedesExistentes,
  departamentosDisponibles,
  handleCrearUbicacion,
  handleEliminarUbicacion,
}) => {
  return (
    <div className="p-8 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
        <MapPin className="w-5 h-5 text-purple-600" /> Sedes, Departamentos y Áreas
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Crear */}
        <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-500" /> Nueva Ubicación
          </h4>
          <form onSubmit={handleCrearUbicacion} className="space-y-4">
            {/* 1. SEDE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Sede</label>
                {!isCreandoNuevaSede ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreandoNuevaSede(true);
                      setNuevaSedeTexto('');
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Nueva Sede
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreandoNuevaSede(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Seleccionar existente
                  </button>
                )}
              </div>

              {!isCreandoNuevaSede ? (
                <select
                  value={nuevaSede}
                  onChange={(e) => {
                    if (e.target.value === '__NUEVA__') {
                      setIsCreandoNuevaSede(true);
                      setNuevaSedeTexto('');
                    } else {
                      setNuevaSede(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="">-- Seleccionar Sede existente --</option>
                  {sedesExistentes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__NUEVA__" className="text-purple-600 font-bold">+ Crear Nueva Sede...</option>
                </select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Nombre de la nueva sede (Ej: Sede Sur, Torre 2)..."
                    value={nuevaSedeTexto}
                    onChange={(e) => setNuevaSedeTexto(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border-2 border-purple-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    💡 Al guardar la primera área, esta sede quedará registrada permanentemente en el sistema.
                  </span>
                </div>
              )}
            </div>

            {/* 2. DEPARTAMENTO */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Departamento</label>
                {!isCreandoNuevoDepto ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreandoNuevoDepto(true);
                      setNuevoDeptoTexto('');
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Nuevo Depto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreandoNuevoDepto(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Seleccionar del catálogo
                  </button>
                )}
              </div>

              {!isCreandoNuevoDepto ? (
                <select
                  value={nuevoDepto}
                  onChange={(e) => {
                    if (e.target.value === '__NUEVO__') {
                      setIsCreandoNuevoDepto(true);
                      setNuevoDeptoTexto('');
                    } else {
                      setNuevoDepto(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="">-- Seleccionar Departamento del Catálogo --</option>
                  {departamentosDisponibles.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="__NUEVO__" className="text-purple-600 font-bold">+ Crear Nuevo Departamento...</option>
                </select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Nombre del departamento (Ej: Pediatría, Urgencias)..."
                    value={nuevoDeptoTexto}
                    onChange={(e) => setNuevoDeptoTexto(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border-2 border-purple-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    💡 Se añadirá automáticamente a la lista central de Gestión de Departamentos.
                  </span>
                </div>
              )}
            </div>

            {/* 3. ÁREA ESPECÍFICA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Área Específica / Consultorio / Oficina</label>
              <input
                type="text"
                required
                placeholder="Ej: Consultorio 101, Oficina 502, Triaje..."
                value={nuevaArea}
                onChange={(e) => setNuevaArea(e.target.value)}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Al pulsar "Agregar Ubicación", la sede y departamento se mantienen seleccionados para agregar múltiples áreas rápido.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" /> Agregar Ubicación
            </button>
          </form>
        </div>

        {/* Lista Existente */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs">Sede</th>
                    <th className="px-4 py-3 font-semibold text-xs">Departamento</th>
                    <th className="px-4 py-3 font-semibold text-xs">Área</th>
                    <th className="px-4 py-3 font-semibold text-xs">Registrado por</th>
                    <th className="px-4 py-3 font-semibold text-xs w-20 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ubicaciones.map((ubi) => (
                    <tr key={ubi.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{ubi.sede}</td>
                      <td className="px-4 py-3 text-slate-600">{ubi.departamento}</td>
                      <td className="px-4 py-3 text-slate-600">{ubi.area}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {ubi.creadoPor ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">
                              {ubi.creadoPor.avatar && ubi.creadoPor.avatar.length <= 3
                                ? ubi.creadoPor.avatar
                                : ubi.creadoPor.nombre?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <span className="truncate max-w-[120px]">{ubi.creadoPor.nombre}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sistema</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEliminarUbicacion(ubi.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ubicaciones.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                        No hay ubicaciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
