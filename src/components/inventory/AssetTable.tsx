import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, X, ChevronDown, Check, QrCode, MapPin, User, 
  Wrench, Edit3, Trash2, Package, FileSpreadsheet 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDeviceIcon, getEstadoBadge } from './inventory.utils';
import { exportActivosToCsv } from '@/lib/export-utils';
import { toast } from 'sonner';

interface AssetTableProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterSede: string;
  setFilterSede: (s: string) => void;
  filterEstado: string;
  setFilterEstado: (e: string) => void;
  sedesDisponibles: string[];
  filteredActivos: any[];
  onVerQr: (activo: any) => void;
  onEnviarATaller: (activo: any) => void;
  onMarcarReparado: (activo: any) => void;
  onEditar: (activo: any) => void;
  onEliminar: (id: string, codigo: string) => void;
}

export function AssetTable({
  searchQuery,
  setSearchQuery,
  filterSede,
  setFilterSede,
  filterEstado,
  setFilterEstado,
  sedesDisponibles,
  filteredActivos,
  onVerQr,
  onEnviarATaller,
  onMarcarReparado,
  onEditar,
  onEliminar,
}: AssetTableProps) {
  // Control de Dropdowns Estéticos
  const [openSedeDropdown, setOpenSedeDropdown] = useState(false);
  const [openEstadoDropdown, setOpenEstadoDropdown] = useState(false);
  const sedeRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sedeRef.current && !sedeRef.current.contains(event.target as Node)) {
        setOpenSedeDropdown(false);
      }
      if (estadoRef.current && !estadoRef.current.contains(event.target as Node)) {
        setOpenEstadoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportar = () => {
    try {
      if (filteredActivos.length === 0) {
        toast.error('No hay equipos para exportar con los filtros actuales');
        return;
      }
      const sedeLabel = filterSede === 'TODAS' ? 'todas' : filterSede.toLowerCase().replace(/\s+/g, '-');
      const estadoLabel = filterEstado === 'TODOS' ? 'todos' : filterEstado.toLowerCase();
      exportActivosToCsv(filteredActivos, `inventario_${sedeLabel}_${estadoLabel}`);
      toast.success(`Se exportaron ${filteredActivos.length} equipos a Excel exitosamente`);
    } catch (err: any) {
      toast.error(err?.message || 'Error al exportar inventario');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-visible flex flex-col space-y-4 p-4 md:p-6 animate-in fade-in">
      {/* Barra de Búsqueda y Filtros Integrada */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-30">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, tipo, modelo, sede..."
            className="w-full pl-9.5 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Dropdowns en Grid de 2 Columnas para Móvil */}
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
            {/* Dropdown Estético: Sede */}
            <div ref={sedeRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenSedeDropdown(prev => !prev);
                  setOpenEstadoDropdown(false);
                }}
                className={cn(
                  "w-full sm:w-auto px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between gap-2 border transition-all cursor-pointer shadow-2xs",
                  filterSede !== 'TODAS'
                    ? "bg-indigo-50/70 border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                    : "bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
                )}
              >
                <span className="truncate">
                  {filterSede === 'TODAS' ? 'Todas las Sedes' : filterSede}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", openSedeDropdown && "rotate-180 text-indigo-600")} />
              </button>

              {openSedeDropdown && (
                <div className="absolute left-0 top-full mt-1.5 min-w-[170px] max-w-[240px] w-auto max-h-60 overflow-y-auto custom-scrollbar bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSede('TODAS');
                      setOpenSedeDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer",
                      filterSede === 'TODAS'
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>Todas las Sedes</span>
                    {filterSede === 'TODAS' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  {sedesDisponibles.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setFilterSede(s);
                        setOpenSedeDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer",
                        filterSede === s
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <span className="truncate">{s}</span>
                      {filterSede === s && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Estético: Estado */}
            <div ref={estadoRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenEstadoDropdown(prev => !prev);
                  setOpenSedeDropdown(false);
                }}
                className={cn(
                  "w-full sm:w-auto px-3 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center justify-between gap-2 border transition-all cursor-pointer shadow-2xs",
                  filterEstado !== 'TODOS'
                    ? "bg-indigo-50/70 border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                    : "bg-white hover:bg-slate-50 border-slate-300 text-slate-800"
                )}
              >
                <span className="truncate">
                  {filterEstado === 'TODOS' && 'Todos los Estados'}
                  {filterEstado === 'OPERATIVO' && '🟢 Operativos'}
                  {filterEstado === 'REPARACION' && '🟡 En Taller'}
                  {filterEstado === 'BAJA' && '🔴 Bajas'}
                  {filterEstado === 'RESCATADO' && '♻️ Rescatados'}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", openEstadoDropdown && "rotate-180 text-indigo-600")} />
              </button>

              {openEstadoDropdown && (
                <div className="absolute right-0 top-full mt-1.5 min-w-[180px] max-w-[240px] w-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  {[
                    { id: 'TODOS', label: 'Todos los Estados' },
                    { id: 'OPERATIVO', label: '🟢 Solo Operativos' },
                    { id: 'REPARACION', label: '🟡 En Taller' },
                    { id: 'BAJA', label: '🔴 Chatarra / Baja' },
                    { id: 'RESCATADO', label: '♻️ Rescatados' },
                  ].map((opt, idx) => (
                    <div key={opt.id}>
                      {idx === 1 && <div className="h-px bg-slate-100 my-1" />}
                      <button
                        type="button"
                        onClick={() => {
                          setFilterEstado(opt.id);
                          setOpenEstadoDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer",
                          filterEstado === opt.id
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {filterEstado === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botón Exportar CSV / Excel */}
          <button
            type="button"
            onClick={handleExportar}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 bg-white hover:bg-emerald-50/60 border border-slate-300 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 shadow-2xs hover:shadow transition-all cursor-pointer active:scale-95 shrink-0"
            title="Exportar equipos filtrados a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Tabla de Equipos */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Código & QR</th>
              <th className="py-3 px-4">Tipo & Modelo</th>
              <th className="py-3 px-4">Ubicación</th>
              <th className="py-3 px-4">Responsable</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Observaciones</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredActivos.map(activo => {
              const isReparacion = activo.estado === 'REPARACION';
              const isOperativo = activo.estado === 'OPERATIVO' || !activo.estado;

              return (
                <tr key={activo.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Código */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-xs border border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-700 transition-colors">
                        {activo.codigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => onVerQr(activo)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Imprimir Código QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Tipo & Modelo */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {getDeviceIcon(activo.tipo)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{activo.tipo}</p>
                        <p className="text-[11px] text-slate-500 font-normal">
                          {activo.modelo || 'Modelo no especificado'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Ubicación */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>{activo.sede || 'Sin sede'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activo.departamento || 'General'}
                        {activo.ubicacion ? ` · ${activo.ubicacion}` : ''}
                      </p>
                    </div>
                  </td>

                  {/* Responsable */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {activo.responsable ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[130px]">{activo.responsable}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Sin asignar</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    {getEstadoBadge(activo.estado)}
                  </td>

                  {/* Observaciones */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <p className="text-slate-500 text-xs truncate" title={activo.observaciones || ''}>
                      {activo.observaciones || <span className="text-slate-400 italic">-</span>}
                    </p>
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isOperativo && (
                        <button
                          type="button"
                          onClick={() => onEnviarATaller(activo)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="Enviar a taller por desperfecto"
                        >
                          <Wrench className="w-3 h-3 text-amber-600" />
                          <span>Taller</span>
                        </button>
                      )}

                      {isReparacion && (
                        <button
                          type="button"
                          onClick={() => onMarcarReparado(activo)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="Marcar reparado y devolver a operativo (+250 XP)"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Listo (+250 XP)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEditar(activo)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar equipo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEliminar(activo.id, activo.codigo)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredActivos.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">No se encontraron equipos</p>
            <p className="text-xs text-slate-400">
              {searchQuery || filterSede !== 'TODAS' || filterEstado !== 'TODOS'
                ? 'No hay resultados que coincidan con los filtros aplicados.'
                : 'Aún no has registrado ningún equipo. Haz clic en "+ Registrar Equipo".'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
