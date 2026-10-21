import { api } from './api';

// true = datos de prueba / false = API real de Vick
const USAR_MOCK = true;

export async function login(email, password) {
  if (USAR_MOCK) {
    await new Promise((r) => setTimeout(r, 600)); // simula la demora del servidor
    if (password !== 'password') {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 422;
      throw error;
    }
    return {
      requiere_mfa: false,
      usuario: { name: 'Usuario de prueba', email, rol: 'gestion' },
    };
  }

  return api('/login', { method: 'POST', body: { email, password } });
}