'use client';
import { useState } from 'react';
import Button from '../atoms/Button';
import { responderObservacion } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
// Observaciones del revisor y respuesta del gestor.
// Enunciado: "conservar responsable, fecha, contenido y resolución de cada observación, junto con la
// respuesta o corrección del equipo gestor" y "mostrar con claridad el estado del trámite y las
// observaciones pendientes".
function Observacion({ convenio, o, puedeResponder, onCambio }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const pendiente = o.estado !== 'resuelta';
 
  async function responder(ev) {
    ev.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await responderObservacion(convenio.id, o.id, texto.trim());
      setTexto('');
      onCambio();
    } catch (e) {
      setError(e.errors?.respuesta?.[0] ?? e.message ?? 'No se pudo guardar la respuesta.');
    } finally {
      setGuardando(false);
    }
  }
 
  return (
    <li className={`border rounded-3 p-2 ${pendiente ? 'border-warning-subtle' : ''}`}>
      <div className="d-flex justify-content-between align-items-start gap-2">
        <p className="mb-1">{o.contenido}</p>
        <span className={`chip ${pendiente ? 'chip-revision' : 'chip-vigente'}`}>{pendiente ? 'Pendiente' : 'Resuelta'}</span>
      </div>
      <p className="small text-body-secondary mb-0">{o.autor?.name} · {fecha(o.created_at)}</p>
 
      {!pendiente && o.respuesta && (
        <div className="small mt-2 ps-2 border-start border-2">
          <p className="mb-0">{o.respuesta}</p>
          <p className="text-body-secondary mb-0">{o.resuelto_por?.name} · {fecha(o.resuelto_en)}</p>
        </div>
      )}
 
      {pendiente && puedeResponder && (
        <form onSubmit={responder} className="mt-2">
          <label htmlFor={`resp-${o.id}`} className="form-label small fw-semibold">Qué se corrigió</label>
          <textarea id={`resp-${o.id}`} rows={2} className="form-control mb-2" maxLength={1000} value={texto}
            onChange={(e) => setTexto(e.target.value)} />
          {error && <div className="text-danger small mb-2" role="alert">{error}</div>}
          <Button type="submit" loading={guardando} disabled={!texto.trim()}>Marcar como resuelta</Button>
        </form>
      )}
    </li>
  );
}
 
export default function ObservacionesConvenio({ convenio, puedeResponder, onCambio }) {
  const lista = convenio.observaciones ?? [];
  if (lista.length === 0) return null;
  const pendientes = lista.filter((o) => o.estado !== 'resuelta').length;
 
  return (
    <section className={`card ${pendientes ? 'border-warning' : ''}`}>
      <div className="card-body">
        <h2 className="h6 fw-bold mb-1">Observaciones de revisión</h2>
        <p className="small text-body-secondary mb-3">
          {pendientes ? `${pendientes} pendiente${pendientes > 1 ? 's' : ''} de ${lista.length}` : 'Todas resueltas'}
        </p>
        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
          {lista.map((o) => (
            <Observacion key={o.id} convenio={convenio} o={o} puedeResponder={puedeResponder} onCambio={onCambio} />
          ))}
        </ul>
      </div>
    </section>
  );
}