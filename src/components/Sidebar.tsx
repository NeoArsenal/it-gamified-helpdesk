import { LayoutDashboard, Ticket, Network, BookOpen, Settings, Box, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userId: string;
  refreshTrigger: number;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'network', label: 'Equipos y Red', icon: Network },
  { id: 'knowledge', label: 'Guías y Manuales', icon: BookOpen },
  { id: 'inventory', label: 'Inventario IT', icon: Box },
  { id: 'analytics', label: 'Analítica', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

import { getPerfilUsuario } from '@/services/api/api-client';
import { useEffect, useState } from 'react';

export function Sidebar({ activeView, setActiveView, userId, refreshTrigger }: SidebarProps) {
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await getPerfilUsuario(userId);
        setPerfil(data);
      } catch (err) {
        console.error('Error fetching perfil', err);
      }
    };
    if (userId) fetchPerfil();
  }, [userId, refreshTrigger]);

  // Si no ha cargado, mostramos skeleton
  if (!perfil) {
    return (
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 animate-pulse">
        <div className="p-6 border-b border-slate-800 h-40"></div>
      </aside>
    );
  }

  // Calcular progreso (el backend ya nos lo provee)
  const xpSiguienteNivel = perfil.xpParaSiguienteNivel || perfil.nivel * 1000;
  const progreso = perfil.progresoNivel || 0;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0">
      {/* Perfil Gamificado */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            <span className="font-bold text-lg text-white">{perfil.avatar || 'JD'}</span>
          </div>
          <div>
            <h2 className="font-semibold text-sm">{perfil.nombre}</h2>
            <p className="text-xs text-amber-400 font-medium">Lvl {perfil.nivel} - Rol {perfil.rol}</p>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>XP</span>
            <span>{perfil.xpActual} / {xpSiguienteNivel}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, progreso))}%` }}></div>
          </div>
        </div>

        {/* Medallas pequeñas */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {perfil.medallas?.length > 0 ? (
            perfil.medallas.map((m: any) => (
              <div key={m.id} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs" title={m.descripcion}>
                {m.icono}
              </div>
            ))
          ) : (
            <span className="text-[10px] text-slate-500">Sin medallas aún</span>
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
