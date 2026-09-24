'use client';

import { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#070e24] bg-radial-[at_50%_40%] from-[#0f214d] via-[#091433] to-[#050b1d] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Luces atmosféricas difusas de fondo (Glow Orbs) */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[520px] h-[520px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Tarjeta de Inicio de Sesión con Glassmorfismo Limpio y Corporativo */}
      <div className="w-full max-w-md bg-white/95 sm:bg-white/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.7)] border border-white/80 ring-1 ring-slate-900/5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Identidad Institucional Oficial */}
        <div className="mb-7">
          <LimatamboBrand layout="horizontal" subtitle="Accede a la plataforma de soporte" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5 pl-1">
              Correo electrónico
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#134685] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 focus:border-[#134685] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
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
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#134685] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 focus:border-[#134685] rounded-xl pl-10 pr-11 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso Corporativo */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#134685] to-[#1c5fb4] hover:from-[#0f3a70] hover:to-[#17529c] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#134685]/25 hover:shadow-xl hover:shadow-[#134685]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-5 text-sm group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Accediendo al sistema...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Pie Institucional de Seguridad */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Acceso seguro institucional cifrado</span>
        </div>
      </div>

      {/* Copyright sutil en el fondo */}
      <p className="relative z-10 text-[11px] text-slate-400/80 mt-6 font-medium text-center">
        © Clínicas Limatambo · Dirección de Tecnologías de la Información
      </p>
    </div>
  );
};
