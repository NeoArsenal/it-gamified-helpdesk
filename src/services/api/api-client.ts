import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const originalFetch = globalThis.fetch;
const fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: any = {
    ...options?.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await originalFetch(url, { ...options, headers });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
           localStorage.removeItem('auth_token');
           localStorage.removeItem('auth_user');
           window.location.href = '/';
        }
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${res.status}`);
    }
    
    return res;
  } catch (error: any) {
    // Mostramos un toast si hay error
    toast.error(error.message || 'Error de conexión con el servidor');
    throw error;
  }
};

// --- Usuarios ---
export const getUsuarios = async () => {
  const res = await fetch(`${BASE_URL}/usuarios`);
  return res.json();
};

export const crearUsuario = async (data: any) => {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const actualizarUsuario = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getUsuario = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/usuarios/${userId}`);
  return res.json();
};

export const actualizarPreferenciasUsuario = async (userId: string, data: any) => {
  const res = await fetch(`${BASE_URL}/usuarios/${userId}/preferencias`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar preferencias');
  return res.json();
};

// --- Academia TI (Duolingo) ---
export const getCursosAcademia = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/academia/cursos?userId=${userId}`);
  if (!res.ok) throw new Error('Error al obtener cursos');
  return res.json();
};

export const getNivelPreguntas = async (nivelId: string) => {
  const res = await fetch(`${BASE_URL}/academia/niveles/${nivelId}/preguntas`);
  if (!res.ok) throw new Error('Error al obtener preguntas del nivel');
  return res.json();
};

export const completarNivelAcademia = async (userId: string, nivelId: string) => {
  const res = await fetch(`${BASE_URL}/academia/completar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, nivelId }),
  });
  if (!res.ok) throw new Error('Error al completar nivel');
  return res.json();
};

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

export const getHistorialXP = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/gamificacion/historial/${userId}`);
  if (!res.ok) throw new Error('Error al obtener historial');
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

export const getAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/tickets/analytics`);
  if (!res.ok) throw new Error('Error al obtener analytics');
  return res.json();
};

export const getTicketsAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/tickets/analytics`);
  if (!res.ok) throw new Error('Error al obtener analytics');
  return res.json();
};

// --- Guías ---
export const getGuias = async (query = '') => {
  const url = query ? `${BASE_URL}/guias/search?q=${encodeURIComponent(query)}` : `${BASE_URL}/guias`;
  const res = await fetch(url);
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
export const getDireccionesIP = async () => {
  const res = await fetch(`${BASE_URL}/red/ips`);
  if (!res.ok) throw new Error('Error al obtener IPs');
  return res.json();
};

export const registrarNuevaIP = async (data: any) => {
  const res = await fetch(`${BASE_URL}/red/ips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al registrar IP');
  return res.json();
};

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

export const simularCaidaRed = async () => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/simular-caida`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al simular caída');
  return res.json();
};

export const restaurarDispositivoRed = async (id: string, tecnicoId: string) => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/${id}/restaurar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tecnicoId }),
  });
  if (!res.ok) throw new Error('Error al restaurar dispositivo');
  return res.json();
};

// --- Activos / Inventario ---
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

export const updateActivo = async (id: string, data: Partial<any>) => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar activo');
  return res.json();
};

export const getActivo = async (id: string) => {
  const res = await fetch(`${BASE_URL}/activos/${id}`);
  if (!res.ok) throw new Error('Error al obtener activo');
  return res.json();
};

export const addIntervencion = async (id: string, descripcion: string, tecnicoId?: string) => {
  const res = await fetch(`${BASE_URL}/activos/${id}/intervenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion, tecnicoId }),
  });
  if (!res.ok) throw new Error('Error al añadir intervención');
  return res.json();
};

export const eliminarActivo = async (id: string) => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar activo');
  return res.json();
};

export const uploadFileToStorage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BASE_URL}/storage/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Error al subir el archivo');
  }
  return res.json();
};
