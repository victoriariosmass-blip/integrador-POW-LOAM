// estados del circuito (los mismos que la API) y los de vigencia, que se calculan por fecha
const styles = {
  borrador: 'text-bg-secondary',
  revision: 'text-bg-warning',
  aprobado: 'text-bg-info',
  firmado: 'text-bg-primary',
  rescindido: 'text-bg-danger',
  archivado: 'text-bg-dark',
  vigente: 'text-bg-success',
  por_vencer: 'text-bg-warning',
  vencido: 'text-bg-danger',
};
const labels = {
  borrador: 'Borrador', revision: 'En revisión', aprobado: 'Aprobado', firmado: 'Firmado',
  rescindido: 'Rescindido', archivado: 'Archivado',
  vigente: 'Vigente', por_vencer: 'Por vencer', vencido: 'Vencido',
};
 
export default function Chip({ estado, children }) {
  return <span className={`badge rounded-pill ${styles[estado] ?? 'text-bg-light'}`}>{children ?? labels[estado] ?? estado}</span>;
}