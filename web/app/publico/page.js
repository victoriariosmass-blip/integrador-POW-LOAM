'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listarPublicos } from '../lib/publico';
import { TIPOS, fecha } from '../lib/formato';
import Chip from '../ui/atoms/Chip';
 
export default function ConveniosPublicos() {
  const [filtros, setFiltros] = useState({ q: '', tipo: '', page: 1 });
  const [busqueda, setBusqueda] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    let vigente = true; // si cambian los filtros antes de que responda, se ignora la respuesta vieja
    setError('');
    listarPublicos(filtros)
      .then((r) => { if (vigente) setResultado(r); })
      .catch((e) => { if (vigente) setError(e.message || 'No se pudieron cargar los convenios'); });
    return () => { vigente = false; };
  }, [filtros]);
 
  function buscar(ev) {
    ev.preventDefault();
    setFiltros((f) => ({ ...f, q: busqueda.trim(), page: 1 }));
  }
 
  const meta = resultado?.meta;
 
  return (
    <>
      <h1 className="h3 mb-1">Convenios de la UNLPam</h1>
      <p className="text-body-secondary mb-4">Convenios firmados por la universidad y sus facultades con otras instituciones y empresas.</p>
 
      <form onSubmit={buscar} className="row g-2 mb-4" role="search">
        <div className="col-12 col-md-7">
          <label htmlFor="q" className="visually-hidden">Buscar</label>
          <input id="q" type="search" className="form-control" placeholder="Buscar por título, código o institución"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="col-8 col-md-3">
          <label htmlFor="tipo" className="visually-hidden">Tipo</label>
          <select id="tipo" className="form-select" value={filtros.tipo}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value, page: 1 }))}>
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </div>
        <div className="col-4 col-md-2">
          <button type="submit" className="btn btn-primary w-100">Buscar</button>
        </div>
      </form>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {!resultado && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando convenios…</p>
        </div>
      )}
 
      {resultado && (
        <>
          <p className="small text-body-secondary" aria-live="polite">
            {meta.total === 1 ? '1 convenio' : `${meta.total} convenios`}
          </p>
 
          {resultado.data.length === 0 ? (
            <p className="text-center py-5 text-body-secondary">No encontramos convenios con esa búsqueda.</p>
          ) : (
            <div className="row g-3">
              {resultado.data.map((c) => (
                <div key={c.ref} className="col-12 col-md-6 col-xl-4">
                  <article className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="small fw-semibold text-body-secondary">{c.codigo}</span>
                        <Chip estado={c.vigente ? 'vigente' : 'vencido'} />
                      </div>
                      <h2 className="h6 fw-bold">{c.titulo}</h2>
                      <p className="small mb-1">{TIPOS[c.tipo] ?? c.tipo} · {c.unidad}</p>
                      <p className="small text-body-secondary mb-3">Con {c.contrapartes.join(', ') || '—'}</p>
                      <p className="small mb-3 mt-auto">
                        Firmado el {fecha(c.fecha_firma)}
                        {c.fecha_vencimiento ? ` · vence el ${fecha(c.fecha_vencimiento)}` : ''}
                      </p>
                      <Link href={`/publico/${c.ref}`} className="btn btn-sm btn-outline-primary align-self-start">
                        Ver detalle<span className="visually-hidden"> de {c.codigo}</span>
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
 
          {meta.last_page > 1 && (
            <nav aria-label="Páginas" className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled={meta.current_page <= 1}
                onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}>Anterior</button>
              <span className="small">Página {meta.current_page} de {meta.last_page}</span>
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled={meta.current_page >= meta.last_page}
                onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}>Siguiente</button>
            </nav>
          )}
        </>
      )}
    </>
  );
}