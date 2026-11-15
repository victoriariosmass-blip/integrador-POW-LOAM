// "ⓘ Ayuda": una línea que se despliega con una explicación corta de la pantalla.
// Enunciado de LOAM (Ayuda al usuario): "también debe contar con ayudas en cada sección aunque puntuales".
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const AyudaPuntual = ({ texto }) => {
  const { colores, factorActual } = usarPreferencias();
  const [abierta, setAbierta] = useState(false);
  return (
    <View style={estilos.contenedor}>
      <TouchableOpacity onPress={() => setAbierta((a) => !a)} accessibilityRole="button" accessibilityState={{ expanded: abierta }}
        accessibilityLabel="Ayuda de esta pantalla">
        <Text style={{ color: colores.acento, fontSize: 13 * factorActual, fontWeight: '600' }}>ⓘ {abierta ? 'Ocultar ayuda' : 'Ayuda'}</Text>
      </TouchableOpacity>
      {abierta && (
        <Text style={[estilos.texto, { color: colores.textoSecundario, backgroundColor: colores.tarjeta, borderColor: colores.borde, fontSize: 13 * factorActual }]}>
          {texto}
        </Text>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 10 },
  texto: { marginTop: 6, padding: 10, borderRadius: 12, borderWidth: 1, lineHeight: 19 },
});