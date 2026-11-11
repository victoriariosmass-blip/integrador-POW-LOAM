'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { NOMBRE_ROL } from '../../lib/permisos';
import { calcularAlertas } from '../../lib/alertas';

export default function Topbar() {
  const usuario = useUsuario();
  const [urgentes, setUrgentes] = useState(0); // alertas de vencimiento (las que no son del circuito)

  useEffect(() => {
    calcularAlertas(usuario)
      .then((lista) => setUrgentes(lista.filter((a) => a.nivel !== 'info').length))
      .catch(() => setUrgentes(0)); // si falla, la campanita queda sin número
  }, [usuario]);
  return (
    <header className="navbar app-topbar border-bottom px-3">
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
        <Link href="/alertas" className="btn btn-link link-dark px-2"
          aria-label={urgentes ? `Alertas: ${urgentes} sin resolver` : 'Alertas'}>
          <span className="position-relative d-inline-block">
            <i className="bi bi-bell fs-5" aria-hidden="true" />
            {urgentes > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem', marginTop: '0.3rem' }} aria-hidden="true">
                {urgentes}
              </span>
            )}
          </span>
        </Link>
        <i className="bi bi-person-circle fs-3 text-secondary" aria-hidden="true" />
        <span className="small text-secondary d-none d-sm-inline">{usuario.name} · {NOMBRE_ROL[usuario.rol]}</span>
      </div>
    </header>
  );
}