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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] md:hidden h-16 px-2 flex items-center"
    >
      <div className="flex items-center justify-around w-full max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer select-none group active:scale-95 transition-transform"
                title={item.label}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/25"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 tracking-tight transition-colors",
                    isActive ? "text-slate-900 font-extrabold" : "text-slate-500 font-semibold"
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
                "flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 select-none",
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
