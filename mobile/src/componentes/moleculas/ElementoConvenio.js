//Fila para listas de convenios (Home, Pendientes, Busqueda)
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { EtiquetaEstado } from '../atomos/EtiquetaEstado';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const ElementoConvenio = ({ codigo, descripcion, estado, alPresionar }) => {
  const { factorActual, colores } = usarPreferencias();
  
  // "En tramite" -> "en_tramite"
  const varianteEstado = estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '_');

  return (
    <TouchableOpacity
      style={[estilos.contenedor, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}
      onPress={alPresionar}
    >
      <View style={estilos.filaSuperior}>
        <Text style={[estilos.codigo, { color: colores.textoPrincipal, fontSize: 16 * factorActual }]}>{codigo}</Text>
        <EtiquetaEstado texto={estado} variante={varianteEstado} />
      </View>
      <Text style={[estilos.descripcion, { color: colores.textoSecundario, fontSize: 14 * factorActual }]} numberOfLines={2}>
        {descripcion}
      </Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codigo: {
    fontWeight: 'bold',
  },
  descripcion: {
    marginTop: 6,
  },
});