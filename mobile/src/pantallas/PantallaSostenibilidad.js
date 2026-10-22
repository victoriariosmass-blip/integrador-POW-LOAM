//pantalla que simula metricas de supuestos ahorros generados por evitar el papel y agilizar todo el circuito
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TarjetaMetrica } from '../componentes/moleculas/TarjetaMetrica';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

export default function PantallaSostenibilidad() {
  const { colores } = usarPreferencias();

  return (
    <ScrollView style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <Text style={[estilos.titulo, { color: colores.textoPrincipal }]}>Sostenibilidad Institucional</Text>
      <Text style={estilos.aclaracion}>
        Módulo simulado con estimaciones de ahorro administrativo por uso digital del sistema de convenios de la UNLPam.
      </Text>

      <View style={estilos.grilla}>
        <TarjetaMetrica titulo="Hojas de papel ahorradas" valor="12.450" />
        <TarjetaMetrica titulo="Horas de gestión reducidas" valor="340 hs" />
        <TarjetaMetrica titulo="Costos administrativos ($)" valor="$ 850.000" />
        <TarjetaMetrica titulo="Traslados físicos evitados" valor="128 viajes" />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  aclaracion: { fontSize: 12, color: '#718096', marginBottom: 16 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});