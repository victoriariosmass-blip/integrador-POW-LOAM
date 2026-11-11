'use client';
import { useState } from 'react';
import Button from '../atoms/Button';
import { subirDocumento, descargarDocumento } from '../../lib/convenios';
import { fecha } from '../../lib/formato';
 
const CATEGORIAS = {
  principal: 'Convenio (texto principal)',
  anexo: 'Anexo',
  dictamen: 'Dictamen',
  resolucion: 'Resolución',
  otro: 'Otro',
};
const MAXIMO_MB = 20;
 
const tamanio = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
 
// PDF del convenio. Nunca se borran: subir otro de la misma categoría crea una versión nueva.
// Se pueden subir mientras el convenio está en borrador (permisos.editar).
export default function DocumentosConvenio({ convenio, onSubido }) {
  const [archivo, setArchivo] = useState(null);
  const [categoria, setCategoria] = useState('principal');
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [inputKey, setInputKey] = useState(0); // para vaciar el input de archivo
 
  async function subir(ev) {
    ev.preventDefault();
    setError('');
    if (!archivo) return setError('Elegí un archivo PDF.');
    if (!archivo.name.toLowerCase().endsWith('.pdf')) return setError('El archivo tiene que ser un PDF.');
    if (archivo.size > MAXIMO_MB * 1024 * 1024) return setError(`El PDF no puede pesar más de ${MAXIMO_MB} MB.`);
 
    setSubiendo(true);
    try {
      await subirDocumento(convenio.id, archivo, categoria);
      setArchivo(null);
      setInputKey((k) => k + 1);
      onSubido(); // la ficha se recarga con el documento nuevo
    } catch (e) {
      setError(e.errors?.archivo?.[0] ?? e.errors?.categoria?.[0] ?? e.message ?? 'No se pudo subir el PDF');
    } finally {
      setSubiendo(false);
    }
  }
 
  // Se pide el PDF a la API (con la sesión) y se abre en otra pestaña
  async function descargar(doc) {
    setError('');
    try {
      const blob = await descargarDocumento(convenio.id, doc.id);
      const url = URL.createObjectURL(blob);
      // si el navegador bloquea la pestaña nueva, se descarga con su nombre
      if (!window.open(url, '_blank')) {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = doc.nombre_original;
        enlace.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000); // libera la memoria después de abrirlo
    } catch (e) {
      setError(e.message || 'No se pudo descargar el PDF');
    }
  }
 
  const documentos = convenio.documentos ?? [];
 
  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h6 fw-bold mb-3">Documentos</h2>
 
        {documentos.length === 0 ? (
          <p className="small text-body-secondary">Todavía no hay documentos cargados.</p>
        ) : (
          <ul className="list-group list-group-flush mb-3">
            {documentos.map((d) => (
              <li key={d.id} className="list-group-item px-0 d-flex flex-wrap align-items-center gap-2">
                <i className="bi bi-file-earmark-pdf text-danger fs-5" aria-hidden="true" />
                <div className="me-auto">
                  <p className="mb-0">{d.nombre_original}</p>
                  <p className="small text-body-secondary mb-0">
                    {CATEGORIAS[d.categoria] ?? d.categoria} · versión {d.numero_version} · {tamanio(d.tamano_bytes)} · {fecha(d.created_at)}
                  </p>
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => descargar(d)}>
                  <i className="bi bi-download me-1" aria-hidden="true" />Ver PDF
                </button>
              </li>
            ))}
          </ul>
        )}
 
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
 
        {convenio.permisos?.editar && (
          <form onSubmit={subir} className="row g-2 align-items-end">
            <div className="col-12 col-md-5">
              <label htmlFor="doc-archivo" className="form-label small fw-semibold">Archivo PDF (hasta {MAXIMO_MB} MB)</label>
              <input key={inputKey} id="doc-archivo" type="file" accept="application/pdf,.pdf" className="form-control"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="doc-categoria" className="form-label small fw-semibold">Categoría</label>
              <select id="doc-categoria" className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {Object.entries(CATEGORIAS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <Button type="submit" loading={subiendo} className="w-100">Subir PDF</Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}