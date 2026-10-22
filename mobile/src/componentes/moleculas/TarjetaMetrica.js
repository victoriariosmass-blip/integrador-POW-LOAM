//tarjetas para el home: resumen numerico 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const TarjetaMetrica = ({ titulo, valor }) => {
  const { factorActual } = usarPreferencias();

  return (
    <View style={estilos.tarjeta}>
      <Text style={[estilos.titulo, { fontSize: 13 * factorActual }]}>{titulo}</Text>
      <Text style={[estilos.valor, { fontSize: 22 * factorActual }]}>{valor}</Text>
    </View>
  );
};

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
    color: '#718096',
    marginBottom: 6,
  },
  valor: {
    fontWeight: 'bold',
    color: '#1A202C',
  },
});