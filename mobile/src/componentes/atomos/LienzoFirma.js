//lienzo tactil para capturar trazos a mano alzada usando gestos nativos y SVG
import React, { useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const LienzoFirma = ({ alCambiarTrazo, limpiarTrigger }) => {
  const [caminos, setCaminos] = useState([]);
  const [caminoActual, setCaminoActual] = useState('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evento) => {
      const { locationX, locationY } = evento.nativeEvent;
      setCaminoActual(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (evento) => {
      const { locationX, locationY } = evento.nativeEvent;
      setCaminoActual((prev) => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (caminoActual) {
        const nuevosCaminos = [...caminos, caminoActual];
        setCaminos(nuevosCaminos);
        setCaminoActual('');
        if (alCambiarTrazo) alCambiarTrazo(nuevosCaminos.join(' '));
      }
    },
  });

  return (
    <View style={estilos.contenedorLienzo} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {caminos.map((camino, indice) => (
          <Path key={indice} d={camino} stroke="#1A202C" strokeWidth={3} fill="none" />
        ))}
        {caminoActual ? (
          <Path d={caminoActual} stroke="#1A202C" strokeWidth={3} fill="none" />
        ) : null}
      </Svg>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorLienzo: {
    height: 220,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    marginVertical: 12,
  },
});