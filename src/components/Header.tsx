import { Bell, Menu, ShieldCheck } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 md:gap-0">
        {/* Hamburger para móviles */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Acciones del Top Header */}
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        {/* Estado Operativo */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs md:text-sm font-semibold">Sistemas Operativos</span>
        </div>

        {/* Notificaciones SLA */}
        <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white box-content"></span>
        </button>
      </div>
    </header>
  );
}
