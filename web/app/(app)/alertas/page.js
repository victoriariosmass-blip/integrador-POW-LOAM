'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { calcularAlertas } from '../../lib/alertas';
import { fecha, textoDias } from '../../lib/formato';
 
// Diseño "bandeja": una sola tarjeta con una sección por nivel (encabezado lavanda
// con su ícono) y una fila por alerta. Toda la fila es un link a la ficha del convenio.
// Los colores e íconos están en globals.css (.bandeja-...).
const NIVELES = {
  alta: { titulo: 'Requieren atención', icono: 'bi-exclamation-octagon', tono: 'rojo' },
  media: { titulo: 'Próximos a vencer', icono: 'bi-hourglass-split', tono: 'ambar' },
  info: { titulo: 'Pendientes del circuito', icono: 'bi-list-check', tono: 'indigo' },
};
 
export default function Alertas() {
  const usuario = useUsuario();
  const [alertas, setAlertas] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    calcularAlertas(usuario)
      .then(setAlertas)
      .catch((e) => setError(e.message || 'No se pudieron cargar las alertas'));
  }, [usuario]);
 
  return (
    <>
      <h1 className="h4 mb-1">Alertas</h1>
      <p className="text-body-secondary mb-4">Lo que necesita atención en los convenios que podés ver.</p>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {alertas === null && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Buscando alertas…</p>
        </div>
      )}
 
      {alertas?.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-check2-circle fs-1 text-success" aria-hidden="true" />
          <p className="mt-2 mb-0">No hay alertas. Todo al día.</p>
        </div>
      )}
 
      {alertas?.length > 0 && (
        <div className="card bandeja">
          {Object.entries(NIVELES).map(([nivel, n]) => {
            const lista = alertas.filter((a) => a.nivel === nivel);
            if (lista.length === 0) return null;
            return (
              <section key={nivel} aria-labelledby={`nivel-${nivel}`}>
                <h2 id={`nivel-${nivel}`} className="bandeja-encabezado">
                  <span className={`bandeja-icono tono-${n.tono}`} aria-hidden="true">
                    <i className={`bi ${n.icono}`} />
                  </span>
                  {n.titulo}
                  <span className="bandeja-cantidad">{lista.length}</span>
                </h2>
                <ul className="list-unstyled mb-0">
                  {lista.map((a) => (
                      <li key={a.id}>
                        <Link href={`/convenios/${a.convenio.id}`} className="bandeja-fila">
                          <span className="bandeja-texto">
                            <span className="d-block">
                              <span className="bandeja-codigo">{a.convenio.codigo}</span>{' '}
                              <span className="fw-semibold">{a.titulo}</span>
                              <span className="text-body-secondary small"> · {a.convenio.titulo}</span>
                            </span>
                            <span className="d-block small text-body-secondary">{a.detalle}</span>
                          </span>
                          <span className="bandeja-fecha">
                            {a.dias !== null ? (
                              <>
                                <span className={`d-block fw-bold tono-texto-${n.tono}`}>{textoDias(a.dias)}</span>
                                <span className="d-block small text-body-secondary">{fecha(a.convenio.fecha_vencimiento)}</span>
                              </>
                            ) : (
                              <span className="small text-body-secondary">
                                {a.id.startsWith('firma') ? 'Aprobado' : 'En revisión'}
                              </span>
                            )}
                          </span>
                          <i className="bi bi-chevron-right bandeja-flecha" aria-hidden="true" />
                        </Link>
                      </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}