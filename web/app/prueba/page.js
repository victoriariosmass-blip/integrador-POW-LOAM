'use client';
import Button from '../ui/atoms/Button';
import Chip from '../ui/atoms/Chip';
import Field from '../ui/molecules/Field';

export default function Prueba() {
  return (
    <main className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="h3 mb-4">Componentes</h1>
      <Field label="Email" type="email" placeholder="nombre@convenios.test" required />
      <Field label="Contraseña" type="password" error="La contraseña es obligatoria" />
      <div className="d-flex gap-2 mb-4">
        <Button>Ingresar</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button loading>Guardando</Button>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {['borrador','en_revision','observado','vigente','por_vencer','vencido'].map(e => <Chip key={e} estado={e} />)}
      </div>
    </main>
  );
}