// Título de la pestaña. Va completo (absolute) porque dentro de /convenios la plantilla
// " · Convenios UNLPam" del layout raíz no llega: la corta el título de app/(app)/convenios/layout.js
export const metadata = { title: { absolute: 'Nuevo convenio · Convenios UNLPam' } };

export default function Layout({ children }) {
  return children;
}
