import { API_URL } from './config';
import { guardarRespuesta, leerRespuesta, marcarConConexion } from './offline';

 
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}
 
// Pide la cookie CSRF a Laravel antes de login/POST/PUT/DELETE
export async function csrf() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}
 
// body: un objeto (va como JSON) o un FormData (para subir archivos)
// comoArchivo: true devuelve el archivo (Blob) en lugar de JSON, para descargar PDF
export async function api(path, { method = 'GET', body, headers = {}, comoArchivo = false } = {}) {
  const esFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res;
  try {
    if (method !== 'GET') await csrf();
 
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        // con FormData el navegador pone solo el Content-Type (multipart con su separador)
        ...(body && !esFormData ? { 'Content-Type': 'application/json' } : {}),
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '',
        ...headers,
      },
      body: esFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // Sin conexión: si es una consulta (GET) y hay una copia guardada, se usa esa
    if (method === 'GET' && !comoArchivo) {
      const guardada = await leerRespuesta(path);
      if (guardada !== null) return guardada;
    }
    // la API no responde (apagada, sin conexión...): el detalle queda en la consola
    console.error('No se pudo conectar con la API:', e);
    const error = new Error('No se pudo conectar con el servidor. Probá de nuevo en unos minutos.');
    error.status = 0;
    throw error;
  }
 
  marcarConConexion(); // la API respondió: si estaba el cartel de "sin conexión", se saca
  if (res.ok && comoArchivo) return res.blob();
 
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // errores del servidor (500...): al usuario un mensaje común, el detalle a la consola
    if (res.status >= 500) console.error(`Error ${res.status} en ${path}:`, data?.message ?? data);
    const mensaje = res.status >= 500
      ? 'Hubo un problema en el servidor. Probá de nuevo en unos minutos.'
      : (data?.message ?? `Error ${res.status}`);
    const error = new Error(mensaje);
    error.status = res.status;   // 0, 401, 403, 404, 409, 422, 500...
    error.errors = data?.errors; // errores de validación por campo
    throw error;
  }
  if (method === 'GET' && !comoArchivo) guardarRespuesta(path, data); // copia para usar sin conexión
  return data;
}