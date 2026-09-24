'use client';

import React, { useState } from 'react';
import { Bell, BellOff, BellRing, Smartphone, CheckCircle2, AlertTriangle, Send, Loader2, X, ShieldCheck } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PushNotificationModal({ isOpen, onClose }: PushNotificationModalProps) {
  const {
    isSupported,
    isSubscribed,
    permission,
    isProcessing,
    isIosNonStandalone,
    subscribe,
    unsubscribe,
    sendTest,
  } = usePushNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Icono Ilustrado */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className={cn(
            "p-3 rounded-2xl shrink-0 transition-colors",
            isSubscribed 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-indigo-50 text-indigo-600 border border-indigo-100"
          )}>
            {isSubscribed ? <BellRing className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-tight">
              Alertas en tu Celular
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Notificaciones nativas en segundo plano
            </p>
          </div>
        </div>

        {/* Explicación */}
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          Recibe alertas instantáneas en la cortina de notificaciones de tu teléfono con sonido y vibración cuando entre un <strong>Nuevo Ticket TI</strong>, aun con la <strong>pantalla bloqueada o la app cerrada</strong>.
        </p>

        {/* Estado actual del dispositivo */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Estado en este Dispositivo
          </span>

          {!isSupported ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Tu navegador actual no admite notificaciones Push nativas. Prueba instalando la PWA en Chrome o Safari.</span>
            </div>
          ) : isIosNonStandalone ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-700">
                <Smartphone className="w-4 h-4" /> Requisito de iPhone (iOS):
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Para activar notificaciones en iPhone, pulsa el botón <strong>Compartir</strong> en Safari y selecciona <strong>"Agregar a pantalla de inicio"</strong>. Luego abre la app desde tu pantalla de inicio.
              </p>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Permiso bloqueado en el navegador</p>
                <p className="text-[11px] mt-0.5">Habilita los permisos de notificación en los ajustes de tu navegador para este sitio.</p>
              </div>
            </div>
          ) : isSubscribed ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-800">¡Dispositivo Vinculado y Activo!</p>
                <p className="text-[11px] text-emerald-700">
                  Las alertas llegarán a la bandeja de tu celular con sonido y vibración.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span>Notificaciones desactivadas en este celular.</span>
            </div>
          )}
        </div>

        {/* Garantía de Seguridad y Privacidad */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Cifrado de extremo a extremo VAPID. No expone datos confidenciales.</span>
        </div>

        {/* Botones de Acción */}
        <div className="pt-2 space-y-2.5">
          {!isSubscribed ? (
            <button
              type="button"
              disabled={isProcessing || !isSupported || isIosNonStandalone}
              onClick={async () => {
                await subscribe();
              }}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-2xl text-xs md:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configurando dispositivo...</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Activar Alertas en este Celular</span>
                </>
              )}
            </button>
          ) : (
            <>
              {/* Botón de Prueba Rápida */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={sendTest}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-2xl text-xs md:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando alerta...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>📲 Enviar Notificación de Prueba</span>
                  </>
                )}
              </button>

              {/* Botón Desactivar */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={unsubscribe}
                className="w-full py-2.5 px-4 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>Desactivar en este dispositivo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PushNotificationBellButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const { isSubscribed, isSupported } = usePushNotifications();

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "relative p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center select-none active:scale-95",
          isSubscribed
            ? "bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
            : "bg-white text-slate-500 border-slate-200/90 hover:bg-slate-50 hover:text-slate-700"
        )}
        title={isSubscribed ? "Alertas Push activadas en tu celular" : "Activar alertas en tu celular"}
      >
        <Bell className="w-5 h-5" />

        {/* Indicador de estado */}
        {isSubscribed ? (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
        )}
      </button>

      <PushNotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
