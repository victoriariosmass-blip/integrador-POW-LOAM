'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUsuario } from '../../lib/UsuarioContext';
import { puede } from '../../lib/permisos';
import { logout } from '../../lib/auth';
 
// "accion": si está, el ítem solo se muestra a los roles que tienen ese permiso
const items = [
  { href: '/panel', label: 'Panel', icon: 'bi-speedometer2' },
  { href: '/convenios', label: 'Convenios', icon: 'bi-folder2-open' },
  { href: '/revision', label: 'Revisión', icon: 'bi-clipboard-check', accion: 'verRevision' },
  { href: '/vencimientos', label: 'Vencimientos', icon: 'bi-calendar-event' },
  { href: '/alertas', label: 'Alertas', icon: 'bi-bell' },
  { href: '/admin', label: 'Administración', icon: 'bi-gear', accion: 'administrar' },
];
 
// Cierra el menú del celular (offcanvas de Bootstrap). Los links de Next cambian de página
// sin recargar, así que Bootstrap no se entera y el menú quedaba abierto tapando la pantalla.
function cerrarMenuMovil() {
  const menu = document.getElementById('menuMovil');
  if (!menu?.classList.contains('show')) return;
  import('bootstrap/dist/js/bootstrap.bundle.min.js').then((m) => {
    const Offcanvas = m.Offcanvas ?? m.default?.Offcanvas;
    Offcanvas?.getOrCreateInstance(menu).hide();
  });
}

// enMenuMovil: true en la copia que va dentro del menú del celular (AppShell)
export default function Sidebar({ enMenuMovil = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = useUsuario();
  const visibles = items.filter((item) => !item.accion || puede(usuario, item.accion));

  async function cerrarSesion() {
    if (enMenuMovil) cerrarMenuMovil();
    await logout();
    router.replace('/login');
  }
 
  return (
    <nav aria-label="Menú principal" className="d-flex flex-column h-100 p-3">
      <ul className="nav nav-pills flex-column gap-1">
        {visibles.map(({ href, label, icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <li className="nav-item" key={href}>
              <Link href={href} className={`nav-link d-flex align-items-center gap-2 ${activo ? 'active' : ''}`}
                    aria-current={activo ? 'page' : undefined}
                    onClick={enMenuMovil ? cerrarMenuMovil : undefined}>
                <i className={`bi ${icon}`} aria-hidden="true" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn btn-outline-secondary mt-auto" onClick={cerrarSesion}>
        <i className="bi bi-box-arrow-left me-2" aria-hidden="true" />Cerrar sesión
      </button>
    </nav>
  );
}