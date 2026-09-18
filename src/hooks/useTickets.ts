import { useState, useEffect } from 'react';
import {
  getTickets,
  actualizarEstadoTicket,
  actualizarTicket,
  crearTicket,
  eliminarTicket,
  getUbicacionesSedes,
  getUbicacionesDepartamentos,
  getUbicacionesAreas,
  socket,
  safeStorage,
} from '@/services/api';
import { toast } from 'sonner';

interface UseTicketsOptions {
  userId?: string;
  onTicketResolved?: () => void;
}

export function useTickets({ userId, onTicketResolved }: UseTicketsOptions = {}) {
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

    getUbicacionesSedes()
      .then((data) => {
        setSedesList(data);
      })
      .catch(console.error);

    const token = safeStorage.getItem('auth_token');
    if (token) {
      socket.auth = { token };
    }
    if (!socket.connected) {
      socket.connect();
    }

    const handleNuevoTicket = (ticket: any) => {
      setTickets((prev) => {
        if (prev.find((t) => t.id === ticket.id)) return prev;
        return [ticket, ...prev];
      });

      const audio = new Audio('/notification.mp3?v=' + new Date().getTime());
      audio.volume = 0.5;
      audio.play().catch((e) => console.log('Autoplay prevent:', e));

      toast.success('¡Nuevo Ticket Recibido!', {
        description: ticket.titulo,
        duration: 5000,
      });
    };

    const handleTicketActualizado = (updatedTicket: any) => {
      setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)));
      setSelectedTicket((prev: any) => (prev?.id === updatedTicket.id ? { ...prev, ...updatedTicket } : prev));
    };

    const handleTicketEliminado = (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSelectedTicket((prev: any) => (prev?.id === id ? null : prev));
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
      getUbicacionesSedes()
        .then((data) => {
          setSedesList(data);
          if (data.length > 0) setNuevaSede(data[0]);
        })
        .catch(console.error);
    }
  }, [isModalOpen]);

  // Cargar departamentos cuando cambia la sede
  useEffect(() => {
    if (nuevaSede) {
      getUbicacionesDepartamentos(nuevaSede)
        .then((data) => {
          setDepartamentosList(data);
          if (data.length > 0) setNuevoDepartamento(data[0]);
          else setNuevoDepartamento('');
        })
        .catch(console.error);
    }
  }, [nuevaSede]);

  // Cargar áreas cuando cambia el departamento
  useEffect(() => {
    if (nuevaSede && nuevoDepartamento) {
      getUbicacionesAreas(nuevaSede, nuevoDepartamento)
        .then((data) => {
          setAreasList(data);
          if (data.length > 0) setNuevaArea(data[0]);
          else setNuevaArea('');
        })
        .catch(console.error);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
          if (prev.find((t) => t.id === nuevo.id)) return prev;
          return [nuevo, ...prev];
        });
      }
      fetchTicketsData();
    } catch (err) {
      console.error('Error al crear', err);
      alert('Hubo un error al crear el ticket');
    }
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    if (!draggedTicket || !userId) return;

    const ticket = tickets.find((t) => t.id === draggedTicket);
    if (!ticket || ticket.estado === nuevoEstado) {
      setDraggedTicket(null);
      return;
    }

    setTickets((prev) => prev.map((t) => (t.id === draggedTicket ? { ...t, estado: nuevoEstado } : t)));
    if (selectedTicket?.id === draggedTicket) {
      setSelectedTicket((prev: any) => ({ ...prev, estado: nuevoEstado }));
    }

    try {
      const res = await actualizarEstadoTicket(draggedTicket, nuevoEstado, userId);
      if (res && res.id) {
        setTickets((prev) => prev.map((t) => (t.id === draggedTicket ? { ...t, ...res } : t)));
      }
      if (nuevoEstado === 'RESUELTO') {
        toast.success('¡Ticket marcado como resuelto!');
        if (onTicketResolved) {
          onTicketResolved();
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      fetchTicketsData();
      alert('No se pudo actualizar el estado.');
    } finally {
      setDraggedTicket(null);
    }
  };

  const handleEliminarTicket = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ticket?')) return;
    try {
      await eliminarTicket(id);
      setSelectedTicket((prev: any) => (prev?.id === id ? null : prev));
      fetchTicketsData();
      toast.success('Ticket eliminado');
    } catch {
      alert('Error al eliminar ticket');
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleCerrarTicket = async (id: string, solucion?: string) => {
    if (!userId) return;
    try {
      await actualizarEstadoTicket(id, 'CERRADO', userId, solucion);
      toast.success('Ticket archivado y cerrado');
      setSelectedTicket((prev: any) =>
        prev && prev.id === id ? { ...prev, estado: 'CERRADO', solucion: solucion ?? prev.solucion } : prev
      );
      fetchTicketsData();
    } catch {
      alert('Error al cerrar ticket');
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleMoverTicket = async (id: string, nuevoEstado: string, estadoActual: string) => {
    if (!userId) return;
    if (estadoActual === nuevoEstado) return;

    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t)));
    setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev));

    try {
      const res = await actualizarEstadoTicket(id, nuevoEstado, userId);
      if (res && res.id) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...res } : t)));
        setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, ...res } : prev));
      }
      if (nuevoEstado === 'RESUELTO') {
        toast.success('¡Ticket marcado como resuelto!');
        if (onTicketResolved) {
          onTicketResolved();
        }
      }
    } catch (err) {
      console.error('Error al mover ticket:', err);
      fetchTicketsData();
      alert('Error al mover ticket');
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
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, solucion: solucionInput } : t)));
      setIsEditingSolucion(false);
    } catch (err) {
      console.error('Error al guardar solución:', err);
      toast.error('No se pudo guardar la solución');
    } finally {
      setIsSavingSolucion(false);
    }
  };

  const handleCambiarPrioridad = async (id: string, nuevaPrioridad: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, prioridad: nuevaPrioridad } : t)));
    setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, prioridad: nuevaPrioridad } : prev));

    try {
      const res = await actualizarTicket(id, { prioridad: nuevaPrioridad });
      if (res && res.id) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...res } : t)));
        setSelectedTicket((prev: any) => (prev && prev.id === id ? { ...prev, ...res } : prev));
      }
      toast.success(`Nivel de emergencia actualizado: ${nuevaPrioridad}`);
    } catch (error) {
      console.error('Error al cambiar prioridad:', error);
      fetchTicketsData();
      toast.error('No se pudo actualizar el nivel de emergencia');
    }
  };

  return {
    tickets,
    setTickets,
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
  };
}
