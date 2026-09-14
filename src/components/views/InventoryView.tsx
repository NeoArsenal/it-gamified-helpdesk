import { useState, useEffect, useMemo } from 'react';
import { 
  Package, Wrench, Trash2, Recycle, Plus, QrCode, Printer, X, 
  Search, Filter, Laptop, Monitor, Printer as PrinterIcon, Cpu, 
  HardDrive, Network, MapPin, User, Building2, CheckCircle2, 
  AlertTriangle, ChevronDown, RefreshCw, Zap, ShieldCheck, 
  Edit3, ArrowRight, Eye, ChevronUp, Check, AlertCircle, Smartphone
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
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivo, setEditingActivo] = useState<any | null>(null);
  const [qrModalActivo, setQrModalActivo] = useState<any | null>(null);
  const [isRescatando, setIsRescatando] = useState<string | null>(null);

  // Filtros y búsqueda para la tabla principal
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  // Control de colapso del Taller
  const [isWorkshopExpanded, setIsWorkshopExpanded] = useState(true);

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

    // Cargar catálogos
    getCatalogos().then(data => {
      if (data.categoriasActivos && data.categoriasActivos.length > 0) {
        setTiposDisponibles(data.categoriasActivos);
      }
    }).catch(console.error);

    // Cargar sedes de la BD
    getUbicacionesSedes().then(data => {
      setSedesList(data);
      if (data.length > 0 && !sede) setSede(data[0]);
    }).catch(console.error);
  }, []);

  // Cargar departamentos al cambiar de sede en el formulario
  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede).then(data => {
        setDepartamentosList(data);
        if (data.length > 0 && !departamento) setDepartamento(data[0]);
      }).catch(console.error);
    }
  }, [sede]);

  // Cargar áreas al cambiar de departamento en el formulario
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

  // Lista unificada de sedes disponibles entre BD y activos
  const sedesDisponibles = useMemo(() => {
    return Array.from(new Set([...sedesList, ...activos.map(a => a.sede).filter(Boolean)])).sort();
  }, [sedesList, activos]);

  // Manejo de Crear o Editar
  const handleAbrirCrear = () => {
    setEditingActivo(null);
    setCodigo(`ACT-${Math.floor(1000 + Math.random() * 9000)}`);
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
        toast.success('Nuevo equipo registrado en el inventario');
      }

      setIsModalOpen(false);
      fetchActivos();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error al guardar el equipo');
    }
  };

  const handleEliminar = async (id: string, codigoEquipo: string) => {
    if (confirm(`¿Estás seguro de eliminar el equipo "${codigoEquipo}" del inventario?`)) {
      try {
        await eliminarActivo(id);
        toast.success(`Equipo ${codigoEquipo} eliminado`);
        fetchActivos();
      } catch (err) {
        toast.error('Error al eliminar el equipo');
      }
    }
  };

  // Enviar a taller de reparación (cuando se malogra)
  const handleEnviarATaller = async (activo: any) => {
    const motivo = prompt(`¿Qué falla presenta el equipo ${activo.codigo}?`, 'Equipo no enciende / Requiere mantenimiento correctivo');
    if (motivo === null) return;

    try {
      await updateActivo(activo.id, {
        estado: 'REPARACION',
        observaciones: motivo ? `${motivo} (Ingresado a taller: ${new Date().toLocaleDateString()})` : activo.observaciones,
      });
      toast.warning(`Equipo ${activo.codigo} enviado al Taller de Reparación`);
      setIsWorkshopExpanded(true);
      fetchActivos();
    } catch (err) {
      toast.error('No se pudo enviar el equipo al taller');
    }
  };

  // Marcar como reparado (vuelve a estar operativo con +250 XP)
  const handleMarcarReparado = async (activo: any) => {
    try {
      await updateActivo(activo.id, {
        estado: 'OPERATIVO',
        tecnicoId: userId,
        observaciones: `Reparado con éxito: ${new Date().toLocaleDateString()}`,
      });
      toast.success(`¡Equipo ${activo.codigo} reparado y operativo! (+250 XP)`, {
        icon: '🛠️',
      });
      fetchActivos();
    } catch (err) {
      toast.error('Error al marcar equipo como reparado');
    }
  };

  // Enviar a Chatarra / Baja
  const handleDeclararChatarra = async (activo: any) => {
    if (!confirm(`¿Declarar el equipo ${activo.codigo} como Chatarra / Baja definitiva?`)) return;
    try {
      await updateActivo(activo.id, {
        estado: 'BAJA',
        observaciones: `Declarado en baja definitiva: ${new Date().toLocaleDateString()}`,
      });
      toast.info(`Equipo ${activo.codigo} trasladado a Chatarra / Bajas`);
      fetchActivos();
    } catch (err) {
      toast.error('Error al cambiar a baja');
    }
  };

  // Rescatar piezas (+1000 XP)
  const handleRescatar = async (id: string, cod: string) => {
    setIsRescatando(id);
    setTimeout(async () => {
      try {
        await updateActivo(id, { estado: 'RESCATADO', tecnicoId: userId });
        if (onActivoRescatado) onActivoRescatado();
        toast.success(`¡Piezas del equipo ${cod} rescatadas con éxito! (+1000 XP)`, {
          icon: '♻️',
          duration: 4000
        });
        fetchActivos();
      } catch (err) {
        toast.error('Error al rescatar equipo');
      } finally {
        setIsRescatando(null);
      }
    }, 1200);
  };

  // Métricas del Inventario
  const totalActivos = activos.length;
  const countOperativos = activos.filter(a => a.estado === 'OPERATIVO' || !a.estado).length;
  const countReparacion = activos.filter(a => a.estado === 'REPARACION').length;
  const countBaja = activos.filter(a => a.estado === 'BAJA').length;
  const countRescatados = activos.filter(a => a.estado === 'RESCATADO').length;
  const pctOperatividad = totalActivos > 0 ? Math.round((countOperativos / totalActivos) * 100) : 100;

  // Filtrado de la Tabla Principal
  const q = searchQuery.toLowerCase().trim();
  const filteredActivos = activos.filter(a => {
    // Filtro texto
    if (q) {
      const mCod = a.codigo?.toLowerCase().includes(q);
      const mTipo = a.tipo?.toLowerCase().includes(q);
      const mMod = a.modelo?.toLowerCase().includes(q);
      const mSede = a.sede?.toLowerCase().includes(q);
      const mDept = a.departamento?.toLowerCase().includes(q);
      const mResp = a.responsable?.toLowerCase().includes(q);
      const mObs = a.observaciones?.toLowerCase().includes(q);
      if (!Boolean(mCod || mTipo || mMod || mSede || mDept || mResp || mObs)) return false;
    }

    // Filtro Sede
    if (filterSede !== 'TODAS') {
      if (a.sede?.toLowerCase().trim() !== filterSede.toLowerCase().trim()) return false;
    }

    // Filtro Estado
    if (filterEstado !== 'TODOS') {
      if (filterEstado === 'OPERATIVO') {
        if (a.estado !== 'OPERATIVO' && Boolean(a.estado)) return false;
      } else if (a.estado !== filterEstado) {
        return false;
      }
    }

    // Filtro Tipo
    if (filterTipo !== 'TODOS') {
      if (a.tipo?.toLowerCase().trim() !== filterTipo.toLowerCase().trim()) return false;
    }

    return true;
  });

  // Helper de Iconos de Hardware
  const getDeviceIcon = (tipoEquipo: string) => {
    const t = (tipoEquipo || '').toLowerCase();
    if (t.includes('laptop') || t.includes('portátil')) return <Laptop className="w-4 h-4 text-indigo-600" />;
    if (t.includes('impresora') || t.includes('térmica')) return <PrinterIcon className="w-4 h-4 text-emerald-600" />;
    if (t.includes('monitor') || t.includes('pantalla')) return <Monitor className="w-4 h-4 text-blue-600" />;
    if (t.includes('switch') || t.includes('router') || t.includes('red')) return <Network className="w-4 h-4 text-purple-600" />;
    if (t.includes('servidor')) return <HardDrive className="w-4 h-4 text-amber-600" />;
    if (t.includes('pos') || t.includes('celular')) return <Smartphone className="w-4 h-4 text-teal-600" />;
    return <Cpu className="w-4 h-4 text-slate-600" />;
  };

  // Helper de Estado Badge
  const getEstadoBadge = (est: string) => {
    switch (est) {
      case 'REPARACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Wrench className="w-3 h-3 text-amber-600 animate-spin-slow" /> En Taller
          </span>
        );
      case 'BAJA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <Trash2 className="w-3 h-3 text-rose-600" /> Chatarra / Baja
          </span>
        );
      case 'RESCATADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs">
            <Recycle className="w-3 h-3 text-teal-600" /> Rescatado
          </span>
        );
      case 'OPERATIVO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Operativo
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 overflow-y-auto max-w-[1700px] mx-auto">
      
      {/* 1. Cabecera Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-indigo-600" /> Control de Inventario y Taller de Hardware
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {pctOperatividad}% Operativo
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Catálogo patrimonial de equipos en sedes y taller de recuperación técnica. ¡Repara y recicla para ganar XP!
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsWorkshopExpanded(!isWorkshopExpanded)}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-xs ${
              isWorkshopExpanded 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>Taller Kanban ({countReparacion + countBaja + countRescatados})</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isWorkshopExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
          </button>

          <button 
            type="button"
            onClick={handleAbrirCrear}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Equipo
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Equipos</p>
            <p className="text-2xl md:text-3xl font-black text-slate-800 mt-0.5">{totalActivos}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Operativos</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl md:text-3xl font-black text-emerald-600">{countOperativos}</span>
              <span className="text-xs font-bold text-emerald-700">({pctOperatividad}%)</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">En Taller</p>
            <p className="text-2xl md:text-3xl font-black text-amber-600 mt-0.5">{countReparacion}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Bajas & Rescate</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl md:text-2xl font-black text-rose-600" title="Chatarra / Baja">{countBaja}</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xl md:text-2xl font-black text-teal-600" title="Rescatados">{countRescatados} ♻️</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center">
            <Recycle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Sección Superior: Cajas del Taller Kanban (Ciclo de Bajas y Reparación) */}
      {isWorkshopExpanded && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 md:p-5 rounded-3xl text-white shadow-xl border border-slate-700/60 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  Taller de Hardware y Bajas
                  <span className="text-[11px] font-semibold text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full">
                    Gamificado
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">
                  Aquí gestionas solo los equipos defectuosos. ¡Repara o rescata componentes para sumar XP!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWorkshopExpanded(false)}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Minimizar Taller
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna: En Reparación */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-amber-400/30 overflow-hidden flex flex-col min-h-[260px]">
              <div className="p-3 px-4 border-b border-amber-400/20 bg-amber-500/10 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> En Reparación / Diagnóstico
                </span>
                <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-xs font-black">
                  {activos.filter(a => a.estado === 'REPARACION').length}
                </span>
              </div>
              <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                {activos.filter(a => a.estado === 'REPARACION').map(a => (
                  <div key={a.id} className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-xs space-y-2 hover:border-amber-400/60 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
                          {getDeviceIcon(a.tipo)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white leading-tight">{a.codigo}</p>
                          <p className="text-[10px] text-slate-400">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQrModalActivo(a)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Ver Código QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                      <p className="text-amber-200/90 font-medium line-clamp-2">{a.observaciones || 'En revisión técnica por falla reportada.'}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {a.sede || 'Sin sede'} {a.departamento ? `- ${a.departamento}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMarcarReparado(a)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                        title="Devolver a Operativo con +250 XP"
                      >
                        <Check className="w-3.5 h-3.5" /> Reparado (+250 XP)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclararChatarra(a)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg text-xs transition-colors"
                        title="No tiene arreglo / Chatarra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {activos.filter(a => a.estado === 'REPARACION').length === 0 && (
                  <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs space-y-1.5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mb-1" />
                    <p className="font-bold text-slate-200">¡Taller al día!</p>
                    <p className="text-[11px] text-slate-400">No hay equipos averiados esperando reparación.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna: Chatarra / Baja */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-rose-400/30 overflow-hidden flex flex-col min-h-[260px]">
              <div className="p-3 px-4 border-b border-rose-400/20 bg-rose-500/10 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Chatarra / Baja Definitiva
                </span>
                <span className="bg-rose-400/20 text-rose-300 px-2 py-0.5 rounded-full text-xs font-black">
                  {activos.filter(a => a.estado === 'BAJA').length}
                </span>
              </div>
              <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                {activos.filter(a => a.estado === 'BAJA').map(a => (
                  <div key={a.id} className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-xs space-y-2 hover:border-rose-400/60 transition-all relative overflow-hidden">
                    {isRescatando === a.id && (
                      <div className="absolute inset-0 bg-emerald-950/90 z-20 flex flex-col items-center justify-center animate-pulse">
                        <Recycle className="w-8 h-8 text-emerald-400 animate-spin" />
                        <span className="text-emerald-300 text-xs font-black mt-1">+1000 XP RESCATADO</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700">
                          {getDeviceIcon(a.tipo)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white leading-tight">{a.codigo}</p>
                          <p className="text-[10px] text-slate-400">{a.tipo} {a.modelo ? `· ${a.modelo}` : ''}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminar(a.id, a.codigo)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 line-clamp-2">
                      {a.observaciones || 'Equipo irreparable o de baja patrimonial.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRescatar(a.id, a.codigo)}
                      className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all group"
                      title="Salvar componentes útiles (RAM, discos, fuentes)"
                    >
                      <Recycle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-emerald-400" />
                      Rescatar Piezas (+1000 XP)
                    </button>
                  </div>
                ))}
                {activos.filter(a => a.estado === 'BAJA').length === 0 && (
                  <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs space-y-1.5">
                    <Trash2 className="w-7 h-7 text-slate-500 mb-1" />
                    <p className="font-bold text-slate-200">Sin equipos en baja</p>
                    <p className="text-[11px] text-slate-400">Los equipos dados de baja aparecerán aquí para rescate.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna: Rescatados */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-teal-400/30 overflow-hidden flex flex-col min-h-[260px]">
              <div className="p-3 px-4 border-b border-teal-400/20 bg-teal-500/10 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Recycle className="w-3.5 h-3.5 text-teal-400" /> Piezas Rescatadas / Recicladas
                </span>
                <span className="bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full text-xs font-black">
                  {activos.filter(a => a.estado === 'RESCATADO').length}
                </span>
              </div>
              <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                {activos.filter(a => a.estado === 'RESCATADO').map(a => (
                  <div key={a.id} className="bg-slate-900/90 border border-teal-500/30 p-3 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-teal-950/60 text-teal-400 border border-teal-800">
                          <Recycle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white leading-tight">{a.codigo}</p>
                          <p className="text-[10px] text-teal-300 font-semibold">{a.tipo} · Componentes Salvados</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        +1000 XP
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 line-clamp-2">
                      {a.observaciones || 'Piezas en inventario de repuestos para otros equipos.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleMarcarReparado(a)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                      title="Reintegrar equipo o chasis como operativo"
                    >
                      Reincorporar a Operativos
                    </button>
                  </div>
                ))}
                {activos.filter(a => a.estado === 'RESCATADO').length === 0 && (
                  <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs space-y-1.5">
                    <Recycle className="w-7 h-7 text-slate-500 mb-1" />
                    <p className="font-bold text-slate-200">No hay rescates registrados</p>
                    <p className="text-[11px] text-slate-400">Canibaliza componentes útiles de la chatarra para sumar puntos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sección Inferior: Tabla Principal del Inventario Maestro */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-4 p-5 md:p-6">
        
        {/* Cabecera de la Tabla y Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Catálogo Maestro de Equipos y Activos
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Listado general de todos los activos patrimoniales y hardware en sedes.
            </p>
          </div>

          {/* Filtros de la Tabla */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Buscador */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, tipo, sede..."
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm w-full sm:w-60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro Sede */}
            <select
              value={filterSede}
              onChange={e => setFilterSede(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="TODAS">🏢 Todas las Sedes</option>
              {sedesDisponibles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="OPERATIVO">🟢 Solo Operativos</option>
              <option value="REPARACION">🟡 En Taller</option>
              <option value="BAJA">🔴 Chatarra / Baja</option>
              <option value="RESCATADO">♻️ Rescatados</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black text-slate-500 uppercase tracking-wider">
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
                const isBaja = activo.estado === 'BAJA';
                const isOperativo = activo.estado === 'OPERATIVO' || !activo.estado;

                return (
                  <tr key={activo.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Código & QR */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
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
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 shrink-0">
                          {getDeviceIcon(activo.tipo)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{activo.tipo}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {activo.modelo || 'Modelo estándar'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Ubicación */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-500" />
                          <span>{activo.sede || 'Sin sede'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {activo.departamento ? `${activo.departamento}` : 'General'}
                          {activo.ubicacion ? ` · ${activo.ubicacion}` : ''}
                        </p>
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {activo.responsable ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[130px]">{activo.responsable}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No asignado</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      {getEstadoBadge(activo.estado)}
                    </td>

                    {/* Observaciones */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-slate-600 text-xs truncate" title={activo.observaciones || ''}>
                        {activo.observaciones || <span className="text-slate-400 italic">Sin observaciones</span>}
                      </p>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Si está operativo: Botón Enviar a Taller cuando se malogra */}
                        {isOperativo && (
                          <button
                            type="button"
                            onClick={() => handleEnviarATaller(activo)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            title="Enviar a Taller porque se malogró"
                          >
                            <Wrench className="w-3 h-3 text-amber-600" />
                            <span>Taller</span>
                          </button>
                        )}

                        {/* Si está en reparación: Botón Listo / Reparado */}
                        {isReparacion && (
                          <button
                            type="button"
                            onClick={() => handleMarcarReparado(activo)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            title="Marcar reparado y devolver a operativo (+250 XP)"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Listo (+250 XP)</span>
                          </button>
                        )}

                        {/* Botón Editar */}
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(activo)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar información"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Eliminar */}
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
                  ? 'Prueba modificando los filtros o el texto de búsqueda.'
                  : 'Aún no hay equipos registrados. Haz clic en "Registrar Equipo" para comenzar.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Modal de Registro / Edición de Equipo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
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
                    Ingresa los datos patrimoniales y de asignación en la empresa
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarActivo} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Patrimonial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    placeholder="Ej: PC-042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Equipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Seleccionar Sede</option>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                  >
                    <option value="">Seleccionar Depto</option>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-[10px] text-slate-400">{opt.desc}</span>
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
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

      {/* 6. Modal de Etiqueta QR Imprimible */}
      {qrModalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:p-0">
          <div 
            className="fixed inset-0 print:hidden"
            onClick={() => setQrModalActivo(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:w-full print:max-w-none">
            
            {/* Header del modal (oculto en impresión) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print print:hidden">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" /> Etiqueta QR Patrimonial
              </h3>
              <button 
                type="button"
                onClick={() => setQrModalActivo(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Etiqueta Imprimible */}
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

            {/* Acciones del Modal */}
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
