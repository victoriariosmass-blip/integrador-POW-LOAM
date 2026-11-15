'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Chip from '../atoms/Chip';
import Button from '../atoms/Button';
import { listarConvenios, agregarVinculo, quitarVinculo } from '../../lib/convenios';
 
// Convenios relacionados (árbol) y, en borrador, cargar de qué depende este convenio.
// Enunciado: "vincular un específico con uno o más marcos compatibles; vincular una adenda con el
// instrumento que modifica; y relacionar renovaciones o sustituciones con sus antecedentes."
const TIPO_VINCULO = {
  especifico_de: 'Específico de',
  adenda_de: 'Adenda de',
  renueva_a: 'Renueva a',
  sustituye_a: 'Sustituye a',
};
 
// Qué vínculo tiene sentido según el tipo de convenio (la API vuelve a controlar la compatibilidad)
function opcionesPara(tipo) {
  if (tipo === 'adenda') return ['adenda_de'];
  if (tipo === 'especifico_colaboracion' || tipo === 'especifico_pasantia') return ['especifico_de', 'renueva_a', 'sustituye_a'];
  return ['renueva_a', 'sustituye_a'];
}
 
export default function VinculosConvenio({ convenio, puedeEditar, onCambio }) {
  const antecedentes = convenio.antecedentes ?? [];
  const derivados = convenio.derivados ?? [];
  const opciones = opcionesPara(convenio.tipo);
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState(opciones[0]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [destino, setDestino] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
 
  // Busca convenios por código o título para elegir el antecedente
  useEffect(() => {
    if (!abierto) return undefined;
    const t = setTimeout(() => {
      listarConvenios({ q: busqueda.trim() })
        .then((r) => setResultados(r.data.filter((c) => c.id !== convenio.id)))
        .catch(() => setResultados([]));
    }, 300);
    return () => clearTimeout(t);
  }, [abierto, busqueda, convenio.id]);
 
  async function guardar(ev) {
    ev.preventDefault();
    setError('');
    if (!destino) {
      setError('Elegí el convenio antecedente.');
      return;
    }
    setGuardando(true);
    try {
      await agregarVinculo(convenio.id, { destino_id: Number(destino), tipo });
      setAbierto(false);
      setDestino('');
      setBusqueda('');
      onCambio();
    } catch (e) {
      setError(e.errors?.destino_id?.[0] ?? e.message ?? 'No se pudo crear el vínculo.');
    } finally {
      setGuardando(false);
    }
  }
 
  async function quitar(c) {
    if (!window.confirm(`¿Quitar el vínculo con ${c.codigo}?`)) return;
    setError('');
    try {
      await quitarVinculo(convenio.id, c.pivot.id);
      onCambio();
    } catch (e) {
      setError(e.message || 'No se pudo quitar el vínculo.');
    }
  }
 
  if (!puedeEditar && antecedentes.length === 0 && derivados.length === 0) return null;
 
  const fila = (c, quitable) => (
    <div className="d-flex align-items-start gap-2">
      <div className="flex-grow-1">
        <Link href={`/convenios/${c.id}`} className="fw-semibold">{c.codigo}</Link>{' '}
        <Chip estado={c.estado} />
        <p className="small mb-0">{c.titulo}</p>
      </div>
      {quitable && (
        <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => quitar(c)}
          aria-label={`Quitar el vínculo con ${c.codigo}`}>Quitar</button>
      )}
    </div>
  );
 
  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">Convenios relacionados</h2>
 
        {antecedentes.length > 0 && (
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {antecedentes.map((c) => (
              <li key={`a-${c.id}-${c.pivot?.tipo}`}>
                <p className="small text-body-secondary mb-1">{TIPO_VINCULO[c.pivot?.tipo] ?? 'Relacionado con'}:</p>
                {fila(c, puedeEditar)}
              </li>
            ))}
          </ul>
        )}
        {derivados.length > 0 && (
          <>
            <p className={`small text-body-secondary mb-2 ${antecedentes.length ? 'mt-3' : ''}`}>Dependen de este convenio:</p>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {derivados.map((c) => <li key={`d-${c.id}-${c.pivot?.tipo}`}>{fila(c, false)}</li>)}
            </ul>
          </>
        )}
        {antecedentes.length === 0 && derivados.length === 0 && (
          <p className="small text-body-secondary mb-0">No tiene convenios relacionados.</p>
        )}
 
        {error && <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">{error}</div>}
 
        {puedeEditar && !abierto && (
          <button type="button" className="btn btn-sm btn-outline-primary mt-3" onClick={() => setAbierto(true)}>
            <i className="bi bi-link-45deg me-1" aria-hidden="true" />Vincular con un antecedente
          </button>
        )}
 
        {abierto && (
          <form onSubmit={guardar} className="border-top mt-3 pt-3">
            <label htmlFor="vin-tipo" className="form-label small fw-semibold">Este convenio…</label>
            <select id="vin-tipo" className="form-select mb-2" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {opciones.map((o) => <option key={o} value={o}>{TIPO_VINCULO[o].toLowerCase()}…</option>)}
            </select>
            <label htmlFor="vin-buscar" className="form-label small fw-semibold">Buscar el antecedente</label>
            <input id="vin-buscar" className="form-control mb-2" placeholder="Código o título" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} />
            <select id="vin-destino" aria-label="Convenio antecedente" className="form-select mb-3" value={destino}
              onChange={(e) => setDestino(e.target.value)}>
              <option value="">Elegí el convenio…</option>
              {resultados.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.titulo}</option>)}
            </select>
            <div className="d-flex gap-2">
              <Button type="submit" loading={guardando}>Vincular</Button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setAbierto(false); setError(''); }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}