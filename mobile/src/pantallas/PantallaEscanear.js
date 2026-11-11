//lector de codigos QR para abrir convenios con un timeout de 60seg de inactividad, cierra la pantalla si no se lee nada
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { buscarPorQR } from '../servicios/convenios';

export default function PantallaEscanear({ navigation }) {
  const { colores } = usarPreferencias();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [buscando, setBuscando] = useState(false);

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
    return <View style={[estilos.contenedorCentrado, { backgroundColor: colores.fondo }]} />;
  }

  if (!permiso.granted) {
    return (
      <View style={[estilos.contenedorCentrado, { backgroundColor: colores.fondo }]}>
        <Text style={[estilos.textoPermiso, { color: colores.textoPrincipal }]}>Necesitamos acceso a la cámara para escanear el QR del convenio.</Text>
        <BotonPersonalizado titulo="Conceder permiso" alPresionar={solicitarPermiso} />
      </View>
    );
  }

  // El QR de la web lleva a la página pública del convenio. Con esa referencia
  // se busca el convenio en la API y se abre su ficha completa.
  const manejarLecturaQR = async ({ data }) => {
    setEscaneado(true);
    setBuscando(true);
    try {
      const id = await buscarPorQR(data);
      navigation.replace('DetalleConvenio', { id });
    } catch (e) {
      const mensaje = e.status === 404
        ? 'Este código QR no corresponde a ningún convenio.'
        : e.status === 403
          ? 'No tenés permiso para ver este convenio.'
          : e.message || 'No se pudo leer el código.';
      Alert.alert('No se pudo abrir el convenio', mensaje, [
        { text: 'Escanear otro', onPress: () => setEscaneado(false) },
        { text: 'Salir', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <CameraView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onBarcodeScanned={escaneado ? undefined : manejarLecturaQR}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={estilos.cuadroEnfoque} />
      {buscando ? (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
      ) : (
        <Text style={estilos.instruccion}>Apuntá al código QR del convenio (está en su ficha de la web)</Text>
      )}
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