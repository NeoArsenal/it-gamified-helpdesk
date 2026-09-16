'use client';
import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TicketIcon,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Clock,
  Check,
  MapPin,
  User,
  RefreshCw,
  Copy,
  CheckCheck,
  Play,
  Zap,
  Radio,
  Lock,
  Search
} from 'lucide-react';
import {
  getUbicacionesSedes,
  getUbicacionesDepartamentos,
  getUbicacionesAreas,
  crearTicket,
  getTicketsActivosPublicos,
  trackTicket,
  verifyPortalPin,
  verifyPortalAccess,
  safeStorage,
  socket
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

// Tarjeta con Forma de Ticket Físico (Ticket-Shaped Card)
function TicketShapeCard({ ticket, isRecentlyCreated }: { ticket: any, isRecentlyCreated?: boolean }) {
  const isProgreso = ticket.estado === 'EN_PROGRESO';
  const isResuelto = ticket.estado === 'RESUELTO';
  const code = ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className={`relative bg-white rounded-3xl border-2 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden ${
      isResuelto
        ? 'border-emerald-400 ring-4 ring-emerald-500/10'
        : isRecentlyCreated
          ? 'border-indigo-500 ring-4 ring-indigo-500/15'
          : 'border-slate-200 hover:border-indigo-300'
    }`}>
      {/* 1. TALÓN SUPERIOR DEL TICKET (Stub) */}
      <div className={`px-5 pt-4 pb-3 flex items-center justify-between border-b border-dashed border-slate-200 transition-colors duration-500 ${
        isResuelto
          ? 'bg-emerald-50/90'
          : isProgreso
            ? 'bg-indigo-50/90'
            : 'bg-amber-50/70'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Código de Barras Decorativo del Ticket */}
          <div className="font-mono text-[9px] font-black tracking-tighter text-slate-400 select-none hidden sm:block">
            |||| || ||| |||| |
          </div>
          <span className={`font-mono font-black text-sm md:text-base tracking-wider bg-white px-2.5 py-1 rounded-lg border shadow-xs ${
            isResuelto ? 'text-emerald-700 border-emerald-200' : 'text-indigo-700 border-indigo-100'
          }`}>
            #{code}
          </span>
          {isRecentlyCreated && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
              Tu Ticket
            </span>
          )}
        </div>

        {/* Badge de Estado Dinámico */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs transition-all duration-300 ${
          isResuelto
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : isProgreso
              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isResuelto
              ? 'bg-emerald-600'
              : isProgreso
                ? 'bg-indigo-600 animate-ping'
                : 'bg-amber-500'
          }`} />
          <span>{isResuelto ? '¡RESUELTO!' : isProgreso ? 'TÉCNICO EN CAMINO' : 'EN ESPERA'}</span>
        </div>
      </div>

      {/* 2. MUESCAS TROQUELADAS LATERALES (Forma de Ticket) */}
      <div className="relative flex items-center justify-between h-4 -my-2 z-10 pointer-events-none">
        {/* Muesca izquierda (círculo recortado hacia adentro) */}
        <div className="w-5 h-5 rounded-full bg-slate-50 border-r-2 border-slate-300 -ml-2.5 shadow-inner" />
        {/* Línea punteada de desglose */}
        <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
        {/* Muesca derecha (círculo recortado hacia adentro) */}
        <div className="w-5 h-5 rounded-full bg-slate-50 border-l-2 border-slate-300 -mr-2.5 shadow-inner" />
      </div>

      {/* 3. CUERPO DEL TICKET */}
      <div className="p-5 md:p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Ilustración Duolingo */}
          <div className={`w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl border-2 overflow-hidden shadow-inner flex items-center justify-center p-1 transition-all duration-300 ${
            isResuelto ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                isResuelto
                  ? '/illustrations/ticket-resolved.jpg'
                  : isProgreso
                    ? '/illustrations/tech-running.jpg'
                    : '/illustrations/ticket-waiting.jpg'
              }
              alt={isResuelto ? 'Ticket resuelto' : isProgreso ? 'Técnico en camino' : 'Doctor esperando'}
              className="w-full h-full object-contain animate-in fade-in zoom-in duration-300"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className={`text-base sm:text-lg font-black leading-snug ${isResuelto ? 'text-emerald-950' : 'text-slate-800'}`}>
              {ticket.titulo}
            </h3>

            {/* Ubicación y Solicitante */}
            <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-600 justify-center sm:justify-start">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {ticket.sede} · {ticket.departamento} {ticket.ubicacionEspecifica ? `(${ticket.ubicacionEspecifica})` : ''}
              </span>
              {ticket.solicitanteNombre && (
                <span className="flex items-center gap-1 text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {ticket.solicitanteNombre}
                </span>
              )}
            </div>

            {/* Mensaje descriptivo del avance en tiempo real */}
            <p className={`text-xs ${isResuelto ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'}`}>
              {isResuelto
                ? (ticket.solucion ? `✅ Solución: ${ticket.solucion}` : '🎉 ¡Problema solucionado con éxito por Sistemas!')
                : isProgreso
                  ? (ticket.tecnicoAsignado?.nombre
                    ? `👨‍💻 ${ticket.tecnicoAsignado.nombre} de Sistemas está atendiendo tu caso y va en camino.`
                    : '👨‍💻 El personal de Sistemas ya está en marcha hacia tu ubicación.')
                  : '⏱️ Tu reporte está en cola y será asignado a un técnico en breve.'
              }
            </p>
          </div>
        </div>

        {/* 4. STEPPER / PROGRESO DEL TICKET */}
        <div className="pt-2 border-t border-slate-100">
          <div className="relative flex items-center justify-between px-3">
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full -z-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isResuelto ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: isResuelto ? '100%' : isProgreso ? '50%' : '10%' }}
              />
            </div>

            {/* Paso 1: Recibido */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">Recibido</span>
            </div>

            {/* Paso 2: En Camino */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shadow-sm transition-all duration-300 ${
                isResuelto
                  ? 'bg-emerald-500 text-white'
                  : isProgreso
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {isResuelto ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isProgreso ? <Play className="w-3.5 h-3.5 fill-white" /> : '2'}
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${
                isResuelto ? 'text-emerald-700 font-bold' : isProgreso ? 'text-indigo-700 font-black' : 'text-slate-400'
              }`}>
                En Camino
              </span>
            </div>

            {/* Paso 3: Terminado */}
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shadow-sm transition-all duration-300 ${
                isResuelto
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {isResuelto ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${
                isResuelto ? 'text-emerald-700 font-black' : 'text-slate-400'
              }`}>
                Resuelto
              </span>
            </div>
          </div>
        </div>

        {/* 5. PIE DEL TICKET: Fecha y Estado */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {isResuelto ? 'Resuelto' : 'Registrado'}: {
              isResuelto && (ticket.resueltoEn || ticket.actualizadoEn)
                ? new Date(ticket.resueltoEn || ticket.actualizadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                : ticket.creadoEn ? new Date(ticket.creadoEn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''
            }
          </span>
          {isResuelto ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Caso Concluido
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              En atención activa
            </span>
          )}
        </div>
      </div>
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

  // Acumulado de Tickets Activos (Feed en Vivo WebSockets)
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(new Date());
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Almacenamiento local de IDs de tickets creados en este dispositivo (Privacidad por equipo)
  const STORAGE_MY_TICKETS = 'portal_mis_tickets_ids';

  const getStoredMyTicketIds = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = safeStorage.getItem(STORAGE_MY_TICKETS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [myTicketIds, setMyTicketIds] = useState<string[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [isLinkingTicket, setIsLinkingTicket] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ text: string, error?: boolean } | null>(null);

  const saveNewMyTicket = (ticketId: string) => {
    const current = getStoredMyTicketIds();
    if (!current.includes(ticketId)) {
      const next = [ticketId, ...current].slice(0, 50);
      try {
        safeStorage.setItem(STORAGE_MY_TICKETS, JSON.stringify(next));
      } catch { }
      setMyTicketIds(next);
    }
  };

  useEffect(() => {
    // 1. Revisar si viene con token secreto desde el código QR (?key=... o ?token=...)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenParam = searchParams.get('key') || searchParams.get('token') || searchParams.get('k');
      const trackParam = searchParams.get('track');

      if (trackParam) {
        setActiveTab('consultar');
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
              } catch (e) { }
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

    // Inicializar tickets creados en este dispositivo
    setMyTicketIds(getStoredMyTicketIds());
  }, []);

  const cargarDatosBase = () => {
    getUbicacionesSedes().then(data => {
      setSedesList(data);
    }).catch(console.error);
    cargarTicketsActivos();
  };

  // Cargar el acumulado de tickets activos (ABIERTO y EN_PROGRESO)
  const cargarTicketsActivos = async () => {
    setIsLoadingActive(true);
    try {
      const data = await getTicketsActivosPublicos();
      if (Array.isArray(data)) {
        setActiveTickets(data);
        setLastUpdatedTime(new Date());
      }
    } catch (error) {
      console.error('Error al cargar tickets activos:', error);
    } finally {
      setIsLoadingActive(false);
    }
  };

  // Conexión WebSockets en tiempo real instantáneo (0 segundos)
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setIsLiveConnected(true);
    const onDisconnect = () => setIsLiveConnected(false);

    if (socket.connected) {
      setIsLiveConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // 1. Cuando se crea un nuevo ticket
    const handleNuevoTicket = (ticket: any) => {
      if (ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROGRESO') {
        const formatted = {
          ...ticket,
          ticketCode: ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`,
          tecnicoAsignado: ticket.asignadoA ? {
            nombre: ticket.asignadoA.nombre,
            avatar: ticket.asignadoA.avatar,
            rol: ticket.asignadoA.rol,
          } : null,
        };
        setActiveTickets(prev => {
          if (prev.some(t => t.id === ticket.id)) return prev;
          return [formatted, ...prev];
        });
        setLastUpdatedTime(new Date());
      }
    };

    // 2. Cuando cambia de estado (ej: pasa a EN_PROGRESO o se RESUELVE)
    const handleTicketActualizado = (ticket: any) => {
      // Si pasa a CERRADO (archivado definitivo): se quita de la lista
      if (ticket.estado === 'CERRADO') {
        setActiveTickets(prev => prev.filter(t => t.id !== ticket.id));
      } else if (ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROGRESO' || ticket.estado === 'RESUELTO') {
        // Actualizar al instante (< 100ms) cambiando el estado, animación e ilustración
        const formatted = {
          ...ticket,
          ticketCode: ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`,
          tecnicoAsignado: ticket.asignadoA ? {
            nombre: ticket.asignadoA.nombre,
            avatar: ticket.asignadoA.avatar,
            rol: ticket.asignadoA.rol,
          } : null,
        };
        setActiveTickets(prev => {
          const exists = prev.some(t => t.id === ticket.id);
          if (!exists) return [formatted, ...prev];
          return prev.map(t => t.id === ticket.id ? formatted : t);
        });
      }
      setLastUpdatedTime(new Date());
    };

    // 3. Si se elimina un ticket
    const handleTicketEliminado = (data: any) => {
      const id = typeof data === 'string' ? data : data?.id;
      if (id) {
        setActiveTickets(prev => prev.filter(t => t.id !== id));
        setLastUpdatedTime(new Date());
      }
    };

    socket.on('nuevoTicket', handleNuevoTicket);
    socket.on('ticketActualizado', handleTicketActualizado);
    socket.on('ticketEliminado', handleTicketEliminado);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('nuevoTicket', handleNuevoTicket);
      socket.off('ticketActualizado', handleTicketActualizado);
      socket.off('ticketEliminado', handleTicketEliminado);
    };
  }, []);

  // Polling de respaldo cada 30 segundos
  useEffect(() => {
    cargarTicketsActivos();
    const interval = setInterval(() => {
      if (activeTab === 'consultar' || showDirectTracker) {
        cargarTicketsActivos();
      }
    }, 30000);

    // Limpieza automática en cliente de tickets concluidos después de 15 minutos
    const cleanupTimer = setInterval(() => {
      const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
      setActiveTickets(prev => prev.filter(t => {
        if (t.estado === 'RESUELTO') {
          const resueltoTimestamp = new Date(t.resueltoEn || t.actualizadoEn || t.creadoEn).getTime();
          return resueltoTimestamp >= fifteenMinAgo;
        }
        return true;
      }));
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupTimer);
    };
  }, [activeTab, showDirectTracker]);

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
      if (result?.id) {
        saveNewMyTicket(result.id);
      }
      setIsSuccess(true);
      cargarTicketsActivos();
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

  // Vincular manualmente un ticket registrado en otro equipo
  const handleLinkTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = linkCodeInput.trim();
    if (!query) return;

    setIsLinkingTicket(true);
    setLinkMessage(null);
    try {
      const results = await trackTicket(query);
      if (Array.isArray(results) && results.length > 0) {
        results.forEach((t: any) => saveNewMyTicket(t.id));
        setLinkMessage({ text: `¡Se vincularon ${results.length} ticket(s) a este celular!` });
        setLinkCodeInput('');
        cargarTicketsActivos();
        setTimeout(() => setShowLinkInput(false), 2000);
      } else {
        setLinkMessage({ text: 'No se encontró ningún ticket con ese código o anexo.', error: true });
      }
    } catch {
      setLinkMessage({ text: 'No se encontró el ticket. Verifica el código.', error: true });
    } finally {
      setIsLinkingTicket(false);
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
    setIsSuccess(false);
    setActiveTab('consultar');
    setShowDirectTracker(true);
    cargarTicketsActivos();
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
            <h1 className="text-2xl font-black">Tickets en Atención</h1>
            <p className="text-indigo-100 text-xs mt-1 font-medium">
              Acumulado en tiempo real: observa el avance hasta que el técnico concluya tu caso.
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
                      className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all ${hasChar
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

          {/* Acceso Rápido para Consultar Tickets sin PIN */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setShowDirectTracker(true);
                cargarTicketsActivos();
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-3 rounded-lg hover:bg-indigo-50"
            >
              <TicketIcon className="w-4 h-4" />
              Ver tickets en atención en vivo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Éxito al Enviar Reporte
  if (isSuccess) {
    const ticketCode = createdTicketInfo?.id ? `TK-${createdTicketInfo.id.slice(0, 6).toUpperCase()}` : 'TK-REGISTRADO';
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

          <h2 className="text-2xl font-black text-slate-800 mb-1">Tu ticket ya está en cola</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-5">
            Quedó registrado en el acumulado y cambiará de estado al instante cuando el técnico lo tome.
          </p>

          {/* Tarjeta con Código de Ticket Duolingo Style */}
          <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 mb-6 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Código de tu Ticket
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
              <TicketIcon className="w-5 h-5" />
              Ver Tickets en Atención
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

  // Helper para renderizar la interfaz de seguimiento con forma de ticket (Privada por dispositivo)
  function renderTrackingInterface() {
    const myActiveTickets = activeTickets.filter((tk) => myTicketIds.includes(tk.id));

    return (
      <div className="space-y-5">
        {/* Barra de Estado en Tiempo Real (Sleek, Privada) */}
        <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 tracking-tight">
                  {myActiveTickets.length === 1 ? '1 Ticket tuyo en atención' : `${myActiveTickets.length} Tickets tuyos en atención`}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  En Vivo
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Actualizado: {lastUpdatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <button
            onClick={() => cargarTicketsActivos()}
            disabled={isLoadingActive}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
            title="Refrescar manualmente"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActive ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Lista de Tickets del Dispositivo en Forma de Ticket */}
        {myActiveTickets.length > 0 ? (
          <div className="space-y-5">
            {myActiveTickets.map((tk) => {
              const isMine = createdTicketInfo?.id && tk.id === createdTicketInfo.id;
              return (
                <TicketShapeCard
                  key={tk.id}
                  ticket={tk}
                  isRecentlyCreated={Boolean(isMine)}
                />
              );
            })}
          </div>
        ) : isLoadingActive ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold">Cargando tus tickets...</p>
          </div>
        ) : (
          /* Estado Vacío: ¡No hay tickets en este equipo! */
          <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-800">
                ¡No tienes tickets activos en este equipo!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Los reportes que generes desde este celular aparecerán aquí con su seguimiento en vivo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reportar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <TicketIcon className="w-4 h-4" />
              Reportar un Problema Ahora
            </button>
          </div>
        )}

        {/* Herramienta para vincular ticket si reportó desde otro equipo */}
        <div className="pt-2 border-t border-slate-100">
          {!showLinkInput ? (
            <button
              type="button"
              onClick={() => setShowLinkInput(true)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-indigo-600 py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              ¿Reportaste desde otro equipo? Vincular mi ticket aquí
            </button>
          ) : (
            <form onSubmit={handleLinkTicket} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" /> Vincular Ticket
                </span>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cerrar
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkCodeInput}
                  onChange={(e) => setLinkCodeInput(e.target.value)}
                  placeholder="Ej: #TK-D02BC2 o teléfono..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLinkingTicket || !linkCodeInput.trim()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {isLinkingTicket ? 'Buscando...' : 'Vincular'}
                </button>
              </div>
              {linkMessage && (
                <p className={`text-[11px] font-bold ${linkMessage.error ? 'text-red-500' : 'text-emerald-600'}`}>
                  {linkMessage.text}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Nota explicativa de privacidad */}
        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900/80 text-center font-medium">
          🔒 <strong>Privacidad por equipo:</strong> Esta lista es exclusiva de este dispositivo. Nadie más puede ver tus reportes desde otros celulares.
        </div>
      </div>
    );
  }

  const myActiveTicketsCount = activeTickets.filter((tk) => myTicketIds.includes(tk.id)).length;

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
            {activeTab === 'reportar' ? '¿En qué te podemos ayudar hoy?' : 'Mis Tickets'}
          </h1>
          <p className="text-indigo-100/90 text-xs md:text-sm mt-1 font-medium relative z-10">
            {activeTab === 'reportar'
              ? 'Completa los 3 pasos a continuación para enviar tu reporte rápidamente'
              : 'Seguimiento privado en tiempo real de tus incidencias en este dispositivo'
            }
          </p>

          {/* Pestañas Segmentadas */}
          <div className="mt-5 p-1 bg-indigo-900/40 backdrop-blur-md rounded-2xl flex gap-1 relative z-10 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('reportar')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'reportar'
                ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                : 'text-indigo-100 hover:text-white hover:bg-white/10'
                }`}
            >
              <TicketIcon className="w-4 h-4" />
              Reportar Problema
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('consultar');
                cargarTicketsActivos();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'consultar'
                ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                : 'text-indigo-100 hover:text-white hover:bg-white/10'
                }`}
            >
              <Zap className="w-4 h-4" />
              Mis Tickets {myActiveTicketsCount > 0 && `(${myActiveTicketsCount})`}
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
                  <PortalSelect value={sede} onChange={setSede} options={sedesList} placeholder="Seleccionar" />
                </div>

                {sede && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Departamento <span className="text-red-500 font-bold">*</span>
                    </label>
                    <PortalSelect value={departamento} onChange={setDepartamento} options={departamentosList} placeholder="Seleccionar" />
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
                      {solicitanteContacto.replace(/\D/g, '').length}/9
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
