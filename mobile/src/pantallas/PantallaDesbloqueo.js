// Pantalla de bloqueo: aparece al abrir la app (con sesión guardada) o al volver
// después de más de 1 minuto. Primero ofrece huella/rostro; si no, el PIN de la app.
// 5 PIN incorrectos seguidos cierran la sesión (hay que volver a entrar con la contraseña).
import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { usarSesion } from '../contexto/ContextoSesion';
import { biometriaDisponible, pedirBiometria, pinCorrecto } from '../servicios/desbloqueo';

const MAX_INTENTOS = 5;

export default function PantallaDesbloqueo() {
  const { colores, factorActual } = usarPreferencias();
  const { usuario, desbloquear, salir } = usarSesion();
  const [hayBiometria, setHayBiometria] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  const probarBiometria = async () => {
    setError('');
    if (await pedirBiometria()) desbloquear();
  };

  // Si el celular tiene huella o rostro, se pide apenas se abre la pantalla
  useEffect(() => {
    biometriaDisponible().then((si) => {
      setHayBiometria(si);
      if (si) probarBiometria();
    });
  }, []);

  const probarPin = async () => {
    if (!pin) {
      setError('Ingresá tu PIN.');
      return;
    }
    if (await pinCorrecto(pin)) {
      desbloquear();
      return;
    }
    const nuevos = intentos + 1;
    setIntentos(nuevos);
    setPin('');
    if (nuevos >= MAX_INTENTOS) {
      await salir(); // vuelve al login
      return;
    }
    setError(`PIN incorrecto. Te quedan ${MAX_INTENTOS - nuevos} intentos.`);
  };

  return (
    <KeyboardAvoidingView
      style={[estilos.contenedor, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[estilos.titulo, { color: colores.textoPrincipal, fontSize: 24 * factorActual }]}>🔒 App bloqueada</Text>
      <Text style={{ color: colores.textoSecundario, fontSize: 15 * factorActual, marginBottom: 24 }}>
        {usuario?.name}, identificate para seguir.
      </Text>

      {hayBiometria && (
        <BotonPersonalizado titulo="Usar huella o rostro" alPresionar={probarBiometria} />
      )}

      <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>PIN de la app</Text>
      <TextInput
        style={[estilos.campo, { borderColor: error ? colores.error : colores.borde, color: colores.textoPrincipal, fontSize: 20 * factorActual }]}
        value={pin}
        onChangeText={(t) => { setPin(t.replace(/\D/g, '')); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        accessibilityLabel="PIN de la app"
        onSubmitEditing={probarPin}
      />
      {error ? (
        <Text style={{ color: colores.error, fontSize: 14 * factorActual, marginBottom: 12 }} accessibilityRole="alert">{error}</Text>
      ) : null}

      <BotonPersonalizado titulo="Desbloquear" variante="secundario" alPresionar={probarPin} />
      <BotonPersonalizado titulo="Cerrar sesión" variante="secundario" alPresionar={salir} />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  titulo: { fontWeight: 'bold', marginBottom: 6 },
  etiqueta: { fontWeight: '600', marginTop: 16, marginBottom: 6 },
  campo: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, letterSpacing: 8, textAlign: 'center' },
});