// Bloqueo de la app: al abrirla (o al volver después de un rato) pide huella/rostro o un PIN.
// Es el segundo mecanismo de identificación, además de la contraseña de la cuenta.
// El PIN se guarda en el almacenamiento seguro del celular (Keystore / Keychain), nunca en la API.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const CLAVE_ACTIVO = 'bloqueo_activo';
const CLAVE_PIN = 'bloqueo_pin';

// En la versión web de Expo no hay SecureStore: ahí el bloqueo no se usa
const disponible = Platform.OS !== 'web';

export async function bloqueoActivo() {
  if (!disponible) return false;
  return (await SecureStore.getItemAsync(CLAVE_ACTIVO)) === '1';
}

// pin: de 4 a 6 números
export async function activarBloqueo(pin) {
  if (!/^\d{4,6}$/.test(pin)) throw new Error('El PIN tiene que tener entre 4 y 6 números.');
  await SecureStore.setItemAsync(CLAVE_PIN, pin);
  await SecureStore.setItemAsync(CLAVE_ACTIVO, '1');
}

export async function desactivarBloqueo() {
  if (!disponible) return;
  await SecureStore.deleteItemAsync(CLAVE_PIN);
  await SecureStore.deleteItemAsync(CLAVE_ACTIVO);
}

export async function pinCorrecto(pin) {
  return pin === (await SecureStore.getItemAsync(CLAVE_PIN));
}

// true si el celular tiene huella o rostro configurado
export async function biometriaDisponible() {
  if (!disponible) return false;
  return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
}

// Muestra el diálogo del sistema. Devuelve true si la persona se identificó.
export async function pedirBiometria() {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear Convenios UNLPam',
    cancelLabel: 'Usar PIN',
    disableDeviceFallback: true, // si falla, se usa el PIN de la app (no el del celular)
  });
  return resultado.success;
}