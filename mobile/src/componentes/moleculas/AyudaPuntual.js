// Ayuda puntual: una pastilla "Ayuda" que despliega una explicación corta de la pantalla.
// Enunciado de LOAM (Ayuda al usuario): "también debe contar con ayudas en cada sección aunque puntuales".
// Diseño "A · Pastilla con ícono": pastilla lavanda (claro) o índigo oscuro (oscuro) con ícono de pregunta,
// texto y flecha; abierta, una tarjeta con borde índigo a la izquierda. Todos los íconos son SVG (sin emojis).
// Contraste (WCAG AA): pastilla 6,8:1 en claro y 6,4:1 en oscuro; texto de la tarjeta 6,5:1 y 8,3:1.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

// Colores propios de la pastilla (el texto y los íconos usan colores.acento)
const PASTILLA = {
  claro: { fondo: '#EEEDFC', borde: '#DCDAF8' },
  oscuro: { fondo: '#26224A', borde: '#3E3973' },
};

export const AyudaPuntual = ({ texto }) => {
  const { colores, factorActual, esModoOscuro } = usarPreferencias();
  const [abierta, setAbierta] = useState(false);
  const c = colores.acento;
  const tono = esModoOscuro ? PASTILLA.oscuro : PASTILLA.claro;

  return (
    <View style={estilos.contenedor}>
      <TouchableOpacity
        onPress={() => setAbierta((a) => !a)}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={[estilos.pastilla, { backgroundColor: tono.fondo, borderColor: tono.borde }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        accessibilityLabel="Ayuda de esta pantalla"
      >
        {/* ícono de pregunta (decorativo) */}
        <View accessible={false} importantForAccessibility="no-hide-descendants">
          <Svg width={16 * factorActual} height={16 * factorActual} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9.5" stroke={c} strokeWidth={2.2} />
            <Path d="M9.6 9.3a2.5 2.5 0 014.8.9c0 1.7-2.4 2.2-2.4 3.6" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="17.2" r="1" fill={c} />
          </Svg>
        </View>
        <Text style={{ color: c, fontSize: 13 * factorActual, fontWeight: '700' }}>
          {abierta ? 'Ocultar ayuda' : 'Ayuda'}
        </Text>
        {/* flecha (decorativa): hacia abajo cerrada, hacia arriba abierta */}
        <View accessible={false} importantForAccessibility="no-hide-descendants"
          style={{ transform: [{ rotate: abierta ? '180deg' : '0deg' }] }}>
          <Svg width={14 * factorActual} height={14 * factorActual} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </TouchableOpacity>

      {abierta && (
        <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde, borderLeftColor: c }]}>
          <Text style={{ color: colores.textoSecundario, fontSize: 13 * factorActual, lineHeight: 19 * factorActual }}>
            {texto}
          </Text>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 10 },
  pastilla: {
    alignSelf: 'flex-start', // se ajusta al contenido, no ocupa todo el ancho
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  tarjeta: { marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderLeftWidth: 4 },
});
