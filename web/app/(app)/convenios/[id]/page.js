'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { verConvenio, accionConvenio } from '../../../lib/convenios';
import { TIPOS, ESTADOS, fecha, fechaHora } from '../../../lib/formato';
import Chip from '../../../ui/atoms/Chip';
import AccionesConvenio from '../../../ui/molecules/AccionesConvenio';
import QrPublico from '../../../ui/molecules/QrPublico';
import DocumentosConvenio from '../../../ui/organisms/DocumentosConvenio';
import ComentariosConvenio from '../../../ui/organisms/ComentariosConvenio';
import PartesConvenio from '../../../ui/organisms/PartesConvenio';
import PersonasConvenio from '../../../ui/organisms/PersonasConvenio';
import VinculosConvenio from '../../../ui/organisms/VinculosConvenio';
import ObservacionesConvenio from '../../../ui/organisms/ObservacionesConvenio';
 
const MENSAJES = {
  'enviar-revision': 'El convenio se envió a revisión.',
  aprobar: 'El convenio quedó aprobado.',
  devolver: 'El convenio volvió a borrador con sus observaciones.',
  rescindir: 'El convenio quedó rescindido.',
  archivar: 'El convenio quedó archivado.',
};
 
// Texto largo de la ficha (alcance, obligaciones...): ocupa todo el ancho y respeta los saltos de línea
function DatoLargo({ etiqueta, children }) {
  return (
    <div className="col-12">
      <dt className="small text-body-secondary fw-normal">{etiqueta}</dt>
      <dd className="mb-0" style={{ whiteSpace: 'pre-line' }}>{children || '—'}</dd>
    </div>
  );
}
 
function Dato({ etiqueta, children }) {
  return (
    <div className="col-12 col-md-6">
      <dt className="small text-body-secondary fw-normal">{etiqueta}</dt>
      <dd className="mb-0">{children || '—'}</dd>
    </div>
  );
}
 
export default function FichaConvenio() {
  const { id } = useParams();
  const [convenio, setConvenio] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [procesando, setProcesando] = useState(false);
 
  const cargar = useCallback(() => {
    setError(null);
    verConvenio(id)
      .then((r) => setConvenio(r.data))
      .catch((e) => setError(e));
  }, [id]);
 
  useEffect(() => { cargar(); }, [cargar]);
 
  // Después de cargar partes, personas, vínculos u observaciones: se recarga la ficha
  // y se borra el error de la última acción (por ejemplo, "necesita al menos dos partes")
  const refrescar = () => {
    setErrorAccion('');
    cargar();
  };
 
  // aviso al volver del alta o de la edición (?creado=1 / ?editado=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('creado')) setAviso('El convenio se guardó como borrador.');
    if (params.has('editado')) setAviso('Los cambios se guardaron.');
  }, []);
 
  async function hacer(accion, datos) {
    setProcesando(true);
    setAviso('');
    setErrorAccion('');
    try {
      await accionConvenio(id, accion, datos);
      const r = await verConvenio(id); // trae el estado, el historial y los permisos nuevos
      setConvenio(r.data);
      setAviso(MENSAJES[accion]);
    } catch (e) {
      setErrorAccion(e.message || 'No se pudo completar la acción');
      throw e;
    } finally {
      setProcesando(false);
    }
  }
 
  if (error) {
    const texto = error.status === 403 ? 'No tiene permiso para ver este convenio.'
      : error.status === 404 ? 'El convenio no existe.' : (error.message || 'No se pudo cargar el convenio.');
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-circle fs-1 text-secondary" aria-hidden="true" />
        <p className="mt-2">{texto}</p>
        <Link href="/convenios" className="btn btn-outline-secondary">Volver al listado</Link>
      </div>
    );
  }
 
  if (!convenio) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-secondary" aria-hidden="true" />
        <p className="text-body-secondary mt-2 mb-0">Cargando convenio…</p>
      </div>
    );
  }
 
  const c = convenio;
 
  return (
    <>
      <nav aria-label="Ruta" className="mb-2">
        <Link href="/convenios" className="small"><i className="bi bi-arrow-left me-1" aria-hidden="true" />Convenios</Link>
      </nav>
 
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <h1 className="h4 mb-0">{c.codigo}</h1>
        <Chip estado={c.estado} />
        {c.confidencial && <span className="badge text-bg-dark">Confidencial</span>}
      </div>
      <p className="lead mb-3">{c.titulo}</p>
 
      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
      {errorAccion && <div className="alert alert-danger" role="alert">{errorAccion}</div>}
 
      <div className="mb-4">
        <AccionesConvenio convenio={c} onAccion={hacer} cargando={procesando} />
      </div>
 
      <div className="row g-4">
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Datos del convenio</h2>
              <dl className="row g-3 mb-0">
                <Dato etiqueta="Tipo">{TIPOS[c.tipo] ?? c.tipo}</Dato>
                <Dato etiqueta="Unidad">{c.unidad?.nombre}</Dato>
                <Dato etiqueta="Fecha de firma">{fecha(c.fecha_firma)}</Dato>
                <Dato etiqueta="Fecha de inicio">{fecha(c.fecha_inicio)}</Dato>
                <Dato etiqueta="Vencimiento">{fecha(c.fecha_vencimiento) ?? 'Sin vencimiento registrado'}</Dato>
                <Dato etiqueta="Preaviso">{c.dias_preaviso != null ? `${c.dias_preaviso} días antes del vencimiento` : null}</Dato>
                <Dato etiqueta="Resolución">{c.resolucion}</Dato>
                <Dato etiqueta="Expediente">{c.expediente}</Dato>
                <DatoLargo etiqueta="Objeto">{c.objeto}</DatoLargo>
              </dl>
            </div>
          </section>
 
          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Contenido y condiciones</h2>
              <dl className="row g-3 mb-0">
                <DatoLargo etiqueta="Alcance">{c.alcance}</DatoLargo>
                <DatoLargo etiqueta="Obligaciones de las partes">{c.obligaciones}</DatoLargo>
                <DatoLargo etiqueta="Condiciones de rescisión">{c.condiciones_rescision}</DatoLargo>
                <DatoLargo etiqueta="Marco legal">{c.marco_legal}</DatoLargo>
                <DatoLargo etiqueta="Condiciones de renovación">
                  {[c.renovacion_automatica ? 'Se renueva automáticamente al vencer.' : null, c.condiciones_renovacion].filter(Boolean).join(' ')}
                </DatoLargo>
                {c.notas && <DatoLargo etiqueta="Notas internas">{c.notas}</DatoLargo>}
              </dl>
            </div>
          </section>
 
          <PartesConvenio convenio={c} puedeEditar={c.permisos?.editar} onCambio={refrescar} />
          <PersonasConvenio convenio={c} puedeEditar={c.permisos?.editar} onCambio={refrescar} />
          <DocumentosConvenio convenio={c} onSubido={cargar} />
          <ComentariosConvenio convenioId={c.id} puedeComentar={c.permisos?.comentar} />
        </div>
 
        <aside className="col-12 col-lg-4 d-flex flex-column gap-4">
          <QrPublico convenio={c} />

          {/* Firma registrada desde la app (no es firma digital): quién, cuándo y dónde */}
          {c.firmas?.length > 0 && (
            <section className="card">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Firmas</h2>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {c.firmas.map((f) => (
                    <li key={f.id}>
                      <p className="mb-1 fw-semibold">{f.usuario?.name ?? 'Usuario'}</p>
                      <p className="small mb-1">{fechaHora(f.firmado_en)}</p>
                      <p className="small text-body-secondary mb-0">
                        {f.latitud != null && f.longitud != null
                          ? `Lat. ${Number(f.latitud).toFixed(6)} · Long. ${Number(f.longitud).toFixed(6)}`
                          : 'Sin ubicación registrada'}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          <ObservacionesConvenio convenio={c} puedeResponder={c.permisos?.editar} onCambio={refrescar} />
          <VinculosConvenio convenio={c} puedeEditar={c.permisos?.editar} onCambio={refrescar} />
 
          <section className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Historial</h2>
              {(c.transiciones ?? []).length === 0 ? (
                <p className="small text-body-secondary mb-0">Todavía no hay cambios de estado.</p>
              ) : (
                <ol className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {[...c.transiciones].reverse().map((t) => (
                    <li key={t.id}>
                      <p className="mb-1 fw-semibold">{ESTADOS[t.estado_hasta] ?? t.estado_hasta}</p>
                      <p className="small mb-1">{t.fundamento}</p>
                      <p className="small text-body-secondary mb-0">{t.usuario?.name} · {fecha(t.created_at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}