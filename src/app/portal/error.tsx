'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error de manera segura en consola sin romper el render
    console.error('Capturado en Error Boundary de Portal:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          Aviso del Portal
        </h2>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Tu navegador o escáner cerró un proceso temporal. Si estabas enviando un ticket, descuida: el servidor usualmente ya lo tiene registrado.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/portal';
              }
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4 text-slate-500" />
            Recargar Portal
          </button>
        </div>
      </div>
    </div>
  );
}
