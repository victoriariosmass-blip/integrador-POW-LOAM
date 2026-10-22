//maneja de manera global el tamaño de la letra y el modo oscuro, el cual altera toda la app
import React, { createContext, useState, useContext } from 'react';

const ContextoPreferencias = createContext();

export const ProveedorPreferencias = ({ children }) => {
  const [esModoOscuro, setEsModoOscuro] = useState(false);
  const [tamanioLetra, setTamanioLetra] = useState('mediana'); // 'chica' | 'mediana' | 'grande'

  const factoresEscala = {
    chica: 0.85,
    mediana: 1,
    grande: 1.25,
  };

  const factorActual = factoresEscala[tamanioLetra] || 1;

  const colores = {
    fondo: esModoOscuro ? '#121212' : '#FFFFFF',
    tarjeta: esModoOscuro ? '#1E1E1E' : '#F7FAFC',
    textoPrincipal: esModoOscuro ? '#FFFFFF' : '#1A202C',
    textoSecundario: esModoOscuro ? '#A0AEC0' : '#718096',
    borde: esModoOscuro ? '#2D3748' : '#E2E8F0',
    botonPrimario: esModoOscuro ? '#2B6CB0' : '#4A5568',
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