//realiza el flujo entero de firma: trazo manual + biometria + ubicacion, y lo manda a la API
//(POST /api/convenios/{id}/firmar). NO es firma digital: queda registrada la imagen, fecha, hora y lugar.
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { LienzoFirma } from '../componentes/atomos/LienzoFirma';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { firmarConvenio } from '../servicios/convenios';

// Pide huella o rostro. Devuelve true si se validó, false si el celular no tiene
// biometría configurada, y tira error si la persona cancela o falla.
async function validarBiometria() {
  const tieneHardware = await LocalAuthentication.hasHardwareAsync();
  const tieneRegistrada = tieneHardware && (await LocalAuthentication.isEnrolledAsync());
  if (!tieneRegistrada) return false;

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirmá tu identidad para firmar',
    cancelLabel: 'Cancelar',
  });
  if (!resultado.success) throw new Error('No se pudo validar tu identidad. La firma no se registró.');
  return true;
}

// Ubicación actual, o null si la persona no da permiso o no se puede obtener
async function obtenerUbicacion() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const posicion = await Location.getCurrentPositionAsync({});
    return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
  } catch {
    return null;
  }
}

export default function PantallaFirmaConvenio({ route, navigation }) {
  const { id, idConvenio } = route.params || {};
  const { colores, factorActual } = usarPreferencias();
  const lienzoRef = useRef(null);
  const [trazo, setTrazo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const firmar = async () => {
    setError('');
    if (!trazo) {
      setError('Hacé tu firma con el dedo dentro del recuadro antes de confirmar.');
      return;
    }

    setEnviando(true);
    try {
      const biometriaOk = await validarBiometria();
      const ubicacion = await obtenerUbicacion();
      const png = await lienzoRef.current.obtenerPNG();

      const convenio = await firmarConvenio(id, {
        firma_imagen: `data:image/png;base64,${png}`,
        latitud: ubicacion?.latitud ?? null,
        longitud: ubicacion?.longitud ?? null,
        biometria_ok: biometriaOk,
      });

      setResultado({
        codigo: convenio.codigo,
        fechaHora: new Date().toLocaleString('es-AR'),
        ubicacion,
        biometriaOk,
      });
    } catch (e) {
      if (e.status === 403) setError('No podés firmar este convenio. Puede que ya esté firmado o no te corresponda.');
      else setError(e.message || 'No se pudo registrar la firma.');
    } finally {
      setEnviando(false);
    }
  };

  if (resultado) {
    return (
      <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor}>
        <View style={[estilos.tarjetaExito, { backgroundColor: colores.exitoFondo, borderColor: colores.exitoBorde }]}>
          <Text style={[estilos.textoExito, { color: colores.exito, fontSize: 16 * factorActual }]}>✓ Convenio firmado</Text>
          <Text style={[estilos.lineaDato, { color: colores.textoPrincipal }]}>Convenio: {resultado.codigo}</Text>
          <Text style={[estilos.lineaDato, { color: colores.textoPrincipal }]}>Fecha y hora: {resultado.fechaHora}</Text>
          <Text style={[estilos.lineaDato, { color: colores.textoPrincipal }]}>
            Ubicación: {resultado.ubicacion
              ? `${resultado.ubicacion.latitud.toFixed(5)}, ${resultado.ubicacion.longitud.toFixed(5)}`
              : 'no se pudo registrar'}
          </Text>
          <Text style={[estilos.lineaDato, { color: colores.textoPrincipal }]}>
            Identidad validada con huella o rostro: {resultado.biometriaOk ? 'sí' : 'no (el celular no la tiene configurada)'}
          </Text>
          <BotonPersonalizado titulo="VOLVER A LA FICHA" alPresionar={() => navigation.goBack()} />
        </View>
      </ScrollView>
    );
  }

  return (
    // View y no ScrollView: si no, al firmar el scroll se "come" el trazo
    <View style={[estilos.contenedor, { flex: 1, backgroundColor: colores.fondo }]}>
      <Text style={[estilos.titulo, { color: colores.textoPrincipal, fontSize: 18 * factorActual }]}>
        Firmar: {idConvenio}
      </Text>
      <Text style={[estilos.subtitulo, { color: colores.textoSecundario, fontSize: 13 * factorActual }]}>
        Firmá con el dedo dentro del recuadro:
      </Text>

      <LienzoFirma ref={lienzoRef} alCambiarTrazo={(t) => { setTrazo(t); setError(''); }} />

      <Text style={[estilos.nota, { color: colores.textoSecundario, fontSize: 12 * factorActual }]}>
        Al confirmar se registran la fecha, la hora y tu ubicación, y se pide tu huella o rostro.
      </Text>

      {error ? (
        <Text accessibilityRole="alert" style={[estilos.error, { color: colores.error, backgroundColor: colores.errorFondo }]}>
          {error}
        </Text>
      ) : null}

      {enviando ? (
        <ActivityIndicator size="large" color={colores.acento} style={{ marginVertical: 16 }} />
      ) : (
        <>
          <BotonPersonalizado titulo="CONFIRMAR CON HUELLA" alPresionar={firmar} />
          <BotonPersonalizado titulo="Borrar firma" variante="secundario" alPresionar={() => lienzoRef.current.limpiar()} />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, flexGrow: 1 },
  titulo: { fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { marginBottom: 4 },
  nota: { marginVertical: 8 },
  error: { padding: 10, borderRadius: 8, marginVertical: 8 },
  tarjetaExito: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 20 },
  textoExito: { fontWeight: 'bold', marginBottom: 12 },
  lineaDato: { fontSize: 13, marginVertical: 3 },
});