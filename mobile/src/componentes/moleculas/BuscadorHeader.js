// Buscador en el header de la app (arriba de todas las pestañas). Al tocarlo abre el buscador avanzado.
// Enunciado de LOAM: "El buscador debe aparecer en el header".
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const BuscadorHeader = () => {
  const navigation = useNavigation();
  const { colores, factorActual, esModoOscuro } = usarPreferencias();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Buscar')}
      style={[estilos.pildora, { backgroundColor: esModoOscuro ? colores.tarjetaElevada : '#F1F0FE' }]}
      accessibilityRole="search"
      accessibilityLabel="Buscar convenios"
    >
      <Text style={{ color: colores.textoSecundario, fontSize: 15 * factorActual }}>🔍  Buscar convenios…</Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  pildora: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, minWidth: 220 },
});