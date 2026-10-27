import { api } from './api';
import { USAR_MOCK } from './config';
import { usuarioActual } from './auth';
import { listarMock, verMock, accionMock } from './mockConvenios';
 
function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms)); // simula la demora del servidor
}
 
// GET /api/convenios?estado=&tipo=&q=&page=
export async function listarConvenios(filtros = {}) {
  if (USAR_MOCK) {
    await esperar(400);
    return listarMock(await usuarioActual(), filtros);
  }
 
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  return api(`/convenios?${params}`);
}
 
// GET /api/convenios/{id}
export async function verConvenio(id) {
  if (USAR_MOCK) {
    await esperar(300);
    return verMock(await usuarioActual(), id);
  }
 
  return api(`/convenios/${id}`);
}
 
// POST /api/convenios/{id}/{accion}
// accion: 'enviar-revision', 'aprobar', 'devolver', 'rescindir' o 'archivar'
export async function accionConvenio(id, accion, datos = {}) {
  if (USAR_MOCK) {
    await esperar(400);
    return accionMock(await usuarioActual(), id, accion, datos);
  }
 
  return api(`/convenios/${id}/${accion}`, { method: 'POST', body: datos });
}