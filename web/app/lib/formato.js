// Textos para mostrar en pantalla
 
export const TIPOS = {
  marco_colaboracion: 'Marco de colaboración',
  especifico_colaboracion: 'Específico de colaboración',
  marco_pasantia: 'Marco de pasantías',
  especifico_pasantia: 'Específico de pasantía',
  adenda: 'Adenda',
};
 
export const ESTADOS = {
  borrador: 'Borrador',
  revision: 'En revisión',
  aprobado: 'Aprobado',
  firmado: 'Firmado',
  rescindido: 'Rescindido',
  archivado: 'Archivado',
};
 
// "2026-10-27" o "2026-10-27T13:19:00Z" -> "27/10/2026"
export function fecha(valor) {
  if (!valor) return null;
  const [a, m, d] = valor.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}


// Días desde hoy hasta la fecha ("2026-12-01"): positivo si falta, negativo si ya pasó
export function diasHasta(valor) {
  if (!valor) return null;
  const [a, m, d] = valor.slice(0, 10).split('-').map(Number);
  const hoy = new Date();
  const inicioHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((Date.UTC(a, m - 1, d) - inicioHoy) / 86_400_000);
}
 
// 12 -> "en 12 días", 1 -> "mañana", 0 -> "hoy", -3 -> "hace 3 días"
export function textoDias(dias) {
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias === -1) return 'ayer';
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`;
}