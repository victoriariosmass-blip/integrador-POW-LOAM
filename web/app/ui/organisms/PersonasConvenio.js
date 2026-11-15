'use client';
import { useState } from 'react';
import Button from '../atoms/Button';
import { agregarPersona, quitarPersona } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
// Personas vinculadas al convenio y datos de pasantía.
// Enunciado: "registrar personas vinculadas, rol y período. Para pasantías, documentar los datos
// complementarios pertinentes, como carrera, tutorías, carga horaria, asignación o seguro, usando datos ficticios."
const ROLES = {
  pasante: 'Pasante',
  tutor_docente: 'Tutor/a docente',
  tutor_institucional: 'Tutor/a institucional',
  responsable: 'Responsable',
  coordinador: 'Coordinador/a',
  otro: 'Otro',
};
 
const VACIO = {
  nombre: '', apellido: '', email: '', rol: 'responsable', fecha_desde: '', fecha_hasta: '',
  carrera: '', horas_semanales: '', asignacion_estimulo: '', seguro: '', plan_trabajo: '',
};
 
const periodo = (v) => [v.fecha_desde && `desde ${fecha(v.fecha_desde)}`, v.fecha_hasta && `hasta ${fecha(v.fecha_hasta)}`].filter(Boolean).join(' ');
 
export default function PersonasConvenio({ convenio, puedeEditar, onCambio }) {
  const personas = convenio.personas ?? [];
  const esPasantia = convenio.tipo === 'especifico_pasantia';
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ ...VACIO, rol: esPasantia ? 'pasante' : 'responsable' });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
 
  const conPasantia = esPasantia && form.rol === 'pasante';
  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };
 
  async function guardar(ev) {
    ev.preventDefault();
    setError('');
    const cuerpo = {
      persona: { nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim() || null },
      rol: form.rol,
      fecha_desde: form.fecha_desde || null,
      fecha_hasta: form.fecha_hasta || null,
      ...(conPasantia && {
        pasantia: {
          carrera: form.carrera.trim(),
          horas_semanales: form.horas_semanales === '' ? null : Number(form.horas_semanales),
          asignacion_estimulo: form.asignacion_estimulo === '' ? null : Number(form.asignacion_estimulo),
          seguro: form.seguro.trim() || null,
          plan_trabajo: form.plan_trabajo.trim() || null,
        },
      }),
    };
    setGuardando(true);
    try {
      await agregarPersona(convenio.id, cuerpo);
      setForm({ ...VACIO, rol: esPasantia ? 'pasante' : 'responsable' });
      setAbierto(false);
      onCambio();
    } catch (e) {
      if (e.errors) {
        setErrores(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k.replace(/^(persona|pasantia)\./, ''), v[0]])));
      } else {
        setError(e.message || 'No se pudo agregar la persona.');
      }
    } finally {
      setGuardando(false);
    }
  }
 
  async function quitar(v) {
    setError('');
    try {
      await quitarPersona(convenio.id, v.id);
      onCambio();
    } catch (e) {
      setError(e.message || 'No se pudo quitar la persona.');
    }
  }
 
  const invalido = (campo) => (errores[campo] ? 'is-invalid' : '');
  const mensaje = (campo) => errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>;
  const campo = (id, etiqueta, props = {}) => (
    <>
      <label htmlFor={`per-${id}`} className="form-label small fw-semibold">{etiqueta}</label>
      <input id={`per-${id}`} className={`form-control ${invalido(id)}`} value={form[id]}
        onChange={(e) => cambiar(id, e.target.value)} {...props} />
      {mensaje(id)}
    </>
  );
 
  return (
    <section className="card">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h6 fw-bold mb-0">{esPasantia ? 'Personas y datos de la pasantía' : 'Personas vinculadas'}</h2>
          {puedeEditar && !abierto && (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setAbierto(true)}>
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />Agregar persona
            </button>
          )}
        </div>
 
        {personas.length === 0 ? (
          <p className="small text-body-secondary mb-0">Todavía no hay personas vinculadas.</p>
        ) : (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {personas.map((v) => (
              <li key={v.id} className="d-flex align-items-start gap-2 border rounded-3 p-2">
                <div className="flex-grow-1">
                  <p className="mb-0 fw-semibold">
                    {v.persona?.nombre} {v.persona?.apellido}{' '}
                    <span className="small text-body-secondary fw-normal">· {ROLES[v.rol] ?? v.rol}{periodo(v) && ` · ${periodo(v)}`}</span>
                  </p>
                  {v.datos_pasantia && (
                    <p className="small mb-0">
                      {v.datos_pasantia.carrera} · {v.datos_pasantia.horas_semanales} h semanales
                      {v.datos_pasantia.asignacion_estimulo != null && ` · asignación $ ${Number(v.datos_pasantia.asignacion_estimulo).toLocaleString('es-AR')}`}
                      {v.datos_pasantia.seguro && ` · seguro: ${v.datos_pasantia.seguro}`}
                    </p>
                  )}
                </div>
                {puedeEditar && (
                  <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => quitar(v)}
                    aria-label={`Quitar a ${v.persona?.nombre} ${v.persona?.apellido}`}>Quitar</button>
                )}
              </li>
            ))}
          </ul>
        )}
 
        {error && <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">{error}</div>}
 
        {abierto && (
          <form onSubmit={guardar} className="border-top mt-3 pt-3" noValidate>
            <p className="small text-body-secondary">Usá datos ficticios: no se cargan documentos ni datos sensibles.</p>
            <div className="row g-2 mb-2">
              <div className="col-6 col-md-4">{campo('nombre', 'Nombre', { maxLength: 100 })}</div>
              <div className="col-6 col-md-4">{campo('apellido', 'Apellido', { maxLength: 100 })}</div>
              <div className="col-12 col-md-4">{campo('email', 'Email (opcional)', { type: 'email' })}</div>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-12 col-md-4">
                <label htmlFor="per-rol" className="form-label small fw-semibold">Rol</label>
                <select id="per-rol" className="form-select" value={form.rol} onChange={(e) => cambiar('rol', e.target.value)}>
                  {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-4">{campo('fecha_desde', 'Desde', { type: 'date' })}</div>
              <div className="col-6 col-md-4">{campo('fecha_hasta', 'Hasta', { type: 'date' })}</div>
            </div>
 
            {conPasantia && (
              <fieldset className="border rounded-3 p-2 mb-2">
                <legend className="float-none w-auto px-1 small fw-semibold mb-0">Datos de la pasantía</legend>
                <div className="row g-2">
                  <div className="col-12 col-md-6">{campo('carrera', 'Carrera', { maxLength: 150 })}</div>
                  <div className="col-6 col-md-3">{campo('horas_semanales', 'Horas semanales', { type: 'number', min: 1, max: 20 })}</div>
                  <div className="col-6 col-md-3">{campo('asignacion_estimulo', 'Asignación ($)', { type: 'number', min: 0 })}</div>
                  <div className="col-12 col-md-6">{campo('seguro', 'Seguro (ART)', { maxLength: 150 })}</div>
                  <div className="col-12">
                    <label htmlFor="per-plan_trabajo" className="form-label small fw-semibold">Plan de trabajo</label>
                    <textarea id="per-plan_trabajo" rows={2} className="form-control" value={form.plan_trabajo}
                      onChange={(e) => cambiar('plan_trabajo', e.target.value)} />
                  </div>
                </div>
                <p className="form-text mb-0">Hasta 20 horas semanales (Ley 26.427 de pasantías educativas).</p>
              </fieldset>
            )}
 
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