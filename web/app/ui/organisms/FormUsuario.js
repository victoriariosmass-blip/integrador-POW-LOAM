'use client';
import { useState } from 'react';
import Field from '../molecules/Field';
import Button from '../atoms/Button';
import { NOMBRE_ROL } from '../../lib/permisos';
 
// Alta y edición de un usuario (pantalla de Administración).
// - inicial: el usuario a editar, o nada para el alta
// - unidades: lista de GET /api/unidades
// - onGuardar(datos): la página llama a la API; si tira 422, se muestran los errores por campo
export default function FormUsuario({ inicial = null, unidades = [], onGuardar, onCancelar }) {
  const edicion = Boolean(inicial);
  const [datos, setDatos] = useState({
    name: inicial?.name ?? '',
    email: inicial?.email ?? '',
    rol: inicial?.rol ?? 'consulta',
    unidad_id: inicial?.unidad_id ?? '',
    password: '',
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);
 
  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }
 
  function validar() {
    const e = {};
    if (!datos.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) e.email = 'El email no es válido.';
    if (!edicion && !datos.password) e.password = 'La contraseña es obligatoria.';
    if (datos.password && datos.password.length < 8) e.password = 'La contraseña tiene que tener al menos 8 caracteres.';
    return e;
  }
 
  async function enviar(ev) {
    ev.preventDefault();
    setErrorGeneral('');
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
 
    const cuerpo = {
      name: datos.name.trim(),
      email: datos.email.trim().toLowerCase(),
      rol: datos.rol,
      unidad_id: datos.unidad_id ? Number(datos.unidad_id) : null,
    };
    if (datos.password) cuerpo.password = datos.password; // en la edición, vacío = no se cambia
 
    setGuardando(true);
    try {
      await onGuardar(cuerpo);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setErrores(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      } else {
        setErrorGeneral(err.message || 'No se pudo guardar el usuario.');
      }
    } finally {
      setGuardando(false);
    }
  }
 
  return (
    <form onSubmit={enviar} noValidate className="card mb-4">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">{edicion ? `Editar a ${inicial.name}` : 'Nuevo usuario'}</h2>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
 
        <div className="row">
          <div className="col-12 col-md-6">
            <Field label="Nombre y apellido" required value={datos.name} error={errores.name} maxLength={150}
              onChange={(e) => cambiar('name', e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Email" type="email" required value={datos.email} error={errores.email} maxLength={150}
              autoComplete="off" onChange={(e) => cambiar('email', e.target.value)} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="rol" className="form-label fw-semibold">Rol<span className="text-danger"> *</span></label>
            <select id="rol" className="form-select" value={datos.rol} onChange={(e) => cambiar('rol', e.target.value)}>
              {Object.entries(NOMBRE_ROL).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label htmlFor="unidad" className="form-label fw-semibold">Unidad</label>
            <select id="unidad" className={`form-select ${errores.unidad_id ? 'is-invalid' : ''}`} value={datos.unidad_id}
              aria-describedby="unidad-ayuda" onChange={(e) => cambiar('unidad_id', e.target.value)}>
              <option value="">Todas (alcance global)</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
            {errores.unidad_id
              ? <div className="invalid-feedback">{errores.unidad_id}</div>
              : <div id="unidad-ayuda" className="form-text">Con una unidad, el usuario solo ve los convenios de esa unidad.</div>}
          </div>
          <div className="col-12 col-md-6">
            <Field label={edicion ? 'Nueva contraseña' : 'Contraseña'} type="password" required={!edicion}
              value={datos.password} error={errores.password} autoComplete="new-password"
              hint={edicion ? 'Dejala vacía para no cambiarla.' : 'Mínimo 8 caracteres.'}
              onChange={(e) => cambiar('password', e.target.value)} />
          </div>
        </div>
 
        <div className="d-flex gap-2">
          <Button type="submit" loading={guardando}>{edicion ? 'Guardar cambios' : 'Crear usuario'}</Button>
          <Button variant="secondary" onClick={onCancelar} disabled={guardando}>Cancelar</Button>
        </div>
      </div>
    </form>
  );
}