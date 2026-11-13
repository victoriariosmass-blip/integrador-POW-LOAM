'use client';
import { useEffect, useState } from 'react';
import { listarPendientes, sincronizarPendientes } from '../../lib/offline';
import { enviarComentarioPendiente } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
// Franja arriba del contenido que avisa:
// - que no hay conexión y se están mostrando datos guardados (y de cuándo son);
// - cuántos comentarios esperan para mandarse;
// - el resultado de la sincronización cuando vuelve la conexión.
// También dispara la sincronización: al abrir la web y cada vez que vuelve internet.
export default function AvisoConexion() {
  const [sinConexion, setSinConexion] = useState(false);
  const [guardado, setGuardado] = useState(null); // fecha de los datos que se están mostrando
  const [pendientes, setPendientes] = useState(0);
  const [resultado, setResultado] = useState(null);
 
  useEffect(() => {
    const contarPendientes = () => listarPendientes().then((l) => setPendientes(l.length));
    const sincronizar = async () => {
      const r = await sincronizarPendientes(enviarComentarioPendiente);
      if (r) contarPendientes();
    };
    const alPerder = () => setSinConexion(true);
    const alVolver = () => { setSinConexion(false); setGuardado(null); sincronizar(); };
    const alUsarGuardado = (e) => { setSinConexion(true); setGuardado(e.detail.guardado); };
    // volvió a responder el servidor (aunque el navegador nunca perdió internet)
    const alResponder = () => { setSinConexion(false); setGuardado(null); sincronizar(); };
    const alSincronizar = (e) => { setResultado(e.detail); contarPendientes(); };
 
    setSinConexion(!navigator.onLine);
    contarPendientes();
    if (navigator.onLine) sincronizar();
    // Si el servidor estaba caído (el navegador cree que hay internet), se reintenta cada 30 segundos
    const reintento = setInterval(() => { if (navigator.onLine) sincronizar(); }, 30000);
 
    window.addEventListener('offline', alPerder);
    window.addEventListener('online', alVolver);
    window.addEventListener('convenios:sin-conexion', alUsarGuardado);
    window.addEventListener('convenios:con-conexion', alResponder);
    window.addEventListener('convenios:pendientes', contarPendientes);
    window.addEventListener('convenios:sincronizado', alSincronizar);
    return () => {
      clearInterval(reintento);
      window.removeEventListener('offline', alPerder);
      window.removeEventListener('online', alVolver);
      window.removeEventListener('convenios:sin-conexion', alUsarGuardado);
      window.removeEventListener('convenios:con-conexion', alResponder);
      window.removeEventListener('convenios:pendientes', contarPendientes);
      window.removeEventListener('convenios:sincronizado', alSincronizar);
    };
  }, []);
 
  if (!sinConexion && !pendientes && !resultado) return null;
 
  return (
    <div className="d-flex flex-column gap-2 mb-3" aria-live="polite">
      {sinConexion && (
        <div className="aviso-conexion aviso-conexion-sin" role="status">
          <i className="bi bi-wifi-off" aria-hidden="true" />
          <div>
            <strong>Sin conexión con el servidor.</strong>{' '}
            {guardado
              ? `Estás viendo los datos guardados el ${fecha(guardado)} a las ${new Date(guardado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}.`
              : 'Se muestran los datos guardados en este navegador.'}
            {' '}Los comentarios se guardan y se mandan solos al volver; los demás cambios hay que hacerlos con conexión.
          </div>
        </div>
      )}
      {pendientes > 0 && (
        <div className="aviso-conexion" role="status">
          <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
          <div>{pendientes === 1 ? 'Hay 1 comentario esperando para enviarse.' : `Hay ${pendientes} comentarios esperando para enviarse.`}</div>
        </div>
      )}
      {resultado && (
        <div className={`aviso-conexion ${resultado.rechazados.length ? 'aviso-conexion-sin' : 'aviso-conexion-ok'}`} role="status">
          <i className={`bi ${resultado.rechazados.length ? 'bi-exclamation-triangle' : 'bi-check2-circle'}`} aria-hidden="true" />
          <div className="flex-grow-1">
            {resultado.enviados > 0 && <div>Volvió la conexión: se {resultado.enviados === 1 ? 'envió 1 comentario pendiente' : `enviaron ${resultado.enviados} comentarios pendientes`}.</div>}
            {resultado.rechazados.map((r) => (
              <div key={r.id}>No se pudo enviar “{r.contenido.slice(0, 40)}”: {r.motivo}</div>
            ))}
          </div>
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setResultado(null)} />
        </div>
      )}
    </div>
  );
}