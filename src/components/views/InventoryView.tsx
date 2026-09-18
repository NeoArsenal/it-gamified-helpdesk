import React from 'react';
import { 
  Package, Wrench, Trash2, Recycle, Plus, Cpu, CheckCircle2, Layers 
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { 
  AssetTable, 
  AssetWorkshopBoard, 
  AssetFormModal, 
  AssetQrModal 
} from '@/components/inventory';

interface InventoryViewProps {
  userId?: string;
  onActivoRescatado?: () => void;
}

export function InventoryView({ userId, onActivoRescatado }: InventoryViewProps) {
  const {
    activos,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingActivo,
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
    modelo,
    setModelo,
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
  } = useInventory({ userId, onActivoRescatado });

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto">
      
      {/* 1. Cabecera Limpia y Armoniosa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                Inventario de Equipos
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                Gestión patrimonial de hardware y taller técnico de recuperación.
              </p>
            </div>
          </div>

          {/* Métricas Minimalistas en Línea */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200/80">
              <Cpu className="w-3.5 h-3.5 text-slate-500" /> Total: {totalActivos}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {countOperativos} Operativos ({pctOperatividad}%)
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${
              countReparacion > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <Wrench className="w-3.5 h-3.5" /> {countReparacion} en Taller
            </span>
            {countBaja > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                <Trash2 className="w-3.5 h-3.5" /> {countBaja} Bajas
              </span>
            )}
            {countRescatados > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                <Recycle className="w-3.5 h-3.5" /> {countRescatados} Rescatados
              </span>
            )}
          </div>
        </div>

        {/* Selector de Pestañas y Botón Primario */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('CATALOGO')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'CATALOGO'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Todos los Equipos</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'CATALOGO' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'}`}>
                {totalActivos}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TALLER')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'TALLER'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Taller y Bajas</span>
              {(countReparacion + countBaja + countRescatados) > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                  countReparacion > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {countReparacion + countBaja + countRescatados}
                </span>
              )}
            </button>
          </div>

          <button 
            type="button"
            onClick={handleAbrirCrear}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Equipo
          </button>
        </div>
      </div>

      {/* 2. VISTA A: Catálogo Maestro de Equipos */}
      {activeTab === 'CATALOGO' && (
        <AssetTable
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterSede={filterSede}
          setFilterSede={setFilterSede}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          sedesDisponibles={sedesDisponibles}
          filteredActivos={filteredActivos}
          onVerQr={setQrModalActivo}
          onEnviarATaller={handleEnviarATaller}
          onMarcarReparado={handleMarcarReparado}
          onEditar={handleAbrirEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* 3. VISTA B: Taller de Hardware y Bajas */}
      {activeTab === 'TALLER' && (
        <AssetWorkshopBoard
          activos={activos}
          isRescatando={isRescatando}
          onVerQr={setQrModalActivo}
          onMarcarReparado={handleMarcarReparado}
          onDeclararChatarra={handleDeclararChatarra}
          onEliminar={handleEliminar}
          onRescatar={handleRescatar}
        />
      )}

      {/* 4. Modal Crear / Editar Equipo */}
      <AssetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingActivo={editingActivo}
        codigo={codigo}
        setCodigo={setCodigo}
        tipo={tipo}
        setTipo={setTipo}
        modelo={modelo}
        setModelo={setModelo}
        sede={sede}
        setSede={setSede}
        departamento={departamento}
        setDepartamento={setDepartamento}
        ubicacion={ubicacion}
        setUbicacion={setUbicacion}
        responsable={responsable}
        setResponsable={setResponsable}
        estado={estado}
        setEstado={setEstado}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        tiposDisponibles={tiposDisponibles}
        sedesList={sedesList}
        departamentosList={departamentosList}
        onGuardar={handleGuardarActivo}
      />

      {/* 5. Modal de Etiqueta QR Imprimible */}
      <AssetQrModal
        activo={qrModalActivo}
        onClose={() => setQrModalActivo(null)}
      />
    </div>
  );
}
