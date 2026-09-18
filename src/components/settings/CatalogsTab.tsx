import React from 'react';
import { Layers, Trash2, Plus, X, Tags } from 'lucide-react';

interface CatalogsTabProps {
  departamentos: string[];
  categoriasActivos: string[];
  nuevoDeptoNombre: string;
  setNuevoDeptoNombre: (val: string) => void;
  nuevaCatNombre: string;
  setNuevaCatNombre: (val: string) => void;
  isAddingDepto: boolean;
  setIsAddingDepto: (val: boolean) => void;
  isAddingCat: boolean;
  setIsAddingCat: (val: boolean) => void;
  handleAddDepartamento: (e: React.FormEvent) => Promise<void>;
  handleEliminarDepartamento: (depto: string) => Promise<void>;
  handleAddCategoria: (e: React.FormEvent) => Promise<void>;
  handleEliminarCategoria: (cat: string) => Promise<void>;
}

export const CatalogsTab: React.FC<CatalogsTabProps> = ({
  departamentos,
  categoriasActivos,
  nuevoDeptoNombre,
  setNuevoDeptoNombre,
  nuevaCatNombre,
  setNuevaCatNombre,
  isAddingDepto,
  setIsAddingDepto,
  isAddingCat,
  setIsAddingCat,
  handleAddDepartamento,
  handleEliminarDepartamento,
  handleAddCategoria,
  handleEliminarCategoria,
}) => {
  return (
    <div className="p-4 md:p-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Catálogos del Helpdesk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configuración centralizada de departamentos y tipos de activos del sistema.
          </p>
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
            <p className="text-xs text-slate-500 mb-4">
              Áreas organizacionales donde pueden generarse incidencias y tickets.
            </p>

            <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
              {departamentos.map((dept) => (
                <div
                  key={dept}
                  className="flex items-center justify-between bg-white px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm shadow-xs group hover:border-emerald-300 transition-all"
                >
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
                onChange={(e) => setNuevoDeptoNombre(e.target.value)}
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
                onClick={() => {
                  setIsAddingDepto(false);
                  setNuevoDeptoNombre('');
                }}
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
            <p className="text-xs text-slate-500 mb-4">
              Clasificación de equipos tecnológicos y médicos para el módulo de Inventario.
            </p>

            <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
              {categoriasActivos.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between bg-white px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm shadow-xs group hover:border-blue-300 transition-all"
                >
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
                onChange={(e) => setNuevaCatNombre(e.target.value)}
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
                onClick={() => {
                  setIsAddingCat(false);
                  setNuevaCatNombre('');
                }}
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
  );
};
