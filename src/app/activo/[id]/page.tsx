'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActivo, addIntervencion, updateActivo } from '@/services/api/api-client';
import { 
  Package, ArrowLeft, Send, Activity, Settings, Calendar, Wrench, 
  CheckCircle2, AlertTriangle, ShieldCheck, MapPin, User, Hash, 
  ReceiptText, Laptop, Monitor, Printer, Server, RefreshCw, Cpu, 
  Clock, Check, Sparkles, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ActivoMobileView() {
  const params = useParams();
  const router = useRouter();
  const [activo, setActivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para anotación rápida / intervención
  const [nuevaIntervencion, setNuevaIntervencion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal para cambio rápido de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState('OPERATIVO');
  const [motivoEstado, setMotivoEstado] = useState('');

  const fetchActivo = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await getActivo(params.id as string);
      setActivo(data);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo encontrar el equipo escaneado');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchActivo();
    }
  }, [params.id]);

  const handleAddIntervencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaIntervencion.trim()) return;
    setIsSubmitting(true);
    try {
      await addIntervencion(activo.id, nuevaIntervencion.trim());
      toast.success('Hito de intervención registrado');
      setNuevaIntervencion('');
      fetchActivo(true);
    } catch (err: any) {
      toast.error('Error al registrar intervención');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCambiarEstadoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateActivo(activo.id, {
        estado: selectedEstado,
        observaciones: motivoEstado.trim() || undefined,
      });

      const detalleHito = motivoEstado.trim() 
        ? `Estado cambiado a [${selectedEstado}] · Motivo: ${motivoEstado.trim()}`
        : `Estado cambiado a [${selectedEstado}]`;

      await addIntervencion(activo.id, detalleHito);
      toast.success(`Estado actualizado a ${selectedEstado}`);
      setShowStatusModal(false);
      setMotivoEstado('');
      fetchActivo(true);
    } catch (err: any) {
      toast.error('Error al actualizar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeviceIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('laptop') || t.includes('portatil')) return <Laptop className="w-6 h-6" />;
    if (t.includes('monitor') || t.includes('pantalla')) return <Monitor className="w-6 h-6" />;
    if (t.includes('impresora') || t.includes('scanner')) return <Printer className="w-6 h-6" />;
    if (t.includes('servidor') || t.includes('switch') || t.includes('rack')) return <Server className="w-6 h-6" />;
    return <Cpu className="w-6 h-6" />;
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'OPERATIVO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            OPERATIVO
          </span>
        );
      case 'REPARACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            EN TALLER
          </span>
        );
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            EN ALMACÉN TI
          </span>
        );
      case 'BAJA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            BAJA / CHATARRA
          </span>
        );
      case 'RESCATADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            RESCATADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
            DISPONIBLE
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Package className="w-8 h-8 text-indigo-400 animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="font-bold text-lg text-slate-100">Cargando Trazabilidad...</h2>
          <p className="text-xs text-slate-400 mt-1">Conectando con el registro patrimonial</p>
        </div>
      </div>
    );
  }

  if (!activo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Equipo no encontrado</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          El código QR escaneado no corresponde a ningún activo registrado en el sistema.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  // Ordenar intervenciones de más reciente a más antigua (estilo paquetería de AliExpress)
  const timelineItems = [...(activo.intervenciones || [])].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 pb-28">
      {/* 1. Barra Superior Móvil */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between shadow-lg">
        <button 
          onClick={() => router.push('/')}
          className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-extrabold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Rastreo en Vivo
          </span>
          <h1 className="font-black text-white text-base tracking-tight leading-tight">
            {activo.codigo}
          </h1>
        </div>

        <button 
          onClick={() => fetchActivo(true)}
          disabled={isRefreshing}
          className="p-2 -mr-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin text-indigo-400")} />
        </button>
      </header>

      <main className="p-4 sm:p-6 max-w-lg mx-auto space-y-5">
        
        {/* 2. Hero Card: Identidad del Hardware */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/60 p-5 shadow-2xl backdrop-blur-md">
          {/* Fondo estético con halo */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                {getDeviceIcon(activo.tipo)}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {activo.tipo}
                </span>
                <h2 className="text-lg font-black text-white leading-tight">
                  {activo.marca} {activo.modelo || ''}
                </h2>
              </div>
            </div>

            <div className="shrink-0">
              {getEstadoBadge(activo.estado)}
            </div>
          </div>

          {/* Chips de Serie y Factura */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/50 text-xs">
            <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                N° de Serie (S/N)
              </span>
              <p className="font-mono font-bold text-slate-200 truncate mt-0.5">
                {activo.numeroSerie || 'No registrado'}
              </p>
            </div>

            <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                N° de Factura
              </span>
              <p className="font-mono font-black text-indigo-300 truncate mt-0.5">
                {activo.codigoFactura || 'Sin factura'}
              </p>
            </div>
          </div>

          {/* Ubicación y Responsable Asignado */}
          <div className="mt-3 bg-slate-950/40 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-slate-400">Sede: </span>
                <span className="font-bold text-white">
                  {activo.sede ? `${activo.sede} · ${activo.departamento || 'General'}` : 'En Almacén Central TI'}
                </span>
                {activo.ubicacion && (
                  <span className="text-slate-400"> ({activo.ubicacion})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-slate-400">Responsable: </span>
                <span className="font-bold text-slate-200">
                  {activo.responsable || 'Sin custodio asignado'}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Acción Rápida: Cambiar Estado */}
          <div className="mt-4">
            <button
              onClick={() => {
                setSelectedEstado(activo.estado || 'OPERATIVO');
                setShowStatusModal(true);
              }}
              className="w-full py-2.5 px-4 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-indigo-200" />
              <span>Reportar Falla / Cambiar Estado</span>
            </button>
          </div>
        </section>

        {/* 3. AliExpress-Style Tracking: Línea de Tiempo de Ciclo de Vida */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Historial de Trazabilidad
            </h3>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
              {timelineItems.length + 1} Hitos Registrados
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 shadow-xl backdrop-blur-md">
            {/* Contenedor Vertical Conectado */}
            <div className="relative pl-6 space-y-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-700 before:to-slate-800">
              
              {/* Eventos Dinámicos de Intervención (De más reciente a más antiguo) */}
              {timelineItems.map((item, idx) => {
                const isLatest = idx === 0;

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Nodo Circular Conector */}
                    <div 
                      className={cn(
                        "absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-200",
                        isLatest 
                          ? "bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20 text-white scale-110 shadow-lg shadow-indigo-500/30" 
                          : "bg-slate-800 border-slate-600 text-slate-400"
                      )}
                    >
                      {isLatest ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-300" />
                      )}
                    </div>

                    {/* Contenido del Evento */}
                    <div className={cn(
                      "rounded-2xl p-4 border transition-all",
                      isLatest 
                        ? "bg-indigo-950/30 border-indigo-500/40 shadow-md" 
                        : "bg-slate-950/40 border-slate-800/80"
                    )}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                          isLatest 
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                            : "bg-slate-800 text-slate-400"
                        )}>
                          {isLatest ? 'Último Estado Registrado' : `Hito #${timelineItems.length - idx}`}
                        </span>

                        <time className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.fecha).toLocaleString()}
                        </time>
                      </div>

                      <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                        {item.descripcion}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Registrado por:</span>
                        <span className="font-bold text-slate-300">
                          {item.tecnicoId ? 'Técnico de Soporte' : 'Sistema Automatizado'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Hito Base (Origen): Entrada Inicial a Almacén */}
              <div className="relative">
                {/* Nodo Base */}
                <div className="absolute -left-[30px] top-0.5 w-6 h-6 rounded-full bg-emerald-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-300">
                  <Package className="w-3 h-3" />
                </div>

                <div className="rounded-2xl p-4 bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Origen / Nacimiento Patrimonial
                    </span>
                    <time className="text-[11px] font-mono text-emerald-400/80 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activo.fechaRegistro ? new Date(activo.fechaRegistro).toLocaleDateString() : 'Fecha inicial'}
                    </time>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">
                    📦 Ingreso físico a Almacén Central TI
                    {activo.codigoFactura ? ` mediante Factura / Guía: ${activo.codigoFactura}` : ' registrado en inventario inicial'}.
                  </p>

                  <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-400/80">
                    <span>Estado inicial:</span>
                    <span className="font-bold text-emerald-300">DISPONIBLE EN BODEGA</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 4. Barra Flotante Inferior: Nueva Anotación Técnica */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 z-40">
        <form onSubmit={handleAddIntervencion} className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={nuevaIntervencion}
            onChange={(e) => setNuevaIntervencion(e.target.value)}
            disabled={isSubmitting}
            placeholder="Anotar diagnóstico o mantenimiento..."
            className="flex-1 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !nuevaIntervencion.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guardar</span>
          </button>
        </form>
      </footer>

      {/* 5. Modal Rápido: Cambio de Estado y Falla */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" /> Cambiar Estado
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCambiarEstadoSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nuevo Estado del Equipo
                </label>
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="OPERATIVO">🟢 OPERATIVO (Listo en Estación)</option>
                  <option value="REPARACION">🟡 EN TALLER / MANTENIMIENTO</option>
                  <option value="DISPONIBLE">📦 EN ALMACÉN TI (Disponible)</option>
                  <option value="BAJA">🔴 BAJA / CHATARRA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Motivo / Diagnóstico de la Falla
                </label>
                <textarea
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  rows={3}
                  placeholder="Ej: Pantalla con líneas verticales, enviado a taller de soporte central..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white shadow-md active:scale-95 disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
