import React from 'react';
import { Key, RotateCcw, Save, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface PortalKioskTabProps {
  portalUrl: string;
  portalPin: string;
  setPortalPinState: (pin: string) => void;
  isSaving: boolean;
  isRegeneratingToken: boolean;
  handleSavePortalPin: () => Promise<void>;
  handleRegenerateToken: () => Promise<void>;
}

export const PortalKioskTab: React.FC<PortalKioskTabProps> = ({
  portalUrl,
  portalPin,
  setPortalPinState,
  isSaving,
  isRegeneratingToken,
  handleSavePortalPin,
  handleRegenerateToken,
}) => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Portal Kiosco para Usuarios</h3>
        <p className="text-sm text-slate-500 mb-4">Configura el acceso al portal de auto-servicio sin registro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700">Enlace del Portal (con Llave de Acceso Criptográfica)</h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <Key className="w-3 h-3 text-emerald-600" /> Token Seguro
              </span>
            </div>
            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="flex-1 min-w-0 px-3 py-2 text-xs font-mono bg-slate-50 text-slate-600 outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(portalUrl);
                  toast.success('Enlace copiado al portapapeles');
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 font-bold text-sm transition-colors border-l border-slate-200 shrink-0 cursor-pointer"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Este enlace incluye una clave única generada por el servidor (<span className="font-mono text-indigo-600">?key=...</span>). Quien acceda con esta URL ingresa de forma inmediata al formulario.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-bold text-slate-700">Llave del Código QR</h5>
              <p className="text-xs text-slate-500">Si deseas invalidar el QR actual para que ya no funcione el enlace anterior, genera una nueva llave.</p>
            </div>
            <button
              onClick={handleRegenerateToken}
              disabled={isRegeneratingToken}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-indigo-600 ${isRegeneratingToken ? 'animate-spin' : ''}`} />
              {isRegeneratingToken ? 'Regenerando...' : 'Regenerar Llave QR'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-700 mb-1">PIN de Acceso Manual</h4>
            <p className="text-xs text-slate-500 mb-3">Este PIN de 4 dígitos solo se solicitará si alguien entra escribiendo la URL a mano sin la llave del QR.</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                maxLength={4}
                value={portalPin}
                onChange={(e) => setPortalPinState(e.target.value)}
                className="w-24 px-4 py-2 text-center text-xl tracking-[0.5em] font-black bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSavePortalPin}
                disabled={isSaving || portalPin.length < 4}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                Guardar PIN
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-3 text-slate-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h4>Código QR Inteligente</h4>
          </div>
          {portalUrl && (
            <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-indigo-100">
              <QRCodeSVG value={portalUrl} size={160} level="M" />
            </div>
          )}
          <p className="text-xs text-slate-500 mt-4 text-center max-w-[180px] leading-relaxed">
            Imprime este código. Al escanearlo, el personal entra directo sin pedirles PIN.
          </p>
          <a
            href={portalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            Probar Acceso con QR &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
