'use client';
import { useEffect, useState } from 'react';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede, NOMBRE_ROL } from '../../lib/permisos';
import { listarUsuarios, crearUsuario, editarUsuario } from '../../lib/usuarios';
import { listarUnidades } from '../../lib/convenios';
import FormUsuario from '../../ui/organisms/FormUsuario';
 
// Administración: alta, edición y desactivación de usuarios. Solo admin.
// Los usuarios no se borran: se desactivan (no pueden entrar, pero su historial queda).
export default function Administracion() {
  const usuario = useUsuario();
  const [filtros, setFiltros] = useState({ q: '', rol: '', page: 1 });
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState(null); // null = cerrado, {} = alta, {usuario} = edición
  const [aviso, setAviso] = useState('');
 
  const esAdmin = puede(usuario, 'administrar');
 
  useEffect(() => {
    if (esAdmin) listarUnidades().then((r) => setUnidades(r.data)).catch(() => setUnidades([]));
  }, [esAdmin]);
 
  useEffect(() => {
    if (!esAdmin) return;
    let vigente = true;
    setCargando(true);
    setError('');
    listarUsuarios(filtros)
      .then((r) => vigente && setResultado(r))
      .catch((e) => vigente && setError(e.message || 'No se pudo cargar la lista de usuarios'))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [filtros, esAdmin]);
 
  if (!esAdmin) {
    return (
      <div className="alert alert-warning" role="alert">
        Esta sección es solo para el rol de administración.
      </div>
    );
  }
 
  function recargar(mensaje) {
    setFormulario(null);
    setAviso(mensaje);
    setFiltros((f) => ({ ...f })); // vuelve a pedir la página actual
  }
 
  async function guardar(datos) {
    if (formulario?.usuario) {
      await editarUsuario(formulario.usuario.id, datos);
      recargar('Los cambios se guardaron.');
    } else {
      await crearUsuario(datos);
      recargar('El usuario se creó. Ya puede iniciar sesión con su email y la contraseña que cargaste.');
    }
  }
 
  async function cambiarActivo(u) {
    setAviso('');
    setError('');
    try {
      await editarUsuario(u.id, { activo: !u.activo });
      recargar(u.activo ? `${u.name} quedó desactivado: ya no puede iniciar sesión.` : `${u.name} quedó activo otra vez.`);
    } catch (e) {
      setError(e.message || 'No se pudo cambiar el estado del usuario.');
    }
  }
 
  const usuarios = resultado?.data ?? [];
 
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Administración</h1>
        {!formulario && (
          <button type="button" className="btn btn-primary" onClick={() => { setAviso(''); setFormulario({}); }}>
            <i className="bi bi-person-plus me-2" aria-hidden="true" />Nuevo usuario
          </button>
        )}
      </div>
      <p className="text-body-secondary">Usuarios del sistema, su rol y su unidad.</p>
 
      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
 
      {formulario && (
        <FormUsuario
          key={formulario.usuario?.id ?? 'nuevo'}
          inicial={formulario.usuario ?? null}
          unidades={unidades}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      )}
 
      {/* Filtros */}
      <form className="row g-2 mb-3" role="search" onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, q: texto.trim(), page: 1 })); }}>
        <div className="col-12 col-md-6">
          <label htmlFor="buscar-usuario" className="visually-hidden">Buscar por nombre o email</label>
          <div className="input-group">
            <input id="buscar-usuario" type="search" className="form-control" placeholder="Buscar por nombre o email"
              value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className="btn btn-outline-secondary" type="submit" aria-label="Buscar">
              <i className="bi bi-search" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <label htmlFor="filtro-rol" className="visually-hidden">Rol</label>
          <select id="filtro-rol" className="form-select" value={filtros.rol}
            onChange={(e) => setFiltros((f) => ({ ...f, rol: e.target.value, page: 1 }))}>
            <option value="">Todos los roles</option>
            {Object.entries(NOMBRE_ROL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </form>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {cargando && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando usuarios…</p>
        </div>
      )}
 
      {!cargando && !error && usuarios.length === 0 && (
        <p className="text-center text-body-secondary py-5">No hay usuarios que coincidan con la búsqueda.</p>
      )}
 
      {!cargando && usuarios.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption className="visually-hidden">Usuarios del sistema</caption>
              <thead className="table-light">
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col" className="d-none d-md-table-cell">Email</th>
                  <th scope="col">Rol</th>
                  <th scope="col" className="d-none d-md-table-cell">Unidad</th>
                  <th scope="col">Estado</th>
                  <th scope="col"><span className="visually-hidden">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.activo ? '' : 'text-body-secondary'}>
                    <td>{u.name}{u.id === usuario.id && <span className="badge text-bg-light ms-2">Vos</span>}</td>
                    <td className="d-none d-md-table-cell">{u.email}</td>
                    <td>{NOMBRE_ROL[u.rol] ?? u.rol}</td>
                    <td className="d-none d-md-table-cell">{u.unidad?.sigla ?? 'Global'}</td>
                    <td>
                      <span className={`badge ${u.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {u.activo ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-2"
                        aria-label={`Editar a ${u.name}`}
                        onClick={() => { setAviso(''); setFormulario({ usuario: u }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <i className="bi bi-pencil" aria-hidden="true" /> <span className="d-none d-lg-inline">Editar</span>
                      </button>
                      {u.id !== usuario.id && (
                        <button type="button" className={`btn btn-sm ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => cambiarActivo(u)}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {resultado.last_page > 1 ? (
            <nav aria-label="Páginas" className="d-flex justify-content-between align-items-center">
              <span className="small text-body-secondary">{resultado.total} usuarios</span>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" disabled={resultado.current_page <= 1}
                  onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}>Anterior</button>
                <span className="btn btn-outline-secondary btn-sm disabled">{resultado.current_page} de {resultado.last_page}</span>
                <button className="btn btn-outline-secondary btn-sm" disabled={resultado.current_page >= resultado.last_page}
                  onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}>Siguiente</button>
              </div>
            </nav>
          ) : (
            <p className="small text-body-secondary">{resultado.total} usuarios</p>
          )}
        </>
      )}
    </>
  );
}