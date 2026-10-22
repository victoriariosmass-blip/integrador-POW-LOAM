//Aviso que bloquea o notifica la perdida de conexion a internet
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const BannerSinConexion = ({ 
  mensaje = 'Sin conexión • Mostrando solo convenios pendientes' 
}) => (
  <View style={estilos.banner}>
    <Text style={estilos.texto}>{mensaje}</Text>
  </View>
);

const estilos = StyleSheet.create({
  banner: {
    backgroundColor: '#E2E8F0',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  texto: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
  },
});