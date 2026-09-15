'use client';

import { useState } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'sonner';
import { loginUsuario } from '@/services/api/api-client';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-100">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo-limatambo.png" 
              alt="Clínicas Limatambo - Soporte TI" 
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </div>
          <p className="text-slate-500 font-medium text-sm">Accede a la plataforma de soporte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email"
              required
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
              placeholder="juan@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password"
              required
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar al Sistema'}
          </button>
        </form>
        
        <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Cuentas de prueba:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">juan@clinica.com (Admin)</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">carlos@clinica.com (Técnico)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Pass: admin123</p>
        </div>
      </div>
    </div>
  );
};
