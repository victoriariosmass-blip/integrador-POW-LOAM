 import Link from 'next/link';
 
// Plantilla de la vista pública: no pide iniciar sesión
export default function PublicoLayout({ children }) {
  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <header className="bg-body border-bottom">
        <div className="container d-flex align-items-center gap-3 py-3">
          <Link href="/publico" className="fw-bold fs-5 text-body text-decoration-none me-auto">
            <i className="bi bi-mortarboard me-2" aria-hidden="true" />Convenios UNLPam
          </Link>
          <Link href="/login" className="btn btn-outline-primary btn-sm">Ingresar</Link>
        </div>
      </header>
      <main className="container py-4 flex-grow-1">{children}</main>
      <footer className="border-top bg-body py-3">
        <p className="container small text-body-secondary mb-0">
          Universidad Nacional de La Pampa · Convenios firmados y vigentes de la universidad.
        </p>
      </footer>
    </div>
  );
}