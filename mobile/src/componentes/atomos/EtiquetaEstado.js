//Para indicar el estado: Vigente, Por firmar, En trámite
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const EtiquetaEstado = ({ texto, variante = 'por_defecto' }) => {
  const { factorActual, esModoOscuro } = usarPreferencias();
  const obtenerColores = () => {
    if (esModoOscuro) {
      switch (variante) {
        case 'vigente':
          return { fondo: '#14532D', texto: '#FFFFFF' };
        case 'por_firmar':
          return { fondo: '#713F12', texto: '#FFFFFF' };
        case 'en_tramite':
          return { fondo: '#1E3A8A', texto: '#FFFFFF' };
        case 'sin_conexion':
          return { fondo: '#7F1D1D', texto: '#FFFFFF' };
        default:
          return { fondo: '#334155', texto: '#FFFFFF' };
      }
    }

    switch (variante) {
      case 'vigente':
        return { fondo: '#E8F5E9', texto: '#333333' };
      case 'por_firmar':
        return { fondo: '#FFF3E0', texto: '#333333' };
      case 'en_tramite':
        return { fondo: '#E3F2FD', texto: '#333333' };
      case 'sin_conexion':
        return { fondo: '#FFEBEE', texto: '#333333' };
      default:
        return { fondo: '#E0E0E0', texto: '#333333' };
    }
  };
  const coloresEstado = obtenerColores();

  return (
    <View style={[estilos.etiqueta, { backgroundColor: coloresEstado.fondo }]}>
      <Text style={[estilos.texto, { color: coloresEstado.texto, fontSize: 12 * factorActual }]}>{texto}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  texto: {
    fontWeight: '600',
  },
});