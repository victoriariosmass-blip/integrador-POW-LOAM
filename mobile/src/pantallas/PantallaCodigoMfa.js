// Segundo paso del ingreso: el código de verificación de 6 números.
// El código es simulado: la API lo escribe en storage/logs/laravel.log (con datos de prueba es 123456).
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { usarSesion } from '../contexto/ContextoSesion';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

const ESPERA_REENVIO = 30; // segundos, igual que la API

export default function PantallaCodigoMfa() {
  const { pendienteMfa, confirmarCodigo, pedirOtroCodigo, cancelarCodigo } = usarSesion();
  const { factorActual, colores } = usarPreferencias();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);

  // cuenta regresiva para poder pedir otro código
  useEffect(() => {
    if (espera <= 0) return undefined;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const verificar = async () => {
    if (!/^\d{6}$/.test(codigo)) {
      setError('El código tiene 6 números.');
      return;
    }
    setError('');
    setAviso('');
    setCargando(true);
    try {
      await confirmarCodigo(codigo);
    } catch (e) {
      setCodigo('');
      if (e.status === 401) {
        // venció (10 minutos) o 5 intentos mal: hay que volver a poner email y contraseña
        cancelarCodigo(e.message);
        return;
      }
      setError(e.message || 'No se pudo verificar el código');
    } finally {
      setCargando(false);
    }
  };

  const reenviar = async () => {
    setError('');
    try {
      await pedirOtroCodigo('mail');
      setAviso('Te mandamos un código nuevo.');
      setEspera(ESPERA_REENVIO);
    } catch (e) {
      if (e.status === 401) cancelarCodigo(e.message);
      else setError(e.message || 'No se pudo reenviar el código');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[estilos.contenedor, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[estilos.titulo, { color: colores.textoPrincipal, fontSize: 24 * factorActual }]}>
        Verificá tu identidad
      </Text>
      <Text style={[estilos.subtitulo, { color: colores.textoSecundario, fontSize: 15 * factorActual }]}>
        Te mandamos un código de 6 números a {pendienteMfa?.email}. Vence en 10 minutos.
      </Text>

      {error ? (
        <View style={[estilos.caja, { backgroundColor: colores.errorFondo, borderColor: colores.error }]} accessibilityRole="alert">
          <Text style={{ color: colores.error, fontSize: 14 * factorActual }}>{error}</Text>
        </View>
      ) : null}
      {aviso ? (
        <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual, marginBottom: 12 }} accessibilityLiveRegion="polite">
          {aviso}
        </Text>
      ) : null}

      <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>Código</Text>
      <TextInput
        style={[estilos.campo, { borderColor: error ? colores.error : colores.borde, color: colores.textoPrincipal, fontSize: 24 * factorActual }]}
        value={codigo}
        onChangeText={(t) => { setCodigo(t.replace(/\D/g, '')); setError(''); }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        accessibilityLabel="Código de verificación de 6 números"
        onSubmitEditing={verificar}
      />

      <TouchableOpacity
        style={[estilos.boton, { backgroundColor: colores.botonPrimario }, cargando && estilos.deshabilitado]}
        onPress={verificar}
        disabled={cargando}
        accessibilityRole="button"
      >
        {cargando
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={[estilos.textoBoton, { fontSize: 16 * factorActual }]}>Verificar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={reenviar} disabled={espera > 0} accessibilityRole="button" style={estilos.enlace}>
        <Text style={{ color: espera > 0 ? colores.textoSecundario : colores.acento, fontSize: 15 * factorActual, fontWeight: '600' }}>
          {espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => cancelarCodigo()} accessibilityRole="button" style={estilos.enlace}>
        <Text style={{ color: colores.acento, fontSize: 15 * factorActual }}>Volver e ingresar con otra cuenta</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  titulo: { fontWeight: 'bold', marginBottom: 6 },
  subtitulo: { marginBottom: 24 },
  etiqueta: { fontWeight: '600', marginBottom: 6 },
  campo: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, letterSpacing: 10, textAlign: 'center' },
  boton: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  deshabilitado: { opacity: 0.7 },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
  caja: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  enlace: { alignItems: 'center', paddingVertical: 12 },
});