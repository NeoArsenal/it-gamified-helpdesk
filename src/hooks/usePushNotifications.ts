'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPushPublicKey,
  subscribePushSubscription,
  unsubscribePushSubscription,
  testPushAlert,
} from '@/services/api';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIosNonStandalone, setIsIosNonStandalone] = useState(false);

  // Comprobar soporte inicial y estado de suscripción
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    // Detección iOS: Si es iPhone/iPad y no está agregada a pantalla de inicio
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isIos && !isStandalone) {
      setIsIosNonStandalone(true);
    }

    if (!supported) {
      setLoading(false);
      return;
    }

    setPermission(Notification.permission);

    // Registrar o verificar Service Worker
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (registration) => {
        try {
          const existingSub = await registration.pushManager.getSubscription();
          setIsSubscribed(Boolean(existingSub));
        } catch (e) {
          console.error('Error al consultar suscripción push:', e);
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error registrando Service Worker:', err);
        setLoading(false);
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Tu navegador o dispositivo no soporta notificaciones push.');
      return false;
    }

    if (isIosNonStandalone) {
      toast.info('Requisito de Apple iOS', {
        description: 'En iPhone, primero debes pulsar "Compartir" y seleccionar "Agregar a pantalla de inicio" para activar notificaciones.',
        duration: 8000,
      });
      return false;
    }

    try {
      setIsProcessing(true);

      // 1. Solicitar permiso explícito al usuario
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission !== 'granted') {
        if (currentPermission === 'denied') {
          toast.error('Permiso bloqueado', {
            description: 'Has denegado las notificaciones. Habilítalas en los ajustes de tu navegador.',
          });
        }
        return false;
      }

      // 2. Obtener clave pública VAPID del backend
      const { publicKey } = await getPushPublicKey();
      if (!publicKey) {
        throw new Error('El servidor no proporcionó la clave pública VAPID.');
      }

      // 3. Obtener registro del Service Worker
      const registration = await navigator.serviceWorker.ready;

      // 4. Suscribir con el PushManager del navegador
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('No se pudo generar la clave de suscripción del dispositivo.');
      }

      // 5. Guardar la suscripción en el backend vinculada a este usuario
      await subscribePushSubscription({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      toast.success('¡Alertas en el celular activadas!', {
        description: 'Recibirás notificaciones en segundo plano incluso con la app cerrada.',
        duration: 5000,
      });
      return true;
    } catch (err: any) {
      console.error('Error al suscribir a notificaciones push:', err);
      toast.error('Error al activar notificaciones', {
        description: err.message || 'No se pudo conectar con el servicio Push.',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isSupported, isIosNonStandalone]);

  const unsubscribe = useCallback(async () => {
    try {
      setIsProcessing(true);
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();

      if (existingSub) {
        await unsubscribePushSubscription(existingSub.endpoint).catch((e) =>
          console.warn('Error backend al desuscribir:', e)
        );
        await existingSub.unsubscribe();
      }

      setIsSubscribed(false);
      toast.info('Notificaciones en segundo plano desactivadas.');
      return true;
    } catch (err: any) {
      console.error('Error al desuscribir notificaciones:', err);
      toast.error('No se pudo desactivar las notificaciones.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    try {
      setIsProcessing(true);
      await testPushAlert();
      toast.success('¡Alerta de prueba enviada!', {
        description: 'Revisa la barra de notificaciones de tu teléfono.',
      });
    } catch (err: any) {
      toast.error('Error al enviar alerta de prueba', {
        description: err.message || 'Intenta nuevamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    isProcessing,
    isIosNonStandalone,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
