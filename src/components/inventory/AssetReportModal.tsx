import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, X, Printer, FileSpreadsheet, Eye, Filter, 
  Calendar, CheckCircle2, AlertTriangle, ShieldCheck, 
  Trash2, Building2, Laptop, Layers, Download, Check, Sparkles
} from 'lucide-react';
import { getDeviceIcon, getEstadoBadge } from './inventory.utils';
import { parseUtcDate } from './timeline.utils';
import { exportActivosToExcel } from '@/lib/export-utils';
import { toast } from 'sonner';

interface AssetReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activos: any[];
  sedesList: string[];
  tiposDisponibles: string[];
}

export function AssetReportModal({
  isOpen,
  onClose,
  activos,
  sedesList,
  tiposDisponibles,
}: AssetReportModalProps) {
  // Filtros del Reporte
  const [reportType, setReportType] = useState<'PADRON' | 'TRAZABILIDAD'>('PADRON');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterFechaRegularizada, setFilterFechaRegularizada] = useState<'TODAS' | 'CON_FECHA' | 'SIN_FECHA'>('TODAS');

  const reportSheetRef = useRef<HTMLDivElement>(null);

  // Fecha y hora del reporte actual
  const fechaReporteActual = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  // Filtrado de Activos para el reporte
  const filteredReportActivos = useMemo(() => {
    return activos.filter((a) => {
      // Filtro por Tipo de equipo
      if (filterTipo !== 'TODOS') {
        const t = (a.tipo || '').toLowerCase();
        const f = filterTipo.toLowerCase();
        if (!t.includes(f) && !f.includes(t)) return false;
      }

      // Filtro por Sede
      if (filterSede !== 'TODAS') {
        const s = (a.sede || '').toLowerCase();
        if (s !== filterSede.toLowerCase()) return false;
      }

      // Filtro por Estado
      if (filterEstado !== 'TODOS') {
        const e = (a.estado || 'OPERATIVO').toUpperCase();
        if (e !== filterEstado.toUpperCase()) return false;
      }

      // Filtro por Fechas Regularizadas
      if (filterFechaRegularizada === 'CON_FECHA' && !a.fechaIngreso) return false;
      if (filterFechaRegularizada === 'SIN_FECHA' && !!a.fechaIngreso) return false;

      return true;
    });
  }, [activos, filterTipo, filterSede, filterEstado, filterFechaRegularizada]);

  // Lista plana de intervenciones para el reporte de Trazabilidad
  const filteredTrazabilidadItems = useMemo(() => {
    if (reportType !== 'TRAZABILIDAD') return [];
    const items: any[] = [];
    filteredReportActivos.forEach((a) => {
      if (a.intervenciones && a.intervenciones.length > 0) {
        a.intervenciones.forEach((interv: any) => {
          items.push({
            ...interv,
            codigoActivo: a.codigo,
            tipoActivo: a.tipo,
            marcaActivo: a.marca,
            modeloActivo: a.modelo,
            sedeActivo: a.sede,
            responsableActivo: a.responsable,
          });
        });
      }
    });
    // Ordenar de más reciente a más antiguo
    return items.sort((x, y) => new Date(y.fecha).getTime() - new Date(x.fecha).getTime());
  }, [filteredReportActivos, reportType]);

  // Métricas del Reporte
  const totalFiltrados = filteredReportActivos.length;
  const countOperativos = filteredReportActivos.filter(a => a.estado === 'OPERATIVO' || !a.estado).length;
  const countTaller = filteredReportActivos.filter(a => a.estado === 'REPARACION').length;
  const countBajas = filteredReportActivos.filter(a => a.estado === 'BAJA').length;
  const countConFecha = filteredReportActivos.filter(a => !!a.fechaIngreso).length;
  const countSinFecha = totalFiltrados - countConFecha;
  const pctConFecha = totalFiltrados > 0 ? Math.round((countConFecha / totalFiltrados) * 100) : 0;

  if (!isOpen) return null;

  // Imprimir reporte oficial en ventana aislada (A4 Landscape)
  const handleImprimir = () => {
    const sheetElement = reportSheetRef.current;
    if (!sheetElement) {
      toast.error('No se pudo encontrar la hoja del reporte para imprimir.');
      return;
    }

    if (filteredReportActivos.length === 0) {
      toast.error('No hay registros para imprimir con los filtros seleccionados.');
      return;
    }

    // Abrir nueva ventana/pestaña limpia para aislar la hoja A4 sin elementos del dashboard
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('El navegador bloqueó la ventana de impresión. Por favor habilita los popups para este sitio.');
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    const tituloDoc = reportType === 'PADRON' 
      ? `Reporte_Equipos_${filterTipo}_${filterSede}`.replace(/[\s/]+/g, '_')
      : `Historial_Trazabilidad_${filterTipo}_${filterSede}`.replace(/[\s/]+/g, '_');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <base href="${origin}/">
          <title>${tituloDoc} - Clínicas Limatambo</title>
          ${styleTags}
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm 10mm 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
              color: #0f172a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            @media screen {
              body {
                padding: 20px 24px 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
              }
              .no-print-bar {
                position: sticky;
                top: 12px;
                z-index: 999;
                background: #0f172a;
                color: #ffffff;
                padding: 10px 24px;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
                margin-bottom: 24px;
                font-size: 13px;
                font-weight: 600;
              }
              .btn-print {
                background: #2563eb;
                color: #ffffff;
                border: none;
                padding: 7px 18px;
                border-radius: 9999px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                transition: background 0.2s;
              }
              .btn-print:hover { background: #1d4ed8; }
              .btn-close {
                background: transparent;
                color: #94a3b8;
                border: none;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
              }
              .btn-close:hover { color: #ffffff; }
              .report-sheet-container {
                background: #ffffff;
                box-shadow: 0 4px 25px rgba(0,0,0,0.08);
                border-radius: 12px;
                max-width: 1100px;
                width: 100%;
                padding: 24px 32px;
                border: 1px solid #e2e8f0;
              }
            }
            @media print {
              .no-print-bar {
                display: none !important;
              }
              body {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .report-sheet-container {
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <span>📄 ${tituloDoc} · Vista de Impresión Oficial (A4 Horizontal)</span>
            <button class="btn-print" onclick="window.print()">
              🖨️ Imprimir / Guardar como PDF
            </button>
            <button class="btn-close" onclick="window.close()">
              ✕ Cerrar Pestaña
            </button>
          </div>
          <div class="report-sheet-container">
            ${sheetElement.innerHTML}
          </div>
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Exportar a Excel con filtros exactos
  const handleExportarExcel = () => {
    if (filteredReportActivos.length === 0) {
      toast.error('No hay registros para exportar con los filtros seleccionados.');
      return;
    }
    const slugTipo = filterTipo === 'TODOS' ? 'todos' : filterTipo.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const slugSede = filterSede === 'TODAS' ? 'todas' : filterSede.toLowerCase().replace(/[^a-z0-9]/g, '_');
    exportActivosToExcel(filteredReportActivos, `reporte_equipos_${slugTipo}_${slugSede}`);
    toast.success(`Se exportaron ${filteredReportActivos.length} registros a Excel.`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Fondo cerrable */}
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      {/* Contenedor Modal */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* ========================================================================= */}
        {/* 1. HEADER MODAL (Se oculta al imprimir) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
                  Generador de Reportes de Inventario
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Clínicas Limatambo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Filtra por tipo, sede y estado para emitir reportes formales, imprimir o exportar a Excel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportarExcel}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Descargar datos filtrados a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              type="button"
              onClick={handleImprimir}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-slate-900/10 active:scale-95"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BARRA DE FILTROS (Se oculta al imprimir) */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0 text-xs print:hidden">
          {/* Filtro: Tipo de Reporte */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="PADRON">📋 Padrón de Equipos</option>
              <option value="TRAZABILIDAD">⏱️ Historial de Trazabilidad</option>
            </select>
          </div>

          {/* Filtro: Tipo de Equipo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Tipo de Dispositivo
            </label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los tipos</option>
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Sede */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Sede / Clínica
            </label>
            <select
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="TODAS">Todas las sedes</option>
              {sedesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Estado */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Estado de Operación
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="OPERATIVO">🟢 Solo Operativos</option>
              <option value="REPARACION">🟡 En Taller</option>
              <option value="BAJA">🔴 Bajas / Chatarra</option>
              <option value="RESCATADO">♻️ Rescatados</option>
            </select>
          </div>

          {/* Filtro: Fechas de Regularización */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Auditoría de Fechas
            </label>
            <select
              value={filterFechaRegularizada}
              onChange={(e) => setFilterFechaRegularizada(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="TODAS">Todas (con o sin fecha)</option>
              <option value="CON_FECHA">✅ Con fecha conocida</option>
              <option value="SIN_FECHA">⚠️ Sin fecha / Por regularizar</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BARRA DE MÉTRICAS / KPIS DEL REPORTE (Se oculta al imprimir) */}
        {/* ========================================================================= */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-800">
              Registros encontrados: <strong className="text-indigo-600 font-extrabold">{totalFiltrados}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-emerald-700 font-medium">
              Operativos: <strong>{countOperativos}</strong>
            </span>
            {countTaller > 0 && (
              <span className="text-amber-700 font-medium">
                En Taller: <strong>{countTaller}</strong>
              </span>
            )}
            {countBajas > 0 && (
              <span className="text-rose-700 font-medium">
                Bajas: <strong>{countBajas}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Cobertura de Fechas:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
              pctConFecha >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {countConFecha} de {totalFiltrados} ({pctConFecha}%)
            </span>
            {countSinFecha > 0 && (
              <span className="text-[11px] text-amber-700 font-semibold" title="Equipos con fecha de ingreso pendiente">
                ({countSinFecha} por regularizar)
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. ÁREA DEL REPORTE IMPRIMIBLE / VISTA PREVIA (Estilo Hoja A4) */}
        {/* ========================================================================= */}
        <div 
          className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible"
        >
          {/* Contenedor Hoja Formal */}
          <div 
            ref={reportSheetRef}
            id="reporte-oficial-limatambo-sheet"
            className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 min-w-[760px] mx-auto print:border-none print:shadow-none print:p-0 print:min-w-0 print:rounded-none"
          >
            
            {/* ENCABEZADO INSTITUCIONAL */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/logo-limatambo.png"
                    alt="Logo Clínicas Limatambo"
                    className="h-10 sm:h-12 w-auto object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      CLÍNICAS LIMATAMBO
                    </h1>
                    <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Departamento de Tecnologías de la Información y Comunicaciones
                    </h2>
                  </div>
                </div>
                <div className="text-right text-xs shrink-0">
                  <span className="font-mono font-bold text-slate-800 block text-sm">
                    {fechaReporteActual}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Documento Oficial de Auditoría
                  </span>
                </div>
              </div>

              {/* Título y Criterios de Filtrado */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Título del Reporte
                  </span>
                  <strong className="text-slate-900 text-sm">
                    {reportType === 'PADRON' ? 'Reporte Oficial de Equipos e Inventario' : 'Historial de Trazabilidad y Movimientos Técnicos'}
                  </strong>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-700">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Tipo: <strong>{filterTipo}</strong>
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Sede: <strong>{filterSede}</strong>
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Estado: <strong>{filterEstado}</strong>
                  </span>
                  <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                    Total: {totalFiltrados}
                  </span>
                </div>
              </div>
            </div>

            {/* CUERPO DEL REPORTE SEGÚN EL TIPO SELECCIONADO */}
            {reportType === 'PADRON' ? (
              /* TABLA: PADRÓN GENERAL DE EQUIPOS */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-2">Código</th>
                      <th className="py-2.5 px-2">Tipo</th>
                      <th className="py-2.5 px-2">Marca & Modelo</th>
                      <th className="py-2.5 px-2">N° Serie (S/N)</th>
                      <th className="py-2.5 px-2">Factura</th>
                      <th className="py-2.5 px-2">Sede / Área</th>
                      <th className="py-2.5 px-2">Custodio</th>
                      <th className="py-2.5 px-2">Estado</th>
                      <th className="py-2.5 px-2 text-center">F. Ingreso</th>
                      <th className="py-2.5 px-2 text-center">F. Baja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredReportActivos.map((a, idx) => {
                      const fechaIngresoStr = a.fechaIngreso 
                        ? parseUtcDate(a.fechaIngreso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : null;
                      const fechaBajaStr = a.fechaBaja 
                        ? parseUtcDate(a.fechaBaja).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : null;

                      return (
                        <tr key={a.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-2 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {a.codigo}
                          </td>
                          <td className="py-2 px-2 font-semibold text-slate-800 whitespace-nowrap">
                            {a.tipo}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            <span className="font-bold">{a.marca || '—'}</span> {a.modelo || ''}
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-600">
                            {a.numeroSerie || <span className="text-slate-300">S/N</span>}
                          </td>
                          <td className="py-2 px-2 font-mono text-indigo-700 font-semibold">
                            {a.codigoFactura || <span className="text-slate-300">S/N</span>}
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-bold text-slate-800 block">{a.sede || 'Almacén TI'}</span>
                            <span className="text-[10px] text-slate-400 block">{a.departamento || a.ubicacion || 'General'}</span>
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {a.estado === 'REPARACION' ? (
                              <div>
                                <span className="font-bold text-amber-800 block text-[10px]">Taller TI</span>
                                {a.responsable && <span className="text-[9px] text-slate-400 block">(Último: {a.responsable})</span>}
                              </div>
                            ) : a.estado === 'BAJA' ? (
                              <div>
                                <span className="font-bold text-rose-700 block text-[10px]">Retirado</span>
                                {a.responsable && <span className="text-[9px] text-slate-400 block line-through">({a.responsable})</span>}
                              </div>
                            ) : (
                              a.responsable || <span className="text-slate-300 italic">Sin asignar</span>
                            )}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.estado === 'OPERATIVO' || !a.estado
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : a.estado === 'REPARACION'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : a.estado === 'BAJA'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {a.estado || 'OPERATIVO'}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-mono text-center whitespace-nowrap">
                            {fechaIngresoStr ? (
                              <span className="font-semibold text-slate-800">{fechaIngresoStr}</span>
                            ) : (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-normal">
                                No especificada
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono text-center whitespace-nowrap">
                            {fechaBajaStr ? (
                              <span className="font-bold text-rose-700">{fechaBajaStr}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredReportActivos.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                          No se encontraron equipos que coincidan con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABLA: TRAZABILIDAD E HISTORIAL TÉCNICO */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-2">Fecha y Hora</th>
                      <th className="py-2.5 px-2">Código</th>
                      <th className="py-2.5 px-2">Dispositivo</th>
                      <th className="py-2.5 px-2">Sede / Custodio</th>
                      <th className="py-2.5 px-2">Detalle de la Intervención / Movimiento</th>
                      <th className="py-2.5 px-2">Técnico TI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredTrazabilidadItems.map((item, idx) => {
                      const fechaStr = parseUtcDate(item.fecha).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-2 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                            {fechaStr}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-indigo-700 whitespace-nowrap">
                            {item.codigoActivo}
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-bold text-slate-800 block">{item.tipoActivo}</span>
                            <span className="text-[10px] text-slate-500 block">{item.marcaActivo} {item.modeloActivo}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-semibold text-slate-800 block">{item.sedeActivo || 'Almacén'}</span>
                            <span className="text-[10px] text-slate-400 block">{item.responsableActivo || 'Sin custodio'}</span>
                          </td>
                          <td className="py-2 px-2 text-slate-800 leading-relaxed max-w-md">
                            {item.descripcion}
                          </td>
                          <td className="py-2 px-2 font-semibold text-slate-700 whitespace-nowrap">
                            {item.tecnicoNombre || 'Sistema TI'}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTrazabilidadItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                          No hay hitos de trazabilidad registrados para los equipos filtrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PIE DEL REPORTE Y FIRMA INSTITUCIONAL */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-end justify-between gap-6 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">Resumen de Control:</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Total de activos inventariados: <strong>{totalFiltrados}</strong> | Con fecha exacta: <strong>{countConFecha}</strong> | Por regularizar: <strong>{countSinFecha}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Sistema de Mesa de Ayuda y Gestión de Operaciones TI · Clínicas Limatambo
                </p>
              </div>

              <div className="text-center w-56 pt-8 border-t border-slate-400">
                <span className="block font-bold text-slate-800 text-xs">Área de Sistemas e Infraestructura</span>
                <span className="block text-[10px] text-slate-400">Firma y Sello de Conformidad</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. FOOTER DEL MODAL */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 print:hidden text-xs">
          <span className="text-slate-500 hidden sm:inline">
            Consejo: Al hacer clic en <strong>Imprimir / PDF</strong>, selecciona la orientación <em>Horizontal (Landscape)</em> en tu navegador para una lectura óptima.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors ml-auto cursor-pointer"
          >
            Cerrar Reporte
          </button>
        </div>

      </div>
    </div>
  );
}
