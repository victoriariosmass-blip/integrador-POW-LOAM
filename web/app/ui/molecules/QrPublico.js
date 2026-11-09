 'use client';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
 
// QR que lleva a la página pública del convenio (/publico/[ref]).
// Solo para firmados y no confidenciales: los demás no tienen página pública.
// La app lo escanea para abrir la ficha.
export default function QrPublico({ convenio }) {
  if (convenio.estado !== 'firmado' || convenio.confidencial || !convenio.ref_publica) return null;
 
  const ruta = `/publico/${convenio.ref_publica}`;
  const url = `${window.location.origin}${ruta}`;
 
  return (
    <section className="card">
      <div className="card-body text-center">
        <h2 className="h6 fw-bold mb-3 text-start">Código QR</h2>
        <QRCodeSVG value={url} size={160} marginSize={2} title={`QR de la página pública de ${convenio.codigo}`} />
        <p className="small text-body-secondary mt-2 mb-1">Lleva a la página pública del convenio.</p>
        <Link href={ruta} className="small" target="_blank">Ver página pública</Link>
      </div>
    </section>
  );
}