import { Server, Wifi, Router, Activity, ShieldAlert, CheckCircle2, RotateCw, Network, X, Link, AlertTriangle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDispositivosRed, getDireccionesIP, registrarNuevaIP, updateDispositivoRed, asignarIP, liberarIP, simularCaidaRed, restaurarDispositivoRed } from '@/services/api/api-client';

interface NetworkViewProps {
  userId?: string;
  onTicketResolved?: () => void;
}

export function NetworkView({ userId, onTicketResolved }: NetworkViewProps) {
  const [devices, setDevices] = useState<any[]>([]);
  const [ips, setIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mapa' | 'libres'>('mapa');

  // Estados para modal de Asignar IP
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [selectedDispositivoId, setSelectedDispositivoId] = useState<string>('');

  // Estados para modal de Registrar IP
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newIpForm, setNewIpForm] = useState({ ip: '', sede: '', area: '', vlan: '' });

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
    if (estadoActual === 'ONLINE') return;
    
    // Simular que está reiniciando
    setDevices(prev => prev.map(d => d.id === id ? { ...d, estado: 'REINICIANDO' } : d));
    
    setTimeout(async () => {
      try {
        await restaurarDispositivoRed(id, userId || '');
        if (onTicketResolved) {
          onTicketResolved(); // Actualiza la barra lateral de XP
        }
        fetchData();
      } catch (e) {
        alert("Error al restaurar equipo");
        fetchData();
      }
    }, 1500);
  };

  const handleSimularCaida = async () => {
    try {
      await simularCaidaRed();
      fetchData();
    } catch (e) {
      alert("Error al simular caída");
    }
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

  const handleRegisterIpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpForm.ip) return;
    try {
      await registrarNuevaIP(newIpForm);
      setIsRegisterModalOpen(false);
      setNewIpForm({ ip: '', sede: '', area: '', vlan: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error al registrar IP");
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

  // Agrupación de IPs por Sede y Área
  const groupedIps: { [sede: string]: { [area: string]: any[] } } = {};
  ips.forEach(ip => {
    // Para no ensuciar el mapa, solo mostramos IPs que tengan Sede (algunas viejas podrían no tener)
    // Opcionalmente: mostramos "Sede Desconocida"
    const sede = ip.sede || 'Sin Sede';
    const area = ip.area || 'Sin Área';
    
    if (!groupedIps[sede]) groupedIps[sede] = {};
    if (!groupedIps[sede][area]) groupedIps[sede][area] = [];
    
    groupedIps[sede][area].push(ip);
  });

  const ipsLibres = ips.filter(ip => ip.estado === 'LIBRE');

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600" /> Infraestructura de Red
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitoreo activo de equipos críticos y gestión de inventario IP (IPAM).</p>
        </div>
        
        <button 
          onClick={handleSimularCaida}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Simular Caída Aleatoria
        </button>
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
                    className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                  >
                    <RotateCw className="w-3 h-3" /> Restaurar y Ganar XP
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header Tabs */}
        <div className="p-0 border-b border-slate-100 bg-slate-50 flex items-end">
          <div className="flex px-4 pt-4 gap-2">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'mapa' ? 'text-blue-700 bg-white border-blue-600 shadow-[0_-2px_0_0_rgba(255,255,255,1)]' : 'text-slate-500 hover:bg-slate-100 border-transparent'
              }`}
            >
              Mapa de Red (Sedes)
            </button>
            <button
              onClick={() => setActiveTab('libres')}
              className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'libres' ? 'text-blue-700 bg-white border-blue-600 shadow-[0_-2px_0_0_rgba(255,255,255,1)]' : 'text-slate-500 hover:bg-slate-100 border-transparent'
              }`}
            >
              IPs Disponibles
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">{ipsLibres.length}</span>
            </button>
          </div>
          
          <div className="ml-auto p-4 flex items-center gap-4">
             <button
               onClick={() => setIsRegisterModalOpen(true)}
               className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-md text-xs shadow-sm transition-colors flex items-center gap-1"
             >
               <Plus className="w-4 h-4" /> Registrar Nueva IP
             </button>
             <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                Total IPs Registradas: {ips.length}
             </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-white min-h-[400px]">
          {activeTab === 'mapa' && (
            <div className="space-y-6">
              {Object.keys(groupedIps).map((sede) => (
                <div key={sede} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="bg-slate-800 text-white px-5 py-3 font-bold text-lg">
                    {sede}
                  </div>
                  <div className="p-4 space-y-4">
                    {Object.keys(groupedIps[sede]).map((area) => (
                      <div key={area} className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                          <Network className="w-4 h-4 text-slate-400" /> {area}
                        </div>
                        <div className="p-4 flex flex-wrap gap-3">
                          {groupedIps[sede][area].map(ip => (
                            <div 
                              key={ip.ip} 
                              className={`flex flex-col p-3 rounded-lg border ${ip.estado === 'LIBRE' ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'} shadow-sm min-w-[140px] relative group`}
                            >
                              <span className="font-mono font-bold text-slate-800">{ip.ip}</span>
                              <span className="text-xs text-slate-500 mt-1 truncate max-w-[120px]" title={ip.dispositivo?.nombre || 'Libre'}>
                                {ip.dispositivo?.nombre || <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Libre</span>}
                              </span>
                              
                              {ip.estado !== 'LIBRE' && (
                                <button 
                                  onClick={() => handleLiberarIp(ip.ip)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 text-red-500 p-1 rounded-md border border-slate-200 shadow-sm"
                                  title="Liberar IP"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                              {ip.estado === 'LIBRE' && (
                                <button 
                                  onClick={() => handleAbrirModalAsignar(ip.ip)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-blue-50 text-blue-500 p-1 rounded-md border border-slate-200 shadow-sm"
                                  title="Asignar IP"
                                >
                                  <Link className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'libres' && (
            <div className="overflow-hidden border border-emerald-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-bold">Dirección IP</th>
                    <th className="px-6 py-3 font-bold">Sede y Área Recomendada</th>
                    <th className="px-6 py-3 font-bold">VLAN</th>
                    <th className="px-6 py-3 font-bold text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 bg-white">
                  {ipsLibres.map((ip) => (
                    <tr key={ip.ip} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700">{ip.ip}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {ip.sede} <span className="text-slate-400 mx-1">&rarr;</span> {ip.area}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                          {ip.vlan || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleAbrirModalAsignar(ip.ip)}
                          className="text-blue-700 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200 active:scale-95 flex items-center gap-2 ml-auto shadow-sm"
                        >
                          <Link className="w-4 h-4" /> Asignar a Equipo
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ipsLibres.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-medium">
                        No hay IPs libres disponibles en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Asignar IP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
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

      {/* Modal Registrar Nueva IP */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Registrar Nueva IP
            </h2>
            <p className="text-sm text-slate-500 mb-6">Añade una nueva dirección IP al catálogo para que pueda ser asignada a dispositivos.</p>

            <form onSubmit={handleRegisterIpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección IP (Ej. 10.0.50.12)</label>
                <input
                  required
                  type="text"
                  value={newIpForm.ip}
                  onChange={(e) => setNewIpForm({ ...newIpForm, ip: e.target.value })}
                  placeholder="192.168.x.x o 10.x.x.x"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sede (Ej. Sede Sur)</label>
                  <input
                    type="text"
                    value={newIpForm.sede}
                    onChange={(e) => setNewIpForm({ ...newIpForm, sede: e.target.value })}
                    placeholder="Sede San Isidro"
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área (Ej. Gerencia)</label>
                  <input
                    type="text"
                    value={newIpForm.area}
                    onChange={(e) => setNewIpForm({ ...newIpForm, area: e.target.value })}
                    placeholder="Contabilidad"
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">VLAN (Opcional)</label>
                <input
                  type="text"
                  value={newIpForm.vlan}
                  onChange={(e) => setNewIpForm({ ...newIpForm, vlan: e.target.value })}
                  placeholder="VLAN 50"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors active:scale-95"
                >
                  Guardar IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
