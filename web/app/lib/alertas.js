// Alertas:
// - Vencimientos y pendientes del circuito: se calculan en la web a partir de los convenios que el
//   usuario puede ver (la API ya filtra por rol y unidad).
// - Avisos (nivel 'aviso'): los genera la API cuando se asigna una revisión o cambia el estado de un
//   convenio (por ejemplo, devuelto con observaciones). Vienen de GET /api/notificaciones (últimos 30 días).
import { api } from './api';
import { USAR_MOCK } from './config';
import { listarTodos } from './listados';
import { diasHasta } from './formato';

// Avisos de la API pasados al mismo formato que las demás alertas.
// "titulo" viene como "EP-2026-0005 · Devuelto con observaciones" y "cuerpo" como
// "Título del convenio · Tipo · Estado: ...": se sacan el código y el título, que la bandeja ya muestra.
async function avisosDeLaApi() {
  if (USAR_MOCK) return [];
  try {
    const { data } = await api('/notificaciones');
    return data.filter((n) => n.convenio).map((n) => ({
      id: `aviso-${n.id}`, nivel: 'aviso', convenio: n.convenio, dias: null, fecha: n.created_at,
      titulo: n.titulo.replace(`${n.convenio.codigo} · `, ''),
      detalle: (n.cuerpo ?? '').replace(`${n.convenio.titulo} · `, ''),
      enlace: n.enlace,
    }));
  } catch {
    return []; // si falla, se muestran igual las demás alertas
  }
}
 
const PREAVISO_SIN_DATO = 30; // si el convenio no tiene días de preaviso cargados
const ROLES_REVISION = ['admin', 'revisor'];
const ROLES_FIRMA = ['admin', 'autoridad'];
 
// Devuelve [{ id, nivel: 'aviso' | 'alta' | 'media' | 'info', convenio, titulo, detalle }]
export async function calcularAlertas(usuario) {
  const [firmados, enRevision, aprobados, avisos] = await Promise.all([
    listarTodos({ estado: 'firmado' }),
    ROLES_REVISION.includes(usuario.rol) ? listarTodos({ estado: 'revision' }) : [],
    ROLES_FIRMA.includes(usuario.rol) ? listarTodos({ estado: 'aprobado' }) : [],
    avisosDeLaApi(),
  ]);

  const alertas = [...avisos]; // ya vienen del más nuevo al más viejo
 
  for (const c of firmados) {
    const dias = diasHasta(c.fecha_vencimiento);
    if (dias === null) continue;
    const preaviso = c.dias_preaviso ?? PREAVISO_SIN_DATO;
    if (dias < 0) {
      alertas.push({
        id: `vencido-${c.id}`, nivel: 'alta', convenio: c, dias,
        titulo: 'Vencido y todavía figura como firmado',
        detalle: 'Hay que renovarlo o archivarlo.',
      });
    } else if (dias <= preaviso) {
      alertas.push({
        id: `preaviso-${c.id}`, nivel: 'media', convenio: c, dias,
        titulo: 'Dentro del plazo de preaviso',
        detalle: `El preaviso es de ${preaviso} días: si no se va a renovar, hay que avisarle a la contraparte.`,
      });
    }
  }
 
  for (const c of enRevision) {
    alertas.push({
      id: `revision-${c.id}`, nivel: 'info', convenio: c, dias: null,
      titulo: 'Espera revisión', detalle: 'Aprobalo o devolvelo con observaciones desde Revisión.',
    });
  }
 
  for (const c of aprobados) {
    alertas.push({
      id: `firma-${c.id}`, nivel: 'info', convenio: c, dias: null,
      titulo: 'Aprobado, espera la firma', detalle: 'La autoridad lo firma desde la app.',
    });
  }
 
  const orden = { aviso: 0, alta: 1, media: 2, info: 3 };
  return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel] || (a.dias ?? 0) - (b.dias ?? 0));
}