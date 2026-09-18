import { BASE_URL, apiClientFetch as fetch } from './http';

export const getPerfilUsuario = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/gamificacion/perfil/${userId}`);
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
};

export const getLeaderboard = async () => {
  const res = await fetch(`${BASE_URL}/gamificacion/leaderboard`);
  if (!res.ok) throw new Error('Error al obtener leaderboard');
  return res.json();
};

export const getHistorialXP = async (userId: string) => {
  const res = await fetch(`${BASE_URL}/gamificacion/historial/${userId}`);
  if (!res.ok) throw new Error('Error al obtener historial');
  return res.json();
};
