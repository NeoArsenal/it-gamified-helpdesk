import { 
  Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, MoreHorizontal, 
  User, ShieldAlert, Zap, GripVertical, X, CalendarClock, Ticket as TicketIcon, 
  Trash2, Archive, ChevronDown, MapPin, Play, RotateCcw, ChevronRight, 
  FileText, Check, Edit3, Phone, Inbox, Wrench, Building2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  getTickets, actualizarEstadoTicket, actualizarTicket, crearTicket, 
  eliminarTicket, getUbicacionesSedes, getUbicacionesDepartamentos, 
  getUbicacionesAreas, socket, safeStorage 
} from '@/services/api/api-client';
import { toast } from 'sonner';

interface HelpdeskViewProps {
  userId?: string;
  onTicketResolved?: () => void;
}

function CustomSelect({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative flex-1 md:flex-none min-w-[200px]">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl text-sm hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold shadow-sm"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${value === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
              >
                {opt}
                {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-400 text-center italic">No hay opciones</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HelpdeskView({ userId, onTicketResolved }: HelpdeskViewProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);

  // Estados de búsqueda reactiva y filtros para el TABLERO KANBAN (exclusivo para las cajas activas)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoardEmergency, setFilterBoardEmergency] = useState<string>('TODAS');
  const [isBoardEmergencyOpen, setIsBoardEmergencyOpen] = useState(false);
  const [filterBoardSede, setFilterBoardSede] = useState<string>('TODAS');
  const [isBoardSedeOpen, setIsBoardSedeOpen] = useState(false);
  
  // Filtro de Sedes para Historial (independiente del tablero)
  const [filterHistorySede, setFilterHistorySede] = useState<string>('TODAS');
  const [isSedeFilterOpen, setIsSedeFilterOpen] = useState(false);

  // Estados del modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaSede, setNuevaSede] = useState('');
  const [nuevoDepartamento, setNuevoDepartamento] = useState('');
  const [nuevaArea, setNuevaArea] = useState('');

  const [sedesList, setSedesList] = useState<string[]>([]);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);

  // Estados de interfaz adicionales
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Estados para Drawer Móvil de Historial y Modal de Solución/Detalle
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [solucionInput, setSolucionInput] = useState('');
  const [isEditingSolucion, setIsEditingSolucion] = useState(false);
  const [isSavingSolucion, setIsSavingSolucion] = useState(false);

  const fetchTicketsData = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();

    // Cargar sedes desde el catálogo de la BD en segundo plano
    getUbicacionesSedes().then(data => {
      setSedesList(data);
    }).catch(console.error);

    // Asegurar conexión del socket en tiempo real
    const token = safeStorage.getItem('auth_token');
    if (token) {
      socket.auth = { token };
    }
    if (!socket.connected) {
      socket.connect();
    }

    // Configurar listeners
    const handleNuevoTicket = (ticket: any) => {
      console.log('WS Event received: nuevoTicket', ticket);
      setTickets((prev) => {
        if (prev.find(t => t.id === ticket.id)) return prev;
        return [ticket, ...prev];
      });
      
      // Notificación sonora y visual (Evitar caché del navegador)
      const audio = new Audio('/notification.mp3?v=' + new Date().getTime());
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Autoplay prevent:', e));
      
      toast.success('¡Nuevo Ticket Recibido!', {
        description: ticket.titulo,
        duration: 5000,
      });
    };

    const handleTicketActualizado = (updatedTicket: any) => {
      console.log('WS Event received: ticketActualizado', updatedTicket);
      setTickets((prev) => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
      setSelectedTicket((prev: any) => prev?.id === updatedTicket.id ? { ...prev, ...updatedTicket } : prev);
    };

    const handleTicketEliminado = (id: string) => {
      console.log('WS Event received: ticketEliminado', id);
      setTickets((prev) => prev.filter(t => t.id !== id));
      setSelectedTicket((prev: any) => prev?.id === id ? null : prev);
    };

    socket.on('nuevoTicket', handleNuevoTicket);
    socket.on('ticketActualizado', handleTicketActualizado);
    socket.on('ticketEliminado', handleTicketEliminado);

    return () => {
      socket.off('nuevoTicket', handleNuevoTicket);
      socket.off('ticketActualizado', handleTicketActualizado);
      socket.off('ticketEliminado', handleTicketEliminado);
    };
  }, []);

  // Cargar sedes cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      getUbicacionesSedes().then(data => {
        setSedesList(data);
        if (data.length > 0) setNuevaSede(data[0]);
      }).catch(console.error);
    }
  }, [isModalOpen]);

  // Cargar departamentos cuando cambia la sede
  useEffect(() => {
    if (nuevaSede) {
      getUbicacionesDepartamentos(nuevaSede).then(data => {
        setDepartamentosList(data);
        if (data.length > 0) setNuevoDepartamento(data[0]);
        else setNuevoDepartamento('');
      }).catch(console.error);
    }
  }, [nuevaSede]);

  // Cargar áreas cuando cambia el departamento
  useEffect(() => {
    if (nuevaSede && nuevoDepartamento) {
      getUbicacionesAreas(nuevaSede, nuevoDepartamento).then(data => {
        setAreasList(data);
        if (data.length > 0) setNuevaArea(data[0]);
        else setNuevaArea('');
      }).catch(console.error);
    } else {
      setAreasList([]);
      setNuevaArea('');
    }
  }, [nuevaSede, nuevoDepartamento]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicket(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    try {
      const nuevo = await crearTicket({
        titulo: nuevoTitulo,
        sede: nuevaSede,
        departamento: nuevoDepartamento,
        ubicacionEspecifica: nuevaArea,
      });
      setIsModalOpen(false);
      setNuevoTitulo('');
      setNuevaSede('');
      setNuevoDepartamento('');
      setNuevaArea('');
      
      if (nuevo && nuevo.id) {
        setTickets((prev) => {
          if (prev.find(t => t.id === nuevo.id)) return prev;
          return [nuevo, ...prev];
        });
      }
      fetchTicketsData();
    } catch (err) {
      console.error('Error al crear', err);
      alert('Hubo un error al crear el ticket');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    if (!draggedTicket || !userId) return;

    const ticket = tickets.find(t => t.id === draggedTicket);
    if (!ticket || ticket.estado === nuevoEstado) {
      setDraggedTicket(null);
      return;
    }

    // Actualización optimista
    setTickets(prev => prev.map(t => t.id === draggedTicket ? { ...t, estado: nuevoEstado } : t));
    if (selectedTicket?.id === draggedTicket) {
      setSelectedTicket((prev: any) => ({ ...prev, estado: nuevoEstado }));
    }
    
    try {
      const res = await actualizarEstadoTicket(draggedTicket, nuevoEstado, userId);
      if (res && res.id) {
        setTickets(prev => prev.map(t => t.id === draggedTicket ? { ...t, ...res } : t));
      }
      if (nuevoEstado === 'RESUELTO') {
        toast.success('¡Ticket marcado como resuelto!');
        if (onTicketResolved) {
          onTicketResolved();
        }
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      fetchTicketsData();
      alert("No se pudo actualizar el estado.");
    } finally {
      setDraggedTicket(null);
    }
  };

  const handleEliminarTicket = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este ticket?")) return;
    try {
      await eliminarTicket(id);
      setSelectedTicket((prev: any) => prev?.id === id ? null : prev);
      fetchTicketsData();
      toast.success('Ticket eliminado');
    } catch (err) {
      alert("Error al eliminar ticket");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleCerrarTicket = async (id: string, solucion?: string) => {
    if (!userId) return;
    try {
      await actualizarEstadoTicket(id, 'CERRADO', userId, solucion);
      toast.success('Ticket archivado y cerrado');
      setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, estado: 'CERRADO', solucion: solucion ?? prev.solucion } : prev));
      fetchTicketsData();
    } catch (err) {
      alert("Error al cerrar ticket");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleMoverTicket = async (id: string, nuevoEstado: string, estadoActual: string) => {
    if (!userId) return;
    if (estadoActual === nuevoEstado) return;
    
    // Actualización optimista
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev));
    
    try {
      const res = await actualizarEstadoTicket(id, nuevoEstado, userId);
      if (res && res.id) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, ...res } : t));
        setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, ...res } : prev));
      }
      if (nuevoEstado === 'RESUELTO') {
        toast.success('¡Ticket marcado como resuelto!');
        if (onTicketResolved) {
          onTicketResolved();
        }
      }
    } catch (err) {
      console.error("Error al mover ticket:", err);
      fetchTicketsData();
      alert("Error al mover ticket");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleAbrirDetalle = (ticket: any) => {
    setSelectedTicket(ticket);
    setSolucionInput(ticket.solucion || '');
    setIsEditingSolucion(!ticket.solucion);
  };

  const handleGuardarSolucion = async () => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.id;
    setIsSavingSolucion(true);
    try {
      await actualizarTicket(ticketId, { solucion: solucionInput });
      toast.success('Solución técnica guardada con éxito');
      setSelectedTicket((prev: any) => (prev && prev.id === ticketId ? { ...prev, solucion: solucionInput } : prev));
      setTickets((prev) => prev.map(t => t.id === ticketId ? { ...t, solucion: solucionInput } : t));
      setIsEditingSolucion(false);
    } catch (err) {
      console.error('Error al guardar solución:', err);
      toast.error('No se pudo guardar la solución');
    } finally {
      setIsSavingSolucion(false);
    }
  };

  // El técnico decide o reclasifica el nivel de emergencia / importancia
  const handleCambiarPrioridad = async (id: string, nuevaPrioridad: string) => {
    // Actualización optimista inmediata
    setTickets(prev => prev.map(t => t.id === id ? { ...t, prioridad: nuevaPrioridad } : t));
    setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, prioridad: nuevaPrioridad } : prev));

    try {
      const res = await actualizarTicket(id, { prioridad: nuevaPrioridad });
      if (res && res.id) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, ...res } : t));
        // Solo actualizar selectedTicket si la ventana sigue abierta con este mismo ticket
        setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, ...res } : prev));
      }
      toast.success(`Nivel de emergencia actualizado: ${nuevaPrioridad}`);
    } catch (error) {
      console.error('Error al cambiar prioridad:', error);
      fetchTicketsData();
      toast.error('No se pudo actualizar el nivel de emergencia');
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'CRITICA': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <ShieldAlert className="w-3 h-3 mr-1" /> };
      case 'ALTA': return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <AlertCircle className="w-3 h-3 mr-1" /> };
      case 'MEDIA': return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <Clock className="w-3 h-3 mr-1" /> };
      case 'BAJA': return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
      default: return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: null };
    }
  };

  const query = searchQuery.toLowerCase().trim();

  // Lista dinámica de sedes combinando catálogo oficial de la BD y sedes existentes en tickets
  const sedesDisponibles = Array.from(
    new Set([
      ...sedesList,
      ...tickets.map(t => t.sede).filter(Boolean)
    ])
  ).filter(Boolean).sort();

  // Filtrado reactivo EXCLUSIVO para las cajas del tablero Kanban (tickets activos)
  const filterActiveTicket = (t: any) => {
    // 1. Búsqueda por texto (solo afecta a las cajas del tablero)
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

    // 2. Filtro de Emergencia / Importancia decidido por el técnico
    if (filterBoardEmergency !== 'TODAS') {
      if (filterBoardEmergency === 'EMERGENCIAS') {
        if (t.prioridad !== 'CRITICA' && t.prioridad !== 'ALTA') return false;
      } else if (t.prioridad !== filterBoardEmergency) {
        return false;
      }
    }

    // 3. Filtro de Sede del Tablero
    if (filterBoardSede !== 'TODAS') {
      if (t.sede?.toLowerCase().trim() !== filterBoardSede.toLowerCase().trim()) {
        return false;
      }
    }

    return true;
  };

  const activeTickets = tickets.filter(t => t.estado !== 'CERRADO').filter(filterActiveTicket);

  // Conteos reactivos para los botones de filtro del Tablero Kanban
  const countBoardSede = (sedeName: string) => {
    const base = tickets.filter(t => t.estado !== 'CERRADO');
    if (sedeName === 'TODAS') return base.length;
    return base.filter(t => t.sede?.toLowerCase().trim() === sedeName.toLowerCase().trim()).length;
  };

  const countBoardEmergency = (prioKey: string) => {
    const base = tickets.filter(t => t.estado !== 'CERRADO');
    if (prioKey === 'TODAS') return base.length;
    if (prioKey === 'EMERGENCIAS') return base.filter(t => t.prioridad === 'CRITICA' || t.prioridad === 'ALTA').length;
    return base.filter(t => t.prioridad === prioKey).length;
  };

  // Historial completamente INDEPENDIENTE de los filtros del tablero superior
  const allHistoryTickets = tickets.filter(t => t.estado === 'CERRADO');

  // Historial clasificado por Sede seleccionada en su propia tabla
  const historyTickets = allHistoryTickets.filter(t => {
    if (filterHistorySede === 'TODAS') return true;
    return t.sede?.toLowerCase().trim() === filterHistorySede.toLowerCase().trim();
  });

  // Conteo reactivo por sede para las opciones del filtro del historial
  const countPorSede = (sedeName: string) => {
    if (sedeName === 'TODAS') return allHistoryTickets.length;
    return allHistoryTickets.filter(t => t.sede?.toLowerCase().trim() === sedeName.toLowerCase().trim()).length;
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
      emptyDesc: 'No hay tickets pendientes esperando atención en este momento.'
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
      emptyDesc: 'Arrastra un ticket aquí para comenzar a trabajar en su solución.'
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
      emptyDesc: 'Los tickets solucionados por el equipo aparecerán aquí.'
    }
  ];

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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* FILTRO 1: Tipo de Emergencia / Importancia */}
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
              <ShieldAlert className={`w-4 h-4 ${
                filterBoardEmergency === 'CRITICA' || filterBoardEmergency === 'EMERGENCIAS' ? 'text-red-600' :
                filterBoardEmergency === 'ALTA' ? 'text-orange-600' :
                filterBoardEmergency !== 'TODAS' ? 'text-blue-600' : 'text-slate-400'
              }`} />
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isBoardEmergencyOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {/* Menú desplegable flotante de Emergencia */}
            {isBoardEmergencyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsBoardEmergencyOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Nivel de Emergencia</span>
                    {filterBoardEmergency !== 'TODAS' && (
                      <button
                        type="button"
                        onClick={() => { setFilterBoardEmergency('TODAS'); setIsBoardEmergencyOpen(false); }}
                        className="text-blue-600 hover:underline font-bold text-[10px] normal-case"
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
                    ].map(opt => {
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
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
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

          {/* FILTRO 2: Sedes (exclusivo para las cajas del tablero) */}
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isBoardSedeOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </button>

            {/* Menú desplegable flotante de Sedes */}
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
                        onClick={() => { setFilterBoardSede('TODAS'); setIsBoardSedeOpen(false); }}
                        className="text-indigo-600 hover:underline font-bold text-[10px] normal-case"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => { setFilterBoardSede('TODAS'); setIsBoardSedeOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                        filterBoardSede === 'TODAS' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${filterBoardSede === 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>Todas las Sedes</span>
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        filterBoardSede === 'TODAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {countBoardSede('TODAS')}
                      </span>
                    </button>
                    {sedesDisponibles.map(sede => {
                      const isSelected = filterBoardSede.toLowerCase().trim() === sede.toLowerCase().trim();
                      const count = countBoardSede(sede);
                      return (
                        <button
                          key={sede}
                          type="button"
                          onClick={() => { setFilterBoardSede(sede); setIsBoardSedeOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{sede}</span>
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
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
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Indicador de Filtros Activos exclusivos para las Cajas */}
      {(searchQuery || filterBoardEmergency !== 'TODAS' || filterBoardSede !== 'TODAS') && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-slate-600 shrink-0 animate-in fade-in">
          <span className="font-bold text-blue-900 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtros aplicados a las cajas:
          </span>
          {filterBoardEmergency !== 'TODAS' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-blue-800 font-bold shadow-2xs">
              Urgencia: {
                filterBoardEmergency === 'EMERGENCIAS' ? '🚨 Emergencias' :
                filterBoardEmergency === 'CRITICA' ? '🚨 Crítica' :
                filterBoardEmergency === 'ALTA' ? '⚠️ Alta' :
                filterBoardEmergency === 'MEDIA' ? '⏱️ Media' : '🟢 Baja'
              }
              <button 
                type="button" 
                onClick={() => setFilterBoardEmergency('TODAS')} 
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400"
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
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400"
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
                className="hover:text-red-500 ml-1 p-0.5 text-slate-400"
                title="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterBoardEmergency('TODAS');
              setFilterBoardSede('TODAS');
            }}
            className="text-blue-700 hover:text-blue-900 font-bold underline ml-auto text-xs cursor-pointer"
          >
            Limpiar filtros del tablero
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 md:gap-6 flex-1 min-h-[420px] overflow-x-auto pb-4 shrink-0 snap-x custom-scrollbar">
        {columnas.map(col => {
          const colTickets = activeTickets.filter(t => t.estado === col.id);
          return (
            <div 
              key={col.id} 
              className={`flex-1 min-w-[85vw] sm:min-w-[320px] snap-center rounded-2xl flex flex-col ${col.bgClass} border ${col.borderClass} shadow-xs overflow-hidden transition-all`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Acento superior de color */}
              <div className={`h-1.5 w-full ${col.accentBar} shrink-0`}></div>

              {/* Encabezado de Columna */}
              <div className="p-3.5 px-4 flex items-center justify-between border-b border-slate-200/70 bg-white/80 kanban-col-header backdrop-blur-xs shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{col.title}</h3>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">{col.subtitle}</p>
                </div>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${col.badgeBg}`}>
                  {colTickets.length}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colTickets.map(ticket => {
                  const style = getPriorityStyle(ticket.prioridad);
                  const shortId = `TIC-${ticket.id.substring(0, 5).toUpperCase()}`;
                  return (
                    <div 
                      key={ticket.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                      onClick={() => handleAbrirDetalle(ticket)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 ease-out cursor-pointer active:scale-95 active:shadow-md group relative overflow-hidden"
                    >
                      {/* Efecto de brillo de fondo al hacer hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                      <div className={`flex justify-between items-start mb-2 relative ${activeDropdown === ticket.id ? 'z-50' : 'z-10'}`}>
                        <span className={`flex items-center px-2 py-1 rounded-md text-[10px] font-bold border transform origin-left group-hover:scale-105 transition-transform duration-300 ${style.bg} ${style.color} ${style.border}`}>
                          {style.icon} {ticket.prioridad}
                        </span>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm active:scale-95"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown flotante (Menú de Acciones y Emergencia) */}
                          {activeDropdown === ticket.id && (
                            <div className="absolute right-0 top-8 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-2 ring-1 ring-black/5">
                              {/* Opciones de Estado */}
                              {ticket.estado === 'ABIERTO' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                                >
                                  <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Iniciar Progreso
                                </button>
                              )}
                              {ticket.estado === 'EN_PROGRESO' && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado); }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 flex items-center gap-2.5 transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" /> Marcar Resuelto
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'ABIERTO', ticket.estado); }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                                  >
                                    <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Devolver a Abierto
                                  </button>
                                </>
                              )}
                              {ticket.estado === 'RESUELTO' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCerrarTicket(ticket.id); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                                >
                                  <Archive className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> Cerrar Ticket
                                </button>
                              )}

                              {/* Sección: Decisión Técnica de Emergencia / Importancia */}
                              <div className="h-px w-full bg-slate-100 my-1.5" />
                              <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-indigo-500" /> Nivel de Emergencia
                              </div>
                              {[
                                { id: 'CRITICA', label: '🚨 Crítica', color: 'text-red-700 hover:bg-red-50' },
                                { id: 'ALTA', label: '⚠️ Alta / Importante', color: 'text-orange-700 hover:bg-orange-50' },
                                { id: 'MEDIA', label: '⏱️ Media / Normal', color: 'text-yellow-700 hover:bg-yellow-50' },
                                { id: 'BAJA', label: '🟢 Baja / Rutinaria', color: 'text-green-700 hover:bg-green-50' },
                              ].map(prio => (
                                <button
                                  key={prio.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCambiarPrioridad(ticket.id, prio.id);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full text-left px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${prio.color} ${ticket.prioridad === prio.id ? 'bg-slate-100 font-bold' : ''}`}
                                >
                                  <span>{prio.label}</span>
                                  {ticket.prioridad === prio.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                </button>
                              ))}

                              <div className="h-px w-full bg-slate-100 my-1.5" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEliminarTicket(ticket.id); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug relative z-10 group-hover:text-blue-700 transition-colors">{ticket.titulo}</h4>
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">{shortId}</p>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <CalendarClock className="w-3 h-3 group-hover:animate-pulse" />
                          {ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                        </p>
                      </div>
                    
                      <div className="text-xs text-slate-500 mb-3 space-y-1">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {ticket.sede} - {ticket.departamento} {ticket.ubicacionEspecifica ? `(${ticket.ubicacionEspecifica})` : ''}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.creadoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        {(ticket.solicitanteNombre || ticket.solicitanteContacto) && (
                          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 text-slate-600 font-medium">
                            <User className="w-3.5 h-3.5 text-indigo-400" /> 
                            {ticket.solicitanteNombre || 'Usuario'} 
                            {ticket.solicitanteContacto && ` (${ticket.solicitanteContacto})`}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 overflow-hidden group-hover:ring-2 group-hover:ring-blue-100 transition-all duration-300" title={ticket.asignadoA?.nombre || 'Sin asignar'}>
                            {ticket.asignadoA?.avatar ? (
                              ticket.asignadoA.avatar.length > 2 ? (
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${ticket.asignadoA.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold">{ticket.asignadoA.avatar}</span>
                              )
                            ) : (
                              <User className="w-3 h-3 group-hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-amber-500 text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shadow-sm group-hover:shadow-amber-200 group-hover:bg-amber-100 group-hover:-translate-y-0.5 transition-all duration-300">
                          <Zap className="w-3 h-3 fill-amber-500 group-hover:animate-bounce" /> {ticket.xpRecompensa} XP
                        </div>
                      </div>
                    </div>
                  )
                })}
                {colTickets.length === 0 && (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-300/60 rounded-2xl bg-white/40 kanban-empty-card hover:bg-white/70 transition-all duration-200 group/empty">
                    <div className="w-13 h-13 rounded-2xl bg-white kanban-empty-icon-box shadow-2xs border border-slate-200/80 flex items-center justify-center mb-2.5 group-hover/empty:scale-105 group-hover/empty:shadow-xs transition-all duration-300">
                      {col.emptyIcon}
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">{col.emptyTitle}</h4>
                    <p className="text-xs text-slate-400 max-w-[210px] leading-relaxed mb-3">
                      {(query || filterBoardEmergency !== 'TODAS' || filterBoardSede !== 'TODAS')
                        ? 'No hay tickets en esta columna que coincidan con los filtros del tablero.'
                        : col.emptyDesc}
                    </p>
                    {(query || filterBoardEmergency !== 'TODAS' || filterBoardSede !== 'TODAS') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterBoardEmergency('TODAS');
                          setFilterBoardSede('TODAS');
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-blue-200"
                      >
                        Restablecer filtros
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 bg-white/90 kanban-empty-pill px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                        Arrastra tickets aquí
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modo Responsive: Botón para abrir el Historial de Tickets Cerrados */}
      <div className="md:hidden shrink-0 pt-1">
        <button 
          type="button"
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="w-full p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-lg border border-slate-700/60 flex items-center justify-between group active:scale-[0.98] transition-all"
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
          <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Modo Desktop: Tabla de Historial Inferior */}
      <div className="hidden md:flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 max-h-[340px]">
        <div className="p-3.5 px-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-indigo-600" /> Historial de Tickets Cerrados
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {historyTickets.length} {historyTickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón de Filtro por Sede Dinámico */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSedeFilterOpen(!isSedeFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                  filterHistorySede !== 'TODAS'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500/20 shadow-indigo-100'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                }`}
                title="Filtrar historial por sede"
              >
                <Filter className={`w-3.5 h-3.5 ${filterHistorySede !== 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-normal">Sede:</span>
                  <span className={filterHistorySede !== 'TODAS' ? 'text-indigo-700 font-black' : 'text-slate-900 font-bold'}>
                    {filterHistorySede === 'TODAS' ? 'Todas las sedes' : filterHistorySede}
                  </span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSedeFilterOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {/* Menú desplegable flotante de Sedes */}
              {isSedeFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsSedeFilterOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
                    <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Clasificar por Sede
                      </span>
                      {filterHistorySede !== 'TODAS' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterHistorySede('TODAS');
                            setIsSedeFilterOpen(false);
                          }}
                          className="text-indigo-600 hover:underline font-bold text-[10px] normal-case"
                        >
                          Restablecer
                        </button>
                      )}
                    </div>

                    <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                      {/* Opción Todas */}
                      <button
                        type="button"
                        onClick={() => {
                          setFilterHistorySede('TODAS');
                          setIsSedeFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                          filterHistorySede === 'TODAS'
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className={`w-3.5 h-3.5 ${filterHistorySede === 'TODAS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span>Todas las Sedes</span>
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          filterHistorySede === 'TODAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {countPorSede('TODAS')}
                        </span>
                      </button>

                      {/* Lista dinámica de Sedes */}
                      {sedesDisponibles.map(sede => {
                        const count = countPorSede(sede);
                        const isSelected = filterHistorySede.toLowerCase().trim() === sede.toLowerCase().trim();
                        return (
                          <button
                            key={sede}
                            type="button"
                            onClick={() => {
                              setFilterHistorySede(sede);
                              setIsSedeFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                              <span className="truncate">{sede}</span>
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}>
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

            <span className="text-xs text-slate-400 font-medium hidden lg:inline">
              Haz clic en cualquier fila para ver la solución
            </span>
          </div>
        </div>

        <div className="overflow-auto p-0 w-full">
          {historyTickets.length > 0 ? (
            <div className="min-w-[700px]"><table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2.5 font-bold text-xs">Ticket</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Sede</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Asignado</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Registrado</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Resuelto</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Diagnóstico / Solución</th>
                  <th className="px-5 py-2.5 font-bold text-xs">Recompensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyTickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => handleAbrirDetalle(ticket)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{ticket.titulo}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-medium text-slate-500">TIC-{ticket.id.substring(0, 5).toUpperCase()}</span>
                        {ticket.departamento && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500">{ticket.departamento}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {ticket.sede ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{ticket.sede}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">General</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold overflow-hidden shrink-0">
                        {ticket.asignadoA?.avatar ? (
                          ticket.asignadoA.avatar.length > 2 ? (
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${ticket.asignadoA.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            ticket.asignadoA.avatar
                          )
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <span className="truncate max-w-[120px] font-medium">{ticket.asignadoA?.nombre || 'Desconocido'}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      <div>{ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleDateString() : '-'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {ticket.resueltoEn ? (
                        <>
                          <div>{new Date(ticket.resueltoEn).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{new Date(ticket.resueltoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {ticket.solucion ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 max-w-[220px] truncate" title={ticket.solucion}>
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{ticket.solucion}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin solución registrada</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">+{ticket.xpRecompensa} XP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm space-y-2">
              <p>
                {filterHistorySede !== 'TODAS'
                  ? `No se encontraron tickets cerrados en la sede "${filterHistorySede}".`
                  : 'No hay tickets cerrados en el historial.'}
              </p>
              {filterHistorySede !== 'TODAS' && (
                <button
                  type="button"
                  onClick={() => setFilterHistorySede('TODAS')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Ver todas las sedes
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-[92vw] sm:w-full max-w-md p-5 sm:p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-blue-600" /> Crear Nuevo Ticket
            </h2>
            <p className="text-sm text-slate-500 mb-6">Ingresa los detalles básicos del incidente. La hora de registro es automática.</p>

            <form onSubmit={handleCrearTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Ticket <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: Impresora no conecta, Pantalla azul..."
                  className="w-full px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Sede</label>
                  <CustomSelect 
                    value={nuevaSede}
                    onChange={setNuevaSede}
                    options={sedesList}
                    placeholder="Selecciona sede"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Departamento</label>
                  <CustomSelect 
                    value={nuevoDepartamento}
                    onChange={setNuevoDepartamento}
                    options={departamentosList}
                    placeholder="Selecciona departamento"
                  />
                </div>
              </div>

              {areasList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Área Específica</label>
                  <div className="flex flex-wrap gap-2">
                    {areasList.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setNuevaArea(area)}
                        className={`
                          px-3 py-1.5 text-xs font-bold rounded-lg border transition-all
                          ${nuevaArea === area 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}
                        `}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-center"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer Móvil de Historial de Tickets Cerrados */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsHistoryDrawerOpen(false)}
          />
          <div className="relative z-10 bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-slate-200">
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header del Drawer */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Historial de Tickets Cerrados
                </h3>
                <p className="text-[11px] text-slate-400">Toca un ticket para ver la solución y detalles</p>
              </div>
              <button 
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Filtro de Sedes en Drawer Móvil */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setFilterHistorySede('TODAS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterHistorySede === 'TODAS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Todas</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterHistorySede === 'TODAS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {countPorSede('TODAS')}
                </span>
              </button>
              {sedesDisponibles.map(sede => {
                const count = countPorSede(sede);
                const isSelected = filterHistorySede.toLowerCase().trim() === sede.toLowerCase().trim();
                return (
                  <button
                    key={sede}
                    type="button"
                    onClick={() => setFilterHistorySede(sede)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{sede}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lista de Tickets Cerrados en Drawer */}
            <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
              {historyTickets.length > 0 ? (
                historyTickets.map(ticket => {
                  const shortId = `TIC-${ticket.id.substring(0, 5).toUpperCase()}`;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => handleAbrirDetalle(ticket)}
                      className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 active:bg-indigo-100/50 border border-slate-200 rounded-xl transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                          {shortId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ticket.solucion ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Solución
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sin nota</span>
                          )}
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            +{ticket.xpRecompensa} XP
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs leading-snug">
                        {ticket.titulo}
                      </h4>

                      {ticket.sede && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{ticket.sede} {ticket.departamento ? `· ${ticket.departamento}` : ''}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span>{ticket.asignadoA?.nombre || 'Técnico'}</span>
                        </div>
                        <div>
                          {ticket.resueltoEn ? new Date(ticket.resueltoEn).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>
                    {filterHistorySede !== 'TODAS'
                      ? `No hay tickets cerrados registrados en la sede "${filterHistorySede}".`
                      : searchQuery
                      ? 'No se encontraron tickets cerrados con ese criterio.'
                      : 'No hay tickets cerrados aún.'}
                  </p>
                  {filterHistorySede !== 'TODAS' && (
                    <button
                      type="button"
                      onClick={() => setFilterHistorySede('TODAS')}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Ver todas las sedes
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Ticket y Solución (Pestaña Superpuesta) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setSelectedTicket(null)}
          />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    TIC-{selectedTicket.id.substring(0, 5).toUpperCase()}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${getPriorityStyle(selectedTicket.prioridad).bg} ${getPriorityStyle(selectedTicket.prioridad).color} ${getPriorityStyle(selectedTicket.prioridad).border}`}>
                    {getPriorityStyle(selectedTicket.prioridad).icon}
                    {selectedTicket.prioridad}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                    selectedTicket.estado === 'CERRADO' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    selectedTicket.estado === 'RESUELTO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedTicket.estado === 'EN_PROGRESO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedTicket.estado.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug break-words">
                  {selectedTicket.titulo}
                </h2>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTicket(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
              {/* Panel de Decisión Técnica: Nivel de Emergencia / Importancia */}
              <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/40 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Decisión Técnica: Nivel de Emergencia / Importancia
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Haz clic para asignar o reclasificar la urgencia
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                  {[
                    { id: 'CRITICA', label: '🚨 Crítica', desc: 'Emergencia Total', activeClass: 'bg-red-600 text-white shadow-md shadow-red-500/30 border-red-600 ring-2 ring-red-400/50', idleClass: 'bg-white text-red-700 border-red-200 hover:bg-red-50' },
                    { id: 'ALTA', label: '⚠️ Alta', desc: 'Muy Importante', activeClass: 'bg-orange-500 text-white shadow-md shadow-orange-500/30 border-orange-500 ring-2 ring-orange-400/50', idleClass: 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50' },
                    { id: 'MEDIA', label: '⏱️ Media', desc: 'Atención Normal', activeClass: 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30 border-yellow-500 ring-2 ring-yellow-400/50', idleClass: 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50' },
                    { id: 'BAJA', label: '🟢 Baja', desc: 'Rutinaria / Menor', activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600 ring-2 ring-emerald-400/50', idleClass: 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50' },
                  ].map(prio => {
                    const isCurrent = selectedTicket.prioridad === prio.id;
                    return (
                      <button
                        key={prio.id}
                        type="button"
                        onClick={() => handleCambiarPrioridad(selectedTicket.id, prio.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isCurrent ? prio.activeClass : prio.idleClass
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center gap-1">
                          {prio.label}
                          {isCurrent && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className={`text-[10px] ${isCurrent ? 'text-white/90' : 'text-slate-400'}`}>{prio.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metadatos en Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> Sede y Departamento
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedTicket.sede || 'No especificada'}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {selectedTicket.departamento} {selectedTicket.ubicacionEspecifica ? `· ${selectedTicket.ubicacionEspecifica}` : ''}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" /> Solicitante
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedTicket.solicitanteNombre || 'Usuario no registrado'}
                  </div>
                  <div className="text-slate-600 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedTicket.solicitanteContacto || 'Sin contacto directo'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-500" /> Registro y Resolución
                  </div>
                  <div className="text-slate-700">
                    <span className="font-semibold text-slate-900">Creado:</span> {selectedTicket.creadoEn ? new Date(selectedTicket.creadoEn).toLocaleString() : '-'}
                  </div>
                  {selectedTicket.resueltoEn && (
                    <div className="text-emerald-700">
                      <span className="font-semibold text-emerald-900">Resuelto:</span> {new Date(selectedTicket.resueltoEn).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Técnico Asignado & XP
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold overflow-hidden">
                        {selectedTicket.asignadoA?.avatar ? (
                          selectedTicket.asignadoA.avatar.length > 2 ? (
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedTicket.asignadoA.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            selectedTicket.asignadoA.avatar
                          )
                        ) : (
                          <User className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        {selectedTicket.asignadoA?.nombre || 'Sin asignar'}
                      </span>
                    </div>
                    <span className="font-black text-amber-600 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md text-xs">
                      +{selectedTicket.xpRecompensa} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE SOLUCIÓN TÉCNICA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Diagnóstico y Solución Técnica
                  </h3>
                  {!isEditingSolucion && selectedTicket.solucion && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSolucion(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                </div>

                {!isEditingSolucion && selectedTicket.solucion ? (
                  <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl p-4.5 space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Solución Aplicada Registrada
                    </div>
                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.solucion}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea 
                      rows={4}
                      value={solucionInput}
                      onChange={(e) => setSolucionInput(e.target.value)}
                      placeholder="Escribe la causa raíz del incidente y el procedimiento técnico que se ejecutó para solucionarlo (ej: Cambio de cable de red, reinicio de spooler de impresión, parche de software)..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      {selectedTicket.solucion && (
                        <button
                          type="button"
                          onClick={() => {
                            setSolucionInput(selectedTicket.solucion || '');
                            setIsEditingSolucion(false);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleGuardarSolucion}
                        disabled={isSavingSolucion || !solucionInput.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isSavingSolucion ? 'Guardando...' : 'Guardar Solución'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTicket.estado === 'ABIERTO' && (
                  <button
                    type="button"
                    onClick={() => handleMoverTicket(selectedTicket.id, 'EN_PROGRESO', selectedTicket.estado)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" /> Iniciar Progreso
                  </button>
                )}
                {selectedTicket.estado === 'EN_PROGRESO' && (
                  <button
                    type="button"
                    onClick={() => handleMoverTicket(selectedTicket.id, 'RESUELTO', selectedTicket.estado)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Resuelto
                  </button>
                )}
                {selectedTicket.estado === 'RESUELTO' && (
                  <button
                    type="button"
                    onClick={() => handleCerrarTicket(selectedTicket.id, solucionInput || selectedTicket.solucion)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Archive className="w-3.5 h-3.5" /> Cerrar Ticket Definitivamente
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
