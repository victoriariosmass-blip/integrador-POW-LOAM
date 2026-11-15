// Título de la pestaña. Va completo (absolute) porque la plantilla " · Convenios UNLPam" del layout raíz
// no llega hasta acá: la corta el título de app/publico/layout.js
export const metadata = { title: { absolute: 'Detalle del convenio · Convenios UNLPam' } };

export default function Layout({ children }) {
  return children;
}
