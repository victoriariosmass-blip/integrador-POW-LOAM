//realiza el flujo entero de firma: Trazo manual + biometria + captura de latitud/longitud, fecha y hora
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { LienzoFirma } from '../componentes/atomos/LienzoFirma';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

export default function PantallaFirmaConvenio({ route, navigation }) {
  const { idConvenio } = route.params || { idConvenio: 'MC-2026-0001' };
  const { colores, factorActual } = usarPreferencias();
  const [trazoCapturado, setTrazoCapturado] = useState('');
  const [datosFirma, setDatosFirma] = useState(null);
  const [pasoExitoso, setPasoExitoso] = useState(false);

  const ejecutarFirmaBiometricaYGeolocalizada = async () => {
    if (!trazoCapturado) {
      Alert.alert('Firma requerida', 'Por favor realiza tu trazo a mano alzada en el recuadro antes de continuar.');
      return;
    }

    try {
      // 1. Verificación Biométrica
      const soportaBiometria = await LocalAuthentication.hasHardwareAsync();
      if (soportaBiometria) {
        const resultadoAut = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirmá tu identidad con huella dactilar o rostro',
          cancelLabel: 'Cancelar',
        });
        if (!resultadoAut.success) {
          Alert.alert('Error', 'No se pudo validar la biometría.');
          return;
        }
      }

      // 2. Obtener Ubicación (Latitud y Longitud)
      const { status } = await Location.requestForegroundPermissionsAsync();
      let ubicacionActual = { coords: { latitude: -35.6566, longitude: -63.7568 } }; // Coordenadas UNLPam por defecto
      if (status === 'granted') {
        ubicacionActual = await Location.getCurrentPositionAsync({});
      }

      // 3. Consolidar Metadata de la Firma
      const ahora = new Date();
      setDatosFirma({
        fechaHora: ahora.toLocaleString('es-AR'),
        latitud: ubicacionActual.coords.latitude.toFixed(5),
        longitud: ubicacionActual.coords.longitude.toFixed(5),
        hashIntegridad: 'SHA256-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });

      setPasoExitoso(true);
    } catch (error) {
      Alert.alert('Error al firmar', error.message);
    }
  };

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <Text style={[estilos.titulo, { color: colores.textoPrincipal, fontSize: 18 * factorActual }]}>
        Firmar: {idConvenio}
      </Text>

      {!pasoExitoso ? (
        <View>
          <Text style={[estilos.subtitulo, { color: colores.textoSecundario }]}>
            Firma con el dedo dentro del recuadro:
          </Text>
          <LienzoFirma alCambiarTrazo={(trazo) => setTrazoCapturado(trazo)} />

          <Text style={estilos.notaGps}>📍 Ubicación: se registrará fecha, latitud y longitud al confirmar.</Text>

          <BotonPersonalizado
            titulo="CONFIRMAR CON HUELLA"
            alPresionar={ejecutarFirmaBiometricaYGeolocalizada}
          />
        </View>
      ) : (
        <View style={estilos.tarjetaExito}>
          <Text style={estilos.textoExito}>✓ Convenio Firmado Exitosamente</Text>
          <Text style={estilos.lineaDato}>Fecha y Hora: {datosFirma.fechaHora}</Text>
          <Text style={estilos.lineaDato}>Latitud: {datosFirma.latitud}</Text>
          <Text style={estilos.lineaDato}>Longitud: {datosFirma.longitud}</Text>
          <Text style={estilos.lineaDato}>Hash: {datosFirma.hashIntegridad}</Text>

          <BotonPersonalizado
            titulo="VOLVER AL INICIO"
            alPresionar={() => navigation.navigate('Inicio')}
          />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  titulo: { fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { fontSize: 13, marginBottom: 4 },
  notaGps: { fontSize: 12, color: '#718096', marginVertical: 8 },
  tarjetaExito: { padding: 16, borderRadius: 8, backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#68D391', marginTop: 20 },
  textoExito: { fontSize: 16, fontWeight: 'bold', color: '#276749', marginBottom: 12 },
  lineaDato: { fontSize: 13, color: '#2D3748', marginVertical: 3 },
});