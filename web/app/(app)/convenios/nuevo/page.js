'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUsuario } from '../../../lib/UsuarioContext';
import { puede } from '../../../lib/permisos';
import { crearConvenio, listarUnidades } from '../../../lib/convenios';
import FormConvenio from '../../../ui/organisms/FormConvenio';
 
export default function NuevoConvenio() {
  const usuario = useUsuario();
  const router = useRouter();
  const esGlobal = usuario.unidad_id === null; // admin: tiene que elegir la unidad
  const [unidades, setUnidades] = useState(null);
  const [errorUnidades, setErrorUnidades] = useState('');
 
  useEffect(() => {
    if (!esGlobal) return;
    listarUnidades()
      .then((r) => setUnidades(r.data))
      .catch(() => setErrorUnidades('No se pudo cargar la lista de unidades.'));
  }, [esGlobal]);
 
  if (!puede(usuario, 'crearConvenio')) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-lock fs-1 text-secondary" aria-hidden="true" />
        <p className="mt-2">Tu rol no puede cargar convenios.</p>
        <Link href="/convenios" className="btn btn-outline-secondary">Volver al listado</Link>
      </div>
    );
  }
 
  async function guardar(datos) {
    const r = await crearConvenio(datos);
    router.push(`/convenios/${r.data.id}?creado=1`);
  }
 
  return (
    <>
      <nav aria-label="Ruta" className="mb-2">
        <Link href="/convenios" className="small"><i className="bi bi-arrow-left me-1" aria-hidden="true" />Convenios</Link>
      </nav>
      <h1 className="h4 mb-1">Nuevo convenio</h1>
      <p className="text-body-secondary mb-4">Se guarda como borrador. Después podés completarlo y enviarlo a revisión.</p>
 
      {errorUnidades && <div className="alert alert-danger" role="alert">{errorUnidades}</div>}
      {esGlobal && !unidades && !errorUnidades ? (
        <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Cargando…</span></div>
      ) : (
        <FormConvenio unidades={esGlobal ? unidades : null} onGuardar={guardar}
          cancelarHref="/convenios" textoBoton="Guardar borrador" />
      )}
    </>
  );
}