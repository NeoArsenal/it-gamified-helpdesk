import { Ticket, Clock, ServerOff, Trophy, Star, Target, BookOpen, Network, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats, getLeaderboard, getEstadisticasRed } from '@/services/api/api-client';

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [redStats, setRedStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, lData, rData] = await Promise.all([
          getStats(), 
          getLeaderboard(),
          getEstadisticasRed()
        ]);
        setStats(sData);
        setLeaderboard(lData);
        setRedStats(rData);
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Elemento de diseño de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control General</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen del área de TI y tu progreso gamificado en tiempo real.</p>
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
              <CheckCircle2 className="w-3 h-3" /> Excelente ritmo
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
        {/* Misiones Diarias (Gamificación Estática/Visual para Prototipo) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Misiones Diarias (Simuladas)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Resuelve 5 tickets de prioridad alta</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Progreso: 3/5 tickets</p>
                </div>
              </div>
              <span className="font-bold text-amber-500 text-sm bg-amber-50 px-3 py-1 rounded-full">+500 XP</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Sube 1 nueva guía a la BD</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Progreso: 0/1 guía</p>
                </div>
              </div>
              <span className="font-bold text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full">+200 XP</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Real */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800">Top Técnicos de la Semana</h3>
          </div>
          <div className="p-0">
            {leaderboard.length > 0 ? leaderboard.map((user, idx) => {
              // Estilos para los top 3
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              
              let badgeColor = 'bg-slate-100 text-slate-600 border-slate-300';
              let rowStyle = 'hover:bg-slate-50';
              if (isFirst) { badgeColor = 'bg-amber-100 text-amber-600 border-amber-300 shadow-sm shadow-amber-200'; rowStyle = 'bg-amber-50/30 hover:bg-amber-50'; }
              if (isSecond) { badgeColor = 'bg-slate-200 text-slate-700 border-slate-400 shadow-sm'; rowStyle = 'bg-slate-50/50 hover:bg-slate-50'; } 
              if (isThird) { badgeColor = 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm'; rowStyle = 'bg-orange-50/30 hover:bg-orange-50'; } 

              return (
                <div key={user.id} className={`flex items-center justify-between p-4 border-b border-slate-100 transition-all duration-300 group ${rowStyle}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm border group-hover:scale-110 transition-transform ${badgeColor}`}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-300 transition-all">
                      {user.avatar && user.avatar.length > 2 ? (
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover bg-slate-100" />
                      ) : (
                        user.avatar || user.nombre.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{user.nombre}</h4>
                      <p className="text-xs text-slate-500 font-medium">Lvl {user.nivel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-lg group-hover:text-amber-500 transition-colors">{user.xpActual}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">EXP</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-6 text-center text-sm text-slate-500">Aún no hay técnicos rankeados.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
