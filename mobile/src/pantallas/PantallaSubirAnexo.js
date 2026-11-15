// Subir un PDF a un convenio (principal, anexo, dictamen, resolución u otro).
// Se llega desde la pestaña Documentos de la ficha, solo si el usuario puede editar el convenio
// (gestor o admin de su unidad, y el convenio en borrador). La API vuelve a validar todo.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { subirDocumento, CATEGORIAS_DOCUMENTO } from '../servicios/convenios';

const MAXIMO_BYTES = 20 * 1024 * 1024; // 20 MB, igual que la API

const megas = (bytes) => `${((bytes ?? 0) / 1024 / 1024).toFixed(2)} MB`;

export default function PantallaSubirAnexo({ route, navigation }) {
  const { id, codigo } = route.params || {};
  const { colores, factorActual } = usarPreferencias();
  const [categoria, setCategoria] = useState('anexo');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [subido, setSubido] = useState(null);

  const texto = (t) => ({ color: colores.textoPrincipal, fontSize: t * factorActual });
  const secundario = (t) => ({ color: colores.textoSecundario, fontSize: t * factorActual });

  const elegirPdf = async () => {
    setError('');
    setSubido(null);
    const resultado = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (resultado.canceled || !resultado.assets?.length) return;
    const elegido = resultado.assets[0];
    // Prevención de errores: se avisa antes de intentar subirlo
    if (!elegido.name?.toLowerCase().endsWith('.pdf')) {
      setError('El archivo tiene que ser un PDF.');
      return;
    }
    if (elegido.size > MAXIMO_BYTES) {
      setError(`El PDF pesa ${megas(elegido.size)} y el máximo es 20 MB.`);
      return;
    }
    setArchivo(elegido);
  };

  const subir = async () => {
    setError('');
    setSubiendo(true);
    try {
      const documento = await subirDocumento(id, archivo, categoria);
      setSubido(documento);
      setArchivo(null);
    } catch (e) {
      if (e.status === 403) setError('No tenés permiso para subir documentos a este convenio (solo se puede mientras está en borrador).');
      else if (e.status === 413) setError('El archivo es demasiado grande para el servidor.');
      else if (e.status === 422) setError(e.errores?.archivo?.[0] ?? e.errores?.categoria?.[0] ?? e.message);
      else setError(e.message || 'No se pudo subir el documento.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor}>
      <Text style={[estilos.titulo, texto(18)]}>Subir documento</Text>
      <Text style={[estilos.nota, secundario(13)]}>
        Convenio {codigo}. Solo PDF de hasta 20 MB. Los documentos anteriores no se borran: cada carga queda como una versión nueva.
      </Text>

      <Text style={[estilos.etiqueta, texto(14)]}>Tipo de documento</Text>
      <View style={estilos.categorias} accessibilityRole="radiogroup">
        {Object.entries(CATEGORIAS_DOCUMENTO).map(([clave, nombre]) => {
          const elegida = categoria === clave;
          return (
            <TouchableOpacity
              key={clave}
              onPress={() => setCategoria(clave)}
              accessibilityRole="radio"
              accessibilityState={{ checked: elegida }}
              style={[
                estilos.categoria,
                { borderColor: elegida ? colores.botonPrimario : colores.borde, backgroundColor: elegida ? colores.botonPrimario : colores.tarjeta },
              ]}
            >
              <Text style={{ color: elegida ? '#FFFFFF' : colores.textoPrincipal, fontWeight: '600', fontSize: 13 * factorActual }}>{nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <BotonPersonalizado titulo={archivo ? 'Elegir otro PDF' : 'Elegir PDF'} variante="secundario" alPresionar={elegirPdf} deshabilitado={subiendo} />

      {archivo && (
        <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
          <Text style={[texto(14), { fontWeight: '600' }]}>📄 {archivo.name}</Text>
          <Text style={secundario(12)}>{megas(archivo.size)} · {CATEGORIAS_DOCUMENTO[categoria]}</Text>
        </View>
      )}

      {error ? (
        <View style={[estilos.tarjeta, { backgroundColor: colores.errorFondo, borderColor: colores.error }]} accessibilityRole="alert">
          <Text style={{ color: colores.error, fontSize: 14 * factorActual }}>{error}</Text>
        </View>
      ) : null}

      {subido && (
        <View style={[estilos.tarjeta, { backgroundColor: colores.exitoFondo, borderColor: colores.exitoBorde }]} accessibilityLiveRegion="polite">
          <Text style={{ color: colores.exito, fontWeight: '700', fontSize: 14 * factorActual }}>Documento subido</Text>
          <Text style={{ color: colores.exito, fontSize: 13 * factorActual }}>
            {subido.nombre_original} · {CATEGORIAS_DOCUMENTO[subido.categoria] ?? subido.categoria} · versión {subido.numero_version}
          </Text>
        </View>
      )}

      {subiendo ? (
        <ActivityIndicator size="large" color={colores.acento} style={{ marginVertical: 12 }} />
      ) : subido ? (
        <BotonPersonalizado titulo="Volver a la ficha" alPresionar={() => navigation.goBack()} />
      ) : (
        <BotonPersonalizado titulo="Subir documento" alPresionar={subir} deshabilitado={!archivo} />
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 20 },
  titulo: { fontWeight: '800', marginBottom: 6 },
  nota: { marginBottom: 18 },
  etiqueta: { fontWeight: '600', marginBottom: 8 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  categoria: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  tarjeta: { padding: 12, borderWidth: 1, borderRadius: 12, marginVertical: 8 },
});