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
// - Fechas solas (firma, vencimiento...): la API las manda como "2026-11-01" o "2026-11-01T00:00:00.000000Z"
//   (medianoche UTC). Se muestran tal cual: si se pasaran a la hora de Argentina quedarían un día antes.
// - Fechas con hora (created_at...): vienen en UTC y se pasan a la hora de Argentina; si no, lo hecho
//   después de las 21 h figura al día siguiente.
const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?(Z|[+-]00:?00)?)?$/;
export function fecha(valor) {
  if (!valor) return null;
  if (!SOLO_FECHA.test(valor)) {
    const f = new Date(valor);
    if (!Number.isNaN(f.getTime())) {
      return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
    }
  }
  const [a, m, d] = valor.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

// "2026-11-15T17:42:10.000000Z" -> "15/11/2026 14:42" (hora de Argentina)
export function fechaHora(valor) {
  if (!valor) return null;
  const f = new Date(valor);
  if (Number.isNaN(f.getTime())) return fecha(valor);
  return f.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).replace(',', '');
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