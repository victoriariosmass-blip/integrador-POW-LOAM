// Buscador en el header de la app (arriba de todas las pestañas). Al tocarlo abre el buscador avanzado.
// Enunciado de LOAM: "El buscador debe aparecer en el header".
// Diseño "A · Integrado": pastilla con borde suave sobre el mismo fondo que la pantalla (el header usa
// colores.fondo, ver NavegadorPestanias) y lupa dibujada con SVG en lugar del emoji.
// Contraste (WCAG AA): texto 6,5:1 en claro y 7,5:1 en oscuro; lupa 7,9:1 en claro y 6,4:1 en oscuro.
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

// Lo que ocupan a cada lado del título centrado la foto de perfil (32 + margen 14) y el aire del header
const RESERVA_LATERAL = 64;

export const BuscadorHeader = () => {
  const navigation = useNavigation();
  const { colores, factorActual, esModoOscuro } = usarPreferencias();
  const { width } = useWindowDimensions();
  const tamanioIcono = 18 * factorActual;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Buscar')}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[
        estilos.pildora,
        {
          // ancho del espacio del título, sin pisar la foto de perfil de la derecha
          width: Math.min(width - RESERVA_LATERAL * 2, 420),
          minHeight: 40 * factorActual,
          backgroundColor: esModoOscuro ? colores.tarjetaElevada : '#FFFFFF',
          borderColor: colores.borde,
        },
      ]}
      accessibilityRole="search"
      accessibilityLabel="Buscar convenios"
    >
      {/* lupa decorativa: el nombre ya lo da el accessibilityLabel */}
      <View accessible={false} importantForAccessibility="no-hide-descendants">
        <Svg width={tamanioIcono} height={tamanioIcono} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="7" stroke={colores.acento} strokeWidth={2.2} />
          <Path d="M20 20l-3.6-3.6" stroke={colores.acento} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      </View>
      <Text numberOfLines={1} style={[estilos.texto, { color: colores.textoSecundario, fontSize: 15 * factorActual }]}>
        Buscar convenios…
      </Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  texto: { flexShrink: 1 },
});
