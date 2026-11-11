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
    fondo: esModoOscuro ? '#12101F' : '#F6F6FB',
    tarjeta: esModoOscuro ? '#1E1B3A' : '#FFFFFF',
    tarjetaElevada: esModoOscuro ? '#26224A' : '#FFFFFF',
    textoPrincipal: esModoOscuro ? '#F1F0FE' : '#1E1B3A',
    textoSecundario: esModoOscuro ? '#B8B5D6' : '#5E5B78',
    borde: esModoOscuro ? '#34305C' : '#E3E2F0',
    acento: esModoOscuro ? '#A5A1F5' : '#4338CA',
    botonPrimario: esModoOscuro ? '#5B54E8' : '#4338CA',
    botonSecundario: esModoOscuro ? '#1E1B3A' : '#FFFFFF',
    error: esModoOscuro ? '#FCA5A5' : '#9B1C1C',
    errorFondo: esModoOscuro ? '#3F1A24' : '#FDECEC',
    exito: esModoOscuro ? '#86EFAC' : '#1C6B3A',
    exitoFondo: esModoOscuro ? '#123322' : '#E6F6EC',
    exitoBorde: esModoOscuro ? '#4ADE80' : '#ACDDBE',
    sombra: '#1E1B3A',
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