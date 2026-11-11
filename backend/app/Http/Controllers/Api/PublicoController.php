<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Http\Resources\ConvenioPublicoResource;
  use App\Models\Convenio;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  // Vista pública del sitio: no pide iniciar sesión.
  // Solo muestra convenios firmados y no confidenciales (Convenio::publicos()).
  class PublicoController extends Controller
  {
      #[OA\Get(path: '/api/publico/convenios', summary: 'Listado público (sin login)', tags: ['Público'],
          parameters: [
              new OA\Parameter(name: 'q', in: 'query', required: false, description: 'Busca en título, código y contraparte', schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'tipo', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
          ],
          responses: [new OA\Response(response: 200, description: 'Convenios firmados y no confidenciales, paginados')])]
      public function index(Request $request)
      {
          $convenios = Convenio::publicos()
              ->with(['unidad:id,nombre', 'partes:id,nombre,tipo'])
              ->when($request->query('tipo'), fn ($q, $v) => $q->where('tipo', $v))
              ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w
                  ->where('titulo', 'like', "%$v%")
                  ->orWhere('codigo', 'like', "%$v%")
                  ->orWhereHas('partes', fn ($p) => $p->where('nombre', 'like', "%$v%"))))
              ->orderByDesc('fecha_firma')
              ->paginate(12);

          return ConvenioPublicoResource::collection($convenios);
      }

      #[OA\Get(path: '/api/publico/convenios/{ref}', summary: 'Detalle público por referencia (la del QR)', tags: ['Público'],
          parameters: [new OA\Parameter(name: 'ref', in: 'path', required: true, description: 'ref_publica (UUID)', schema: new OA\Schema(type: 'string'))],
          responses: [
              new OA\Response(response: 200, description: 'Detalle público'),
              new OA\Response(response: 404, description: 'No existe o no es público'),
          ])]
      public function show(string $ref)
      {
          $convenio = Convenio::publicos()
              ->with(['unidad:id,nombre', 'partes:id,nombre,tipo', 'antecedentes', 'derivados'])
              ->where('ref_publica', $ref)
              ->firstOrFail(); // 404 si no existe, no está firmado o es confidencial

          return new ConvenioPublicoResource($convenio);
      }
  }