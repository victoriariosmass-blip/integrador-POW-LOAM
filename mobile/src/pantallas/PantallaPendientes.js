//pantalla para ver convenios pendientes de firma (trae los datos de la API)
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerSinConexion } from '../componentes/organismos/BannerSinConexion';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { listarPendientes, textoEstado } from '../servicios/convenios';

const CLAVE_CACHE = 'pendientes_cache';

export default function PantallaPendientes({ navigation }) {
  const { factorActual, colores } = usarPreferencias();
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const datos = await listarPendientes();
      setPendientes(datos);
      setSinConexion(false);
      await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(datos)); // para verlos sin conexión
    } catch (e) {
      if (e.status === 0) {
        // Sin conexión: se muestran los últimos pendientes guardados
        const guardados = await AsyncStorage.getItem(CLAVE_CACHE);
        setPendientes(guardados ? JSON.parse(guardados) : []);
        setSinConexion(true);
      } else {
        setError(e.message || 'No se pudieron cargar los pendientes');
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Vuelve a pedir los datos cada vez que se entra a la pestaña
  useEffect(() => navigation.addListener('focus', cargar), [navigation, cargar]);

  if (cargando) {
    return (
      <View style={[estilos.centro, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      {sinConexion && <BannerSinConexion />}

      {error ? (
        <View style={estilos.centro}>
          <Text style={{ color: colores.textoPrincipal, fontSize: 15 * factorActual, marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity onPress={cargar} style={estilos.botonReintentar}>
            <Text style={{ fontSize: 15 * factorActual }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
          ListEmptyComponent={
            <Text style={[estilos.vacio, { color: colores.textoSecundario, fontSize: 15 * factorActual }]}>
              No tenés convenios pendientes de firma.
            </Text>
          }
          renderItem={({ item }) => (
            <ElementoConvenio
              codigo={item.codigo}
              descripcion={item.titulo}
              estado={textoEstado(item)}
              alPresionar={() => navigation.navigate('DetalleConvenio', { idConvenio: item.codigo, id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, paddingTop: 28 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  lista: { paddingHorizontal: 16, paddingTop: 26, flexGrow: 1 },
  vacio: { textAlign: 'center', marginTop: 40 },
  botonReintentar: { borderWidth: 1, borderColor: '#A0AEC0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
});