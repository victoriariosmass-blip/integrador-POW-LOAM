'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Field from '../ui/molecules/Field';
import Button from '../ui/atoms/Button';
import AuthLayout from '../ui/templates/AuthLayout';
import { login } from '../lib/auth';
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
 
  function validar() {
    const e = {};
    if (!email) e.email = 'Ingresá tu email';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'El email no es válido';
    if (!password) e.password = 'Ingresá tu contraseña';
    return e;
  }
 
  async function handleSubmit(ev) {
    ev.preventDefault();
    setErrorGeneral('');
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) {
      // el foco va al primer campo con error, así se lee el mensaje
      requestAnimationFrame(() => document.querySelector('form [aria-invalid="true"]')?.focus());
      return;
    }
 
    setCargando(true);
    try {
      const res = await login(email, password);
      // Modo demo (MFA_MOSTRAR_CODIGO=true en la API): el código viene en la respuesta y /verificar lo
      // muestra en un cartel. Si no viene, se borra el de un ingreso anterior.
      try {
        if (res.codigo_demo) sessionStorage.setItem('mfa_codigo_demo', res.codigo_demo);
        else sessionStorage.removeItem('mfa_codigo_demo');
      } catch { /* sin sessionStorage: no hay cartel, el código sigue llegando por mail */ }
      router.push(res.requiere_mfa ? '/verificar' : '/panel');
    } catch (err) {
      setErrorGeneral(err.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }
 
  return (
    <AuthLayout titulo="Iniciar sesión" subtitulo="Ingresá con tu cuenta institucional.">
      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}
 
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nombre@convenios.test"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errores.email}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errores.password}
        />
        <Button type="submit" loading={cargando} className="w-100 mt-2">
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
 
      {/* no hay recuperación por mail: la contraseña nueva la carga Administración */}
      <p className="text-center small text-body-secondary mt-3 mb-0">
        ¿Olvidaste tu contraseña? Pedile una nueva a Administración.
      </p>
       <p className="text-center mt-2 mb-0">
        <Link href="/publico" className="small">Ver los convenios firmados sin iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
}