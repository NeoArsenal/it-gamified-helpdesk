import React from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { PortalSelect } from './PortalSelect';

interface PortalReportFormProps {
  titulo: string;
  setTitulo: (val: string) => void;
  sede: string;
  setSede: (val: string) => void;
  departamento: string;
  setDepartamento: (val: string) => void;
  area: string;
  setArea: (val: string) => void;
  solicitanteNombre: string;
  setSolicitanteNombre: (val: string) => void;
  solicitanteContacto: string;
  setSolicitanteContacto: (val: string) => void;
  honeypot: string;
  setHoneypot: (val: string) => void;
  sedesList: string[];
  departamentosList: string[];
  areasList: string[];
  isSubmitting: boolean;
  handleSubmitTicket: (e: React.FormEvent) => Promise<void>;
  handleNombreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContactoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContactoBlur: () => void;
  fotoFile: File | null;
  fotoPreview: string | null;
  handleSelectFoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFoto: () => void;
  isCompressingFoto?: boolean;
}

export const PortalReportForm: React.FC<PortalReportFormProps> = ({
  titulo,
  setTitulo,
  sede,
  setSede,
  departamento,
  setDepartamento,
  area,
  setArea,
  solicitanteNombre,
  honeypot,
  setHoneypot,
  sedesList,
  departamentosList,
  areasList,
  isSubmitting,
  handleSubmitTicket,
  handleNombreChange,
  handleContactoChange,
  handleContactoBlur,
  solicitanteContacto,
  fotoFile,
  fotoPreview,
  handleSelectFoto,
  handleRemoveFoto,
  isCompressingFoto = false,
}) => {
  return (
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

      {/* Paso 1: Ubicación */}
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
              {areasList.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`px-3.5 py-2 text-sm font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    area === a
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t-2 border-slate-100 my-6"></div>

      {/* Paso 2: Problema */}
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
            onChange={(e) => setTitulo(e.target.value)}
            rows={3}
            placeholder="Ej. La impresora principal no enciende, o la computadora no abre el sistema médico..."
            className="w-full px-4 py-3 bg-white text-slate-800 border-2 border-slate-300 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-400 font-medium leading-relaxed"
          />
        </div>

        {/* Evidencia fotográfica / Captura */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" />
              Foto o Evidencia del Problema <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
            </span>
            {fotoFile && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {(fotoFile.size / 1024).toFixed(0)} KB lista
              </span>
            )}
          </label>

          {fotoPreview ? (
            <div className="relative inline-block mt-1">
              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md group max-w-xs">
                <img
                  src={fotoPreview}
                  alt="Vista previa evidencia"
                  className="w-full max-h-48 object-cover bg-slate-900"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleRemoveFoto}
                className="absolute -top-2.5 -right-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white p-1.5 rounded-full shadow-lg transition-all cursor-pointer z-10"
                title="Quitar foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <label className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-50/80 hover:bg-indigo-50/60 active:scale-[0.99] text-indigo-700 font-bold text-sm rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer shadow-sm">
                {isCompressingFoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-indigo-600">Optimizando imagen...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Tomar foto o adjuntar imagen</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSelectFoto}
                  disabled={isCompressingFoto}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                Tip: Toma foto a la pantalla del error o al equipo averiado. Se optimiza automáticamente en segundos.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-slate-100 my-6"></div>

      {/* Paso 3: Contacto */}
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base md:text-lg font-black py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>Enviar Reporte a Sistemas</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
