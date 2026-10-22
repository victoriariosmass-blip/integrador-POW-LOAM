//Fila para listas de convenios (Home, Pendientes, Busqueda)
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { EtiquetaEstado } from '../atomos/EtiquetaEstado';

export const ElementoConvenio = ({ codigo, descripcion, estado, alPresionar }) => {
  const varianteEstado = estado.toLowerCase().replace(/\s+/g, '_');

  return (
    <TouchableOpacity style={estilos.contenedor} onPress={alPresionar}>
      <View style={estilos.filaSuperior}>
        <Text style={estilos.codigo}>{codigo}</Text>
        <EtiquetaEstado texto={estado} variante={varianteEstado} />
      </View>
      <Text style={estilos.descripcion} numberOfLines={2}>
        {descripcion}
      </Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codigo: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2D3748',
  },
  descripcion: {
    marginTop: 6,
    fontSize: 13,
    color: '#718096',
  },
});