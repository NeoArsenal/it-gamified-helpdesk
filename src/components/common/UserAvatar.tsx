import React, { useState } from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  indicator?: 'online' | 'offline' | null;
  title?: string;
}

const COLOR_PALETTES = [
  'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
  'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white',
  'bg-gradient-to-tr from-teal-600 to-cyan-600 text-white',
  'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white',
  'bg-gradient-to-tr from-sky-600 to-blue-700 text-white',
  'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white',
  'bg-gradient-to-tr from-slate-700 to-slate-900 text-white',
  'bg-gradient-to-tr from-blue-700 to-slate-800 text-white',
];

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px] rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-14 h-14 text-lg rounded-2xl',
  xl: 'w-20 h-20 text-2xl rounded-2xl',
};

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'TI';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function getColorClass(name?: string | null): string {
  if (!name) return COLOR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
  indicator = null,
  title,
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const initials = getInitials(name);
  const colorClass = getColorClass(name);

  // Consideramos foto válida si es URL completa (http/https), data URL o ruta relativa
  const isImageValid = Boolean(
    avatar &&
    !imgError &&
    (avatar.startsWith('http://') ||
     avatar.startsWith('https://') ||
     avatar.startsWith('data:image/') ||
     avatar.startsWith('/'))
  );

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} title={title || name || undefined}>
      <div
        className={`${sizeClass} overflow-hidden flex items-center justify-center font-bold select-none shadow-xs border border-white/20 transition-all ${
          isImageValid ? 'bg-slate-100' : colorClass
        }`}
      >
        {isImageValid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar!}
            alt={name || 'Avatar'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="tracking-wide">{initials}</span>
        )}
      </div>

      {indicator === 'online' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/20"
          title="En línea"
        />
      )}
      {indicator === 'offline' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-white ring-1 ring-slate-400/20"
          title="Desconectado"
        />
      )}
    </div>
  );
};
