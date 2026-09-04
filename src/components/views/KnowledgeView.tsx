import { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Download, Eye, UploadCloud, X, Trash2, ShieldAlert } from 'lucide-react';
import { getGuias, crearGuia, eliminarGuia } from '@/services/api/api-client';

interface KnowledgeViewProps {
  userId?: string;
}

export function KnowledgeView({ userId }: KnowledgeViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingGuide, setViewingGuide] = useState<any | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de subida
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuides = async () => {
    try {
      const data = await getGuias();
      setGuides(data);
    } catch (err) {
      console.error('Error fetching guides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        // Sugerir el nombre del archivo sin el .pdf
        setNuevoTitulo(file.name.replace('.pdf', ''));
      } else {
        alert("Por favor, sube solo archivos PDF.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setNuevoTitulo(file.name.replace('.pdf', ''));
      } else {
        alert("Por favor, sube solo archivos PDF.");
      }
    }
  };

  const handleSubirGuia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo || !selectedFile) return;

    try {
      // Calculamos peso visual (ej. 2.4 MB)
      const mb = (selectedFile.size / (1024 * 1024)).toFixed(1);
      const peso = `${mb} MB`;

      await crearGuia({
        titulo: nuevoTitulo,
        urlPdf: `/uploads/${selectedFile.name}`, // Simulado
        peso: peso,
        autorId: userId || '4e447e7e-0824-49d1-9abd-490209ad77de', // Fallback si no hay userId
      });
      
      setIsModalOpen(false);
      setSelectedFile(null);
      setNuevoTitulo('');
      fetchGuides();
      // Aqu idealmente se ganara XP (Ej. onTicketResolved o un onXpGained)
    } catch (err) {
      alert("Error al subir gua");
    }
  };

  const handleEliminarGuia = async () => {
    if (!guideToDelete) return;
    try {
      await eliminarGuia(guideToDelete);
      fetchGuides();
    } catch (e) {
      alert("Error al eliminar");
    } finally {
      setGuideToDelete(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Cargando base de conocimiento...</div>;
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 relative h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" /> Base de Conocimiento
          </h1>
          <p className="text-slate-500 text-sm mt-1">Guas, manuales y protocolos de TI. Colabora y gana XP!</p>
        </div>
        <button 
          onClick={() => {
            setSelectedFile(null);
            setNuevoTitulo('');
            setIsModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4 transition-transform hover:rotate-90" /> Subir PDF
        </button>
      </div>

      {/* Grid de PDFs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col group relative overflow-hidden">
            {/* Efecto hover brillante */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-red-500 group-hover:scale-105 transition-all duration-300">
                <FileText className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-red-700 transition-colors" title={guide.titulo}>{guide.titulo}</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">{guide.peso || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                  {guide.autor?.avatar || 'TI'}
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-600 leading-none mb-0.5">{guide.autor?.nombre?.split(' ')[0] || 'Desconocido'}</p>
                  <p className="text-[9px] text-slate-400 leading-none">{guide.fechaSubida ? new Date(guide.fechaSubida).toLocaleDateString() : 'Reciente'}</p>
                </div>
              </div>

              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all active:scale-95" title="Eliminar" onClick={() => setGuideToDelete(guide.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95" title="Ver Documento" onClick={() => setViewingGuide(guide)}>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {guides.length === 0 && (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-slate-600 font-bold text-lg mb-1">Base de conocimiento vaca</h3>
            <p className="text-slate-400 text-sm max-w-md">Sube el primer manual o gua de resolucin para ayudar a tu equipo y ganar puntos de experiencia.</p>
          </div>
        )}
      </div>

      {/* Modal Interactivo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-red-600" /> Nueva Gua de TI
            </h2>
            <p className="text-sm text-slate-500 mb-6">Sube manuales o protocolos en formato PDF.</p>

            <form onSubmit={handleSubirGuia}>
              {!selectedFile ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer duration-300
                    ${isDragging ? 'border-red-500 bg-red-50 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-red-400'}
                  `}
                >
                  <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-red-100' : 'bg-white shadow-sm'}`}>
                    <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm">
                    {isDragging ? 'Suelta el PDF aqu!' : 'Haz clic o arrastra tu PDF aqu'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs">Mximo 10MB</p>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB  PDF</p>
                    </div>
                    <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ttulo de la Gua <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={nuevoTitulo}
                      onChange={(e) => setNuevoTitulo(e.target.value)}
                      placeholder="Ej: Manual de Resolucin Impresoras"
                      className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!selectedFile || !nuevoTitulo}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2
                    ${(!selectedFile || !nuevoTitulo) ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}
                  `}
                >
                  <UploadCloud className="w-4 h-4" /> Publicar Gua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación Animado */}
      {guideToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar Documento?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Esta acción no se puede deshacer. El documento será borrado permanentemente de la base de conocimiento.
              </p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setGuideToDelete(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleEliminarGuia}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de PDF (Simulado) */}
      {viewingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Toolbar del "PDF" */}
            <div className="bg-slate-800 text-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-400" />
                <span className="font-medium text-sm truncate max-w-md">{viewingGuide.titulo}.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-300" title="Descargar">
                  <Download className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-600 mx-1"></div>
                <button 
                  onClick={() => setViewingGuide(null)}
                  className="p-1.5 hover:bg-slate-700 hover:text-white rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del "PDF" */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200">
              <div className="bg-white w-full max-w-2xl min-h-full shadow-lg p-10 flex flex-col gap-6 animate-pulse">
                {/* Esqueleto de documento */}
                <div className="w-3/4 h-8 bg-slate-200 rounded-md mb-4"></div>
                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-5/6 h-4 bg-slate-100 rounded-md mb-8"></div>
                
                <div className="w-full h-48 bg-slate-100 rounded-md mb-8 flex items-center justify-center">
                  <span className="text-slate-300 font-medium">Gráfico o Imagen (Simulado)</span>
                </div>

                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-4/5 h-4 bg-slate-100 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
