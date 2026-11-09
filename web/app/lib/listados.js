import { listarConvenios } from './convenios';
 
// Todas las páginas de un listado juntas (para Revisión, Vencimientos y Alertas,
// que necesitan mirar todos los convenios de un estado y no solo la primera página)
export async function listarTodos(filtros = {}) {
  const primera = await listarConvenios({ ...filtros, page: 1 });
  const resto = [];
  for (let page = 2; page <= primera.meta.last_page; page++) {
    resto.push(listarConvenios({ ...filtros, page }));
  }
  const paginas = await Promise.all(resto);
  return [primera, ...paginas].flatMap((p) => p.data);
}