import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, MoreHorizontal, User, ShieldAlert, Zap, GripVertical, X, CalendarClock, Ticket as TicketIcon, Trash2, Archive, ChevronDown, MapPin, Play, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTickets, actualizarEstadoTicket, crearTicket, eliminarTicket, getUbicacionesSedes, getUbicacionesDepartamentos, getUbicacionesAreas, socket } from '@/services/api/api-client';
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
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

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

    // Configurar listeners
    socket.on('nuevoTicket', (ticket) => {
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
    });

    socket.on('ticketActualizado', (updatedTicket) => {
      console.log('WS Event received: ticketActualizado', updatedTicket);
      setTickets((prev) => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    socket.on('ticketEliminado', (id) => {
      console.log('WS Event received: ticketEliminado', id);
      setTickets((prev) => prev.filter(t => t.id !== id));
    });

    return () => {
      socket.off('nuevoTicket');
      socket.off('ticketActualizado');
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
    // Necesario para Firefox
    e.dataTransfer.setData('text/plain', id);
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    try {
      await crearTicket({
        titulo: nuevoTitulo,
        sede: nuevaSede,
        departamento: nuevoDepartamento,
        ubicacionEspecifica: nuevaArea,
        // Al crear, se asigna estado ABIERTO por defecto en el backend
        // La prioridad ahora es MEDIA por defecto
      });
      setIsModalOpen(false);
      setNuevoTitulo('');
      setNuevaSede('');
      setNuevoDepartamento('');
      setNuevaArea('');
      fetchTicketsData(); // Recargar para ver el ticket nuevo
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
    
    try {
      await actualizarEstadoTicket(draggedTicket, nuevoEstado, userId);
      if (nuevoEstado === 'RESUELTO' && onTicketResolved) {
        onTicketResolved();
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // Revertir en caso de error
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
      fetchTicketsData();
    } catch (err) {
      alert("Error al eliminar ticket");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleCerrarTicket = async (id: string) => {
    if (!userId) return;
    try {
      await actualizarEstadoTicket(id, 'CERRADO', userId);
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
    
    try {
      await actualizarEstadoTicket(id, nuevoEstado, userId);
      if (nuevoEstado === 'RESUELTO' && onTicketResolved) {
        onTicketResolved();
      }
    } catch (err) {
      console.error("Error al mover ticket:", err);
      fetchTicketsData();
      alert("Error al mover ticket");
    } finally {
      setActiveDropdown(null);
    }
  };

  const toggleFilter = () => {
    const priorities = [null, 'CRITICA', 'ALTA', 'MEDIA', 'BAJA'];
    const currentIndex = priorities.indexOf(filterPriority);
    setFilterPriority(priorities[(currentIndex + 1) % priorities.length]);
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

  let activeTickets = tickets.filter(t => t.estado !== 'CERRADO');
  if (filterPriority) {
    activeTickets = activeTickets.filter(t => t.prioridad === filterPriority);
  }
  const historyTickets = tickets.filter(t => t.estado === 'CERRADO');

  const columnas = [
    { id: 'ABIERTO', title: 'Abiertos', color: 'bg-slate-100', dot: 'bg-slate-400' },
    { id: 'EN_PROGRESO', title: 'En Progreso', color: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'RESUELTO', title: 'Resueltos', color: 'bg-emerald-50', dot: 'bg-emerald-500' }
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Cargando tablero...</div>;
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tickets de Soporte</h1>
          <p className="text-slate-500 text-sm mt-1">Arrastra las tarjetas para cambiar su estado. ¡Gana XP al resolverlos!</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar tickets..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={toggleFilter}
            className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 border ${filterPriority ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" /> {filterPriority ? `Filtro: ${filterPriority}` : 'Filtros'}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 md:gap-6 flex-1 min-h-[400px] overflow-x-auto pb-4 shrink-0 snap-x custom-scrollbar">
        {columnas.map(col => {
          const colTickets = activeTickets.filter(t => t.estado === col.id);
          return (
            <div 
              key={col.id} 
              className={`flex-1 min-w-[85vw] sm:min-w-[320px] snap-center rounded-2xl flex flex-col ${col.color} border border-slate-200/60 shadow-inner`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                  <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                </div>
                <span className="bg-white/60 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200">
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
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing active:scale-95 active:shadow-md group relative overflow-hidden"
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
                          
                          {/* Dropdown flotante (Menú de Acciones) */}
                          {activeDropdown === ticket.id && (
                            <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-2 ring-1 ring-black/5">
                              {ticket.estado === 'ABIERTO' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'EN_PROGRESO', ticket.estado); }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                                >
                                  <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Iniciar Progreso
                                </button>
                              )}
                              {ticket.estado === 'EN_PROGRESO' && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'RESUELTO', ticket.estado); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-600 flex items-center gap-2.5 transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" /> Marcar Resuelto
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleMoverTicket(ticket.id, 'ABIERTO', ticket.estado); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                                  >
                                    <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Devolver a Abierto
                                  </button>
                                </>
                              )}
                              {(ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROGRESO') && <div className="h-px w-full bg-slate-100 my-1"></div>}
                              {ticket.estado === 'RESUELTO' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleCerrarTicket(ticket.id); }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                                >
                                  <Archive className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> Cerrar Ticket
                                </button>
                              )}
                              {ticket.estado === 'RESUELTO' && <div className="h-px w-full bg-slate-100 my-1"></div>}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEliminarTicket(ticket.id); }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors"
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
                  <div className="h-full flex items-center justify-center p-4">
                    <p className="text-slate-400 text-xs text-center border-2 border-dashed border-slate-300/50 rounded-xl p-4 w-full">Arrastra tickets aquí</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Historial Inferior */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col max-h-[300px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-500" /> Historial de Tickets Cerrados
          </h3>
        </div>
        <div className="overflow-auto p-0 w-full">
          {historyTickets.length > 0 ? (
            <div className="min-w-[600px]"><table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-2.5 font-medium text-xs">Ticket</th>
                  <th className="px-6 py-2.5 font-medium text-xs">Asignado</th>
                  <th className="px-6 py-2.5 font-medium text-xs">Registrado</th>
                  <th className="px-6 py-2.5 font-medium text-xs">Resuelto</th>
                  <th className="px-6 py-2.5 font-medium text-xs">Recompensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-700">{ticket.titulo}</div>
                      <div className="text-[10px] text-slate-400">TIC-{ticket.id.substring(0, 5).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold overflow-hidden">
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
                      {ticket.asignadoA?.nombre || 'Desconocido'}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      <div>{ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleDateString() : '-'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {ticket.resueltoEn ? (
                        <>
                          <div>{new Date(ticket.resueltoEn).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{new Date(ticket.resueltoEn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">+{ticket.xpRecompensa} XP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No hay tickets en el historial.</div>
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
    </div>
  );
}
