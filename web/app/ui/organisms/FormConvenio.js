'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Field from '../molecules/Field';
import Button from '../atoms/Button';
import { TIPOS } from '../../lib/formato';
 
// Formulario compartido por el alta (/convenios/nuevo) y la edición (/convenios/[id]/editar).
// - inicial: valores con los que arranca (vacío en el alta, el convenio en la edición)
// - unidades: si viene una lista, muestra el select de unidad (solo usuarios globales en el alta)
// - edicion: true en /editar (la fecha de vencimiento se compara con la de inicio en vez de la de firma)
// Tiene todos los datos de la ficha que pide el enunciado: objeto, alcance, obligaciones, rescisión,
// marco legal, resolución, expediente, renovación, confidencialidad, notas y las fechas.
// - onGuardar(datos): la página llama a la API; si tira error 422, se muestran los errores por campo
 
// Campo de texto largo con su etiqueta, ayuda y error (accesible: el error queda asociado al campo)
function AreaTexto({ id, etiqueta, valor, onCambio, error, ayuda }) {
  const descripcion = error ? `${id}-msg` : ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">{etiqueta}</label>
      <textarea id={id} rows={3} className={`form-control ${error ? 'is-invalid' : ''}`} value={valor}
        aria-invalid={!!error || undefined} aria-describedby={descripcion}
        onChange={(e) => onCambio(e.target.value)} />
      {error
        ? <div id={`${id}-msg`} className="invalid-feedback">{error}</div>
        : ayuda && <div id={`${id}-ayuda`} className="form-text">{ayuda}</div>}
    </div>
  );
}
 
// Campos que tienen su lugar en el formulario (los demás errores de la API se muestran arriba)
const CAMPOS = [
  'titulo', 'tipo', 'objeto', 'unidad_id', 'fecha_firma', 'fecha_inicio', 'fecha_vencimiento', 'dias_preaviso',
  'alcance', 'obligaciones', 'condiciones_rescision', 'marco_legal', 'condiciones_renovacion', 'resolucion', 'expediente',
];

export default function FormConvenio({ inicial = {}, unidades = null, edicion = false, onGuardar, cancelarHref, textoBoton }) {
  const [datos, setDatos] = useState({
    titulo: inicial.titulo ?? '',
    tipo: inicial.tipo ?? '',
    objeto: inicial.objeto ?? '',
    unidad_id: inicial.unidad_id ?? '',
    fecha_firma: inicial.fecha_firma?.slice(0, 10) ?? '',
    fecha_inicio: inicial.fecha_inicio?.slice(0, 10) ?? '',
    fecha_vencimiento: inicial.fecha_vencimiento?.slice(0, 10) ?? '',
    dias_preaviso: inicial.dias_preaviso ?? '',
    alcance: inicial.alcance ?? '',
    obligaciones: inicial.obligaciones ?? '',
    condiciones_rescision: inicial.condiciones_rescision ?? '',
    marco_legal: inicial.marco_legal ?? '',
    condiciones_renovacion: inicial.condiciones_renovacion ?? '',
    renovacion_automatica: Boolean(inicial.renovacion_automatica),
    resolucion: inicial.resolucion ?? '',
    expediente: inicial.expediente ?? '',
    confidencial: Boolean(inicial.confidencial),
    notas: inicial.notas ?? '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
  const formRef = useRef(null);

  // Después de mostrar los errores, el foco va al primer campo marcado (así el lector de pantalla
  // lee el error y con teclado no hay que buscarlo). Si el error es general, al aviso de arriba.
  function enfocarError() {
    requestAnimationFrame(() => {
      const form = formRef.current;
      (form?.querySelector('[aria-invalid="true"]') ?? form?.querySelector('.alert-danger'))?.focus();
    });
  }

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }
 
  // Arma lo que se manda a la API: los textos vacíos van como null
  function armarCuerpo() {
    const texto = (v) => (v.trim() === '' ? null : v.trim());
    const fechaONull = (v) => (v === '' ? null : v);
    const cuerpo = {
      titulo: datos.titulo.trim(),
      tipo: datos.tipo,
      objeto: datos.objeto.trim(),
      alcance: texto(datos.alcance),
      obligaciones: texto(datos.obligaciones),
      condiciones_rescision: texto(datos.condiciones_rescision),
      marco_legal: texto(datos.marco_legal),
      condiciones_renovacion: texto(datos.condiciones_renovacion),
      renovacion_automatica: datos.renovacion_automatica,
      resolucion: texto(datos.resolucion),
      expediente: texto(datos.expediente),
      confidencial: datos.confidencial,
      notas: texto(datos.notas),
      fecha_firma: fechaONull(datos.fecha_firma),
      fecha_inicio: fechaONull(datos.fecha_inicio),
      fecha_vencimiento: fechaONull(datos.fecha_vencimiento),
      dias_preaviso: datos.dias_preaviso === '' ? null : Number(datos.dias_preaviso),
    };
    if (!edicion && unidades) cuerpo.unidad_id = datos.unidad_id ? Number(datos.unidad_id) : null;
    return cuerpo;
  }
 
  // Controles rápidos antes de llamar a la API (la API vuelve a validar todo)
  function validar(cuerpo) {
    const e = {};
    if (!cuerpo.titulo) e.titulo = 'El título es obligatorio.';
    if (!cuerpo.tipo) e.tipo = 'Seleccione el tipo de convenio.';
    if (!cuerpo.objeto) e.objeto = 'El objeto es obligatorio.';
    if (unidades && !edicion && !cuerpo.unidad_id) e.unidad_id = 'Seleccione la unidad del convenio.';
    const desde = edicion ? cuerpo.fecha_inicio : cuerpo.fecha_firma;
    if (cuerpo.fecha_vencimiento && !desde) {
      e[edicion ? 'fecha_inicio' : 'fecha_firma'] = edicion ? 'Para cargar el vencimiento, indique la fecha de inicio.' : 'Para cargar el vencimiento, indique la fecha de firma.';
    }
    if (cuerpo.fecha_vencimiento && desde && cuerpo.fecha_vencimiento <= desde) {
      e.fecha_vencimiento = edicion ? 'Tiene que ser posterior a la fecha de inicio.' : 'Tiene que ser posterior a la fecha de firma.';
    }
    if (cuerpo.dias_preaviso !== null && (!Number.isInteger(cuerpo.dias_preaviso) || cuerpo.dias_preaviso < 0)) {
      e.dias_preaviso = 'Tiene que ser un número de días (0 o más).';
    }
    return e;
  }
 
  async function enviar(ev) {
    ev.preventDefault();
    setErrorGeneral('');
    const cuerpo = armarCuerpo();
    const e = validar(cuerpo);
    setErrores(e);
    if (Object.keys(e).length) {
      enfocarError();
      return;
    }

    setGuardando(true);
    try {
      await onGuardar(cuerpo);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        // la API manda { campo: ['mensaje', ...] }
        const porCampo = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]]));
        setErrores(porCampo);
        // los que no son de un campo del formulario (version, partes...) van arriba: si no, no se verían
        const sueltos = Object.entries(porCampo).filter(([k]) => !CAMPOS.includes(k)).map(([, m]) => m);
        if (sueltos.length) setErrorGeneral(sueltos.join(' '));
        enfocarError();
      } else if (err.status === 422 && /unidad/i.test(err.message)) {
        setErrores({ unidad_id: err.message });
        enfocarError();
      } else if (err.status !== 409) {
        setErrorGeneral(err.message || 'No se pudo guardar el convenio.');
        enfocarError();
      }
    } finally {
      setGuardando(false);
    }
  }
 
  const invalido = (campo) => (errores[campo] ? 'is-invalid' : '');
 
  return (
    <form ref={formRef} onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert" tabIndex={-1}>{errorGeneral}</div>}
 
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
                <option value="">Seleccione un tipo…</option>
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
                  <option value="">Seleccione la unidad…</option>
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
            <div className="col-12 col-md-4">
              <Field label="Fecha de inicio" type="date" value={datos.fecha_inicio} error={errores.fecha_inicio}
                onChange={(e) => cambiar('fecha_inicio', e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <Field label="Vencimiento" type="date" value={datos.fecha_vencimiento} error={errores.fecha_vencimiento}
                hint="Déjelo vacío si no vence." onChange={(e) => cambiar('fecha_vencimiento', e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <Field label="Preaviso (días)" type="number" min={0} value={datos.dias_preaviso} error={errores.dias_preaviso}
                hint="Con cuántos días de anticipación hay que avisar si no se renueva." onChange={(e) => cambiar('dias_preaviso', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
 
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">Contenido del convenio</h2>
          <AreaTexto id="alcance" etiqueta="Alcance" valor={datos.alcance} onCambio={(v) => cambiar('alcance', v)}
            error={errores.alcance} ayuda="Hasta dónde llega: actividades, áreas o personas que abarca." />
          <AreaTexto id="obligaciones" etiqueta="Obligaciones de las partes" valor={datos.obligaciones}
            onCambio={(v) => cambiar('obligaciones', v)} error={errores.obligaciones} />
          <AreaTexto id="condiciones_rescision" etiqueta="Condiciones de rescisión" valor={datos.condiciones_rescision}
            onCambio={(v) => cambiar('condiciones_rescision', v)} error={errores.condiciones_rescision} />
          <AreaTexto id="marco_legal" etiqueta="Marco legal" valor={datos.marco_legal}
            onCambio={(v) => cambiar('marco_legal', v)} error={errores.marco_legal} ayuda="Leyes, ordenanzas o resoluciones en las que se basa." />
        </div>
      </div>
 
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">Renovación</h2>
          <AreaTexto id="condiciones_renovacion" etiqueta="Condiciones de renovación" valor={datos.condiciones_renovacion}
            onCambio={(v) => cambiar('condiciones_renovacion', v)} error={errores.condiciones_renovacion} />
          <div className="form-check">
            <input id="renovacion_automatica" type="checkbox" className="form-check-input" checked={datos.renovacion_automatica}
              onChange={(e) => cambiar('renovacion_automatica', e.target.checked)} />
            <label htmlFor="renovacion_automatica" className="form-check-label">Se renueva automáticamente al vencer</label>
          </div>
        </div>
      </div>
 
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
 
      <div className="d-flex gap-2">
        <Button type="submit" loading={guardando}>{textoBoton}</Button>
        <Link href={cancelarHref} className="btn btn-outline-secondary">Cancelar</Link>
      </div>
    </form>
  );
}