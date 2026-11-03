
// Datos de prueba de convenios (solo se usan con USAR_MOCK = true).
// Imitan lo que devuelve la API, incluido el bloque "permisos".
 
const FI = { id: 7, nombre: 'Facultad de Ingeniería', sigla: 'FI' };
const FCEYN = { id: 4, nombre: 'Facultad de Ciencias Exactas y Naturales', sigla: 'FCEyN' };
 
let convenios = [
  { id: 1, codigo: 'MC-2024-0001', titulo: 'Marco de colaboración con Cooperativa Eléctrica de General Pico', tipo: 'marco_colaboracion', unidad: FI, estado: 'firmado', confidencial: false, objeto: 'Colaboración en investigación y extensión.', fecha_firma: '2024-03-15', fecha_vencimiento: '2027-03-15', version: 4, revisor_id: 6 },
  { id: 2, codigo: 'EC-2025-0001', titulo: 'Específico de capacitación en energías renovables', tipo: 'especifico_colaboracion', unidad: FI, estado: 'firmado', confidencial: false, objeto: 'Cursos de capacitación para personal técnico.', fecha_firma: '2025-05-02', fecha_vencimiento: '2026-11-20', version: 4, revisor_id: 6 },
  { id: 3, codigo: 'MP-2025-0001', titulo: 'Marco de pasantías con Agroindustrias del Oeste', tipo: 'marco_pasantia', unidad: FI, estado: 'aprobado', confidencial: false, objeto: 'Pasantías educativas para estudiantes avanzados.', fecha_firma: null, fecha_vencimiento: null, version: 3, revisor_id: 6 },
  { id: 4, codigo: 'EP-2026-0001', titulo: 'Pasantía de Lucía Gómez en Agroindustrias del Oeste', tipo: 'especifico_pasantia', unidad: FI, estado: 'revision', confidencial: true, objeto: 'Pasantía en el área de sistemas.', fecha_firma: null, fecha_vencimiento: null, version: 2, revisor_id: 6 },
  { id: 5, codigo: 'MC-2026-0001', titulo: 'Marco de colaboración con Municipalidad de General Pico', tipo: 'marco_colaboracion', unidad: FI, estado: 'borrador', confidencial: false, objeto: 'Asistencia técnica a obras públicas.', fecha_firma: null, fecha_vencimiento: null, version: 1, revisor_id: null },
  { id: 6, codigo: 'AD-2025-0001', titulo: 'Adenda al marco con Cooperativa Eléctrica', tipo: 'adenda', unidad: FI, estado: 'rescindido', confidencial: false, objeto: 'Amplía el plazo del marco.', fecha_firma: '2025-01-10', fecha_vencimiento: '2026-01-10', version: 5, revisor_id: 6 },
  { id: 7, codigo: 'MC-2025-0002', titulo: 'Marco con Instituto Nacional de Tecnología Agropecuaria', tipo: 'marco_colaboracion', unidad: FCEYN, estado: 'firmado', confidencial: false, objeto: 'Investigación conjunta en suelos.', fecha_firma: '2025-08-01', fecha_vencimiento: '2028-08-01', version: 4, revisor_id: 6 },
  { id: 8, codigo: 'EC-2026-0002', titulo: 'Específico de monitoreo de acuíferos', tipo: 'especifico_colaboracion', unidad: FCEYN, estado: 'borrador', confidencial: false, objeto: 'Muestreo y análisis de agua.', fecha_firma: null, fecha_vencimiento: null, version: 1, revisor_id: null },
];
 
let historial = {}; // id -> transiciones agregadas en esta sesión
 
function esGlobal(u) {
  return u.unidad_id === null;
}
 
function puedeVer(u, c) {
  const suUnidad = esGlobal(u) || c.unidad.id === u.unidad_id;
  if (u.rol === 'admin') return true;
  if (u.rol === 'gestor' || u.rol === 'autoridad') return suUnidad;
  if (u.rol === 'revisor') return c.revisor_id === u.id;
  if (u.rol === 'consulta') return suUnidad && !c.confidencial;
  return false;
}
 
// Misma lógica que ConvenioPolicy (solo para el modo de prueba)
function permisos(u, c) {
  const editar = ['admin', 'gestor'].includes(u.rol) && c.estado === 'borrador';
  return {
    editar,
    enviar_revision: editar,
    revisar: c.estado === 'revision' && (u.rol === 'admin' || (u.rol === 'revisor' && c.revisor_id === u.id)),
    firmar: u.rol === 'autoridad' && c.estado === 'aprobado',
    rescindir: u.rol === 'admin' && c.estado === 'firmado',
    archivar: u.rol === 'admin' && ['firmado', 'rescindido'].includes(c.estado),
    comentar: u.rol !== 'consulta',
  };
}
 
function conPermisos(u, c) {
  return { ...c, permisos: permisos(u, c) };
}
 
function error(status, mensaje) {
  const e = new Error(mensaje);
  e.status = status;
  return e;
}
 
export function listarMock(usuario, { estado, tipo, q, page = 1 }) {
  const texto = (q ?? '').toLowerCase();
  const filtrados = convenios
    .filter((c) => puedeVer(usuario, c))
    .filter((c) => !estado || c.estado === estado)
    .filter((c) => !tipo || c.tipo === tipo)
    .filter((c) => !texto || c.titulo.toLowerCase().includes(texto) || c.codigo.toLowerCase().includes(texto));
  const porPagina = 15;
  const ultima = Math.max(1, Math.ceil(filtrados.length / porPagina));
  return {
    data: filtrados.slice((page - 1) * porPagina, page * porPagina).map((c) => conPermisos(usuario, c)),
    meta: { current_page: Number(page), last_page: ultima, total: filtrados.length },
  };
}
 
export function verMock(usuario, id) {
  const c = convenios.find((x) => x.id === Number(id));
  if (!c) throw error(404, 'El convenio no existe');
  if (!puedeVer(usuario, c)) throw error(403, 'No tenés permiso para ver este convenio');
  return {
    data: {
      ...conPermisos(usuario, c),
      transiciones: historial[c.id] ?? [],
      observaciones: c.observaciones ?? [],
    },
  };
}
 
const DESTINO = { 'enviar-revision': 'revision', aprobar: 'aprobado', devolver: 'borrador', rescindir: 'rescindido', archivar: 'archivado' };
 
export function accionMock(usuario, id, accion, datos = {}) {
  const c = convenios.find((x) => x.id === Number(id));
  const p = permisos(usuario, c);
  const permitido = { 'enviar-revision': p.enviar_revision, aprobar: p.revisar, devolver: p.revisar, rescindir: p.rescindir, archivar: p.archivar }[accion];
  if (!permitido) throw error(403, 'No tenés permiso para hacer esto con este convenio.');
  const hasta = DESTINO[accion];
  historial[c.id] = [...(historial[c.id] ?? []), {
    id: Date.now(), estado_desde: c.estado, estado_hasta: hasta,
    fundamento: datos.observaciones ?? datos.fundamento ?? 'Cambio de estado',
    created_at: new Date().toISOString(), usuario: { name: usuario.name },
  }];
  if (accion === 'devolver') {
    c.observaciones = [{ id: Date.now(), contenido: datos.observaciones, autor: { name: usuario.name }, created_at: new Date().toISOString() }, ...(c.observaciones ?? [])];
  }
  c.estado = hasta;
  c.version += 1;
  return verMock(usuario, id);
}


// ---- alta, edición y panel (modo de prueba) ----
 
const UNIDADES = [
  { id: 4, nombre: 'Facultad de Ciencias Exactas y Naturales', sigla: 'FCEyN' },
  { id: 7, nombre: 'Facultad de Ingeniería', sigla: 'FI' },
];
 
const PREFIJOS = { marco_colaboracion: 'MC', especifico_colaboracion: 'EC', marco_pasantia: 'MP', especifico_pasantia: 'EP', adenda: 'AD' };
 
function errorValidacion(errors) {
  const e = error(422, Object.values(errors)[0][0]);
  e.errors = errors;
  return e;
}
 
// mismas reglas básicas que StoreConvenioRequest / UpdateConvenioRequest
function validar(datos, alta) {
  const errors = {};
  if (alta || 'titulo' in datos) if (!datos.titulo?.trim()) errors.titulo = ['El título es obligatorio.'];
  if (alta || 'objeto' in datos) if (!datos.objeto?.trim()) errors.objeto = ['El objeto es obligatorio.'];
  if (alta && !datos.tipo) errors.tipo = ['Elegí el tipo de convenio.'];
  const desde = alta ? datos.fecha_firma : datos.fecha_inicio;
  if (datos.fecha_vencimiento && desde && datos.fecha_vencimiento <= desde) {
    errors.fecha_vencimiento = [alta ? 'El vencimiento tiene que ser posterior a la firma.' : 'El vencimiento tiene que ser posterior al inicio.'];
  }
  if (Object.keys(errors).length) throw errorValidacion(errors);
}
 
export function unidadesMock() {
  return { data: UNIDADES };
}
 
export function crearMock(usuario, datos) {
  if (!['admin', 'gestor'].includes(usuario.rol)) throw error(403, 'Tu rol no puede cargar convenios');
  validar(datos, true);
  const unidadId = usuario.unidad_id ?? Number(datos.unidad_id || 0);
  if (!unidadId) throw errorValidacion({ unidad_id: ['Indicá la unidad del convenio'] });
  const unidad = UNIDADES.find((u) => u.id === unidadId) ?? { id: unidadId, nombre: 'Unidad', sigla: '' };
  const base = `${PREFIJOS[datos.tipo]}-${new Date().getFullYear()}-`;
  const numero = convenios.filter((c) => c.codigo.startsWith(base)).length + 1;
  const nuevo = {
    id: Math.max(...convenios.map((c) => c.id)) + 1,
    codigo: base + String(numero).padStart(4, '0'),
    titulo: datos.titulo, tipo: datos.tipo, objeto: datos.objeto, unidad,
    estado: 'borrador', confidencial: false,
    fecha_firma: datos.fecha_firma || null, fecha_vencimiento: datos.fecha_vencimiento || null,
    version: 1, revisor_id: null,
  };
  convenios = [nuevo, ...convenios];
  return { data: conPermisos(usuario, nuevo) };
}
 
export function editarMock(usuario, id, datos) {
  const c = convenios.find((x) => x.id === Number(id));
  if (!c) throw error(404, 'El convenio no existe');
  if (!permisos(usuario, c).editar) throw error(403, 'No tenés permiso para editar este convenio.');
  if (Number(datos.version) !== c.version) throw error(409, 'El convenio cambió mientras lo editabas. Recargalo para ver los cambios.');
  validar(datos, false);
  const cambios = { ...datos };
  delete cambios.version;
  Object.assign(c, cambios, { version: c.version + 1 });
  return { data: conPermisos(usuario, c) };
}
 
export function resumenMock(usuario) {
  const visibles = convenios.filter((c) => puedeVer(usuario, c));
  const hoy = new Date().toISOString().slice(0, 10);
  const haceUnAnio = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const movimientos = Object.entries(historial)
    .flatMap(([cid, lista]) => lista.map((t) => ({ ...t, convenio: convenios.find((c) => c.id === Number(cid)) })))
    .filter((t) => puedeVer(usuario, t.convenio))
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);
  return {
    firmados_ultimo_anio: visibles.filter((c) => c.estado === 'firmado' && c.fecha_firma >= haceUnAnio).length,
    vigentes: visibles.filter((c) => c.estado === 'firmado' && (!c.fecha_vencimiento || c.fecha_vencimiento >= hoy)).length,
    en_tramite: visibles.filter((c) => ['borrador', 'revision'].includes(c.estado)).length,
    por_firmar: visibles.filter((c) => c.estado === 'aprobado').length,
    ultimos_movimientos: movimientos,
  };
}