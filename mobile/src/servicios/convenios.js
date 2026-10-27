//Pasa los estados de la API a los textos de la app: borrador y revisión =
//"En trámite", aprobado = "Por firmar", firmado = "Vigente" o "Vencido",
//rescindido = "Cancelado".
import { api } from './api';
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