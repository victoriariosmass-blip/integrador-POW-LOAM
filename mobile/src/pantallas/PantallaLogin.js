//pantalla de inicio de sesion con email y contraseña (pide el token a la API)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { usarSesion } from '../contexto/ContextoSesion';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

export default function PantallaLogin() {
  const { entrar } = usarSesion();
  const { factorActual, colores } = usarPreferencias();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    if (!email.trim() || !password) {
      setError('Completá el email y la contraseña');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await entrar(email, password);
    } catch (e) {
      setError(e.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[estilos.contenedor, { backgroundColor: colores.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[estilos.titulo, { color: colores.textoPrincipal, fontSize: 26 * factorActual }]}>
        Gestión de Convenios
      </Text>
      <Text style={[estilos.subtitulo, { color: colores.textoSecundario, fontSize: 15 * factorActual }]}>
        Ingresá con tu cuenta institucional.
      </Text>

      {error ? (
        <View style={[estilos.error, { backgroundColor: colores.errorFondo, borderColor: colores.error }]} accessibilityRole="alert">
          <Text style={[estilos.textoError, { color: colores.error, fontSize: 14 * factorActual }]}>{error}</Text>
        </View>
      ) : null}

      <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>Email</Text>
      <TextInput
        style={[estilos.campo, { borderColor: colores.borde, color: colores.textoPrincipal, fontSize: 16 * factorActual }]}
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@convenios.test"
        placeholderTextColor={colores.textoSecundario}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        accessibilityLabel="Email"
      />

      <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>Contraseña</Text>
      <TextInput
        style={[estilos.campo, { borderColor: colores.borde, color: colores.textoPrincipal, fontSize: 16 * factorActual }]}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={colores.textoSecundario}
        secureTextEntry
        autoComplete="password"
        accessibilityLabel="Contraseña"
        onSubmitEditing={ingresar}
      />

      <TouchableOpacity
        style={[estilos.boton, { backgroundColor: colores.botonPrimario }, cargando && estilos.botonDeshabilitado]}
        onPress={ingresar}
        disabled={cargando}
        accessibilityRole="button"
      >
        {cargando
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={[estilos.textoBoton, { fontSize: 16 * factorActual }]}>Ingresar</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  titulo: { fontWeight: 'bold', marginBottom: 6 },
  subtitulo: { marginBottom: 24 },
  etiqueta: { fontWeight: '600', marginBottom: 6 },
  campo: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  boton: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { opacity: 0.7 },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
  error: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
});