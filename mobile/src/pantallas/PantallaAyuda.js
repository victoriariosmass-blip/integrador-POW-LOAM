// Manual del usuario: cómo registrar la identidad y cómo firmar un convenio.
// Enunciado de LOAM (Ayuda al usuario): "La app debe contar con un manual del usuario, básicamente un
// pequeño instructivo de como registrar mi identidad y firmar un documento."
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

const SECCIONES = [
  {
    titulo: '1. Registrar mi identidad',
    pasos: [
      'Ingrese a Perfil > Registrar mi identidad.',
      'Mi firma: firme con el dedo dentro del cuadro y presione "Guardar mi firma".',
      'Reconocimiento facial: presione "Registrar mi rostro" y mire el celular.',
      'Huella digital: presione "Registrar mi huella" y apoye el dedo en el lector.',
      'Cada uno queda con un ✓ y la fecha en que lo registró. Se requiere conexión.',
    ],
  },
  {
    titulo: '2. Firmar un convenio',
    pasos: [
      'En Pendientes están los convenios que esperan su firma (los más nuevos primero).',
      'Abra el convenio y presione "Leer y firmar convenio".',
      'Lea el PDF completo. Puede acercar y alejar con los dedos o con + y −, y compartirlo por WhatsApp o mail.',
      'Al llegar al final aparece "Firmar convenio".',
      'Confirme con su huella o su rostro, firme a mano en el cuadro y presione "Firmar".',
      'La app guarda la fecha, la hora y el lugar (latitud y longitud). En la ficha queda "Firmado por…" con esos datos.',
    ],
  },
  {
    titulo: '3. Sin conexión',
    pasos: [
      'Sin conexión a internet puede seguir usando la app con su sesión, pero solo para ver los convenios pendientes de firma.',
      'El buscador, los comentarios, la firma y el registro de identidad avisan cuando no hay conexión.',
    ],
  },
];

export default function PantallaAyuda({ navigation }) {
  const { colores, factorActual } = usarPreferencias();
  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor}>
      <Text style={{ color: colores.textoPrincipal, fontSize: 22 * factorActual, fontWeight: '800', marginBottom: 4 }}>Manual de uso</Text>
      <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual, marginBottom: 16 }}>
        Cómo registrar su identidad y firmar un convenio desde la app.
      </Text>
      {SECCIONES.map((s) => (
        <View key={s.titulo} style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
          <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual, fontWeight: '700', marginBottom: 8 }} accessibilityRole="header">{s.titulo}</Text>
          {s.pasos.map((p, i) => (
            <View key={p} style={estilos.paso}>
              <Text style={[estilos.numero, { backgroundColor: colores.botonPrimario, fontSize: 12 * factorActual }]}>{i + 1}</Text>
              <Text style={{ flex: 1, color: colores.textoPrincipal, fontSize: 14 * factorActual, lineHeight: 20 * factorActual }}>{p}</Text>
            </View>
          ))}
        </View>
      ))}
      <BotonPersonalizado titulo="Ir a registrar mi identidad" alPresionar={() => navigation.navigate('Identidad')} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 32 },
  tarjeta: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  paso: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  numero: { width: 22, height: 22, borderRadius: 11, color: '#FFFFFF', textAlign: 'center', fontWeight: '700', lineHeight: 22, overflow: 'hidden' },
});
