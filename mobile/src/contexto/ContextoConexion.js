// Sabe si el celular tiene internet (NetInfo) y lo comparte con toda la app.
// Enunciado de LOAM (Modo Off): "solo se pueden ver los convenios pendientes de firmar, el buscador
// debe indicar que estas offline, al igual que comentarios, firma de convenios y registro de identidad".
import React, { createContext, useContext } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

const ContextoConexion = createContext({ enLinea: true });

export const ProveedorConexion = ({ children }) => {
  const red = useNetInfo();
  // Al arrancar NetInfo todavía no sabe (null): se asume que hay conexión
  const enLinea = red.isConnected !== false && red.isInternetReachable !== false;
  return <ContextoConexion.Provider value={{ enLinea }}>{children}</ContextoConexion.Provider>;
};

export const usarConexion = () => useContext(ContextoConexion);