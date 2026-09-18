import { BASE_URL, apiClientFetch as fetch } from './http';

export const loginUsuario = async (credentials: any) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }
  return data;
};
