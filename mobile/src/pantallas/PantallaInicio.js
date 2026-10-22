//pantalla principal y 10 ultimos movimientos
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TarjetaMetrica } from '../componentes/moleculas/TarjetaMetrica';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';

export default function PantallaInicio({ navigation }) {
  const conveniosRecientes = [
    {
      id: '1',
      codigo: 'MC-2026-0001',
      descripcion: 'Convenio Marco de Colaboración Académica e Investigación',
      estado: 'Vigente',
    },
    {
      id: '2',
      codigo: 'EC-2026-0002',
      descripcion: 'Convenio Específico de Pasantía Profesional - Facultad de Ingeniería',
      estado: 'Por firmar',
    },
    {
      id: '3',
      codigo: 'AD-2026-0001',
      descripcion: 'Adenda modificatoria de plazos y cronograma de actividades',
      estado: 'En trámite',
    },
  ];

  return (
    <ScrollView style={estilos.contenedor}>
      <Text style={estilos.saludo}>Hola, Autoridad</Text>

      {/* Cajas de resumen de métricas */}
      <View style={estilos.grillaMetricas}>
        <TarjetaMetrica titulo="Firmados (último año)" valor="24" />
        <TarjetaMetrica titulo="Vigentes" valor="58" />
        <TarjetaMetrica titulo="En trámite" valor="12" />
        <TarjetaMetrica titulo="Por firmar" valor="3" />
      </View>

      {/* Listado de movimientos */}
      <View style={estilos.cabeceraSeccion}>
        <Text style={estilos.tituloSeccion}>Últimos 10 movimientos</Text>
      </View>

      {conveniosRecientes.map((convenio) => (
        <ElementoConvenio
          key={convenio.id}
          codigo={convenio.codigo}
          descripcion={convenio.descripcion}
          estado={convenio.estado}
          alPresionar={() =>
            navigation.navigate('DetalleConvenio', { idConvenio: convenio.codigo })
          }
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  saludo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A202C',
  },
  grillaMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cabeceraSeccion: {
    marginVertical: 14,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
});