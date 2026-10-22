//pantalla para subir PDF's con un peso menor a 20MB
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

export default function PantallaSubirAnexo({ route, navigation }) {
  const { idConvenio } = route.params || { idConvenio: 'MC-2026-0001' };
  const { colores } = usarPreferencias();
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const seleccionarPDF = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
      const archivo = resultado.assets[0];
      // Validación máxima de 20 MB
      if (archivo.size > 20 * 1024 * 1024) {
        Alert.alert('Archivo muy grande', 'El archivo supera el límite de 20 MB permitido.');
        return;
      }
      setArchivoSeleccionado(archivo);
    }
  };

  const subirDocumentoConMetadatos = () => {
    if (!archivoSeleccionado) {
      Alert.alert('Atención', 'Selecciona un archivo PDF primero.');
      return;
    }

    // Datos que se enviarán a la API para la marca de metadatos
    const metadatosMarca = {
      idConvenio,
      usuarioSubida: 'autoridad_actual',
      fechaHoraSubida: new Date().toISOString(),
      nombreArchivo: archivoSeleccionado.name,
    };

    Alert.alert(
      'Documento subido',
      `Se subió ${archivoSeleccionado.name} con metadatos registrados para la API.`,
      [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <Text style={[estilos.titulo, { color: colores.textoPrincipal }]}>Subir anexo al convenio: {idConvenio}</Text>
      <Text style={estilos.nota}>Solo se admiten documentos en formato PDF de hasta 20 MB.</Text>

      <BotonPersonalizado titulo="Seleccionar PDF" variante="secundario" alPresionar={seleccionarPDF} />

      {archivoSeleccionado && (
        <View style={estilos.tarjetaArchivo}>
          <Text style={estilos.nombreArchivo}>📄 {archivoSeleccionado.name}</Text>
          <Text style={estilos.tamanio}>{(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB</Text>
        </View>
      )}

      <BotonPersonalizado
        titulo="SUBIR Y GENERAR MARCA"
        deshabilitado={!archivoSeleccionado}
        alPresionar={subirDocumentoConMetadatos}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 20 },
  titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  nota: { fontSize: 12, color: '#718096', marginBottom: 16 },
  tarjetaArchivo: { padding: 12, borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, marginVertical: 12 },
  nombreArchivo: { fontWeight: 'bold', color: '#2D3748' },
  tamanio: { fontSize: 11, color: '#718096', marginTop: 4 },
});