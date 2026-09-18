import React from 'react';
import { QrCode, X, ShieldCheck, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetQrModalProps {
  activo: any | null;
  onClose: () => void;
}

export function AssetQrModal({ activo, onClose }: AssetQrModalProps) {
  if (!activo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:p-0">
      <div 
        className="fixed inset-0 print:hidden"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print print:hidden">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-600" /> Etiqueta QR Patrimonial
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center justify-center bg-white text-center print:p-0">
          <div className="border-2 border-dashed border-slate-300 p-5 rounded-2xl flex flex-col items-center gap-3 bg-white w-full print:border-solid print:border-black">
            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> SOPORTE TI · CONTROL PATRIMONIAL
            </div>

            <h4 className="text-2xl font-black text-slate-900 tracking-widest font-mono">
              {activo.codigo}
            </h4>

            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/activo/${activo.id}`}
                size={170}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="w-full text-center border-t border-slate-200 pt-2 text-xs space-y-0.5">
              <p className="font-bold text-slate-800">{activo.tipo} {activo.modelo ? `· ${activo.modelo}` : ''}</p>
              <p className="text-slate-500 font-medium">{activo.sede || 'Sede General'} {activo.departamento ? `- ${activo.departamento}` : ''}</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: {activo.id?.substring(0, 8)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 no-print print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Etiqueta
          </button>
        </div>
      </div>
    </div>
  );
}
