// Guarda el token de forma segura (Keychain en iOS, Keystore en Android).
// En la versión web de Expo no existe SecureStore, así que ahí usa localStorage.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CLAVE_TOKEN = 'token_api';

export async function guardarToken(token) {
  if (Platform.OS === 'web') return localStorage.setItem(CLAVE_TOKEN, token);
  return SecureStore.setItemAsync(CLAVE_TOKEN, token);
}

export async function leerToken() {
  if (Platform.OS === 'web') return localStorage.getItem(CLAVE_TOKEN);
  return SecureStore.getItemAsync(CLAVE_TOKEN);
}

export async function borrarToken() {
  if (Platform.OS === 'web') return localStorage.removeItem(CLAVE_TOKEN);
  return SecureStore.deleteItemAsync(CLAVE_TOKEN);
}
