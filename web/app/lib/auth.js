import { api } from './api';

import { USAR_MOCK } from './config';
 
// codigo que acepta el modo de prueba
const CODIGO_MOCK = '123456';
 
// los mismos usuarios que el seeder del backend (contraseña: password)
const USUARIOS_MOCK = {
  'admin@convenios.test': { id: 1, name: 'Ana Admin', rol: 'admin', unidad_id: null },
  'autoridad@convenios.test': { id: 2, name: 'Rita Rectora', rol: 'autoridad', unidad_id: null },
  'decano.fi@convenios.test': { id: 3, name: 'Diego Decano', rol: 'autoridad', unidad_id: 7 },
  'gestor.fi@convenios.test': { id: 4, name: 'Gabriel Gestor', rol: 'gestor', unidad_id: 7 },
  'gestor.fceyn@convenios.test': { id: 5, name: 'Gisela Gestora', rol: 'gestor', unidad_id: 4 },
  'revisor@convenios.test': { id: 6, name: 'Raúl Revisor', rol: 'revisor', unidad_id: null },
  'consulta.fi@convenios.test': { id: 7, name: 'Carla Consulta', rol: 'consulta', unidad_id: 7 },
};
 
// En modo prueba se guarda en sessionStorage: primero el usuario "pendiente"
// (pasó la contraseña) y, después del código, el usuario logueado.
const CLAVE_PENDIENTE = 'mfa_pendiente';
const CLAVE_USUARIO = 'usuario_mock';
 
function guardar(clave, valor) {
  try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch {}
}
 
function leer(clave) {
  try { return JSON.parse(sessionStorage.getItem(clave)); } catch { return null; }
}
 
function borrar(clave) {
  try { sessionStorage.removeItem(clave); } catch {}
}
 
function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms)); // simula la demora del servidor
}
 
function errorCon(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}
 
//1: email y contraseña. Si esta bien, la API pide el codigo (requiere_mfa).
export async function login(email, password) {
  if (USAR_MOCK) {
    await esperar(600);
    const datos = USUARIOS_MOCK[email];
    if (!datos || password !== 'password') throw errorCon(422, 'Email o contraseña incorrectos');
    guardar(CLAVE_PENDIENTE, { ...datos, email });
    return { requiere_mfa: true };
  }
 
  return api('/login', { method: 'POST', body: { email, password } });
}
 
//2: codigo de 6 dígitos
export async function verificarCodigo(codigo) {
  if (USAR_MOCK) {
    await esperar(600);
    const pendiente = leer(CLAVE_PENDIENTE);
    if (!pendiente) throw errorCon(401, 'La sesión venció. Volvé a iniciar sesión.');
    if (codigo !== CODIGO_MOCK) throw errorCon(422, 'El código no es correcto');
    borrar(CLAVE_PENDIENTE);
    guardar(CLAVE_USUARIO, pendiente);
    return { usuario: pendiente };
  }
 
  return api('/mfa/verificar', { method: 'POST', body: { codigo } });
}
 
// reenvia el codigo por el canal elegido: 'mail' o 'sms'
export async function reenviarCodigo(canal) {
  if (USAR_MOCK) {
    await esperar(400);
    return { enviado: true, canal };
  }
 
  return api('/mfa/reenviar', { method: 'POST', body: { canal } });
}
 
// usuario logueado (GET /api/user). Si no hay sesion, tira error 401.
export async function usuarioActual() {
  if (USAR_MOCK) {
    const usuario = leer(CLAVE_USUARIO);
    if (!usuario) throw errorCon(401, 'No autenticado');
    return usuario;
  }
 
  return api('/user');
}
 
export async function logout() {
  if (USAR_MOCK) {
    borrar(CLAVE_USUARIO);
    borrar(CLAVE_PENDIENTE);
    return;
  }
 
  return api('/logout', { method: 'POST' });
}