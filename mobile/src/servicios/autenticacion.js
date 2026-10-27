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

// POST /api/token: devuelve el token y el usuario. El token queda guardado.
export async function iniciarSesion(email, password) {
  if (USAR_MOCK) {
    await esperar(600);
    const usuario = USUARIOS_MOCK[email.trim().toLowerCase()];
    if (!usuario || password !== 'password') {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 422;
      throw error;
    }
    await guardarToken(`mock|${email}`);
    return { ...usuario, email };
  }

  const datos = await api('/token', {
    method: 'POST',
    body: { email: email.trim(), password, dispositivo: 'app' },
  });
  await guardarToken(datos.token);
  return datos.usuario;
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