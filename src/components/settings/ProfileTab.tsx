import React, { useRef, useState } from 'react';
import { User, Volume2, ShieldAlert, Upload, Trash2, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { uploadFileToStorage } from '@/services/api';
import { toast } from 'sonner';

interface ProfileTabProps {
  avatarSeed: string;
  setAvatarSeed: (seed: string) => void;
  alertasCriticas: boolean;
  setAlertasCriticas: (val: boolean) => void;
  userName?: string;
  userEmail?: string;
  // Propiedades opcionales para compatibilidad
  tituloRPG?: string;
  setTituloRPG?: (titulo: string) => void;
  userLevel?: number;
  musicaNivel?: boolean;
  setMusicaNivel?: (val: boolean) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  avatarSeed,
  setAvatarSeed,
  alertasCriticas,
  setAlertasCriticas,
  userName,
  userEmail,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    // Validación de tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadFileToStorage(file);
      if (res && res.url) {
        setAvatarSeed(res.url);
        toast.success('¡Foto de perfil cargada! Recuerda presionar "Guardar Cambios".');
      }
    } catch (err: any) {
      console.error('Error al subir foto:', err);
      toast.error(err.message || 'No se pudo subir la foto de perfil.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleQuitarFoto = () => {
    setAvatarSeed('');
    toast.info('Foto retirada. Se mostrarán tus iniciales profesionales.');
  };

  const hasCustomPhoto = Boolean(
    avatarSeed &&
    (avatarSeed.startsWith('http://') ||
     avatarSeed.startsWith('https://') ||
     avatarSeed.startsWith('data:image/') ||
     avatarSeed.startsWith('/'))
  );

  return (
    <div className="p-6 md:p-8 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
        <User className="w-5 h-5 text-indigo-500" /> Perfil y Preferencias
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Foto de Perfil Profesional */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Foto de Perfil</label>
            <p className="text-xs text-slate-500 mb-4">
              Esta foto se mostrará en los tickets asignados, historial técnico y cabecera de la plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="relative group">
                <UserAvatar
                  avatar={avatarSeed}
                  name={userName || 'Técnico TI'}
                  size="xl"
                  className="shadow-md ring-4 ring-white"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold gap-1 backdrop-blur-2xs"
                  title="Cambiar foto"
                >
                  <Camera className="w-5 h-5" />
                  <span>Cambiar</span>
                </button>
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{userName || 'Técnico de Soporte'}</h4>
                  {userEmail && <p className="text-xs text-slate-500">{userEmail}</p>}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{hasCustomPhoto ? 'Cambiar Foto' : 'Subir Foto'}</span>
                      </>
                    )}
                  </button>

                  {hasCustomPhoto && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleQuitarFoto}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  JPG, PNG o WebP. Máximo 5MB. Si no subes foto, se usarán tus iniciales corporativas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones y Alertas Técnicas */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" /> Alertas Operativas
            </label>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors bg-white shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Alertas de Tickets Críticos</p>
                    <p className="text-xs text-slate-500">Notificación y sonido de aviso cuando ingresa una emergencia técnica prioritaria.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertasCriticas}
                  onChange={(e) => setAlertasCriticas(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer shrink-0 ml-3"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


