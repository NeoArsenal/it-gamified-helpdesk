'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from './providers/AuthProvider';
import { getPerfilUsuario } from '@/services/api/api-client';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  userId?: string;
  refreshTrigger?: number;
  onNavigateSettings?: () => void;
}

export function Header({ onMenuClick, userId, refreshTrigger, onNavigateSettings }: HeaderProps) {
  const { user, logout } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        if (!targetUserId) return;
        const data = await getPerfilUsuario(targetUserId);
        setPerfil(data);
      } catch (err) {
        console.error('Error fetching perfil in header:', err);
      }
    };
    fetchPerfil();
  }, [targetUserId, refreshTrigger]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nombreUsuario = perfil?.nombre || user?.nombre || 'Usuario TI';
  const avatarSeed = perfil?.avatar || user?.avatar || '';
  const rolUsuario = perfil?.rol || user?.rol || 'USER';
  const emailUsuario = perfil?.email || user?.email || '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 relative z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger para móviles */}
        <button 
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Perfil del Usuario en el Header */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(prev => !prev)}
          className={cn(
            "flex items-center gap-2.5 sm:gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer select-none",
            dropdownOpen
              ? "bg-slate-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
              : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs hover:border-slate-300"
          )}
          title="Opciones de cuenta"
        >
          {/* Avatar con Indicador En Línea */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-400/40 shadow-xs overflow-hidden text-white font-bold text-xs sm:text-sm">
              {avatarSeed && avatarSeed.length > 2 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=e2e8f0`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover bg-slate-100" 
                />
              ) : (
                <span>{avatarSeed || nombreUsuario.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="En línea" />
          </div>

          {/* Información: Nombre y Rol */}
          <div className="hidden sm:flex flex-col text-left min-w-0">
            <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate max-w-[140px] md:max-w-[180px]">
              {nombreUsuario}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={cn(
                "text-[9px] md:text-[10px] font-bold px-1.5 py-0.2 rounded-md",
                rolUsuario === 'ADMIN'
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              )}>
                {rolUsuario === 'ADMIN' ? 'Administrador TI' : 'Soporte TI'}
              </span>
            </div>
          </div>

          <ChevronDown className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 hidden sm:block",
            dropdownOpen && "rotate-180 text-indigo-600"
          )} />
        </button>

        {/* Dropdown del Perfil */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
            {/* Cabecera Info Usuario */}
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="font-bold text-slate-800 text-xs truncate" title={nombreUsuario}>
                {nombreUsuario}
              </p>
              {emailUsuario && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={emailUsuario}>
                  {emailUsuario}
                </p>
              )}
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Shield className="w-3 h-3 text-indigo-600" />
                  {rolUsuario === 'ADMIN' ? 'Administrador TI' : 'Técnico de Soporte'}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-1.5 space-y-1">
              {onNavigateSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Configuración y Perfil</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
