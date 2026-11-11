// Configuración del bloqueo (se abre desde Perfil): activar con un PIN o desactivar.
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { activarBloqueo, desactivarBloqueo, bloqueoActivo, biometriaDisponible } from '../servicios/desbloqueo';

export default function PantallaBloqueo({ navigation }) {
  const { colores, factorActual } = usarPreferencias();
  const [activo, setActivo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [hayBiometria, setHayBiometria] = useState(false);
  const [pin, setPin] = useState('');
  const [repetido, setRepetido] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    bloqueoActivo().then(setActivo);
    biometriaDisponible().then(setHayBiometria);
  }, []);

  const cambiarInterruptor = async (valor) => {
    if (valor) {
      setMostrarForm(true); // para activarlo primero hay que elegir el PIN
      return;
    }
    await desactivarBloqueo();
    setActivo(false);
    setMostrarForm(false);
  };

  const guardar = async () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setError('El PIN tiene que tener entre 4 y 6 números.');
      return;
    }
    if (pin !== repetido) {
      setError('Los dos PIN no coinciden.');
      return;
    }
    await activarBloqueo(pin);
    setActivo(true);
    setMostrarForm(false);
    setPin('');
    setRepetido('');
    Alert.alert('Bloqueo activado', 'La próxima vez que abras la app te va a pedir huella, rostro o el PIN.', [
      { text: 'Aceptar', onPress: () => navigation.goBack() },
    ]);
  };

  const estiloCampo = [estilos.campo, { borderColor: colores.borde, color: colores.textoPrincipal, fontSize: 18 * factorActual }];

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <View style={estilos.fila}>
        <Text style={{ color: colores.textoPrincipal, fontSize: 16 * factorActual, flex: 1 }}>
          Pedir huella, rostro o PIN al abrir la app
        </Text>
        <Switch
          value={activo || mostrarForm}
          onValueChange={cambiarInterruptor}
          trackColor={{ false: colores.borde, true: colores.acento }}
          accessibilityLabel="Bloqueo de la app"
        />
      </View>
      <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual, marginBottom: 20 }}>
        {hayBiometria
          ? 'Se usa la huella o el rostro del celular; el PIN sirve si no se reconoce.'
          : 'Este celular no tiene huella ni rostro configurado: se va a pedir el PIN.'}
        {' '}También se bloquea si la app queda más de 1 minuto en segundo plano.
      </Text>

      {mostrarForm && (
        <>
          <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>Nuevo PIN (4 a 6 números)</Text>
          <TextInput style={estiloCampo} value={pin} onChangeText={(t) => { setPin(t.replace(/\D/g, '')); setError(''); }}
            keyboardType="number-pad" secureTextEntry maxLength={6} accessibilityLabel="Nuevo PIN" />
          <Text style={[estilos.etiqueta, { color: colores.textoPrincipal, fontSize: 15 * factorActual }]}>Repetí el PIN</Text>
          <TextInput style={estiloCampo} value={repetido} onChangeText={(t) => { setRepetido(t.replace(/\D/g, '')); setError(''); }}
            keyboardType="number-pad" secureTextEntry maxLength={6} accessibilityLabel="Repetir PIN" />
          {error ? <Text style={{ color: colores.error, fontSize: 14 * factorActual, marginBottom: 8 }} accessibilityRole="alert">{error}</Text> : null}
          <BotonPersonalizado titulo="Guardar PIN y activar" alPresionar={guardar} />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 20 },
  fila: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  etiqueta: { fontWeight: '600', marginBottom: 6 },
  campo: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, letterSpacing: 6 },
});