'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsuario } from '../../lib/UsuarioContext';
import { calcularAlertas } from '../../lib/alertas';
import { fecha, textoDias } from '../../lib/formato';
 
const NIVELES = {
  // fondo: el color de la categoría con muy poca opacidad (10 %); el ícono del título, el color pleno
  alta: { titulo: 'Requieren atención', icono: 'bi-exclamation-octagon text-danger', fondo: 'bg-danger bg-opacity-10' },
  media: { titulo: 'Próximos a vencer', icono: 'bi-hourglass-split text-warning', fondo: 'bg-warning bg-opacity-10' },
  info: { titulo: 'Pendientes del circuito', icono: 'bi-info-circle text-info', fondo: 'bg-info bg-opacity-10' },
};
 
export default function Alertas() {
  const usuario = useUsuario();
  const [alertas, setAlertas] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    calcularAlertas(usuario)
      .then(setAlertas)
      .catch((e) => setError(e.message || 'No se pudieron cargar las alertas'));
  }, [usuario]);
 
  return (
    <>
      <h1 className="h4 mb-1">Alertas</h1>
      <p className="text-body-secondary mb-4">Lo que necesita atención en los convenios que podés ver.</p>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {alertas === null && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Buscando alertas…</p>
        </div>
      )}
 
      {alertas?.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-check2-circle fs-1 text-success" aria-hidden="true" />
          <p className="mt-2 mb-0">No hay alertas. Todo al día.</p>
        </div>
      )}
 
      {alertas?.length > 0 && Object.entries(NIVELES).map(([nivel, n]) => {
        const lista = alertas.filter((a) => a.nivel === nivel);
        if (lista.length === 0) return null;
        return (
          <section key={nivel} className="mb-4">
            <h2 className="h6 fw-bold mb-2">
              <i className={`bi ${n.icono} me-2`} aria-hidden="true" />{n.titulo} ({lista.length})
            </h2>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {lista.map((a) => (
                <li key={a.id} className={`card ${n.fondo}`}>
                  <div className="card-body py-2">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Link href={`/convenios/${a.convenio.id}`} className="fw-semibold">{a.convenio.codigo}</Link>
                      <span className="fw-semibold">{a.titulo}</span>
                      {a.dias !== null && (
                        <span className="small text-body-secondary ms-auto">
                          Vence el {fecha(a.convenio.fecha_vencimiento)} ({textoDias(a.dias)})
                        </span>
                      )}
                    </div>
                    <p className="small mb-0">{a.convenio.titulo}</p>
                    <p className="small text-body-secondary mb-0">{a.detalle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}