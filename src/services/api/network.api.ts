import { BASE_URL, apiClientFetch as fetch } from './http';

export const getDireccionesIP = async () => {
  const res = await fetch(`${BASE_URL}/red/ips`);
  if (!res.ok) throw new Error('Error al obtener IPs');
  return res.json();
};

export const registrarNuevaIP = async (data: any) => {
  const res = await fetch(`${BASE_URL}/red/ips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al registrar IP');
  return res.json();
};

export const getEstadisticasRed = async () => {
  return {
    dispositivos: 4,
    ipsLibres: 20,
  };
};

export const updateDispositivoRed = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar dispositivo');
  return res.json();
};

export const asignarIP = async (ip: string, dispositivoId: string) => {
  const res = await fetch(`${BASE_URL}/red/ips/${ip}/asignar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispositivoId }),
  });
  if (!res.ok) throw new Error('Error al asignar IP');
  return res.json();
};

export const liberarIP = async (ip: string) => {
  const res = await fetch(`${BASE_URL}/red/ips/${ip}/liberar`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Error al liberar IP');
  return res.json();
};

export const getDispositivosRed = async () => {
  const res = await fetch(`${BASE_URL}/red/dispositivos`);
  if (!res.ok) throw new Error('Error al obtener dispositivos');
  return res.json();
};

export const simularCaidaRed = async () => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/simular-caida`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al simular caída');
  return res.json();
};

export const restaurarDispositivoRed = async (id: string, tecnicoId: string) => {
  const res = await fetch(`${BASE_URL}/red/dispositivos/${id}/restaurar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tecnicoId }),
  });
  if (!res.ok) throw new Error('Error al restaurar dispositivo');
  return res.json();
};
