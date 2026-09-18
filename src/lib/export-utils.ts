/**
 * Utilidades para exportación de datos a formato CSV compatible con Microsoft Excel.
 * Incluye Byte Order Mark (BOM) UTF-8 (\uFEFF) para garantizar la correcta visualización
 * de caracteres en español (tildes, eñes, etc.) sin problemas de codificación.
 */

export interface CsvColumn<T = any> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

/**
 * Escapa un valor para formato CSV estándar (RFC 4180).
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  // Si contiene comas, comillas dobles, o saltos de línea, se encierra entre comillas y se duplican las comillas internas
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Genera y descarga un archivo CSV con soporte UTF-8.
 */
export function exportToCsv<T = any>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
) {
  if (!data || data.length === 0) {
    throw new Error('No hay datos disponibles para exportar');
  }

  // Cabecera CSV
  const headerRow = columns.map(c => escapeCsvValue(c.header)).join(',');

  // Filas de datos
  const dataRows = data.map(item => {
    return columns.map(col => escapeCsvValue(col.accessor(item))).join(',');
  });

  // Unir con saltos de línea CRLF estándar
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  // Crear Blob y forzar descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Agregar fecha al nombre de archivo si no la tiene
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename.endsWith('.csv') 
    ? filename.replace('.csv', `_${dateStr}.csv`)
    : `${filename}_${dateStr}.csv`;

  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exportador especializado para Tickets de Soporte
 */
export function exportTicketsToCsv(tickets: any[], filenamePrefix = 'reporte-tickets') {
  const columns: CsvColumn[] = [
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

  exportToCsv(filenamePrefix, columns, tickets);
}

/**
 * Exportador especializado para Inventario de Equipos (Hardware)
 */
export function exportActivosToCsv(activos: any[], filenamePrefix = 'inventario-hardware') {
  const columns: CsvColumn[] = [
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

  exportToCsv(filenamePrefix, columns, activos);
}
