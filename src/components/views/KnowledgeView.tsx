import { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Download, Eye, UploadCloud, X, Trash2, ShieldAlert, Search, FileEdit, FileCode } from 'lucide-react';
import { getGuias, crearGuia, eliminarGuia, uploadFileToStorage } from '@/services/api/api-client';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para el formulario de subida
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [creationMode, setCreationMode] = useState<'PDF' | 'NATIVO'>('NATIVO');
  const [contenidoNativo, setContenidoNativo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuides = async (query = '') => {
    try {
      setLoading(true);
      // Asumimos que api-client tiene getGuiasSearch
      const data = await getGuias(query);
      setGuides(data);
    } catch (err) {
      console.error('Error fetching guides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides(searchQuery);
  }, [searchQuery]);

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
    if (!nuevoTitulo) return;
    
    if (creationMode === 'PDF' && !selectedFile) return;
    if (creationMode === 'NATIVO' && !contenidoNativo) return;

    try {
      let peso = 'N/A';
      let urlPdf = null;
      let contenidoRichText = null;

      if (creationMode === 'PDF' && selectedFile) {
        peso = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
        const uploadResult = await uploadFileToStorage(selectedFile);
        urlPdf = uploadResult.url;
      } else {
        peso = 'Doc Web';
        contenidoRichText = contenidoNativo;
      }

      await crearGuia({
        titulo: nuevoTitulo,
        urlPdf,
        contenidoRichText,
        peso,
        autorId: userId || undefined, // Evitar enviar un UUID hardcodeado
      });
      
      setIsModalOpen(false);
      setSelectedFile(null);
      setNuevoTitulo('');
      setContenidoNativo('');
      fetchGuides(searchQuery);
    } catch (err) {
      console.error(err);
      alert("Error al subir guía");
    }
  };

  const handleEliminarGuia = async () => {
    if (!guideToDelete) return;
    try {
      await eliminarGuia(guideToDelete);
      fetchGuides(searchQuery);
    } catch (e) {
      alert("Error al eliminar");
    } finally {
      setGuideToDelete(null);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 relative h-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" /> Base de Conocimiento
          </h1>
          <p className="text-slate-500 text-sm mt-1">Guías, manuales y protocolos de TI. ¡Colabora y gana XP!</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Búsqueda semántica..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => {
              setSelectedFile(null);
              setNuevoTitulo('');
              setContenidoNativo('');
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 transition-transform hover:rotate-90" /> Crear Guía
          </button>
        </div>
      </div>

      {/* Loading o Grid */}
      {loading && guides.length === 0 ? (
        <div className="p-12 text-center text-slate-500 animate-pulse bg-white rounded-xl border border-slate-100 shadow-sm">
          Realizando búsqueda inteligente...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col group relative overflow-hidden">
            {/* Efecto hover brillante */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-red-500 group-hover:scale-105 transition-all duration-300">
                {guide.contenidoRichText ? (
                  <FileCode className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-red-700 transition-colors" title={guide.titulo}>{guide.titulo}</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">{guide.peso || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-600 shadow-sm overflow-hidden">
                  {guide.autor?.avatar && guide.autor.avatar.length > 2 ? (
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${guide.autor.avatar}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    guide.autor?.avatar || 'TI'
                  )}
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
        {guides.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-slate-600 font-bold text-lg mb-1">No se encontraron guías</h3>
            <p className="text-slate-400 text-sm max-w-md">Prueba con otra palabra clave o crea el primer manual para ganar puntos de experiencia.</p>
          </div>
        )}
      </div>
      )}

      {/* Modal Interactivo de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-red-600" /> Nueva Guía de TI
            </h2>

            {/* Toggle Tipo de Documento */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6 w-fit">
              <button
                type="button"
                onClick={() => setCreationMode('NATIVO')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${creationMode === 'NATIVO' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileEdit className="w-4 h-4" /> Doc. Nativo
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('PDF')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${creationMode === 'PDF' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="w-4 h-4" /> Subir PDF
              </button>
            </div>

            <form onSubmit={handleSubirGuia}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">Título de la Guía <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: Resolución Error Pantalla Azul"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium mb-2"
                />
              </div>

              {creationMode === 'NATIVO' ? (
                <div className="h-64 mb-12">
                  <ReactQuill 
                    theme="snow" 
                    value={contenidoNativo} 
                    onChange={setContenidoNativo}
                    className="h-full bg-white rounded-b-lg"
                    placeholder="Escribe el paso a paso de la solución..."
                  />
                </div>
              ) : (
                !selectedFile ? (
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
                      {isDragging ? '¡Suelta el PDF aquí!' : 'Haz clic o arrastra tu PDF aquí'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs">Máximo 10MB</p>
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
                        <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • PDF</p>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
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
                  disabled={(!nuevoTitulo) || (creationMode === 'PDF' && !selectedFile) || (creationMode === 'NATIVO' && !contenidoNativo)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2
                    ${(!nuevoTitulo || (creationMode === 'PDF' && !selectedFile) || (creationMode === 'NATIVO' && !contenidoNativo)) ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}
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

            {/* Contenido del "PDF" o "Documento Nativo" */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200">
              <div className="bg-white w-full max-w-3xl min-h-full shadow-lg p-10 flex flex-col gap-6">
                
                {viewingGuide.contenidoRichText ? (
                  <div className="ql-snow">
                    <div 
                      className="ql-editor max-w-none"
                      style={{ padding: 0 }}
                      dangerouslySetInnerHTML={{ __html: viewingGuide.contenidoRichText }}
                    />
                  </div>
                ) : (
                  <div className="animate-pulse flex flex-col gap-6">
                    <div className="w-3/4 h-8 bg-slate-200 rounded-md mb-4"></div>
                    <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                    <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                    <div className="w-5/6 h-4 bg-slate-100 rounded-md mb-8"></div>
                    
                    <div className="w-full h-48 bg-slate-100 rounded-md mb-8 flex items-center justify-center">
                      <span className="text-slate-300 font-medium">Visualizador PDF (Simulado)</span>
                    </div>

                    <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                    <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                    <div className="w-4/5 h-4 bg-slate-100 rounded-md"></div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
