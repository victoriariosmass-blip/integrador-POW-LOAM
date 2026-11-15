// Lectura completa del PDF del convenio, con zoom, para compartir y (si corresponde) firmar al final.
// Enunciado de LOAM (Firmador): "debe permitir su lectura completa del pdf y al final tener un botón
// firmar", "Debe permitir hacer zoom en la lectura", "Debe permitir compartir el convenio, via pdf
// por wsp y email".
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { descargarPdf, htmlLector } from '../servicios/documentos';

export default function PantallaLeerPdf({ route, navigation }) {
  const { id, codigo, documento, puedeFirmar } = route.params || {};
  const { colores, factorActual, esModoOscuro } = usarPreferencias();
  const [archivo, setArchivo] = useState(null); // { uri, base64 }
  const [error, setError] = useState('');
  const [leido, setLeido] = useState(false); // llegó al final del documento
  const visor = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: codigo ?? 'Documento' });
    if (Platform.OS === 'web') {
      setError('El lector de PDF funciona en el celular (Expo Go o la APK).');
      return;
    }
    descargarPdf(id, documento, codigo).then(setArchivo).catch((e) => setError(e.message || 'No se pudo abrir el PDF.'));
  }, [id, documento, codigo, navigation]);

  const compartir = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      setError('Este celular no permite compartir archivos.');
      return;
    }
    // Abre el menú del sistema: WhatsApp, Gmail, etc.
    await Sharing.shareAsync(archivo.uri, { mimeType: 'application/pdf', dialogTitle: `Compartir ${codigo}`, UTI: 'com.adobe.pdf' });
  };

  const alMensaje = (e) => {
    const m = e.nativeEvent.data;
    if (m === 'fin') setLeido(true);
    if (m === 'error') setError('No se pudo abrir el PDF.');
  };

  if (error) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <Text style={{ color: colores.textoPrincipal, fontSize: 15 * factorActual, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }
  if (!archivo) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.acento} />
        <Text style={{ color: colores.textoSecundario, marginTop: 8 }}>Descargando el documento…</Text>
      </View>
    );
  }

  const boton = (texto, accion, etiqueta) => (
    <TouchableOpacity onPress={accion} style={[estilos.zoom, { borderColor: colores.borde, backgroundColor: colores.tarjeta }]}
      accessibilityRole="button" accessibilityLabel={etiqueta}>
      <Text style={{ color: colores.textoPrincipal, fontSize: 18, fontWeight: '700' }}>{texto}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <WebView
        ref={visor}
        originWhitelist={['*']}
        source={{ html: htmlLector(archivo.base64, esModoOscuro) }}
        onMessage={alMensaje}
        setBuiltInZoomControls // zoom con dos dedos en Android
        setDisplayZoomControls={false}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />

      <View style={[estilos.barra, { backgroundColor: colores.tarjeta, borderTopColor: colores.borde }]}>
        {boton('−', () => visor.current?.injectJavaScript('window.zoom(-1); true;'), 'Alejar')}
        {boton('+', () => visor.current?.injectJavaScript('window.zoom(1); true;'), 'Acercar')}
        <View style={{ flex: 1 }}>
          <BotonPersonalizado titulo="Compartir" variante="secundario" alPresionar={compartir} />
        </View>
      </View>

      {puedeFirmar && (
        <View style={[estilos.firmar, { backgroundColor: colores.tarjeta, borderTopColor: colores.borde }]}>
          {leido ? (
            <BotonPersonalizado titulo="FIRMAR CONVENIO" alPresionar={() => navigation.replace('FirmaConvenio', { id, idConvenio: codigo })} />
          ) : (
            <Text style={{ color: colores.textoSecundario, textAlign: 'center', fontSize: 13 * factorActual }} accessibilityLiveRegion="polite">
              Leé el documento hasta el final para poder firmarlo.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  barra: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4, borderTopWidth: 1 },
  zoom: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  firmar: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
});
