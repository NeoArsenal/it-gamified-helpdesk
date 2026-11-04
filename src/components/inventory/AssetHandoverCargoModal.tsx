'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  RotateCcw,
  Undo2,
  CheckCircle2,
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
  Sparkles,
  Smartphone,
  Check,
  ChevronRight,
  Info,
  Shield,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

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

  // Modo de visualización: 'FIRMA' (Tarjeta interactiva móvil) o 'DOCUMENTO' (Vista Acta Oficial A4)
  const [viewTab, setViewTab] = useState<'FIRMA' | 'DOCUMENTO'>('FIRMA');

  // Accesorios incluidos
  const [accesorios, setAccesorios] = useState({
    cargador: true,
    mouse: true,
    teclado: false,
    maletin: false,
    cableRed: false,
    monitor: false,
    candado: false,
  });

  const toggleAccesorio = (key: keyof typeof accesorios) => {
    setAccesorios((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Estado y configuraciones de la firma digital de alta fidelidad
  const [inkColor, setInkColor] = useState<'#1e40af' | '#0f172a'>('#1e40af'); // Azul bolígrafo legal por defecto
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Refs de almacenamiento de trazos vectoriales para suavizado Bezier y Retina
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const lastMidPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);

  // Redibujado completo con curvas Bezier cuadráticas y dinámica de grosor
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resetear matriz de transformación para limpiar el buffer físico completo
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    for (const stroke of strokesRef.current) {
      const { points, color } = stroke;
      if (points.length === 0) continue;

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (points.length === 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (points.length === 2) {
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        continue;
      }

      let lastMid = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      };

      // Unir primer punto al primer punto medio
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(lastMid.x, lastMid.y);
      ctx.stroke();

      for (let i = 1; i < points.length - 1; i++) {
        const pCurrent = points[i];
        const pNext = points[i + 1];
        const nextMid = {
          x: (pCurrent.x + pNext.x) / 2,
          y: (pCurrent.y + pNext.y) / 2,
        };

        const dist = Math.hypot(nextMid.x - lastMid.x, nextMid.y - lastMid.y);
        const timeDiff = Math.max(1, pNext.time - pCurrent.time);
        const speed = dist / timeDiff;
        // Grosor variable según velocidad: trazo fluido caligráfico de 1.8px a 3.2px
        const width = Math.max(1.8, Math.min(3.2, 3.1 - speed * 0.4));

        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(lastMid.x, lastMid.y);
        ctx.quadraticCurveTo(pCurrent.x, pCurrent.y, nextMid.x, nextMid.y);
        ctx.stroke();

        lastMid = nextMid;
      }

      // Unir al último punto
      const lastP = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastMid.x, lastMid.y);
      ctx.lineTo(lastP.x, lastP.y);
      ctx.stroke();
    }
  }, []);

  // Sincronizar el canvas con la vista previa del cargo impreso
  const syncSignatureToDocument = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  }, []);

  // Inicializar o redimensionar canvas en resolución Retina 2x/3x
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = Math.max(160, Math.floor(rect.height || 180));
    const dpr = Math.max(2, window.devicePixelRatio || 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawCanvas();
  }, [redrawCanvas]);

  // Limpiar completamente la firma
  const clearCanvas = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    lastMidPointRef.current = null;
    isDrawingRef.current = false;
    setStrokeCount(0);
    setHasSignature(false);
    setSignatureDataUrl(null);
    redrawCanvas();
  }, [redrawCanvas]);

  // Deshacer el último trazo
  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    const count = strokesRef.current.length;
    setStrokeCount(count);
    redrawCanvas();
    if (count === 0) {
      setHasSignature(false);
      setSignatureDataUrl(null);
    } else {
      syncSignatureToDocument();
    }
  }, [redrawCanvas, syncSignatureToDocument]);

  // Configurar observador de resize y apertura del modal
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, [isOpen, initCanvas]);

  // Re-inicializar canvas al cambiar a pestaña FIRMA
  useEffect(() => {
    if (isOpen && viewTab === 'FIRMA') {
      const timer = setTimeout(initCanvas, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, viewTab, initCanvas]);

  // Inicializar datos al abrir modal
  useEffect(() => {
    if (isOpen && activo) {
      setViewTab('FIRMA');
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
  }, [isOpen, activo, defaultSede, defaultDepto, defaultUbicacion, defaultResponsable, propTecnico, user, clearCanvas]);

  // Coordenadas precisas 1:1 en píxeles CSS
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
    };
  };

  // Manejadores Pointer Events de alta precisión para pantalla táctil y mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const pt = getCanvasCoords(e);
    isDrawingRef.current = true;
    currentStrokeRef.current = [pt];
    lastMidPointRef.current = { x: pt.x, y: pt.y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasCoords(e);
    const stroke = currentStrokeRef.current;
    if (stroke.length === 0) return;

    const p0 = stroke[stroke.length - 1];
    const dist = Math.hypot(pt.x - p0.x, pt.y - p0.y);
    if (dist < 1.2) return; // Filtrar ruido o microvibración

    stroke.push(pt);

    const midX = (p0.x + pt.x) / 2;
    const midY = (p0.y + pt.y) / 2;

    const timeDiff = Math.max(1, pt.time - p0.time);
    const speed = dist / timeDiff;
    const width = Math.max(1.8, Math.min(3.3, 3.1 - speed * 0.4));

    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;

    if (lastMidPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
      ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      ctx.stroke();
    }

    lastMidPointRef.current = { x: midX, y: midY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const ctx = canvas.getContext('2d');
      if (ctx && lastMidPointRef.current && currentStrokeRef.current.length > 0) {
        const lastP = currentStrokeRef.current[currentStrokeRef.current.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
        ctx.lineTo(lastP.x, lastP.y);
        ctx.stroke();
      }
    }

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push({
        points: [...currentStrokeRef.current],
        color: inkColor,
      });
      currentStrokeRef.current = [];
      setHasSignature(true);
      setStrokeCount(strokesRef.current.length);
      syncSignatureToDocument();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(e);
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
      alert('No se pudo inicializar la vista de impresión.');
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 bg-slate-50 sm:bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Barra Superior de Control */}
        <div className="p-3 sm:p-4 border-b border-slate-200/90 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-base tracking-tight truncate">
                  Entrega de Equipo
                </h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-mono bg-blue-100/80 text-blue-800 font-bold shrink-0">
                  {cargoNumero}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
                Custodia de activos TI con firma digital manuscrita y exportación en PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className="hidden sm:flex px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cambiar el logo corporativo del cargo"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Logo</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Imprimir directamente a papel"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Generando...' : 'Descargar PDF (A4)'}</span>
              <span className="sm:hidden">{isGeneratingPdf ? '...' : 'PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Pestañas: Modo Firma Rápida vs Hoja A4 */}
        <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200/80 shrink-0">
          <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => setViewTab('FIRMA')}
              className={cn(
                "flex-1 py-1.5 sm:py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer",
                viewTab === 'FIRMA'
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span>Entrega y Firma</span>
              {hasSignature && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setViewTab('DOCUMENTO')}
              className={cn(
                "flex-1 py-1.5 sm:py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer",
                viewTab === 'DOCUMENTO'
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Acta Oficial A4</span>
            </button>
          </div>
        </div>

        {/* Contenedor Principal con Scroll */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/70 sm:bg-slate-100/80 space-y-4">
          
          {/* ========================================================= */}
          {/* VISTA 1: MODO ENTREGA DIGITAL Y FIRMA TÁCTIL (MÓVIL-FIRST) */}
          {/* ========================================================= */}
          {viewTab === 'FIRMA' && (
            <div className="max-w-xl mx-auto space-y-3.5 animate-in fade-in duration-150">
              
              {/* Tarjeta 1: Datos Clave del Equipo Asignado */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-blue-900 text-sm sm:text-base">
                          {activo.codigo}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {activo.estado === 'DISPONIBLE' ? 'OPERATIVO' : activo.estado || 'OPERATIVO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold">
                        {activo.marca || 'Genérica'} {activo.modelo || ''} · <span className="text-slate-500 font-normal">{activo.tipo}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                    S/N: {activo.numeroSerie || 'No especificado'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" /> Sede y Área
                    </span>
                    <span className="font-semibold text-slate-800 block truncate">
                      {sede} · {departamento}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Receptor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {responsable || 'Personal del Área'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Datos Rápidos de Validación (DNI y Técnico) */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DNI / Carnet del Receptor *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 47891234"
                      value={responsableDni}
                      onChange={(e) => setResponsableDni(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Técnico TI que Entrega</label>
                  <div className="relative">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={tecnico}
                      onChange={(e) => setTecnico(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Checklist de Accesorios Táctiles (Touch-Friendly) */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    Accesorios y Periféricos Entregados
                  </span>
                  <span className="text-[10px] text-slate-400">Toca para marcar</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'cargador', label: 'Cargador / Fuente', emoji: '🔌' },
                    { key: 'mouse', label: 'Mouse USB', emoji: '🖱️' },
                    { key: 'teclado', label: 'Teclado USB', emoji: '⌨️' },
                    { key: 'maletin', label: 'Mochila / Maletín', emoji: '🎒' },
                    { key: 'cableRed', label: 'Cable Red RJ45', emoji: '🌐' },
                    { key: 'monitor', label: 'Monitor Adicional', emoji: '🖥️' },
                    { key: 'candado', label: 'Candado / Guaya', emoji: '🔒' },
                  ].map(({ key, label, emoji }) => {
                    const isChecked = accesorios[key as keyof typeof accesorios];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAccesorio(key as keyof typeof accesorios)}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-left active:scale-98 select-none",
                          isChecked
                            ? "bg-blue-50/90 border-blue-300 text-blue-900 shadow-2xs font-bold"
                            : "bg-slate-50/60 border-slate-200 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{emoji}</span>
                          <span className="truncate">{label}</span>
                        </span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Observaciones adicionales sobre el estado..."
                    className="w-full px-3 py-1.5 text-xs text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Tarjeta 4: Pad de Firma Táctil Caligráfico */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 text-xs">
                      Firma Digital del Colaborador
                    </span>
                    {hasSignature && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Registrada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    {/* Selector de Tinta */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-1">
                      <button
                        type="button"
                        onClick={() => setInkColor('#1e40af')}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",
                          inkColor === '#1e40af' ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600"
                        )}
                      >
                        Azul
                      </button>
                      <button
                        type="button"
                        onClick={() => setInkColor('#0f172a')}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",
                          inkColor === '#0f172a' ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600"
                        )}
                      >
                        Negro
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={strokeCount === 0}
                      className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Deshacer</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearCanvas}
                      disabled={!hasSignature}
                      className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar</span>
                    </button>
                  </div>
                </div>

                {/* Canvas de Firma Táctil */}
                <div className="relative border-2 border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner touch-none select-none">
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{ touchAction: 'none' }}
                    className="w-full h-44 sm:h-52 cursor-crosshair block bg-transparent relative z-10"
                  />

                  {/* Guía Visual con Línea de Firma */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 z-0">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Dibuja tu firma con el dedo</span>
                      <span className="font-mono">100% Sin Papel</span>
                    </div>

                    <div className="w-full border-b border-dashed border-slate-300 pb-1 mb-2 flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1 font-serif text-xs italic">
                        <span className="font-bold text-slate-500 text-sm">X</span>
                        <span>Firma aquí sobre la línea</span>
                      </div>
                      {!hasSignature && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          (Dedo o stylus)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta 5: Cláusula de Custodia Resumida */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-[11px] text-slate-700 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  El colaborador receptor declara recibir a conformidad el equipo y accesorios detallados para uso laboral exclusivo institucional dentro de Clínica Limatambo.
                </p>
              </div>

              {/* Botón para ver el Acta A4 Oficial */}
              <button
                type="button"
                onClick={() => setViewTab('DOCUMENTO')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Acta Oficial A4 con firma estampada</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 2: ACTA OFICIAL A4 COMPLETA CON VISTA PREVIA        */}
          {/* (Permanece en el DOM para generar el PDF aunque esté oculta)*/}
          {/* ========================================================= */}
          <div
            className={cn(
              viewTab === 'FIRMA'
                ? "absolute -left-[9999px] top-0 opacity-0 pointer-events-none"
                : "block animate-in fade-in duration-150"
            )}
          >
            {/* Barra de Herramientas del Documento A4 */}
            {viewTab === 'DOCUMENTO' && (
              <div className="max-w-[800px] mx-auto mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewTab('FIRMA')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  <span>Volver a Firma</span>
                </button>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cambiar Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Envoltorio con scroll horizontal suave para dispositivos móviles */}
            <div className="overflow-x-auto pb-6">
              <div
                ref={printRef}
                className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-md max-w-[800px] mx-auto text-slate-800 font-sans text-xs sm:text-[13px] leading-relaxed space-y-5"
                style={{ minWidth: '650px', minHeight: '850px' }}
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

                {/* Cuadrícula 1: Datos de la Ubicación y Colaborador Responsable */}
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
                          onClick={() => toggleAccesorio(key as keyof typeof accesorios)}
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

                  {/* Firma Receptor (Con incrustación digital) */}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {viewTab === 'FIRMA' ? (
              <button
                type="button"
                onClick={() => setViewTab('DOCUMENTO')}
                className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Hoja A4</span>
                <span className="sm:hidden">Ver A4</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewTab('FIRMA')}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-blue-600" />
                <span>Editar Firma</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 sm:px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generando...' : 'Descargar PDF (A4)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
