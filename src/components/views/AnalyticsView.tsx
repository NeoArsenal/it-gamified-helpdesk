import { useEffect, useState, useRef, useMemo } from 'react';
import { getTicketsAnalytics, getActivos } from '@/services/api/api-client';
import { 
  Activity, Clock, Download, Ticket, BarChart3, PieChart as PieChartIcon, 
  Grid, Building2, Globe, CheckCircle2, ChevronRight, Laptop, 
  Layers, ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { cn } from '@/lib/utils';

export function AnalyticsView({ userId }: { userId?: string }) {
  const [data, setData] = useState<any>(null);
  const [activos, setActivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSede, setSelectedSede] = useState<string>('TODAS');
  const [chartType, setChartType] = useState<'heatmap' | 'bar' | 'pie'>('heatmap');
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchAnalytics = async (sede: string = selectedSede) => {
    setIsUpdating(true);
    try {
      const [res, activosRes] = await Promise.all([
        getTicketsAnalytics(sede),
        getActivos().catch(() => [])
      ]);
      setData(res);
      setActivos(activosRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedSede);
  }, [selectedSede]);

  // Sedes disponibles combinando backend tickets y activos
  const sedesDisponibles = useMemo(() => {
    const list = new Set<string>();
    if (data?.sedesDisponibles) {
      data.sedesDisponibles.forEach((s: string) => list.add(s));
    }
    activos.forEach(a => {
      if (a.sede) list.add(a.sede);
    });
    if (list.size === 0) {
      list.add('Clínica');
      list.add('Tower 1');
    }
    return Array.from(list);
  }, [data?.sedesDisponibles, activos]);

  // Activos filtrados para la métrica de cruce de salud técnica
  const activosFiltrados = useMemo(() => {
    if (selectedSede === 'TODAS') return activos;
    return activos.filter(a => (a.sede || '').toLowerCase() === selectedSede.toLowerCase());
  }, [activos, selectedSede]);

  const countActivosOperativos = activosFiltrados.filter(a => a.estado === 'OPERATIVO' || !a.estado).length;
  const countActivosTaller = activosFiltrados.filter(a => a.estado === 'REPARACION').length;

  const exportPDF = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      if (!reportRef.current) return;
      
      const imgData = await toPng(reportRef.current, {
        quality: 1.0,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = selectedSede === 'TODAS'
        ? 'Reporte_Analitica_TI_Corporativo.pdf'
        : `Reporte_Analitica_TI_${selectedSede.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Hubo un error al exportar a PDF.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-slate-400 gap-3">
        <Activity className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Cargando métricas y analítica multisede...</p>
      </div>
    );
  }

  // Función para obtener la intensidad de color en el Heatmap
  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-slate-50 border-slate-100 text-slate-300';
    if (value <= 2) return 'bg-amber-100 border-amber-200 text-amber-700';
    if (value <= 5) return 'bg-orange-300 border-orange-400 text-orange-900';
    if (value <= 10) return 'bg-red-400 border-red-500 text-white font-bold';
    return 'bg-red-600 border-red-700 text-white font-black'; // Más de 10 = Crítico
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col overflow-y-auto animate-in fade-in duration-300">
      
      {/* 1. Header Principal y Botón Exportar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-indigo-600" /> Analítica y SLAs
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Métricas de rendimiento operativo, focos de fallas y benchmark multisede.
          </p>
        </div>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" /> Exportar Reporte PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-6 bg-slate-50 p-5 md:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
        
        {/* Cabecera contextual para el PDF impreso */}
        <div className="hidden pdf-header mb-4 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Reporte Ejecutivo de TI {selectedSede === 'TODAS' ? '· Consolidado Corporativo' : `· Sede ${selectedSede}`}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Generado automáticamente por el Sistema de Mesa de Ayuda
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-bold text-slate-700">Fecha de Emisión</p>
              <p>{new Date().toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* 2. Selector de Alcance por Sede (Barra de Control Rápido) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Filtro de Alcance Operativo</p>
              <p className="text-[11px] text-slate-500">
                {selectedSede === 'TODAS' 
                  ? 'Visualizando consolidado corporativo de todas las sedes' 
                  : `Focalizado exclusivamente en la operación de Sede ${selectedSede}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSede('TODAS')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                selectedSede === 'TODAS'
                  ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Todas las Sedes</span>
              {data?.totalTicketsGlobal !== undefined && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold", 
                  selectedSede === 'TODAS' ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                )}>
                  {data.totalTicketsGlobal}
                </span>
              )}
            </button>

            {sedesDisponibles.map(s => {
              const infoSede = data?.porSede?.find((p: any) => p.sede.toLowerCase() === s.toLowerCase());
              const countSede = infoSede ? infoSede.total : 0;
              const isSelected = selectedSede === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSede(s)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                    isSelected
                      ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  )}
                >
                  <Building2 className={cn("w-3.5 h-3.5", isSelected ? "text-indigo-600" : "text-slate-400")} />
                  <span>{s}</span>
                  {countSede > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold", 
                      isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                    )}>
                      {countSede}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Tarjetas KPI Dinámicas (con soporte de cruce de inventario) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Volumen de Tickets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate">
                {selectedSede === 'TODAS' ? 'Total Tickets Corporativos' : `Tickets Sede ${selectedSede}`}
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {data?.totalTickets || 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {selectedSede !== 'TODAS' && data?.totalTicketsGlobal > 0
                  ? `${Math.round((data.totalTickets / data.totalTicketsGlobal) * 100)}% del volumen total`
                  : 'Acumulado histórico total'}
              </p>
            </div>
          </div>
          
          {/* KPI 2: Resueltos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate">Tickets Resueltos</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {data?.resueltosCount || 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5 truncate">
                {data?.totalTickets > 0 
                  ? `${Math.round((data.resueltosCount / data.totalTickets) * 100)}% de efectividad`
                  : 'Sin incidencias'}
              </p>
            </div>
          </div>

          {/* KPI 3: SLA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate">SLA Promedio</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {data?.promedioSLADias ? (data.promedioSLADias * 24).toFixed(1) : 0} <span className="text-xs font-normal text-slate-400">h</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">Tiempo prom. de resolución</p>
            </div>
          </div>

          {/* KPI 4: Cruce de Inventario */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate">
                {selectedSede === 'TODAS' ? 'Equipos Corporativos' : `Equipos en ${selectedSede}`}
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {activosFiltrados.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                <span className="text-emerald-600 font-bold">{countActivosOperativos} op.</span>
                {countActivosTaller > 0 && (
                  <span className="text-amber-600 font-bold ml-1.5">· {countActivosTaller} taller</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Panel de Benchmark Comparativo entre Sedes (Visible siempre para comparar) */}
        {data?.porSede && data.porSede.length > 0 && (
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Comparativa y Benchmark entre Sedes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribución de carga de trabajo, tiempos de resolución y criticidad por sede. Haz clic en una sede para enfocar el análisis.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {data.porSede.length} Sedes con Actividad
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.porSede.map((item: any) => {
                const pctTotal = data.totalTicketsGlobal > 0 ? Math.round((item.total / data.totalTicketsGlobal) * 100) : 0;
                const isSelected = selectedSede.toLowerCase() === item.sede.toLowerCase();
                return (
                  <div
                    key={item.sede}
                    onClick={() => setSelectedSede(item.sede)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md group relative",
                      isSelected
                        ? "bg-indigo-50/60 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-slate-50/60 hover:bg-white border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-2xs",
                          isSelected ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-indigo-600"
                        )}>
                          {item.sede.slice(0, 2).toUpperCase()}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                          {item.sede}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full border border-indigo-200/80">
                        {item.total} tickets ({pctTotal}%)
                      </span>
                    </div>

                    {/* Barra de progreso de volumen sobre total corporativo */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pctTotal}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                      <div>
                        <p className="text-slate-400 font-medium">Resueltos</p>
                        <p className="font-bold text-emerald-600">{item.resueltos} ({item.porcentajeResolucion}%)</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">SLA Promedio</p>
                        <p className="font-bold text-purple-600">{item.promedioSLAHoras}h</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Críticos/Alta</p>
                        <p className={cn("font-bold", item.criticos > 0 ? "text-rose-600" : "text-slate-600")}>
                          {item.criticos}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 text-right">
                      <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center justify-end gap-0.5">
                        {isSelected ? 'Sede seleccionada' : 'Filtrar esta sede'} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Selector de Gráficos y Visualización de Incidencias */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Incidencias por Área y Prioridad
                {selectedSede !== 'TODAS' && (
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Sede: {selectedSede}
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedSede === 'TODAS'
                  ? 'Matriz corporativa consolidada de todos los departamentos en la empresa.'
                  : `Focalizado exclusivamente en los departamentos activos de Sede ${selectedSede}.`}
              </p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              <button 
                onClick={() => setChartType('heatmap')}
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${chartType === 'heatmap' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Grid className="w-3.5 h-3.5" /> Matriz
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${chartType === 'bar' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Barras
              </button>
              <button 
                onClick={() => setChartType('pie')}
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${chartType === 'pie' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <PieChartIcon className="w-3.5 h-3.5" /> Circular
              </button>
            </div>
          </div>
          
          {data?.heatmapDept && data.heatmapDept.length > 0 ? (
            <div className="w-full">
              
              {/* Heatmap / Matriz Adaptativa */}
              {chartType === 'heatmap' && (
                <div className="min-w-[600px] overflow-x-auto custom-scrollbar">
                  {/* Encabezados */}
                  <div className="grid grid-cols-5 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="text-left pl-2">Departamento</div>
                    <div>Baja</div>
                    <div>Media</div>
                    <div>Alta</div>
                    <div>Crítica</div>
                  </div>

                  {/* Filas */}
                  <div className="space-y-2">
                    {data.heatmapDept.map((row: any) => (
                      <div key={row.departamento} className="grid grid-cols-5 gap-2 items-center">
                        <div className="font-bold text-slate-700 text-sm truncate pl-2" title={row.departamento}>
                          {row.departamento} <span className="text-xs text-slate-400 font-normal">({row.total})</span>
                        </div>

                        {['BAJA', 'MEDIA', 'ALTA', 'CRITICA'].map((prio) => (
                          <div 
                            key={prio}
                            className={`h-11 rounded-xl border flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-105 shadow-2xs ${getHeatmapColor(row[prio])}`}
                            title={`${row.departamento} - ${prio}: ${row[prio]} tickets`}
                          >
                            {row[prio] > 0 ? row[prio] : '-'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Leyenda Heatmap */}
                  <div className="mt-8 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="font-bold">Leyenda:</span>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200"></div> 0</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-200"></div> 1-2</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-orange-300 border border-orange-400"></div> 3-5</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-red-400 border border-red-500"></div> 6-10</div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-red-600 border border-red-700"></div> +10</div>
                  </div>
                </div>
              )}

              {/* Gráfico de Barras */}
              {chartType === 'bar' && (
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.heatmapDept} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <XAxis dataKey="departamento" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="BAJA" stackId="a" fill="#10b981" name="Baja" />
                      <Bar dataKey="MEDIA" stackId="a" fill="#f59e0b" name="Media" />
                      <Bar dataKey="ALTA" stackId="a" fill="#f97316" name="Alta" />
                      <Bar dataKey="CRITICA" stackId="a" fill="#ef4444" name="Crítica" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gráfico Circular */}
              {chartType === 'pie' && (
                <div className="h-80 w-full mt-4 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.heatmapDept}
                        dataKey="total"
                        nameKey="departamento"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {data.heatmapDept.map((entry: any, index: number) => {
                          const colors = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs md:text-sm font-medium">
                {selectedSede === 'TODAS'
                  ? 'No hay incidencias registradas en el sistema.'
                  : `No hay incidencias registradas para la Sede ${selectedSede}.`}
              </p>
            </div>
          )}
        </div>

        {/* 6. Gráfico de Comparativa y Eficiencia de Resolución por Sede */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Comparativa de Resolución y Carga por Sede
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Volumen de tickets resueltos frente a tickets abiertos en cada sede corporativa.
              </p>
            </div>
          </div>

          {data?.porSede && data.porSede.length > 0 ? (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.porSede} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sede" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="resueltos" name="Tickets Resueltos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="abiertos" name="Tickets Abiertos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs md:text-sm font-medium">No hay datos suficientes de sedes para comparar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
