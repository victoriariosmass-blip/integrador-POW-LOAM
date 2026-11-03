import { API_URL } from './config';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}

// Pide la cookie CSRF a Laravel antes de login/POST/PUT/DELETE
export async function csrf() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  let res;
  try {
    if (method !== 'GET') await csrf();

    res = await fetch(`${API_URL}/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // la API no responde (apagada, sin conexión...): el detalle queda en la consola
    console.error('No se pudo conectar con la API:', e);
    const error = new Error('No se pudo conectar con el servidor. Probá de nuevo en unos minutos.');
    error.status = 0;
    throw error;
  }

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
  return data;
}