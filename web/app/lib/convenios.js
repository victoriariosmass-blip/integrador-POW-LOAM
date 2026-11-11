import { api } from './api';
import { USAR_MOCK } from './config';
import { usuarioActual } from './auth';
import {
  listarMock, verMock, accionMock, crearMock, editarMock, resumenMock, unidadesMock,
  comentariosMock, comentarMock, subirDocumentoMock, descargarDocumentoMock,
} from './mockConvenios';

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


// POST /api/convenios -> crea el convenio en borrador
export async function crearConvenio(datos) {
  if (USAR_MOCK) {
    await esperar(400);
    return crearMock(await usuarioActual(), datos);
  }
 
  return api('/convenios', { method: 'POST', body: datos });
}
 
// PUT /api/convenios/{id} -> datos tiene que incluir "version"
export async function editarConvenio(id, datos) {
  if (USAR_MOCK) {
    await esperar(400);
    return editarMock(await usuarioActual(), id, datos);
  }
 
  return api(`/convenios/${id}`, { method: 'PUT', body: datos });
}
 
// GET /api/resumen -> métricas y últimos movimientos para el panel
export async function obtenerResumen() {
  if (USAR_MOCK) {
    await esperar(300);
    return resumenMock(await usuarioActual());
  }
 
  return api('/resumen');
}
 
// GET /api/unidades -> para elegir la unidad en el alta (usuarios globales)
export async function listarUnidades() {
  if (USAR_MOCK) return unidadesMock();
 
  return api('/unidades');
}


// ---- Comentarios ----
 
// GET /api/convenios/{id}/comentarios
export async function listarComentarios(id) {
  if (USAR_MOCK) {
    await esperar(300);
    return comentariosMock(await usuarioActual(), id);
  }
 
  return api(`/convenios/${id}/comentarios`);
}
 
// POST /api/convenios/{id}/comentarios -> si es ofensivo vuelve como "Comentario ofensivo"
export async function comentar(id, contenido) {
  if (USAR_MOCK) {
    await esperar(400);
    return comentarMock(await usuarioActual(), id, contenido);
  }
 
  return api(`/convenios/${id}/comentarios`, { method: 'POST', body: { contenido } });
}
 
// ---- Documentos (PDF) ----
 
// POST /api/convenios/{id}/documentos (multipart: archivo + categoria)
export async function subirDocumento(id, archivo, categoria) {
  if (USAR_MOCK) {
    await esperar(600);
    return subirDocumentoMock(await usuarioActual(), id, archivo, categoria);
  }
 
  const datos = new FormData();
  datos.append('archivo', archivo);
  datos.append('categoria', categoria);
  return api(`/convenios/${id}/documentos`, { method: 'POST', body: datos });
}
 
// GET /api/convenios/{id}/documentos/{documento} -> devuelve el PDF (Blob)
export async function descargarDocumento(id, documentoId) {
  if (USAR_MOCK) {
    await esperar(300);
    return descargarDocumentoMock(id, documentoId);
  }
 
  return api(`/convenios/${id}/documentos/${documentoId}`, { comoArchivo: true });
}