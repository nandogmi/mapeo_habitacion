// exportCSV: utilidad cliente para generar/descargar CSV desde arrays de datos.
// Utilidad simple para descargar datos en formato CSV (cliente).
export function downloadCSV(rows: string[][], filename = 'detections.csv') {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  // el caller debe crear y clickear el enlace o usar esta función en cliente
  return { url, blob }
}