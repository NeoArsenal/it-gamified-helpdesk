import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  User,
  Monitor,
  Layers,
  MapPin,
  Save,
  Check,
  ChevronRight,
  ArrowLeft,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getPerfilUsuario,
  actualizarPreferenciasUsuario,
  getUbicaciones,
  crearUbicacion,
  eliminarUbicacion,
  setPortalPin,
  getPortalConfig,
  regeneratePortalToken,
  getCatalogos,
  actualizarCatalogo,
  safeStorage,
} from '@/services/api';
import { Ubicacion } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  ProfileTab,
  AppearanceTab,
  CatalogsTab,
  LocationsTab,
  PortalKioskTab,
} from '@/components/settings';

export function SettingsView({ userId = 'JD', onPreferencesSaved }: { userId?: string; onPreferencesSaved?: () => void }) {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'perfil' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal'>('perfil');
  const [mobileSubView, setMobileSubView] = useState<'menu' | 'perfil' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal'>('menu');
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const selectTab = (tab: 'perfil' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal') => {
    setActiveTab(tab);
    setMobileSubView(tab);
  };

  // Preferencias State
  const [tituloRPG, setTituloRPG] = useState('Técnico Novato');
  const [musicaNivel, setMusicaNivel] = useState(true);
  const [alertasCriticas, setAlertasCriticas] = useState(true);
  const [avatarSeed, setAvatarSeed] = useState(user?.avatar || '');
  const [userLevel, setUserLevel] = useState(1);

  // Ubicaciones State
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [nuevaSede, setNuevaSede] = useState('');
  const [nuevoDepto, setNuevoDepto] = useState('');
  const [nuevaArea, setNuevaArea] = useState('');
  const [isCreandoNuevaSede, setIsCreandoNuevaSede] = useState(false);
  const [nuevaSedeTexto, setNuevaSedeTexto] = useState('');
  const [isCreandoNuevoDepto, setIsCreandoNuevoDepto] = useState(false);
  const [nuevoDeptoTexto, setNuevoDeptoTexto] = useState('');

  // Portal State
  const [portalPin, setPortalPinState] = useState('');
  const [portalToken, setPortalToken] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  // Catálogos State
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [categoriasActivos, setCategoriasActivos] = useState<string[]>([]);
  const [nuevoDeptoNombre, setNuevoDeptoNombre] = useState('');
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [isAddingDepto, setIsAddingDepto] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);



  // Listas consolidadas y sin duplicados para selectores
  const sedesExistentes = useMemo(() => {
    const list = Array.from(new Set(ubicaciones.map((u) => (u.sede || '').trim()).filter(Boolean)));
    if (list.length === 0) return ['Clínica', 'Tower 1'];
    return list;
  }, [ubicaciones]);

  const departamentosDisponibles = useMemo(() => {
    const fromCat = departamentos.map((d) => d.trim()).filter(Boolean);
    const fromUbi = ubicaciones.map((u) => (u.departamento || '').trim()).filter(Boolean);
    return Array.from(new Set([...fromCat, ...fromUbi]));
  }, [departamentos, ubicaciones]);

  // Cargar estado inicial del tema y preferencias
  useEffect(() => {
    const savedTheme = safeStorage.getItem('app_theme');
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark-mode')) {
      setTheme('dark');
      document.documentElement.classList.add('dark-mode');
    }

    if (userId && userId.length > 5) {
      getPerfilUsuario(userId)
        .then((user) => {
          if (user.nivel) setUserLevel(user.nivel);
          if (user.avatar) setAvatarSeed(user.avatar);
          if (user.tituloRPG) setTituloRPG(user.tituloRPG);
          if (user.preferencias) {
            if (user.preferencias.musicaNivel !== undefined) setMusicaNivel(user.preferencias.musicaNivel);
            if (user.preferencias.alertasCriticas !== undefined) setAlertasCriticas(user.preferencias.alertasCriticas);
            if (user.preferencias.temaOscuro !== undefined) {
              const localTheme = safeStorage.getItem('app_theme');
              const isDark = localTheme !== null ? localTheme === 'dark' : Boolean(user.preferencias.temaOscuro);
              setTheme(isDark ? 'dark' : 'light');
              if (isDark) {
                document.documentElement.classList.add('dark-mode');
                safeStorage.setItem('app_theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark-mode');
                safeStorage.setItem('app_theme', 'light');
              }
            }
          }
        })
        .catch(() => console.log('Usuario no encontrado o sin preferencias aún.'));
    }

    fetchUbicaciones();
    fetchCatalogos();

    getPortalConfig()
      .then((data) => {
        if (data.pin) setPortalPinState(data.pin);
        if (data.token) {
          setPortalToken(data.token);
          if (typeof window !== 'undefined') {
            setPortalUrl(`${window.location.origin}/portal?key=${data.token}`);
          }
        }
      })
      .catch(console.error);
  }, [userId]);

  const fetchCatalogos = async () => {
    try {
      const data = await getCatalogos();
      if (data.departamentos) setDepartamentos(data.departamentos);
      if (data.categoriasActivos) setCategoriasActivos(data.categoriasActivos);
    } catch (e) {
      console.error('Error al cargar catálogos', e);
    }
  };



  const handleAddDepartamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nuevoDeptoNombre.trim();
    if (!clean) return;
    if (departamentos.some((d) => d.toLowerCase() === clean.toLowerCase())) {
      alert('Este departamento ya existe en la lista.');
      return;
    }
    const updated = [...departamentos, clean];
    setDepartamentos(updated);
    setNuevoDeptoNombre('');
    setIsAddingDepto(false);
    try {
      await actualizarCatalogo('departamentos', updated);
    } catch (e) {
      console.error(e);
      fetchCatalogos();
    }
  };

  const handleEliminarDepartamento = async (depto: string) => {
    if (!confirm(`¿Eliminar el departamento "${depto}"?`)) return;
    const updated = departamentos.filter((d) => d !== depto);
    setDepartamentos(updated);
    try {
      await actualizarCatalogo('departamentos', updated);
    } catch (e) {
      console.error(e);
      fetchCatalogos();
    }
  };

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nuevaCatNombre.trim();
    if (!clean) return;
    if (categoriasActivos.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      alert('Esta categoría ya existe en la lista.');
      return;
    }
    const updated = [...categoriasActivos, clean];
    setCategoriasActivos(updated);
    setNuevaCatNombre('');
    setIsAddingCat(false);
    try {
      await actualizarCatalogo('categoriasActivos', updated);
    } catch (e) {
      console.error(e);
      fetchCatalogos();
    }
  };

  const handleEliminarCategoria = async (cat: string) => {
    if (!confirm(`¿Eliminar la categoría "${cat}"?`)) return;
    const updated = categoriasActivos.filter((c) => c !== cat);
    setCategoriasActivos(updated);
    try {
      await actualizarCatalogo('categoriasActivos', updated);
    } catch (e) {
      console.error(e);
      fetchCatalogos();
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const data = await getUbicaciones();
      setUbicaciones(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrearUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSede = isCreandoNuevaSede ? nuevaSedeTexto.trim() : nuevaSede.trim();
    const finalDepto = isCreandoNuevoDepto ? nuevoDeptoTexto.trim() : nuevoDepto.trim();
    const finalArea = nuevaArea.trim();

    if (!finalSede) {
      toast.error('Por favor selecciona o escribe el nombre de la Sede.');
      return;
    }
    if (!finalDepto) {
      toast.error('Por favor selecciona o escribe el nombre del Departamento.');
      return;
    }
    if (!finalArea) {
      toast.error('Por favor escribe el Área Específica (ej: Oficina 501).');
      return;
    }

    try {
      await crearUbicacion({ sede: finalSede, departamento: finalDepto, area: finalArea });
      toast.success(`Ubicación "${finalArea}" creada exitosamente`);

      if (isCreandoNuevaSede) {
        setNuevaSede(finalSede);
        setIsCreandoNuevaSede(false);
        setNuevaSedeTexto('');
      }

      if (isCreandoNuevoDepto) {
        if (!departamentos.some((d) => d.toLowerCase() === finalDepto.toLowerCase())) {
          const updatedDeptos = [...departamentos, finalDepto];
          setDepartamentos(updatedDeptos);
          actualizarCatalogo('departamentos', updatedDeptos).catch(console.error);
        }
        setNuevoDepto(finalDepto);
        setIsCreandoNuevoDepto(false);
        setNuevoDeptoTexto('');
      }

      setNuevaArea('');
      fetchUbicaciones();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al agregar ubicación');
    }
  };

  const handleEliminarUbicacion = async (id: string) => {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    setUbicaciones((prev) => prev.filter((u) => u.id !== id));
    try {
      await eliminarUbicacion(id);
      toast.success('Ubicación eliminada');
      fetchUbicaciones();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al eliminar ubicación');
      fetchUbicaciones();
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const isDark = newTheme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      safeStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      safeStorage.setItem('app_theme', 'light');
    }

    // Persistir de inmediato en la base de datos para que nunca se revierta al navegar
    if (userId && userId.length > 5) {
      actualizarPreferenciasUsuario(userId, {
        preferencias: {
          musicaNivel,
          alertasCriticas,
          temaOscuro: isDark,
        },
      }).catch((err) => console.error('Error auto-guardando tema en servidor:', err));
    }
    toast.success(`Tema ${isDark ? 'Oscuro' : 'Claro'} aplicado y guardado`);
  };

  const handleSavePortalPin = async () => {
    setIsSaving(true);
    try {
      await setPortalPin(portalPin);
      toast.success('PIN del portal actualizado exitosamente');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar el PIN del portal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm('¿Regenerar la llave criptográfica del código QR? Los códigos QR impresos anteriormente dejarán de funcionar y deberás imprimir el nuevo código.')) return;
    setIsRegeneratingToken(true);
    try {
      const res = await regeneratePortalToken();
      setPortalToken(res.token);
      if (typeof window !== 'undefined') {
        setPortalUrl(`${window.location.origin}/portal?key=${res.token}`);
      }
      toast.success('Nueva llave criptográfica generada para el código QR');
    } catch (e) {
      console.error(e);
      toast.error('Error al regenerar la llave del portal');
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const savePreferences = async () => {
    if (activeTab === 'portal') {
      await handleSavePortalPin();
      return;
    }

    setIsSaving(true);

    if (userId && userId.length > 5) {
      try {
        await actualizarPreferenciasUsuario(userId, {
          avatar: avatarSeed,
          tituloRPG,
          preferencias: {
            musicaNivel,
            alertasCriticas,
            temaOscuro: theme === 'dark',
          },
        });
        updateUser({ avatar: avatarSeed });
        safeStorage.setItem('app_theme', theme);
        toast.success('¡Perfil y preferencias guardados correctamente!');
        if (onPreferencesSaved) onPreferencesSaved();
      } catch (error) {
        console.error('Error al guardar preferencias', error);
        toast.error('Ocurrió un error al guardar las preferencias en el servidor.');
      } finally {
        setIsSaving(false);
      }
    } else {
      safeStorage.setItem('app_theme', theme);
      toast.success('Preferencias guardadas localmente.');
      setIsSaving(false);
      if (onPreferencesSaved) onPreferencesSaved();
    }
  };

  const tabMetadata: Record<
    'perfil' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal',
    { title: string; subtitle: string; icon: any; bgColor: string; badge?: string }
  > = {
    perfil: {
      title: 'Perfil y Cuenta',
      subtitle: 'Foto de perfil, avatar y alertas personales',
      icon: User,
      bgColor: 'bg-blue-600',
    },
    sistema: {
      title: 'Sistema y Apariencia',
      subtitle: 'Tema visual claro/oscuro y notificaciones',
      icon: Palette,
      bgColor: 'bg-violet-600',
      badge: theme === 'dark' ? 'Oscuro' : 'Claro',
    },
    catalogos: {
      title: 'Catálogos y Listas',
      subtitle: 'Departamentos y tipos de equipos',
      icon: Layers,
      bgColor: 'bg-emerald-600',
      badge: `${departamentos.length} deptos`,
    },
    ubicaciones: {
      title: 'Ubicaciones Físicas',
      subtitle: 'Sedes, departamentos y consultorios',
      icon: MapPin,
      bgColor: 'bg-orange-600',
      badge: `${ubicaciones.length} áreas`,
    },
    portal: {
      title: 'Portal Auto-Servicio',
      subtitle: 'PIN de quiosco y código QR de acceso',
      icon: ShieldCheck,
      bgColor: 'bg-sky-600',
      badge: portalPin ? 'PIN Activo' : 'Sin PIN',
    },
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 h-full flex flex-col overflow-y-auto animate-in fade-in duration-300">
      {/* Cabecera Desktop */}
      <div className="hidden md:flex justify-between items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Settings className="w-6 h-6 text-slate-600" /> Configuración y Preferencias
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Personaliza tu experiencia y administra los parámetros de la plataforma TI.
          </p>
        </div>

        {/* Acciones Rápidas en Desktop */}
        {activeTab === 'perfil' && (
          <button
            type="button"
            onClick={savePreferences}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        )}

        {activeTab === 'portal' && (
          <button
            type="button"
            onClick={handleSavePortalPin}
            disabled={isSaving || portalPin.length < 4}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Guardando...' : 'Guardar PIN'}
          </button>
        )}

        {activeTab === 'sistema' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Guardado automático activo</span>
          </div>
        )}
      </div>

      {/* Contenedor Principal: Master-Detail en Desktop / Drill-Down en Móvil */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">
        {/* ========================================================= */}
        {/* PANEL LISTA: Estilo App Nativa (Instagram / Facebook / iOS) */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 shrink-0 flex-col",
            mobileSubView === 'menu' ? "flex" : "hidden md:flex"
          )}
        >
          {/* Título Móvil */}
          <div className="md:hidden mb-4">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Configuración
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Preferencias de cuenta y administración TI
            </p>
          </div>

          {/* Tarjeta de Perfil Resumen (Estilo Instagram / Apple ID) */}
          <div
            onClick={() => selectTab('perfil')}
            className={cn(
              "bg-white rounded-2xl p-4 border shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group mb-5 active:scale-[0.99]",
              activeTab === 'perfil' && "md:border-indigo-400 md:ring-2 md:ring-indigo-100",
              "border-slate-200/90 hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <UserAvatar avatar={avatarSeed || user?.avatar} name={user?.nombre} size="lg" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {user?.nombre || 'Usuario TI'}
                  </h2>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {user?.rol || 'TECNICO'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || 'usuario@clinica.com'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 mt-1">
                  <span>{tituloRPG}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono">Nivel {userLevel}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Grupo 1: Cuenta y Experiencia */}
          <div className="mb-5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Cuenta y Experiencia
            </span>
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {/* Opción 1: Perfil y Cuenta */}
              <button
                type="button"
                onClick={() => selectTab('perfil')}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer group active:bg-slate-100",
                  activeTab === 'perfil' && "md:bg-indigo-50/70 md:border-l-4 md:border-l-indigo-600"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Perfil y Cuenta
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Foto de perfil, avatar y alertas personales
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Opción 2: Sistema y Apariencia */}
              <button
                type="button"
                onClick={() => selectTab('sistema')}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer group active:bg-slate-100",
                  activeTab === 'sistema' && "md:bg-indigo-50/70 md:border-l-4 md:border-l-indigo-600"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
                      Sistema y Apariencia
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Tema visual claro/oscuro y notificaciones
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-xs font-semibold text-slate-500">
                    {theme === 'dark' ? 'Oscuro' : 'Claro'}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Grupo 2: Administración y Plataforma TI */}
          <div className="mb-5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Administración y Plataforma TI
            </span>
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {/* Opción 3: Catálogos y Listas */}
              <button
                type="button"
                onClick={() => selectTab('catalogos')}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer group active:bg-slate-100",
                  activeTab === 'catalogos' && "md:bg-indigo-50/70 md:border-l-4 md:border-l-indigo-600"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      Catálogos y Listas
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Departamentos y categorías de activos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                    {departamentos.length} deptos
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Opción 4: Ubicaciones Físicas */}
              <button
                type="button"
                onClick={() => selectTab('ubicaciones')}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer group active:bg-slate-100",
                  activeTab === 'ubicaciones' && "md:bg-indigo-50/70 md:border-l-4 md:border-l-indigo-600"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                      Ubicaciones Físicas
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Sedes, pisos y consultorios institucionales
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                    {ubicaciones.length} áreas
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Opción 5: Portal Auto-Servicio */}
              <button
                type="button"
                onClick={() => selectTab('portal')}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-slate-50 cursor-pointer group active:bg-slate-100",
                  activeTab === 'portal' && "md:bg-indigo-50/70 md:border-l-4 md:border-l-indigo-600"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                      Portal Auto-Servicio
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      PIN de acceso y código QR para quioscos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                    {portalPin ? 'PIN Activo' : 'Sin PIN'}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Información del Sistema al Pie */}
          <div className="p-3 text-center text-[11px] text-slate-400 font-medium">
            Mesa de Ayuda TI · Versión 2.4.0
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL DETALLE: Vista de la Opción Seleccionada           */}
        {/* ========================================================= */}
        <div
          className={cn(
            "flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[480px] flex flex-col",
            mobileSubView !== 'menu' ? "flex" : "hidden md:flex"
          )}
        >
          {/* Barra de Navegación Superior en Móvil (Drill-Down con Botón Volver) */}
          <div className="md:hidden bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileSubView('menu')}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ajustes</span>
            </button>

            <span className="text-xs font-black text-slate-800 uppercase tracking-wide truncate max-w-[150px]">
              {tabMetadata[activeTab]?.title}
            </span>

            {/* Acción de Guardado en Móvil */}
            {activeTab === 'perfil' && (
              <button
                type="button"
                onClick={savePreferences}
                disabled={isSaving}
                className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-3 h-3 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? '...' : 'Guardar'}</span>
              </button>
            )}

            {activeTab === 'portal' && (
              <button
                type="button"
                onClick={handleSavePortalPin}
                disabled={isSaving || portalPin.length < 4}
                className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-3 h-3 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? '...' : 'Guardar'}</span>
              </button>
            )}

            {activeTab === 'sistema' && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Auto
              </span>
            )}

            {(activeTab === 'catalogos' || activeTab === 'ubicaciones') && (
              <div className="w-10" />
            )}
          </div>

          {/* Componentes de Contenido de cada Tab */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'perfil' && (
              <ProfileTab
                avatarSeed={avatarSeed}
                setAvatarSeed={setAvatarSeed}
                userName={user?.nombre}
                userEmail={user?.email}
                tituloRPG={tituloRPG}
                setTituloRPG={setTituloRPG}
                userLevel={userLevel}
                musicaNivel={musicaNivel}
                setMusicaNivel={setMusicaNivel}
                alertasCriticas={alertasCriticas}
                setAlertasCriticas={setAlertasCriticas}
              />
            )}

            {activeTab === 'sistema' && (
              <AppearanceTab theme={theme} toggleTheme={toggleTheme} />
            )}

            {activeTab === 'catalogos' && (
              <CatalogsTab
                departamentos={departamentos}
                categoriasActivos={categoriasActivos}
                nuevoDeptoNombre={nuevoDeptoNombre}
                setNuevoDeptoNombre={setNuevoDeptoNombre}
                nuevaCatNombre={nuevaCatNombre}
                setNuevaCatNombre={setNuevaCatNombre}
                isAddingDepto={isAddingDepto}
                setIsAddingDepto={setIsAddingDepto}
                isAddingCat={isAddingCat}
                setIsAddingCat={setIsAddingCat}
                handleAddDepartamento={handleAddDepartamento}
                handleEliminarDepartamento={handleEliminarDepartamento}
                handleAddCategoria={handleAddCategoria}
                handleEliminarCategoria={handleEliminarCategoria}
              />
            )}

            {activeTab === 'ubicaciones' && (
              <LocationsTab
                ubicaciones={ubicaciones}
                nuevaSede={nuevaSede}
                setNuevaSede={setNuevaSede}
                nuevoDepto={nuevoDepto}
                setNuevoDepto={setNuevoDepto}
                nuevaArea={nuevaArea}
                setNuevaArea={setNuevaArea}
                isCreandoNuevaSede={isCreandoNuevaSede}
                setIsCreandoNuevaSede={setIsCreandoNuevaSede}
                nuevaSedeTexto={nuevaSedeTexto}
                setNuevaSedeTexto={setNuevaSedeTexto}
                isCreandoNuevoDepto={isCreandoNuevoDepto}
                setIsCreandoNuevoDepto={setIsCreandoNuevoDepto}
                nuevoDeptoTexto={nuevoDeptoTexto}
                setNuevoDeptoTexto={setNuevoDeptoTexto}
                sedesExistentes={sedesExistentes}
                departamentosDisponibles={departamentosDisponibles}
                handleCrearUbicacion={handleCrearUbicacion}
                handleEliminarUbicacion={handleEliminarUbicacion}
              />
            )}

            {activeTab === 'portal' && (
              <PortalKioskTab
                portalUrl={portalUrl}
                portalPin={portalPin}
                setPortalPinState={setPortalPinState}
                isSaving={isSaving}
                isRegeneratingToken={isRegeneratingToken}
                handleSavePortalPin={handleSavePortalPin}
                handleRegenerateToken={handleRegenerateToken}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
