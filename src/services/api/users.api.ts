import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';
import { Usuario } from '@/types';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await fetch(`${BASE_URL}/usuarios`);
  return res.json();
};

export const getUsuario = async (userId: string): Promise<Usuario> => {
  const res = await fetch(`${BASE_URL}/usuarios/${userId}`);
  return res.json();
};

export const crearUsuario = async (data: any): Promise<Usuario> => {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const actualizarUsuario = async (id: string, data: any): Promise<Usuario> => {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const eliminarUsuario = async (id: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar usuario');
  }
  return safeJsonResponse(res);
};

export const actualizarPreferenciasUsuario = async (userId: string, data: any): Promise<any> => {
  const res = await fetch(`${BASE_URL}/usuarios/${userId}/preferencias`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar preferencias');
  return res.json();
};
