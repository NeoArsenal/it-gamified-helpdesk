import { Search, Bell, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Buscador Global */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar tickets, equipos o guías..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {/* Acciones del Top Header */}
      <div className="flex items-center gap-6">
        {/* Puntos de la semana */}
        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200">
          <Zap className="w-4 h-4 fill-amber-500" />
          <span className="text-sm font-bold">1,250 pts esta semana</span>
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
