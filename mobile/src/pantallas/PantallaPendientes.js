//pantalla para ver convenios pendientes
import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { BannerSinConexion } from '../componentes/organismos/BannerSinConexion';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';

export default function PantallaPendientes({ navigation }) {
  const [estaConectado] = useState(false); // Simulación de estado offline

  const listaPendientes = [
    {
      id: '1',
      codigo: 'MC-2026-0001',
      descripcion: 'Convenio Marco de Cooperación Científica',
      estado: 'Por firmar',
    },
    {
      id: '2',
      codigo: 'MC-2026-0002',
      descripcion: 'Convenio de Pasantías con Sector Productivo',
      estado: 'Por firmar',
    },
  ];

  return (
    <View style={estilos.contenedor}>
      {!estaConectado && <BannerSinConexion />}

      <FlatList
        data={listaPendientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => (
          <ElementoConvenio
            codigo={item.codigo}
            descripcion={item.descripcion}
            estado={item.estado}
            alPresionar={() =>
              navigation.navigate('DetalleConvenio', { idConvenio: item.codigo })
            }
          />
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
  },
  lista: {
    paddingHorizontal: 16,
    paddingTop: 26,
  },
});