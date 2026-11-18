// Notificaciones que programa la app sola (sin servidor).
// Enunciado de LOAM (Notificación vía app):
// - "Cuando un convenio está para firmar y han pasado x cantidad de horas sin que yo lo firme,
//    la app me debe recordar que 'aún tienes un convenio por firmar'."
// - "Cuando no ingresó a la app durante x cantidad de horas, la app debe informar que 'hay novedades'."
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Las "x horas" del enunciado. Para mostrarlo en la defensa se pueden bajar (ej. 0.02 = poco más de 1 minuto).
export const HORAS_RECORDATORIO_FIRMA = 24;
export const HORAS_SIN_ENTRAR = 48;

const ID_FIRMA = 'recordatorio-firma';
const ID_NOVEDADES = 'recordatorio-novedades';

async function programar(id, contenido, horas) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: contenido,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(60, Math.round(horas * 3600)), repeats: false },
  });
}

// Se llama cada vez que se cargan los pendientes: si hay, se (re)programa el recordatorio;
// si no hay, se cancela. Si la persona firma antes, al volver a cargar se reprograma o se cancela.
export async function recordarFirma(cantidadPendientes) {
  if (Platform.OS === 'web') return;
  if (!cantidadPendientes) {
    await Notifications.cancelScheduledNotificationAsync(ID_FIRMA).catch(() => {});
    return;
  }
  await programar(ID_FIRMA, {
    title: cantidadPendientes === 1 ? 'Tiene un convenio pendiente de firma' : 'Tiene convenios pendientes de firma',
    body: cantidadPendientes === 1 ? 'Hay 1 convenio esperando su firma.' : `Hay ${cantidadPendientes} convenios esperando su firma.`,
    data: { pantalla: 'Pendientes' },
  }, HORAS_RECORDATORIO_FIRMA);
}

// Se llama cada vez que la persona entra a la app: corre la cuenta de nuevo.
// Si no vuelve a entrar en HORAS_SIN_ENTRAR, le llega "Hay novedades".
export async function avisarNovedadesSiNoEntra() {
  await programar(ID_NOVEDADES, {
    title: 'Hay novedades',
    body: 'Ingrese a la app para ver los cambios en sus convenios.',
    data: { pantalla: 'Inicio' },
  }, HORAS_SIN_ENTRAR);
}

export async function cancelarRecordatorios() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(ID_FIRMA).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(ID_NOVEDADES).catch(() => {});
}