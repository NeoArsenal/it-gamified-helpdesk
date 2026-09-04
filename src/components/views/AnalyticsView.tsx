import { useEffect, useState, useRef } from 'react';
import { getTicketsAnalytics } from '@/services/api/api-client';
import { Activity, Clock, Download, Ticket, BarChart3, PieChart as PieChartIcon, Grid } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// import html2canvas from 'html2canvas'; // Para exportar
// import jsPDF from 'jspdf'; // Para exportar

export function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'heatmap' | 'bar' | 'pie'>('heatmap');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getTicketsAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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
      
      // Crear un objeto Image para obtener las proporciones correctas
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Reporte_Analitica_TI.pdf');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Hubo un error al exportar a PDF.');
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Cargando métricas avanzadas...</div>;
  }

  // Función para obtener la intensidad de color en el Heatmap
  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-slate-50 border-slate-100 text-slate-300';
    if (value <= 2) return 'bg-amber-100 border-amber-200 text-amber-700';
    if (value <= 5) return 'bg-orange-300 border-orange-400 text-orange-900';
    if (value <= 10) return 'bg-red-400 border-red-500 text-white';
    return 'bg-red-600 border-red-700 text-white font-bold'; // Más de 10 = Crítico absoluto
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto animate-in fade-in duration-500">
      
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" /> Analítica y SLAs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Métricas de rendimiento del equipo y focos de fallas por área.</p>
        </div>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar Reporte PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Cabecera del Reporte para el PDF */}
        <div className="hidden pdf-header mb-4">
          <h2 className="text-xl font-bold text-slate-800">Reporte Ejecutivo de TI</h2>
          <p className="text-slate-500 text-sm">Fecha: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Tarjetas KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Tickets Históricos</p>
              <h3 className="text-2xl font-bold text-slate-800">{data?.totalTickets || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tickets Resueltos</p>
              <h3 className="text-2xl font-bold text-slate-800">{data?.resueltosCount || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">SLA de Resolución</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {data?.promedioSLADias ? (data.promedioSLADias * 24).toFixed(1) : 0} <span className="text-sm font-normal text-slate-500">Horas prom.</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Selector de Gráficos y Visualización */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Incidencias por Área y Prioridad</h3>
              <p className="text-sm text-slate-500">Visualiza los datos en el formato que prefieras.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setChartType('heatmap')}
                className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded-md transition-all ${chartType === 'heatmap' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid className="w-4 h-4" /> Matriz
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 className="w-4 h-4" /> Barras
              </button>
              <button 
                onClick={() => setChartType('pie')}
                className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded-md transition-all ${chartType === 'pie' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PieChartIcon className="w-4 h-4" /> Circular
              </button>
            </div>
          </div>
          
          {data?.heatmapDept && data.heatmapDept.length > 0 ? (
            <div className="w-full">
              
              {chartType === 'heatmap' && (
                <div className="min-w-[600px] overflow-x-auto">
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
                        <div className="font-medium text-slate-700 text-sm truncate pl-2" title={row.departamento}>
                          {row.departamento} <span className="text-xs text-slate-400 font-normal">({row.total})</span>
                        </div>

                        {['BAJA', 'MEDIA', 'ALTA', 'CRITICA'].map((prio) => (
                          <div 
                            key={prio}
                            className={`h-12 rounded-lg border flex items-center justify-center text-sm transition-all duration-300 hover:scale-105 ${getHeatmapColor(row[prio])}`}
                            title={`${row.departamento} - ${prio}: ${row[prio]} tickets`}
                          >
                            {row[prio] > 0 ? row[prio] : '-'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Leyenda Heatmap */}
                  <div className="mt-8 flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-bold">Leyenda:</span>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-slate-50 border border-slate-100"></div> 0</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-amber-100 border border-amber-200"></div> 1-2</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-orange-300 border border-orange-400"></div> 3-5</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-400 border border-red-500"></div> 6-10</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-600 border border-red-700"></div> +10</div>
                  </div>
                </div>
              )}

              {chartType === 'bar' && (
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.heatmapDept} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <XAxis dataKey="departamento" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
                          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#14b8a6'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Activity className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm">No hay datos suficientes para graficar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
