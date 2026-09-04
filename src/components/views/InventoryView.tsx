import { useState, useEffect } from 'react';
import { Package, Wrench, Trash2, Recycle, Plus, QrCode, Printer, X } from 'lucide-react';
import { getActivos, crearActivo, updateActivo, eliminarActivo } from '@/services/api/api-client';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export function InventoryView({ userId, onActivoRescatado }: { userId?: string, onActivoRescatado?: () => void }) {
  const [activos, setActivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescatando, setIsRescatando] = useState<string | null>(null);
  const [qrModalActivo, setQrModalActivo] = useState<any>(null);

  // Formulario Modal
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('PC');
  const [nuevoEstado, setNuevoEstado] = useState('REPARACION');
  const [nuevasObs, setNuevasObs] = useState('');

  const fetchActivos = async () => {
    try {
      const data = await getActivos();
      setActivos(data);
    } catch (err) {
      console.error('Error fetching activos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const handleCrearActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearActivo({
        codigo: nuevoCodigo,
        tipo: nuevoTipo,
        estado: nuevoEstado,
        observaciones: nuevasObs
      });
      setIsModalOpen(false);
      setNuevoCodigo('');
      setNuevasObs('');
      fetchActivos();
    } catch (err) {
      alert('Error al crear activo');
    }
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Eliminar equipo del sistema?')) {
      await eliminarActivo(id);
      fetchActivos();
    }
  };

  const handleRescatar = async (id: string) => {
    setIsRescatando(id);
    setTimeout(async () => {
      try {
        await updateActivo(id, { estado: 'RESCATADO', tecnicoId: userId });
        if (onActivoRescatado) onActivoRescatado();
        fetchActivos();
      } catch (err) {
        alert('Error al rescatar');
      } finally {
        setIsRescatando(null);
      }
    }, 1500); // Animación simulada de 1.5s
  };

  const getColumna = (estado: string) => activos.filter(a => a.estado === estado);

  const getIcono = (tipo: string) => {
    return <Package className="w-5 h-5" />;
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-slate-600" /> Inventario y Bajas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión del ciclo de vida del hardware. ¡Recicla piezas y gana XP extra!
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Defecto
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Columna: En Reparación */}
        <div className="bg-slate-100 rounded-xl flex flex-col overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-500" /> En Reparación
            </h2>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {getColumna('REPARACION').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {getColumna('REPARACION').map(a => (
              <ActivoCard 
                key={a.id} 
                activo={a} 
                onDelete={() => handleEliminar(a.id)} 
                onRescatar={() => handleRescatar(a.id)}
                onShowQR={() => setQrModalActivo(a)}
                isRescatando={isRescatando === a.id}
              />
            ))}
          </div>
        </div>

        {/* Columna: Chatarra / Baja */}
        <div className="bg-red-50/50 rounded-xl flex flex-col overflow-hidden border border-red-100">
          <div className="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-red-700 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" /> Chatarra / Baja
            </h2>
            <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {getColumna('BAJA').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {getColumna('BAJA').map(a => (
              <ActivoCard 
                key={a.id} 
                activo={a} 
                onDelete={() => handleEliminar(a.id)} 
                onRescatar={() => handleRescatar(a.id)}
                onShowQR={() => setQrModalActivo(a)}
                isRescatando={isRescatando === a.id}
              />
            ))}
          </div>
        </div>

        {/* Columna: Rescatados */}
        <div className="bg-emerald-50/50 rounded-xl flex flex-col overflow-hidden border border-emerald-100">
          <div className="p-4 border-b border-emerald-100 bg-emerald-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-emerald-700 flex items-center gap-2">
              <Recycle className="w-4 h-4 text-emerald-500" /> Rescatados
            </h2>
            <span className="bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {getColumna('RESCATADO').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {getColumna('RESCATADO').map(a => (
              <ActivoCard 
                key={a.id} 
                activo={a} 
                onDelete={() => handleEliminar(a.id)}
                onShowQR={() => setQrModalActivo(a)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Crear */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="bg-slate-800 p-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" /> Registrar Equipo
              </h2>
            </div>
            
            <form onSubmit={handleCrearActivo} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Código Patrimonial <span className="text-red-500">*</span></label>
                <input 
                  type="text" required value={nuevoCodigo} onChange={e => setNuevoCodigo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Ej: IMP-045"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipo <span className="text-red-500">*</span></label>
                  <select 
                    value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium appearance-none"
                  >
                    <option value="PC">Computadora (PC)</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Impresora">Impresora</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Estado <span className="text-red-500">*</span></label>
                  <select 
                    value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium appearance-none"
                  >
                    <option value="REPARACION">En Reparación</option>
                    <option value="BAJA">Chatarra / Baja</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Observaciones Técnicas <span className="text-red-500">*</span></label>
                <textarea 
                  required value={nuevasObs} onChange={e => setNuevasObs(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Ej: Placa quemada por corto circuito, se puede rescatar el disco duro..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrModalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:backdrop-blur-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300 print:shadow-none print:w-full print:max-w-none">
            {/* Cabecera (oculta al imprimir) */}
            <div className="bg-slate-800 p-4 flex items-center justify-between no-print print:hidden">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" /> Etiqueta QR
              </h2>
              <button onClick={() => setQrModalActivo(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Área a Imprimir */}
            <div id="print-section" className="p-8 flex flex-col items-center justify-center bg-white">
              <div className="border-4 border-black p-6 bg-white flex flex-col items-center gap-4 rounded-xl">
                <h3 className="text-2xl font-black tracking-widest uppercase">{qrModalActivo.codigo}</h3>
                <div className="bg-white p-2">
                  <QRCodeSVG 
                    value={`https://clinica.local/activos/${qrModalActivo.id}`} 
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center w-full border-t-2 border-black pt-3">
                  <p className="font-bold text-lg uppercase">{qrModalActivo.tipo}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {qrModalActivo.id.substring(0,8)}</p>
                </div>
              </div>
            </div>
            
            {/* Botones (ocultos al imprimir) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 no-print print:hidden">
              <button type="button" onClick={() => setQrModalActivo(null)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors">Cerrar</button>
              <button type="button" onClick={() => window.print()} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-colors flex items-center gap-2">
                <Printer className="w-4 h-4" /> Imprimir Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivoCard({ activo, onDelete, onRescatar, isRescatando, onShowQR }: any) {
  return (
    <div className={cn(
      "bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden transition-all duration-500",
      isRescatando ? "scale-105 shadow-xl ring-2 ring-emerald-500 bg-emerald-50" : "hover:shadow-md"
    )}>
      {isRescatando && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-100/80 z-10 backdrop-blur-[1px]">
          <div className="flex flex-col items-center animate-bounce">
            <Recycle className="w-8 h-8 text-emerald-600 mb-1" />
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest">+1000 XP</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-none">{activo.codigo}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{activo.tipo}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onShowQR} className="text-slate-400 hover:text-blue-500 p-1 transition-colors" title="Ver Código QR">
            <QrCode className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-md border border-slate-100 h-12 overflow-y-auto">
        {activo.observaciones}
      </p>

      {activo.estado !== 'RESCATADO' && (
        <button 
          onClick={onRescatar}
          className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 border-dashed rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 group"
        >
          <Recycle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          Reciclar Equipo
        </button>
      )}
    </div>
  );
}
