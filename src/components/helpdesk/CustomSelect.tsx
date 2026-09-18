import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}

export function CustomSelect({ value, options, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative flex-1 md:flex-none min-w-[200px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl text-sm hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold shadow-sm cursor-pointer"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  value === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                {opt}
                {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-400 text-center italic">No hay opciones</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
