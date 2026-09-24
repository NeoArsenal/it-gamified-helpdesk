'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User, Settings, LogOut, Shield, Camera, Loader2, Users, Bell } from 'lucide-react';
import { useAuth } from './providers/AuthProvider';
import { getPerfilUsuario, uploadFileToStorage, actualizarPreferenciasUsuario } from '@/services/api';
import { UserAvatar } from '@/components/common/UserAvatar';
import { PushNotificationBellButton } from '@/components/notifications/PushNotificationModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
  userId?: string;
  refreshTrigger?: number;
  onNavigateSettings?: () => void;
  onNavigateUsers?: () => void;
}

export function Header({ onMenuClick, userId, refreshTrigger, onNavigateSettings, onNavigateUsers }: HeaderProps) {
  const { user, logout, updateUser } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUserId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const res = await uploadFileToStorage(file);
      if (res && res.url) {
        await actualizarPreferenciasUsuario(targetUserId, { avatar: res.url });
        setPerfil((prev: any) => ({ ...prev, avatar: res.url }));
        updateUser({ avatar: res.url });
        toast.success('¡Foto de perfil actualizada correctamente!');
      }
    } catch (err: any) {
      console.error('Error al subir foto desde header:', err);
      toast.error(err.message || 'No se pudo actualizar la foto de perfil.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasCustomPhoto = Boolean(
    avatarSeed &&
    (avatarSeed.startsWith('http://') ||
     avatarSeed.startsWith('https://') ||
     avatarSeed.startsWith('data:image/') ||
     avatarSeed.startsWith('/'))
  );

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

      {/* Input oculto para subida rápida de foto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Acciones de Cabecera: Notificaciones Push Celular + Perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón de Campana / Alertas en el Celular */}
        <PushNotificationBellButton />

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
          {/* Avatar Profesional con Indicador En Línea */}
          <UserAvatar
            avatar={avatarSeed}
            name={nombreUsuario}
            size="sm"
            indicator="online"
          />

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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-[60] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
            {/* Cabecera Info Usuario con Avatar */}
            <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="relative group shrink-0">
                <UserAvatar
                  avatar={avatarSeed}
                  name={nombreUsuario}
                  size="md"
                />
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 text-xs truncate" title={nombreUsuario}>
                  {nombreUsuario}
                </p>
                {emailUsuario && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5" title={emailUsuario}>
                    {emailUsuario}
                  </p>
                )}
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    <Shield className="w-2.5 h-2.5 text-indigo-600" />
                    {rolUsuario === 'ADMIN' ? 'Administrador TI' : 'Técnico de Soporte'}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-1.5 space-y-1">
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Subiendo foto...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>{hasCustomPhoto ? 'Cambiar Foto de Perfil' : 'Subir Foto de Perfil'}</span>
                  </>
                )}
              </button>

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
                  <span>Configuración y Preferencias</span>
                </button>
              )}

              {rolUsuario === 'ADMIN' && onNavigateUsers && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateUsers();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 rounded-xl transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Gestión de Usuarios</span>
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
      </div>
    </header>
  );
}
