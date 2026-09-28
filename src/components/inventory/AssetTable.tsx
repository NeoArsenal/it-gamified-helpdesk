import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, X, ChevronDown, Check, QrCode, MapPin, User, 
  Wrench, Edit3, Trash2, Package, FileSpreadsheet, Clock, UserPlus,
  AlertTriangle, FileText, ChevronRight
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
  onAsignar?: (activo: any) => void;
  onCambiarEstado?: (activo: any) => void;
  onVerTimeline?: (activo: any) => void;
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
  onAsignar,
  onCambiarEstado,
  onVerTimeline,
}: AssetTableProps) {
  // Control de Dropdowns Estéticos
  const [openSedeDropdown, setOpenSedeDropdown] = useState(false);
  const [openEstadoDropdown, setOpenEstadoDropdown] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const sedeRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedAssetId(prev => (prev === id ? null : id));
  };

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
    <div className="bg-transparent md:bg-white rounded-2xl md:border md:border-slate-200/90 md:shadow-sm overflow-visible flex flex-col space-y-4 p-0 md:p-6 animate-in fade-in">
      {/* Barra de Búsqueda y Filtros Integrada (Solo Desktop) */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, S/N, marca, modelo, sede..."
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

      {/* 1. VISTA DESKTOP: Tabla Completa Tradicional (Solo en pantallas medianas y grandes) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Código & S/N</th>
              <th className="py-3 px-4">Tipo, Marca & Modelo</th>
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
                  {/* Código & S/N */}
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
                    {activo.numeroSerie && (
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1 font-medium">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">S/N</span>
                        <span className="truncate max-w-[120px]">{activo.numeroSerie}</span>
                      </div>
                    )}
                    {activo.codigoFactura && (
                      <div className="text-[10px] text-indigo-700 font-mono mt-0.5 flex items-center gap-1 font-semibold">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-600 font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">FAC</span>
                        <span className="truncate max-w-[120px]">{activo.codigoFactura}</span>
                      </div>
                    )}
                  </td>

                  {/* Tipo, Marca & Modelo */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {getDeviceIcon(activo.tipo)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{activo.tipo}</p>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {activo.marca ? `${activo.marca} ${activo.modelo || ''}`.trim() : (activo.modelo || 'Modelo no especificado')}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Ubicación */}
                  <td className="py-3.5 px-4">
                    {activo.sede ? (
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{activo.sede}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {activo.departamento || 'General'}
                          {activo.ubicacion ? ` · ${activo.ubicacion}` : ''}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold text-amber-700 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>En Almacén TI</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sin asignar a sede</p>
                      </div>
                    )}
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
                      {/* Botón Asignar / Reasignar */}
                      {onAsignar && (
                        <button
                          type="button"
                          onClick={() => onAsignar(activo)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title={activo.sede ? "Reasignar de sede / responsable" : "Asignar a Sede y Responsable"}
                        >
                          <UserPlus className="w-3 h-3 text-indigo-600" />
                          <span>{activo.sede ? "Reasignar" : "Asignar"}</span>
                        </button>
                      )}

                      {/* Botón Reportar Falla o Cambiar Estado */}
                      {onCambiarEstado && (
                        <button
                          type="button"
                          onClick={() => onCambiarEstado(activo)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="Reportar falla o cambiar estado"
                        >
                          <Wrench className="w-3 h-3 text-amber-600" />
                          <span>Falla / Taller</span>
                        </button>
                      )}

                      {/* Botón Trazabilidad AliExpress Timeline */}
                      {onVerTimeline && (
                        <button
                          type="button"
                          onClick={() => onVerTimeline(activo)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver Trazabilidad Completa (Historial)"
                        >
                          <Clock className="w-4 h-4 text-indigo-500" />
                        </button>
                      )}

                      {isReparacion && (
                        <button
                          type="button"
                          onClick={() => onMarcarReparado(activo)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="Marcar reparado y devolver a operativo"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Listo</span>
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
      </div>

      {/* 2. VISTA MÓVIL: Tarjetas Colapsables y Nítidas (Vista compacta + expandible al tocar) */}
      <div className="block md:hidden space-y-3">
        {filteredActivos.map(activo => {
          const isReparacion = activo.estado === 'REPARACION';
          const isBaja = activo.estado === 'BAJA';
          const isExpanded = expandedAssetId === activo.id;

          // Separar prefijo y número del código (ej. ACT- / 5351) para estilo estilizado
          const codeParts = activo.codigo ? activo.codigo.split('-') : ['ACT', '0000'];
          const codePrefix = codeParts.length > 1 ? `${codeParts[0]}-` : '';
          const codeNum = codeParts.length > 1 ? codeParts.slice(1).join('-') : activo.codigo;

          return (
            <div 
              key={activo.id} 
              className={cn(
                "bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden",
                isExpanded 
                  ? "border-indigo-300 ring-2 ring-indigo-500/15 shadow-sm" 
                  : "border-slate-200/90 hover:border-slate-300"
              )}
            >
              {/* Cabecera / Área táctil que expande/colapsa */}
              <div 
                onClick={() => toggleExpand(activo.id)}
                className="p-3.5 cursor-pointer select-none transition-colors active:bg-slate-50/70"
              >
                {/* 1. Fila Superior: Icono de Dispositivo + Badge de Código + S/N + Badge de Estado */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50/70 border border-indigo-100/70 flex items-center justify-center shrink-0">
                      {getDeviceIcon(activo.tipo)}
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-indigo-50/90 text-indigo-950 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-indigo-100 flex flex-col items-center justify-center shrink-0 leading-tight">
                        <span className="text-[10px] text-indigo-600 font-extrabold">{codePrefix}</span>
                        <span className="text-xs text-indigo-950 font-black">{codeNum}</span>
                      </div>

                      {activo.numeroSerie && (
                        <div className="min-w-0 flex flex-col justify-center leading-tight">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">S/N:</span>
                          <span className="font-mono text-xs font-semibold text-slate-600 truncate max-w-[110px]">
                            {activo.numeroSerie}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getEstadoBadge(activo.estado)}
                  </div>
                </div>

                {/* 2. Fila Título: Marca, Modelo, Tipo de Equipo y Flecha Expandir */}
                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                      {activo.marca ? `${activo.marca} ${activo.modelo || ''}`.trim() : (activo.modelo || activo.tipo)}
                      <span className="font-normal text-slate-500 text-xs ml-1.5">
                        ({activo.tipo})
                      </span>
                    </h3>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
                    isExpanded && "rotate-90 text-indigo-600"
                  )} />
                </div>

                {/* 3. Fila Ubicación y Custodio (Resumen Limpio) */}
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {activo.sede ? (
                        <>
                          <span className="font-semibold text-slate-800">{activo.sede}</span> · {activo.departamento || 'General'}
                          {activo.ubicacion && <span className="text-slate-500 ml-1">· {activo.ubicacion}</span>}
                        </>
                      ) : (
                        <span className="text-amber-700 font-medium">Almacén Central TI (Sin asignar)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <span className="text-slate-500">Custodio:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        {activo.responsable || <span className="text-slate-400 font-normal italic">Sin custodio asignado</span>}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 4. Vista Previa de Motivo/Alerta (Si está colapsado y tiene observación) */}
                {!isExpanded && activo.observaciones && (
                  <div className={cn(
                    "mt-2.5 px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 truncate",
                    isBaja 
                      ? "bg-rose-50/90 border-rose-200/80 text-rose-800" 
                      : isReparacion 
                      ? "bg-amber-50/90 border-amber-200/80 text-amber-800" 
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  )}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="font-bold text-[11px] shrink-0">
                      {isBaja ? 'Motivo:' : isReparacion ? 'Taller:' : 'Nota:'}
                    </span>
                    <span className="truncate font-medium text-[11px]">
                      {activo.observaciones}
                    </span>
                  </div>
                )}
              </div>

              {/* 5. DETALLE EXPANDIDO COMPLETO (Se revela al tocar la tarjeta) */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-200">
                  
                  {/* Factura / Guía si existe */}
                  {activo.codigoFactura && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="font-semibold text-slate-500">Factura / Guía:</span>
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {activo.codigoFactura}
                      </span>
                    </div>
                  )}

                  {/* Caja Completa de Motivo / Diagnóstico */}
                  {activo.observaciones && (
                    <div className={cn(
                      "p-3 rounded-xl border text-xs flex items-start gap-2.5 shadow-2xs",
                      isBaja
                        ? "bg-rose-50/90 border-rose-200 text-rose-950"
                        : isReparacion
                        ? "bg-amber-50/90 border-amber-200 text-amber-950"
                        : "bg-white border-slate-200 text-slate-800"
                    )}>
                      {isBaja ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : isReparacion ? (
                        <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                          {isBaja ? 'Motivo de baja' : isReparacion ? 'Diagnóstico de taller' : 'Observaciones'}
                        </span>
                        <p className="font-medium mt-1 leading-relaxed break-words text-xs">
                          {activo.observaciones}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botonera Completa de Acciones */}
                  <div className="space-y-2 pt-1">
                    {/* Fila 1: Asignar/Reasignar + Estado/Falla (+ Listo si está en taller) */}
                    <div className="flex items-center gap-2">
                      {onAsignar && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAsignar(activo);
                          }}
                          className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{activo.sede ? "Reasignar" : "Asignar"}</span>
                        </button>
                      )}

                      {onCambiarEstado && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCambiarEstado(activo);
                          }}
                          className={cn(
                            "flex-1 py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs",
                            isReparacion
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          <Wrench className="w-3.5 h-3.5 shrink-0" />
                          <span>{isReparacion ? "Estado / Taller" : "Estado / Falla"}</span>
                        </button>
                      )}

                      {isReparacion && onMarcarReparado && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarcarReparado(activo);
                          }}
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Listo</span>
                        </button>
                      )}
                    </div>

                    {/* Fila 2: Historial, QR, Editar, Eliminar */}
                    <div className="flex items-center gap-1.5">
                      {onVerTimeline && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerTimeline(activo);
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                          title="Ver Trazabilidad"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Historial</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerQr(activo);
                        }}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                        title="Código QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditar(activo);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                        title="Editar equipo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminar(activo.id, activo.codigo);
                        }}
                        className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado Vacío */}
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
  );
}
