//lienzo tactil para capturar trazos a mano alzada usando gestos nativos y SVG
//Desde afuera, con una ref, se puede pedir el PNG de la firma (obtenerPNG) o borrarla (limpiar)
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

// La firma siempre es tinta oscura sobre blanco (como un papel), también en modo oscuro,
// así la imagen que se guarda se ve bien en cualquier lado
const TINTA = '#1A202C';

export const LienzoFirma = forwardRef(({ alCambiarTrazo }, ref) => {
  const { colores } = usarPreferencias();
  const svgRef = useRef(null);
  const [caminos, setCaminos] = useState([]);
  const [caminoActual, setCaminoActual] = useState('');
  const [tamanio, setTamanio] = useState({ ancho: 0, alto: 0 }); // medida real del recuadro

  useImperativeHandle(ref, () => ({
    // PNG en base64 (sin el "data:image/png;base64,")
    obtenerPNG: () => new Promise((resolver) => svgRef.current.toDataURL((base64) => resolver(base64))),
    limpiar: () => {
      setCaminos([]);
      setCaminoActual('');
      if (alCambiarTrazo) alCambiarTrazo('');
    },
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false, // que el scroll no corte el trazo
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
    <View
      style={[estilos.contenedorLienzo, { borderColor: colores.borde }]}
      onLayout={(e) => setTamanio({ ancho: e.nativeEvent.layout.width, alto: e.nativeEvent.layout.height })}
      {...panResponder.panHandlers}
    >
      {/* pointerEvents none: los toques los recibe siempre el recuadro, así las coordenadas no saltan */}
      <Svg ref={svgRef} width={tamanio.ancho} height={tamanio.alto} pointerEvents="none">
        <Rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" />
        {caminos.map((camino, indice) => (
          <Path key={indice} d={camino} stroke={TINTA} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {caminoActual ? (
          <Path d={caminoActual} stroke={TINTA} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
      </Svg>
    </View>
  );
});

LienzoFirma.displayName = 'LienzoFirma';

const estilos = StyleSheet.create({
  contenedorLienzo: {
    height: 220,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
