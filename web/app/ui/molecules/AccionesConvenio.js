 'use client';
import { useState } from 'react';
import Link from 'next/link';
import Button from '../atoms/Button';
 
// Botones de la ficha según lo que la API dice que el usuario puede hacer (convenio.permisos).
// onAccion(accion, datos) hace el pedido; devolver y rescindir piden un texto antes.
export default function AccionesConvenio({ convenio, onAccion, cargando }) {
  const p = convenio.permisos ?? {};
  const [pidiendo, setPidiendo] = useState(null); // 'devolver' | 'rescindir' | null
  const [texto, setTexto] = useState('');
 
  function confirmar(ev) {
    ev.preventDefault();
    if (!texto.trim()) return;
    const datos = pidiendo === 'devolver' ? { observaciones: texto.trim() } : { fundamento: texto.trim() };
    onAccion(pidiendo, datos).then(() => { setPidiendo(null); setTexto(''); });
  }
 
  if (pidiendo) {
    const etiqueta = pidiendo === 'devolver' ? 'Observaciones para el gestor' : 'Fundamento de la rescisión';
    return (
      <form onSubmit={confirmar} className="w-100">
        <label htmlFor="texto-accion" className="form-label fw-semibold">{etiqueta}</label>
        <textarea id="texto-accion" className="form-control mb-2" rows={3} required autoFocus
                  value={texto} onChange={(e) => setTexto(e.target.value)} />
        <div className="d-flex gap-2">
          <Button type="submit" variant={pidiendo === 'rescindir' ? 'danger' : 'primary'} loading={cargando} disabled={!texto.trim()}>
            {pidiendo === 'devolver' ? 'Devolver' : 'Rescindir'}
          </Button>
          <Button variant="secondary" onClick={() => { setPidiendo(null); setTexto(''); }}>Cancelar</Button>
        </div>
      </form>
    );
  }
 
  return (
    <div className="d-flex flex-wrap gap-2">
      {p.editar && <Link href={`/convenios/${convenio.id}/editar`} className="btn btn-outline-primary">Editar</Link>}
      {p.enviar_revision && <Button loading={cargando} onClick={() => onAccion('enviar-revision')}>Enviar a revisión</Button>}
      {p.revisar && <Button loading={cargando} onClick={() => onAccion('aprobar')}>Aprobar</Button>}
      {p.revisar && <Button variant="secondary" onClick={() => setPidiendo('devolver')}>Devolver con observaciones</Button>}
      {p.rescindir && <Button variant="danger" onClick={() => setPidiendo('rescindir')}>Rescindir</Button>}
      {p.archivar && <Button variant="secondary" loading={cargando} onClick={() => onAccion('archivar')}>Archivar</Button>}
      {p.firmar && (
        <p className="alert alert-info mb-0 w-100">
          <i className="bi bi-phone me-2" aria-hidden="true" />Este convenio espera tu firma. Se firma desde la app.
        </p>
      )}
    </div>
  );
}