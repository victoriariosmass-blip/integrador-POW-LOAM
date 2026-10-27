// Guarda quién está logueado y lo comparte con toda la app
import React, { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, usuarioGuardado, cerrarSesion } from '../servicios/autenticacion';

const ContextoSesion = createContext(null);

export const ProveedorSesion = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // mientras revisa si había sesión guardada

  useEffect(() => {
    usuarioGuardado()
      .then(setUsuario)
      .finally(() => setCargando(false));
  }, []);

  const entrar = async (email, password) => {
    const u = await iniciarSesion(email, password);
    setUsuario(u);
  };

  const salir = async () => {
    await cerrarSesion();
    setUsuario(null);
  };

  return (
    <ContextoSesion.Provider value={{ usuario, cargando, entrar, salir }}>
      {children}
    </ContextoSesion.Provider>
  );
};

export const usarSesion = () => useContext(ContextoSesion);