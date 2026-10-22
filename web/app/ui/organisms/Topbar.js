'use client';
import { useUsuario } from '../../lib/UsuarioContext';
import { NOMBRE_ROL } from '../../lib/permisos';

export default function Topbar() {
  const usuario = useUsuario();
  return (
    <header className="navbar bg-light border-bottom px-3">
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline-secondary d-md-none" type="button"
                data-bs-toggle="offcanvas" data-bs-target="#menuMovil" aria-controls="menuMovil" aria-label="Abrir menú">
          <i className="bi bi-list" aria-hidden="true" />
        </button>
        <span className="navbar-brand fw-bold mb-0">Convenios UNLPam</span>
      </div>

      <form role="search" className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: 440 }}>
        <label htmlFor="busqueda" className="visually-hidden">Buscar convenios</label>
        <input id="busqueda" type="search" className="form-control" placeholder="Buscar convenios…" />
      </form>

      <div className="d-flex align-items-center gap-3">
        <button type="button" className="btn btn-link link-dark" aria-label="Alertas">
          <i className="bi bi-bell fs-5" aria-hidden="true" />
        </button>
        <i className="bi bi-person-circle fs-3 text-secondary" aria-hidden="true" />
        <span className="small text-secondary d-none d-sm-inline">{usuario.name} · {NOMBRE_ROL[usuario.rol]}</span>
      </div>
    </header>
  );
}