import { toast } from 'sonner';
import * as signalR from '@microsoft/signalr';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7172/api';
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
export const SOCKET_URL = cleanUrl.replace(/\/api$/, '');
export const SIGNALR_HUB_URL = `${SOCKET_URL}/ws/notificaciones`;

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

type EventCallback = (...args: any[]) => void;

class SignalRSocketAdapter {
  private hubConnection: signalR.HubConnection | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connectListeners: Set<() => void> = new Set();
  private disconnectListeners: Set<() => void> = new Set();
  private isConnecting: boolean = false;

  public auth: { token?: string } = {};

  get connected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  private initConnection(): signalR.HubConnection {
    if (this.hubConnection) return this.hubConnection;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => {
          return this.auth?.token || safeStorage.getItem('auth_token') || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
      .configureLogging(signalR.LogLevel.Error)
      .build();

    this.hubConnection.onclose(() => {
      this.disconnectListeners.forEach((cb) => cb());
    });

    this.hubConnection.onreconnected(() => {
      this.connectListeners.forEach((cb) => cb());
    });

    // Invalidador reactivo automático de caché ante cualquier evento en tiempo real
    const autoInvalidateEvents = ['nuevoTicket', 'ticketActualizado', 'ticketEliminado', 'dispositivoActualizado', 'alertared'];
    autoInvalidateEvents.forEach(evt => {
      this.hubConnection?.on(evt, () => {
        clearApiCache('/ticket');
        clearApiCache('/stat');
        clearApiCache('/analytic');
        clearApiCache('/dashboard');
        clearApiCache('/red');
      });
    });

    // Re-vincular los eventos registrados previamente
    for (const [event, cbs] of this.listeners.entries()) {
      for (const cb of cbs) {
        this.hubConnection.on(event, cb);
      }
    }

    return this.hubConnection;
  }

  public async connect(): Promise<void> {
    if (typeof window === 'undefined') return;
    const conn = this.initConnection();
    if (conn.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    try {
      await conn.start();
      this.connectListeners.forEach((cb) => cb());
    } catch (err) {
      console.warn('Error conectando a SignalR:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch (err) {
        console.warn('Error desconectando SignalR:', err);
      }
      this.disconnectListeners.forEach((cb) => cb());
    }
  }

  public on(event: string, callback: EventCallback): this {
    if (event === 'connect') {
      this.connectListeners.add(callback);
      if (this.connected) {
        callback();
      }
      return this;
    }
    if (event === 'disconnect') {
      this.disconnectListeners.add(callback);
      return this;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.hubConnection) {
      this.hubConnection.on(event, callback);
    }
    return this;
  }

  public off(event: string, callback?: EventCallback): this {
    if (event === 'connect') {
      if (callback) this.connectListeners.delete(callback);
      else this.connectListeners.clear();
      return this;
    }
    if (event === 'disconnect') {
      if (callback) this.disconnectListeners.delete(callback);
      else this.disconnectListeners.clear();
      return this;
    }

    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.hubConnection) {
        this.hubConnection.off(event, callback);
      }
    } else {
      this.listeners.delete(event);
      if (this.hubConnection) {
        this.hubConnection.off(event);
      }
    }
    return this;
  }

  public async emit(event: string, ...args: any[]): Promise<any> {
    const conn = this.initConnection();
    if (conn.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }
    return conn.invoke(event, ...args);
  }
}

// Instancia global adaptada a la interfaz previa de socket
export const socket = new SignalRSocketAdapter();

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
const CACHE_TTL_MS = 4000; // 4 segundos de vigencia máxima (reactividad ultra-rápida)

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

  // 5. Módulo de Ubicaciones, Sedes y Usuarios
  if (norm.includes('/usuario') || norm.includes('/user') || norm.includes('/sede') || norm.includes('/location') || norm.includes('/ubicacion')) {
    clearApiCache('/usuario');
    clearApiCache('/user');
    clearApiCache('/sede');
    clearApiCache('/location');
    clearApiCache('/ubicacion');
    clearApiCache('/analytic');
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

const notifyApiError = (error: any) => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/portal') return;

  const raw = String(error?.message || '');
  const isNetwork =
    raw.toLowerCase().includes('failed to fetch') ||
    raw.toLowerCase().includes('networkerror') ||
    raw.toLowerCase().includes('load failed') ||
    error?.name === 'TypeError';

  if (isNetwork) {
    // Evita apilar 5 toasts idénticos: id único fijo en Sonner para agrupar
    toast.error('Reconectando con el servidor...', {
      id: 'global-network-error',
      duration: 3500,
    });
  } else {
    toast.error(raw || 'Error de conexión con el servidor', {
      id: `err-${raw.slice(0, 30)}`,
      duration: 4000,
    });
  }
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

    // 3. Iniciar la petición en red con reintento automático (para evitar "Failed to fetch" al despertar el servidor o en cambio de red móvil)
    const fetchPromise = (async (): Promise<InFlightPayload> => {
      let res: Response;
      try {
        res = await originalFetch(url, { ...options, headers });
      } catch (firstErr: any) {
        const isNetFail = firstErr?.message?.includes('Failed to fetch') || firstErr?.name === 'TypeError';
        if (isNetFail) {
          // Reintentar una vez tras 1.2 segundos (frecuente en móviles al reactivar pantalla o despertar Render)
          await new Promise((r) => setTimeout(r, 1200));
          res = await originalFetch(url, { ...options, headers });
        } else {
          throw firstErr;
        }
      }

      if (!res.ok) {
        if (res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.message || 'Límite de solicitudes alcanzado. Espera un momento.';
          throw new Error(msg);
        }
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
      // Si la red falla pero tenemos datos previos en caché, responder con ellos en lugar de fallar
      const staleCached = apiCache.get(urlKey);
      if (staleCached) {
        return new Response(staleCached.body, {
          status: staleCached.status,
          statusText: staleCached.statusText,
          headers: staleCached.headers,
        });
      }

      notifyApiError(error);
      throw error;
    }
  }

  // Mutaciones o peticiones que no usan caché (POST, PUT, DELETE, /auth/, /portal/)
  try {
    const res = await originalFetch(url, { ...options, headers });

    if (!res.ok) {
      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || 'Demasiadas solicitudes. Espera un momento antes de reintentar.';
        if (typeof window !== 'undefined') {
          toast.error(msg);
        }
        throw new Error(msg);
      }
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
    notifyApiError(error);
    throw error;
  }
};
