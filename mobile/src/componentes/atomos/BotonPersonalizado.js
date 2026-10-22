//Botón reutilizable para ingresos y firmas
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const BotonPersonalizado = ({ 
  titulo, 
  alPresionar, 
  deshabilitado = false, 
  variante = 'primario' 
}) => {
  const esPrimario = variante === 'primario';

  return (
    <TouchableOpacity
      style={[
        estilos.boton,
        esPrimario ? estilos.primario : estilos.secundario,
        deshabilitado && estilos.deshabilitado,
      ]}
      onPress={alPresionar}
      disabled={deshabilitado}
    >
      <Text style={[estilos.texto, !esPrimario && estilos.textoSecundario]}>
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
  primario: {
    backgroundColor: '#4A5568',
  },
  secundario: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  deshabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textoSecundario: {
    color: '#2D3748',
  },
});