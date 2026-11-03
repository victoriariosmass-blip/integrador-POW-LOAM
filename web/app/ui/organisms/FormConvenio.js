
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Field from '../molecules/Field';
import Button from '../atoms/Button';
import { TIPOS } from '../../lib/formato';
 
// Formulario compartido por el alta (/convenios/nuevo) y la edición (/convenios/[id]/editar).
// - inicial: valores con los que arranca (vacío en el alta, el convenio en la edición)
// - unidades: si viene una lista, muestra el select de unidad (solo usuarios globales en el alta)
// - edicion: true muestra los campos que solo acepta el PUT
// - onGuardar(datos): la página llama a la API; si tira error 422, se muestran los errores por campo

export default function FormConvenio({ inicial = {}, unidades = null, edicion = false, onGuardar, cancelarHref, textoBoton }) {
  const [datos, setDatos] = useState({
    titulo: inicial.titulo ?? '',
    tipo: inicial.tipo ?? '',
    objeto: inicial.objeto ?? '',
    unidad_id: inicial.unidad_id ?? '',
    fecha_firma: inicial.fecha_firma?.slice(0, 10) ?? '',
    fecha_inicio: inicial.fecha_inicio?.slice(0, 10) ?? '',
    fecha_vencimiento: inicial.fecha_vencimiento?.slice(0, 10) ?? '',
    resolucion: inicial.resolucion ?? '',
    expediente: inicial.expediente ?? '',
    confidencial: Boolean(inicial.confidencial),
    notas: inicial.notas ?? '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
 
  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }
 
  // Arma lo que se manda: los vacíos van como null y solo los campos que acepta cada endpoint
  function armarCuerpo() {
    const vacioANull = (v) => (v === '' ? null : v);
    const base = {
      titulo: datos.titulo.trim(),
      tipo: datos.tipo,
      objeto: datos.objeto.trim(),
      fecha_firma: vacioANull(datos.fecha_firma),
      fecha_vencimiento: vacioANull(datos.fecha_vencimiento),
    };
    if (!edicion) {
      if (unidades) base.unidad_id = datos.unidad_id ? Number(datos.unidad_id) : null;
      return base;
    }
    return {
      ...base,
      fecha_inicio: vacioANull(datos.fecha_inicio),
      resolucion: vacioANull(datos.resolucion.trim()),
      expediente: vacioANull(datos.expediente.trim()),
      confidencial: datos.confidencial,
      notas: vacioANull(datos.notas.trim()),
    };
  }
 
  // Controles rápidos antes de llamar a la API (la API vuelve a validar todo)
  function validar(cuerpo) {
    const e = {};
    if (!cuerpo.titulo) e.titulo = 'El título es obligatorio.';
    if (!cuerpo.tipo) e.tipo = 'Elegí el tipo de convenio.';
    if (!cuerpo.objeto) e.objeto = 'El objeto es obligatorio.';
    if (unidades && !edicion && !cuerpo.unidad_id) e.unidad_id = 'Elegí la unidad del convenio.';
    const desde = edicion ? cuerpo.fecha_inicio : cuerpo.fecha_firma;
    if (cuerpo.fecha_vencimiento && !desde) {
      e[edicion ? 'fecha_inicio' : 'fecha_firma'] = edicion ? 'Para cargar el vencimiento, indicá la fecha de inicio.' : 'Para cargar el vencimiento, indicá la fecha de firma.';
    }
    if (cuerpo.fecha_vencimiento && desde && cuerpo.fecha_vencimiento <= desde) {
      e.fecha_vencimiento = edicion ? 'Tiene que ser posterior a la fecha de inicio.' : 'Tiene que ser posterior a la fecha de firma.';
    }
    return e;
  }
 
  async function enviar(ev) {
    ev.preventDefault();
    setErrorGeneral('');
    const cuerpo = armarCuerpo();
    const e = validar(cuerpo);
    setErrores(e);
    if (Object.keys(e).length) return;
 
    setGuardando(true);
    try {
      await onGuardar(cuerpo);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        // la API manda { campo: ['mensaje', ...] }
        setErrores(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      } else if (err.status === 422 && /unidad/i.test(err.message)) {
        setErrores({ unidad_id: err.message });
      } else if (err.status !== 409) {
        setErrorGeneral(err.message || 'No se pudo guardar el convenio.');
      }
    } finally {
      setGuardando(false);
    }
  }
 
  const invalido = (campo) => (errores[campo] ? 'is-invalid' : '');
 
  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
 
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">Datos principales</h2>
 
          <Field label="Título" required value={datos.titulo} error={errores.titulo}
            onChange={(e) => cambiar('titulo', e.target.value)} maxLength={255} />
 
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="tipo" className="form-label fw-semibold">Tipo<span className="text-danger"> *</span></label>
              <select id="tipo" className={`form-select ${invalido('tipo')}`} value={datos.tipo} required
                aria-invalid={!!errores.tipo || undefined} aria-describedby={errores.tipo ? 'tipo-msg' : undefined}
                onChange={(e) => cambiar('tipo', e.target.value)}>
                <option value="">Elegí un tipo…</option>
                {Object.entries(TIPOS).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
              </select>
              {errores.tipo && <div id="tipo-msg" className="invalid-feedback">{errores.tipo}</div>}
            </div>
 
            {unidades && !edicion && (
              <div className="col-12 col-md-6 mb-3">
                <label htmlFor="unidad" className="form-label fw-semibold">Unidad<span className="text-danger"> *</span></label>
                <select id="unidad" className={`form-select ${invalido('unidad_id')}`} value={datos.unidad_id} required
                  aria-invalid={!!errores.unidad_id || undefined} aria-describedby={errores.unidad_id ? 'unidad-msg' : undefined}
                  onChange={(e) => cambiar('unidad_id', e.target.value)}>
                  <option value="">Elegí la unidad…</option>
                  {unidades.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
                {errores.unidad_id && <div id="unidad-msg" className="invalid-feedback">{errores.unidad_id}</div>}
              </div>
            )}
          </div>
 
          <div className="mb-3">
            <label htmlFor="objeto" className="form-label fw-semibold">Objeto<span className="text-danger"> *</span></label>
            <textarea id="objeto" rows={4} className={`form-control ${invalido('objeto')}`} value={datos.objeto} required
              aria-invalid={!!errores.objeto || undefined} aria-describedby={errores.objeto ? 'objeto-msg' : 'objeto-ayuda'}
              onChange={(e) => cambiar('objeto', e.target.value)} />
            {errores.objeto
              ? <div id="objeto-msg" className="invalid-feedback">{errores.objeto}</div>
              : <div id="objeto-ayuda" className="form-text">Para qué se firma el convenio, en pocas líneas.</div>}
          </div>
        </div>
      </div>
 
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">Fechas</h2>
          <div className="row">
            <div className="col-12 col-md-4">
              <Field label="Fecha de firma" type="date" value={datos.fecha_firma} error={errores.fecha_firma}
                onChange={(e) => cambiar('fecha_firma', e.target.value)} />
            </div>
            {edicion && (
              <div className="col-12 col-md-4">
                <Field label="Fecha de inicio" type="date" value={datos.fecha_inicio} error={errores.fecha_inicio}
                  onChange={(e) => cambiar('fecha_inicio', e.target.value)} />
              </div>
            )}
            <div className="col-12 col-md-4">
              <Field label="Vencimiento" type="date" value={datos.fecha_vencimiento} error={errores.fecha_vencimiento}
                hint="Dejalo vacío si no vence." onChange={(e) => cambiar('fecha_vencimiento', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
 
      {edicion && (
        <div className="card mb-3">
          <div className="card-body">
            <h2 className="h6 fw-bold mb-3">Datos administrativos</h2>
            <div className="row">
              <div className="col-12 col-md-6">
                <Field label="Resolución" value={datos.resolucion} error={errores.resolucion} maxLength={50}
                  onChange={(e) => cambiar('resolucion', e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Expediente" value={datos.expediente} error={errores.expediente} maxLength={50}
                  onChange={(e) => cambiar('expediente', e.target.value)} />
              </div>
            </div>
            <div className="form-check mb-3">
              <input id="confidencial" type="checkbox" className="form-check-input" checked={datos.confidencial}
                onChange={(e) => cambiar('confidencial', e.target.checked)} />
              <label htmlFor="confidencial" className="form-check-label">Confidencial (no lo ve el rol de consulta)</label>
            </div>
            <div>
              <label htmlFor="notas" className="form-label fw-semibold">Notas internas</label>
              <textarea id="notas" rows={3} className="form-control" value={datos.notas}
                onChange={(e) => cambiar('notas', e.target.value)} />
            </div>
          </div>
        </div>
      )}
 
      <div className="d-flex gap-2">
        <Button type="submit" loading={guardando}>{textoBoton}</Button>
        <Link href={cancelarHref} className="btn btn-outline-secondary">Cancelar</Link>
      </div>
    </form>
  );
}