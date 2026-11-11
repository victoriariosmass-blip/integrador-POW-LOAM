import { api } from './api';
import { USAR_MOCK } from './config';
import { guardarToken, leerToken, borrarToken } from './almacenamiento';

// Los mismos usuarios que el seeder del backend (contraseña: password)
const USUARIOS_MOCK = {
  'autoridad@convenios.test': { id: 2, name: 'Rita Rectora', rol: 'autoridad', unidad_id: null },
  'decano.fi@convenios.test': { id: 3, name: 'Diego Decano', rol: 'autoridad', unidad_id: 7 },
  'gestor.fi@convenios.test': { id: 4, name: 'Gabriel Gestor', rol: 'gestor', unidad_id: 7 },
  'consulta.fi@convenios.test': { id: 7, name: 'Carla Consulta', rol: 'consulta', unidad_id: 7 },
};

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Ingreso en dos pasos (verificación en dos pasos, como la web):
// 1) POST /api/token con email y contraseña -> si están bien, la API "manda" un código de 6 números
//    (queda en storage/logs/laravel.log) y devuelve un mfa_token que identifica este intento.
// 2) POST /api/token/verificar con el mfa_token y el código -> recién ahí da el token de verdad.
// Con datos de prueba el código es siempre 123456 (igual que en la web).

// Paso 1. Devuelve { requiereMfa: true, mfaToken, canal, email },
// o el usuario directo si la API todavía no pide código (por compatibilidad).
export async function iniciarSesion(email, password) {
  const correo = email.trim().toLowerCase();
  if (USAR_MOCK) {
    await esperar(600);
    const usuario = USUARIOS_MOCK[correo];
    if (!usuario || password !== 'password') {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 422;
      throw error;
    }
    return { requiereMfa: true, mfaToken: `mock|${correo}`, canal: 'mail', email: correo };
  }

  const datos = await api('/token', {
    method: 'POST',
    body: { email: correo, password, dispositivo: 'app' },
  });
  if (datos.requiere_mfa) {
    return { requiereMfa: true, mfaToken: datos.mfa_token, canal: datos.canal, email: correo };
  }
  await guardarToken(datos.token);
  return datos.usuario;
}

// Paso 2. Con el código correcto guarda el token y devuelve el usuario.
export async function verificarCodigo(mfaToken, codigo) {
  if (USAR_MOCK) {
    await esperar(500);
    if (codigo !== '123456') {
      const error = new Error('El código no es correcto o venció');
      error.status = 422;
      throw error;
    }
    const email = mfaToken.replace('mock|', '');
    await guardarToken(`mock|${email}`);
    return { ...USUARIOS_MOCK[email], email };
  }

  const datos = await api('/token/verificar', { method: 'POST', body: { mfa_token: mfaToken, codigo } });
  await guardarToken(datos.token);
  return datos.usuario;
}

// "Reenviar código" (la API pide 30 segundos entre envíos)
export async function reenviarCodigo(mfaToken, canal = 'mail') {
  if (USAR_MOCK) {
    await esperar(400);
    return { enviado: true, canal };
  }
  return api('/token/reenviar', { method: 'POST', body: { mfa_token: mfaToken, canal } });
}

// Al abrir la app: si hay token guardado, trae el usuario (GET /api/user)
export async function usuarioGuardado() {
  const token = await leerToken();
  if (!token) return null;

  if (USAR_MOCK) {
    const email = token.replace('mock|', '');
    return USUARIOS_MOCK[email] ? { ...USUARIOS_MOCK[email], email } : null;
  }

  try {
    return await api('/user');
  } catch (e) {
    if (e.status === 401) await borrarToken(); // token vencido o borrado
    return null;
  }
}

// POST /api/logout borra el token en el servidor; acá se borra del celular
export async function cerrarSesion() {
  if (!USAR_MOCK) {
    try { await api('/logout', { method: 'POST' }); } catch {}
  }
  await borrarToken();
}