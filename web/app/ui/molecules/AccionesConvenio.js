 import Button from '../atoms/Button';
 
// botones de la ficha segun lo que la API dice que el usuario puede hacer (convenio.permisos)
export default function AccionesConvenio({ convenio }) {
  const p = convenio.permisos ?? {};
 
  return (
    <div className="d-flex flex-wrap gap-2">
      {p.editar && <Button variant="secondary">Editar</Button>}
      {p.enviar_revision && <Button>Enviar a revisión</Button>}
      {p.revisar && <Button>Aprobar</Button>}
      {p.revisar && <Button variant="secondary">Devolver con observaciones</Button>}
      {p.rescindir && <Button variant="danger">Rescindir</Button>}
      {p.archivar && <Button variant="secondary">Archivar</Button>}
      {p.firmar && (
        <p className="alert alert-info mb-0 w-100">
          <i className="bi bi-phone me-2" aria-hidden="true" />Este convenio espera tu firma. Se firma desde la app.
        </p>
      )}
    </div>
  );
}