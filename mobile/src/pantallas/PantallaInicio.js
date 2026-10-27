//pantalla principal: metricas y 10 ultimos movimientos (trae los datos de la API)
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { TarjetaMetrica } from '../componentes/moleculas/TarjetaMetrica';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { usarSesion } from '../contexto/ContextoSesion';
import { obtenerResumen, textoEstado } from '../servicios/convenios';

export default function PantallaInicio({ navigation }) {
  const { factorActual, colores } = usarPreferencias();
  const { usuario } = usarSesion();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try {
      setResumen(await obtenerResumen());
    } catch (e) {
      setError(e.message || 'No se pudo cargar el inicio');
    } finally {
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => navigation.addListener('focus', cargar), [navigation, cargar]);

  const nombre = usuario?.name?.split(' ')[0] ?? '';

  return (
    <ScrollView
      style={[estilos.contenedor, { backgroundColor: colores.fondo }]}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
    >
      <Text style={[estilos.saludo, { color: colores.textoPrincipal, fontSize: 24 * factorActual }]}>Hola, {nombre}</Text>

      {error ? (
        <Text style={{ color: '#B71C1C', fontSize: 15 * factorActual, marginBottom: 12 }}>{error}</Text>
      ) : null}

      {!resumen && !error ? <ActivityIndicator size="large" style={{ marginTop: 24 }} /> : null}

      {resumen ? (
        <>
          <View style={estilos.grillaMetricas}>
            <TarjetaMetrica titulo="Firmados (último año)" valor={String(resumen.firmados_ultimo_anio)} />
            <TarjetaMetrica titulo="Vigentes" valor={String(resumen.vigentes)} />
            <TarjetaMetrica titulo="En trámite" valor={String(resumen.en_tramite)} />
            <TarjetaMetrica titulo="Por firmar" valor={String(resumen.por_firmar)} />
          </View>

          <View style={estilos.cabeceraSeccion}>
            <Text style={[estilos.tituloSeccion, { color: colores.textoPrincipal, fontSize: 17 * factorActual }]}>
              Últimos 10 movimientos
            </Text>
          </View>

          {resumen.ultimos_movimientos.map((mov) => (
            <ElementoConvenio
              key={mov.id}
              codigo={mov.convenio.codigo}
              descripcion={`${mov.convenio.titulo} · ${mov.usuario?.name ?? ''}`}
              estado={textoEstado(mov.convenio)}
              alPresionar={() => navigation.navigate('DetalleConvenio', { idConvenio: mov.convenio.codigo, id: mov.convenio.id })}
            />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, paddingHorizontal: 16, paddingTop: 36 },
  saludo: { fontWeight: 'bold', marginBottom: 16 },
  grillaMetricas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cabeceraSeccion: { marginVertical: 14 },
  tituloSeccion: { fontWeight: 'bold' },
});