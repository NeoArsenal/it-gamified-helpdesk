import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';

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

// --- Guías de Conocimiento ---
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
