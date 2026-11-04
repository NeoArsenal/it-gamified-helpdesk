'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  RotateCcw,
  CheckSquare,
  Square,
  Building2,
  MapPin,
  User,
  ShieldCheck,
  Laptop,
  Image as ImageIcon,
  Upload,
  Calendar,
  Hash,
  PenTool,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface AssetHandoverCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: any | null;
  tecnicoNombre?: string;
  defaultSede?: string;
  defaultDepto?: string;
  defaultUbicacion?: string;
  defaultResponsable?: string;
}

export function AssetHandoverCargoModal({
  isOpen,
  onClose,
  activo,
  tecnicoNombre: propTecnico,
  defaultSede,
  defaultDepto,
  defaultUbicacion,
  defaultResponsable,
}: AssetHandoverCargoModalProps) {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Datos editables del Cargo
  const [cargoNumero, setCargoNumero] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo-limatambo.png');
  const [responsableDni, setResponsableDni] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [sede, setSede] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Accesorios
  const [accesorios, setAccesorios] = useState({
    cargador: true,
    mouse: true,
    teclado: false,
    maletin: false,
    cableRed: false,
    monitor: false,
    candado: false,
  });

  // Estado de la firma digital
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Inicializar datos al abrir modal
  useEffect(() => {
    if (isOpen && activo) {
      const year = new Date().getFullYear();
      const codeClean = (activo.codigo || '001').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setCargoNumero(`CARGO-${year}-${codeClean}-${randomSuffix}`);

      const now = new Date();
      setFechaEntrega(
        now.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );

      setSede(defaultSede || activo.sede || 'Sede Central');
      setDepartamento(defaultDepto || activo.departamento || 'General');
      setUbicacion(defaultUbicacion || activo.ubicacion || 'Área Operativa');
      setResponsable(defaultResponsable || activo.responsable || '');
      setTecnico(propTecnico || user?.nombre || 'Soporte TI');

      // Accesorios predeterminados según tipo de activo
      const tipo = (activo.tipo || '').toLowerCase();
      setAccesorios({
        cargador: tipo.includes('laptop') || tipo.includes('portátil'),
        mouse: true,
        teclado: tipo.includes('desktop') || tipo.includes('computadora'),
        maletin: tipo.includes('laptop'),
        cableRed: tipo.includes('desktop') || tipo.includes('switch'),
        monitor: tipo.includes('desktop') || tipo.includes('cpu'),
        candado: false,
      });

      setObservaciones('El equipo se entrega configurado con las aplicaciones corporativas y conexión de red institucional.');
      clearCanvas();
    }
  }, [isOpen, activo, defaultSede, defaultDepto, defaultUbicacion, defaultResponsable, propTecnico, user]);

  // Manejo de la firma táctil / mouse en el Canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate 900
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        setSignatureDataUrl(canvas.toDataURL('image/png'));
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  // Cambio de Logo Personalizado
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Descarga en PDF (A4)
  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const imgData = await toPng(printRef.current, {
        quality: 0.98,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));

      const imgHeight = (img.height * pageWidth) / img.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`${cargoNumero}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF del cargo:', err);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar la opción Imprimir.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Impresión Directa en A4
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    let iframe = document.getElementById('cargo-print-isolated-frame') as HTMLIFrameElement;
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'cargo-print-isolated-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${cargoNumero}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  };

  if (!isOpen || !activo) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[95vh]">
        {/* Barra Superior de Control */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight flex items-center gap-2">
                Cargo de Asignación y Entrega de Equipo
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-blue-100/70 text-blue-800 font-bold">
                  {cargoNumero}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Documento de custodia técnica con firma digital y logo corporativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cambiar el logo de la empresa en este cargo"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Cambiar Logo</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generando...' : 'Descargar PDF A4'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor con Scroll para Edición y Vista Previa */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/80 space-y-4">
          {/* Panel de Ajustes Rápidos */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">N° de Cargo (Correlativo)</label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={cargoNumero}
                  onChange={(e) => setCargoNumero(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-800 focus:outline-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">DNI / Documento del Receptor</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Ej: 47891234 / Ext 104"
                  value={responsableDni}
                  onChange={(e) => setResponsableDni(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Técnico TI que entrega</label>
              <div className="relative">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={tecnico}
                  onChange={(e) => setTecnico(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

          {/* DOCUMENTO FORMAL A4 (Vista Previa / Nodo de Impresión) */}
          <div
            ref={printRef}
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-md max-w-[800px] mx-auto text-slate-800 font-sans text-xs sm:text-[13px] leading-relaxed space-y-5"
            style={{ width: '100%', minHeight: '850px' }}
          >
            {/* Encabezado Corporativo */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={logoUrl}
                  alt="Logo Empresa"
                  className="h-12 max-w-[170px] object-contain"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    Clínica Limatambo
                  </h1>
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                    Departamento de Tecnologías de la Información & Comunicaciones
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                  {cargoNumero}
                </span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Fecha: {fechaEntrega}
                </p>
              </div>
            </div>

            {/* Título Oficial */}
            <div className="text-center py-1">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                Acta de Asignación y Custodia de Equipo Informático
              </h2>
              <p className="text-[11px] text-slate-500 italic">
                Constancia oficial de entrega de activos tecnológicos de la institución
              </p>
            </div>

            {/* Cuadrícula 1: Datos de Asignación y Destino */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-300">
                1. Datos de la Ubicación y Colaborador Responsable
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sede</span>
                  <span className="font-bold text-slate-800">{sede || 'No especificada'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Departamento</span>
                  <span className="font-bold text-slate-800">{departamento || 'General'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Área / Consultorio</span>
                  <span className="font-bold text-slate-800">{ubicacion || 'General'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsable Receptor</span>
                  <span className="font-bold text-slate-900">{responsable || 'Personal del Área'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DNI / Identificación</span>
                  <span className="font-semibold text-slate-700">{responsableDni || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Entregado por (TI)</span>
                  <span className="font-bold text-blue-700">{tecnico}</span>
                </div>
              </div>
            </div>

            {/* Cuadrícula 2: Datos del Activo */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-300">
                2. Características Técnicas del Equipo Asignado
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Código Patrimonial</span>
                  <span className="font-mono font-black text-blue-900 text-sm">{activo.codigo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo de Activo</span>
                  <span className="font-bold text-slate-800">{activo.tipo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Marca / Fabricante</span>
                  <span className="font-semibold text-slate-800">{activo.marca || 'Genérica'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Modelo</span>
                  <span className="font-semibold text-slate-800">{activo.modelo || 'Estándar'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Número de Serie (S/N)</span>
                  <span className="font-mono text-slate-800 font-semibold">{activo.numeroSerie || 'S/N no registrado'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado Operativo</span>
                  <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {activo.estado === 'DISPONIBLE' ? 'OPERATIVO' : activo.estado || 'OPERATIVO'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha Registro</span>
                  <span className="text-slate-600">
                    {activo.creadoEn ? new Date(activo.creadoEn).toLocaleDateString() : 'Registrado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuadrícula 3: Periféricos y Accesorios Entregados */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-300">
                3. Periféricos y Accesorios Incluidos
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries({
                  cargador: 'Cargador / Fuente',
                  mouse: 'Mouse Óptico USB',
                  teclado: 'Teclado USB',
                  maletin: 'Mochila / Maletín',
                  cableRed: 'Cable Red RJ45',
                  monitor: 'Monitor Adicional',
                  candado: 'Candado / Guaya',
                }).map(([key, label]) => {
                  const isChecked = accesorios[key as keyof typeof accesorios];
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer select-none py-0.5"
                      onClick={() =>
                        setAccesorios((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof accesorios],
                        }))
                      }
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={isChecked ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Observaciones */}
              <div className="px-3 pb-3 border-t border-slate-100 pt-2 text-[11px]">
                <span className="font-bold text-slate-600 block mb-0.5">Observaciones adicionales:</span>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-2.5 py-1 text-slate-700 rounded border border-slate-200 text-xs bg-slate-50/50"
                  placeholder="Detalles sobre software instalado, garantías o estado de entrega..."
                />
              </div>
            </div>

            {/* Cláusula de Custodia y Responsabilidad */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 text-justify leading-relaxed">
              <p className="font-semibold text-slate-700 mb-0.5">Cláusula de Compromiso y Custodia:</p>
              Por medio del presente documento, el colaborador receptor declara haber recibido a su entera conformidad el equipamiento
              informático y periféricos arriba individualizados en óptimo estado físico y de operatividad. Se compromete a destinarlos
              estrictamente para el cumplimiento de sus funciones laborales dentro de la institución, velar por su adecuada custodia y
              reportar inmediatamente a la Mesa de Ayuda de TI cualquier avería, hurto o traslado no autorizado.
            </div>

            {/* Área de Firmas Dobles */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center">
              {/* Firma Técnico */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-20 w-44 flex items-center justify-center">
                  <div className="text-center font-serif text-slate-400 italic text-[11px]">
                    [ Validado por Soporte TI ]
                  </div>
                </div>
                <div className="w-48 border-t-2 border-slate-800 pt-1">
                  <p className="font-bold text-slate-900 text-xs">{tecnico}</p>
                  <p className="text-[10px] text-slate-500 font-medium">ENTREGADO POR (SOPORTE TI)</p>
                </div>
              </div>

              {/* Firma Receptor (Con incrustación digital si existe) */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-20 w-48 flex items-center justify-center">
                  {signatureDataUrl ? (
                    <img
                      src={signatureDataUrl}
                      alt="Firma Digital"
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-300 italic text-[10px]">
                      (Firma manuscrita en físico o digital)
                    </div>
                  )}
                </div>
                <div className="w-48 border-t-2 border-slate-800 pt-1">
                  <p className="font-bold text-slate-900 text-xs">{responsable || 'Usuario Responsable'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    RECIBIDO CONFORME {responsableDni ? `(DNI: ${responsableDni})` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Pie de Página de Validación */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>SISTEMA DE MESA DE AYUDA TI · CLÍNICA LIMATAMBO</span>
              <span>DOCUMENTO OFICIAL AUDITABLE</span>
            </div>
          </div>

          {/* Panel de Firma Digital Táctil / Mouse */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs max-w-[800px] mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  Firma Digital del Receptor (Firma con dedo o mouse en pantalla)
                </span>
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Borrar Firma</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 touch-none">
              <canvas
                ref={canvasRef}
                width={700}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 cursor-crosshair block bg-transparent"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                  ✍️ Dibuja tu firma aquí con el dedo o mouse para estamparla en el cargo...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            El cargo se puede descargar en formato PDF A4 o enviar a la impresora institucional.
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF (A4)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
