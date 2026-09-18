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

const originalFetch = globalThis.fetch;
export const apiClientFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
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
