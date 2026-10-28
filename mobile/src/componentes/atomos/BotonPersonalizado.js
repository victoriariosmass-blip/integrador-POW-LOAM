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
          ? { backgroundColor: colores.botonPrimario }
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
          !esPrimario && { color: colores.textoPrincipal },
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
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  secundario: {
    borderWidth: 1,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});