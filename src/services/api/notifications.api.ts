import { BASE_URL, apiClientFetch as fetch, safeJsonResponse } from './http';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export const getPushPublicKey = async (): Promise<{ publicKey: string }> => {
  const res = await fetch(`${BASE_URL}/notifications/push/public-key`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener la clave pública VAPID');
  }
  return res.json();
};

export const subscribePushSubscription = async (data: PushSubscriptionPayload): Promise<{ success: boolean; id: string }> => {
  const res = await fetch(`${BASE_URL}/notifications/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar suscripción Push');
  }
  return res.json();
};

export const unsubscribePushSubscription = async (endpoint: string): Promise<{ success: boolean }> => {
  const res = await fetch(`${BASE_URL}/notifications/push/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al desuscribir notificaciones Push');
  }
  return res.json();
};

export const testPushAlert = async (): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${BASE_URL}/notifications/push/test`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al enviar alerta Push de prueba');
  }
  return res.json();
};
