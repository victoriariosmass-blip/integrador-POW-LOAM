<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Services\ComentarioService;
  use App\Services\ConvenioService;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  class ComentarioController extends Controller
  {
      public function __construct(
          private ConvenioService $convenios,
          private ComentarioService $comentarios,
      ) {}

      #[OA\Get(path: '/api/convenios/{id}/comentarios', summary: 'Comentarios del convenio', tags: ['Comentarios'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          responses: [
              new OA\Response(response: 200, description: 'Lista de comentarios (los ofensivos dicen "Comentario ofensivo")'),
              new OA\Response(response: 403, description: 'No puede ver el convenio'),
          ])]
      public function index(Request $request, int $id)
      {
          $convenio = $this->convenios->ver($request->user(), $id);
          return response()->json(['data' => $this->comentarios->listar($request->user(), $convenio)]);
      }

      #[OA\Post(path: '/api/convenios/{id}/comentarios', summary: 'Comentar (todos menos consulta)', tags: ['Comentarios'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['contenido'], properties: [
              new OA\Property(property: 'contenido', type: 'string', example: 'Revisemos la cláusula de rescisión'),
          ])),
          responses: [
              new OA\Response(response: 201, description: 'Comentario creado'),
              new OA\Response(response: 403, description: 'Sin permiso (consulta no comenta)'),
              new OA\Response(response: 422, description: 'Comentario vacío o muy largo'),
          ])]
      public function store(Request $request, int $id)
      {
          $datos = $request->validate(['contenido' => ['required', 'string', 'max:1000']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return response()->json(['data' => $this->comentarios->crear($request->user(), $convenio, $datos['contenido'])], 201);
      }
  }
