'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Field from '../ui/molecules/Field';
import Button from '../ui/atoms/Button';
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
    <main className="min-vh-100 row g-0">
      {/* Panel izquierdo: solo en pantallas grandes */}
      <section className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center bg-body-tertiary border-end p-5">
        <div
          className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded mb-4 w-100"
          style={{ maxWidth: 420, height: 260 }}
          aria-hidden="true"
        >
          <i className="bi bi-building fs-1 text-secondary" />
        </div>
        <div style={{ maxWidth: 420 }} className="w-100">
          <h1 className="h3 fw-bold">Gestión de Convenios</h1>
          <p className="text-body-secondary mb-0">
            Sistema para registrar, revisar y dar seguimiento a los convenios de la Universidad Nacional de La Pampa.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm w-100" style={{ maxWidth: 400 }}>
          <div className="card-body p-4">
            <div
              className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded mb-3"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            >
              <i className="bi bi-mortarboard fs-4 text-secondary" />
            </div>
            <h2 className="h4 fw-bold mb-1">Iniciar sesión</h2>
            <p className="text-body-secondary small mb-4">Ingresá con tu cuenta institucional.</p>

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
          </div>
        </div>
      </section>
    </main>
  );
}