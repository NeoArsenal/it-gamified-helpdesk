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


  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 
      transition-transform duration-300 ease-in-out
      fixed md:relative z-50 left-0 top-0 
      w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0
    `}>
      {/* Perfil Profesional */}
      <div className="p-5 border-b border-slate-800">
        {!perfil ? (
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0"></div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 bg-slate-800 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-400/40 shadow-sm overflow-hidden text-white font-bold">
                {perfil.avatar && perfil.avatar.length > 2 ? (
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${perfil.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover bg-slate-100" />
                ) : (
                  <span>{perfil.avatar || 'TI'}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" title="En línea"></span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm text-white truncate" title={perfil.nombre}>{perfil.nombre}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  perfil.rol === 'ADMIN'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {perfil.rol === 'ADMIN' ? 'Administrador TI' : 'Soporte TI'}
                </span>
              </div>
            </div>
          </div>
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
