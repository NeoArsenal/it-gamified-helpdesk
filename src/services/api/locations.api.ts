import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';
import { Ubicacion, CreateUbicacionDTO } from '@/types';

export const getUbicacionesSedes = async (): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/ubicaciones/sedes`);
  if (!res.ok) throw new Error('Error al obtener sedes');
  return res.json();
};

export const getUbicacionesDepartamentos = async (sede: string): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/ubicaciones/departamentos?sede=${encodeURIComponent(sede)}`);
  if (!res.ok) throw new Error('Error al obtener departamentos');
  return res.json();
};

export const getUbicacionesAreas = async (sede: string, departamento: string): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/ubicaciones/areas?sede=${encodeURIComponent(sede)}&departamento=${encodeURIComponent(departamento)}`);
  if (!res.ok) throw new Error('Error al obtener areas');
  return res.json();
};

export const getUbicaciones = async (): Promise<Ubicacion[]> => {
  const res = await fetch(`${BASE_URL}/ubicaciones`);
  if (!res.ok) throw new Error('Error al obtener ubicaciones');
  return res.json();
};

export const crearUbicacion = async (data: CreateUbicacionDTO): Promise<Ubicacion> => {
  const res = await fetch(`${BASE_URL}/ubicaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear ubicacion');
  return res.json();
};

export const eliminarUbicacion = async (id: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/ubicaciones/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ubicacion');
  return safeJsonResponse(res);
};
