import { Ticket, Clock, Network, CheckCircle2, ShieldAlert, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats, getEstadisticasRed, getTickets, getUsuarios } from '@/services/api/api-client';

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [redStats, setRedStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, rData, tData, uData] = await Promise.all([
          getStats().catch(() => null),
          getEstadisticasRed().catch(() => null),
          getTickets().catch(() => []),
          getUsuarios().catch(() => [])
        ]);
        setStats(sData);
        setRedStats(rData);
        setTickets(Array.isArray(tData) ? tData : []);
        setUsuarios(Array.isArray(uData) ? uData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Cargando métricas en vivo...</div>;
  }

  const safeStats = stats || { total: 0, abiertos: 0, enProgreso: 0, resueltos: 0 };
  const safeRed = redStats || { dispositivos: 0, ipsLibres: 0 };
  const ticketsActivos = safeStats.abiertos + safeStats.enProgreso;

  // Filtrar incidencias prioritarias (Críticas, Altas o Abiertas activas)
  const incidenciasPrioritarias = tickets
    .filter(t => t.estado === 'ABIERTO' || t.estado === 'EN_PROGRESO')
    .sort((a, b) => {
      const prioOrder: Record<string, number> = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
      return (prioOrder[b.prioridad] || 0) - (prioOrder[a.prioridad] || 0);
    })
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-w-[1700px] mx-auto">
      {/* Elemento de diseño de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control General</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen operativo del área de TI y estado de servicios en tiempo real.</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div>
            <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Tickets Activos</p>
            <p className="text-4xl font-black text-slate-800 mt-2 tracking-tight">{ticketsActivos}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total histórico: {safeStats.total}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
            <Ticket className="w-7 h-7" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div>
            <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Tickets Resueltos</p>
            <p className="text-4xl font-black text-slate-800 mt-2 tracking-tight">{safeStats.resueltos}</p>
            <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Excelente ritmo operativo
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-inner">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div>
            <p className="text-sm font-medium text-slate-500 group-hover:text-purple-600 transition-colors">Infraestructura</p>
            <p className="text-4xl font-black text-slate-800 mt-2 tracking-tight">{safeRed.dispositivos}</p>
            <p className="text-xs text-purple-500 font-bold mt-1">Equipos en red ({safeRed.ipsLibres} IPs libres)</p>
          </div>
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner">
            <Network className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incidencias Prioritarias (Operativo en tiempo real) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Incidencias Prioritarias Pendientes</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {incidenciasPrioritarias.length} activas
            </span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {incidenciasPrioritarias.length > 0 ? (
              incidenciasPrioritarias.map((ticket) => (
                <div key={ticket.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        TIC-{(ticket.id || '').substring(0, 5).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ticket.prioridad === 'CRITICA'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : ticket.prioridad === 'ALTA'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {ticket.prioridad}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {ticket.estado === 'EN_PROGRESO' ? 'En atención' : 'Abierto'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm truncate" title={ticket.titulo}>
                      {ticket.titulo}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{ticket.sede || 'Clínica'} - {ticket.departamento || 'General'}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 font-medium">
                      {ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-slate-700">Sin incidencias urgentes pendientes</p>
                <p className="text-xs text-slate-400 mt-0.5">Todas las atenciones prioritarias han sido atendidas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Equipo Técnico y Disponibilidad */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Equipo Técnico</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {usuarios.length} especialistas
            </span>
          </div>
          <div className="p-0 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {usuarios.length > 0 ? usuarios.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm overflow-hidden">
                      {user.avatar && user.avatar.length > 2 ? (
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover bg-slate-100" />
                      ) : (
                        user.avatar || (user.nombre || 'TI').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Activo"></span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{user.nombre}</h4>
                    <p className="text-xs text-slate-500 truncate">{user.email || 'tecnico@empresa.com'}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                    user.rol === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {user.rol === 'ADMIN' ? 'Administrador' : 'Soporte TI'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-slate-500">No se encontraron técnicos registrados.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
