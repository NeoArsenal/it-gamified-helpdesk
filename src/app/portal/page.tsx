'use client';
import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TicketIcon,
  LogOut,
  Zap,
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
  socket,
} from '@/services/api';
import {
  PortalPinScreen,
  PortalSuccessScreen,
  PortalLiveFeed,
  PortalReportForm,
} from '@/components/portal';

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
  const [linkMessage, setLinkMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const saveNewMyTicket = (ticketId: string) => {
    const current = getStoredMyTicketIds();
    if (!current.includes(ticketId)) {
      const next = [ticketId, ...current].slice(0, 50);
      try {
        safeStorage.setItem(STORAGE_MY_TICKETS, JSON.stringify(next));
      } catch {}
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
              } catch {}
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

    setMyTicketIds(getStoredMyTicketIds());
  }, []);

  const cargarDatosBase = () => {
    getUbicacionesSedes()
      .then((data) => setSedesList(data))
      .catch(console.error);
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

    // 1. Cuando se crea un nuevo ticket
    const handleNuevoTicket = (ticket: any) => {
      if (ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROGRESO') {
        const formatted = {
          ...ticket,
          ticketCode: ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`,
          tecnicoAsignado: ticket.asignadoA
            ? {
                nombre: ticket.asignadoA.nombre,
                avatar: ticket.asignadoA.avatar,
                rol: ticket.asignadoA.rol,
              }
            : null,
        };
        setActiveTickets((prev) => {
          if (prev.some((t) => t.id === ticket.id)) return prev;
          return [formatted, ...prev];
        });
        setLastUpdatedTime(new Date());
      }
    };

    // 2. Cuando cambia de estado (ej: pasa a EN_PROGRESO o se RESUELVE)
    const handleTicketActualizado = (ticket: any) => {
      if (ticket.estado === 'CERRADO') {
        setActiveTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      } else if (ticket.estado === 'ABIERTO' || ticket.estado === 'EN_PROGRESO' || ticket.estado === 'RESUELTO') {
        const formatted = {
          ...ticket,
          ticketCode: ticket.ticketCode || `TK-${ticket.id.slice(0, 6).toUpperCase()}`,
          tecnicoAsignado: ticket.asignadoA
            ? {
                nombre: ticket.asignadoA.nombre,
                avatar: ticket.asignadoA.avatar,
                rol: ticket.asignadoA.rol,
              }
            : null,
        };
        setActiveTickets((prev) => {
          const exists = prev.some((t) => t.id === ticket.id);
          if (!exists) return [formatted, ...prev];
          return prev.map((t) => (t.id === ticket.id ? formatted : t));
        });
      }
      setLastUpdatedTime(new Date());
    };

    // 3. Si se elimina un ticket
    const handleTicketEliminado = (data: any) => {
      const id = typeof data === 'string' ? data : data?.id;
      if (id) {
        setActiveTickets((prev) => prev.filter((t) => t.id !== id));
        setLastUpdatedTime(new Date());
      }
    };

    socket.on('nuevoTicket', handleNuevoTicket);
    socket.on('ticketActualizado', handleTicketActualizado);
    socket.on('ticketEliminado', handleTicketEliminado);

    return () => {
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
      setActiveTickets((prev) =>
        prev.filter((t) => {
          if (t.estado === 'RESUELTO') {
            const resueltoTimestamp = new Date(t.resueltoEn || t.actualizadoEn || t.creadoEn).getTime();
            return resueltoTimestamp >= fifteenMinAgo;
          }
          return true;
        })
      );
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupTimer);
    };
  }, [activeTab, showDirectTracker]);

  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede)
        .then((data) => {
          setDepartamentosList(data);
          setDepartamento('');
          setArea('');
        })
        .catch(console.error);
    }
  }, [sede]);

  useEffect(() => {
    if (sede && departamento) {
      getUbicacionesAreas(sede, departamento)
        .then((data) => {
          setAreasList(data);
          setArea('');
        })
        .catch(console.error);
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
    } catch {
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

  // Vista de consulta directa sin autenticación PIN
  if (!isAuthenticated && showDirectTracker) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col md:items-center md:py-10">
        <div className="max-w-lg w-full bg-white md:rounded-3xl shadow-xl overflow-hidden flex-1 md:flex-none flex flex-col">
          <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/emblem.svg" alt="Limatambo" className="w-4 h-4 rounded object-cover" />
                <span>Soporte TI · Clínicas Limatambo</span>
              </div>
              <button
                onClick={() => setShowDirectTracker(false)}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
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
            <PortalLiveFeed
              activeTickets={activeTickets}
              myTicketIds={myTicketIds}
              isLoadingActive={isLoadingActive}
              lastUpdatedTime={lastUpdatedTime}
              createdTicketInfo={createdTicketInfo}
              cargarTicketsActivos={cargarTicketsActivos}
              onNavigateToReport={() => setShowDirectTracker(false)}
              showLinkInput={showLinkInput}
              setShowLinkInput={setShowLinkInput}
              linkCodeInput={linkCodeInput}
              setLinkCodeInput={setLinkCodeInput}
              isLinkingTicket={isLinkingTicket}
              linkMessage={linkMessage}
              handleLinkTicket={handleLinkTicket}
            />
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de autenticación por PIN
  if (!isAuthenticated) {
    return (
      <PortalPinScreen
        pin={pin}
        setPin={setPin}
        pinError={pinError}
        handleVerifyPin={handleVerifyPin}
        onDirectTrackerClick={() => {
          setShowDirectTracker(true);
          cargarTicketsActivos();
        }}
      />
    );
  }

  // Pantalla de Éxito al Enviar Reporte
  if (isSuccess) {
    return (
      <PortalSuccessScreen
        createdTicketInfo={createdTicketInfo}
        copiedCode={copiedCode}
        copiarCodigoTicket={copiarCodigoTicket}
        irAConsultarCreado={irAConsultarCreado}
        onReportAnother={() => {
          setIsSuccess(false);
          setActiveTab('reportar');
        }}
      />
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
              onClick={() => {
                safeStorage.removeItem('portal_pin_verified');
                setIsAuthenticated(false);
              }}
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
              : 'Seguimiento privado en tiempo real de tus incidencias en este dispositivo'}
          </p>

          {/* Pestañas Segmentadas */}
          <div className="mt-5 p-1 bg-indigo-900/40 backdrop-blur-md rounded-2xl flex gap-1 relative z-10 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('reportar')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
              onClick={() => {
                setActiveTab('consultar');
                cargarTicketsActivos();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'consultar'
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
            <PortalLiveFeed
              activeTickets={activeTickets}
              myTicketIds={myTicketIds}
              isLoadingActive={isLoadingActive}
              lastUpdatedTime={lastUpdatedTime}
              createdTicketInfo={createdTicketInfo}
              cargarTicketsActivos={cargarTicketsActivos}
              onNavigateToReport={() => setActiveTab('reportar')}
              showLinkInput={showLinkInput}
              setShowLinkInput={setShowLinkInput}
              linkCodeInput={linkCodeInput}
              setLinkCodeInput={setLinkCodeInput}
              isLinkingTicket={isLinkingTicket}
              linkMessage={linkMessage}
              handleLinkTicket={handleLinkTicket}
            />
          </div>
        ) : (
          <PortalReportForm
            titulo={titulo}
            setTitulo={setTitulo}
            sede={sede}
            setSede={setSede}
            departamento={departamento}
            setDepartamento={setDepartamento}
            area={area}
            setArea={setArea}
            solicitanteNombre={solicitanteNombre}
            setSolicitanteNombre={setSolicitanteNombre}
            solicitanteContacto={solicitanteContacto}
            setSolicitanteContacto={setSolicitanteContacto}
            honeypot={honeypot}
            setHoneypot={setHoneypot}
            sedesList={sedesList}
            departamentosList={departamentosList}
            areasList={areasList}
            isSubmitting={isSubmitting}
            handleSubmitTicket={handleSubmitTicket}
            handleNombreChange={handleNombreChange}
            handleContactoChange={handleContactoChange}
            handleContactoBlur={handleContactoBlur}
          />
        )}
      </div>
    </div>
  );
}
