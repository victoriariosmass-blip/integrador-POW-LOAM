//tarjetas para el home: resumen numerico 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TarjetaMetrica = ({ titulo, valor }) => (
  <View style={estilos.tarjeta}>
    <Text style={estilos.titulo}>{titulo}</Text>
    <Text style={estilos.valor}>{valor}</Text>
  </View>
);

const estilos = StyleSheet.create({
  tarjeta: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    margin: 6,
  },
  titulo: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  valor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
});