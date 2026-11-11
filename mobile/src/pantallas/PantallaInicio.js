//pantalla principal: metricas y 10 ultimos movimientos (trae los datos de la API)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { TarjetaMetrica } from '../componentes/moleculas/TarjetaMetrica';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';
import { TarjetaSede } from '../componentes/organismos/TarjetaSede';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { usarSesion } from '../contexto/ContextoSesion';
import { obtenerResumen, textoEstado } from '../servicios/convenios';
import { revisarAvisos } from '../servicios/avisos';

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

  // Avisos de vencimientos y cambios de estado: una vez cada vez que se abre la app
  const avisosRevisados = useRef(false);
  const [avisosApagados, setAvisosApagados] = useState(false);
  useEffect(() => {
    if (avisosRevisados.current || !usuario) return;
    avisosRevisados.current = true;
    revisarAvisos(usuario)
      .then((r) => setAvisosApagados(!r.permiso))
      .catch((e) => console.warn('[avisos] no se pudieron revisar:', e)); // se intenta la próxima vez
  }, [usuario]);
  useEffect(() => navigation.addListener('focus', cargar), [navigation, cargar]);

  const nombre = usuario?.name?.split(' ')[0] ?? '';

  return (
    <ScrollView
      style={[estilos.contenedor, { backgroundColor: colores.fondo }]}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => { setRefrescando(true); cargar(); }}
          tintColor={colores.acento}
          colors={[colores.acento]}
        />
      }
    >
      <Text style={[estilos.saludo, { color: colores.textoPrincipal, fontSize: 24 * factorActual }]}>Hola, {nombre}</Text>
      <BotonPersonalizado titulo="Escanear QR de un convenio" variante="secundario" alPresionar={() => navigation.navigate('Escanear')} />
      {avisosApagados ? (
        <TouchableOpacity onPress={() => Linking.openSettings()} accessibilityRole="button"
          style={{ borderWidth: 1, borderColor: colores.borde, borderRadius: 10, padding: 12, marginVertical: 8 }}>
          <Text style={{ color: colores.textoPrincipal, fontSize: 14 * factorActual }}>
            Las notificaciones están desactivadas, así que no te van a llegar los avisos de vencimientos.{' '}
            <Text style={{ color: colores.acento, fontWeight: '600' }}>Activarlas</Text>
          </Text>
        </TouchableOpacity>
      ) : null}
      <TarjetaSede alVerConvenios={(unidad) => navigation.navigate('ConveniosUnidad', { unidad })} />
      {error ? (
        <Text style={{ color: colores.error, fontSize: 15 * factorActual, marginBottom: 12 }}>{error}</Text>
      ) : null}

      {!resumen && !error ? <ActivityIndicator size="large" color={colores.acento} style={{ marginTop: 24 }} /> : null}

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