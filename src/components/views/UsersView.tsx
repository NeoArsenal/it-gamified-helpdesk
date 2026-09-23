import { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Plus, Edit, X, Save, Check, Trash2, AlertTriangle } from 'lucide-react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '@/services/api/api-client';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { toast } from 'sonner';

const MODULOS_DISPONIBLES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'network', label: 'Equipos y Red' },
  { id: 'knowledge', label: 'Guías y Manuales' },
  { id: 'academy', label: 'Academia TI' },
  { id: 'inventory', label: 'Inventario IT' },
  { id: 'analytics', label: 'Analítica' },
  { id: 'settings', label: 'Configuración' },
  { id: 'users', label: 'Gestión de Usuarios' },
];

export const UsersView = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('TECNICO');
  const [modulos, setModulos] = useState<string[]>(['dashboard', 'tickets', 'knowledge', 'academy', 'settings']);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsuarios();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      setNombre(user.nombre);
      setEmail(user.email);
      setRol(user.rol);
      setPassword(''); // No mostrar la contraseña actual
      setModulos(user.modulosAccesibles || []);
    } else {
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('TECNICO');
      setModulos(['dashboard', 'tickets', 'knowledge', 'academy', 'settings']);
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const toggleModulo = (modId: string) => {
    if (modulos.includes(modId)) {
      setModulos(modulos.filter(m => m !== modId));
    } else {
      setModulos([...modulos, modId]);
    }
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        const updateData: any = { nombre, email, rol, modulosAccesibles: modulos };
        if (password) updateData.password = password;
        await actualizarUsuario(editingUser.id, updateData);
        toast.success('Usuario actualizado correctamente');
      } else {
        if (!password) {
          toast.error('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await crearUsuario({ nombre, email, password, rol, modulosAccesibles: modulos });
        toast.success('Usuario creado correctamente');
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      // El toast de error ya lo maneja api-client
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await eliminarUsuario(userToDelete.id);
      toast.success(`Usuario ${userToDelete.nombre} eliminado correctamente`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <Users className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Administra los accesos y permisos de tu equipo TI.
          </p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Módulos</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Cargando usuarios...</td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatar={user.avatar}
                        name={user.nombre}
                        size="md"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{user.nombre}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.rol === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                        Técnico
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {user.rol === 'ADMIN' ? (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">Acceso Total</span>
                      ) : (
                        user.modulosAccesibles?.map((mod: string) => (
                          <span key={mod} className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {mod}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {currentUser?.id !== user.id ? (
                        <button 
                          onClick={() => setUserToDelete(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <span 
                          className="p-2 text-slate-300 cursor-not-allowed" 
                          title="Tu cuenta en sesión (no puedes auto-eliminarte)"
                        >
                          <Trash2 className="w-5 h-5 opacity-30" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Contraseña {editingUser && <span className="text-slate-400 font-normal">(Opcional, dejar en blanco para mantener)</span>}
                  </label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                    placeholder={editingUser ? '••••••••' : 'Contraseña segura'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rol</label>
                  <select 
                    value={rol} 
                    onChange={e => setRol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-slate-800"
                  >
                    <option value="TECNICO">Técnico</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              {rol !== 'ADMIN' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">Permisos de Módulos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {MODULOS_DISPONIBLES.map(mod => {
                      const isSelected = modulos.includes(mod.id);
                      return (
                        <div 
                          key={mod.id}
                          onClick={() => toggleModulo(mod.id)}
                          className={`
                            p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                            ${isSelected ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'}
                          `}
                        >
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors
                            ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-300'}
                          `}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-bold">{mod.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {rol === 'ADMIN' && (
                <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Los Administradores tienen acceso implícito a todos los módulos y opciones de configuración del sistema. No es necesario asignarles módulos individuales.
                  </p>
                </div>
              )}

            </div>
            
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={closeModal}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Usuario */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar Usuario?</h3>
            <p className="text-sm text-slate-600 mb-3">
              Estás a punto de eliminar a <span className="font-bold text-slate-900">{userToDelete.nombre}</span> ({userToDelete.email}).
            </p>
            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2 text-left mb-6 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Sus tickets, guías y registros históricos se conservarán para las estadísticas, pero quedarán desvinculados de este usuario. Esta acción es permanente.</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 px-4 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl transition-all shadow-md shadow-red-600/20 text-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
