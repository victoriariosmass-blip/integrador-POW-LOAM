<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Http\Resources\ConvenioResource;
  use App\Services\ConvenioService;
  use App\Services\EstadoConvenioService;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  // Acciones que cambian el estado de un convenio (circuito de estados)
  class EstadoConvenioController extends Controller
  {
      public function __construct(
          private ConvenioService $convenios,
          private EstadoConvenioService $estados,
      ) {}

      #[OA\Post(path: '/api/convenios/{id}/enviar-revision', summary: 'Enviar a revisión (borrador -> revision)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          responses: [
              new OA\Response(response: 200, description: 'Convenio en revisión'),
              new OA\Response(response: 403, description: 'Sin permiso o estado incorrecto'),
          ])]
      public function enviarRevision(Request $request, int $id)
      {
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->enviarARevision($request->user(), $convenio));
      }

      #[OA\Post(path: '/api/convenios/{id}/aprobar', summary: 'Aprobar (revision -> aprobado)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(properties: [
              new OA\Property(property: 'fundamento', type: 'string', example: 'Cumple con lo requerido'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Convenio aprobado'),
              new OA\Response(response: 403, description: 'Sin permiso o estado incorrecto'),
          ])]
      public function aprobar(Request $request, int $id)
      {
          $datos = $request->validate(['fundamento' => ['nullable', 'string']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->aprobar($request->user(), $convenio, $datos['fundamento'] ?? null));
      }

      #[OA\Post(path: '/api/convenios/{id}/devolver', summary: 'Devolver con observaciones (revision -> borrador)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['observaciones'], properties: [
              new OA\Property(property: 'observaciones', type: 'string', example: 'Falta la resolución del Consejo'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Convenio devuelto a borrador'),
              new OA\Response(response: 403, description: 'Sin permiso o estado incorrecto'),
              new OA\Response(response: 422, description: 'Faltan las observaciones'),
          ])]
      public function devolver(Request $request, int $id)
      {
          $datos = $request->validate(['observaciones' => ['required', 'string']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->devolver($request->user(), $convenio, $datos['observaciones']));
      }

      #[OA\Post(path: '/api/convenios/{id}/rescindir', summary: 'Rescindir (firmado -> rescindido)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['fundamento'], properties: [
              new OA\Property(property: 'fundamento', type: 'string', example: 'Rescisión de común acuerdo'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Convenio rescindido'),
              new OA\Response(response: 403, description: 'Sin permiso o estado incorrecto'),
              new OA\Response(response: 422, description: 'Falta el fundamento'),
          ])]
      public function rescindir(Request $request, int $id)
      {
          $datos = $request->validate(['fundamento' => ['required', 'string']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->rescindir($request->user(), $convenio, $datos['fundamento']));
      }

      #[OA\Post(path: '/api/convenios/{id}/archivar', summary: 'Archivar (firmado o rescindido -> archivado)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(properties: [
              new OA\Property(property: 'fundamento', type: 'string', example: 'Vencido sin renovación'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Convenio archivado'),
              new OA\Response(response: 403, description: 'Sin permiso o estado incorrecto'),
          ])]
      public function archivar(Request $request, int $id)
      {
          $datos = $request->validate(['fundamento' => ['nullable', 'string']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->archivar($request->user(), $convenio, $datos['fundamento'] ?? null));
      }

      #[OA\Post(path: '/api/convenios/{id}/asignar-revisor', summary: 'Asignar revisor (solo admin)', tags: ['Circuito'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['revisor_id'], properties: [
              new OA\Property(property: 'revisor_id', type: 'integer', example: 6),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Revisor asignado'),
              new OA\Response(response: 403, description: 'Sin permiso'),
              new OA\Response(response: 422, description: 'El usuario no es revisor'),
          ])]
      public function asignarRevisor(Request $request, int $id)
      {
          $datos = $request->validate(['revisor_id' => ['required', 'integer']]);
          $convenio = $this->convenios->ver($request->user(), $id);
          return new ConvenioResource($this->estados->asignarRevisor($request->user(), $convenio, $datos['revisor_id']));
      }
  }