'use client';

import React from 'react';
import { Ticket, Network, Home, Box, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function MobileBottomNav({ activeView, setActiveView }: MobileBottomNavProps) {
  const items = [
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      isCenter: false,
    },
    {
      id: 'network',
      label: 'Redes',
      icon: Network,
      isCenter: false,
    },
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: Home,
      isCenter: true,
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Box,
      isCenter: false,
    },
    {
      id: 'analytics',
      label: 'Analítica',
      icon: BarChart3,
      isCenter: false,
    },
  ];

  const handleSelect = (id: string) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignorar si el navegador restringe vibración
      }
    }
    setActiveView(id);
  };

  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.07)] md:hidden h-[68px] px-2 flex items-center pb-[max(env(safe-area-inset-bottom,0px),0.25rem)] select-none"
    >
      <div className="flex items-end justify-around w-full max-w-lg mx-auto relative h-full pb-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className="flex-1 flex flex-col items-center justify-end py-0.5 cursor-pointer group active:scale-95 transition-transform"
                title={item.label}
              >
                {/* Botón flotante central con animación de rebote elástica */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    isActive
                      ? "-translate-y-4 scale-105 bg-slate-900 text-white shadow-xl shadow-slate-900/35 ring-4 ring-white"
                      : "-translate-y-1.5 scale-95 bg-white text-slate-500 hover:text-slate-800 border border-slate-200/90 shadow-sm ring-2 ring-slate-100 hover:scale-100"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isActive ? "scale-110 text-white" : "text-slate-600 group-hover:scale-105"
                  )} />
                </div>
                <span
                  className={cn(
                    "text-[10px] tracking-tight transition-all duration-200 -mt-0.5",
                    isActive 
                      ? "text-slate-900 font-black -translate-y-2 scale-105" 
                      : "text-slate-500 font-semibold group-hover:text-slate-700"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className="flex-1 flex flex-col items-center justify-end py-1 rounded-xl transition-all duration-150 cursor-pointer active:scale-90 group"
            >
              <div className="relative flex flex-col items-center">
                <div className={cn(
                  "w-9 h-7 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-slate-100 text-slate-900 -translate-y-0.5 shadow-2xs" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "scale-110 text-slate-900 stroke-[2.3]" : "stroke-[1.8] group-hover:scale-105"
                  )} />
                </div>

                {/* Micro punto indicador animado suave */}
                <div className="h-1 flex items-center justify-center mt-0.5">
                  <span 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full bg-slate-900 transition-all duration-300 ease-out",
                      isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )} 
                  />
                </div>
              </div>

              <span className={cn(
                "text-[10px] tracking-tight transition-all duration-200 mt-0.5",
                isActive ? "text-slate-900 font-extrabold" : "text-slate-400 group-hover:text-slate-600 font-medium"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
