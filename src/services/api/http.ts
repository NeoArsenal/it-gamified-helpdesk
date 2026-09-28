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
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 25000; // 25 segundos de vigencia

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

const originalFetch = globalThis.fetch;
export const apiClientFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const token = safeStorage.getItem('auth_token');
  const headers: any = {
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = (options?.method || 'GET').toUpperCase();
  const urlKey = typeof url === 'string' ? url : url.toString();

  // Si es GET y está en cache fresco, responder en 0ms
  if (method === 'GET' && !urlKey.includes('/auth/') && !urlKey.includes('/portal/')) {
    const cached = apiCache.get(urlKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
      });
    }
  }

  // Si es mutación (POST, PUT, PATCH, DELETE), invalidar cache para siempre obtener datos frescos
  if (method !== 'GET') {
    apiCache.clear();
  }

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

    // Cachear respuesta exitosa de GET
    if (method === 'GET' && res.ok && !urlKey.includes('/auth/') && !urlKey.includes('/portal/')) {
      const cloned = res.clone();
      cloned.text().then(body => {
        const resHeaders: Record<string, string> = {};
        cloned.headers.forEach((val, key) => { resHeaders[key] = val; });
        apiCache.set(urlKey, {
          body,
          headers: resHeaders,
          status: res.status,
          statusText: res.statusText,
          timestamp: Date.now(),
        });
      }).catch(() => {});
    }

    return res;
  } catch (error: any) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
      toast.error(error.message || 'Error de conexión con el servidor');
    }
    throw error;
  }
};
