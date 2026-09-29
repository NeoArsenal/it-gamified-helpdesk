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
    } catch {
      // Safari en modo privado o cookies bloqueadas
    }
    return memoryStorage[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Fallback a memoria
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch { }
    delete memoryStorage[key];
  },
};

export const safeJsonResponse = async (res: Response) => {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch {
    return { success: true };
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = safeStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Cache en memoria ultra-rápido para peticiones GET (0ms de respuesta)
interface CacheEntry {
  body: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  timestamp: number;
}

interface InFlightPayload {
  body: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
}

const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 25000; // 25 segundos de vigencia

// Mapa de peticiones GET actualmente en vuelo por la red (Deduplicación)
const inFlightRequests = new Map<string, Promise<InFlightPayload>>();

export const clearApiCache = (filter?: string) => {
  if (!filter) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(filter)) {
      apiCache.delete(key);
    }
  }
};

/**
 * Invalida selectivamente el caché según el módulo que sufrió la mutación,
 * preservando intacto el caché del resto de módulos no afectados.
 */
export const invalidateCacheForMutation = (url: string) => {
  const norm = url.toLowerCase();

  // 1. Módulo de Tickets -> Invalida tickets, analítica y dashboard/métricas
  if (norm.includes('/ticket')) {
    clearApiCache('/ticket');
    clearApiCache('/stat');
    clearApiCache('/analytic');
    clearApiCache('/dashboard');
    return;
  }

  // 2. Módulo de Inventario / Activos -> Invalida activos, inventario, categorías y métricas
  if (norm.includes('/activo') || norm.includes('/asset') || norm.includes('/categoria')) {
    clearApiCache('/activo');
    clearApiCache('/asset');
    clearApiCache('/categoria');
    clearApiCache('/stat');
    clearApiCache('/dashboard');
    return;
  }

  // 3. Módulo de Red / Nodos
  if (norm.includes('/network') || norm.includes('/red') || norm.includes('/nodo')) {
    clearApiCache('/network');
    clearApiCache('/red');
    clearApiCache('/nodo');
    clearApiCache('/dashboard');
    return;
  }

  // 4. Módulo de Base de Conocimiento / Artículos
  if (norm.includes('/articulo') || norm.includes('/knowledge')) {
    clearApiCache('/articulo');
    clearApiCache('/knowledge');
    return;
  }

  // 5. Módulo de Usuarios y Sedes
  if (norm.includes('/usuario') || norm.includes('/user') || norm.includes('/sede') || norm.includes('/location')) {
    clearApiCache('/usuario');
    clearApiCache('/user');
    clearApiCache('/sede');
    clearApiCache('/location');
    return;
  }

  // 6. Módulo de Academia / Gamificación / Ranking
  if (norm.includes('/academy') || norm.includes('/ranking') || norm.includes('/gamification') || norm.includes('/insignia') || norm.includes('/curso')) {
    clearApiCache('/academy');
    clearApiCache('/ranking');
    clearApiCache('/gamification');
    clearApiCache('/insignia');
    clearApiCache('/curso');
    return;
  }

  // 7. Notificaciones
  if (norm.includes('/notificacion') || norm.includes('/notification')) {
    clearApiCache('/notificacion');
    clearApiCache('/notification');
    return;
  }

  // Fallback de seguridad: si no coincide con ningún módulo conocido, limpiar todo
  apiCache.clear();
};

const originalFetch = globalThis.fetch;
export const apiClientFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const token = safeStorage.getItem('auth_token');
  const headers: any = {
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = (options?.method || 'GET').toUpperCase();
  const urlKey = typeof url === 'string' ? url : url.toString();

  // Si es una mutación (POST, PUT, PATCH, DELETE), invalidar selectivamente el caché correspondiente
  if (method !== 'GET') {
    invalidateCacheForMutation(urlKey);
  }

  // Manejo de peticiones GET cacheadas o en vuelo (Deduplicación)
  if (method === 'GET' && !urlKey.includes('/auth/') && !urlKey.includes('/portal/')) {
    // 1. Respuesta instantánea desde caché en memoria (0ms)
    const cached = apiCache.get(urlKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
      });
    }

    // 2. Si ya hay una petición IDÉNTICA en vuelo por la red, unirse a su Promise (Deduplicación)
    const existingInFlight = inFlightRequests.get(urlKey);
    if (existingInFlight) {
      try {
        const payload = await existingInFlight;
        return new Response(payload.body, {
          status: payload.status,
          statusText: payload.statusText,
          headers: payload.headers,
        });
      } catch (err) {
        throw err;
      }
    }

    // 3. Iniciar la petición en red y registrarla como en vuelo
    const fetchPromise = (async (): Promise<InFlightPayload> => {
      const res = await originalFetch(url, { ...options, headers });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          if (typeof window !== 'undefined') {
            safeStorage.removeItem('auth_token');
            safeStorage.removeItem('auth_user');
            if (window.location.pathname !== '/portal' && !window.location.pathname.startsWith('/activo')) {
              window.location.href = '/';
            }
          }
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
      }

      const body = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => { resHeaders[key] = val; });

      const payload: InFlightPayload = {
        body,
        headers: resHeaders,
        status: res.status,
        statusText: res.statusText,
      };

      // Guardar en caché fresco
      apiCache.set(urlKey, {
        ...payload,
        timestamp: Date.now(),
      });

      return payload;
    })().finally(() => {
      inFlightRequests.delete(urlKey);
    });

    inFlightRequests.set(urlKey, fetchPromise);

    try {
      const payload = await fetchPromise;
      return new Response(payload.body, {
        status: payload.status,
        statusText: payload.statusText,
        headers: payload.headers,
      });
    } catch (error: any) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
        toast.error(error.message || 'Error de conexión con el servidor');
      }
      throw error;
    }
  }

  // Mutaciones o peticiones que no usan caché (POST, PUT, DELETE, /auth/, /portal/)
  try {
    const res = await originalFetch(url, { ...options, headers });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
          safeStorage.removeItem('auth_token');
          safeStorage.removeItem('auth_user');
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
    if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
      toast.error(error.message || 'Error de conexión con el servidor');
    }
    throw error;
  }
};
