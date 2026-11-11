// Reconoce en qué sede de la UNLPam está el usuario (opcional, con su permiso).
// - Pide la ubicación UNA sola vez, cuando la persona toca "Detectar mi sede": no hay seguimiento continuo.
// - Si no da permiso o no está cerca de ninguna sede, puede elegirla a mano.
// - La sede elegida queda guardada en el celular para mostrar el acceso rápido.
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { USAR_MOCK } from './config';

const CLAVE_SEDE = 'sede_elegida';

// Coordenadas aproximadas de las sedes (las mismas que el seeder de unidades)
const UNIDADES_MOCK = [
  { id: 7, nombre: 'Facultad de Ingeniería', sigla: 'FI', latitud: -35.6633, longitud: -63.7564, radio_metros: 200 },
  { id: 4, nombre: 'Facultad de Ciencias Exactas y Naturales', sigla: 'FCEyN', latitud: -36.5495, longitud: -64.2975, radio_metros: 200 },
  { id: 1, nombre: 'Rectorado', sigla: 'RECT', latitud: -36.6167, longitud: -64.2869, radio_metros: 200 },
];

// GET /api/unidades (trae nombre, sigla, latitud, longitud y radio_metros)
export async function listarUnidades() {
  if (USAR_MOCK) return UNIDADES_MOCK;
  const respuesta = await api('/unidades');
  return respuesta.data;
}

// Distancia en metros entre dos puntos (fórmula de Haversine)
export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Espera una promesa como mucho "ms" milisegundos (si no, devuelve null)
const conTiempoLimite = (promesa, ms) =>
  Promise.race([promesa, new Promise((resolver) => setTimeout(() => resolver(null), ms))]);

// Devuelve { motivo, sede }:
//   motivo 'sin_permiso'  -> no dio permiso (o lo negó antes y Android ya no pregunta)
//   motivo 'gps_apagado'  -> la ubicación del celular está desactivada
//   motivo 'sin_senal'    -> no se pudo leer la ubicación a tiempo
//   motivo 'ok'           -> se leyó; sede = la más cercana dentro de su radio, o null
export async function detectarSede() {
  // Si el permiso ya estaba dado (por ejemplo a Expo Go en otro proyecto), Android NO vuelve a preguntar
  const permiso = await Location.requestForegroundPermissionsAsync();
  console.log('[sede] permiso de ubicación:', permiso.status, '¿puede volver a preguntar?', permiso.canAskAgain);
  if (permiso.status !== 'granted') return { motivo: 'sin_permiso', sede: null };

  if (!(await Location.hasServicesEnabledAsync())) return { motivo: 'gps_apagado', sede: null };

  // Una sola lectura: primero la última conocida (instantánea, si tiene menos de 5 min);
  // si no hay, una nueva con 15 segundos de límite (adentro de un edificio puede tardar o no llegar)
  const posicion = (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 }))
    ?? (await conTiempoLimite(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 15000));
  if (!posicion) return { motivo: 'sin_senal', sede: null };
  const { coords } = posicion;
  console.log('[sede] ubicación:', coords.latitude, coords.longitude);
  const unidades = await listarUnidades();

  const cercanas = unidades
    .filter((u) => u.latitud !== null && u.longitud !== null)
    .map((u) => ({ ...u, distancia: distanciaMetros(coords.latitude, coords.longitude, Number(u.latitud), Number(u.longitud)) }))
    .filter((u) => u.distancia <= (u.radio_metros ?? 200))
    .sort((a, b) => a.distancia - b.distancia);

  return { motivo: 'ok', sede: cercanas[0] ?? null };
}

export async function guardarSede(unidad) {
  await AsyncStorage.setItem(CLAVE_SEDE, JSON.stringify({ id: unidad.id, nombre: unidad.nombre, sigla: unidad.sigla }));
}

export async function leerSede() {
  try {
    return JSON.parse(await AsyncStorage.getItem(CLAVE_SEDE));
  } catch {
    return null;
  }
}

export async function olvidarSede() {
  await AsyncStorage.removeItem(CLAVE_SEDE);
}