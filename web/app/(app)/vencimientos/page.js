'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listarTodos } from '../../lib/listados';
import { fecha, diasHasta, textoDias } from '../../lib/formato';
import Chip from '../../ui/atoms/Chip';
 
const HORIZONTES = [30, 60, 90, 180, 365];
const PREAVISO_SIN_DATO = 30;
 
// Convenios firmados que vencen en los próximos N días (y los ya vencidos que
// siguen figurando como firmados). Marca los que están dentro del preaviso.
export default function Vencimientos() {
  const [firmados, setFirmados] = useState(null);
  const [error, setError] = useState('');
  const [horizonte, setHorizonte] = useState(90);
  const [verVencidos, setVerVencidos] = useState(true);
 
  useEffect(() => {
    listarTodos({ estado: 'firmado' })
      .then(setFirmados)
      .catch((e) => setError(e.message || 'No se pudieron cargar los vencimientos'));
  }, []);
 
  const filas = useMemo(() => (firmados ?? [])
    .map((c) => ({ ...c, dias: diasHasta(c.fecha_vencimiento) }))
    .filter((c) => c.dias !== null && c.dias <= horizonte && (verVencidos || c.dias >= 0))
    .sort((a, b) => a.dias - b.dias), [firmados, horizonte, verVencidos]);
 
  const sinVencimiento = (firmados ?? []).filter((c) => !c.fecha_vencimiento).length;
 
  function estadoFila(c) {
    if (c.dias < 0) return { chip: 'vencido', texto: 'Vencido' };
    if (c.dias <= (c.dias_preaviso ?? PREAVISO_SIN_DATO)) return { chip: 'por_vencer', texto: 'En preaviso' };
    return { chip: 'vigente', texto: 'Vigente' };
  }
 
  return (
    <>
      <h1 className="h4 mb-1">Vencimientos</h1>
      <p className="text-body-secondary mb-4">Convenios firmados ordenados por fecha de vencimiento.</p>
 
      <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <label htmlFor="horizonte" className="form-label small fw-semibold">Vencen en los próximos</label>
          <select id="horizonte" className="form-select" value={horizonte} onChange={(e) => setHorizonte(Number(e.target.value))}>
            {HORIZONTES.map((d) => <option key={d} value={d}>{d} días</option>)}
          </select>
        </div>
        <div className="form-check mb-2">
          <input id="ver-vencidos" type="checkbox" className="form-check-input" checked={verVencidos}
            onChange={(e) => setVerVencidos(e.target.checked)} />
          <label htmlFor="ver-vencidos" className="form-check-label">Mostrar también los ya vencidos</label>
        </div>
      </div>
 
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
 
      {firmados === null && !error && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-secondary" aria-hidden="true" />
          <p className="text-body-secondary mt-2 mb-0">Cargando vencimientos…</p>
        </div>
      )}
 
      {firmados && (
        <>
          <p className="small text-body-secondary" aria-live="polite">
            {filas.length === 1 ? '1 convenio' : `${filas.length} convenios`}
            {sinVencimiento === 1 && ' · 1 firmado no tiene fecha de vencimiento'}
            {sinVencimiento > 1 && ` · ${sinVencimiento} firmados no tienen fecha de vencimiento`}
          </p>
 
          {filas.length === 0 ? (
            <p className="text-center py-5 text-body-secondary">Ningún convenio vence en ese plazo.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">Convenio</th>
                    <th scope="col" className="d-none d-md-table-cell">Unidad</th>
                    <th scope="col">Vence</th>
                    <th scope="col" className="d-none d-sm-table-cell">Preaviso</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((c) => {
                    const e = estadoFila(c);
                    return (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/convenios/${c.id}`} className="fw-semibold">{c.codigo}</Link>
                          <div className="small">{c.titulo}</div>
                        </td>
                        <td className="d-none d-md-table-cell small">{c.unidad?.nombre}</td>
                        <td>
                          {fecha(c.fecha_vencimiento)}
                          <div className="small text-body-secondary">{textoDias(c.dias)}</div>
                        </td>
                        <td className="d-none d-sm-table-cell small">{c.dias_preaviso ? `${c.dias_preaviso} días` : '—'}</td>
                        <td><Chip estado={e.chip}>{e.texto}</Chip></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}