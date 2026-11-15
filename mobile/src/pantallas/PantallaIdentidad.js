// Registrar mi identidad: firma a mano guardada, reconocimiento facial y huella.
// Enunciado de LOAM: "mi firma, debe quedar registrada ... se debe dar en un cuadro y luego debe
// quedar registrada la firma como guardada en la app; Reconocimiento facial, al igual que mi firma
// debe quedar reconocida mi identidad; huella digital: idem a reconocimiento facial".
// Sin conexión no se puede registrar (enunciado: "registro de identidad" debe indicar que está offline).
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LienzoFirma } from '../componentes/atomos/LienzoFirma';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { BannerSinConexion } from '../componentes/organismos/BannerSinConexion';
import { AyudaPuntual } from '../componentes/moleculas/AyudaPuntual';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { usarConexion } from '../contexto/ContextoConexion';
import { leerIdentidad, guardarEnIdentidad } from '../servicios/perfil';

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export default function PantallaIdentidad() {
  const { colores, factorActual } = usarPreferencias();
  const { enLinea } = usarConexion();
  const [identidad, setIdentidad] = useState({});
  const [tipos, setTipos] = useState([]); // lo que soporta el celular
  const [trazo, setTrazo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [dibujando, setDibujando] = useState(false); // mientras se firma, la pantalla no se desplaza
  const lienzo = useRef(null);

  useEffect(() => {
    leerIdentidad().then(setIdentidad);
    LocalAuthentication.supportedAuthenticationTypesAsync().then(setTipos).catch(() => setTipos([]));
  }, []);

  const texto = (t, extra = {}) => ({ color: colores.textoPrincipal, fontSize: t * factorActual, ...extra });
  const secundario = (t) => ({ color: colores.textoSecundario, fontSize: t * factorActual });
  const tarjeta = [estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }];
  const listo = (campo) => identidad[campo] && (
    <Text style={{ color: colores.exito, fontWeight: '700', fontSize: 13 * factorActual, marginBottom: 6 }}>
      ✓ Registrada el {fechaHora(identidad[campo].fecha)}
    </Text>
  );

  const guardarFirma = async () => {
    const png = await lienzo.current.obtenerPNG();
    setIdentidad(await guardarEnIdentidad('firma', { png: `data:image/png;base64,${png}` }));
    lienzo.current.limpiar();
    setTrazo(false);
    setMensaje('Tu firma quedó registrada en la app.');
  };

  // Rostro o huella: el celular verifica a la persona y la app registra que quedó reconocida
  const registrarBiometria = async (campo, tipo, nombre) => {
    setMensaje('');
    const inscripto = await LocalAuthentication.isEnrolledAsync();
    if (!tipos.includes(tipo) || !inscripto) {
      setMensaje(`Este celular no tiene ${nombre} configurado. Configuralo en los ajustes del teléfono y volvé a intentar.`);
      return;
    }
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: `Registrá tu ${nombre}`, cancelLabel: 'Cancelar' });
    if (!r.success) {
      setMensaje(`No se pudo verificar tu ${nombre}.`);
      return;
    }
    setIdentidad(await guardarEnIdentidad(campo, { metodo: nombre }));
    setMensaje(`Tu ${nombre} quedó registrado.`);
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor} scrollEnabled={!dibujando}>
      {!enLinea && <BannerSinConexion mensaje="Sin conexión • El registro de identidad no está disponible" />}
      <AyudaPuntual texto="Registrá tu firma, tu rostro y tu huella una sola vez. Después, al firmar un convenio, la app te pide la huella o el rostro y la firma a mano. Ver el manual en Perfil > Ayuda." />

      <View style={tarjeta}>
        <Text style={texto(16, { fontWeight: '700', marginBottom: 4 })}>Mi firma</Text>
        {listo('firma')}
        {identidad.firma?.png && (
          <Image source={{ uri: identidad.firma.png }} style={[estilos.firmaGuardada, { borderColor: colores.borde }]} resizeMode="contain"
            accessibilityLabel="Tu firma registrada" />
        )}
        <Text style={secundario(13)}>{identidad.firma ? 'Para cambiarla, firmá de nuevo en el cuadro:' : 'Firmá dentro del cuadro:'}</Text>
        <View onTouchStart={() => setDibujando(true)} onTouchEnd={() => setDibujando(false)} onTouchCancel={() => setDibujando(false)}>
          <LienzoFirma ref={lienzo} alCambiarTrazo={setTrazo} />
        </View>
        <BotonPersonalizado titulo="Guardar mi firma" alPresionar={guardarFirma} deshabilitado={!trazo || !enLinea} />
        <BotonPersonalizado titulo="Borrar" variante="secundario" alPresionar={() => { lienzo.current.limpiar(); setTrazo(false); }} />
      </View>

      <View style={tarjeta}>
        <Text style={texto(16, { fontWeight: '700', marginBottom: 4 })}>Reconocimiento facial</Text>
        {listo('rostro')}
        <BotonPersonalizado titulo={identidad.rostro ? 'Volver a registrar mi rostro' : 'Registrar mi rostro'} variante="secundario" deshabilitado={!enLinea}
          alPresionar={() => registrarBiometria('rostro', LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION, 'rostro')} />
      </View>

      <View style={tarjeta}>
        <Text style={texto(16, { fontWeight: '700', marginBottom: 4 })}>Huella digital</Text>
        {listo('huella')}
        <BotonPersonalizado titulo={identidad.huella ? 'Volver a registrar mi huella' : 'Registrar mi huella'} variante="secundario" deshabilitado={!enLinea}
          alPresionar={() => registrarBiometria('huella', LocalAuthentication.AuthenticationType.FINGERPRINT, 'huella')} />
      </View>

      {mensaje ? <Text style={[secundario(14), { textAlign: 'center' }]} accessibilityLiveRegion="polite">{mensaje}</Text> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 32 },
  tarjeta: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  firmaGuardada: { height: 90, borderWidth: 1, borderRadius: 12, marginBottom: 8, backgroundColor: '#FFFFFF' },
});