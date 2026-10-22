'use client';
 
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usuarioActual } from './auth';
 
const UsuarioContext = createContext(null);
 
// pide el usuario logueado una sola vez y lo comparte con todas las pantallas internas
// si no hay sesión, manda al login.
export function UsuarioProvider({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
 
  useEffect(() => {
    usuarioActual()
      .then(setUsuario)
      .catch(() => router.replace('/login'));
  }, [router]);
 
  if (!usuario) {
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }
 
  return <UsuarioContext.Provider value={usuario}>{children}</UsuarioContext.Provider>;
}
 
export function useUsuario() {
  return useContext(UsuarioContext);
}