'use client';
 
import { Fragment, useEffect, useState } from 'react';
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
 
export default function VerificarPage() {
  const router = useRouter();
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
      setError('Ingresá los 6 dígitos del código');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await verificarCodigo(codigo);
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
      await reenviarCodigo(canal);
      setAviso(canal === 'sms' ? 'Te enviamos un código nuevo por SMS.' : 'Te enviamos un código nuevo por mail.');
      setSegundos(ESPERA_REENVIO);
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código');
    }
  }
 
  return (
    <AuthLayout icono="bi-shield-lock" titulo="Verificación" subtitulo="Por seguridad, ingresá el código de 6 dígitos que te enviamos.">
      <fieldset className="mb-3">
        <legend className="form-label fw-semibold fs-6">¿Cómo querés recibir el código?</legend>
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
        <label className="form-label fw-semibold">Código</label>
        <CodeInput valor={codigo} onChange={(v) => { setCodigo(v); setError(''); }} invalido={!!error} idError="codigo-error" />
        {error && <div id="codigo-error" className="invalid-feedback d-block">{error}</div>}
 
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