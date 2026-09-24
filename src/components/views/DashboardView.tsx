import { Ticket, Clock, Network, CheckCircle2, ShieldAlert, Users, MapPin, GraduationCap, BookOpen, ArrowRight, Activity, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats, getEstadisticasRed, getTickets, getUsuarios } from '@/services/api/api-client';
import { UserAvatar } from '@/components/common/UserAvatar';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-w-[1700px] mx-auto">
      {/* Elemento de diseño de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Cabecera Adaptada */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 block md:hidden">
            Portal TI & Operaciones
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            <span className="hidden md:inline">Panel de Control General</span>
            <span className="md:hidden">Inicio</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Resumen operativo y estado de servicios en tiempo real.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistemas Hospitalarios Operando
          </span>
        </div>
      </div>

      {/* Estado del Sistema (KPIs Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Estado del Sistema</h2>
          <span className="text-[11px] text-slate-400 font-medium">Actualizado en vivo</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {/* KPI 1: Tickets Activos */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Tickets Activos</p>
              <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                <span className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">{ticketsActivos}</span>
                {ticketsActivos === 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">En orden</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Histórico total: {safeStats.total}</p>
            </div>
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center self-end sm:self-start mt-2 sm:mt-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
              <Ticket className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </div>

          {/* KPI 2: Resueltos Hoy */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Resueltos Hoy</p>
              <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                <span className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">{safeStats.resueltos}</span>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Activity className="w-3 h-3 text-emerald-600" /> Ritmo
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Excelente desempeño
              </p>
            </div>
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center self-end sm:self-start mt-2 sm:mt-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-inner">
              <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </div>

          {/* KPI 3: Infraestructura Hospitalaria (Banner completo en celular) */}
          <div className="col-span-2 md:col-span-1 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <Network className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  Infraestructura Hospitalaria
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-slate-500 font-semibold">{safeRed.dispositivos} equipos activos en red</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {safeRed.ipsLibres} IPs libres
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Subred VLAN-TI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hub de Conocimiento TI (Academia en Morado, PDFs y Manuales en Rojo) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Hub de Conocimiento TI</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Recursos normativos, manuales operativos y formación continua</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Tarjeta Academia TI (Morado Vibrante) */}
          <div 
            onClick={() => onNavigate?.('academy')}
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-purple-300/80 bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-900 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="inline-block text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 text-purple-100 mb-1">
                CAMPUS TI
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                Academia TI
              </h3>
              <p className="text-[11px] text-purple-100/90 mt-1 line-clamp-2 leading-relaxed">
                Capacitación continua, retos técnicos y gamificación.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-200 group-hover:text-white transition-colors">
              <span>Módulos de formación</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tarjeta Guías y Manuales / PDF (Rojo Vibrante) */}
          <div 
            onClick={() => onNavigate?.('knowledge')}
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-rose-300/80 bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[160px] sm:min-h-[175px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="inline-block text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 text-rose-100 mb-1">
                SOP & MANUALES PDF
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                Guías y PDFs
              </h3>
              <p className="text-[11px] text-rose-100/90 mt-1 line-clamp-2 leading-relaxed">
                Manuales de software HIS, switches de planta y protocolos.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-200 group-hover:text-white transition-colors">
              <span>Ver Documentación</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Incidencias Prioritarias (Operativo en tiempo real) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Incidencias Prioritarias</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              incidenciasPrioritarias.length > 0 
                ? 'bg-rose-100 text-rose-700' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
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
              <div className="p-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-base">Sin incidencias urgentes</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Todas las atenciones de alta prioridad médica han sido atendidas satisfactoriamente en guardia.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>HIS & Emergencias operando al 100%</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equipo Técnico de Turno */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Equipo Técnico de Turno</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {usuarios.length} especialistas
            </span>
          </div>
          <div className="p-0 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {usuarios.length > 0 ? usuarios.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    avatar={user.avatar}
                    name={user.nombre}
                    size="md"
                    indicator="online"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{user.nombre}</h4>
                    <p className="text-xs text-slate-500 truncate">{user.email || 'tecnico@clinica.com'}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                    user.rol === 'ADMIN'
                      ? 'bg-slate-900 text-white'
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

