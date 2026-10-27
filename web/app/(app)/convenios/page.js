
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede } from '../../lib/permisos';
import { listarConvenios } from '../../lib/convenios';
import { TIPOS, ESTADOS, fecha } from '../../lib/formato';
import Chip from '../../ui/atoms/Chip';
 
export default function Convenios() {
  const usuario = useUsuario();
  const router = useRouter();
  const [filtros, setFiltros] = useState({ q: '', estado: '', tipo: '', page: 1 });
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
 
  // Cada vez que cambian los filtros, se pide la página a la API
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError('');
    listarConvenios(filtros)
      .then((r) => vigente && setResultado(r))
      .catch((e) => vigente && setError(e.message || 'No se pudo cargar el listado'))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [filtros]);
 
  function cambiar(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor, page: 1 }));
  }
 
  function buscar(ev) {
    ev.preventDefault();
    cambiar('q', texto.trim());
  }
 
  const convenios = resultado?.data ?? [];
  const meta = resultado?.meta;
 
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Convenios</h1>
        {puede(usuario, 'crearConvenio') && (
          <Link href="/convenios/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2" aria-hidden="true" />Nuevo convenio
          </Link>
        )}
      </div>
 
      {/* Filtros */}
      <form className="row g-2 mb-3" onSubmit={buscar} role="search">
        <div className="col-12 col-md-5">
          <label htmlFor="q" className="visually-hidden">Buscar por título o código</label>
          <div className="input-group">
            <input id="q" type="search" className="form-control" placeholder="Buscar por título o código"
                   value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className="btn btn-outline-secondary" type="submit" aria-label="Buscar">
              <i className="bi bi-search" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <label htmlFor="estado" className="visually-hidden">Estado</label>
          <select id="estado" className="form-select" value={filtros.estado} onChange={(e) => cambiar('estado', e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-4">
          <label htmlFor="tipo" className="visually-hidden">Tipo</label>
          <select id="tipo" className="form-select" value={filtros.tipo} onChange={(e) => cambiar('tipo', e.target.value)}>
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </form>
 
      {/* Estados de la pantalla */}
      {cargando && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando convenios…</p>
        </div>
      )}
 
      {!cargando && error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger" onClick={() => setFiltros((f) => ({ ...f }))}>Reintentar</button>
        </div>
      )}
 
      {!cargando && !error && convenios.length === 0 && (
        <div className="text-center py-5 text-body-secondary">
          <i className="bi bi-folder2 fs-1" aria-hidden="true" />
          <p className="mt-2 mb-0">
            {usuario.rol === 'revisor' ? 'No tenés convenios asignados para revisar.' : 'No hay convenios que coincidan con la búsqueda.'}
          </p>
        </div>
      )}
 
      {!cargando && !error && convenios.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <caption className="visually-hidden">Listado de convenios</caption>
              <thead className="table-light">
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Título</th>
                  <th scope="col" className="d-none d-lg-table-cell">Tipo</th>
                  <th scope="col" className="d-none d-md-table-cell">Unidad</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="d-none d-md-table-cell">Vence</th>
                </tr>
              </thead>
              <tbody>
                {convenios.map((c) => (
                  <tr key={c.id} role="button" onClick={() => router.push(`/convenios/${c.id}`)}>
                    <td className="text-nowrap">
                      <Link href={`/convenios/${c.id}`} className="link-dark fw-semibold" onClick={(e) => e.stopPropagation()}>
                        {c.codigo}
                      </Link>
                    </td>
                    <td>
                      {c.titulo}
                      {c.confidencial && <span className="badge text-bg-dark ms-2">Confidencial</span>}
                    </td>
                    <td className="d-none d-lg-table-cell">{TIPOS[c.tipo] ?? c.tipo}</td>
                    <td className="d-none d-md-table-cell">{c.unidad?.sigla ?? '—'}</td>
                    <td><Chip estado={c.estado} /></td>
                    <td className="d-none d-md-table-cell text-nowrap">{fecha(c.fecha_vencimiento) ?? 'Sin vencimiento'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {meta && meta.last_page > 1 && (
            <nav aria-label="Páginas" className="d-flex justify-content-between align-items-center">
              <span className="small text-body-secondary">{meta.total} convenios</span>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" disabled={meta.current_page <= 1}
                        onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}>Anterior</button>
                <span className="btn btn-outline-secondary btn-sm disabled">{meta.current_page} de {meta.last_page}</span>
                <button className="btn btn-outline-secondary btn-sm" disabled={meta.current_page >= meta.last_page}
                        onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}>Siguiente</button>
              </div>
            </nav>
          )}
          {meta && meta.last_page <= 1 && <p className="small text-body-secondary">{meta.total} convenios</p>}
        </>
      )}
    </>
  );
}