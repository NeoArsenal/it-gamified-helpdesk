import { useState, useEffect, useMemo } from 'react';
import {
  getActivos,
  crearActivo,
  updateActivo,
  eliminarActivo,
  getCatalogos,
  getUbicacionesSedes,
  getUbicacionesDepartamentos,
  getUbicacionesAreas,
} from '@/services/api';
import { toast } from 'sonner';

interface UseInventoryProps {
  userId?: string;
  onActivoRescatado?: () => void;
}

export function useInventory({ userId, onActivoRescatado }: UseInventoryProps = {}) {
  const [activos, setActivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pestaña activa: 'CATALOGO' o 'TALLER'
  const [activeTab, setActiveTab] = useState<'CATALOGO' | 'TALLER'>('CATALOGO');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivo, setEditingActivo] = useState<any | null>(null);
  const [qrModalActivo, setQrModalActivo] = useState<any | null>(null);
  const [isRescatando, setIsRescatando] = useState<string | null>(null);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  // Estados del Formulario (Crear / Editar)
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('PC');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estado, setEstado] = useState('OPERATIVO');
  const [observaciones, setObservaciones] = useState('');

  // Catálogos dinámicos
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([
    'PC', 'Laptop', 'Impresora', 'Monitor', 'Servidor', 'Switch / Router', 'POS', 'Otro',
  ]);
  const [sedesList, setSedesList] = useState<string[]>([]);
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [areasList, setAreasList] = useState<string[]>([]);

  const fetchActivos = async () => {
    try {
      const data = await getActivos();
      setActivos(data);
    } catch (err) {
      console.error('Error fetching activos:', err);
      toast.error('No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();

    getCatalogos()
      .then((data) => {
        if (data.categoriasActivos && data.categoriasActivos.length > 0) {
          setTiposDisponibles(data.categoriasActivos);
        }
      })
      .catch(console.error);

    getUbicacionesSedes()
      .then((data) => {
        setSedesList(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (sede) {
      getUbicacionesDepartamentos(sede)
        .then((data) => {
          setDepartamentosList(data);
        })
        .catch(console.error);
    } else {
      setDepartamentosList([]);
    }
  }, [sede]);

  useEffect(() => {
    if (sede && departamento) {
      getUbicacionesAreas(sede, departamento)
        .then((data) => {
          setAreasList(data);
        })
        .catch(console.error);
    } else {
      setAreasList([]);
    }
  }, [sede, departamento]);

  const sedesDisponibles = useMemo(() => {
    return Array.from(new Set([...sedesList, ...activos.map((a) => a.sede).filter(Boolean)])).sort();
  }, [sedesList, activos]);

  // Métricas
  const totalActivos = activos.length;
  const countOperativos = activos.filter((a) => a.estado === 'OPERATIVO' || !a.estado).length;
  const countReparacion = activos.filter((a) => a.estado === 'REPARACION').length;
  const countBaja = activos.filter((a) => a.estado === 'BAJA').length;
  const countRescatados = activos.filter((a) => a.estado === 'RESCATADO').length;
  const pctOperatividad = totalActivos > 0 ? Math.round((countOperativos / totalActivos) * 100) : 100;

  // Manejo Formulario
  const handleAbrirCrear = () => {
    setEditingActivo(null);
    setCodigo('');
    setTipo(tiposDisponibles[0] || 'PC');
    setMarca('');
    setModelo('');
    setNumeroSerie('');
    setSede('');
    setDepartamento('');
    setUbicacion('');
    setResponsable('');
    setEstado('OPERATIVO');
    setObservaciones('');
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (activo: any) => {
    setEditingActivo(activo);
    setCodigo(activo.codigo || '');
    setTipo(activo.tipo || 'PC');
    setMarca(activo.marca || '');
    setModelo(activo.modelo || '');
    setNumeroSerie(activo.numeroSerie || '');
    setSede(activo.sede || '');
    setDepartamento(activo.departamento || '');
    setUbicacion(activo.ubicacion || '');
    setResponsable(activo.responsable || '');
    setEstado(activo.estado || 'OPERATIVO');
    setObservaciones(activo.observaciones || '');
    setIsModalOpen(true);
  };

  const handleGuardarActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        codigo: codigo.trim().toUpperCase(),
        tipo,
        marca: marca.trim(),
        modelo: modelo.trim(),
        numeroSerie: numeroSerie.trim(),
        sede,
        departamento,
        ubicacion,
        responsable: responsable.trim(),
        estado,
        observaciones: observaciones.trim(),
      };

      if (editingActivo) {
        await updateActivo(editingActivo.id, payload);
        toast.success('Equipo actualizado exitosamente');
      } else {
        await crearActivo(payload);
        toast.success('Nuevo equipo registrado');
      }

      setIsModalOpen(false);
      fetchActivos();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar el equipo');
    }
  };

  const handleEliminar = async (id: string, codigoEquipo: string) => {
    if (confirm(`¿Eliminar el equipo "${codigoEquipo}" del inventario?`)) {
      try {
        await eliminarActivo(id);
        toast.success(`Equipo ${codigoEquipo} eliminado`);
        fetchActivos();
      } catch {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEnviarATaller = async (activo: any) => {
    const motivo = prompt(`¿Qué falla presenta el equipo ${activo.codigo}?`, 'Equipo no enciende / Revisión técnica');
    if (motivo === null) return;

    try {
      await updateActivo(activo.id, {
        estado: 'REPARACION',
        observaciones: motivo ? `${motivo} (Ingresado a taller: ${new Date().toLocaleDateString()})` : activo.observaciones,
      });
      toast.warning(`Equipo ${activo.codigo} enviado al Taller`);
      fetchActivos();
    } catch {
      toast.error('No se pudo enviar al taller');
    }
  };

  const handleMarcarReparado = async (activo: any) => {
    try {
      await updateActivo(activo.id, {
        estado: 'OPERATIVO',
        tecnicoId: userId,
        observaciones: `Reparado con éxito: ${new Date().toLocaleDateString()}`,
      });
      toast.success(`¡Equipo ${activo.codigo} reparado y operativo!`);
      fetchActivos();
    } catch {
      toast.error('Error al marcar reparado');
    }
  };

  const handleDeclararChatarra = async (activo: any) => {
    if (!confirm(`¿Declarar el equipo ${activo.codigo} como Chatarra / Baja definitiva?`)) return;
    try {
      await updateActivo(activo.id, {
        estado: 'BAJA',
        observaciones: `Declarado en baja: ${new Date().toLocaleDateString()}`,
      });
      toast.info(`Equipo ${activo.codigo} trasladado a Chatarra`);
      fetchActivos();
    } catch {
      toast.error('Error al cambiar a baja');
    }
  };

  const handleRescatar = async (id: string, cod: string) => {
    setIsRescatando(id);
    setTimeout(async () => {
      try {
        await updateActivo(id, { estado: 'RESCATADO', tecnicoId: userId });
        if (onActivoRescatado) onActivoRescatado();
        toast.success(`¡Piezas del equipo ${cod} rescatadas para repuestos!`);
        fetchActivos();
      } catch {
        toast.error('Error al rescatar');
      } finally {
        setIsRescatando(null);
      }
    }, 1200);
  };

  // Filtrado
  const q = searchQuery.toLowerCase().trim();
  const filteredActivos = activos.filter((a) => {
    if (q) {
      const mCod = a.codigo?.toLowerCase().includes(q);
      const mTipo = a.tipo?.toLowerCase().includes(q);
      const mMarca = a.marca?.toLowerCase().includes(q);
      const mMod = a.modelo?.toLowerCase().includes(q);
      const mSerial = a.numeroSerie?.toLowerCase().includes(q);
      const mSede = a.sede?.toLowerCase().includes(q);
      const mDept = a.departamento?.toLowerCase().includes(q);
      const mResp = a.responsable?.toLowerCase().includes(q);
      if (!Boolean(mCod || mTipo || mMarca || mMod || mSerial || mSede || mDept || mResp)) return false;
    }

    if (filterSede !== 'TODAS') {
      if (a.sede?.toLowerCase().trim() !== filterSede.toLowerCase().trim()) return false;
    }

    if (filterEstado !== 'TODOS') {
      if (filterEstado === 'OPERATIVO') {
        if (a.estado !== 'OPERATIVO' && Boolean(a.estado)) return false;
      } else if (a.estado !== filterEstado) {
        return false;
      }
    }

    return true;
  });

  return {
    activos,
    loading,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingActivo,
    setEditingActivo,
    qrModalActivo,
    setQrModalActivo,
    isRescatando,
    searchQuery,
    setSearchQuery,
    filterSede,
    setFilterSede,
    filterEstado,
    setFilterEstado,
    codigo,
    setCodigo,
    tipo,
    setTipo,
    marca,
    setMarca,
    modelo,
    setModelo,
    numeroSerie,
    setNumeroSerie,
    sede,
    setSede,
    departamento,
    setDepartamento,
    ubicacion,
    setUbicacion,
    responsable,
    setResponsable,
    estado,
    setEstado,
    observaciones,
    setObservaciones,
    tiposDisponibles,
    sedesList,
    departamentosList,
    areasList,
    sedesDisponibles,
    totalActivos,
    countOperativos,
    countReparacion,
    countBaja,
    countRescatados,
    pctOperatividad,
    filteredActivos,
    handleAbrirCrear,
    handleAbrirEditar,
    handleGuardarActivo,
    handleEliminar,
    handleEnviarATaller,
    handleMarcarReparado,
    handleDeclararChatarra,
    handleRescatar,
  };
}
