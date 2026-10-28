//pantalla de perfil (tipografias y tema oscuro/claro)
import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
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
  } = usarPreferencias();

  const { usuario, salir } = usarSesion();

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <Text
        style={[
          estilos.titulo,
          { color: colores.textoPrincipal, fontSize: 24 * factorActual },
        ]}
      >
        Mi Perfil
      </Text>
      
      <Text style={{ color: colores.textoSecundario, fontSize: 15 * factorActual, marginBottom: 16 }}>
        {usuario?.name} · {usuario?.email}
      </Text>

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
              tamanioLetra === tamanio && { backgroundColor: colores.acento, borderColor: colores.acento },
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
          trackColor={{ false: '#CBD5E0', true: colores.acento }}
          thumbColor={esModoOscuro ? '#FFFFFF' : undefined}
        />
      </View>

      {/* Accesos a funciones adicionales */}
      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={() => navigation.navigate('Sostenibilidad')}
      >
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual }}>
          🌱 Sostenibilidad Institucional
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.filaEnlace, { borderBottomColor: colores.borde }]}
        onPress={salir}
        accessibilityRole="button"
      >
        <Text style={{ color: colores.error, fontSize: 16 * factorActual }}>Cerrar sesión</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  titulo: { fontWeight: 'bold', marginBottom: 20 },
  etiqueta: { marginBottom: 8 },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  opcionTamanio: { flex: 1, paddingVertical: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderRadius: 6 },
  textoTamanio: { fontWeight: '500' },
  textoActivo: { color: '#FFF' },
  filaInterruptor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  filaEnlace: { paddingVertical: 14, borderBottomWidth: 1, marginTop: 10 },
});