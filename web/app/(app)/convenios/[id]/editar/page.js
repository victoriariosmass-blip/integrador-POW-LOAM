'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { verConvenio, editarConvenio } from '../../../../lib/convenios';
import FormConvenio from '../../../../ui/organisms/FormConvenio';
 
export default function EditarConvenio() {
  const { id } = useParams();
  const router = useRouter();
  const [convenio, setConvenio] = useState(null);
  const [error, setError] = useState(null);
  const [conflicto, setConflicto] = useState(false);
  const [recarga, setRecarga] = useState(0); // cambia la key del form para que arranque con los datos nuevos
  const avisoRef = useRef(null);
 
  // el aviso del 409 queda arriba: se lleva la vista hasta ahí
  useEffect(() => {
    if (conflicto) avisoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [conflicto]);
 
  const cargar = useCallback(() => {
    setError(null);
    setConvenio(null);
    verConvenio(id)
      .then((r) => { setConvenio(r.data); setRecarga((n) => n + 1); })
      .catch((e) => setError(e));
  }, [id]);
 
  useEffect(() => { cargar(); }, [cargar]);
 
  async function guardar(datos) {
    setConflicto(false);
    try {
      // version = la que tenía el convenio cuando se abrió la pantalla
      await editarConvenio(id, { ...datos, version: convenio.version });
      router.push(`/convenios/${id}?editado=1`);
    } catch (e) {
      if (e.status === 409) setConflicto(true); // otra persona lo cambió mientras tanto
      throw e;
    }
  }
 
  function recargar() {
    setConflicto(false);
    cargar();
  }
 
  if (error) {
    const texto = error.status === 403 ? 'No tenés permiso para ver este convenio.'
      : error.status === 404 ? 'El convenio no existe.' : (error.message || 'No se pudo cargar el convenio.');
    return (
      <div className="text-center py-5">
        <p>{texto}</p>
        <Link href="/convenios" className="btn btn-outline-secondary">Volver al listado</Link>
      </div>
    );
  }
 
  if (!convenio) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-secondary" aria-hidden="true" />
        <p className="text-body-secondary mt-2 mb-0">Cargando convenio…</p>
      </div>
    );
  }
 
  // la API dice si se puede editar (solo borradores, admin o gestor de la unidad)
  if (!convenio.permisos?.editar) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-lock fs-1 text-secondary" aria-hidden="true" />
        <p className="mt-2">Este convenio no se puede editar. Solo se editan los borradores.</p>
        <Link href={`/convenios/${id}`} className="btn btn-outline-secondary">Volver a la ficha</Link>
      </div>
    );
  }
 
  return (
    <>
      <nav aria-label="Ruta" className="mb-2">
        <Link href={`/convenios/${id}`} className="small"><i className="bi bi-arrow-left me-1" aria-hidden="true" />{convenio.codigo}</Link>
      </nav>
      <h1 className="h4 mb-4">Editar convenio</h1>
 
      {conflicto && (
        <div ref={avisoRef} className="alert alert-warning d-flex flex-wrap align-items-center gap-2" role="alert">
          <span className="me-auto">El convenio cambió mientras lo editabas. Recargalo para ver los cambios (lo que escribiste se pierde).</span>
          <button type="button" className="btn btn-sm btn-warning" onClick={recargar}>Recargar</button>
        </div>
      )}
 
      <FormConvenio key={recarga} inicial={convenio} edicion onGuardar={guardar}
        cancelarHref={`/convenios/${id}`} textoBoton="Guardar cambios" />
    </>
  );
}