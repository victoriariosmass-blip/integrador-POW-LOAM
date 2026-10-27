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