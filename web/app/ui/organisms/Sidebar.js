'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/panel', label: 'Panel', icon: 'bi-speedometer2' },
  { href: '/convenios', label: 'Convenios', icon: 'bi-folder2-open' },
  { href: '/revision', label: 'Revisión', icon: 'bi-clipboard-check' },
  { href: '/vencimientos', label: 'Vencimientos', icon: 'bi-calendar-event' },
  { href: '/alertas', label: 'Alertas', icon: 'bi-bell' },
  { href: '/admin', label: 'Administración', icon: 'bi-gear' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menú principal" className="d-flex flex-column h-100 p-3">
      <ul className="nav nav-pills flex-column gap-1">
        {items.map(({ href, label, icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <li className="nav-item" key={href}>
              <Link href={href} className={`nav-link d-flex align-items-center gap-2 ${activo ? 'active' : 'link-dark'}`}
                    aria-current={activo ? 'page' : undefined}>
                <i className={`bi ${icon}`} aria-hidden="true" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn btn-outline-secondary mt-auto">
        <i className="bi bi-box-arrow-left me-2" aria-hidden="true" />Cerrar sesión
      </button>
    </nav>
  );
}