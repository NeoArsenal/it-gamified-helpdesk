import { useState, useEffect, useMemo } from 'react';
import { 
  Package, Wrench, Trash2, Recycle, Plus, QrCode, Printer, X, 
  Search, Laptop, Monitor, Printer as PrinterIcon, Cpu, 
  HardDrive, Network, MapPin, User, Building2, CheckCircle2, 
  ChevronDown, Zap, ShieldCheck, Edit3, Check, Smartphone, 
  Layers, ArrowUpRight, Sparkles
} from 'lucide-react';
import { 
  getActivos, crearActivo, updateActivo, eliminarActivo, 
  getCatalogos, getUbicacionesSedes, getUbicacionesDepartamentos, 
  getUbicacionesAreas 
} from '@/services/api/api-client';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface InventoryViewProps {
  userId?: string;
  onActivoRescatado?: () => void;
}

export function InventoryView({ userId, onActivoRescatado }: InventoryViewProps) {
  const [activos, setActivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pestaña activa: 'CATALOGO' o 'TALLER'
  const [activeTab, setActiveTab] = useState<'CATALOGO' | 'TALLER'>('CATALOGO');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivo, setEditingActivo] = useState<any | null>(null);
  const [qrModalActivo, setQrModalActivo] = useState<any | null>(null);
  const [isRescatando, setIsRescatando] = useState<string | null>(null);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  // Estados del Formulario (Crear / Editar)
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('PC');
  const [modelo, setModelo] = useState('');
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estado, setEstado] = useState('OPERATIVO');
  const [observaciones, setObservaciones] = useState('');

  // Catálogos dinámicos
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([
    'PC', 'Laptop', 'Impresora', 'Monitor', 'Servidor', 'Switch / Router', 'POS', 'Otro'
  ]);
  const [sedesList, setSedesList] = useState<string[]>([]);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);

  const fetchActivos = async () => {
    try {
      const data = await getActivos();
      setActivos(data);
    } catch (err) {
      console.error('Error fetching activos:', err);
      toast.error('No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();

    getCatalogos().then(data => {
      if (data.categoriasActivos && data.categoriasActivos.length > 0) {
        setTiposDisponibles(data.categoriasActivos);
      }
    }).catch(console.error);

    getUbicacionesSedes().then(data => {
      setSedesList(data);
      if (data.length > 0 && !sede) setSede(data[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede).then(data => {
        setDepartamentosList(data);
        if (data.length > 0 && !departamento) setDepartamento(data[0]);
      }).catch(console.error);
    }
  }, [sede]);

  useEffect(() => {
    if (sede && departamento) {
      getUbicacionesAreas(sede, departamento).then(data => {
        setAreasList(data);
        if (data.length > 0 && !ubicacion) setUbicacion(data[0]);
      }).catch(console.error);
    } else {
      setAreasList([]);
    }
  }, [sede, departamento]);

  const sedesDisponibles = useMemo(() => {
    return Array.from(new Set([...sedesList, ...activos.map(a => a.sede).filter(Boolean)])).sort();
  }, [sedesList, activos]);

  // Métricas
  const totalActivos = activos.length;
  const countOperativos = activos.filter(a => a.estado === 'OPERATIVO' || !a.estado).length;
  const countReparacion = activos.filter(a => a.estado === 'REPARACION').length;
  const countBaja = activos.filter(a => a.estado === 'BAJA').length;
  const countRescatados = activos.filter(a => a.estado === 'RESCATADO').length;
  const pctOperatividad = totalActivos > 0 ? Math.round((countOperativos / totalActivos) * 100) : 100;

  // Manejo Formulario
  const handleAbrirCrear = () => {
    setEditingActivo(null);
    setCodigo('');
    setTipo(tiposDisponibles[0] || 'PC');
    setModelo('');
    setSede(sedesList[0] || '');
    setDepartamento('');
    setUbicacion('');
    setResponsable('');
    setEstado('OPERATIVO');
    setObservaciones('');
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (activo: any) => {
    setEditingActivo(activo);
    setCodigo(activo.codigo || '');
    setTipo(activo.tipo || 'PC');
    setModelo(activo.modelo || '');
    setSede(activo.sede || '');
    setDepartamento(activo.departamento || '');
    setUbicacion(activo.ubicacion || '');
    setResponsable(activo.responsable || '');
    setEstado(activo.estado || 'OPERATIVO');
    setObservaciones(activo.observaciones || '');
    setIsModalOpen(true);
  };

  const handleGuardarActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        codigo: codigo.trim().toUpperCase(),
        tipo,
        modelo: modelo.trim(),
        sede,
        departamento,
        ubicacion,
        responsable: responsable.trim(),
        estado,
        observaciones: observaciones.trim(),
      };

      if (editingActivo) {
        await updateActivo(editingActivo.id, payload);
        toast.success('Equipo actualizado exitosamente');
      } else {
        await crearActivo(payload);
        toast.success('Nuevo equipo registrado');
      }

      setIsModalOpen(false);
      fetchActivos();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar el equipo');
    }
  };

  const handleEliminar = async (id: string, codigoEquipo: string) => {
    if (confirm(`¿Eliminar el equipo "${codigoEquipo}" del inventario?`)) {
      try {
        await eliminarActivo(id);
        toast.success(`Equipo ${codigoEquipo} eliminado`);
        fetchActivos();
      } catch (err) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEnviarATaller = async (activo: any) => {
    const motivo = prompt(`¿Qué falla presenta el equipo ${activo.codigo}?`, 'Equipo no enciende / Revisión técnica');
    if (motivo === null) return;

    try {
      await updateActivo(activo.id, {
        estado: 'REPARACION',
        observaciones: motivo ? `${motivo} (Ingresado a taller: ${new Date().toLocaleDateString()})` : activo.observaciones,
      });
      toast.warning(`Equipo ${activo.codigo} enviado al Taller`);
      fetchActivos();
    } catch (err) {
      toast.error('No se pudo enviar al taller');
    }
  };

  const handleMarcarReparado = async (activo: any) => {
    try {
      await updateActivo(activo.id, {
        estado: 'OPERATIVO',
        tecnicoId: userId,
        observaciones: `Reparado con éxito: ${new Date().toLocaleDateString()}`,
      });
      toast.success(`¡Equipo ${activo.codigo} reparado y operativo! (+250 XP)`);
      fetchActivos();
    } catch (err) {
      toast.error('Error al marcar reparado');
    }
  };

  const handleDeclararChatarra = async (activo: any) => {
    if (!confirm(`¿Declarar el equipo ${activo.codigo} como Chatarra / Baja definitiva?`)) return;
    try {
      await updateActivo(activo.id, {
        estado: 'BAJA',
        observaciones: `Declarado en baja: ${new Date().toLocaleDateString()}`,
      });
      toast.info(`Equipo ${activo.codigo} trasladado a Chatarra`);
      fetchActivos();
    } catch (err) {
      toast.error('Error al cambiar a baja');
    }
  };

  const handleRescatar = async (id: string, cod: string) => {
    setIsRescatando(id);
    setTimeout(async () => {
      try {
        await updateActivo(id, { estado: 'RESCATADO', tecnicoId: userId });
        if (onActivoRescatado) onActivoRescatado();
        toast.success(`¡Piezas del equipo ${cod} rescatadas! (+1000 XP)`);
        fetchActivos();
      } catch (err) {
        toast.error('Error al rescatar');
      } finally {
        setIsRescatando(null);
      }
    }, 1200);
  };

  // Filtrado
  const q = searchQuery.toLowerCase().trim();
  const filteredActivos = activos.filter(a => {
    if (q) {
      const mCod = a.codigo?.toLowerCase().includes(q);
      const mTipo = a.tipo?.toLowerCase().includes(q);
      const mMod = a.modelo?.toLowerCase().includes(q);
      const mSede = a.sede?.toLowerCase().includes(q);
      const mDept = a.departamento?.toLowerCase().includes(q);
      const mResp = a.responsable?.toLowerCase().includes(q);
      if (!Boolean(mCod || mTipo || mMod || mSede || mDept || mResp)) return false;
    }

    if (filterSede !== 'TODAS') {
      if (a.sede?.toLowerCase().trim() !== filterSede.toLowerCase().trim()) return false;
    }

    if (filterEstado !== 'TODOS') {
      if (filterEstado === 'OPERATIVO') {
        if (a.estado !== 'OPERATIVO' && Boolean(a.estado)) return false;
      } else if (a.estado !== filterEstado) {
        return false;
      }
    }

    return true;
  });

  const getDeviceIcon = (tipoEquipo: string) => {
    const t = (tipoEquipo || '').toLowerCase();
    if (t.includes('laptop') || t.includes('portátil')) return <Laptop className="w-4 h-4 text-indigo-500" />;
    if (t.includes('impresora') || t.includes('térmica')) return <PrinterIcon className="w-4 h-4 text-emerald-500" />;
    if (t.includes('monitor') || t.includes('pantalla')) return <Monitor className="w-4 h-4 text-blue-500" />;
    if (t.includes('switch') || t.includes('router') || t.includes('red')) return <Network className="w-4 h-4 text-purple-500" />;
    if (t.includes('servidor')) return <HardDrive className="w-4 h-4 text-amber-500" />;
    if (t.includes('pos') || t.includes('celular')) return <Smartphone className="w-4 h-4 text-teal-500" />;
    return <Cpu className="w-4 h-4 text-slate-500" />;
  };

  const getEstadoBadge = (est: string) => {
    switch (est) {
      case 'REPARACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            En Taller
          </span>
        );
      case 'BAJA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Chatarra / Baja
          </span>
        );
      case 'RESCATADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Rescatado
          </span>
        );
      case 'OPERATIVO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Operativo
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto">
      
      {/* 1. Cabecera Limpia y Armoniosa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                Inventario de Equipos
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                Gestión patrimonial de hardware y taller técnico de recuperación.
              </p>
            </div>
          </div>

          {/* Métricas Minimalistas en Línea */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200/80">
              <Cpu className="w-3.5 h-3.5 text-slate-500" /> Total: {totalActivos}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {countOperativos} Operativos ({pctOperatividad}%)
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${
              countReparacion > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <Wrench className="w-3.5 h-3.5" /> {countReparacion} en Taller
            </span>
            {countBaja > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                <Trash2 className="w-3.5 h-3.5" /> {countBaja} Bajas
              </span>
            )}
            {countRescatados > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                <Recycle className="w-3.5 h-3.5" /> {countRescatados} Rescatados
              </span>
            )}
          </div>
        </div>

        {/* Selector de Pestañas y Botón Primario */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented Control / Tabs */}
          <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('CATALOGO')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'CATALOGO'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Todos los Equipos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'CATALOGO' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'}`}>
                {totalActivos}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TALLER')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'TALLER'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Taller y Bajas</span>
              {(countReparacion + countBaja + countRescatados) > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                  countReparacion > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {countReparacion + countBaja + countRescatados}
                </span>
              )}
            </button>
          </div>

          <button 
            type="button"
            onClick={handleAbrirCrear}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Equipo
          </button>
        </div>
      </div>

      {/* 2. VISTA A: Catálogo Maestro de Equipos (Limpia y Espaciosa) */}
      {activeTab === 'CATALOGO' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col space-y-4 p-4 md:p-6 animate-in fade-in">
          
          {/* Barra de Búsqueda y Filtros Integrada */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={filterSede}
                onChange={e => setFilterSede(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 sm:flex-none"
              >
                <option value="TODAS">Todas las Sedes</option>
                {sedesDisponibles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 sm:flex-none"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="OPERATIVO">🟢 Solo Operativos</option>
                <option value="REPARACION">🟡 En Taller</option>
                <option value="BAJA">🔴 Chatarra / Baja</option>
                <option value="RESCATADO">♻️ Rescatados</option>
              </select>
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
                            onClick={() => setQrModalActivo(activo)}
                            className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors"
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
                              onClick={() => handleEnviarATaller(activo)}
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
                              onClick={() => handleMarcarReparado(activo)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                              title="Marcar reparado y devolver a operativo (+250 XP)"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Listo (+250 XP)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(activo)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar equipo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminar(activo.id, activo.codigo)}
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
      )}

      {/* 3. VISTA B: Taller de Hardware y Bajas (Mismo estilo claro y limpio que el Kanban de Tickets) */}
      {activeTab === 'TALLER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in">
          
          {/* Caja 1: En Reparación */}
          <div className="bg-amber-50/40 rounded-2xl border border-amber-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
            <div className="p-4 border-b border-amber-200/60 bg-amber-100/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">En Reparación</h3>
                  <p className="text-[10px] text-slate-400">Equipos en diagnóstico y mantenimiento</p>
                </div>
              </div>
              <span className="bg-amber-200/70 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {activos.filter(a => a.estado === 'REPARACION').length}
              </span>
            </div>

            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
              {activos.filter(a => a.estado === 'REPARACION').map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                        {getDeviceIcon(a.tipo)}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {a.codigo}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQrModalActivo(a)}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                      title="Ver QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {a.observaciones || 'Falla reportada sin detalle.'}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{a.sede || 'Sin sede'} {a.departamento ? `- ${a.departamento}` : ''}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleMarcarReparado(a)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Reparado (+250 XP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclararChatarra(a)}
                      className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Declarar Chatarra / Baja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {activos.filter(a => a.estado === 'REPARACION').length === 0 && (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-amber-200/80 rounded-xl bg-white/50">
                  <CheckCircle2 className="w-8 h-8 text-amber-500/80 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">¡Taller al día!</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                    No hay equipos averiados esperando reparación.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Caja 2: Chatarra / Baja */}
          <div className="bg-rose-50/40 rounded-2xl border border-rose-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
            <div className="p-4 border-b border-rose-200/60 bg-rose-100/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Chatarra / Bajas</h3>
                  <p className="text-[10px] text-slate-400">Equipos dados de baja para rescate</p>
                </div>
              </div>
              <span className="bg-rose-200/70 text-rose-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {activos.filter(a => a.estado === 'BAJA').length}
              </span>
            </div>

            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
              {activos.filter(a => a.estado === 'BAJA').map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group relative overflow-hidden">
                  {isRescatando === a.id && (
                    <div className="absolute inset-0 bg-emerald-50/90 z-20 flex flex-col items-center justify-center animate-pulse">
                      <Recycle className="w-8 h-8 text-emerald-600 animate-spin" />
                      <span className="text-emerald-700 text-xs font-black mt-1">+1000 XP RESCATADO</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                        {getDeviceIcon(a.tipo)}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {a.codigo}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminar(a.id, a.codigo)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {a.observaciones || 'Equipo irreparable o de baja patrimonial.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRescatar(a.id, a.codigo)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all group cursor-pointer"
                  >
                    <Recycle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-emerald-600" />
                    Rescatar Piezas (+1000 XP)
                  </button>
                </div>
              ))}

              {activos.filter(a => a.estado === 'BAJA').length === 0 && (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-rose-200/80 rounded-xl bg-white/50">
                  <Trash2 className="w-8 h-8 text-rose-400/80 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">Sin equipos en baja</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                    Los equipos declarados chatarra aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Caja 3: Piezas Rescatadas */}
          <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/70 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
            <div className="p-4 border-b border-emerald-200/60 bg-emerald-100/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                  <Recycle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Piezas Rescatadas</h3>
                  <p className="text-[10px] text-slate-400">Repuestos útiles reciclados</p>
                </div>
              </div>
              <span className="bg-emerald-200/70 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {activos.filter(a => a.estado === 'RESCATADO').length}
              </span>
            </div>

            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
              {activos.filter(a => a.estado === 'RESCATADO').map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                        <Recycle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {a.codigo}
                        </span>
                        <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{a.tipo} · Componentes Salvados</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      +1000 XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {a.observaciones || 'Piezas en inventario para repuesto.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleMarcarReparado(a)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reintegrar a Operativos
                  </button>
                </div>
              ))}

              {activos.filter(a => a.estado === 'RESCATADO').length === 0 && (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-emerald-200/80 rounded-xl bg-white/50">
                  <Recycle className="w-8 h-8 text-emerald-500/80 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">Sin piezas rescatadas</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                    Canibaliza hardware útil de la chatarra para sumar puntos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Crear / Editar Equipo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
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
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarActivo} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              
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
                  onClick={() => setIsModalOpen(false)}
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
      )}

      {/* 5. Modal de Etiqueta QR Imprimible */}
      {qrModalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:p-0">
          <div 
            className="fixed inset-0 print:hidden"
            onClick={() => setQrModalActivo(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:w-full print:max-w-none">
            
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print print:hidden">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" /> Etiqueta QR Patrimonial
              </h3>
              <button 
                type="button"
                onClick={() => setQrModalActivo(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-white text-center print:p-0">
              <div className="border-2 border-dashed border-slate-300 p-5 rounded-2xl flex flex-col items-center gap-3 bg-white w-full print:border-solid print:border-black">
                <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> SOPORTE TI · CONTROL PATRIMONIAL
                </div>

                <h4 className="text-2xl font-black text-slate-900 tracking-widest font-mono">
                  {qrModalActivo.codigo}
                </h4>

                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <QRCodeSVG
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/activo/${qrModalActivo.id}`}
                    size={170}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="w-full text-center border-t border-slate-200 pt-2 text-xs space-y-0.5">
                  <p className="font-bold text-slate-800">{qrModalActivo.tipo} {qrModalActivo.modelo ? `· ${qrModalActivo.modelo}` : ''}</p>
                  <p className="text-slate-500 font-medium">{qrModalActivo.sede || 'Sede General'} {qrModalActivo.departamento ? `- ${qrModalActivo.departamento}` : ''}</p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {qrModalActivo.id?.substring(0, 8)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 no-print print:hidden">
              <button
                type="button"
                onClick={() => setQrModalActivo(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
