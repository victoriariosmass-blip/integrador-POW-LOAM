<?php
  namespace App\Http\Controllers\Api;

  use App\Models\Convenio;
  use App\Http\Controllers\Controller;
  use App\Http\Requests\StoreConvenioRequest;
  use App\Http\Requests\UpdateConvenioRequest;
  use App\Http\Resources\ConvenioResource;
  use App\Services\ConvenioService;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;
  
  class ConvenioController extends Controller
  {
      public function __construct(private ConvenioService $service) {}

      #[OA\Get(path: '/api/convenios', summary: 'Listado de convenios', tags: ['Convenios'],
          parameters: [
              new OA\Parameter(name: 'estado', in: 'query', required: false, description: 'Uno o varios separados por coma: borrador,revision', schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'tipo', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'unidad_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'firma_desde', in: 'query', required: false, description: 'AAAA-MM-DD', schema: new OA\Schema(type: 'string', format: 'date')),
              new OA\Parameter(name: 'firma_hasta', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
              new OA\Parameter(name: 'vence_desde', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
              new OA\Parameter(name: 'vence_hasta', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
              new OA\Parameter(name: 'vigentes', in: 'query', required: false, description: '1 = solo firmados vigentes', schema: new OA\Schema(type: 'boolean')),
          ],
          responses: [
              new OA\Response(response: 200, description: 'Listado paginado'),
              new OA\Response(response: 401, description: 'No autenticado'),
          ])]

      public function index(Request $request)
      {
          $request->validate([
              'unidad_id' => ['nullable', 'integer'],
              'firma_desde' => ['nullable', 'date'],
              'firma_hasta' => ['nullable', 'date'],
              'vence_desde' => ['nullable', 'date'],
              'vence_hasta' => ['nullable', 'date'],
              'vigentes' => ['nullable', 'boolean'],
          ], [
              'unidad_id.integer' => 'La unidad no es válida.',
              '*.date' => 'La fecha no es válida (formato AAAA-MM-DD).',
              'vigentes.boolean' => 'vigentes tiene que ser 1 o 0.',
          ]);
          $convenios = $this->service->listar($request->user(), $request->only(
              'estado', 'tipo', 'q', 'unidad_id', 'firma_desde', 'firma_hasta', 'vence_desde', 'vence_hasta', 'vigentes'
          ));
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

      #[OA\Get(path: '/api/convenios/ref/{ref}', summary: 'Ficha por la referencia del QR (con sesión)', tags: ['Convenios'],
          parameters: [new OA\Parameter(name: 'ref', in: 'path', required: true, description: 'ref_publica (UUID)', schema: new OA\Schema(type: 'string'))],
          responses: [
              new OA\Response(response: 200, description: 'Ficha'),
              new OA\Response(response: 403, description: 'El usuario no puede ver ese convenio'),
              new OA\Response(response: 404, description: 'No hay convenio con esa referencia'),
          ])]
      public function porReferencia(Request $request, string $ref)
      {
          // El QR solo lleva el UUID; la ficha se abre si el usuario tiene permiso (también confidenciales)
          $id = Convenio::where('ref_publica', $ref)->value('id') ?? abort(404, 'Ese código QR no corresponde a ningún convenio.');
          return new ConvenioResource($this->service->ver($request->user(), $id));
      }

      #[OA\Post(path: '/api/convenios', summary: 'Alta de convenio', tags: ['Convenios'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['titulo', 'tipo', 'objeto'],
              properties: [
                  new OA\Property(property: 'titulo', type: 'string', example: 'Convenio de prueba'),
                  new OA\Property(property: 'tipo', type: 'string', example: 'marco_colaboracion'),
                  new OA\Property(property: 'objeto', type: 'string', example: 'Colaboración académica'),
                  new OA\Property(property: 'unidad_id', type: 'integer', example: 1),
                  new OA\Property(property: 'fecha_firma', type: 'string', format: 'date'),
                  new OA\Property(property: 'fecha_vencimiento', type: 'string', format: 'date'),
              ])),
          responses: [
              new OA\Response(response: 201, description: 'Creado en borrador'),
              new OA\Response(response: 403, description: 'Tu rol no puede cargar convenios'),
              new OA\Response(response: 422, description: 'Datos inválidos'),
          ])]
      public function store(StoreConvenioRequest $request)
      {
          $convenio = $this->service->crear($request->user(), $request->validated());
          return (new ConvenioResource($convenio))->response()->setStatusCode(201);
      }

      #[OA\Put(path: '/api/convenios/{id}', summary: 'Editar borrador', tags: ['Convenios'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['version'],
              properties: [
                  new OA\Property(property: 'version', type: 'integer', example: 1, description: 'La que tenía el convenio al abrirlo'),
                  new OA\Property(property: 'titulo', type: 'string', example: 'Convenio editado'),
                  new OA\Property(property: 'objeto', type: 'string', example: 'Nuevo objeto'),
              ])),
          responses: [
              new OA\Response(response: 200, description: 'Convenio editado'),
              new OA\Response(response: 403, description: 'Sin permiso o no está en borrador'),
              new OA\Response(response: 409, description: 'Otro usuario lo cambió mientras se editaba'),
              new OA\Response(response: 422, description: 'Datos inválidos'),
          ])]
      public function update(UpdateConvenioRequest $request, int $id)
      {
          return new ConvenioResource($this->service->editar($request->user(), $id, $request->validated()));
      }
  }