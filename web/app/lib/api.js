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
  if (method !== 'GET') await csrf();

  const res = await fetch(`${API_URL}/api${path}`, {
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

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `Error ${res.status}`);
    error.status = res.status;   // 401, 403, 404, 409, 422...
    error.errors = data?.errors; // errores de validación por campo
    throw error;
  }
  return data;
}