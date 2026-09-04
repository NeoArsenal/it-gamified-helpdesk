import { Server, Wifi, Router, Activity, ShieldAlert, CheckCircle2, RotateCw, Network, X, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDispositivosRed, getDireccionesIP, updateDispositivoRed, asignarIP, liberarIP } from '@/services/api/api-client';

interface NetworkViewProps {
  userId?: string;
  onTicketResolved?: () => void;
}

export function NetworkView({ userId, onTicketResolved }: NetworkViewProps) {
  const [devices, setDevices] = useState<any[]>([]);
  const [ips, setIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modal de Asignar IP
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [selectedDispositivoId, setSelectedDispositivoId] = useState<string>('');

  const fetchData = async () => {
    try {
      const [dData, iData] = await Promise.all([getDispositivosRed(), getDireccionesIP()]);
      setDevices(dData);
      setIps(iData);
    } catch (err) {
      console.error('Error fetching network data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReiniciarEquipo = async (id: string, estadoActual: string) => {
    if (estadoActual === 'ONLINE') return; // Ya está bien
    
    // Simular que está reiniciando
    setDevices(prev => prev.map(d => d.id === id ? { ...d, estado: 'REINICIANDO' } : d));
    
    setTimeout(async () => {
      try {
        await updateDispositivoRed(id, { estado: 'ONLINE' });
        // Simular dar XP por mantenimiento preventivo
        if (onTicketResolved) {
          // Engañamos al sistema llamando onTicketResolved para dar XP simulada
          // En un sistema real tendrías un `onXpGained(50)`
        }
        fetchData();
      } catch (e) {
        alert("Error al reiniciar equipo");
        fetchData();
      }
    }, 2000);
  };

  const handleLiberarIp = async (ip: string) => {
    if (!confirm(`¿Seguro que quieres liberar la IP ${ip}?`)) return;
    try {
      await liberarIP(ip);
      fetchData();
    } catch (e) {
      alert("Error al liberar IP");
    }
  };

  const handleAbrirModalAsignar = (ip: string) => {
    setSelectedIp(ip);
    setSelectedDispositivoId('');
    setIsModalOpen(true);
  };

  const handleAsignarIpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIp || !selectedDispositivoId) return;

    try {
      await asignarIP(selectedIp, selectedDispositivoId);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error al asignar IP");
    }
  };

  const getDeviceIcon = (type: string, isRebooting: boolean) => {
    if (isRebooting) return <RotateCw className="w-5 h-5 animate-spin text-amber-500" />;
    if (type === 'SWITCH') return <Server className="w-5 h-5" />;
    if (type === 'ROUTER') return <Router className="w-5 h-5" />;
    return <Wifi className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ONLINE') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> ONLINE</span>;
    if (status === 'WARNING') return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200"><Activity className="w-3 h-3 animate-pulse" /> WARNING</span>;
    if (status === 'REINICIANDO') return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200"><RotateCw className="w-3 h-3 animate-spin" /> REINICIANDO</span>;
    return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200"><ShieldAlert className="w-3 h-3 animate-bounce" /> OFFLINE</span>;
  };

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Cargando infraestructura de red...</div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Network className="w-6 h-6 text-blue-600" /> Infraestructura de Red
        </h1>
        <p className="text-slate-500 text-sm mt-1">Monitoreo activo de equipos críticos y gestión de inventario IP (IPAM).</p>
      </div>

      {/* Dispositivos (Tarjetas) */}
      <h2 className="text-lg font-bold text-slate-700 border-b border-slate-200 pb-2">Panel de Monitoreo de Equipos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isRebooting = dev.estado === 'REINICIANDO';
          const isOffline = dev.estado === 'OFFLINE' || dev.estado === 'WARNING';
          
          return (
            <div key={dev.id} className={`bg-white p-5 rounded-xl border \${isOffline ? 'border-red-200 shadow-red-100' : 'border-slate-200'} shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2 rounded-lg ${isOffline ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {getDeviceIcon(dev.tipo, isRebooting)}
                </div>
                {getStatusBadge(dev.estado)}
              </div>
              
              <div className="relative z-10">
                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors" title={dev.nombre}>{dev.nombre}</p>
                <div className="flex items-center justify-between mt-2 mb-4">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{dev.ipAdministracion || 'Sin IP'}</span>
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">{dev.ubicacion}</span>
                </div>
                
                {isOffline && !isRebooting && (
                  <button 
                    onClick={() => handleReiniciarEquipo(dev.id, dev.estado)}
                    className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-95"
                  >
                    <RotateCw className="w-3 h-3" /> Reiniciar Equipo (Simulación)
                  </button>
                )}
                {!isOffline && (
                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-200 active:scale-95">
                    <Activity className="w-3 h-3" /> Hacer Ping
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Gestión de IPs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Gestión de IPs (IPAM Interactivo)</h3>
          <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm">
            Total Registradas: {ips.length}
          </span>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Dirección IP</th>
                <th className="px-6 py-3 font-medium">Dispositivo Asignado</th>
                <th className="px-6 py-3 font-medium">VLAN</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ips.map((ip) => (
                <tr key={ip.ip} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 font-mono font-medium text-slate-700">{ip.ip}</td>
                  <td className={`px-6 py-3 font-medium ${!ip.dispositivo ? 'text-slate-400' : 'text-slate-800'}`}>
                    {ip.dispositivo?.nombre || '-'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                      {ip.vlan || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {ip.estado === 'LIBRE' 
                      ? <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center w-fit gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Libre</span>
                      : <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-1 rounded-full border border-slate-200 flex items-center w-fit gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Ocupada</span>
                    }
                  </td>
                  <td className="px-6 py-3 text-right">
                    {ip.estado === 'LIBRE' ? (
                      <button 
                        onClick={() => handleAbrirModalAsignar(ip.ip)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 active:scale-95 flex items-center gap-1 ml-auto"
                      >
                        <Link className="w-3 h-3" /> Asignar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleLiberarIp(ip.ip)}
                        className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200 active:scale-95 flex items-center gap-1 ml-auto"
                      >
                        <X className="w-3 h-3" /> Liberar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {ips.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay IPs registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Asignar IP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" /> Asignar IP
            </h2>
            <p className="text-sm text-slate-500 mb-6">Selecciona el dispositivo para asignar la IP <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded">{selectedIp}</span>.</p>

            <form onSubmit={handleAsignarIpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dispositivo Destino</label>
                <select
                  required
                  value={selectedDispositivoId}
                  onChange={(e) => setSelectedDispositivoId(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  <option value="" disabled>Selecciona un dispositivo...</option>
                  {devices.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.nombre} ({dev.tipo})</option>
                  ))}
                </select>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors active:scale-95"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
