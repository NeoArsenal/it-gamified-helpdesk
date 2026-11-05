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

export const uploadFileToStorage = async (file: File, folder: string = 'perfiles'): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
  const res = await fetch(`${BASE_URL}/storage/upload${query}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al subir el archivo');
  }
  return res.json();
};

export const subirCargoActivo = async (
  activoId: string,
  file: File | Blob,
  fileName: string,
  data?: { cargoNumero?: string; responsable?: string; dni?: string; tecnico?: string }
): Promise<{ url: string; cargoNumero: string; message: string }> => {
  const formData = new FormData();
  formData.append('file', file, fileName);
  if (data?.cargoNumero) formData.append('cargoNumero', data.cargoNumero);
  if (data?.responsable) formData.append('responsable', data.responsable);
  if (data?.dni) formData.append('dni', data.dni);
  if (data?.tecnico) formData.append('tecnico', data.tecnico);

  const res = await fetch(`${BASE_URL}/activos/${activoId}/cargo`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al subir el cargo a la nube');
  }
  return res.json();
};
