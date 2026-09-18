import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';
import { Ticket, CreateTicketDTO, UpdateTicketDTO } from '@/types';

export const getTickets = async (): Promise<Ticket[]> => {
  const res = await fetch(`${BASE_URL}/tickets`);
  if (!res.ok) throw new Error('Error al obtener tickets');
  return res.json();
};

export const crearTicket = async (ticketData: CreateTicketDTO): Promise<any> => {
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear ticket');
  }
  return res.json().catch(() => ({ success: true }));
};

export const trackTicket = async (query: string): Promise<Ticket[]> => {
  const encoded = encodeURIComponent(query.trim());
  const res = await fetch(`${BASE_URL}/tickets/track?q=${encoded}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'No se encontró información para este ticket o teléfono.');
  }
  return data;
};

export const getTicketsActivosPublicos = async (): Promise<Ticket[]> => {
  const res = await fetch(`${BASE_URL}/tickets/public/active`);
  if (!res.ok) throw new Error('Error al cargar tickets en atención');
  return res.json().catch(() => []);
};

export const eliminarTicket = async (ticketId: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ticket');
  return safeJsonResponse(res);
};

export const resolverTicket = async (ticketId: string, resolutorId: string): Promise<Ticket> => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estado: 'RESUELTO',
      resueltoEn: new Date().toISOString(),
      asignadoAId: resolutorId,
    }),
  });
  if (!res.ok) throw new Error('Error al resolver ticket');
  return res.json();
};

export const actualizarTicket = async (ticketId: string, data: UpdateTicketDTO | any): Promise<Ticket> => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar ticket');
  return res.json();
};

export const actualizarEstadoTicket = async (
  ticketId: string,
  estado: string,
  resolutorId?: string,
  solucion?: string
): Promise<Ticket> => {
  const payload: any = { estado };
  if (estado === 'RESUELTO' || estado === 'EN_PROGRESO' || estado === 'CERRADO') {
    if (resolutorId) payload.asignadoAId = resolutorId;
  }
  if (estado === 'RESUELTO' || estado === 'CERRADO') {
    payload.resueltoEn = new Date().toISOString();
  }
  if (solucion !== undefined) {
    payload.solucion = solucion;
  }

  return actualizarTicket(ticketId, payload);
};

export const getStats = async (): Promise<{ total: number; abiertos: number; enProgreso: number; resueltos: number }> => {
  const res = await fetch(`${BASE_URL}/tickets/stats`);
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return res.json();
};

export const getAnalytics = async (sede?: string): Promise<any> => {
  const query = sede && sede !== 'TODAS' ? `?sede=${encodeURIComponent(sede)}` : '';
  const res = await fetch(`${BASE_URL}/tickets/analytics${query}`);
  if (!res.ok) throw new Error('Error al obtener analytics');
  return res.json();
};

export const getTicketsAnalytics = async (sede?: string): Promise<any> => {
  return getAnalytics(sede);
};
