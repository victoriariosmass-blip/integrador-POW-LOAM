// Administración de usuarios (solo admin). La API vuelve a controlar el permiso.
import { api } from './api';
import { USAR_MOCK } from './config';
import { usuarioActual } from './auth';
 
function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms)); // simula la demora del servidor
}
 
// ---- modo de prueba: los mismos usuarios que el seeder ----
const FI = { id: 7, nombre: 'Facultad de Ingeniería', sigla: 'FI' };
const FCEYN = { id: 4, nombre: 'Facultad de Ciencias Exactas y Naturales', sigla: 'FCEyN' };
const UNIDADES = { 4: FCEYN, 7: FI };
 
let usuariosMock = [
  { id: 1, name: 'Ana Admin', email: 'admin@convenios.test', rol: 'admin', unidad_id: null, activo: true },
  { id: 2, name: 'Rita Rectora', email: 'autoridad@convenios.test', rol: 'autoridad', unidad_id: null, activo: true },
  { id: 3, name: 'Diego Decano', email: 'decano.fi@convenios.test', rol: 'autoridad', unidad_id: 7, activo: true },
  { id: 4, name: 'Gabriel Gestor', email: 'gestor.fi@convenios.test', rol: 'gestor', unidad_id: 7, activo: true },
  { id: 5, name: 'Gisela Gestora', email: 'gestor.fceyn@convenios.test', rol: 'gestor', unidad_id: 4, activo: true },
  { id: 6, name: 'Raúl Revisor', email: 'revisor@convenios.test', rol: 'revisor', unidad_id: null, activo: true },
  { id: 7, name: 'Carla Consulta', email: 'consulta.fi@convenios.test', rol: 'consulta', unidad_id: 7, activo: true },
];
 
function conUnidad(u) {
  return { ...u, unidad: UNIDADES[u.unidad_id] ?? null };
}
 
function errorCon(status, mensaje, errors) {
  const e = new Error(mensaje);
  e.status = status;
  e.errors = errors;
  return e;
}
 
// mismas reglas que UsuarioController
function validarMock(datos, id) {
  const errors = {};
  if ('name' in datos && !datos.name?.trim()) errors.name = ['El nombre es obligatorio.'];
  if ('email' in datos) {
    if (!/^\S+@\S+\.\S+$/.test(datos.email ?? '')) errors.email = ['El email no es válido.'];
    else if (usuariosMock.some((u) => u.email === datos.email.trim().toLowerCase() && u.id !== id)) errors.email = ['Ya hay un usuario con ese email.'];
  }
  if (id === undefined && !datos.password) errors.password = ['La contraseña es obligatoria.'];
  if (datos.password && datos.password.length < 8) errors.password = ['La contraseña tiene que tener al menos 8 caracteres.'];
  if (Object.keys(errors).length) throw errorCon(422, Object.values(errors)[0][0], errors);
}
 
async function exigirAdmin() {
  const yo = await usuarioActual();
  if (yo?.rol !== 'admin') throw errorCon(403, 'Esta acción no está autorizada.');
  return yo;
}
 
// ---- funciones que usan las pantallas ----
 
// GET /api/usuarios?q=&rol=&page=
export async function listarUsuarios(filtros = {}) {
  if (USAR_MOCK) {
    await esperar(300);
    await exigirAdmin();
    const texto = (filtros.q ?? '').toLowerCase();
    const filtrados = usuariosMock
      .filter((u) => !filtros.rol || u.rol === filtros.rol)
      .filter((u) => !texto || u.name.toLowerCase().includes(texto) || u.email.includes(texto))
      .sort((a, b) => a.name.localeCompare(b.name));
    const page = Number(filtros.page ?? 1);
    return {
      data: filtrados.slice((page - 1) * 15, page * 15).map(conUnidad),
      current_page: page,
      last_page: Math.max(1, Math.ceil(filtrados.length / 15)),
      total: filtrados.length,
    };
  }
 
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  return api(`/usuarios?${params}`);
}
 
// POST /api/usuarios -> { name, email, rol, unidad_id, password }
export async function crearUsuario(datos) {
  if (USAR_MOCK) {
    await esperar(400);
    await exigirAdmin();
    validarMock(datos);
    const nuevo = {
      id: Math.max(...usuariosMock.map((u) => u.id)) + 1,
      name: datos.name.trim(),
      email: datos.email.trim().toLowerCase(),
      rol: datos.rol,
      unidad_id: datos.unidad_id ? Number(datos.unidad_id) : null,
      activo: true,
    };
    usuariosMock = [...usuariosMock, nuevo];
    return { data: conUnidad(nuevo) };
  }
 
  return api('/usuarios', { method: 'POST', body: datos });
}
 
// PUT /api/usuarios/{id} -> solo los campos que cambian; password vacío = no se cambia
export async function editarUsuario(id, datos) {
  if (USAR_MOCK) {
    await esperar(400);
    const yo = await exigirAdmin();
    validarMock(datos, id);
    if (id === yo.id && datos.activo === false) throw errorCon(422, 'No podés desactivar tu propio usuario.');
    if (id === yo.id && datos.rol && datos.rol !== 'admin') throw errorCon(422, 'No podés quitarte el rol de administración.');
    const { password, ...resto } = datos;
    usuariosMock = usuariosMock.map((u) => (u.id === id
      ? { ...u, ...resto, unidad_id: 'unidad_id' in resto ? (resto.unidad_id ? Number(resto.unidad_id) : null) : u.unidad_id }
      : u));
    return { data: conUnidad(usuariosMock.find((u) => u.id === id)) };
  }
 
  return api(`/usuarios/${id}`, { method: 'PUT', body: datos });
}