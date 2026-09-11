'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, TicketIcon, X, CheckCircle2, ChevronDown, Monitor, Stethoscope, Briefcase } from 'lucide-react';
import { getUbicacionesSedes, getUbicacionesDepartamentos, getUbicacionesAreas, crearTicket, verifyPortalPin } from '@/services/api/api-client';

// Componente Select personalizado simplificado para el portal
function PortalSelect({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-xl text-base hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold shadow-sm"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-base rounded-lg transition-colors flex items-center justify-between ${value === opt ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
              >
                {opt}
                {value === opt && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-4 text-sm text-slate-400 text-center italic">No hay opciones disponibles</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Ticket Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [solicitanteNombre, setSolicitanteNombre] = useState('');
  const [solicitanteContacto, setSolicitanteContacto] = useState('');
  
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [area, setArea] = useState('');

  const [sedesList, setSedesList] = useState<string[]>([]);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);

  useEffect(() => {
    // Check si ya ingresó el PIN previamente (guardado en localStorage)
    const savedPin = localStorage.getItem('portal_pin_verified');
    if (savedPin === 'true') {
      setIsAuthenticated(true);
      cargarDatosBase();
    }
  }, []);

  const cargarDatosBase = () => {
    getUbicacionesSedes().then(data => {
      setSedesList(data);
    }).catch(console.error);
  };

  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede).then(data => {
        setDepartamentosList(data);
        setDepartamento('');
        setArea('');
      }).catch(console.error);
    }
  }, [sede]);

  useEffect(() => {
    if (sede && departamento) {
      getUbicacionesAreas(sede, departamento).then(data => {
        setAreasList(data);
        setArea('');
      }).catch(console.error);
    } else {
      setAreasList([]);
    }
  }, [sede, departamento]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await verifyPortalPin(pin);
      if (res.valid) {
        localStorage.setItem('portal_pin_verified', 'true');
        setIsAuthenticated(true);
        cargarDatosBase();
      } else {
        setPinError('PIN incorrecto. Intenta nuevamente.');
        setPin('');
      }
    } catch (error) {
      setPinError('Error de conexión.');
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !sede || !departamento) return;
    
    setIsSubmitting(true);
    try {
      await crearTicket({
        titulo,
        sede,
        departamento,
        ubicacionEspecifica: area,
        solicitanteNombre,
        solicitanteContacto,
      });
      setIsSuccess(true);
      // Limpiar formulario excepto datos del solicitante
      setTitulo('');
      setSede('');
      setDepartamento('');
      setArea('');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al enviar el reporte. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Portal de TI</h1>
          <p className="text-center text-slate-500 mb-8 text-sm">Ingresa el PIN de acceso para reportar un problema.</p>
          
          <form onSubmit={handleVerifyPin}>
            <div className="relative mb-6">
              {/* 4 Cajas Visuales de Alto Contraste para el PIN */}
              <div className="flex justify-center items-center gap-3">
                {[0, 1, 2, 3].map((index) => {
                  const hasChar = pin.length > index;
                  const isCurrent = pin.length === index;
                  return (
                    <div
                      key={index}
                      className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all ${
                        hasChar
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm scale-105'
                          : isCurrent
                          ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/15'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      {hasChar ? (
                        <span className="w-4 h-4 bg-indigo-600 rounded-full shadow-xs transform scale-110 transition-transform" />
                      ) : (
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input invisible que captura el teclado numérico del celular sin problemas de color de texto */}
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPin(val);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-transparent caret-transparent selection:bg-transparent"
                autoFocus
                autoComplete="off"
              />
            </div>

            {pinError && (
              <p className="text-red-500 text-sm text-center mb-4 font-bold animate-in fade-in">
                {pinError}
              </p>
            )}

            <button 
              type="submit"
              disabled={pin.length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Entrar al Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">¡Reporte Enviado!</h2>
          <p className="text-slate-600 mb-8 text-lg">El equipo de Sistemas ya fue notificado y está revisando tu caso.</p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-all"
          >
            Reportar otro problema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:items-center md:py-10">
      <div className="max-w-lg w-full bg-white md:rounded-3xl shadow-xl overflow-hidden flex-1 md:flex-none flex flex-col relative">
        
        {/* Header Decorativo */}
        <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-indigo-400/20 blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">
              <ShieldAlert className="w-4 h-4" /> Soporte TI
            </div>
            <button 
              onClick={() => { localStorage.removeItem('portal_pin_verified'); setIsAuthenticated(false); }}
              className="text-white/70 hover:text-white text-xs font-medium underline"
            >
              Salir
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-black relative z-10">¿En qué te podemos ayudar hoy?</h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmitTicket} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto pb-32 md:pb-8">
          
          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              1. ¿Dónde estás?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Sede *</label>
                <PortalSelect value={sede} onChange={setSede} options={sedesList} placeholder="Ej. Tower 1" />
              </div>
              
              {sede && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Departamento *</label>
                  <PortalSelect value={departamento} onChange={setDepartamento} options={departamentosList} placeholder="Ej. Urgencias" />
                </div>
              )}
            </div>

            {departamento && areasList.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <label className="block text-xs font-bold text-slate-600 mb-2">Área Específica (Opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {areasList.map(a => (
                    <button
                      key={a} type="button" onClick={() => setArea(a)}
                      className={`px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${area === a ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t-2 border-slate-100 my-6"></div>

          {/* Problema */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              2. ¿Qué sucede?
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Descripción breve del problema *</label>
              <textarea
                required
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                rows={3}
                placeholder="Ej. La impresora principal no enciende, hace un ruido extraño..."
                className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="border-t-2 border-slate-100 my-6"></div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              3. ¿A quién contactamos?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre (Opcional)</label>
                <input
                  type="text"
                  value={solicitanteNombre}
                  onChange={e => setSolicitanteNombre(e.target.value)}
                  placeholder="Ej. Dra. Gómez"
                  className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Extensión / Teléfono (Opcional)</label>
                <input
                  type="text"
                  value={solicitanteContacto}
                  onChange={e => setSolicitanteContacto(e.target.value)}
                  placeholder="Ej. Ext 1045"
                  className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Botón de Enviar: Fijo en la parte inferior en modo responsive / móvil */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] z-30 md:static md:bg-transparent md:p-0 md:border-none md:shadow-none md:pt-6">
            <div className="max-w-lg mx-auto w-full">
              <button
                type="submit"
                disabled={isSubmitting || !titulo || !sede || !departamento}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base md:text-lg font-black py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Reporte a Sistemas
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
