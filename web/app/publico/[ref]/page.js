'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { verPublico } from '../../lib/publico';
import { TIPOS, fecha } from '../../lib/formato';
import Chip from '../../ui/atoms/Chip';
 
function Dato({ etiqueta, children }) {
  return (
    <div className="col-12 col-md-6">
      <dt className="small text-body-secondary fw-normal">{etiqueta}</dt>
      <dd className="mb-0">{children || '—'}</dd>
    </div>
  );
}
 
function Cargando() {
  return (
    <div className="text-center py-5" role="status">
      <div className="spinner-border text-secondary" aria-hidden="true" />
      <p className="text-body-secondary mt-2 mb-0">Cargando convenio…</p>
    </div>
  );
}
 
// Detalle público de un convenio. Es la página a la que lleva el QR.
// Va dentro de <Suspense> porque lee el parámetro de la URL ([ref]): Next lo pide para
// las páginas que no usan la plantilla del sistema.
export default function PaginaDetallePublico() {
  return (
    <Suspense fallback={<Cargando />}>
      <DetallePublico />
    </Suspense>
  );
}
 
function DetallePublico() {
  const { ref } = useParams();
  const [convenio, setConvenio] = useState(null);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    setConvenio(null);
    setError(null);
    verPublico(ref).then((r) => setConvenio(r.data)).catch(setError);
  }, [ref]);
 
  if (error) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-search fs-1 text-secondary" aria-hidden="true" />
        <p className="mt-2">
          {error.status === 404 ? 'No encontramos ese convenio. Puede que no sea público o que el enlace esté mal.' : error.message}
        </p>
        <Link href="/publico" className="btn btn-outline-secondary">Ver todos los convenios</Link>
      </div>
    );
  }
 
  if (!convenio) return <Cargando />;
 
  const c = convenio;
 
  return (
    <>
      <nav aria-label="Ruta" className="mb-2">
        <Link href="/publico" className="small"><i className="bi bi-arrow-left me-1" aria-hidden="true" />Todos los convenios</Link>
      </nav>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <h1 className="h4 mb-0">{c.codigo}</h1>
        <Chip estado={c.vigente ? 'vigente' : 'vencido'} />
      </div>
      <p className="lead mb-4">{c.titulo}</p>
 
      <div className="row g-4">
        <section className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <dl className="row g-3 mb-0">
                <Dato etiqueta="Tipo">{TIPOS[c.tipo] ?? c.tipo}</Dato>
                <Dato etiqueta="Unidad de la UNLPam">{c.unidad}</Dato>
                <Dato etiqueta={c.contrapartes.length > 1 ? 'Contrapartes' : 'Contraparte'}>{c.contrapartes.join(', ')}</Dato>
                <Dato etiqueta="Fecha de firma">{fecha(c.fecha_firma)}</Dato>
                <Dato etiqueta="Vencimiento">{fecha(c.fecha_vencimiento) ?? 'Sin vencimiento'}</Dato>
                <div className="col-12">
                  <dt className="small text-body-secondary fw-normal">Objeto</dt>
                  <dd className="mb-0">{c.objeto}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
 
        {c.relacionados?.length > 0 && (
          <aside className="col-12 col-lg-4">
            <section className="card">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Convenios relacionados</h2>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {c.relacionados.map((r) => (
                    <li key={r.ref}>
                      <Link href={`/publico/${r.ref}`} className="fw-semibold">{r.codigo}</Link>
                      <p className="small mb-0">{r.titulo}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </aside>
        )}
      </div>
    </>
  );
}