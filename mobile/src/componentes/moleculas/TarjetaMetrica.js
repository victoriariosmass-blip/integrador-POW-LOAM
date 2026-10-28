//tarjetas para el home: resumen numerico 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const TarjetaMetrica = ({ titulo, valor }) => {
  const { factorActual, colores } = usarPreferencias();

  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      <Text style={[estilos.titulo, { color: colores.textoSecundario, fontSize: 13 * factorActual }]}>{titulo}</Text>
      <Text style={[estilos.valor, { color: colores.textoPrincipal, fontSize: 22 * factorActual }]}>{valor}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    margin: 6,
  },
  titulo: {
    marginBottom: 6,
  },
  valor: {
    fontWeight: 'bold',
  },
});