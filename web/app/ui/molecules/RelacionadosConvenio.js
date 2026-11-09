import Link from 'next/link';
import Chip from '../atoms/Chip';
 
// Árbol del convenio: de qué depende (su marco, el convenio que modifica)
// y qué depende de él (específicos, adendas, renovaciones)
const TIPO_VINCULO = {
  especifico_de: 'Específico',
  adenda_de: 'Adenda',
  renueva_a: 'Renovación',
  sustituye_a: 'Sustitución',
};
 
function Lista({ convenios }) {
  return (
    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
      {convenios.map((c) => (
        <li key={c.id}>
          <Link href={`/convenios/${c.id}`} className="fw-semibold">{c.codigo}</Link>{' '}
          <Chip estado={c.estado} />
          <p className="small mb-0">{c.titulo}</p>
        </li>
      ))}
    </ul>
  );
}
 
export default function RelacionadosConvenio({ antecedentes = [], derivados = [] }) {
  if (antecedentes.length === 0 && derivados.length === 0) return null;
 
  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">Convenios relacionados</h2>
        {antecedentes.length > 0 && (
          <>
            <p className="small text-body-secondary mb-2">
              {TIPO_VINCULO[antecedentes[0].pivot?.tipo] ?? 'Relacionado'} de:
            </p>
            <Lista convenios={antecedentes} />
          </>
        )}
        {derivados.length > 0 && (
          <>
            <p className={`small text-body-secondary mb-2 ${antecedentes.length ? 'mt-3' : ''}`}>Dependen de este convenio:</p>
            <Lista convenios={derivados} />
          </>
        )}
      </div>
    </section>
  );
}