'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede } from '../../lib/permisos';
import { listarConvenios, listarUnidades } from '../../lib/convenios';
import { listarTodos } from '../../lib/listados';
import { armarCsv, descargarCsv } from '../../lib/csv';
import { TIPOS, ESTADOS, fecha } from '../../lib/formato';
import Chip from '../../ui/atoms/Chip';
 
// Filtros vacíos (también sirve para "Limpiar filtros")
const SIN_FILTROS = { q: '', estado: '', tipo: '', unidad_id: '', firma_desde: '', firma_hasta: '', vigentes: '' };
 
// Columnas del CSV exportado
const COLUMNAS_CSV = [
  { titulo: 'Código', valor: (c) => c.codigo },
  { titulo: 'Título', valor: (c) => c.titulo },
  { titulo: 'Tipo', valor: (c) => TIPOS[c.tipo] ?? c.tipo },
  { titulo: 'Unidad', valor: (c) => c.unidad?.nombre ?? '' },
  { titulo: 'Estado', valor: (c) => ESTADOS[c.estado] ?? c.estado },
  { titulo: 'Fecha de firma', valor: (c) => fecha(c.fecha_firma) ?? '' },
  { titulo: 'Vencimiento', valor: (c) => fecha(c.fecha_vencimiento) ?? 'Sin vencimiento registrado' },
  { titulo: 'Confidencial', valor: (c) => (c.confidencial ? 'Sí' : 'No') },
];
 

// useSearchParams necesita estar dentro de un <Suspense>
export default function PaginaConvenios() {
  return (
    <Suspense fallback={null}>
      <Convenios />
    </Suspense>
  );
}
 
function Convenios() {
  const usuario = useUsuario();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState({ ...SIN_FILTROS, page: 1 });
  const [unidades, setUnidades] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState('');
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [listo, setListo] = useState(false); // ya se leyeron los filtros de la dirección
 

  // Si se llega desde el panel (ej. /convenios?estado=borrador,revision), arranca SOLO con esos filtros.
  // Next guarda la pantalla abierta en memoria al cambiar de página, así que esto se repite
  // cada vez que cambia la dirección y REEMPLAZA los filtros anteriores (no los suma).
  const direccion = searchParams.toString();
  useEffect(() => {
    const params = new URLSearchParams(direccion);
    const desdeUrl = {};
    Object.keys(SIN_FILTROS).forEach((clave) => {
      if (params.get(clave)) desdeUrl[clave] = params.get(clave);
    });
    setFiltros({ ...SIN_FILTROS, ...desdeUrl, page: 1 });
    setTexto(desdeUrl.q ?? '');
    setListo(true);
  }, [direccion]);
 
  // La lista de unidades solo hace falta para los usuarios globales (los demás ven solo la suya)
  const esGlobal = usuario.unidad_id === null;
  useEffect(() => {
    if (esGlobal) listarUnidades().then((r) => setUnidades(r.data)).catch(() => setUnidades([]));
  }, [esGlobal]);
 
  // Cada vez que cambian los filtros, se pide la página a la API
  useEffect(() => {
    if (!listo) return; // primero se leen los filtros de la dirección (así no se pide dos veces)
    let vigente = true;
    setCargando(true);
    setError('');
    listarConvenios(filtros)
      .then((r) => vigente && setResultado(r))
      .catch((e) => vigente && setError(e.message || 'No se pudo cargar el listado'))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [filtros, listo]);
 
  function cambiar(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor, page: 1 }));
  }
 
  function buscar(ev) {
    ev.preventDefault();
    cambiar('q', texto.trim());
  }
 
  function limpiarFiltros() {
    setTexto('');
    setFiltros({ ...SIN_FILTROS, page: 1 });
  }
 
  // Exporta TODOS los resultados del filtro actual (no solo la página que se ve).
  // Salen de la API, así que son solo los convenios que el usuario puede ver.
  async function exportar() {
    setExportando(true);
    setErrorExportar('');
    try {
      const { page, ...sinPagina } = filtros;
      const todos = await listarTodos(sinPagina);
      const csv = armarCsv(COLUMNAS_CSV, todos);
      descargarCsv(`convenios-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e) {
      setErrorExportar(e.message || 'No se pudo exportar el listado');
    } finally {
      setExportando(false);
    }
  }
 
  const hayFiltros = Object.entries(SIN_FILTROS).some(([clave]) => filtros[clave]);
 
  const convenios = resultado?.data ?? [];
  const meta = resultado?.meta;
 
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Convenios</h1>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary text-nowrap" onClick={exportar}
                  disabled={exportando || cargando || !resultado?.meta?.total}>
            {exportando
              ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              : <i className="bi bi-download me-2" aria-hidden="true" />}
            Exportar CSV
          </button>
          {puede(usuario, 'crearConvenio') && (
            <Link href="/convenios/nuevo" className="btn btn-primary text-nowrap">
              <i className="bi bi-plus-lg me-2" aria-hidden="true" />Nuevo convenio
            </Link>
          )}
        </div>
      </div>
 
      {errorExportar && <div className="alert alert-danger" role="alert">{errorExportar}</div>}
 
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
            <option value="borrador,revision">En trámite (borrador o revisión)</option>
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
        {esGlobal && (
          <div className="col-12 col-md-4">
            <label htmlFor="unidad" className="form-label small mb-1">Unidad</label>
            <select id="unidad" className="form-select" value={filtros.unidad_id} onChange={(e) => cambiar('unidad_id', e.target.value)}>
              <option value="">Todas las unidades</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
        )}
        <div className="col-6 col-md-3">
          <label htmlFor="firma_desde" className="form-label small mb-1">Firmado desde</label>
          <input id="firma_desde" type="date" className="form-control" value={filtros.firma_desde}
                 max={filtros.firma_hasta || undefined} onChange={(e) => cambiar('firma_desde', e.target.value)} />
        </div>
        <div className="col-6 col-md-3">
          <label htmlFor="firma_hasta" className="form-label small mb-1">Firmado hasta</label>
          <input id="firma_hasta" type="date" className="form-control" value={filtros.firma_hasta}
                 min={filtros.firma_desde || undefined} onChange={(e) => cambiar('firma_hasta', e.target.value)} />
        </div>
        {filtros.vigentes && (
          <div className="col-12 col-md-auto d-flex align-items-end">
            <span className="badge rounded-pill text-bg-success d-inline-flex align-items-center gap-2 py-2 px-3">
              Solo vigentes
              <button type="button" className="btn-close btn-close-white" style={{ fontSize: '.6rem' }}
                      aria-label="Quitar el filtro de vigentes" onClick={() => cambiar('vigentes', '')} />
            </span>
          </div>
        )}
        {hayFiltros && (
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button type="button" className="btn btn-link px-0" onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        )}
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