'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActivo, addIntervencion, updateActivo } from '@/services/api/api-client';
import { Package, ArrowLeft, Send, Activity, Settings, Calendar, Wrench, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActivoMobileView() {
  const params = useParams();
  const router = useRouter();
  const [activo, setActivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nuevaIntervencion, setNuevaIntervencion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivo = async () => {
    try {
      const data = await getActivo(params.id as string);
      setActivo(data);
    } catch (err) {
      console.error(err);
      alert('Activo no encontrado');
    } finally {
      setLoading(false);
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
      await addIntervencion(activo.id, nuevaIntervencion);
      setNuevaIntervencion('');
      fetchActivo();
    } catch (err) {
      alert('Error al añadir intervención');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    try {
      await updateActivo(activo.id, { estado: nuevoEstado });
      // Agregar evento automático de historial
      await addIntervencion(activo.id, `Estado cambiado a: ${nuevoEstado}`);
      fetchActivo();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!activo) {
    return <div className="p-8 text-center text-slate-500">Activo no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* App Bar Móvil */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 text-lg leading-tight">{activo.codigo}</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{activo.tipo}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-xl">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Estado Actual</p>
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-bold w-fit",
                activo.estado === 'REPARACION' && "bg-slate-100 text-slate-700",
                activo.estado === 'BAJA' && "bg-red-100 text-red-700",
                activo.estado === 'RESCATADO' && "bg-emerald-100 text-emerald-700"
              )}>
                {activo.estado}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Registrado</p>
              <p className="text-sm font-medium text-slate-800">{new Date(activo.fechaRegistro).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Acciones Rápidas</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleCambiarEstado('REPARACION')}
                disabled={activo.estado === 'REPARACION'}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Wrench className="w-4 h-4" /> Mantenimiento
              </button>
              <button 
                onClick={() => handleCambiarEstado('RESCATADO')}
                disabled={activo.estado === 'RESCATADO'}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" /> Rescatado
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Intervenciones */}
        <div>
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Historial de Intervenciones
          </h2>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              
              {(!activo.intervenciones || activo.intervenciones.length === 0) ? (
                <p className="text-sm text-slate-400 text-center py-4 relative z-10 bg-white">No hay intervenciones registradas.</p>
              ) : (
                activo.intervenciones.map((int: any, i: number) => (
                  <div key={int.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm ml-4 md:ml-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700 text-sm">{int.tecnicoId ? 'Técnico' : 'Sistema'}</span>
                        <time className="text-xs font-mono text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(int.fecha).toLocaleDateString()}</time>
                      </div>
                      <p className="text-sm text-slate-600">{int.descripcion}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe shadow-lg z-20">
        <form onSubmit={handleAddIntervencion} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Anotar intervención..." 
            value={nuevaIntervencion}
            onChange={e => setNuevaIntervencion(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={isSubmitting || !nuevaIntervencion.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl shadow-sm transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
