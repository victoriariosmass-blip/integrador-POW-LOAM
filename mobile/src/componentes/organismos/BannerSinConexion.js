//Aviso que bloquea o notifica la perdida de conexion a internet
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const BannerSinConexion = ({ 
  mensaje = 'Sin conexión • Mostrando solo convenios pendientes' 
}) => {
  const { factorActual, colores } = usarPreferencias();

  return (
    <View style={[estilos.banner, { backgroundColor: colores.tarjetaElevada, borderColor: colores.borde }]}>
      <Text style={[estilos.texto, { color: colores.textoPrincipal, fontSize: 13 * factorActual }]}>{mensaje}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  banner: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  texto: {
    fontWeight: '500',
  },
});