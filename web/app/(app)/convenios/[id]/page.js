
'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { verConvenio, accionConvenio } from '../../../lib/convenios';
import { TIPOS, ESTADOS, fecha } from '../../../lib/formato';
import Chip from '../../../ui/atoms/Chip';
import AccionesConvenio from '../../../ui/molecules/AccionesConvenio';
 
const MENSAJES = {
  'enviar-revision': 'El convenio se envió a revisión.',
  aprobar: 'El convenio quedó aprobado.',
  devolver: 'El convenio volvió a borrador con tus observaciones.',
  rescindir: 'El convenio quedó rescindido.',
  archivar: 'El convenio quedó archivado.',
};
 
function Dato({ etiqueta, children }) {
  return (
    <div className="col-12 col-md-6">
      <dt className="small text-body-secondary fw-normal">{etiqueta}</dt>
      <dd className="mb-0">{children || '—'}</dd>
    </div>
  );
}
 
export default function FichaConvenio() {
  const { id } = useParams();
  const [convenio, setConvenio] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [procesando, setProcesando] = useState(false);
 
  const cargar = useCallback(() => {
    setError(null);
    verConvenio(id)
      .then((r) => setConvenio(r.data))
      .catch((e) => setError(e));
  }, [id]);
 
  useEffect(() => { cargar(); }, [cargar]);
 
  async function hacer(accion, datos) {
    setProcesando(true);
    setAviso('');
    setErrorAccion('');
    try {
      await accionConvenio(id, accion, datos);
      const r = await verConvenio(id); // trae el estado, el historial y los permisos nuevos
      setConvenio(r.data);
      setAviso(MENSAJES[accion]);
    } catch (e) {
      setErrorAccion(e.message || 'No se pudo completar la acción');
      throw e;
    } finally {
      setProcesando(false);
    }
  }
 
  if (error) {
    const texto = error.status === 403 ? 'No tenés permiso para ver este convenio.'
      : error.status === 404 ? 'El convenio no existe.' : (error.message || 'No se pudo cargar el convenio.');
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-circle fs-1 text-secondary" aria-hidden="true" />
        <p className="mt-2">{texto}</p>
        <Link href="/convenios" className="btn btn-outline-secondary">Volver al listado</Link>
      </div>
    );
  }
 
  if (!convenio) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-secondary" aria-hidden="true" />
        <p className="text-body-secondary mt-2 mb-0">Cargando convenio…</p>
      </div>
    );
  }
 
  const c = convenio;
 
  return (
    <>
      <nav aria-label="Ruta" className="mb-2">
        <Link href="/convenios" className="small"><i className="bi bi-arrow-left me-1" aria-hidden="true" />Convenios</Link>
      </nav>
 
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <h1 className="h4 mb-0">{c.codigo}</h1>
        <Chip estado={c.estado} />
        {c.confidencial && <span className="badge text-bg-dark">Confidencial</span>}
      </div>
      <p className="lead mb-3">{c.titulo}</p>
 
      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
      {errorAccion && <div className="alert alert-danger" role="alert">{errorAccion}</div>}
 
      <div className="mb-4">
        <AccionesConvenio convenio={c} onAccion={hacer} cargando={procesando} />
      </div>
 
      <div className="row g-4">
        <section className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Datos del convenio</h2>
              <dl className="row g-3 mb-0">
                <Dato etiqueta="Tipo">{TIPOS[c.tipo] ?? c.tipo}</Dato>
                <Dato etiqueta="Unidad">{c.unidad?.nombre}</Dato>
                <Dato etiqueta="Fecha de firma">{fecha(c.fecha_firma)}</Dato>
                <Dato etiqueta="Vencimiento">{fecha(c.fecha_vencimiento) ?? 'Sin vencimiento registrado'}</Dato>
                <Dato etiqueta="Resolución">{c.resolucion}</Dato>
                <Dato etiqueta="Expediente">{c.expediente}</Dato>
                <div className="col-12">
                  <dt className="small text-body-secondary fw-normal">Objeto</dt>
                  <dd className="mb-0">{c.objeto || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
 
        <aside className="col-12 col-lg-4 d-flex flex-column gap-4">
          {c.observaciones?.length > 0 && (
            <section className="card border-warning">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Observaciones de revisión</h2>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {c.observaciones.map((o) => (
                    <li key={o.id}>
                      <p className="mb-1">{o.contenido}</p>
                      <p className="small text-body-secondary mb-0">{o.autor?.name} · {fecha(o.created_at)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
 
          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Historial</h2>
              {(c.transiciones ?? []).length === 0 ? (
                <p className="small text-body-secondary mb-0">Todavía no hay cambios de estado.</p>
              ) : (
                <ol className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {[...c.transiciones].reverse().map((t) => (
                    <li key={t.id}>
                      <p className="mb-1 fw-semibold">{ESTADOS[t.estado_hasta] ?? t.estado_hasta}</p>
                      <p className="small mb-1">{t.fundamento}</p>
                      <p className="small text-body-secondary mb-0">{t.usuario?.name} · {fecha(t.created_at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}