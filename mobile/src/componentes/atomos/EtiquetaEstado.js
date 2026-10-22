//Para indicar el estado: Vigente, Por firmar, En trámite
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EtiquetaEstado = ({ texto, variante = 'por_defecto' }) => {
  const obtenerColorDeFondo = () => {
    switch (variante) {
      case 'vigente':
        return '#E8F5E9';
      case 'por_firmar':
        return '#FFF3E0';
      case 'en_tramite':
        return '#E3F2FD';
      case 'sin_conexion':
        return '#FFEBEE';
      default:
        return '#E0E0E0';
    }
  };

  return (
    <View style={[estilos.etiqueta, { backgroundColor: obtenerColorDeFondo() }]}>
      <Text style={estilos.texto}>{texto}</Text>
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
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
});