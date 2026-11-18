// Descarga de PDFs del convenio y página para leerlos con zoom (pdf.js dentro de un WebView).
// GET /api/convenios/{id}/documentos/{documento} necesita el token, por eso se baja primero al celular.
import * as FileSystem from 'expo-file-system/legacy';
import { API_URL, USAR_MOCK } from './config';
import { leerToken } from './almacenamiento';
import { PDF_PRUEBA_BASE64 } from './pdfPrueba';

// Baja el PDF a la memoria temporal del celular. Devuelve { uri, base64 }.
export async function descargarPdf(convenioId, documento, codigo) {
  const nombre = `${codigo ?? 'convenio'}-${documento.categoria ?? 'documento'}-v${documento.numero_version ?? 1}.pdf`.replace(/[^\w.-]/g, '_');
  const destino = `${FileSystem.cacheDirectory}${nombre}`;

  if (USAR_MOCK) {
    await FileSystem.writeAsStringAsync(destino, PDF_PRUEBA_BASE64, { encoding: FileSystem.EncodingType.Base64 });
    return { uri: destino, base64: PDF_PRUEBA_BASE64 };
  }

  const token = await leerToken();
  const r = await FileSystem.downloadAsync(`${API_URL}/api/convenios/${convenioId}/documentos/${documento.id}`, destino, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
  });
  if (r.status !== 200) {
    const error = new Error(r.status === 403 ? 'No tiene permiso para ver este documento.' : 'No se pudo descargar el PDF.');
    error.status = r.status;
    throw error;
  }
  const base64 = await FileSystem.readAsStringAsync(r.uri, { encoding: FileSystem.EncodingType.Base64 });
  return { uri: r.uri, base64 };
}

// Página HTML que dibuja todas las páginas del PDF con pdf.js.
// - Zoom: con dos dedos, o con los botones (la app llama a window.zoom(+1 | -1)).
// - Cuando se llega al final avisa a la app ("fin"), así aparece el botón Firmar.
export function htmlLector(base64, oscuro) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<style>
  body{margin:0;background:${oscuro ? '#12101F' : '#E9E8F2'};font-family:sans-serif}
  #paginas{padding:12px 0}
  canvas{display:block;margin:0 auto 12px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2)}
  #estado{color:${oscuro ? '#F1F0FE' : '#1E1B3A'};text-align:center;padding:24px}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head><body><div id="estado">Cargando el documento…</div><div id="paginas"></div>
<script>
  const avisar = (m) => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(m);
  let pdf = null, zoomActual = 1, avisoFin = false;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  async function dibujar() {
    const cont = document.getElementById('paginas'); cont.innerHTML = '';
    const ancho = (window.innerWidth - 16) * zoomActual, dpr = window.devicePixelRatio || 1;
    for (let n = 1; n <= pdf.numPages; n++) {
      const pagina = await pdf.getPage(n);
      const base = pagina.getViewport({ scale: 1 });
      const vista = pagina.getViewport({ scale: (ancho / base.width) * dpr });
      const c = document.createElement('canvas');
      c.width = vista.width; c.height = vista.height; c.style.width = ancho + 'px';
      c.setAttribute('aria-label', 'Página ' + n + ' de ' + pdf.numPages);
      cont.appendChild(c);
      await pagina.render({ canvasContext: c.getContext('2d'), viewport: vista }).promise;
    }
    revisarFin();
  }
  function revisarFin() {
    if (!avisoFin && window.innerHeight + window.scrollY >= document.body.scrollHeight - 40) { avisoFin = true; avisar('fin'); }
  }
  window.zoom = (paso) => { zoomActual = Math.min(3, Math.max(1, zoomActual + paso * 0.5)); dibujar(); };
  window.addEventListener('scroll', revisarFin);
  try {
    const bytes = Uint8Array.from(atob('${base64}'), (ch) => ch.charCodeAt(0));
    pdfjsLib.getDocument({ data: bytes }).promise.then((d) => {
      pdf = d; document.getElementById('estado').remove(); avisar('paginas:' + d.numPages); dibujar();
    }).catch(() => { document.getElementById('estado').textContent = 'No se pudo abrir el PDF.'; avisar('error'); });
  } catch (e) { document.getElementById('estado').textContent = 'No se pudo abrir el PDF.'; avisar('error'); }
</script></body></html>`;
}