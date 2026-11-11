//Botón reutilizable para ingresos y firmas
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const BotonPersonalizado = ({ 
  titulo, 
  alPresionar, 
  deshabilitado = false, 
  variante = 'primario' 
}) => {
  const esPrimario = variante === 'primario';
  const { colores } = usarPreferencias();

  return (
    <TouchableOpacity
      style={[
        estilos.boton,
        esPrimario
          ? [estilos.primario, { backgroundColor: colores.botonPrimario, shadowColor: colores.botonPrimario }]
          : [
              estilos.secundario,
              { backgroundColor: colores.botonSecundario, borderColor: colores.borde },
            ],
        deshabilitado && estilos.deshabilitado,
      ]}
      onPress={alPresionar}
      disabled={deshabilitado}
    >
      <Text
        style={[
          estilos.texto,
          !esPrimario && { color: colores.acento },
        ]}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  boton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  // sombra índigo suave, como los botones de la web
  primario: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  secundario: {
    borderWidth: 1,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});