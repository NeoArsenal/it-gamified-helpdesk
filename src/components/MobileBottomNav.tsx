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

  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className="flex flex-col items-center justify-center -mt-4 relative group cursor-pointer"
                title={item.label}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95",
                    isActive
                      ? "bg-slate-900 text-white shadow-slate-900/30 ring-4 ring-white"
                      : "bg-indigo-600 text-white shadow-indigo-600/30 ring-4 ring-white hover:bg-indigo-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold mt-1 tracking-tight transition-colors",
                    isActive ? "text-slate-900 font-extrabold" : "text-slate-500"
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
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 select-none min-w-[56px]",
                isActive
                  ? "text-slate-900 font-bold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110 text-slate-900")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-1 tracking-tight transition-colors",
                isActive ? "text-slate-900 font-bold" : "text-slate-500"
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
