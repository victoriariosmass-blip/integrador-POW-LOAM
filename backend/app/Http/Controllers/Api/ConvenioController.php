<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Http\Requests\StoreConvenioRequest;
  use App\Http\Resources\ConvenioResource;
  use App\Services\ConvenioService;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  class ConvenioController extends Controller
  {
      public function __construct(private ConvenioService $service) {}

      #[OA\Get(path: '/api/convenios', summary: 'Listado de convenios', tags: ['Convenios'],
          parameters: [
              new OA\Parameter(name: 'estado', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'tipo', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
          ],
          responses: [
              new OA\Response(response: 200, description: 'Listado paginado'),
              new OA\Response(response: 401, description: 'No autenticado'),
          ])]
      public function index(Request $request)
      {
          $convenios = $this->service->listar($request->user(), $request->only('estado', 'tipo', 'q'));
          return ConvenioResource::collection($convenios);
      }

      #[OA\Get(path: '/api/convenios/{id}', summary: 'Ficha de un convenio', tags: ['Convenios'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          responses: [
              new OA\Response(response: 200, description: 'Ficha'),
              new OA\Response(response: 403, description: 'Sin permiso'),
              new OA\Response(response: 404, description: 'No existe'),
          ])]
      public function show(Request $request, int $id)
      {
          return new ConvenioResource($this->service->ver($request->user(), $id));
      }

      #[OA\Post(path: '/api/convenios', summary: 'Alta de convenio', tags: ['Convenios'],
          responses: [
              new OA\Response(response: 201, description: 'Creado en borrador'),
              new OA\Response(response: 422, description: 'Datos inválidos'),
          ])]
      public function store(StoreConvenioRequest $request)
      {
          $convenio = $this->service->crear($request->user(), $request->validated());
          return (new ConvenioResource($convenio))->response()->setStatusCode(201);
      }
  }