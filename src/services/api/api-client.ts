import { toast } from 'sonner';
import { io } from 'socket.io-client';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
export const SOCKET_URL = cleanUrl.replace(/\/api$/, '');

// Global socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling'],
});

// Storage seguro con fallback en memoria (compatible con Safari Privado, WebViews y bloqueadores)
const memoryStorage: Record<string, string> = {};
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Safari en modo privado o cookies bloqueadas
    }
    return memoryStorage[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Fallback a memoria
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    delete memoryStorage[key];
  }
};

export const safeJsonResponse = async (res: Response) => {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch {
    return { success: true };
  }
};

const originalFetch = globalThis.fetch;
const fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const token = safeStorage.getItem('auth_token');
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
           safeStorage.removeItem('auth_token');
           safeStorage.removeItem('auth_user');
           // No redirigir forzosamente si estamos en el portal de autoservicio o activo público
           if (window.location.pathname !== '/portal' && !window.location.pathname.startsWith('/activo')) {
             window.location.href = '/';
           }
        }
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${res.status}`);
    }
    
    return res;
  } catch (error: any) {
    // Mostramos un toast si hay error, salvo en vistas de autoservicio
    if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
      toast.error(error.message || 'Error de conexión con el servidor');
    }
    throw error;
  }
};

// --- Usuarios ---
export const getUsuarios = async () => {
  const res = await fetch(`${BASE_URL}/usuarios`);
  return res.json();
};

// --- Auth ---
export const loginUsuario = async (credentials: any) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }
  return data;
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

export const eliminarUsuario = async (id: string) => {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar usuario');
  }
  return safeJsonResponse(res);
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear ticket');
  }
  return res.json().catch(() => ({ success: true }));
};

export const trackTicket = async (query: string) => {
  const encoded = encodeURIComponent(query.trim());
  const res = await fetch(`${BASE_URL}/tickets/track?q=${encoded}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'No se encontró información para este ticket o teléfono.');
  }
  return data;
};

export const getTicketsActivosPublicos = async () => {
  const res = await fetch(`${BASE_URL}/tickets/public/active`);
  if (!res.ok) throw new Error('Error al cargar tickets en atención');
  return res.json().catch(() => []);
};

export const eliminarTicket = async (ticketId: string) => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ticket');
  return safeJsonResponse(res);
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

export const actualizarTicket = async (ticketId: string, data: any) => {
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar ticket');
  return res.json();
};

export const actualizarEstadoTicket = async (ticketId: string, estado: string, resolutorId?: string, solucion?: string) => {
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

// --- Estadísticas ---
export const getStats = async () => {
  const res = await fetch(`${BASE_URL}/tickets/stats`);
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  return res.json();
};

export const getAnalytics = async (sede?: string) => {
  const query = sede && sede !== 'TODAS' ? `?sede=${encodeURIComponent(sede)}` : '';
  const res = await fetch(`${BASE_URL}/tickets/analytics${query}`);
  if (!res.ok) throw new Error('Error al obtener analytics');
  return res.json();
};

export const getTicketsAnalytics = async (sede?: string) => {
  const query = sede && sede !== 'TODAS' ? `?sede=${encodeURIComponent(sede)}` : '';
  const res = await fetch(`${BASE_URL}/tickets/analytics${query}`);
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
  return safeJsonResponse(res);
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
  return safeJsonResponse(res);
};

export const uploadFileToStorage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BASE_URL}/storage/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al subir el archivo');
  }
  return res.json();
};

// --- Ubicaciones ---
export const getUbicacionesSedes = async () => {
  const res = await fetch(`${BASE_URL}/ubicaciones/sedes`);
  if (!res.ok) throw new Error('Error al obtener sedes');
  return res.json();
};

export const getUbicacionesDepartamentos = async (sede: string) => {
  const res = await fetch(`${BASE_URL}/ubicaciones/departamentos?sede=${encodeURIComponent(sede)}`);
  if (!res.ok) throw new Error('Error al obtener departamentos');
  return res.json();
};

export const getUbicacionesAreas = async (sede: string, departamento: string) => {
  const res = await fetch(`${BASE_URL}/ubicaciones/areas?sede=${encodeURIComponent(sede)}&departamento=${encodeURIComponent(departamento)}`);
  if (!res.ok) throw new Error('Error al obtener areas');
  return res.json();
};

export const getUbicaciones = async () => {
  const res = await fetch(`${BASE_URL}/ubicaciones`);
  if (!res.ok) throw new Error('Error al obtener ubicaciones');
  return res.json();
};

export const crearUbicacion = async (data: any) => {
  const res = await fetch(`${BASE_URL}/ubicaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear ubicacion');
  return res.json();
};

export const eliminarUbicacion = async (id: string) => {
  const res = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ubicacion');
  return safeJsonResponse(res);
};

// --- Portal Configuracion ---
export const verifyPortalAccess = async ({ pin, token }: { pin?: string; token?: string }) => {
  const res = await fetch(`${BASE_URL}/configuracion/verify-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, token }),
  });
  if (!res.ok) throw new Error('Error al verificar acceso');
  return res.json();
};

export const verifyPortalPin = async (pin: string) => {
  return verifyPortalAccess({ pin });
};

export const getPortalConfig = async (): Promise<{ pin: string; token: string }> => {
  const res = await fetch(`${BASE_URL}/configuracion/portal-config`);
  if (!res.ok) throw new Error('Error al obtener configuración del portal');
  return res.json();
};

export const regeneratePortalToken = async (): Promise<{ token: string }> => {
  const res = await fetch(`${BASE_URL}/configuracion/portal-token/regenerate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al regenerar llave del portal');
  return res.json();
};

export const getPortalPin = async () => {
  const res = await fetch(`${BASE_URL}/configuracion/portal-pin`);
  if (!res.ok) throw new Error('Error al obtener PIN');
  return res.json();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = safeStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const setPortalPin = async (pin: string) => {
  const res = await fetch(`${BASE_URL}/configuracion/portal-pin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error('Error al actualizar PIN');
  return res.json();
};

// --- Catálogos y Listas ---
export const getCatalogos = async (): Promise<{ departamentos: string[]; categoriasActivos: string[] }> => {
  const res = await fetch(`${BASE_URL}/configuracion/catalogos`);
  if (!res.ok) throw new Error('Error al obtener catálogos');
  return res.json();
};

export const actualizarCatalogo = async (tipo: 'departamentos' | 'categoriasActivos', items: string[]): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/configuracion/catalogos/${tipo}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Error al actualizar catálogo');
  return res.json();
};

// --- Reglas de Gamificación y Niveles ---
export interface ReglasGamificacion {
  puntosPorArea: {
    ticketBaja: number;
    ticketMedia: number;
    ticketAlta: number;
    ticketCritica: number;
    activoReparado: number;
    activoRescatado: number;
    redRestaurada: number;
    guiaCreada: number;
    academiaNivel: number;
  };
  niveles: number[];
}

export const getReglasGamificacion = async (): Promise<ReglasGamificacion> => {
  const res = await fetch(`${BASE_URL}/configuracion/gamificacion`);
  if (!res.ok) throw new Error('Error al obtener reglas de gamificación');
  return res.json();
};

export const guardarReglasGamificacion = async (reglas: Partial<ReglasGamificacion>): Promise<ReglasGamificacion> => {
  const res = await fetch(`${BASE_URL}/configuracion/gamificacion`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(reglas),
  });
  if (!res.ok) throw new Error('Error al guardar reglas de gamificación');
  return res.json();
};


