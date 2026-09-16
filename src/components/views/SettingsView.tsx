import { useState, useEffect, useMemo } from 'react';
import { Settings, User, Gamepad2, Palette, Save, Bell, Shield, Volume2, Monitor, Award, Layers, Tags, Sun, Moon, Lock, Check, MapPin, Plus, Trash2, X, Key, RotateCcw, Sparkles, Trophy, Sliders, RefreshCw, Cpu, Wifi, BookOpen, GraduationCap } from 'lucide-react';
import { getPerfilUsuario, actualizarPreferenciasUsuario, getUbicaciones, crearUbicacion, eliminarUbicacion, getPortalPin, setPortalPin, getPortalConfig, regeneratePortalToken, getCatalogos, actualizarCatalogo, safeStorage, getReglasGamificacion, guardarReglasGamificacion, ReglasGamificacion } from '@/services/api/api-client';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

const TITULOS_RPG = [
  { id: 'Técnico Novato', minLevel: 1, icon: '🔧', desc: 'Recién llegado a la mesa de ayuda.' },
  { id: 'Guardián de Hardware', minLevel: 5, icon: '🛡️', desc: 'Reparador de pantallas rotas y teclados sucios.' },
  { id: 'Hechicero de Redes', minLevel: 10, icon: '⚡', desc: 'Domina los routers y el Wi-Fi místico.' },
  { id: 'Señor de los Servidores', minLevel: 15, icon: '🏰', desc: 'Guardián del Data Center y los respaldos.' },
  { id: 'Paladín del Soporte', minLevel: 20, icon: '⚔️', desc: 'Leyenda viviente. Los usuarios no mienten en tu presencia.' },
];

export function SettingsView({ userId = 'JD', onPreferencesSaved }: { userId?: string, onPreferencesSaved?: () => void }) {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'perfil' | 'gamificacion' | 'sistema' | 'catalogos' | 'ubicaciones' | 'portal'>('perfil');
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  
  // Preferencias State
  const [tituloRPG, setTituloRPG] = useState('Técnico Novato');
  const [musicaNivel, setMusicaNivel] = useState(true);
  const [alertasCriticas, setAlertasCriticas] = useState(true);
  const [avatarSeed, setAvatarSeed] = useState(userId || 'tech');
  const [userLevel, setUserLevel] = useState(1);

  // Ubicaciones State
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [nuevaSede, setNuevaSede] = useState('');
  const [nuevoDepto, setNuevoDepto] = useState('');
  const [nuevaArea, setNuevaArea] = useState('');

  // Creación personalizada / dinámica de sede y departamento
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

  // Listas consolidadas y sin duplicados para los selectores
  const sedesExistentes = useMemo(() => {
    const list = Array.from(new Set(ubicaciones.map(u => (u.sede || '').trim()).filter(Boolean)));
    if (list.length === 0) return ['Clínica', 'Tower 1'];
    return list;
  }, [ubicaciones]);

  const departamentosDisponibles = useMemo(() => {
    const fromCat = departamentos.map(d => d.trim()).filter(Boolean);
    const fromUbi = ubicaciones.map(u => (u.departamento || '').trim()).filter(Boolean);
    return Array.from(new Set([...fromCat, ...fromUbi]));
  }, [departamentos, ubicaciones]);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [isAddingDepto, setIsAddingDepto] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Gamificación State
  const [reglasXP, setReglasXP] = useState({
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

  // Cargar estado inicial del tema y preferencias
  useEffect(() => {
    const savedTheme = safeStorage.getItem('app_theme');
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark-mode')) {
      setTheme('dark');
      document.documentElement.classList.add('dark-mode');
    }
    
    // Cargar reglas de gamificación
    fetchGamificacion();
    
    // Si tenemos un userId (aunque sea el mock 'JD' o un UUID), intentar cargar sus preferencias
    if (userId && userId.length > 5) {
      getPerfilUsuario(userId).then(user => {
        if (user.nivel) setUserLevel(user.nivel);
        if (user.avatar) setAvatarSeed(user.avatar);
        if (user.tituloRPG) setTituloRPG(user.tituloRPG);
        if (user.preferencias) {
          if (user.preferencias.musicaNivel !== undefined) setMusicaNivel(user.preferencias.musicaNivel);
          if (user.preferencias.alertasCriticas !== undefined) setAlertasCriticas(user.preferencias.alertasCriticas);
          if (user.preferencias.temaOscuro !== undefined) {
            const isDark = Boolean(user.preferencias.temaOscuro);
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
      }).catch(err => console.log('Usuario no encontrado o no tiene preferencias aún.'));
    }
    
    // Cargar ubicaciones
    fetchUbicaciones();
    
    // Cargar catálogos
    fetchCatalogos();

    // Cargar config del portal (PIN y Token criptográfico)
    getPortalConfig().then(data => {
      if (data.pin) setPortalPinState(data.pin);
      if (data.token) {
        setPortalToken(data.token);
        if (typeof window !== 'undefined') {
          setPortalUrl(`${window.location.origin}/portal?key=${data.token}`);
        }
      }
    }).catch(console.error);
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
    if (departamentos.some(d => d.toLowerCase() === clean.toLowerCase())) {
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
    const updated = departamentos.filter(d => d !== depto);
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
    if (categoriasActivos.some(c => c.toLowerCase() === clean.toLowerCase())) {
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
    const updated = categoriasActivos.filter(c => c !== cat);
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

      // Si se creó una nueva sede, guardarla como la seleccionada para seguir agregando
      if (isCreandoNuevaSede) {
        setNuevaSede(finalSede);
        setIsCreandoNuevaSede(false);
        setNuevaSedeTexto('');
      }

      // Si se creó un nuevo departamento, agregarlo también al catálogo de departamentos del helpdesk
      if (isCreandoNuevoDepto) {
        if (!departamentos.some(d => d.toLowerCase() === finalDepto.toLowerCase())) {
          const updatedDeptos = [...departamentos, finalDepto];
          setDepartamentos(updatedDeptos);
          actualizarCatalogo('departamentos', updatedDeptos).catch(console.error);
        }
        setNuevoDepto(finalDepto);
        setIsCreandoNuevoDepto(false);
        setNuevoDeptoTexto('');
      }

      // Limpiar SOLO el área para permitir añadir más consultorios/oficinas en la misma Sede y Departamento rápidamente
      setNuevaArea('');
      fetchUbicaciones();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al agregar ubicación');
    }
  };

  const handleEliminarUbicacion = async (id: string) => {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    // Eliminación optimista instantánea en la interfaz
    setUbicaciones(prev => prev.filter(u => u.id !== id));
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
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      safeStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      safeStorage.setItem('app_theme', 'light');
    }
  };

  const handleSavePortalPin = async () => {
    setIsSaving(true);
    try {
      await setPortalPin(portalPin);
      toast.success('PIN del portal actualizado');
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

    setIsSaving(true);
    
    // Si tenemos un userId válido (UUID), guardamos en BD
    if (userId && userId.length > 5) {
      try {
        await actualizarPreferenciasUsuario(userId, {
          avatar: avatarSeed,
          tituloRPG,
          preferencias: {
            musicaNivel,
            alertasCriticas,
            temaOscuro: theme === 'dark'
          }
        });
        safeStorage.setItem('app_theme', theme);
        toast.success('¡Preferencias y tema guardados correctamente!');
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
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 md:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-600" /> Configuración del Sistema
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ajusta tus preferencias personales y administra las reglas de gamificación de TI.</p>
        </div>
        <button 
          onClick={savePreferences}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 w-full md:w-auto rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> 
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* Sidebar de Navegación */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'perfil' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
          >
            <User className="w-5 h-5" /> Perfil y Cuenta
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('gamificacion')}
              className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'gamificacion' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            >
              <Gamepad2 className="w-5 h-5" /> Reglas de Gamificación
            </button>
          )}

          <button 
            onClick={() => setActiveTab('sistema')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'sistema' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
          >
            <Monitor className="w-5 h-5" /> Sistema y Apariencia
          </button>
          
          <button 
            onClick={() => setActiveTab('catalogos')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'catalogos' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
          >
            <Layers className="w-5 h-5" /> Catálogos y Listas
          </button>
          
          <button 
            onClick={() => setActiveTab('ubicaciones')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ubicaciones' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MapPin className="w-5 h-5" /> Ubicaciones
          </button>

          <button 
            onClick={() => setActiveTab('portal')}
            className={`flex-none md:w-full flex items-center whitespace-nowrap snap-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'portal' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Monitor className="w-5 h-5" /> Portal Auto-Servicio
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* TAB: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <User className="w-5 h-5 text-indigo-500" /> Preferencias del Técnico
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar y Clase */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Avatar de Héroe</label>
                    <div className="flex items-center gap-4">
                      <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=e2e8f0`} alt="Avatar" className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 p-2 shadow-sm" />
                      <button 
                        onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-300"
                      >
                        Generar Avatar Aleatorio
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Título / Clase de RPG</label>
                    <div className="space-y-2">
                      {TITULOS_RPG.map((titulo) => {
                        const isUnlocked = userLevel >= titulo.minLevel;
                        const isSelected = tituloRPG === titulo.id;
                        
                        return (
                          <div 
                            key={titulo.id}
                            onClick={() => { if (isUnlocked) setTituloRPG(titulo.id) }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                              isUnlocked 
                                ? isSelected
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm cursor-default'
                                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
                                : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg ${isUnlocked ? 'bg-white shadow-sm' : 'bg-slate-200'}`}>
                              {isUnlocked ? titulo.icon : <Lock className="w-4 h-4 text-slate-400" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {titulo.id}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">{titulo.desc}</p>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                              {!isUnlocked && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                                  Requiere Lvl {titulo.minLevel}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Notificaciones */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Alertas y Sonidos
                    </label>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Música de Subida de Nivel</p>
                          <p className="text-xs text-slate-500">Reproducir sonido épico al ganar medallas.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={musicaNivel}
                          onChange={(e) => setMusicaNivel(e.target.checked)}
                          className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Alertas de Tickets Críticos</p>
                          <p className="text-xs text-slate-500">Sonido de alarma cuando ingresa una emergencia.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={alertasCriticas}
                          onChange={(e) => setAlertasCriticas(e.target.checked)}
                          className="w-5 h-5 accent-red-600 cursor-pointer" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GAMIFICACIÓN */}
          {activeTab === 'gamificacion' && (
            <div className="p-6 md:p-8 animate-in slide-in-from-right-4 duration-300 space-y-8">
              {/* Header de la sección */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-amber-500" /> Reglas de Gamificación y Escala de Niveles
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Define los puntos otorgados por cada área y la progresión de rangos de los técnicos.</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetGamificacion}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    title="Restablece los valores estándar sugeridos"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Valores Sugeridos
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGamificacion}
                    disabled={isSavingGamificacion}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Save className={`w-3.5 h-3.5 ${isSavingGamificacion ? 'animate-spin' : ''}`} />
                    {isSavingGamificacion ? 'Guardando...' : 'Guardar Reglas'}
                  </button>
                </div>
              </div>

              {/* Banner Informativo */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Economía Dinámica de XP y Niveles de Soporte TI</p>
                    <p className="text-amber-700 leading-relaxed">
                      Los puntos configurados a continuación se aplican en tiempo real al resolver tickets clínicos, reparar equipos, estabilizar infraestructura y capacitarse en la Academia. Los cambios quedan registrados y sincronizados con la base de datos central.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de 2 Columnas para Áreas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. MESA DE AYUDA (TICKETS) */}
                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600" /> Mesa de Ayuda (Tickets Resueltos)
                    </h3>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Área Principal</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'ticketCritica', label: 'Prioridad Crítica', color: 'bg-red-100 text-red-700 border-red-200', desc: 'Fallas de quirófano, emergencias clínicas o caída total' },
                      { key: 'ticketAlta', label: 'Prioridad Alta', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Afecta directamente la atención de pacientes (Farmacia, Admisión)' },
                      { key: 'ticketMedia', label: 'Prioridad Media', color: 'bg-amber-100 text-amber-700 border-amber-200', desc: 'Problemas operativos estándar (impresoras, software)' },
                      { key: 'ticketBaja', label: 'Prioridad Baja', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', desc: 'Consultas menores, periféricos o solicitudes rutinarias' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:border-indigo-300 transition-colors">
                        <div className="space-y-0.5 pr-2">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${item.color}`}>
                            {item.label}
                          </span>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input 
                            type="number" 
                            min="0"
                            step="25"
                            value={(reglasXP as any)[item.key]} 
                            onChange={(e) => setReglasXP({ ...reglasXP, [item.key]: Number(e.target.value) || 0 })}
                            className="w-20 text-center font-black text-sm bg-slate-50 border-2 border-slate-200 rounded-lg py-1.5 focus:border-indigo-500 focus:bg-white outline-none transition-all" 
                          />
                          <span className="text-xs font-bold text-slate-400">XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. OTRAS ÁREAS TÉCNICAS */}
                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600" /> Inventario, Redes y Formación
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Áreas Especiales</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'activoRescatado', icon: '♻️', label: 'Rescatar Chatarra (Hardware)', desc: 'Recuperar equipo dado de baja ahorrando costos a la clínica' },
                      { key: 'activoReparado', icon: '🛠️', label: 'Reparación Exitosa de Activo', desc: 'Diagnosticar y reparar hardware devolviéndolo a Operativo' },
                      { key: 'redRestaurada', icon: '⚡', label: 'Restaurar Nodo / Switch (Redes)', desc: 'Reactivar switches o routers caídos en infraestructura hospitalaria' },
                      { key: 'guiaCreada', icon: '📖', label: 'Publicar Guía / Manual Técnico', desc: 'Aporte a la Base de Conocimientos para soluciones rápidas' },
                      { key: 'academiaNivel', icon: '🎓', label: 'Completar Nivel de Academia', desc: 'Aprobación de módulos de capacitación técnica' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:border-emerald-300 transition-colors">
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-xs font-bold text-slate-800">{item.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 pl-5">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input 
                            type="number" 
                            min="0"
                            step="25"
                            value={(reglasXP as any)[item.key]} 
                            onChange={(e) => setReglasXP({ ...reglasXP, [item.key]: Number(e.target.value) || 0 })}
                            className="w-20 text-center font-black text-sm bg-slate-50 border-2 border-slate-200 rounded-lg py-1.5 focus:border-emerald-500 focus:bg-white outline-none transition-all" 
                          />
                          <span className="text-xs font-bold text-slate-400">XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* 3. PROGRESIÓN DE NIVELES (NIVEL 1 AL 20) */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" /> Escala y Umbrales de Nivel (Nivel 1 al 20)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Personaliza el XP acumulado requerido por cada nivel. Los títulos RPG se desbloquean según el rango alcanzado.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      Máximo Nivel 20: {(nivelesConfig[19] || 120000).toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Grid de Niveles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {nivelesConfig.map((xpReq, idx) => {
                    const nivelNum = idx + 1;
                    const rpgTitle = TITULOS_RPG.slice().reverse().find(t => nivelNum >= t.minLevel);
                    const isMilestone = [1, 5, 10, 15, 20].includes(nivelNum);

                    return (
                      <div 
                        key={nivelNum} 
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isMilestone 
                            ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isMilestone ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            Lvl {nivelNum}
                          </span>
                          {rpgTitle && isMilestone && (
                            <span className="text-sm" title={rpgTitle.id}>{rpgTitle.icon}</span>
                          )}
                        </div>

                        {isMilestone && (
                          <p className="text-[10px] font-bold text-amber-800 truncate mb-1" title={rpgTitle?.id}>
                            {rpgTitle?.id}
                          </p>
                        )}

                        <div className="flex items-center gap-1 mt-auto">
                          <input 
                            type="number" 
                            min="0"
                            step="250"
                            disabled={idx === 0}
                            value={xpReq} 
                            onChange={(e) => handleNivelChange(idx, Number(e.target.value) || 0)}
                            className="w-full text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded py-1 focus:border-amber-500 focus:bg-white outline-none disabled:opacity-50" 
                          />
                          <span className="text-[10px] font-semibold text-slate-400">XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botón Inferior Guardar */}
                <div className="pt-4 flex justify-end border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={handleSaveGamificacion}
                    disabled={isSavingGamificacion}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <Save className={`w-4 h-4 ${isSavingGamificacion ? 'animate-spin' : ''}`} />
                    {isSavingGamificacion ? 'Guardando Cambios...' : 'Guardar Reglas de Gamificación'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SISTEMA */}
          {activeTab === 'sistema' && (
            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Monitor className="w-5 h-5 text-slate-600" /> Sistema y UI
              </h2>
              
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Tema de la Aplicación
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => toggleTheme('light')}
                      className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden group transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Sun className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-bold ${theme === 'light' ? 'text-indigo-700' : 'text-slate-600'}`}>Claro (Por Defecto)</span>
                      {theme === 'light' && <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>}
                    </button>
                    
                    <button 
                      onClick={() => toggleTheme('dark')}
                      className={`border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden transition-all ${theme === 'dark' ? 'border-indigo-600 bg-slate-900' : 'border-slate-200 bg-slate-800 hover:bg-slate-900'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
                        <Moon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-white'}`}>Modo Oscuro (Terminal)</span>
                      {theme === 'dark' && <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Integraciones Externas
                  </label>
                  <button className="w-full bg-[#36C5F0] hover:bg-[#2EB67D] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                     Vincular con Slack (Alertas)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATÁLOGOS */}
          {activeTab === 'catalogos' && (
            <div className="p-4 md:p-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" /> Catálogos del Helpdesk
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Configuración centralizada de departamentos y tipos de activos del sistema.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Departamentos */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        Gestión de Departamentos
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {departamentos.length} registrados
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Áreas organizacionales donde pueden generarse incidencias y tickets.</p>
                    
                    <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
                      {departamentos.map(dept => (
                        <div key={dept} className="flex items-center justify-between bg-white px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm shadow-xs group hover:border-emerald-300 transition-all">
                          <span className="font-semibold text-slate-700">{dept}</span>
                          <button 
                            onClick={() => handleEliminarDepartamento(dept)}
                            className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar departamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {departamentos.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No hay departamentos registrados.
                        </div>
                      )}
                    </div>
                  </div>

                  {isAddingDepto ? (
                    <form onSubmit={handleAddDepartamento} className="flex gap-2 pt-2 border-t border-slate-200">
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Nombre del departamento..."
                        value={nuevoDeptoNombre}
                        onChange={e => setNuevoDeptoNombre(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                      />
                      <button 
                        type="submit"
                        disabled={!nuevoDeptoNombre.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        Guardar
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setIsAddingDepto(false); setNuevoDeptoNombre(''); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setIsAddingDepto(true)}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-all border border-emerald-200 flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Añadir Departamento
                    </button>
                  )}
                </div>

                {/* Tipos de Inventario */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Tags className="w-4 h-4 text-slate-500" /> Categorías de Activos
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {categoriasActivos.length} registradas
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Clasificación de equipos tecnológicos y médicos para el módulo de Inventario.</p>
                    
                    <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
                      {categoriasActivos.map(cat => (
                        <div key={cat} className="flex items-center justify-between bg-white px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm shadow-xs group hover:border-blue-300 transition-all">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <button 
                            onClick={() => handleEliminarCategoria(cat)}
                            className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {categoriasActivos.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No hay categorías registradas.
                        </div>
                      )}
                    </div>
                  </div>

                  {isAddingCat ? (
                    <form onSubmit={handleAddCategoria} className="flex gap-2 pt-2 border-t border-slate-200">
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Nombre de la categoría..."
                        value={nuevaCatNombre}
                        onChange={e => setNuevaCatNombre(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                      <button 
                        type="submit"
                        disabled={!nuevaCatNombre.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        Guardar
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setIsAddingCat(false); setNuevaCatNombre(''); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setIsAddingCat(true)}
                      className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-xl transition-all border border-blue-200 flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Añadir Categoría
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: UBICACIONES */}
          {activeTab === 'ubicaciones' && (
            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <MapPin className="w-5 h-5 text-purple-600" /> Sedes, Departamentos y Áreas
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario Crear */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-500" /> Nueva Ubicación
                  </h4>
                  <form onSubmit={handleCrearUbicacion} className="space-y-4">
                    {/* 1. SEDE (Selector de Sedes existentes o Crear Nueva) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Sede</label>
                        {!isCreandoNuevaSede ? (
                          <button
                            type="button"
                            onClick={() => { setIsCreandoNuevaSede(true); setNuevaSedeTexto(''); }}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Nueva Sede
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setIsCreandoNuevaSede(false); }}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Seleccionar existente
                          </button>
                        )}
                      </div>

                      {!isCreandoNuevaSede ? (
                        <select
                          value={nuevaSede}
                          onChange={e => {
                            if (e.target.value === '__NUEVA__') {
                              setIsCreandoNuevaSede(true);
                              setNuevaSedeTexto('');
                            } else {
                              setNuevaSede(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                        >
                          <option value="">-- Seleccionar Sede existente --</option>
                          {sedesExistentes.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__NUEVA__" className="text-purple-600 font-bold">+ Crear Nueva Sede...</option>
                        </select>
                      ) : (
                        <div className="space-y-1.5 animate-in fade-in">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Nombre de la nueva sede (Ej: Sede Sur, Torre 2)..."
                            value={nuevaSedeTexto}
                            onChange={e => setNuevaSedeTexto(e.target.value)}
                            className="w-full px-3 py-2 bg-white text-slate-900 border-2 border-purple-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-[10px] text-slate-500 block">
                            💡 Al guardar la primera área, esta sede quedará registrada permanentemente en el sistema.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. DEPARTAMENTO (Selector del Catálogo Central o Crear Nuevo) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">Departamento</label>
                        {!isCreandoNuevoDepto ? (
                          <button
                            type="button"
                            onClick={() => { setIsCreandoNuevoDepto(true); setNuevoDeptoTexto(''); }}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Nuevo Depto
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setIsCreandoNuevoDepto(false); }}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Seleccionar del catálogo
                          </button>
                        )}
                      </div>

                      {!isCreandoNuevoDepto ? (
                        <select
                          value={nuevoDepto}
                          onChange={e => {
                            if (e.target.value === '__NUEVO__') {
                              setIsCreandoNuevoDepto(true);
                              setNuevoDeptoTexto('');
                            } else {
                              setNuevoDepto(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                        >
                          <option value="">-- Seleccionar Departamento del Catálogo --</option>
                          {departamentosDisponibles.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value="__NUEVO__" className="text-purple-600 font-bold">+ Crear Nuevo Departamento...</option>
                        </select>
                      ) : (
                        <div className="space-y-1.5 animate-in fade-in">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Nombre del departamento (Ej: Pediatría, Urgencias)..."
                            value={nuevoDeptoTexto}
                            onChange={e => setNuevoDeptoTexto(e.target.value)}
                            className="w-full px-3 py-2 bg-white text-slate-900 border-2 border-purple-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-[10px] text-slate-500 block">
                            💡 Se añadirá automáticamente a la lista central de Gestión de Departamentos.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 3. ÁREA ESPECÍFICA */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Área Específica / Consultorio / Oficina</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej: Consultorio 101, Oficina 502, Triaje..."
                        value={nuevaArea} 
                        onChange={e => setNuevaArea(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Al pulsar "Agregar Ubicación", la sede y departamento se mantienen seleccionados para agregar múltiples áreas rápido.
                      </span>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Plus className="w-4 h-4" /> Agregar Ubicación
                    </button>
                  </form>
                </div>

                {/* Lista Existente */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 shadow-sm">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-xs">Sede</th>
                            <th className="px-4 py-3 font-semibold text-xs">Departamento</th>
                            <th className="px-4 py-3 font-semibold text-xs">Área</th>
                            <th className="px-4 py-3 font-semibold text-xs">Registrado por</th>
                            <th className="px-4 py-3 font-semibold text-xs w-20 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ubicaciones.map(ubi => (
                            <tr key={ubi.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-700">{ubi.sede}</td>
                              <td className="px-4 py-3 text-slate-600">{ubi.departamento}</td>
                              <td className="px-4 py-3 text-slate-600">{ubi.area}</td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                {ubi.creadoPor ? (
                                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">
                                      {ubi.creadoPor.avatar && ubi.creadoPor.avatar.length <= 3 ? ubi.creadoPor.avatar : (ubi.creadoPor.nombre?.substring(0, 2).toUpperCase() || 'AD')}
                                    </div>
                                    <span className="truncate max-w-[120px]">{ubi.creadoPor.nombre}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Sistema</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => handleEliminarUbicacion(ubi.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {ubicaciones.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">No hay ubicaciones registradas</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB PORTAL */}
          {activeTab === 'portal' && (
            <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1">Portal Kiosco para Usuarios</h3>
                <p className="text-sm text-slate-500 mb-4">Configura el acceso al portal de auto-servicio sin registro.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-700">Enlace del Portal (con Llave de Acceso Criptográfica)</h4>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-600" /> Token Seguro
                      </span>
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                      <input 
                        type="text" 
                        readOnly 
                        value={portalUrl} 
                        className="flex-1 min-w-0 px-3 py-2 text-xs font-mono bg-slate-50 text-slate-600 outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(portalUrl);
                          toast.success('Enlace copiado al portapapeles');
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 font-bold text-sm transition-colors border-l border-slate-200 shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Este enlace incluye una clave única generada por el servidor (<span className="font-mono text-indigo-600">?key=...</span>). Quien acceda con esta URL ingresa de forma inmediata al formulario.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-bold text-slate-700">Llave del Código QR</h5>
                      <p className="text-xs text-slate-500">Si deseas invalidar el QR actual para que ya no funcione el enlace anterior, genera una nueva llave.</p>
                    </div>
                    <button
                      onClick={handleRegenerateToken}
                      disabled={isRegeneratingToken}
                      className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-indigo-600 ${isRegeneratingToken ? 'animate-spin' : ''}`} />
                      {isRegeneratingToken ? 'Regenerando...' : 'Regenerar Llave QR'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-1">PIN de Acceso Manual</h4>
                    <p className="text-xs text-slate-500 mb-3">Este PIN de 4 dígitos solo se solicitará si alguien entra escribiendo la URL a mano sin la llave del QR.</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input 
                        type="text"
                        maxLength={4}
                        value={portalPin}
                        onChange={(e) => setPortalPinState(e.target.value)}
                        className="w-24 px-4 py-2 text-center text-xl tracking-[0.5em] font-black bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button 
                        onClick={handleSavePortalPin}
                        disabled={isSaving || portalPin.length < 4}
                        className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        Guardar PIN
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 mb-3 text-slate-700 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <h4>Código QR Inteligente</h4>
                    </div>
                    {portalUrl && (
                      <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-indigo-100">
                        <QRCodeSVG value={portalUrl} size={160} level="M" />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-4 text-center max-w-[180px] leading-relaxed">
                      Imprime este código. Al escanearlo, el personal entra directo sin pedirles PIN.
                    </p>
                    <a 
                      href={portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      Probar Acceso con QR &rarr;
                    </a>
                  </div>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
