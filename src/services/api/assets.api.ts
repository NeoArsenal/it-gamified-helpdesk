import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';
import { Activo, CreateActivoDTO } from '@/types';

export const getActivos = async (): Promise<Activo[]> => {
  const res = await fetch(`${BASE_URL}/activos`);
  if (!res.ok) throw new Error('Error al obtener activos');
  return res.json();
};

export const getActivo = async (id: string): Promise<Activo> => {
  const res = await fetch(`${BASE_URL}/activos/${id}`);
  if (!res.ok) throw new Error('Error al obtener activo');
  return res.json();
};

export const crearActivo = async (data: CreateActivoDTO | any): Promise<Activo> => {
  const res = await fetch(`${BASE_URL}/activos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear activo');
  return res.json();
};

export const updateActivo = async (id: string, data: Partial<Activo> | any): Promise<Activo> => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar activo');
  return res.json();
};

export const addIntervencion = async (id: string, descripcion: string, tecnicoId?: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/activos/${id}/intervenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion, tecnicoId }),
  });
  if (!res.ok) throw new Error('Error al añadir intervención');
  return res.json();
};

export const eliminarActivo = async (id: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/activos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar activo');
  return safeJsonResponse(res);
};

export const uploadFileToStorage = async (file: File): Promise<{ url: string }> => {
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
