import React, { useState, useEffect, useMemo } from 'react';
import { Settings, User, Gamepad2, Monitor, Layers, MapPin, Save, Check } from 'lucide-react';
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
  getReglasGamificacion,
  guardarReglasGamificacion,
} from '@/services/api';
import { Ubicacion, PuntosPorArea } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import {
  ProfileTab,
  GamificationTab,
  AppearanceTab,
  CatalogsTab,
  LocationsTab,
  PortalKioskTab,
} from '@/components/settings';

export function SettingsView({ userId = 'JD', onPreferencesSaved }: { userId?: string; onPreferencesSaved?: () => void }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'perfil' | 'gamificacion' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal'>('perfil');
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Preferencias State
  const [tituloRPG, setTituloRPG] = useState('Técnico Novato');
  const [musicaNivel, setMusicaNivel] = useState(true);
  const [alertasCriticas, setAlertasCriticas] = useState(true);
  const [avatarSeed, setAvatarSeed] = useState(userId || 'tech');
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

  // Gamificación State
  const [reglasXP, setReglasXP] = useState<PuntosPorArea>({
    ticketBaja: 50,
    ticketMedia: 150,
    ticketAlta: 350,
    ticketCritica: 750,
    activoReparado: 250,
    activoRescatado: 600,
    redRestaurada: 300,
    guiaCreada: 200,
    academiaNivel: 100,
  });
  const [nivelesConfig, setNivelesConfig] = useState<number[]>([
    0, 500, 1200, 2000, 3500, 5000, 7500, 10000, 13000, 17000,
    22000, 28000, 35000, 43000, 52000, 62000, 73000, 85000, 100000, 120000,
  ]);
  const [isSavingGamificacion, setIsSavingGamificacion] = useState(false);

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

    fetchGamificacion();

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

  const fetchGamificacion = async () => {
    try {
      const data = await getReglasGamificacion();
      if (data.puntosPorArea) setReglasXP(data.puntosPorArea);
      if (data.niveles && data.niveles.length > 0) setNivelesConfig(data.niveles);
    } catch (e) {
      console.log('Reglas de gamificación usando defaults locales', e);
    }
  };

  const handleSaveGamificacion = async () => {
    setIsSavingGamificacion(true);
    try {
      await guardarReglasGamificacion({
        puntosPorArea: reglasXP,
        niveles: nivelesConfig,
      });
      toast.success('¡Reglas de gamificación y niveles guardados exitosamente!');
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar las reglas de gamificación');
    } finally {
      setIsSavingGamificacion(false);
    }
  };

  const handleResetGamificacion = () => {
    setReglasXP({
      ticketBaja: 50,
      ticketMedia: 150,
      ticketAlta: 350,
      ticketCritica: 750,
      activoReparado: 250,
      activoRescatado: 600,
      redRestaurada: 300,
      guiaCreada: 200,
      academiaNivel: 100,
    });
    setNivelesConfig([
      0, 500, 1200, 2000, 3500, 5000, 7500, 10000, 13000, 17000,
      22000, 28000, 35000, 43000, 52000, 62000, 73000, 85000, 100000, 120000,
    ]);
    toast.info('Valores sugeridos cargados. Recuerda hacer clic en Guardar para aplicarlos.');
  };

  const handleNivelChange = (index: number, val: number) => {
    const updated = [...nivelesConfig];
    updated[index] = Math.max(0, val);
    setNivelesConfig(updated);
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
    if (activeTab === 'gamificacion') {
      await handleSaveGamificacion();
      return;
    }
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

  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto animate-in fade-in duration-500">
      {/* Cabecera con Botón de Acción Inteligente */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 md:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-600" /> Configuración del Sistema
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ajusta tus preferencias personales y administra las reglas de gamificación de TI.</p>
        </div>

        {/* Botón de Acción Contextual Inteligente */}
        {activeTab === 'perfil' && (
          <button
            type="button"
            onClick={savePreferences}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 w-full md:w-auto rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        )}

        {activeTab === 'gamificacion' && (
          <button
            type="button"
            onClick={handleSaveGamificacion}
            disabled={isSavingGamificacion}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-5 py-2.5 w-full md:w-auto rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSavingGamificacion ? 'animate-spin' : ''}`} />
            {isSavingGamificacion ? 'Guardando...' : 'Guardar Reglas'}
          </button>
        )}

        {activeTab === 'portal' && (
          <button
            type="button"
            onClick={handleSavePortalPin}
            disabled={isSaving || portalPin.length < 4}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-5 py-2.5 w-full md:w-auto rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar de Navegación de Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'perfil' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <User className="w-5 h-5" /> Perfil y Cuenta
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('gamificacion')}
              className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'gamificacion' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Gamepad2 className="w-5 h-5" /> Reglas de Gamificación
            </button>
          )}

          <button
            onClick={() => setActiveTab('sistema')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'sistema' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Monitor className="w-5 h-5" /> Sistema y Apariencia
          </button>

          <button
            onClick={() => setActiveTab('catalogos')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'catalogos' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Layers className="w-5 h-5" /> Catálogos y Listas
          </button>

          <button
            onClick={() => setActiveTab('ubicaciones')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'ubicaciones' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-5 h-5" /> Ubicaciones
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'portal' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-5 h-5" /> Portal Auto-Servicio
          </button>
        </div>

        {/* Contenedor de Vista Activa */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          {activeTab === 'perfil' && (
            <ProfileTab
              avatarSeed={avatarSeed}
              setAvatarSeed={setAvatarSeed}
              tituloRPG={tituloRPG}
              setTituloRPG={setTituloRPG}
              userLevel={userLevel}
              musicaNivel={musicaNivel}
              setMusicaNivel={setMusicaNivel}
              alertasCriticas={alertasCriticas}
              setAlertasCriticas={setAlertasCriticas}
            />
          )}

          {activeTab === 'gamificacion' && (
            <GamificationTab
              reglasXP={reglasXP}
              setReglasXP={setReglasXP}
              nivelesConfig={nivelesConfig}
              isSavingGamificacion={isSavingGamificacion}
              handleResetGamificacion={handleResetGamificacion}
              handleSaveGamificacion={handleSaveGamificacion}
              handleNivelChange={handleNivelChange}
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
  );
}
