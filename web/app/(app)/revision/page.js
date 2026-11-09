'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede } from '../../lib/permisos';
import { accionConvenio } from '../../lib/convenios';
import { listarTodos } from '../../lib/listados';
import { TIPOS, fecha } from '../../lib/formato';
import Button from '../../ui/atoms/Button';
 
// Bandeja de revisión: los convenios en revisión que el usuario puede ver
// (el revisor, solo los que tiene asignados; el admin, todos), con aprobar y
// devolver sin tener que entrar a cada ficha.
export default function Revision() {
  const usuario = useUsuario();
  const [convenios, setConvenios] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [devolviendo, setDevolviendo] = useState(null); // id del convenio que se está devolviendo
  const [observaciones, setObservaciones] = useState('');
  const [trabajando, setTrabajando] = useState(null); // id del convenio con un pedido en curso
 
  const cargar = useCallback(() => {
    listarTodos({ estado: 'revision' })
      .then(setConvenios)
      .catch((e) => setError(e.message || 'No se pudo cargar la bandeja'));
  }, []);
 
  useEffect(() => { cargar(); }, [cargar]);
 
  if (!puede(usuario, 'verRevision')) {
    return <p className="text-center py-5">Esta sección es para revisores y administración.</p>;
  }
 
  async function hacer(c, accion, datos) {
    setTrabajando(c.id);
    setError('');
    try {
      await accionConvenio(c.id, accion, datos);
      setAviso(accion === 'aprobar' ? `${c.codigo} quedó aprobado y pasa a la firma.` : `${c.codigo} volvió a borrador con tus observaciones.`);
      setDevolviendo(null);
      setObservaciones('');
      cargar();
    } catch (e) {
      setError(e.message || 'No se pudo hacer el cambio');
    } finally {
      setTrabajando(null);
    }
  }
 
  return (
    <>
      <h1 className="h4 mb-1">Revisión</h1>
      <p className="text-body-secondary mb-4">
        {usuario.rol === 'revisor' ? 'Convenios que tenés asignados para revisar.' : 'Todos los convenios en revisión.'}
      </p>
 
      {aviso && (
        <div className="alert alert-success alert-dismissible" role="status">
          {aviso}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAviso('')} />
        </div>
      )}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {convenios === null && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando bandeja…</p>
        </div>
      )}
 
      {convenios?.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-check2-circle fs-1 text-success" aria-hidden="true" />
          <p className="mt-2 mb-0">No hay convenios esperando revisión.</p>
        </div>
      )}
 
      <div className="d-flex flex-column gap-3">
        {convenios?.map((c) => (
          <article key={c.id} className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <Link href={`/convenios/${c.id}`} className="fw-semibold">{c.codigo}</Link>
                <span className="small text-body-secondary">· {TIPOS[c.tipo] ?? c.tipo} · {c.unidad?.nombre}</span>
                <span className="small text-body-secondary ms-auto">En revisión desde el {fecha(c.updated_at)}</span>
              </div>
              <h2 className="h6 mb-3">{c.titulo}</h2>
 
              {devolviendo === c.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (observaciones.trim()) hacer(c, 'devolver', { observaciones: observaciones.trim() }); }}>
                  <label htmlFor={`obs-${c.id}`} className="form-label small fw-semibold">Observaciones para el gestor</label>
                  <textarea id={`obs-${c.id}`} className="form-control mb-2" rows={3} required autoFocus
                    value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                  <div className="d-flex gap-2">
                    <Button type="submit" loading={trabajando === c.id} disabled={!observaciones.trim()}>Devolver</Button>
                    <Button variant="secondary" onClick={() => { setDevolviendo(null); setObservaciones(''); }}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  <Link href={`/convenios/${c.id}`} className="btn btn-outline-secondary">Ver ficha</Link>
                  {c.permisos?.revisar && (
                    <>
                      <Button loading={trabajando === c.id} onClick={() => hacer(c, 'aprobar')}>Aprobar</Button>
                      <Button variant="secondary" onClick={() => setDevolviendo(c.id)}>Devolver con observaciones</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}