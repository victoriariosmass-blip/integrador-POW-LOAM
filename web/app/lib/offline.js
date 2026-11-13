// Persistencia local para trabajar sin conexión (IndexedDB del navegador).
// - "respuestas": la última respuesta de cada consulta GET a la API (listado, fichas, panel...).
//   Si la API no responde, se muestra lo último guardado, avisando de qué fecha es.
// - "pendientes": comentarios escritos sin conexión, que se mandan solos cuando vuelve.
// Todo se borra al cerrar sesión (privacidad: no quedan datos en una compu compartida).
// Los cambios del convenio (editar, aprobar, firmar...) NO se guardan sin conexión: necesitan
// la versión actual del servidor para no pisar cambios de otra persona (control de versión, 409).
 
const BASE = 'convenios-unlpam';
const RESPUESTAS = 'respuestas';
const PENDIENTES = 'pendientes';
 
function abrir() {
  return new Promise((resolver, rechazar) => {
    if (typeof indexedDB === 'undefined') return rechazar(new Error('Sin IndexedDB'));
    const pedido = indexedDB.open(BASE, 1);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      if (!db.objectStoreNames.contains(RESPUESTAS)) db.createObjectStore(RESPUESTAS); // clave = ruta
      if (!db.objectStoreNames.contains(PENDIENTES)) db.createObjectStore(PENDIENTES, { keyPath: 'id', autoIncrement: true });
    };
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  });
}
 
// Hace una operación sobre un almacén y devuelve su resultado
async function usar(almacen, modo, operacion) {
  const db = await abrir();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction(almacen, modo);
    const pedido = operacion(tx.objectStore(almacen));
    tx.oncomplete = () => { db.close(); resolver(pedido?.result); };
    tx.onerror = () => { db.close(); rechazar(tx.error); };
  });
}
 
// Avisa a la pantalla (AvisoConexion) que algo cambió
function avisar(nombre, detalle) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}
 
// ---- respuestas guardadas ----

// true mientras se están mostrando datos guardados porque la API no respondía
let usandoGuardados = false;

// La API volvió a responder: se avisa una sola vez para sacar el cartel de "sin conexión"
// (hace falta porque si se cayó solo el servidor, el navegador no dispara el evento "online")
export function marcarConConexion() {
  if (!usandoGuardados) return;
  usandoGuardados = false;
  avisar('convenios:con-conexion');
}
 
export async function guardarRespuesta(ruta, datos) {
  try {
    await usar(RESPUESTAS, 'readwrite', (s) => s.put({ datos, guardado: new Date().toISOString() }, ruta));
  } catch { /* si el navegador no deja guardar, la web sigue andando igual */ }
}
 
// Devuelve los datos guardados de esa ruta (o null) y avisa que se está sin conexión
export async function leerRespuesta(ruta) {
  try {
    const guardada = await usar(RESPUESTAS, 'readonly', (s) => s.get(ruta));
    if (!guardada) return null;
    usandoGuardados = true;
    avisar('convenios:sin-conexion', { guardado: guardada.guardado });
    return guardada.datos;
  } catch {
    return null;
  }
}
 
// ---- comentarios pendientes ----
 
export async function guardarPendiente(pendiente) {
  await usar(PENDIENTES, 'readwrite', (s) => s.add({ ...pendiente, creado: new Date().toISOString() }));
  avisar('convenios:pendientes');
}
 
export async function listarPendientes() {
  try {
    return (await usar(PENDIENTES, 'readonly', (s) => s.getAll())) ?? [];
  } catch {
    return [];
  }
}
 
export async function borrarPendiente(id) {
  await usar(PENDIENTES, 'readwrite', (s) => s.delete(id));
}
 
// Manda los pendientes en orden. enviar(pendiente) hace el POST a la API.
// - Si se manda bien, se borra.
// - Si la API lo rechaza (403, 404, 422...), se borra y se informa el motivo (no tiene sentido reintentar).
// - Si sigue sin conexión, se corta y queda para la próxima.
let sincronizando = false;
export async function sincronizarPendientes(enviar) {
  if (sincronizando) return null;
  sincronizando = true;
  const resultado = { enviados: 0, rechazados: [] };
  try {
    for (const p of await listarPendientes()) {
      try {
        await enviar(p);
        await borrarPendiente(p.id);
        resultado.enviados++;
      } catch (e) {
        if (e.status === 0) break; // sigue sin conexión
        await borrarPendiente(p.id);
        resultado.rechazados.push({ ...p, motivo: e.message });
      }
    }
  } finally {
    sincronizando = false;
  }
  if (resultado.enviados || resultado.rechazados.length) avisar('convenios:sincronizado', resultado);
  return resultado;
}
 
// Al cerrar sesión: no quedan datos de convenios en el navegador
export async function borrarDatosLocales() {
  try {
    await usar(RESPUESTAS, 'readwrite', (s) => s.clear());
    await usar(PENDIENTES, 'readwrite', (s) => s.clear());
  } catch { /* nada guardado */ }
}