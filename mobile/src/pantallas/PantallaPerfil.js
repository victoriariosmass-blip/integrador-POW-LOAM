//pantalla de perfil (tipografias y tema oscuro/claro)
// Enunciado de LOAM: "Debe permitir cargar mi foto de perfil, la misma debe ser mostrada en miniatura en la app".
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { FotoPerfil } from '../componentes/atomos/FotoPerfil';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { usarSesion } from '../contexto/ContextoSesion';


export default function PantallaPerfil({ navigation }) {
  const {
    esModoOscuro,
    setEsModoOscuro,
    tamanioLetra,
    setTamanioLetra,
    factorActual,
    colores,
    fotoPerfil,
    cambiarFoto,
  } = usarPreferencias();

  const { usuario, salir } = usarSesion();
  const [avisoFoto, setAvisoFoto] = useState('');

  // Copia la foto a la carpeta de la app para que no se borre con la caché
  const guardarImagen = async (resultado) => {
    if (resultado.canceled) return;
    let uri = resultado.assets[0].uri;
    if (Platform.OS !== 'web') {
      const destino = `${FileSystem.documentDirectory}foto-perfil-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: destino });
      uri = destino;
    }
    await cambiarFoto(uri);
    setAvisoFoto('Foto actualizada.');
  };

  const elegirFoto = async (desdeCamara) => {
    setAvisoFoto('');
    const permiso = desdeCamara
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      setAvisoFoto(desdeCamara ? 'Necesitamos permiso para usar la cámara.' : 'Necesitamos permiso para ver tus fotos.');
      return;
    }
    const opciones = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 };
    try {
      await guardarImagen(desdeCamara ? await ImagePicker.launchCameraAsync(opciones) : await ImagePicker.launchImageLibraryAsync(opciones));
    } catch {
      setAvisoFoto('No se pudo guardar la foto.');
    }
  };

  const cerrarSesion = async () => {
    await cambiarFoto(null);
    await salir();
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor}>
      <Text
        style={[
          estilos.titulo,
          { color: colores.textoPrincipal, fontSize: 24 * factorActual },
        ]}
      >
        Mi Perfil
      </Text>
      
      <View style={estilos.filaFoto}>
        <FotoPerfil uri={fotoPerfil} nombre={usuario?.name ?? ''} tamanio={72} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual, fontWeight: '700' }}>{usuario?.name}</Text>
          <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual }}>{usuario?.email}</Text>
          <View style={estilos.filaBotonesFoto}>
            <TouchableOpacity onPress={() => elegirFoto(true)} accessibilityRole="button" accessibilityLabel="Sacar una foto de perfil con la cámara">
              <Text style={{ color: colores.acento, fontWeight: '700', fontSize: 14 * factorActual }}>Sacar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => elegirFoto(false)} accessibilityRole="button" accessibilityLabel="Elegir una foto de perfil de la galería">
              <Text style={{ color: colores.acento, fontWeight: '700', fontSize: 14 * factorActual }}>Elegir de la galería</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {avisoFoto ? <Text style={{ color: colores.textoSecundario, fontSize: 13 * factorActual, marginBottom: 12 }} accessibilityLiveRegion="polite">{avisoFoto}</Text> : null}

      {/* Control de tamaño de letra */}
      <Text
        style={[
          estilos.etiqueta,
          { color: colores.textoSecundario, fontSize: 15 * factorActual },
        ]}
      >
        Tamaño de letra en la app:
      </Text>
      <View style={estilos.filaBotones}>
        {['chica', 'mediana', 'grande'].map((tamanio) => (
          <TouchableOpacity
            key={tamanio}
            style={[
              estilos.opcionTamanio,
              { borderColor: colores.borde },
              tamanioLetra === tamanio && { backgroundColor: colores.botonPrimario, borderColor: colores.botonPrimario },
            ]}
            onPress={() => setTamanioLetra(tamanio)}
          >
            <Text
              style={[
                estilos.textoTamanio,
                { color: colores.textoPrincipal, fontSize: 14 * factorActual },
                tamanioLetra === tamanio && estilos.textoActivo,
              ]}
            >
              {tamanio.charAt(0).toUpperCase() + tamanio.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alternar modo claro / oscuro */}
      <View style={estilos.filaInterruptor}>
        <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>
          Modo oscuro
        </Text>
        <Switch
          value={esModoOscuro}
          onValueChange={setEsModoOscuro}
          trackColor={{ false: colores.borde, true: colores.acento }}
          thumbColor={esModoOscuro ? '#FFFFFF' : undefined}
        />
      </View>

      {/* Accesos a funciones adicionales */}
      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={() => navigation.navigate('Identidad')}
        accessibilityRole="button"
      >
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual }}>
          Registrar mi identidad (firma, rostro, huella)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={() => navigation.navigate('Bloqueo')}
        accessibilityRole="button"
      >
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual }}>
          Bloqueo con huella o PIN
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={() => navigation.navigate('Sostenibilidad')}
      >
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual }}>
          Sostenibilidad Institucional
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={() => navigation.navigate('Ayuda')}
        accessibilityRole="button"
      >
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual }}>
          Ayuda: cómo usar la app
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={cerrarSesion}
        accessibilityRole="button"
      >
        <Text style={{ color: colores.error, fontSize: 16 * factorActual }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  filaFoto: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  filaBotonesFoto: { flexDirection: 'row', gap: 16, marginTop: 6 },
  titulo: { fontWeight: 'bold', marginBottom: 20 },
  etiqueta: { marginBottom: 8 },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  opcionTamanio: { flex: 1, paddingVertical: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderRadius: 6 },
  textoTamanio: { fontWeight: '500' },
  textoActivo: { color: '#FFF' },
  filaInterruptor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  filaEnlace: { paddingVertical: 14, borderBottomWidth: 1, marginTop: 10 },
});