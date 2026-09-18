import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Zap,
  X,
  ChevronDown,
  MapPin,
  Building2,
  Inbox,
  Wrench,
} from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import {
  TicketKanbanBoard,
  TicketHistoryTable,
  TicketHistoryDrawer,
  TicketDetailModal,
  TicketCreateModal,
} from '@/components/helpdesk';

interface HelpdeskViewProps {
  userId?: string;
  onTicketResolved?: () => void;
}

export function HelpdeskView({ userId, onTicketResolved }: HelpdeskViewProps) {
  const {
    tickets,
    loading,
    draggedTicket,
    setDraggedTicket,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleCrearTicket,
    handleEliminarTicket,
    handleCerrarTicket,
    handleMoverTicket,
    handleCambiarPrioridad,
    selectedTicket,
    setSelectedTicket,
    solucionInput,
    setSolucionInput,
    isEditingSolucion,
    setIsEditingSolucion,
    isSavingSolucion,
    handleAbrirDetalle,
    handleGuardarSolucion,
    activeDropdown,
    setActiveDropdown,
    isModalOpen,
    setIsModalOpen,
    nuevoTitulo,
    setNuevoTitulo,
    nuevaSede,
    setNuevaSede,
    nuevoDepartamento,
    setNuevoDepartamento,
    nuevaArea,
    setNuevaArea,
    sedesList,
    departamentosList,
    areasList,
    isHistoryDrawerOpen,
    setIsHistoryDrawerOpen,
  } = useTickets({ userId, onTicketResolved });

  // Estados de búsqueda y filtros para el TABLERO KANBAN
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoardEmergency, setFilterBoardEmergency] = useState<string>('TODAS');
  const [isBoardEmergencyOpen, setIsBoardEmergencyOpen] = useState(false);
  const [filterBoardSede, setFilterBoardSede] = useState<string>('TODAS');
  const [isBoardSedeOpen, setIsBoardSedeOpen] = useState(false);

  // Filtro de Sedes para Historial (independiente del tablero)
  const [filterHistorySede, setFilterHistorySede] = useState<string>('TODAS');
  const [isSedeFilterOpen, setIsSedeFilterOpen] = useState(false);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICA':
        return {
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <ShieldAlert className="w-3 h-3 mr-1" />,
        };
      case 'ALTA':
        return {
          color: 'text-orange-700',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: <AlertCircle className="w-3 h-3 mr-1" />,
        };
      case 'MEDIA':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <Clock className="w-3 h-3 mr-1" />,
        };
      case 'BAJA':
        return {
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
        };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: null };
    }
  };

  const query = searchQuery.toLowerCase().trim();

  // Lista dinámica de sedes combinando catálogo oficial de la BD y sedes existentes en tickets
  const sedesDisponibles = Array.from(
    new Set([...sedesList, ...tickets.map((t) => t.sede).filter(Boolean)])
  )
    .filter(Boolean)
    .sort();

  // Filtrado reactivo EXCLUSIVO para las cajas del tablero Kanban (tickets activos)
  const filterActiveTicket = (t: any) => {
    if (query) {
      const matchTitle = t.titulo?.toLowerCase().includes(query);
      const matchDept = t.departamento?.toLowerCase().includes(query);
      const matchSede = t.sede?.toLowerCase().includes(query);
      const matchSolicitante = t.solicitanteNombre?.toLowerCase().includes(query);
      const matchId = t.id?.toLowerCase().includes(query);
      if (!Boolean(matchTitle || matchDept || matchSede || matchSolicitante || matchId)) {
        return false;
      }
    }

    if (filterBoardEmergency !== 'TODAS') {
      if (filterBoardEmergency === 'EMERGENCIAS') {
        if (t.prioridad !== 'CRITICA' && t.prioridad !== 'ALTA') return false;
      } else if (t.prioridad !== filterBoardEmergency) {
        return false;
      }
    }

    if (filterBoardSede !== 'TODAS') {
      if (t.sede?.toLowerCase().trim() !== filterBoardSede.toLowerCase().trim()) {
        return false;
      }
    }

    return true;
  };

  const activeTickets = tickets.filter((t) => t.estado !== 'CERRADO').filter(filterActiveTicket);

  const countBoardSede = (sedeName: string) => {
    const base = tickets.filter((t) => t.estado !== 'CERRADO');
    if (sedeName === 'TODAS') return base.length;
    return base.filter((t) => t.sede?.toLowerCase().trim() === sedeName.toLowerCase().trim()).length;
  };

  const countBoardEmergency = (prioKey: string) => {
    const base = tickets.filter((t) => t.estado !== 'CERRADO');
    if (prioKey === 'TODAS') return base.length;
    if (prioKey === 'EMERGENCIAS')
      return base.filter((t) => t.prioridad === 'CRITICA' || t.prioridad === 'ALTA').length;
    return base.filter((t) => t.prioridad === prioKey).length;
  };

  const allHistoryTickets = tickets.filter((t) => t.estado === 'CERRADO');

  const historyTickets = allHistoryTickets.filter((t) => {
    if (filterHistorySede === 'TODAS') return true;
    return t.sede?.toLowerCase().trim() === filterHistorySede.toLowerCase().trim();
  });

  const countPorSede = (sedeName: string) => {
    if (sedeName === 'TODAS') return allHistoryTickets.length;
    return allHistoryTickets.filter((t) => t.sede?.toLowerCase().trim() === sedeName.toLowerCase().trim()).length;
  };

  const columnas = [
    {
      id: 'ABIERTO',
      title: 'Abiertos',
      subtitle: 'En espera de atención',
      bgClass: 'bg-slate-50/60 kanban-col-abierto',
      borderClass: 'border-slate-200',
      accentBar: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500',
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-200/80 kanban-badge-abierto',
      emptyIcon: <Inbox className="w-8 h-8 text-amber-500/90" />,
      emptyTitle: '¡Todo al día!',
      emptyDesc: 'No hay tickets pendientes esperando atención en este momento.',
    },
    {
      id: 'EN_PROGRESO',
      title: 'En Progreso',
      subtitle: 'En resolución activa',
      bgClass: 'bg-blue-50/40 kanban-col-progreso',
      borderClass: 'border-blue-200/70',
      accentBar: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600',
      badgeBg: 'bg-blue-100 text-blue-700 border-blue-200/80 kanban-badge-progreso',
      emptyIcon: <Wrench className="w-8 h-8 text-blue-500/90" />,
      emptyTitle: 'Listo para resolver',
      emptyDesc: 'Arrastra un ticket aquí para comenzar a trabajar en su solución.',
    },
    {
      id: 'RESUELTO',
      title: 'Resueltos',
      subtitle: 'Completados recientemente',
      bgClass: 'bg-emerald-50/40 kanban-col-resuelto',
      borderClass: 'border-emerald-200/70',
      accentBar: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200/80 kanban-badge-resuelto',
      emptyIcon: <CheckCircle2 className="w-8 h-8 text-emerald-500/90" />,
      emptyTitle: 'Tickets resueltos',
      emptyDesc: 'Los tickets solucionados por el equipo aparecerán aquí.',
    },
  ];

  const hasActiveFilters = Boolean(query || filterBoardEmergency !== 'TODAS' || filterBoardSede !== 'TODAS');

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterBoardEmergency('TODAS');
    setFilterBoardSede('TODAS');
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Cargando tablero...</div>;
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col space-y-4 md:space-y-5 animate-in fade-in duration-500 overflow-hidden">
      {/* Cabecera Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Tickets de Soporte</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200/70 shadow-xs">
              <Zap className="w-3 h-3 fill-indigo-500 text-indigo-500" /> Tablero Vivo
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Arrastra las tarjetas para cambiar su estado. ¡Gana XP al resolver incidencias!
          </p>
        </div>

        {/* Buscador y Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, sede, autor..."
              className="pl-9.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-full sm:w-64 shadow-xs transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* FILTRO 1: Emergencia */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsBoardEmergencyOpen(!isBoardEmergencyOpen);
                setIsBoardSedeOpen(false);
              }}
              className={`px-3 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-xs transition-all duration-200 hover:shadow-md active:scale-95 border cursor-pointer ${
                filterBoardEmergency !== 'TODAS'
                  ? filterBoardEmergency === 'CRITICA' || filterBoardEmergency === 'EMERGENCIAS'
                    ? 'bg-red-50 border-red-300 text-red-700 ring-2 ring-red-500/20 shadow-red-100'
                    : filterBoardEmergency === 'ALTA'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-500/20 shadow-orange-100'
                    : 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Filtrar por nivel de emergencia e importancia"
            >
              <ShieldAlert
                className={`w-4 h-4 ${
                  filterBoardEmergency === 'CRITICA' || filterBoardEmergency === 'EMERGENCIAS'
                    ? 'text-red-600'
                    : filterBoardEmergency === 'ALTA'
                    ? 'text-orange-600'
                    : filterBoardEmergency !== 'TODAS'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              />
              <span className="flex items-center gap-1">
                <span className="text-slate-500 font-normal hidden xl:inline">Urgencia:</span>
                <span>
                  {filterBoardEmergency === 'TODAS' && 'Emergencia / Importancia'}
                  {filterBoardEmergency === 'EMERGENCIAS' && '🚨 Emergencias / Altas'}
                  {filterBoardEmergency === 'CRITICA' && '🚨 Crítica'}
                  {filterBoardEmergency === 'ALTA' && '⚠️ Importante'}
                  {filterBoardEmergency === 'MEDIA' && '⏱️ Normal'}
                  {filterBoardEmergency === 'BAJA' && '🟢 Baja'}
                </span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isBoardEmergencyOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {isBoardEmergencyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsBoardEmergencyOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Nivel de Emergencia</span>
                    {filterBoardEmergency !== 'TODAS' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterBoardEmergency('TODAS');
                          setIsBoardEmergencyOpen(false);
                        }}
                        className="text-blue-600 hover:underline font-bold text-[10px] normal-case cursor-pointer"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                  <div className="py-1 space-y-0.5">
                    {[
                      { id: 'TODAS', label: 'Todas las prioridades', icon: <Filter className="w-3.5 h-3.5 text-slate-400" />, color: 'text-slate-700' },
                      { id: 'EMERGENCIAS', label: '🚨 Solo Emergencias (Crítica / Alta)', icon: null, color: 'text-red-700 font-bold' },
                      { id: 'CRITICA', label: '🚨 Crítica (Emergencia Total)', icon: null, color: 'text-red-700' },
                      { id: 'ALTA', label: '⚠️ Alta (Muy Importante)', icon: null, color: 'text-orange-700' },
                      { id: 'MEDIA', label: '⏱️ Media (Atención Normal)', icon: null, color: 'text-yellow-700' },
                      { id: 'BAJA', label: '🟢 Baja (Rutinaria / Menor)', icon: null, color: 'text-green-700' },
                    ].map((opt) => {
                      const isSelected = filterBoardEmergency === opt.id;
                      const count = countBoardEmergency(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFilterBoardEmergency(opt.id);
                            setIsBoardEmergencyOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-700 font-bold' : `${opt.color} hover:bg-slate-100 font-medium`
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FILTRO 2: Sedes */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsBoardSedeOpen(!isBoardSedeOpen);
                setIsBoardEmergencyOpen(false);
              }}
              className={`px-3 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-xs transition-all duration-200 hover:shadow-md active:scale-95 border cursor-pointer ${
                filterBoardSede !== 'TODAS'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/20 shadow-indigo-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Filtrar cajas del tablero por sede"
            >
              <MapPin className={`w-4 h-4 ${filterBoardSede !== 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500 font-normal hidden xl:inline">Sede:</span>
                <span className={filterBoardSede !== 'TODAS' ? 'text-indigo-700 font-black' : 'text-slate-900'}>
                  {filterBoardSede === 'TODAS' ? 'Todas las Sedes' : filterBoardSede}
                </span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isBoardSedeOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {isBoardSedeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsBoardSedeOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Sede del Tablero
                    </span>
                    {filterBoardSede !== 'TODAS' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterBoardSede('TODAS');
                          setIsBoardSedeOpen(false);
                        }}
                        className="text-indigo-600 hover:underline font-bold text-[10px] normal-case cursor-pointer"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterBoardSede('TODAS');
                        setIsBoardSedeOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                        filterBoardSede === 'TODAS' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${filterBoardSede === 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>Todas las Sedes</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          filterBoardSede === 'TODAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {countBoardSede('TODAS')}
                      </span>
                    </button>
                    {sedesDisponibles.map((sede) => {
                      const isSelected = filterBoardSede.toLowerCase().trim() === sede.toLowerCase().trim();
                      const count = countBoardSede(sede);
                      return (
                        <button
                          key={sede}
                          type="button"
                          onClick={() => {
                            setFilterBoardSede(sede);
                            setIsBoardSedeOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{sede}</span>
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Indicador de Filtros Activos exclusivos para las Cajas */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-slate-600 shrink-0 animate-in fade-in">
          <span className="font-bold text-blue-900 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtros aplicados a las cajas:
          </span>
          {filterBoardEmergency !== 'TODAS' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-blue-800 font-bold shadow-2xs">
              Urgencia:{' '}
              {filterBoardEmergency === 'EMERGENCIAS'
                ? '🚨 Emergencias'
                : filterBoardEmergency === 'CRITICA'
                ? '🚨 Crítica'
                : filterBoardEmergency === 'ALTA'
                ? '⚠️ Alta'
                : filterBoardEmergency === 'MEDIA'
                ? '⏱️ Media'
                : '🟢 Baja'}
              <button
                type="button"
                onClick={() => setFilterBoardEmergency('TODAS')}
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400 cursor-pointer"
                title="Quitar filtro de urgencia"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterBoardSede !== 'TODAS' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800 font-bold shadow-2xs">
              Sede: {filterBoardSede}
              <button
                type="button"
                onClick={() => setFilterBoardSede('TODAS')}
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400 cursor-pointer"
                title="Quitar filtro de sede"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 font-bold shadow-2xs">
              Búsqueda: &quot;{searchQuery}&quot;
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-blue-700 hover:text-blue-900 font-bold underline ml-auto text-xs cursor-pointer"
          >
            Limpiar filtros del tablero
          </button>
        </div>
      )}

      {/* Tablero Kanban (3 Columnas) */}
      <TicketKanbanBoard
        columnas={columnas}
        activeTickets={activeTickets}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleAbrirDetalle={handleAbrirDetalle}
        handleMoverTicket={handleMoverTicket}
        handleCerrarTicket={handleCerrarTicket}
        handleCambiarPrioridad={handleCambiarPrioridad}
        handleEliminarTicket={handleEliminarTicket}
        getPriorityStyle={getPriorityStyle}
        hasActiveFilters={hasActiveFilters}
        handleResetFilters={handleResetFilters}
      />

      {/* Botón Responsive para Historial Móvil */}
      <div className="md:hidden shrink-0 pt-1">
        <button
          type="button"
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="w-full p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-lg border border-slate-700/60 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold flex items-center gap-2">
                Historial de Tickets Cerrados
                <span className="bg-indigo-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                  {historyTickets.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Toca para abrir y consultar soluciones aplicadas</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-indigo-300 -rotate-90 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Tabla de Historial Desktop */}
      <TicketHistoryTable
        historyTickets={historyTickets}
        filterHistorySede={filterHistorySede}
        setFilterHistorySede={setFilterHistorySede}
        isSedeFilterOpen={isSedeFilterOpen}
        setIsSedeFilterOpen={setIsSedeFilterOpen}
        sedesDisponibles={sedesDisponibles}
        countPorSede={countPorSede}
        handleAbrirDetalle={handleAbrirDetalle}
      />

      {/* Modal Crear Ticket */}
      <TicketCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nuevoTitulo={nuevoTitulo}
        setNuevoTitulo={setNuevoTitulo}
        nuevaSede={nuevaSede}
        setNuevaSede={setNuevaSede}
        nuevoDepartamento={nuevoDepartamento}
        setNuevoDepartamento={setNuevoDepartamento}
        nuevaArea={nuevaArea}
        setNuevaArea={setNuevaArea}
        sedesList={sedesList}
        departamentosList={departamentosList}
        areasList={areasList}
        handleCrearTicket={handleCrearTicket}
      />

      {/* Drawer Móvil de Historial */}
      <TicketHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        historyTickets={historyTickets}
        filterHistorySede={filterHistorySede}
        setFilterHistorySede={setFilterHistorySede}
        sedesDisponibles={sedesDisponibles}
        countPorSede={countPorSede}
        handleAbrirDetalle={handleAbrirDetalle}
        searchQuery={searchQuery}
      />

      {/* Modal de Detalle de Ticket */}
      <TicketDetailModal
        selectedTicket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
        solucionInput={solucionInput}
        setSolucionInput={setSolucionInput}
        isEditingSolucion={isEditingSolucion}
        setIsEditingSolucion={setIsEditingSolucion}
        isSavingSolucion={isSavingSolucion}
        handleGuardarSolucion={handleGuardarSolucion}
        handleCambiarPrioridad={handleCambiarPrioridad}
        handleMoverTicket={handleMoverTicket}
        handleCerrarTicket={handleCerrarTicket}
        getPriorityStyle={getPriorityStyle}
      />
    </div>
  );
}
