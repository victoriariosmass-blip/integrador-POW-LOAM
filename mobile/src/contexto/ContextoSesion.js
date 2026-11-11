// Guarda quién está logueado y lo comparte con toda la app.
// También maneja el bloqueo: si está activado, la app arranca bloqueada y se vuelve
// a bloquear cuando queda más de 1 minuto en segundo plano.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { iniciarSesion, usuarioGuardado, cerrarSesion } from '../servicios/autenticacion';
import { bloqueoActivo, desactivarBloqueo } from '../servicios/desbloqueo';
import { olvidarAvisos } from '../servicios/avisos';

const ContextoSesion = createContext(null);

const TIEMPO_PARA_BLOQUEAR = 60 * 1000; // 1 minuto en segundo plano

export const ProveedorSesion = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // mientras revisa si había sesión guardada
  const [bloqueada, setBloqueada] = useState(false);
  const enSegundoPlanoDesde = useRef(null);

  useEffect(() => {
    (async () => {
      const u = await usuarioGuardado();
      // Había sesión guardada y el bloqueo está activo: se pide huella o PIN antes de mostrar nada
      if (u && (await bloqueoActivo())) setBloqueada(true);
      setUsuario(u);
    })().finally(() => setCargando(false));
  }, []);

  // Al volver de segundo plano después de más de 1 minuto, se bloquea otra vez
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (estado) => {
      if (estado === 'background') {
        enSegundoPlanoDesde.current = Date.now();
      } else if (estado === 'active' && enSegundoPlanoDesde.current) {
        const paso = Date.now() - enSegundoPlanoDesde.current;
        enSegundoPlanoDesde.current = null;
        if (paso > TIEMPO_PARA_BLOQUEAR && (await bloqueoActivo())) setBloqueada(true);
      }
    });
    return () => sub.remove();
  }, []);

  const entrar = async (email, password) => {
    const u = await iniciarSesion(email, password);
    setUsuario(u); // recién se identificó con la contraseña: no hace falta desbloquear
  };

  const salir = async () => {
    await cerrarSesion();
    await desactivarBloqueo(); // el PIN es de esta sesión: el próximo usuario configura el suyo
    await olvidarAvisos();
    setBloqueada(false);
    setUsuario(null);
  };

  const desbloquear = () => setBloqueada(false);

  return (
    <ContextoSesion.Provider value={{ usuario, cargando, bloqueada, entrar, salir, desbloquear }}>
      {children}
    </ContextoSesion.Provider>
  );
};

export const usarSesion = () => useContext(ContextoSesion);