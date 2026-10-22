'use client';
 
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
    if (Object.keys(e).length > 0) return;
 
    setCargando(true);
    try {
      const res = await login(email, password);
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
 
      <p className="text-center mt-3 mb-0">
        <a href="#" className="small">¿Olvidaste tu contraseña?</a>
      </p>
    </AuthLayout>
  );
}