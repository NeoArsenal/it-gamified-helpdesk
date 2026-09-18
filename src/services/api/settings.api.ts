import { BASE_URL, apiClientFetch as fetch, getAuthHeaders } from './http';
import { ReglasGamificacion } from '@/types';

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
