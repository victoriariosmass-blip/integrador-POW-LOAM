// Notificaciones locales de la app (no hace falta servidor de push; andan en Expo Go).
// Cada vez que se abre el inicio, se miran los convenios que el usuario puede ver y se avisa:
//   1. Vencimientos: firmados vencidos o dentro del preaviso (una vez por día cada uno).
//   2. Cambios de estado: un convenio cambió de estado desde la última vez que se miró.
//   3. Revisión asignada: al revisor le aparece un convenio nuevo en revisión.
//   4. Datos que trae la API (enunciado de LOAM, "Notificaciones vía API"): convenio nuevo registrado,
//      cambio de datos de un convenio, convenio cancelado (rescindido) y comentario nuevo
//      (este último en los convenios que esperan firma, para no pedir los comentarios de todos).
// Cada aviso lleva código, título, tipo, el estado o la fecha, y al tocarlo abre la ficha.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listarConvenios, listarComentarios, TIPOS, ESTADOS, fecha } from './convenios';

const CLAVE_VISTOS = 'avisos_estados_vistos'; // { id: estado } de la última revisión
const CLAVE_VENCIMIENTOS = 'avisos_vencimiento_dia';
const CLAVE_COMENTARIOS = 'avisos_comentarios'; // { id: cantidad de comentarios la última vez } // { id: 'AAAA-MM-DD' } último aviso de cada uno
const PREAVISO_SIN_DATO = 30; // días, si el convenio no tiene dias_preaviso (igual que la web)
const MAX_AVISOS = 5; // para no llenar la barra de notificaciones

// Con la app abierta, igual se muestra el aviso arriba
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function leer(clave) {
  try {
    return JSON.parse(await AsyncStorage.getItem(clave)) ?? {};
  } catch {
    return {};
  }
}

function diasHasta(valor) {
  const [a, m, d] = String(valor).slice(0, 10).split('-').map(Number);
  const hoy = new Date();
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) / 864e5);
}

async function avisar(convenio, titulo, detalle) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${convenio.codigo} · ${titulo}`,
      body: `${convenio.titulo} (${TIPOS[convenio.tipo] ?? convenio.tipo}). ${detalle}`,
      data: { id: convenio.id, codigo: convenio.codigo }, // para abrir la ficha al tocarla
    },
    trigger: null, // ahora
  });
}

// Pide permiso para notificar. En Android 13+ el sistema muestra el diálogo.
export async function pedirPermisoAvisos() {
  if (Platform.OS === 'android') {
    // El canal propio es opcional: en Expo Go (SDK 58) crear canales falla con un error de Android,
    // y en ese caso se usa el canal que ya trae Expo Go. Por eso el error no corta los avisos.
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Avisos de convenios',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    } catch (e) {
      console.log('[avisos] no se pudo crear el canal propio, se usa el de Expo Go');
    }
  }
  const actual = await Notifications.getPermissionsAsync();
  console.log('[avisos] permiso de notificaciones:', actual.status, '¿puede volver a preguntar?', actual.canAskAgain);
  if (actual.granted) return true; // ya estaba dado (o el Android es anterior al 13): no aparece ningún cartel
  const nuevo = await Notifications.requestPermissionsAsync();
  return nuevo.granted;
}

// Revisa y manda los avisos que correspondan.
// Devuelve { permiso: true|false, enviados: n } para que el Inicio pueda avisar si están desactivadas.
export async function revisarAvisos(usuario) {
  if (Platform.OS === 'web') return { permiso: true, enviados: 0 }; // en la web de Expo no hay notificaciones locales
  if (!(await pedirPermisoAvisos())) return { permiso: false, enviados: 0 };

  const convenios = await listarConvenios();
  const hoy = new Date().toISOString().slice(0, 10);
  const vistos = await leer(CLAVE_VISTOS);
  const primeraVez = Object.keys(vistos).length === 0; // la primera vez solo se guarda, no se avisa de cambios
  const ultimosAvisos = await leer(CLAVE_VENCIMIENTOS);
  const pendientes = [];

  for (const c of convenios) {
    // 1. Vencimientos (solo firmados)
    if (c.estado === 'firmado' && c.fecha_vencimiento && ultimosAvisos[c.id] !== hoy) {
      const dias = diasHasta(c.fecha_vencimiento);
      const preaviso = c.dias_preaviso ?? PREAVISO_SIN_DATO;
      if (dias < 0) {
        pendientes.push([c, 'Vencido', `Venció el ${fecha(c.fecha_vencimiento)} y sigue como firmado.`]);
        ultimosAvisos[c.id] = hoy;
      } else if (dias <= preaviso) {
        pendientes.push([c, 'Próximo a vencer', `Vence el ${fecha(c.fecha_vencimiento)} (en ${dias} días).`]);
        ultimosAvisos[c.id] = hoy;
      }
    }

    // 2, 3 y 4. Cambios desde la última vez (antes se guardaba solo el estado; ahora estado y versión)
    if (!primeraVez) {
      const guardado = vistos[c.id];
      const antes = typeof guardado === 'string' ? { estado: guardado } : guardado;
      if (antes === undefined) {
        if (usuario?.rol === 'revisor' && c.estado === 'revision') {
          pendientes.push([c, 'Revisión asignada', 'Se le asignó para revisar.']);
        } else {
          pendientes.push([c, 'Nuevo convenio registrado', `Estado: ${ESTADOS[c.estado] ?? c.estado}.`]);
        }
      } else if (antes.estado !== c.estado) {
        pendientes.push(c.estado === 'rescindido'
          ? [c, 'Convenio cancelado', 'Se rescindió el convenio.']
          : [c, `Pasó a ${ESTADOS[c.estado] ?? c.estado}`, `Antes estaba en ${ESTADOS[antes.estado] ?? antes.estado}.`]);
      } else if (antes.version != null && c.version != null && antes.version !== c.version) {
        pendientes.push([c, 'Cambiaron los datos', 'Se modificaron datos del convenio.']);
      }
    }
    vistos[c.id] = { estado: c.estado, version: c.version ?? null };
  }

  // Comentarios nuevos en los convenios que esperan firma (como mucho 10)
  const comentarios = await leer(CLAVE_COMENTARIOS);
  for (const c of convenios.filter((x) => x.estado === 'aprobado').slice(0, 10)) {
    try {
      const lista = await listarComentarios(c.id);
      const cantidad = (lista.data ?? lista).length;
      if (!primeraVez && comentarios[c.id] !== undefined && cantidad > comentarios[c.id]) {
        pendientes.push([c, 'Nuevo comentario', 'Hay un comentario nuevo en el convenio.']);
      }
      comentarios[c.id] = cantidad;
    } catch {
      // si falla uno, se sigue con los demás
    }
  }
  await AsyncStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(comentarios));

  for (const [c, titulo, detalle] of pendientes.slice(0, MAX_AVISOS)) {
    await avisar(c, titulo, detalle);
  }

  await AsyncStorage.setItem(CLAVE_VISTOS, JSON.stringify(vistos));
  await AsyncStorage.setItem(CLAVE_VENCIMIENTOS, JSON.stringify(ultimosAvisos));
  console.log('[avisos] convenios revisados:', convenios.length, '- avisos enviados:', Math.min(pendientes.length, MAX_AVISOS));
  return { permiso: true, enviados: Math.min(pendientes.length, MAX_AVISOS) };
}

// Al cerrar sesión: el próximo usuario arranca de cero
export async function olvidarAvisos() {
  await AsyncStorage.multiRemove([CLAVE_VISTOS, CLAVE_VENCIMIENTOS, CLAVE_COMENTARIOS]);
}