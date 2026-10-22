//lector de codigos QR para abrir convenios con un timeout de 60seg de inactividad, cierra la pantalla si no se lee nada
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';

export default function PantallaEscanear({ navigation }) {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);

  useEffect(() => {
    // Requisito: Si no se reconoce un código en 1 minuto, cerrar la pantalla
    const temporizador = setTimeout(() => {
      if (!escaneado) {
        Alert.alert('Tiempo agotado', 'No se detectó ningún código QR en 60 segundos.', [
          { text: 'Aceptar', onPress: () => navigation.goBack() },
        ]);
      }
    }, 60000);

    return () => clearTimeout(temporizador);
  }, [escaneado]);

  if (!permiso) {
    return <View />;
  }

  if (!permiso.granted) {
    return (
      <View style={estilos.contenedorCentrado}>
        <Text style={estilos.textoPermiso}>Necesitamos acceso a la cámara para escanear el QR del convenio.</Text>
        <BotonPersonalizado titulo="Conceder permiso" alPresionar={solicitarPermiso} />
      </View>
    );
  }

  const manejarLecturaQR = ({ data }) => {
    setEscaneado(true);
    // El QR contiene una referencia segura (ej. ID o código único)
    Alert.alert('Código reconocido', `Referencia de convenio: ${data}`, [
      {
        text: 'Abrir ficha',
        onPress: () => navigation.navigate('DetalleConvenio', { idConvenio: data }),
      },
    ]);
  };

  return (
    <View style={estilos.contenedor}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={escaneado ? undefined : manejarLecturaQR}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={estilos.cuadroEnfoque} />
      <Text style={estilos.instruccion}>Apuntá al código QR del convenio</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  contenedorCentrado: { flex: 1, justifyContent: 'center', padding: 20 },
  textoPermiso: { textAlign: 'center', marginBottom: 15, fontSize: 14 },
  cuadroEnfoque: { width: 220, height: 220, borderWidth: 2, borderColor: '#FFF', borderRadius: 12 },
  instruccion: { color: '#FFF', marginTop: 20, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 6 },
});