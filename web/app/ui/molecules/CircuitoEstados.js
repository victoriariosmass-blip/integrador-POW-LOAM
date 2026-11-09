// Los 4 pasos del circuito (borrador → revisión → aprobado → firmado) con el
// paso en el que quedó el convenio marcado. Los pasos anteriores se ven
// completos y los siguientes vacíos. Rescindido y archivado vienen después de
// firmado: se muestran los 4 completos y una etiqueta al final.
// En pantallas chicas solo se muestra el nombre del paso actual.
const PASOS = [
  { estado: 'borrador', texto: 'Borrador' },
  { estado: 'revision', texto: 'Revisión' },
  { estado: 'aprobado', texto: 'Aprobado' },
  { estado: 'firmado', texto: 'Firmado' },
];
const FINALES = { rescindido: 'Rescindido', archivado: 'Archivado' };
 
const ACENTO = 'var(--bs-primary)';
const APAGADO = 'var(--bs-border-color)';
 
// estado: en qué quedó; devuelto: true si volvió de revisión a borrador
export default function CircuitoEstados({ estado, devuelto = false }) {
  const final = FINALES[estado];
  const actual = final ? PASOS.length - 1 : PASOS.findIndex((p) => p.estado === estado);
  const descripcion = final
    ? `${final} (después de firmado)`
    : `${PASOS[actual]?.texto ?? estado}, paso ${actual + 1} de ${PASOS.length}${devuelto ? ', devuelto con observaciones' : ''}`;
 
  return (
    <div className="d-flex align-items-center flex-wrap gap-2" role="img" aria-label={`Estado: ${descripcion}`}>
      <ol className="list-unstyled d-flex align-items-center m-0 p-0" aria-hidden="true">
        {PASOS.map((p, i) => {
          const hecho = i <= actual;
          const esActual = i === actual && !final;
          return (
            <li key={p.estado} className="d-flex align-items-center">
              {i > 0 && (
                <span style={{ width: '1.25rem', height: 2, background: i <= actual ? ACENTO : APAGADO }} />
              )}
              <span className="d-flex align-items-center gap-1 px-1">
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: hecho ? ACENTO : 'transparent',
                    border: `2px solid ${hecho ? ACENTO : APAGADO}`,
                    boxShadow: esActual ? '0 0 0 3px rgba(var(--bs-primary-rgb), .25)' : 'none',
                  }}
                />
                {/* en el celular solo se lee el nombre del paso actual; los demás quedan como puntos */}
                <span className={`small ${esActual ? 'fw-semibold text-body' : `d-none d-sm-inline ${hecho ? 'text-body' : 'text-body-tertiary'}`}`}>
                  {p.texto}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {final && <span className={`badge rounded-pill ${estado === 'rescindido' ? 'text-bg-danger' : 'text-bg-dark'}`}>{final}</span>}
      {devuelto && <span className="small text-warning-emphasis"><i className="bi bi-arrow-return-left me-1" />Devuelto con observaciones</span>}
    </div>
  );
}