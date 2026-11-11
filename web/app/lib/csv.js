// Exportar a CSV (lo abre Excel o LibreOffice).
// - Separador ";" y BOM UTF-8: así Excel en castellano separa bien las columnas y muestra los acentos.
// - Si una celda empieza con = + - @ (o tabulación / salto), la planilla la tomaría como fórmula:
//   se le antepone un apóstrofo para que quede como texto ("neutralizar fórmulas").
 
function celda(valor) {
  if (valor === null || valor === undefined) return '';
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  // si tiene ; comillas o saltos de línea, va entre comillas (y las comillas se duplican)
  if (/[";\n\r]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}
 
// columnas: [{ titulo: 'Código', valor: (fila) => fila.codigo }, ...]
export function armarCsv(columnas, filas) {
  const encabezado = columnas.map((c) => celda(c.titulo)).join(';');
  const lineas = filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(';'));
  return [encabezado, ...lineas].join('\r\n');
}
 
// Descarga el texto como archivo .csv
export function descargarCsv(nombreArchivo, texto) {
  const blob = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}