/**
 * Utilidades profesionales para exportación de datos a hojas de cálculo nativas de Microsoft Excel (.xlsx) y CSV.
 * Utiliza SheetJS (xlsx) para generar archivos .xlsx reales con columnas formateadas,
 * anchos auto-ajustados y compatibilidad total con Excel en español sin problemas de delimitadores.
 */
import * as XLSX from 'xlsx';

export interface ExportColumn<T = any> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

/**
 * Genera y descarga un archivo nativo de Microsoft Excel (.xlsx) con columnas auto-ajustadas.
 */
export function exportToExcel<T = any>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[],
  sheetName = 'Reporte'
) {
  if (!data || data.length === 0) {
    throw new Error('No hay datos disponibles para exportar');
  }

  // 1. Cabeceras
  const headers = columns.map(c => c.header);

  // 2. Filas de datos
  const rows = data.map(item =>
    columns.map(col => {
      const val = col.accessor(item);
      return val === null || val === undefined ? '' : val;
    })
  );

  // 3. Crear hoja de cálculo
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 4. Calcular y ajustar automáticamente el ancho de cada columna
  worksheet['!cols'] = headers.map((header, colIndex) => {
    let maxLen = header.length;
    for (const row of rows) {
      const cellText = String(row[colIndex] ?? '');
      // Para descripciones largas limitamos el ancho visual inicial
      if (cellText.length > maxLen) {
        maxLen = Math.min(cellText.length, 55);
      }
    }
    return { wch: Math.max(maxLen + 4, 14) };
  });

  // 5. Crear libro de trabajo (Workbook) y anexar la hoja
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 6. Generar nombre con fecha
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanFilename = filename.replace(/\.xlsx$/i, '').replace(/\.csv$/i, '');
  const finalFilename = `${cleanFilename}_${dateStr}.xlsx`;

  // 7. Descargar archivo .xlsx nativo
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Exportador especializado para Tickets de Soporte en formato nativo Excel (.xlsx)
 */
export function exportTicketsToExcel(tickets: any[], filenamePrefix = 'reporte-tickets') {
  const columns: ExportColumn[] = [
    { header: 'N° Ticket', accessor: t => t.id ? `#${t.id.slice(0, 8).toUpperCase()}` : '' },
    { header: 'Título', accessor: t => t.titulo || '' },
    { header: 'Descripción', accessor: t => t.descripcion || '' },
    { header: 'Prioridad', accessor: t => t.prioridad || 'NORMAL' },
    { header: 'Estado', accessor: t => t.estado || 'ABIERTO' },
    { header: 'Categoría / Tipo', accessor: t => t.tipo || t.categoria || 'General' },
    { header: 'Sede', accessor: t => t.sede || 'Sin sede' },
    { header: 'Departamento', accessor: t => t.departamento || 'General' },
    { header: 'Ubicación Detallada', accessor: t => t.ubicacion || '' },
    { header: 'Solicitante', accessor: t => t.solicitanteNombre || t.solicitante || 'Anónimo' },
    { header: 'Técnico Asignado', accessor: t => t.tecnicoAsignadoNombre || t.tecnicoNombre || 'Sin asignar' },
    { header: 'Fecha Creación', accessor: t => t.createdAt ? new Date(t.createdAt).toLocaleString('es-PE') : '' },
    { header: 'Fecha Resolución', accessor: t => t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('es-PE') : (t.updatedAt && t.estado === 'RESUELTO' ? new Date(t.updatedAt).toLocaleString('es-PE') : '') },
    { header: 'Puntos XP', accessor: t => t.xpOtorgados || t.xp || 0 },
    { header: 'Diagnóstico / Solución Técnica', accessor: t => t.solucion || t.notasDiagnostico || '' },
  ];

  exportToExcel(filenamePrefix, columns, tickets, 'Tickets TI');
}

/**
 * Exportador especializado para Inventario de Equipos (Hardware) en formato nativo Excel (.xlsx)
 */
export function exportActivosToExcel(activos: any[], filenamePrefix = 'inventario-hardware') {
  const columns: ExportColumn[] = [
    { header: 'Código Patrimonial', accessor: a => a.codigo || '' },
    { header: 'Tipo de Equipo', accessor: a => a.tipo || '' },
    { header: 'Marca / Modelo', accessor: a => a.modelo || '' },
    { header: 'Sede', accessor: a => a.sede || 'Sin sede' },
    { header: 'Departamento', accessor: a => a.departamento || 'General' },
    { header: 'Ubicación / Oficina', accessor: a => a.ubicacion || '' },
    { header: 'Responsable', accessor: a => a.responsable || 'Sin asignar' },
    { header: 'Estado', accessor: a => a.estado || 'OPERATIVO' },
    { header: 'Observaciones / Diagnóstico', accessor: a => a.observaciones || '' },
    { header: 'Fecha de Registro', accessor: a => a.createdAt ? new Date(a.createdAt).toLocaleString('es-PE') : '' },
  ];

  exportToExcel(filenamePrefix, columns, activos, 'Equipos TI');
}

// Re-exportadores de compatibilidad
export const exportTicketsToCsv = exportTicketsToExcel;
export const exportActivosToCsv = exportActivosToExcel;
