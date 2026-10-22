'use client';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede } from '../../lib/permisos';
 
export default function Convenios() {
  const usuario = useUsuario();
 
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h1 className="h3 mb-0">Convenios</h1>
      {puede(usuario, 'crearConvenio') && (
        <Link href="/convenios/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />Nuevo convenio
        </Link>
      )}
    </div>
  );
}