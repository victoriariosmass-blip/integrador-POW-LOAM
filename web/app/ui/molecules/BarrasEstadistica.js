
// Tarjeta de estadísticas: nombre a la izquierda, barra índigo y el número
// pegado donde termina la barra. filas: [{ etiqueta: 'Firmado', total: 15 }, ...]
// El largo de cada barra es proporcional al más grande (ese ocupa todo el ancho).
// Los estilos están en globals.css (.barras-...).
export default function BarrasEstadistica({ titulo, filas }) {
  const maximo = Math.max(1, ...filas.map((f) => f.total));
  return (
    <section className="card h-100">
      <div className="card-body">
        <h3 className="h6 fw-bold mb-3">{titulo}</h3>
        {filas.length === 0 ? (
          <p className="small text-body-secondary mb-0">Sin datos.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {filas.map((f) => (
              <li key={f.etiqueta} className="barras-fila">
                <span className="barras-etiqueta">{f.etiqueta}</span>
                <span className="barras-valor">
                  <span className="barras-barra" style={{ '--largo': f.total / maximo }} aria-hidden="true" />
                  <span className="barras-numero">{f.total}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}