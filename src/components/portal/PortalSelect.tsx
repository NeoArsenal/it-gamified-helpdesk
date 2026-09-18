import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PortalSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}

export const PortalSelect: React.FC<PortalSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl text-base hover:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold shadow-sm cursor-pointer"
      >
        <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-base rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  value === opt
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                {opt}
                {value === opt && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-4 text-sm text-slate-400 text-center italic">
                No hay opciones disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
