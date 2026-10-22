// nombres de los roles para mostrar en pantalla
export const NOMBRE_ROL = {
  admin: 'Administración',
  gestor: 'Gestión',
  revisor: 'Revisión',
  autoridad: 'Autoridad',
  consulta: 'Consulta',
};

// permisos que no dependen de un convenio en particular (matriz de permisos).
// los permisos sobre un convenio (editar, revisar, firmar...) vienen de la API
// en convenio.permisos: no se calculan aca
const PERMISOS_GENERALES = {
  crearConvenio: ['admin', 'gestor'],
  verRevision: ['admin', 'revisor'],
  administrar: ['admin'],
};
 
export function puede(usuario, accion) {
  return Boolean(usuario) && (PERMISOS_GENERALES[accion] ?? []).includes(usuario.rol);
}