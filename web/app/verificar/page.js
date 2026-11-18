'use client';
 
import { Fragment, useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../ui/templates/AuthLayout';
import CodeInput from '../ui/molecules/CodeInput';
import Button from '../ui/atoms/Button';
import { verificarCodigo, reenviarCodigo } from '../lib/auth';
 
const CANALES = [
  { valor: 'mail', etiqueta: 'Mail', icono: 'bi-envelope' },
  { valor: 'sms', etiqueta: 'SMS', icono: 'bi-chat-dots' },
];
const ESPERA_REENVIO = 30; // segundos

// Modo demo: el código que mandó la API (codigo_demo) queda en sessionStorage (lo guarda el login).
// Se lee con useSyncExternalStore: en el servidor no hay sessionStorage (no hay cartel) y en el
// navegador se vuelve a leer cada vez que cambia (evento 'mfa-codigo-demo', al reenviar o verificar).
const CLAVE_DEMO = 'mfa_codigo_demo';
const EVENTO_DEMO = 'mfa-codigo-demo';
function leerCodigoDemo() {
  try { return sessionStorage.getItem(CLAVE_DEMO); } catch { return null; }
}
function cambiarCodigoDemo(codigo) {
  try {
    if (codigo) sessionStorage.setItem(CLAVE_DEMO, codigo);
    else sessionStorage.removeItem(CLAVE_DEMO);
  } catch { /* sin sessionStorage: no hay cartel */ }
  window.dispatchEvent(new Event(EVENTO_DEMO));
}
function escucharCodigoDemo(avisar) {
  window.addEventListener(EVENTO_DEMO, avisar);
  return () => window.removeEventListener(EVENTO_DEMO, avisar);
}

export default function VerificarPage() {
  const router = useRouter();
  const codigoDemo = useSyncExternalStore(escucharCodigoDemo, leerCodigoDemo, () => null);
  const [canal, setCanal] = useState('mail');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  const [segundos, setSegundos] = useState(ESPERA_REENVIO);
 
  // Cuenta regresiva para poder reenviar
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);
 
  async function handleSubmit(ev) {
    ev.preventDefault();
    setAviso('');
    if (codigo.length !== 6) {
      setError('Ingrese los 6 dígitos del código');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await verificarCodigo(codigo);
      cambiarCodigoDemo(null); // ya entró: el código no queda guardado
      router.push('/panel');
    } catch (err) {
      if (err.status === 401) {
        router.replace('/login');
        return;
      }
      setError(err.message || 'No se pudo verificar el código');
      setCodigo('');
    } finally {
      setCargando(false);
    }
  }
 
  async function reenviar() {
    setError('');
    try {
      const r = await reenviarCodigo(canal);
      if (r?.codigo_demo) cambiarCodigoDemo(r.codigo_demo); // el cartel muestra el código nuevo
      setAviso(canal === 'sms' ? 'Le enviamos un código nuevo por SMS.' : 'Le enviamos un código nuevo por mail.');
      setSegundos(ESPERA_REENVIO);
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código');
    }
  }
 
  return (
    <AuthLayout icono="bi-shield-lock" titulo="Verificación" subtitulo="Por seguridad, ingrese el código de 6 dígitos que le enviamos.">
      <fieldset className="mb-3">
        <legend className="form-label fw-semibold fs-6">¿Cómo desea recibir el código?</legend>
        <div className="btn-group w-100" role="group">
          {CANALES.map((c) => (
            <Fragment key={c.valor}>
              <input type="radio" className="btn-check" name="canal" id={`canal-${c.valor}`} value={c.valor}
                     checked={canal === c.valor} onChange={() => setCanal(c.valor)} />
              <label className="btn btn-outline-secondary" htmlFor={`canal-${c.valor}`}>
                <i className={`bi ${c.icono} me-2`} aria-hidden="true" />{c.etiqueta}
              </label>
            </Fragment>
          ))}
        </div>
      </fieldset>
 
      {aviso && <div className="alert alert-success py-2 small" role="status">{aviso}</div>}
 
      <form onSubmit={handleSubmit} noValidate>
        {codigoDemo && (
          <div className="alert alert-primary py-2 small" role="status">
            <i className="bi bi-info-circle me-2" aria-hidden="true" />
            Modo demo: su código es <strong>{codigoDemo}</strong> (en un sistema real llega por mail).
          </div>
        )}
        {/* no es <label>: el código son 6 casillas y el grupo ya tiene su nombre (aria-label) */}
        <p className="form-label fw-semibold mb-2" aria-hidden="true">Código</p>
        <CodeInput valor={codigo} onChange={(v) => { setCodigo(v); setError(''); }} invalido={!!error} idError="codigo-error" />
        {error && <div id="codigo-error" className="invalid-feedback d-block" role="alert">{error}</div>}
 
        <Button type="submit" loading={cargando} className="w-100 mt-4">
          {cargando ? 'Verificando…' : 'Verificar'}
        </Button>
      </form>
 
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Link href="/login" className="small">Volver</Link>
        <button type="button" className="btn btn-link btn-sm p-0" onClick={reenviar} disabled={segundos > 0}>
          {segundos > 0 ? `Reenviar código (${segundos} s)` : 'Reenviar código'}
        </button>
      </div>
    </AuthLayout>
  );
}