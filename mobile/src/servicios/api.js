// Hace los pedidos a la API con el token del usuario (Authorization: Bearer ...)
import { API_URL } from './config';
import { leerToken } from './almacenamiento';

export async function api(ruta, { method = 'GET', body } = {}) {
  const token = await leerToken();

  let res;
  try {
    res = await fetch(`${API_URL}/api${ruta}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error('No se pudo conectar con el servidor. Revisá tu conexión.');
    error.status = 0; // 0 = sin conexión
    throw error;
  }

  const datos = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(datos?.message ?? `Error ${res.status}`);
    error.status = res.status; // 401, 403, 404, 422...
    error.errores = datos?.errors;
    throw error;
  }
  return datos;
}
