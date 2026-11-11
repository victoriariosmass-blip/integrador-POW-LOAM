
// Vista pública del sitio: no hace falta iniciar sesión.
// Solo convenios firmados y no confidenciales (lo filtra la API).
import { api } from './api';
import { USAR_MOCK } from './config';
import { publicosMock, publicoMock } from './mockConvenios';
 
function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
 
// GET /api/publico/convenios?q=&tipo=&page=
export async function listarPublicos(filtros = {}) {
  if (USAR_MOCK) {
    await esperar(300);
    return publicosMock(filtros);
  }
 
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  return api(`/publico/convenios?${params}`);
}
 
// GET /api/publico/convenios/{ref} -> ref es el código público (el del QR)
export async function verPublico(ref) {
  if (USAR_MOCK) {
    await esperar(300);
    return publicoMock(ref);
  }
 
  return api(`/publico/convenios/${ref}`);
}