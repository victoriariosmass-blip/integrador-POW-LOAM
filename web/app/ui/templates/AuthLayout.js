// plantilla de las pantallas de acceso (login y verificación):
// panel institucional a la izquierda (solo en pantallas grandes) y la tarjeta a la derecha.
export default function AuthLayout({ icono = 'bi-mortarboard', titulo, subtitulo, children }) {
  return (
    <main className="min-vh-100 row g-0">
      <section className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center bg-body-tertiary border-end p-5">
        <div
          className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded mb-4 w-100"
          style={{ maxWidth: 420, height: 260 }}
          aria-hidden="true"
        >
          <i className="bi bi-building fs-1 text-secondary" />
        </div>
        <div style={{ maxWidth: 420 }} className="w-100">
          <h1 className="h3 fw-bold">Gestión de Convenios</h1>
          <p className="text-body-secondary mb-0">
            Sistema para registrar, revisar y dar seguimiento a los convenios de la Universidad Nacional de La Pampa.
          </p>
        </div>
      </section>
 
      <section className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm w-100" style={{ maxWidth: 400 }}>
          <div className="card-body p-4">
            <div
              className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded mb-3"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            >
              <i className={`bi ${icono} fs-4 text-secondary`} />
            </div>
            <h2 className="h4 fw-bold mb-1">{titulo}</h2>
            <p className="text-body-secondary small mb-4">{subtitulo}</p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
 