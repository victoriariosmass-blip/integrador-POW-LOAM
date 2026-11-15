// Datos del perfil que quedan guardados en el celular: foto e identidad registrada.
// Enunciado de LOAM: "mi foto de perfil, la misma debe ser mostrada en miniatura en la app" y
// "Registrar mi identidad: mi firma ... debe quedar registrada la firma como guardada en la app;
// Reconocimiento facial ...; huella digital: idem".
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_FOTO = 'perfil_foto';
const CLAVE_IDENTIDAD = 'perfil_identidad'; // { firma: { png, fecha }, rostro: { fecha }, huella: { fecha } }

async function leer(clave, porDefecto) {
  try {
    return JSON.parse(await AsyncStorage.getItem(clave)) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export const leerFoto = () => leer(CLAVE_FOTO, null);
export const guardarFoto = (uri) => AsyncStorage.setItem(CLAVE_FOTO, JSON.stringify(uri));

export const leerIdentidad = () => leer(CLAVE_IDENTIDAD, {});
export async function guardarEnIdentidad(campo, valor) {
  const actual = await leerIdentidad();
  const nueva = { ...actual, [campo]: { ...valor, fecha: new Date().toISOString() } };
  await AsyncStorage.setItem(CLAVE_IDENTIDAD, JSON.stringify(nueva));
  return nueva;
}

// Al cerrar sesión: el próximo usuario arranca sin foto ni identidad
export const olvidarPerfil = () => AsyncStorage.multiRemove([CLAVE_FOTO, CLAVE_IDENTIDAD]);