// Alertas: se calculan en la web a partir de los convenios que el usuario
// puede ver (la API ya filtra por rol y unidad). No hay tabla de alertas.
import { listarTodos } from './listados';
import { diasHasta } from './formato';
 
const PREAVISO_SIN_DATO = 30; // si el convenio no tiene días de preaviso cargados
const ROLES_REVISION = ['admin', 'revisor'];
const ROLES_FIRMA = ['admin', 'autoridad'];
 
// Devuelve [{ id, nivel: 'alta' | 'media' | 'info', convenio, titulo, detalle }]
export async function calcularAlertas(usuario) {
  const [firmados, enRevision, aprobados] = await Promise.all([
    listarTodos({ estado: 'firmado' }),
    ROLES_REVISION.includes(usuario.rol) ? listarTodos({ estado: 'revision' }) : [],
    ROLES_FIRMA.includes(usuario.rol) ? listarTodos({ estado: 'aprobado' }) : [],
  ]);
 
  const alertas = [];
 
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
 
  const orden = { alta: 0, media: 1, info: 2 };
  return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel] || (a.dias ?? 0) - (b.dias ?? 0));
}