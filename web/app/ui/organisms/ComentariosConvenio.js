'use client';
import { useCallback, useEffect, useState } from 'react';
import Button from '../atoms/Button';
import { listarComentarios, comentar } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
// Comentarios de la ficha. El filtro de lenguaje ofensivo lo hace la API:
// esos comentarios llegan como "Comentario ofensivo" y se muestran marcados.
export default function ComentariosConvenio({ convenioId, puedeComentar }) {
  const [comentarios, setComentarios] = useState(null);
  const [error, setError] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
 
  const cargar = useCallback(() => {
    listarComentarios(convenioId)
      .then((r) => setComentarios(r.data))
      .catch((e) => setError(e.message || 'No se pudieron cargar los comentarios'));
  }, [convenioId]);
 
  useEffect(() => { cargar(); }, [cargar]);

  // Cuando se mandan los comentarios que estaban pendientes, se vuelve a pedir la lista
  useEffect(() => {
    window.addEventListener('convenios:sincronizado', cargar);
    return () => window.removeEventListener('convenios:sincronizado', cargar);
  }, [cargar]);
 
  async function enviar(ev) {
    ev.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const r = await comentar(convenioId, texto.trim());
      setComentarios((lista) => [...(lista ?? []), r.data]);
      setTexto('');
    } catch (e) {
      setError(e.errors?.contenido?.[0] ?? e.message ?? 'No se pudo enviar el comentario');
    } finally {
      setEnviando(false);
    }
  }
 
  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">Comentarios</h2>
 
        {comentarios === null && !error && <p className="small text-body-secondary mb-0">Cargando comentarios…</p>}
        {comentarios?.length === 0 && <p className="small text-body-secondary">Todavía no hay comentarios.</p>}
 
        {comentarios?.length > 0 && (
          <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
            {comentarios.map((c) => (
              <li key={c.id} className={`rounded border p-2 ${c.es_ofensivo ? 'border-danger-subtle bg-danger-subtle' : 'bg-body-tertiary'}`}>
                <p className="small text-body-secondary mb-1">
                  {c.autor?.name} · {fecha(c.created_at)}
                  {c.pendiente && (
                    <span className="badge rounded-pill text-bg-warning ms-2">
                      <i className="bi bi-cloud-arrow-up me-1" aria-hidden="true" />Pendiente de envío
                    </span>
                  )}
                </p>
                <p className={`mb-0 ${c.es_ofensivo ? 'fst-italic text-danger-emphasis' : ''}`}>{c.contenido}</p>
              </li>
            ))}
          </ul>
        )}
 
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
 
        {puedeComentar ? (
          <form onSubmit={enviar}>
            <label htmlFor="nuevo-comentario" className="form-label small fw-semibold">Nuevo comentario</label>
            <textarea id="nuevo-comentario" className="form-control mb-2" rows={2} maxLength={1000}
              value={texto} onChange={(e) => setTexto(e.target.value)} />
            <Button type="submit" loading={enviando} disabled={!texto.trim()}>Comentar</Button>
          </form>
        ) : (
          <p className="small text-body-secondary mb-0">Tu rol puede leer los comentarios pero no escribir.</p>
        )}
      </div>
    </section>
  );
}