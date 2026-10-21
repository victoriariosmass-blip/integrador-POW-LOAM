const styles = {
  borrador: 'text-bg-secondary',
  en_revision: 'text-bg-warning',
  observado: 'text-bg-warning',
  aprobado: 'text-bg-info',
  vigente: 'text-bg-success',
  por_vencer: 'text-bg-warning',
  vencido: 'text-bg-danger',
};
const labels = {
  borrador: 'Borrador', en_revision: 'En revisión', observado: 'Observado',
  aprobado: 'Aprobado', vigente: 'Vigente', por_vencer: 'Por vencer', vencido: 'Vencido',
};

export default function Chip({ estado, children }) {
  return <span className={`badge rounded-pill ${styles[estado] ?? 'text-bg-light'}`}>{children ?? labels[estado] ?? estado}</span>;
}