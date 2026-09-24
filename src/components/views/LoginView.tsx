'use client';

import { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'sonner';
import { loginUsuario } from '@/services/api/api-client';
import { LimatamboBrand } from '../ui/LimatamboBrand';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUsuario({ email, password });

      login(data.access_token, data.usuario);
      toast.success(`¡Bienvenido de vuelta, ${data.usuario.nombre.split(' ')[0]}!`);
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#fdf2f8]/40 to-[#eff6ff]/40 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none touch-manipulation">
      {/* Auras estáticas optimizadas para GPU móvil (sin animaciones pesadas que causan lag táctil) */}
      <div className="absolute top-1/6 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-pink-200/35 rounded-full blur-3xl pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute bottom-1/6 right-1/4 translate-x-1/2 translate-y-1/2 w-[480px] h-[480px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-100/40 rounded-full blur-2xl pointer-events-none transform-gpu"></div>

      {/* Tarjeta con Glassmorfismo Ligero y Ultra-Fluido */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(225,29,72,0.07),0_10px_25px_-5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.95)] border border-white/90 ring-1 ring-slate-200/50 relative z-10 transform-gpu">
        {/* Identidad Institucional Oficial */}
        <div className="mb-7">
          <LimatamboBrand layout="horizontal" subtitle="Accede a la plataforma de soporte" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 touch-manipulation">
          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5 pl-1">
              Correo electrónico
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#e11d48] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full bg-[#f1f5f9]/80 hover:bg-[#f1f5f9] border border-transparent focus:border-[#e11d48]/40 focus:bg-white rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-2xs touch-manipulation"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5 pl-1">
              Contraseña
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#e11d48] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full bg-[#f1f5f9]/80 hover:bg-[#f1f5f9] border border-transparent focus:border-[#e11d48]/40 focus:bg-white rounded-2xl pl-11 pr-11 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-2xs touch-manipulation"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer rounded-lg hover:bg-slate-200/50 touch-manipulation"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso Rosado/Magenta Corporativo */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#e11d48] via-[#e11463] to-[#eb1b74] hover:from-[#cc103c] hover:to-[#d81567] text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-[#e11d48]/30 hover:shadow-xl hover:shadow-[#e11d48]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-5 text-sm group cursor-pointer touch-manipulation"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Pie Institucional de Seguridad */}
        <div className="mt-6 pt-5 border-t border-slate-100/80 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Acceso seguro institucional cifrado</span>
        </div>
      </div>

      {/* Copyright sutil en el fondo */}
      <p className="relative z-10 text-[11px] text-slate-400 mt-6 font-medium text-center">
        © Clínicas Limatambo · Dirección de Tecnologías de la Información
      </p>
    </div>
  );
};
