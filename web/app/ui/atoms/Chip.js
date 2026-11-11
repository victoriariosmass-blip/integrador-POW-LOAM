// estados del circuito (los mismos que la API) y los de vigencia, que se calculan por fecha.
// Los colores están en globals.css (.chip-borrador, .chip-firmado, ...): fondo suave y texto oscuro,
// con contraste suficiente para leerse bien (accesibilidad).
const labels = {
  borrador: 'Borrador', revision: 'En revisión', aprobado: 'Aprobado', firmado: 'Firmado',
  rescindido: 'Rescindido', archivado: 'Archivado',
  vigente: 'Vigente', por_vencer: 'Por vencer', vencido: 'Vencido',
};
 
export default function Chip({ estado, children }) {
  const clase = labels[estado] ? `chip-${estado}` : 'chip-otro';
  return <span className={`chip ${clase}`}>{children ?? labels[estado] ?? estado}</span>;
}