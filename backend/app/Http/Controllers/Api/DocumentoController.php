<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Services\ConvenioService;
  use App\Services\DocumentoService;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Storage;
  use OpenApi\Attributes as OA;

  class DocumentoController extends Controller
  {
      public function __construct(
          private ConvenioService $convenios,
          private DocumentoService $documentos,
      ) {}

      #[OA\Post(path: '/api/convenios/{id}/documentos', summary: 'Subir un PDF (borrador; admin o gestor de la unidad)', tags: ['Documentos'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data',
              schema: new OA\Schema(required: ['archivo', 'categoria'], properties: [
                  new OA\Property(property: 'archivo', type: 'string', format: 'binary', description: 'PDF de hasta 20 MB'),
                  new OA\Property(property: 'categoria', type: 'string', example: 'principal', description: 'principal, anexo, dictamen, resolucion u otro'),
              ]))),
          responses: [
              new OA\Response(response: 201, description: 'Documento guardado (versión nueva)'),
              new OA\Response(response: 403, description: 'Sin permiso o el convenio no está en borrador'),
              new OA\Response(response: 422, description: 'No es un PDF, pesa más de 20 MB o falta la categoría'),
          ])]
      public function store(Request $request, int $id)
      {
          $datos = $request->validate([
              'archivo' => ['required', 'file', 'mimes:pdf', 'max:20480'], // en KB = 20 MB
              'categoria' => ['required', 'in:principal,anexo,dictamen,resolucion,otro'],
          ], [
              'archivo.mimes' => 'El archivo tiene que ser un PDF.',
              'archivo.max' => 'El PDF no puede pesar más de 20 MB.',
              'categoria.in' => 'Elegí una categoría válida.',
          ]);
          $convenio = $this->convenios->ver($request->user(), $id);
          $documento = $this->documentos->subir($request->user(), $convenio, $datos['archivo'], $datos['categoria']);

          return response()->json(['data' => $documento], 201);
      }

      #[OA\Get(path: '/api/convenios/{id}/documentos/{documento}', summary: 'Descargar un PDF', tags: ['Documentos'],
          parameters: [
              new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'documento', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
          ],
          responses: [
              new OA\Response(response: 200, description: 'El PDF'),
              new OA\Response(response: 403, description: 'No puede ver el convenio'),
              new OA\Response(response: 404, description: 'No existe'),
          ])]
      public function descargar(Request $request, int $id, int $documento)
      {
          $convenio = $this->convenios->ver($request->user(), $id); // mismo permiso que ver la ficha
          $doc = $convenio->documentos()->findOrFail($documento);

          return Storage::disk('local')->download($doc->ruta, $doc->nombre_original, ['Content-Type' => 'application/pdf']);
      }
  }