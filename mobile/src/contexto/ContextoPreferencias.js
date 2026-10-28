//maneja de manera global el tamaño de la letra y el modo oscuro, el cual altera toda la app
import React, { createContext, useState, useContext } from 'react';

const ContextoPreferencias = createContext();

export const ProveedorPreferencias = ({ children }) => {
  const [esModoOscuro, setEsModoOscuro] = useState(false);
  const [tamanioLetra, setTamanioLetra] = useState('mediana'); // 'chica' | 'mediana' | 'grande'

  const factoresEscala = {
    chica: 0.85,
    mediana: 1.1,
    grande: 1.25,
  };

  const factorActual = factoresEscala[tamanioLetra] || 1;

  const colores = {
    fondo: esModoOscuro ? '#080B12' : '#FFFFFF',
    tarjeta: esModoOscuro ? '#111827' : '#F7FAFC',
    tarjetaElevada: esModoOscuro ? '#172033' : '#FFFFFF',
    textoPrincipal: esModoOscuro ? '#FFFFFF' : '#1A202C',
    textoSecundario: esModoOscuro ? '#CBD5E1' : '#718096',
    borde: '#E2E8F0',
    acento: esModoOscuro ? '#60A5FA' : '#2B6CB0',
    botonPrimario: esModoOscuro ? '#2563EB' : '#4A5568',
    botonSecundario: esModoOscuro ? '#172033' : '#FFFFFF',
    error: esModoOscuro ? '#FCA5A5' : '#B71C1C',
    errorFondo: esModoOscuro ? '#451A1A' : '#FFEBEE',
    exito: esModoOscuro ? '#86EFAC' : '#276749',
    exitoFondo: esModoOscuro ? '#123322' : '#F0FFF4',
    exitoBorde: esModoOscuro ? '#4ADE80' : '#68D391',
  };

  return (
    <ContextoPreferencias.Provider
      value={{
        esModoOscuro,
        setEsModoOscuro,
        tamanioLetra,
        setTamanioLetra,
        factorActual,
        colores,
      }}
    >
      {children}
    </ContextoPreferencias.Provider>
  );
};

export const usarPreferencias = () => useContext(ContextoPreferencias);