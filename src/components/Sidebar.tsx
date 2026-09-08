import { LayoutDashboard, Ticket, Network, BookOpen, Settings, Box, BarChart3, GraduationCap, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './providers/AuthProvider';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userId: string;
  refreshTrigger: number;
  isOpen?: boolean;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'network', label: 'Equipos y Red', icon: Network },
  { id: 'knowledge', label: 'Guías y Manuales', icon: BookOpen },
  { id: 'academy', label: 'Academia TI', icon: GraduationCap },
  { id: 'inventory', label: 'Inventario IT', icon: Box },
  { id: 'analytics', label: 'Analítica', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

import { getPerfilUsuario } from '@/services/api/api-client';
import { useEffect, useState } from 'react';

export function Sidebar({ activeView, setActiveView, userId, refreshTrigger, isOpen }: SidebarProps) {
  const [perfil, setPerfil] = useState<any>(null);
  const { user, logout } = useAuth();

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

  // Calcular progreso
  const xpSiguienteNivel = perfil?.xpParaSiguienteNivel || 1000;
  const progreso = perfil?.progresoNivel || 0;

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 
      transition-transform duration-300 ease-in-out
      fixed md:relative z-50 left-0 top-0 
      w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0
    `}>
      {/* Perfil Gamificado */}
      <div className="p-6 border-b border-slate-800 min-h-[160px]">
        {!perfil ? (
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-slate-800"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded w-full"></div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800"></div>
              <div className="w-6 h-6 rounded-full bg-slate-800"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] overflow-hidden">
                {perfil.avatar && perfil.avatar.length > 2 ? (
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${perfil.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover bg-slate-100" />
                ) : (
                  <span className="font-bold text-lg text-white">{perfil.avatar || 'JD'}</span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-sm">{perfil.nombre}</h2>
                <p className="text-xs text-amber-400 font-medium">
                  Lvl {perfil.nivel} - {perfil.tituloRPG ? perfil.tituloRPG : `Rol ${perfil.rol}`}
                </p>
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
          </>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          // Filtrado de permisos
          if (user?.rol !== 'ADMIN' && !user?.modulosAccesibles?.includes(item.id)) {
            return null;
          }

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

        {/* Solo administradores ven Gestión de Usuarios */}
        {user?.rol === 'ADMIN' && (
          <button
            onClick={() => setActiveView('users')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
              activeView === 'users'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users className="w-5 h-5" />
            Gestión de Usuarios
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
