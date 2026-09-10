import { useState, useEffect } from 'react';
import { Settings, User, Gamepad2, Palette, Save, Bell, Shield, Volume2, Monitor, Award, Layers, Tags, Sun, Moon, Lock, Check, MapPin, Plus, Trash2, X } from 'lucide-react';
import { getPerfilUsuario, actualizarPreferenciasUsuario, getUbicaciones, crearUbicacion, eliminarUbicacion, getPortalPin, setPortalPin, getCatalogos, actualizarCatalogo } from '@/services/api/api-client';
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

  // Portal State
  const [portalPin, setPortalPinState] = useState('');
  const [portalUrl, setPortalUrl] = useState('');

  // Catálogos State
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [categoriasActivos, setCategoriasActivos] = useState<string[]>([]);
  const [nuevoDeptoNombre, setNuevoDeptoNombre] = useState('');
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [isAddingDepto, setIsAddingDepto] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);



  // Cargar estado inicial del tema y preferencias
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark-mode')) {
      setTheme('dark');
      document.documentElement.classList.add('dark-mode');
    }
    
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
              localStorage.setItem('app_theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark-mode');
              localStorage.setItem('app_theme', 'light');
            }
          }
        }
      }).catch(err => console.log('Usuario no encontrado o no tiene preferencias aún.'));
    }
    
    // Cargar ubicaciones
    fetchUbicaciones();
    
    // Cargar catálogos
    fetchCatalogos();

    // Cargar config del portal
    getPortalPin().then(data => setPortalPinState(data.pin)).catch(console.error);
    if (typeof window !== 'undefined') {
      setPortalUrl(`${window.location.origin}/portal`);
    }
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
    if (!nuevaSede.trim() || !nuevoDepto.trim() || !nuevaArea.trim()) return;
    try {
      await crearUbicacion({ sede: nuevaSede, departamento: nuevoDepto, area: nuevaArea });
      setNuevaArea(''); // Limpiar solo el área para crear más rápido
      fetchUbicaciones();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarUbicacion = async (id: string) => {
    if (!confirm('¿Eliminar esta ubicación?')) return;
    try {
      await eliminarUbicacion(id);
      fetchUbicaciones();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('app_theme', 'light');
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

  const savePreferences = async () => {
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
        localStorage.setItem('app_theme', theme);
        toast.success('¡Preferencias y tema guardados correctamente!');
        if (onPreferencesSaved) onPreferencesSaved();
      } catch (error) {
        console.error('Error al guardar preferencias', error);
        toast.error('Ocurrió un error al guardar las preferencias en el servidor.');
      } finally {
        setIsSaving(false);
      }
    } else {
      localStorage.setItem('app_theme', theme);
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
            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Gamepad2 className="w-5 h-5 text-amber-500" /> Reglas y Economía de XP
              </h2>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 mb-8">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-800 text-sm">Zona de Administración</h3>
                    <p className="text-amber-700 text-xs mt-1">Los cambios aquí afectarán a todos los técnicos. Solo los administradores pueden modificar la cantidad de XP otorgada por cada acción.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recompensas por Ticket */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-indigo-500"/> XP por Tickets Resueltos</h4>
                  <div className="space-y-3">
                    {[
                      { prio: 'Crítica', color: 'bg-red-100 text-red-700', xp: 100 },
                      { prio: 'Alta', color: 'bg-orange-100 text-orange-700', xp: 50 },
                      { prio: 'Media', color: 'bg-amber-100 text-amber-700', xp: 20 },
                      { prio: 'Baja', color: 'bg-emerald-100 text-emerald-700', xp: 10 },
                    ].map(item => (
                      <div key={item.prio} className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${item.color}`}>Prioridad {item.prio}</span>
                        <div className="flex items-center gap-2">
                          <input type="number" defaultValue={item.xp} className="w-20 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-amber-500 outline-none" />
                          <span className="text-xs font-bold text-slate-400">XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recompensas por Otras Acciones */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500"/> XP por Acciones Adicionales</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Crear Manual/Guía</p>
                        <p className="text-[10px] text-slate-500">Aporte a la base de conocimiento.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={30} className="w-20 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        <span className="text-xs font-bold text-slate-400">XP</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Restaurar Equipo (Red)</p>
                        <p className="text-[10px] text-slate-500">Evitar caídas de infraestructura.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={250} className="w-20 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        <span className="text-xs font-bold text-slate-400">XP</span>
                      </div>
                    </div>
                  </div>
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
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Sede</label>
                      <input 
                        type="text" required placeholder="Ej: Tower 1"
                        value={nuevaSede} onChange={e => setNuevaSede(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Departamento</label>
                      <input 
                        type="text" required placeholder="Ej: Piso 5"
                        value={nuevoDepto} onChange={e => setNuevoDepto(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Área Específica</label>
                      <input 
                        type="text" required placeholder="Ej: Oficina 501"
                        value={nuevaArea} onChange={e => setNuevaArea(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm mt-2">
                      Agregar Ubicación
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
                            <th className="px-4 py-3 font-semibold text-xs w-20 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ubicaciones.map(ubi => (
                            <tr key={ubi.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-700">{ubi.sede}</td>
                              <td className="px-4 py-3 text-slate-600">{ubi.departamento}</td>
                              <td className="px-4 py-3 text-slate-600">{ubi.area}</td>
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
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No hay ubicaciones registradas</td>
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
                    <h4 className="font-bold text-slate-700 mb-2">Enlace del Portal</h4>
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <input 
                        type="text" 
                        readOnly 
                        value={portalUrl} 
                        className="flex-1 min-w-0 px-3 py-2 text-sm bg-slate-50 text-slate-600 outline-none"
                      />
                      <button 
                        onClick={() => navigator.clipboard.writeText(portalUrl)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 font-bold text-sm transition-colors border-l border-slate-200 shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">PIN de Acceso</h4>
                    <p className="text-xs text-slate-500 mb-3">Este PIN será requerido para entrar al portal desde una computadora o al escanear el QR.</p>
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
                    <h4 className="font-bold text-slate-700 mb-4 text-center">Código QR</h4>
                    {portalUrl && (
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        <QRCodeSVG value={portalUrl} size={150} level="M" />
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4 text-center max-w-[150px]">
                      Imprime este código y colócalo en oficinas.
                    </p>
                    <a 
                      href={portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      Probar Portal &rarr;
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
