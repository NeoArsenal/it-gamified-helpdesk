'use client';
import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TicketIcon, 
  CheckCircle2, 
  ChevronDown, 
  LogOut, 
  Search, 
  Clock, 
  Check, 
  MapPin, 
  User, 
  Phone, 
  RefreshCw, 
  Copy, 
  CheckCheck,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  getUbicacionesSedes, 
  getUbicacionesDepartamentos, 
  getUbicacionesAreas, 
  crearTicket, 
  trackTicket,
  verifyPortalPin, 
  verifyPortalAccess, 
  safeStorage 
} from '@/services/api/api-client';
import { LimatamboBrand } from '@/components/ui/LimatamboBrand';

// Componente Select personalizado simplificado para el portal
function PortalSelect({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-900 border-2 border-slate-300 rounded-xl text-base hover:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold shadow-sm"
      >
        <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}>{value || placeholder}</span>
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
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Pestañas del Portal: 'reportar' | 'consultar'
  const [activeTab, setActiveTab] = useState<'reportar' | 'consultar'>('reportar');
  const [showDirectTracker, setShowDirectTracker] = useState(false);

  // Formulario de Reporte
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketInfo, setCreatedTicketInfo] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [solicitanteNombre, setSolicitanteNombre] = useState('');
  const [solicitanteContacto, setSolicitanteContacto] = useState('');
  
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [area, setArea] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [sedesList, setSedesList] = useState<string[]>([]);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);

  // Seguimiento de Tickets
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackedTickets, setTrackedTickets] = useState<any[] | null>(null);
  const [trackError, setTrackError] = useState('');
  const [lastSearchedCode, setLastSearchedCode] = useState('');

  useEffect(() => {
    // 1. Revisar si viene con token secreto desde el código QR (?key=... o ?token=...)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenParam = searchParams.get('key') || searchParams.get('token') || searchParams.get('k');
      const trackParam = searchParams.get('track');

      if (trackParam) {
        setActiveTab('consultar');
        setSearchQuery(trackParam);
        ejecutarSeguimiento(trackParam);
      }

      if (tokenParam) {
        setIsValidatingToken(true);
        verifyPortalAccess({ token: tokenParam })
          .then((res) => {
            if (res.valid) {
              safeStorage.setItem('portal_pin_verified', 'true');
              setIsAuthenticated(true);
              cargarDatosBase();
              try {
                window.history.replaceState({}, '', window.location.pathname);
              } catch (e) {}
            } else {
              setPinError('Código QR no válido o expirado. Ingresa el PIN manual.');
            }
          })
          .catch(() => {
            setPinError('Error de conexión al verificar el código QR.');
          })
          .finally(() => {
            setIsValidatingToken(false);
          });
        return;
      }
    }

    // 2. Check si ya ingresó el PIN previamente
    const savedPin = safeStorage.getItem('portal_pin_verified');
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
        safeStorage.setItem('portal_pin_verified', 'true');
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

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, '').slice(0, 40);
    setSolicitanteNombre(sanitized);
  };

  const handleContactoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^0-9\s]/g, '');
    const digitsOnly = sanitized.replace(/\s/g, '');

    if (digitsOnly.length > 9) return;

    let displayVal = sanitized;
    if (digitsOnly.length === 9 && !sanitized.includes(' ')) {
      displayVal = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    }

    setSolicitanteContacto(displayVal);
  };

  const handleContactoBlur = () => {
    const digitsOnly = solicitanteContacto.replace(/\s/g, '');
    if (digitsOnly.length === 9) {
      setSolicitanteContacto(`${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`);
    } else if (digitsOnly.length === 7) {
      setSolicitanteContacto(`${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !sede || !departamento) return;
    
    const digits = solicitanteContacto.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 3) {
      alert('Por favor escribe un anexo válido (mínimo 3 dígitos) o celular (9 dígitos), o déjalo en blanco.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await crearTicket({
        titulo,
        sede,
        departamento,
        ubicacionEspecifica: area,
        solicitanteNombre: solicitanteNombre.trim(),
        solicitanteContacto: solicitanteContacto.trim(),
        website: honeypot,
      });

      setCreatedTicketInfo(result);
      setIsSuccess(true);
      // Limpiar formulario excepto datos del solicitante
      setTitulo('');
      setSede('');
      setDepartamento('');
      setArea('');
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('límite') || msg.toLowerCase().includes('espera')) {
        alert(msg);
      } else {
        alert('Hubo un error al enviar el reporte. Por favor intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const ejecutarSeguimiento = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q || q.length < 3) {
      setTrackError('Ingresa al menos 3 caracteres de tu código o teléfono');
      return;
    }

    setIsSearchingTrack(true);
    setTrackError('');
    setLastSearchedCode(q);

    try {
      const data = await trackTicket(q);
      if (Array.isArray(data) && data.length > 0) {
        setTrackedTickets(data);
      } else if (data && data.id) {
        setTrackedTickets([data]);
      } else {
        setTrackedTickets([]);
        setTrackError('No encontramos tickets con ese código o número');
      }
    } catch (err: any) {
      setTrackedTickets([]);
      setTrackError(err?.message || 'No se encontró ningún ticket con esos datos');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const copiarCodigoTicket = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const irAConsultarCreado = () => {
    const code = createdTicketInfo?.id ? `TK-${createdTicketInfo.id.slice(0, 6).toUpperCase()}` : '';
    setIsSuccess(false);
    setActiveTab('consultar');
    setShowDirectTracker(true);
    if (code) {
      setSearchQuery(code);
      ejecutarSeguimiento(code);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Verificando Código QR...</h2>
          <p className="text-slate-500 text-sm">Autenticando acceso clínico directo...</p>
        </div>
      </div>
    );
  }

  // Vista de pantalla completa de Consulta Directa (si no está autenticado con PIN y quiere consultar su ticket)
  if (!isAuthenticated && showDirectTracker) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col md:items-center md:py-10">
        <div className="max-w-lg w-full bg-white md:rounded-3xl shadow-xl overflow-hidden flex-1 md:flex-none flex flex-col">
          {/* Header */}
          <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/emblem.svg" alt="Limatambo" className="w-4 h-4 rounded object-cover" />
                <span>Soporte TI · Clínicas Limatambo</span>
              </div>
              <button 
                onClick={() => setShowDirectTracker(false)}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
              >
                ← Volver al PIN
              </button>
            </div>
            <h1 className="text-2xl font-black">🔍 Consultar Estado de Ticket</h1>
            <p className="text-indigo-100 text-xs mt-1 font-medium">
              Ingresa el código (#TK-XXXXXX) o tu número de teléfono registrado
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            {renderTrackingInterface()}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-in zoom-in-95 duration-500">
          <div className="mb-8">
            <LimatamboBrand subtitle="Ingresa el PIN de acceso para reportar un problema." />
          </div>
          
          <form onSubmit={handleVerifyPin}>
            <div className="relative mb-6">
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

          {/* Acceso Rápido para Consultar Ticket sin PIN */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => setShowDirectTracker(true)}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-3 rounded-lg hover:bg-indigo-50"
            >
              <Search className="w-4 h-4" />
              ¿Ya tienes un ticket? Consultar estado aquí
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Éxito al Enviar Reporte (con estilo Duolingo y código fácil)
  if (isSuccess) {
    const ticketCode = createdTicketInfo?.id ? `TK-${createdTicketInfo.id.slice(0, 6).toUpperCase()}` : 'TK-RECIBIDO';
    return (
      <div className="min-h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-300">
          {/* Ilustración Duolingo Doctor Esperando */}
          <div className="relative w-36 h-36 mx-auto mb-4 overflow-hidden rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-inner flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/illustrations/ticket-waiting.jpg" 
              alt="Caso recibido en espera" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ¡Reporte Enviado a Sistemas!
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">Tu caso ya está en cola</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-5">
            El personal técnico ha sido notificado en tiempo real y atenderá tu solicitud.
          </p>

          {/* Tarjeta con Código de Ticket Duolingo Style */}
          <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 mb-6 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Código de Seguimiento
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl md:text-3xl font-black text-indigo-700 font-mono tracking-wider">
                #{ticketCode}
              </span>
              <button
                onClick={() => copiarCodigoTicket(ticketCode)}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
                title="Copiar código"
              >
                {copiedCode ? <CheckCheck className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copiedCode && (
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block animate-in fade-in">
                ¡Código copiado al portapapeles!
              </span>
            )}
          </div>

          <div className="space-y-3">
            <button 
              onClick={irAConsultarCreado}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Ver Estado en Vivo de mi Ticket
            </button>

            <button 
              onClick={() => { setIsSuccess(false); setActiveTab('reportar'); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all text-sm"
            >
              Reportar otro problema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper para renderizar la interfaz de consulta / tracking
  function renderTrackingInterface() {
    return (
      <div className="space-y-6">
        {/* Barra de Búsqueda */}
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Buscar por Código (#TK-XXXXXX) o Teléfono/Anexo
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ejecutarSeguimiento()}
                placeholder="Ej. TK-104 o 999 123 456"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all font-mono"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              onClick={() => ejecutarSeguimiento()}
              disabled={isSearchingTrack || searchQuery.trim().length < 3}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              {isSearchingTrack ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Consultar</span>
              )}
            </button>
          </div>

          {trackError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{trackError}</span>
            </div>
          )}
        </div>

        {/* Resultados del Seguimiento */}
        {trackedTickets && trackedTickets.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                {trackedTickets.length === 1 ? '1 Ticket Encontrado' : `${trackedTickets.length} Tickets Encontrados`}
              </h3>
              <button
                onClick={() => ejecutarSeguimiento()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>

            {trackedTickets.map((tk) => {
              const isAbierto = tk.estado === 'ABIERTO';
              const isProgreso = tk.estado === 'EN_PROGRESO';
              const isResuelto = tk.estado === 'RESUELTO' || tk.estado === 'CERRADO';

              let illustrationImg = '/illustrations/ticket-waiting.jpg';
              let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
              let badgeText = 'EN ESPERA · EN COLA DE ASIGNACIÓN';
              let titleMsg = 'Tu caso fue recibido y está en espera';
              let descMsg = 'El equipo de Sistemas lo asignará a un técnico para resolverlo a la brevedad.';

              if (isProgreso) {
                illustrationImg = '/illustrations/tech-running.jpg';
                badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
                badgeText = 'EN PROGRESO · TÉCNICO EN CAMINO';
                titleMsg = '¡Técnico en camino a tu área!';
                descMsg = tk.tecnicoAsignado?.nombre 
                  ? `${tk.tecnicoAsignado.nombre} está atendiendo tu reporte ahora mismo.`
                  : 'Un técnico de TI ha tomado tu requerimiento y está en marcha.';
              } else if (isResuelto) {
                illustrationImg = '/illustrations/ticket-resolved.jpg';
                badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                badgeText = 'RESUELTO · SERVICIO OPERATIVO';
                titleMsg = '¡Problema Solucionado con Éxito!';
                descMsg = tk.solucion 
                  ? `Solución: ${tk.solucion}`
                  : 'El equipo técnico dio por concluido el reporte.';
              }

              return (
                <div 
                  key={tk.id} 
                  className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-md relative overflow-hidden transition-all hover:border-indigo-300"
                >
                  {/* Ilustración Duolingo Dinámica según el Estado */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 mb-5 pb-5 border-b border-slate-100">
                    <div className="w-28 h-28 shrink-0 rounded-2xl bg-slate-50 border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={illustrationImg} 
                        alt={badgeText} 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wide border ${badgeColor}`}>
                        {badgeText}
                      </div>
                      <h4 className="text-lg font-black text-slate-800 leading-tight">
                        {titleMsg}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-600 font-medium">
                        {descMsg}
                      </p>
                    </div>
                  </div>

                  {/* Stepper Duolingo Style (3 Pasos Visuales) */}
                  <div className="mb-6 px-2">
                    <div className="relative flex items-center justify-between">
                      {/* Línea de Fondo */}
                      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full -z-0">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: isResuelto ? '100%' : isProgreso ? '50%' : '5%',
                          }}
                        />
                      </div>

                      {/* Paso 1: Recibido */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">Recibido</span>
                      </div>

                      {/* Paso 2: En Camino */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-md transition-all ${
                          isProgreso 
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse' 
                            : isResuelto 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {isResuelto ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                        </div>
                        <span className={`text-[11px] font-bold mt-1 ${isProgreso ? 'text-indigo-700 font-black' : 'text-slate-600'}`}>
                          En Camino
                        </span>
                      </div>

                      {/* Paso 3: Resuelto */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-md transition-all ${
                          isResuelto 
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' 
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {isResuelto ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                        </div>
                        <span className={`text-[11px] font-bold mt-1 ${isResuelto ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                          Resuelto
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Técnico Asignado (si existe) */}
                  {tk.tecnicoAsignado && (
                    <div className="mb-4 p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                        {tk.tecnicoAsignado.nombre ? tk.tecnicoAsignado.nombre.slice(0, 2).toUpperCase() : 'TI'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black text-indigo-500 tracking-wider block">
                          Técnico de Sistemas Asignado
                        </span>
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {tk.tecnicoAsignado.nombre}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resumen del Ticket */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-700 text-sm">
                        #{tk.ticketCode || `TK-${tk.id.slice(0, 6).toUpperCase()}`}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {new Date(tk.creadoEn).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <p className="font-bold text-slate-800 text-sm">
                      {tk.titulo}
                    </p>

                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-slate-500 pt-1 border-t border-slate-200/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {tk.sede} · {tk.departamento} {tk.ubicacionEspecifica ? `(${tk.ubicacionEspecifica})` : ''}
                      </span>
                      {tk.solicitanteNombre && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {tk.solicitanteNombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : trackedTickets && trackedTickets.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 mb-1">No se encontraron tickets</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Verifica haber escrito correctamente tu código (ej. TK-104) o el número de teléfono/anexo con el que reportaste.
            </p>
          </div>
        ) : (
          /* Estado inicial / Guía rápida Duolingo */
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-indigo-950">Consulta en Tiempo Real</h4>
            <p className="text-xs text-indigo-800/80 max-w-sm mx-auto leading-relaxed">
              No necesitas llamar por anexo a Sistemas. Ingresa el código generado al reportar o tu celular y mira al instante si el técnico ya está en camino a tu consultorio o área.
            </p>
          </div>
        )}
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
          
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/emblem.svg" alt="Limatambo" className="w-4 h-4 rounded object-cover" />
              <span>Soporte TI · Limatambo</span>
            </div>
            <button 
              onClick={() => { safeStorage.removeItem('portal_pin_verified'); setIsAuthenticated(false); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 text-xs font-black shadow-md border border-white/40 transition-all cursor-pointer"
              title="Cerrar sesión del portal"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-600" />
              <span>Salir</span>
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-black relative z-10 leading-tight">
            {activeTab === 'reportar' ? '¿En qué te podemos ayudar hoy?' : 'Seguimiento de Ticket'}
          </h1>
          <p className="text-indigo-100/90 text-xs md:text-sm mt-1 font-medium relative z-10">
            {activeTab === 'reportar' 
              ? 'Completa los 3 pasos a continuación para enviar tu reporte rápidamente'
              : 'Verifica el estado en vivo de tus requerimientos técnicos'
            }
          </p>

          {/* Pestañas Segmentadas Duolingo Style */}
          <div className="mt-5 p-1 bg-indigo-900/40 backdrop-blur-md rounded-2xl flex gap-1 relative z-10 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('reportar')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'reportar'
                  ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                  : 'text-indigo-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              Reportar Problema
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('consultar')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'consultar'
                  ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                  : 'text-indigo-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
              Consultar mi Ticket
            </button>
          </div>
        </div>

        {/* Contenido: Tab 1 (Reportar) ó Tab 2 (Consultar) */}
        {activeTab === 'consultar' ? (
          <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-12">
            {renderTrackingInterface()}
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto pb-32 md:pb-8">
            
            {/* Campo invisible Honeypot anti-spam */}
            <div className="absolute opacity-0 pointer-events-none -z-50 h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
              <label htmlFor="website_check">Dejar este campo vacío</label>
              <input
                type="text"
                id="website_check"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-black shadow-sm shrink-0">
                  1
                </span>
                <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
                  ¿Dónde te encuentras?
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Sede <span className="text-red-500 font-bold">*</span>
                  </label>
                  <PortalSelect value={sede} onChange={setSede} options={sedesList} placeholder="Seleccionar sede..." />
                </div>
                
                {sede && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Departamento <span className="text-red-500 font-bold">*</span>
                    </label>
                    <PortalSelect value={departamento} onChange={setDepartamento} options={departamentosList} placeholder="Seleccionar departamento..." />
                  </div>
                )}
              </div>

              {departamento && areasList.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 pt-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Área Específica <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {areasList.map(a => (
                      <button
                        key={a} type="button" onClick={() => setArea(a)}
                        className={`px-3.5 py-2 text-sm font-bold rounded-xl border-2 transition-all ${area === a ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'}`}
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
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-black shadow-sm shrink-0">
                  2
                </span>
                <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
                  ¿Qué sucede?
                </h2>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Descripción breve del problema <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  rows={3}
                  placeholder="Ej. La impresora principal no enciende, o la computadora no abre el sistema médico..."
                  className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-300 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-400 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="border-t-2 border-slate-100 my-6"></div>

            {/* Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-black shadow-sm shrink-0">
                  3
                </span>
                <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
                  ¿A quién contactamos?
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">
                      Nombre <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      {solicitanteNombre.length}/40
                    </span>
                  </div>
                  <input
                    type="text"
                    value={solicitanteNombre}
                    onChange={handleNombreChange}
                    maxLength={40}
                    placeholder="Ej. Dra. Gómez / Lic. Pérez"
                    className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-300 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">
                      Anexo / Teléfono <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {solicitanteContacto.replace(/\D/g, '').length}/9 dígitos
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={solicitanteContacto}
                    onChange={handleContactoChange}
                    onBlur={handleContactoBlur}
                    maxLength={11}
                    placeholder="Ej. 1045 / 999 123 456"
                    className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-300 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] px-1">
                    {(() => {
                      const count = solicitanteContacto.replace(/\D/g, '').length;
                      if (count === 0) {
                        return <span className="text-slate-400 font-medium">Anexo (3-5 dígitos) o Celular (9 dígitos)</span>;
                      }
                      if (count >= 3 && count <= 5) {
                        return <span className="text-indigo-600 font-bold">✓ Formato de Anexo</span>;
                      }
                      if (count === 9) {
                        return <span className="text-emerald-600 font-bold">✓ Formato de Celular</span>;
                      }
                      if (count === 7 || count === 8) {
                        return <span className="text-emerald-600 font-bold">✓ Teléfono Fijo</span>;
                      }
                      return <span className="text-amber-600 font-bold">Mínimo 3 dígitos requeridos</span>;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Enviar */}
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
        )}
      </div>
    </div>
  );
}
