import React from 'react';
import { 
  Laptop, Monitor, Printer as PrinterIcon, Cpu, 
  HardDrive, Network, Smartphone 
} from 'lucide-react';

export const getDeviceIcon = (tipoEquipo: string) => {
  const t = (tipoEquipo || '').toLowerCase();
  if (t.includes('laptop') || t.includes('portátil')) return <Laptop className="w-4 h-4 text-indigo-500" />;
  if (t.includes('impresora') || t.includes('térmica')) return <PrinterIcon className="w-4 h-4 text-emerald-500" />;
  if (t.includes('monitor') || t.includes('pantalla')) return <Monitor className="w-4 h-4 text-blue-500" />;
  if (t.includes('switch') || t.includes('router') || t.includes('red')) return <Network className="w-4 h-4 text-purple-500" />;
  if (t.includes('servidor')) return <HardDrive className="w-4 h-4 text-amber-500" />;
  if (t.includes('pos') || t.includes('celular')) return <Smartphone className="w-4 h-4 text-teal-500" />;
  return <Cpu className="w-4 h-4 text-slate-500" />;
};

export const getEstadoBadge = (est: string) => {
  switch (est) {
    case 'REPARACION':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          En Taller
        </span>
      );
    case 'BAJA':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Chatarra / Baja
        </span>
      );
    case 'RESCATADO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          Rescatado
        </span>
      );
    case 'OPERATIVO':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Operativo
        </span>
      );
  }
};
