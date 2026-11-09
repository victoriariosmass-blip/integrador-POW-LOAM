'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { obtenerResumen } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
import CircuitoEstados from '../../ui/molecules/CircuitoEstados';
 
// Las 4 métricas de inicio. "filtro" arma el link al listado ya filtrado.
const METRICAS = [
  { clave: 'firmados_ultimo_anio', titulo: 'Firmados en el último año', icono: 'bi-pen', filtro: 'estado=firmado' },
  { clave: 'vigentes', titulo: 'Vigentes', icono: 'bi-check-circle', filtro: 'estado=firmado' },
  { clave: 'en_tramite', titulo: 'En trámite', icono: 'bi-hourglass-split', filtro: null },
  { clave: 'por_firmar', titulo: 'Por firmar', icono: 'bi-clipboard-check', filtro: 'estado=aprobado' },
];
 
export default function Panel() {
  const usuario = useUsuario();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    obtenerResumen()
      .then(setResumen)
      .catch((e) => setError(e.message || 'No se pudo cargar el resumen'));
  }, []);
 
  return (
    <>
      <h1 className="h4 mb-1">Hola, {usuario.name.split(' ')[0]}</h1>
      <p className="text-body-secondary mb-4">Resumen de los convenios que podés ver.</p>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {!resumen && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando resumen…</p>
        </div>
      )}
 
      {resumen && (
        <>
          <div className="row g-3 mb-4">
            {METRICAS.map((m) => {
              const contenido = (
                <div className="card-body">
                  <p className="small text-body-secondary mb-1">
                    <i className={`bi ${m.icono} me-1`} aria-hidden="true" />{m.titulo}
                  </p>
                  <p className="display-6 fw-semibold mb-0">{resumen[m.clave]}</p>
                </div>
              );
              return (
                <div key={m.clave} className="col-6 col-lg-3">
                  {m.filtro ? (
                    <Link href={`/convenios?${m.filtro}`} className="card h-100 text-decoration-none">{contenido}</Link>
                  ) : (
                    <div className="card h-100">{contenido}</div>
                  )}
                </div>
              );
            })}
          </div>
 
          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Últimos movimientos</h2>
              {resumen.ultimos_movimientos.length === 0 ? (
                <p className="small text-body-secondary mb-0">Todavía no hay movimientos.</p>
              ) : (
               
                <ul className="row g-3 list-unstyled mb-0">
                  {resumen.ultimos_movimientos.map((t) => (
                    <li key={t.id} className="col-12 col-md-6 col-xl-4">
                      <article className="card h-100">
                        <div className="card-body d-flex flex-column">
                          <Link href={`/convenios/${t.convenio.id}`} className="fw-semibold">{t.convenio.codigo}</Link>
                          {/* el título ocupa como mucho 2 líneas, así todas las fichas quedan parejas */}
                          <p className="small mb-3" title={t.convenio.titulo}
                             style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {t.convenio.titulo}
                          </p>
                          <div className="mt-auto">
                            <CircuitoEstados
                              compacto
                              estado={t.estado_hasta}
                              devuelto={t.estado_desde === 'revision' && t.estado_hasta === 'borrador'}
                            />
                            <p className="small text-body-secondary mb-0 mt-2">{t.usuario?.name} · {fecha(t.created_at)}</p>
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}