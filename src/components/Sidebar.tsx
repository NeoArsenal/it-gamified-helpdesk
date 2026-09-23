import { LayoutDashboard, Ticket, Network, BookOpen, Box, BarChart3, GraduationCap, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './providers/AuthProvider';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userId?: string;
  refreshTrigger?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'network', label: 'Equipos y Red', icon: Network },
  { id: 'knowledge', label: 'Guías y Manuales', icon: BookOpen },
  { id: 'academy', label: 'Academia TI', icon: GraduationCap },
  { id: 'inventory', label: 'Inventario IT', icon: Box },
  { id: 'analytics', label: 'Analítica', icon: BarChart3 },
];

export function Sidebar({ activeView, setActiveView, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 
      transition-transform duration-300 ease-in-out
      fixed md:relative z-[70] md:z-0 left-0 top-0 
      w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0 shadow-2xl md:shadow-none
    `}>
      {/* Cabecera del Sidebar: Logo Institucional & Soporte TI */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md shadow-black/20 border border-slate-700/60 transition-transform duration-200 hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/emblem.svg" 
              alt="Logo Clínica Limatambo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-brand select-none">
              <span className="block text-[11px] font-extrabold text-[#e11d48] uppercase tracking-[0.16em] leading-none">
                CLINICAS
              </span>
              <span className="block text-[15px] font-extrabold text-[#e11d48] uppercase tracking-[0.04em] leading-none mt-1">
                LIMATAMBO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Soporte TI
              </span>
            </div>
          </div>
        </div>

        {/* Botón cerrar en móvil */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 ml-1"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
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
    </aside>
  );
}
