// Guarda quién está logueado y lo comparte con toda la app.
// También maneja el bloqueo: si está activado, la app arranca bloqueada y se vuelve
// a bloquear cuando queda más de 1 minuto en segundo plano.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { iniciarSesion, verificarCodigo, reenviarCodigo, usuarioGuardado, cerrarSesion } from '../servicios/autenticacion';
import { bloqueoActivo, desactivarBloqueo } from '../servicios/desbloqueo';
import { olvidarAvisos } from '../servicios/avisos';

const ContextoSesion = createContext(null);

const TIEMPO_PARA_BLOQUEAR = 60 * 1000; // 1 minuto en segundo plano

export const ProveedorSesion = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // mientras revisa si había sesión guardada
  const [bloqueada, setBloqueada] = useState(false);
  const [pendienteMfa, setPendienteMfa] = useState(null); // { mfaToken, canal, email } entre el paso 1 y el 2
  const [avisoLogin, setAvisoLogin] = useState(''); // por qué se volvió al login (ej. "el ingreso venció")
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

  // Paso 1: email y contraseña. Si la API pide código, se pasa a la pantalla del código.
  const entrar = async (email, password) => {
    setAvisoLogin('');
    const r = await iniciarSesion(email, password);
    if (r.requiereMfa) {
      setPendienteMfa(r);
      return;
    }
    setUsuario(r); // la API todavía no pide código
  };

  // Paso 2: el código de 6 números. Recién acá queda iniciada la sesión.
  const confirmarCodigo = async (codigo) => {
    const u = await verificarCodigo(pendienteMfa.mfaToken, codigo);
    setPendienteMfa(null);
    setUsuario(u); // recién se identificó con contraseña + código: no hace falta desbloquear
  };

  const pedirOtroCodigo = (canal) => reenviarCodigo(pendienteMfa.mfaToken, canal);

  // "Volver" desde la pantalla del código: otra vez email y contraseña (con el motivo, si hay)
  const cancelarCodigo = (motivo = '') => {
    setPendienteMfa(null);
    setAvisoLogin(motivo);
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
    <ContextoSesion.Provider value={{ usuario, cargando, bloqueada, pendienteMfa, avisoLogin, entrar, confirmarCodigo, pedirOtroCodigo, cancelarCodigo, salir, desbloquear }}>
      {children}
    </ContextoSesion.Provider>
  );
};

export const usarSesion = () => useContext(ContextoSesion);
