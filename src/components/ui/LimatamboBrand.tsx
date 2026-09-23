import React from 'react';

interface LimatamboBrandProps {
  subtitle?: string;
  className?: string;
  size?: 'normal' | 'compact';
  layout?: 'horizontal' | 'vertical';
}

export function LimatamboBrand({ 
  subtitle, 
  className = '',
  size = 'normal',
  layout = 'horizontal'
}: LimatamboBrandProps) {
  const isCompact = size === 'compact';
  const isVertical = layout === 'vertical';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {isVertical ? (
        /* Modo Vertical (Centrado) */
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 group">
            <div className={`
              ${isCompact ? 'w-14 h-14' : 'w-16 h-16 sm:w-[72px] sm:h-[72px]'}
              rounded-2xl overflow-hidden shadow-md shadow-blue-950/15 border-2 border-white ring-1 ring-slate-200/80 bg-[#134685] flex items-center justify-center transition-transform duration-200 group-hover:scale-105
            `}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/emblem.svg" 
                alt="Clínicas Limatambo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-0.5 font-brand">
            <div className="flex flex-col items-center">
              <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.18em] text-[#d81e28] uppercase leading-tight">
                CLINICAS
              </span>
              <h1 className={`font-extrabold tracking-[0.05em] text-[#d81e28] uppercase leading-none mt-0.5 ${isCompact ? 'text-lg' : 'text-xl sm:text-[22px]'}`}>
                LIMATAMBO
              </h1>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs sm:text-sm font-sans font-bold text-[#134685] tracking-wide">
              <span>SOPORTE TI</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-slate-500 font-medium text-[10px] sm:text-xs tracking-normal">Soluciones y Sistemas</span>
            </div>
          </div>
        </div>
      ) : (
        /* Modo Horizontal (Fiel al logo oficial institucional) */
        <div className="flex items-center justify-center gap-3.5 sm:gap-4">
          <div className={`
            ${isCompact ? 'w-12 h-12 rounded-xl' : 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl'}
            overflow-hidden shadow-md shadow-blue-950/10 border-2 border-white ring-1 ring-slate-200/80 bg-[#134685] shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105
          `}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/emblem.svg" 
              alt="Clínicas Limatambo" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-left flex flex-col justify-center font-brand">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.18em] text-[#d81e28] uppercase leading-none">
              CLINICAS
            </span>
            <span className={`font-extrabold tracking-[0.05em] text-[#d81e28] uppercase leading-none mt-1 ${isCompact ? 'text-base' : 'text-lg sm:text-xl'}`}>
              LIMATAMBO
            </span>
            <span className="font-sans text-xs sm:text-[13px] font-bold text-[#134685] tracking-wide mt-1 leading-tight">
              Soporte TI
            </span>
            <span className="font-sans text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-tight leading-none mt-0.5">
              Soluciones y Sistemas
            </span>
          </div>
        </div>
      )}

      {/* Subtítulo Contextual */}
      {subtitle && (
        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-3.5 text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}

