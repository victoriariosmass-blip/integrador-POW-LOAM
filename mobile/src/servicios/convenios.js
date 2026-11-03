//Pasa los estados de la API a los textos de la app: borrador y revisión =
//"En trámite", aprobado = "Por firmar", firmado = "Vigente" o "Vencido",
//rescindido = "Cancelado".
import { api } from './api';
import { usuarioGuardado } from './autenticacion';
import { USAR_MOCK } from './config';

// Estados de la API -> textos de la app (como en los wireframes)
export function textoEstado(convenio) {
  switch (convenio.estado) {
    case 'borrador':
    case 'revision':
      return 'En trámite';
    case 'aprobado':
      return 'Por firmar';
    case 'firmado': {
      const vence = convenio.fecha_vencimiento;
      return vence && new Date(vence) < new Date() ? 'Vencido' : 'Vigente';
    }
    case 'rescindido':
      return 'Cancelado';
    case 'archivado':
      return 'Archivado';
    default:
      return convenio.estado;
  }
}

const PENDIENTES_MOCK = [
  { id: 3, codigo: 'MP-2025-0001', titulo: 'Marco de pasantías con Agroindustrias del Oeste', estado: 'aprobado', fecha_vencimiento: null },
  { id: 9, codigo: 'EC-2026-0003', titulo: 'Específico de capacitación docente con Escuela Técnica N° 1', estado: 'aprobado', fecha_vencimiento: null },
];

const RESUMEN_MOCK = {
  firmados_ultimo_anio: 4,
  vigentes: 14,
  en_tramite: 8,
  por_firmar: 2,
  ultimos_movimientos: [
    { id: 1, estado_hasta: 'aprobado', created_at: '2026-10-22T13:00:00Z', convenio: PENDIENTES_MOCK[0], usuario: { name: 'Raúl Revisor' } },
    { id: 2, estado_hasta: 'firmado', created_at: '2026-10-21T15:00:00Z', convenio: { id: 1, codigo: 'MC-2024-0001', titulo: 'Marco con Cooperativa Eléctrica de General Pico', estado: 'firmado', fecha_vencimiento: '2027-03-15' }, usuario: { name: 'Rita Rectora' } },
  ],
};

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Convenios aprobados que esperan la firma (GET /api/convenios?estado=aprobado)
export async function listarPendientes() {
  if (USAR_MOCK) {
    await esperar(500);
    return PENDIENTES_MOCK;
  }
  const respuesta = await api('/convenios?estado=aprobado');
  return respuesta.data;
}

// Métricas de inicio y últimos 10 movimientos (GET /api/resumen)
export async function obtenerResumen() {
  if (USAR_MOCK) {
    await esperar(500);
    return RESUMEN_MOCK;
  }
  return api('/resumen');
}

// ---- Ficha, firma y comentarios ----

// Datos de prueba de la ficha (solo con USAR_MOCK = true)
const UNIDAD_FI = { id: 7, nombre: 'Facultad de Ingeniería', sigla: 'FI' };
const UNLPAM = { id: 1, nombre: 'Universidad Nacional de La Pampa', tipo: 'universidad', pivot: { representante_nombre: 'Rita Rectora', representante_cargo: 'Rector/a' } };
const FICHAS_MOCK = {
  1: { id: 1, codigo: 'MC-2024-0001', titulo: 'Marco con Cooperativa Eléctrica de General Pico', tipo: 'marco_colaboracion', estado: 'firmado', unidad: UNIDAD_FI, objeto: 'Colaboración en investigación y extensión.', fecha_firma: '2024-03-15', fecha_vencimiento: '2027-03-15', dias_preaviso: 60, contraparte: 'Cooperativa Eléctrica de General Pico' },
  3: { id: 3, codigo: 'MP-2025-0001', titulo: 'Marco de pasantías con Agroindustrias del Oeste', tipo: 'marco_pasantia', estado: 'aprobado', unidad: UNIDAD_FI, objeto: 'Pasantías educativas para estudiantes avanzados.', fecha_firma: null, fecha_vencimiento: null, dias_preaviso: null, contraparte: 'Agroindustrias del Oeste S.A.' },
  9: { id: 9, codigo: 'EC-2026-0003', titulo: 'Específico de capacitación docente con Escuela Técnica N° 1', tipo: 'especifico_colaboracion', estado: 'aprobado', unidad: UNIDAD_FI, objeto: 'Cursos de actualización para docentes de la escuela.', fecha_firma: null, fecha_vencimiento: '2027-12-15', dias_preaviso: 30, contraparte: 'Escuela Técnica N° 1' },
};
const COMENTARIOS_MOCK = {
  3: [{ id: 1, contenido: 'Revisión técnica aprobada.', es_ofensivo: false, autor: { name: 'Raúl Revisor' }, created_at: '2026-10-22T13:00:00Z' }],
};
const OFENSIVAS_MOCK = ['idiota', 'estupido', 'inutil', 'basura']; // el filtro de verdad lo hace la API

function fichaMock(id, usuario) {
  const c = FICHAS_MOCK[id];
  if (!c) {
    const e = new Error('El convenio no existe');
    e.status = 404;
    throw e;
  }
  const { contraparte, ...datos } = c;
  return {
    ...datos,
    partes: [UNLPAM, { id: 2, nombre: contraparte, tipo: 'empresa', pivot: { representante_nombre: 'Responsable de la empresa', representante_cargo: 'Gerente' } }],
    documentos: [],
    transiciones: [
      { id: 1, estado_desde: null, estado_hasta: 'borrador', fundamento: 'Alta del instrumento', created_at: '2026-10-20T12:00:00Z', usuario: { name: 'Gabriel Gestor' } },
      ...(c.estado !== 'borrador' ? [{ id: 2, estado_desde: 'revision', estado_hasta: 'aprobado', fundamento: 'Aprobado por revisión', created_at: '2026-10-22T13:00:00Z', usuario: { name: 'Raúl Revisor' } }] : []),
      ...(c.estado === 'firmado' ? [{ id: 3, estado_desde: 'aprobado', estado_hasta: 'firmado', fundamento: 'Firmado por Rita Rectora', created_at: c.fecha_firma, usuario: { name: 'Rita Rectora' } }] : []),
    ],
    // misma regla que la API: firma la autoridad si está aprobado; consulta no comenta
    permisos: { firmar: usuario?.rol === 'autoridad' && c.estado === 'aprobado', comentar: usuario?.rol !== 'consulta', editar: false },
  };
}

// Ficha completa: datos, partes, documentos e historial (GET /api/convenios/{id})
export async function verConvenio(id) {
  if (USAR_MOCK) {
    await esperar(400);
    return fichaMock(id, await usuarioGuardado());
  }
  const respuesta = await api(`/convenios/${id}`);
  return respuesta.data;
}

// Firma desde la app (POST /api/convenios/{id}/firmar)
// datos: { firma_imagen: 'data:image/png;base64,...', latitud, longitud, biometria_ok }
export async function firmarConvenio(id, datos) {
  if (USAR_MOCK) {
    await esperar(800);
    const c = FICHAS_MOCK[id];
    c.estado = 'firmado';
    c.fecha_firma = new Date().toISOString().slice(0, 10);
    const i = PENDIENTES_MOCK.findIndex((p) => p.id === Number(id));
    if (i >= 0) PENDIENTES_MOCK.splice(i, 1); // ya no está pendiente
    return fichaMock(id, await usuarioGuardado());
  }
  const respuesta = await api(`/convenios/${id}/firmar`, { method: 'POST', body: datos });
  return respuesta.data;
}

// Comentarios del convenio (GET /api/convenios/{id}/comentarios)
export async function listarComentarios(id) {
  if (USAR_MOCK) {
    await esperar(300);
    return COMENTARIOS_MOCK[id] ?? [];
  }
  const respuesta = await api(`/convenios/${id}/comentarios`);
  return respuesta.data;
}

// Nuevo comentario (POST /api/convenios/{id}/comentarios). Si es ofensivo,
// la API lo guarda marcado y devuelve "Comentario ofensivo" como texto.
export async function comentar(id, contenido) {
  if (USAR_MOCK) {
    await esperar(400);
    const palabras = contenido.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]+/);
    const ofensivo = palabras.some((p) => OFENSIVAS_MOCK.includes(p));
    const nuevo = { id: Date.now(), contenido: ofensivo ? 'Comentario ofensivo' : contenido, es_ofensivo: ofensivo, autor: { name: 'Yo' }, created_at: new Date().toISOString() };
    COMENTARIOS_MOCK[id] = [...(COMENTARIOS_MOCK[id] ?? []), nuevo];
    return nuevo;
  }
  const respuesta = await api(`/convenios/${id}/comentarios`, { method: 'POST', body: { contenido } });
  return respuesta.data;
}

// "2026-10-27" o "2026-10-27T13:00:00Z" -> "27/10/2026"
export function fecha(valor) {
  if (!valor) return null;
  const [a, m, d] = String(valor).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export const TIPOS = {
  marco_colaboracion: 'Marco de colaboración',
  especifico_colaboracion: 'Específico de colaboración',
  marco_pasantia: 'Marco de pasantías',
  especifico_pasantia: 'Específico de pasantía',
  adenda: 'Adenda',
};

export const ESTADOS = {
  borrador: 'Borrador',
  revision: 'En revisión',
  aprobado: 'Aprobado',
  firmado: 'Firmado',
  rescindido: 'Rescindido',
  archivado: 'Archivado',
};