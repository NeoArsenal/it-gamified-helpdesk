const BASE_URL = 'http://localhost:3001/api';

// --- Gamificación ---
export const getPerfilUsuario = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/gamificacion/perfil/${userId}`);
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
};

export const getLeaderboard = async () => {
  const res = await fetch(`${BASE_URL}/gamificacion/leaderboard`);
  if (!res.ok) throw new Error('Error al obtener leaderboard');
  return res.json();
};

// --- Tickets ---
export const getTickets = async () => {
  const res = await fetch(`${BASE_URL}/tickets`);
  if (!res.ok) throw new Error('Error al obtener tickets');
  return res.json();
};

export const crearTicket = async (ticketData: any) => {
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) throw new Error('Error al crear ticket');
  return res.json();
};

export const eliminarTicket = async (ticketId: string) => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ticket');
  return res.json();
};

export const resolverTicket = async (ticketId: string, resolutorId: string) => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estado: 'RESUELTO',
      resueltoEn: new Date().toISOString(),
      asignadoAId: resolutorId, // Para asegurarnos de que la medalla/XP vaya a quien lo resuelve
    }),
  });
  if (!res.ok) throw new Error('Error al resolver ticket');
  return res.json();
};

export const actualizarEstadoTicket = async (ticketId: string, estado: string, resolutorId?: string) => {
  const payload: any = { estado };
  if (estado === 'RESUELTO' || estado === 'EN_PROGRESO') {
    if (resolutorId) payload.asignadoAId = resolutorId;
  }
  if (estado === 'RESUELTO') {
    payload.resueltoEn = new Date().toISOString();
  }

  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar estado del ticket');
  return res.json();
};

// --- Estadísticas ---
export const getStats = async () => {
  const res = await fetch(`${BASE_URL}/tickets/stats`);
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return res.json();
};

export const getTicketsAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/tickets/analytics`);
  if (!res.ok) throw new Error('Error al obtener analytics');
  return res.json();
};

// --- Guias (Base de Conocimiento) ---
export const getGuias = async () => {
  const res = await fetch(`${BASE_URL}/guias`);
  if (!res.ok) throw new Error('Error al obtener guías');
  return res.json();
};

export const crearGuia = async (data: any) => {
  const res = await fetch(`${BASE_URL}/guias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear guía');
  return res.json();
};

export const eliminarGuia = async (id: string) => {
  const res = await fetch(`${BASE_URL}/guias/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar guía');
  return res.json();
};

// --- Red ---
export const getEstadisticasRed = async () => {
  // Simularemos unas estadísticas básicas, o podrías usar un endpoint real si existe
  return {
    dispositivos: 4,
    ipsLibres: 20
  };
};

export const updateDispositivoRed = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar dispositivo');
  return res.json();
};

export const asignarIP = async (ip: string, dispositivoId: string) => {
  const res = await fetch(`${BASE_URL}/red/ips/${ip}/asignar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispositivoId }),
  });
  if (!res.ok) throw new Error('Error al asignar IP');
  return res.json();
};

export const liberarIP = async (ip: string) => {
  const res = await fetch(`${BASE_URL}/red/ips/${ip}/liberar`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Error al liberar IP');
  return res.json();
};

export const getDispositivosRed = async () => {
  const res = await fetch(`${BASE_URL}/red/dispositivos`);
  if (!res.ok) throw new Error('Error al obtener dispositivos');
  return res.json();
};

export const getDireccionesIP = async () => {
  const res = await fetch(`${BASE_URL}/red/ips`);
  if (!res.ok) throw new Error('Error al obtener IPs');
  return res.json();
};// --- Activos / Inventario ---
export const getActivos = async () => {
  const res = await fetch(`${BASE_URL}/activos`);
  if (!res.ok) throw new Error('Error al obtener activos');
  return res.json();
};

export const crearActivo = async (data: any) => {
  const res = await fetch(`${BASE_URL}/activos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear activo');
  return res.json();
};

export const updateActivo = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar activo');
  return res.json();
};

export const eliminarActivo = async (id: string) => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar activo');
  return res.json();
};
