'use client';
import { useEffect, useState } from 'react';
import Button from '../atoms/Button';
import { buscarPartes, agregarParte, quitarParte } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
// Partes firmantes del convenio y sus representantes.
// Enunciado: "registrar las instituciones firmantes, incluida la UNLPam o la unidad académica que
// corresponda, y los datos de sus representantes. Antes de aprobar un convenio deben existir al menos dos partes."
const TIPOS_PARTE = {
  universidad: 'Universidad',
  unidad_academica: 'Unidad académica',
  empresa: 'Empresa',
  organismo_publico: 'Organismo público',
  ong: 'ONG',
  otro: 'Otro',
};
 
const VACIO = { modo: 'existente', parte_id: '', nombre: '', tipo: 'empresa', cuit: '', representante_nombre: '', representante_cargo: '', firmo_en: '' };
 
export default function PartesConvenio({ convenio, puedeEditar, onCambio }) {
  const partes = convenio.partes ?? [];
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [opciones, setOpciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
 
  // Instituciones ya cargadas (para no repetirlas): se buscan al abrir y al escribir
  useEffect(() => {
    if (!abierto || form.modo !== 'existente') return undefined;
    const t = setTimeout(() => {
      buscarPartes(busqueda).then((r) => setOpciones(r.data)).catch(() => setOpciones([]));
    }, 300);
    return () => clearTimeout(t);
  }, [abierto, busqueda, form.modo]);
 
  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };
 
  async function guardar(ev) {
    ev.preventDefault();
    setError('');
    const cuerpo = {
      representante_nombre: form.representante_nombre.trim(),
      representante_cargo: form.representante_cargo.trim() || null,
      firmo_en: form.firmo_en || null,
      ...(form.modo === 'existente'
        ? { parte_id: form.parte_id ? Number(form.parte_id) : null }
        : { parte: { nombre: form.nombre.trim(), tipo: form.tipo, cuit: form.cuit.trim() || null } }),
    };
    setGuardando(true);
    try {
      await agregarParte(convenio.id, cuerpo);
      setForm(VACIO);
      setBusqueda('');
      setAbierto(false);
      onCambio();
    } catch (e) {
      if (e.errors) {
        // la API manda { "parte.nombre": [...], "representante_nombre": [...] }
        setErrores(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k.replace('parte.', ''), v[0]])));
      } else {
        setError(e.message || 'No se pudo agregar la parte.');
      }
    } finally {
      setGuardando(false);
    }
  }
 
  async function quitar(parte) {
    setError('');
    try {
      await quitarParte(convenio.id, parte.id);
      onCambio();
    } catch (e) {
      setError(e.message || 'No se pudo quitar la parte.');
    }
  }
 
  const invalido = (campo) => (errores[campo] ? 'is-invalid' : '');
  const mensaje = (campo) => errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>;
 
  return (
    <section className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h6 fw-bold mb-0">Partes y representantes</h2>
          {puedeEditar && !abierto && (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setAbierto(true)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />Agregar parte
            </button>
          )}
        </div>
 
        {partes.length < 2 && (
          <div className="alert alert-warning py-2 small" role="status">
            Hacen falta al menos dos partes (por ejemplo, la UNLPam o la unidad académica y la contraparte) para enviarlo a revisión.
          </div>
        )}
 
        {partes.length === 0 ? (
          <p className="small text-body-secondary mb-0">Todavía no hay partes cargadas.</p>
        ) : (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {partes.map((p) => (
              <li key={p.id} className="d-flex align-items-start gap-2 border rounded-3 p-2">
                <div className="flex-grow-1">
                  <p className="mb-0 fw-semibold">{p.nombre} <span className="small text-body-secondary fw-normal">· {TIPOS_PARTE[p.tipo] ?? p.tipo}</span></p>
                  <p className="small mb-0">
                    {p.pivot?.representante_nombre}{p.pivot?.representante_cargo ? `, ${p.pivot.representante_cargo}` : ''}
                    {p.pivot?.firmo_en && <span className="text-body-secondary"> · firmó el {fecha(p.pivot.firmo_en)}</span>}
                  </p>
                </div>
                {puedeEditar && (
                  <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => quitar(p)}
                    aria-label={`Quitar ${p.nombre}`}>Quitar</button>
                )}
              </li>
            ))}
          </ul>
        )}
 
        {error && <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">{error}</div>}
 
        {abierto && (
          <form onSubmit={guardar} className="border-top mt-3 pt-3" noValidate>
            <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Institución">
              <button type="button" className={`btn ${form.modo === 'existente' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => cambiar('modo', 'existente')}>Ya cargada</button>
              <button type="button" className={`btn ${form.modo === 'nueva' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => cambiar('modo', 'nueva')}>Nueva institución</button>
            </div>
 
            {form.modo === 'existente' ? (
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-5">
                  <label htmlFor="parte-buscar" className="form-label small fw-semibold">Buscar</label>
                  <input id="parte-buscar" className="form-control" placeholder="Nombre o CUIT" value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <div className="col-12 col-md-7">
                  <label htmlFor="parte-id" className="form-label small fw-semibold">Institución</label>
                  <select id="parte-id" className={`form-select ${invalido('parte_id')}`} value={form.parte_id}
                    onChange={(e) => cambiar('parte_id', e.target.value)}>
                    <option value="">Elegí…</option>
                    {opciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                  </select>
                  {mensaje('parte_id')}
                </div>
              </div>
            ) : (
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-6">
                  <label htmlFor="parte-nombre" className="form-label small fw-semibold">Nombre</label>
                  <input id="parte-nombre" className={`form-control ${invalido('nombre')}`} value={form.nombre} maxLength={200}
                    onChange={(e) => cambiar('nombre', e.target.value)} />
                  {mensaje('nombre')}
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="parte-tipo" className="form-label small fw-semibold">Tipo</label>
                  <select id="parte-tipo" className="form-select" value={form.tipo} onChange={(e) => cambiar('tipo', e.target.value)}>
                    {Object.entries(TIPOS_PARTE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="parte-cuit" className="form-label small fw-semibold">CUIT</label>
                  <input id="parte-cuit" className={`form-control ${invalido('cuit')}`} value={form.cuit} maxLength={13}
                    placeholder="30-12345678-9" onChange={(e) => cambiar('cuit', e.target.value)} />
                  {mensaje('cuit')}
                </div>
              </div>
            )}
 
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-5">
                <label htmlFor="rep-nombre" className="form-label small fw-semibold">Representante</label>
                <input id="rep-nombre" className={`form-control ${invalido('representante_nombre')}`} value={form.representante_nombre}
                  maxLength={150} onChange={(e) => cambiar('representante_nombre', e.target.value)} />
                {mensaje('representante_nombre')}
              </div>
              <div className="col-6 col-md-4">
                <label htmlFor="rep-cargo" className="form-label small fw-semibold">Cargo</label>
                <input id="rep-cargo" className="form-control" value={form.representante_cargo} maxLength={150}
                  placeholder="Ej: Rector/a" onChange={(e) => cambiar('representante_cargo', e.target.value)} />
              </div>
              <div className="col-6 col-md-3">
                <label htmlFor="rep-firmo" className="form-label small fw-semibold">Firmó el</label>
                <input id="rep-firmo" type="date" className="form-control" value={form.firmo_en}
                  onChange={(e) => cambiar('firmo_en', e.target.value)} />
              </div>
            </div>
 
            <div className="d-flex gap-2">
              <Button type="submit" loading={guardando}>Agregar</Button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setAbierto(false); setErrores({}); }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}