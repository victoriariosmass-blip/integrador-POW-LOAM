//Fila para listas de convenios (Home, Pendientes, Busqueda)
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { EtiquetaEstado } from '../atomos/EtiquetaEstado';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const ElementoConvenio = ({ codigo, descripcion, estado, alPresionar }) => {
  const { factorActual } = usarPreferencias();
  
  // "En tramite" -> "en_tramite"
  const varianteEstado = estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '_');

  return (
    <TouchableOpacity style={estilos.contenedor} onPress={alPresionar}>
      <View style={estilos.filaSuperior}>
        <Text style={[estilos.codigo, { fontSize: 16 * factorActual }]}>{codigo}</Text>
        <EtiquetaEstado texto={estado} variante={varianteEstado} />
      </View>
      <Text style={[estilos.descripcion, { fontSize: 14 * factorActual }]} numberOfLines={2}>
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
    color: '#2D3748',
  },
  descripcion: {
    marginTop: 6,
    color: '#718096',
  },
});