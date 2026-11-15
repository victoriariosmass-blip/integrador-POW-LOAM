<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\Comentario;
  use App\Models\Convenio;
  use App\Models\ConvenioPersona;
  use App\Models\Parte;
  use App\Models\Persona;
  use App\Models\VinculoConvenio;
  use App\Services\ConvenioService;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\DB;
  use Illuminate\Support\Facades\Gate;
  use OpenApi\Attributes as OA;

  /**
   * Datos de la ficha que van en otras tablas:
   * - Partes y representantes (convenio_parte). Enunciado: "registrar las instituciones firmantes,
   *   incluida la UNLPam o la unidad académica que corresponda, y los datos de sus representantes".
   * - Personas vinculadas y datos de pasantía (convenio_persona + datos_pasantia).
   * - Vínculos entre convenios (vinculos_convenio): específico de un marco, adenda, renovación, sustitución.
   * - Respuesta del gestor a las observaciones de revisión (comentarios tipo observacion).
   * Cargar o quitar datos sigue la misma regla que editar el convenio: gestor o admin de la unidad,
   * y el convenio en borrador (ConvenioPolicy::update).
   */
  class DatosConvenioController extends Controller
  {
      public function __construct(private ConvenioService $convenios) {}

      // Busca el convenio (403 si no lo puede ver) y controla que lo pueda editar (403 si no)
      private function editable(Request $request, int $id): Convenio
      {
          $convenio = $this->convenios->ver($request->user(), $id);
          Gate::forUser($request->user())->authorize('update', $convenio);
          return $convenio;
      }

      // ---------------------------------------------------------------- partes

      #[OA\Get(path: '/api/partes', summary: 'Buscar instituciones ya cargadas (para no repetirlas)', tags: ['Partes'],
          parameters: [new OA\Parameter(name: 'q', in: 'query', schema: new OA\Schema(type: 'string'), description: 'Nombre o CUIT')],
          responses: [new OA\Response(response: 200, description: 'Hasta 20 instituciones')])]
      public function buscarPartes(Request $request)
      {
          $q = trim((string) $request->query('q', ''));
          $partes = Parte::query()
              ->when($q !== '', fn ($w) => $w->where('nombre', 'like', "%$q%")->orWhere('cuit', 'like', "%$q%"))
              ->orderBy('nombre')->limit(20)->get(['id', 'nombre', 'tipo', 'cuit']);
          return response()->json(['data' => $partes]);
      }

      #[OA\Post(path: '/api/convenios/{id}/partes', summary: 'Agregar una parte firmante con su representante', tags: ['Partes'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['representante_nombre'], properties: [
              new OA\Property(property: 'parte_id', type: 'integer', description: 'Institución existente (o mandar "parte" para crearla)'),
              new OA\Property(property: 'parte', type: 'object', properties: [
                  new OA\Property(property: 'nombre', type: 'string', example: 'Agroindustrias del Oeste S.A.'),
                  new OA\Property(property: 'tipo', type: 'string', example: 'empresa'),
                  new OA\Property(property: 'cuit', type: 'string', example: '30-12345678-9'),
              ]),
              new OA\Property(property: 'representante_nombre', type: 'string', example: 'María López'),
              new OA\Property(property: 'representante_cargo', type: 'string', example: 'Gerenta general'),
              new OA\Property(property: 'es_firmante', type: 'boolean', example: true),
              new OA\Property(property: 'firmo_en', type: 'string', format: 'date', example: '2026-11-10'),
          ])),
          responses: [
              new OA\Response(response: 201, description: 'Parte agregada'),
              new OA\Response(response: 403, description: 'Sin permiso o el convenio no está en borrador'),
              new OA\Response(response: 422, description: 'Datos inválidos o la parte ya está en el convenio'),
          ])]
      public function agregarParte(Request $request, int $id)
      {
          $convenio = $this->editable($request, $id);
          $datos = $request->validate([
              'parte_id' => ['nullable', 'required_without:parte', 'exists:partes,id'],
              'parte' => ['nullable', 'required_without:parte_id', 'array'],
              'parte.nombre' => ['required_with:parte', 'string', 'max:200'],
              'parte.tipo' => ['required_with:parte', 'in:universidad,unidad_academica,empresa,organismo_publico,ong,otro'],
              'parte.cuit' => ['nullable', 'string', 'max:13', 'unique:partes,cuit'],
              'parte.domicilio' => ['nullable', 'string', 'max:255'],
              'parte.email' => ['nullable', 'email'],
              'parte.telefono' => ['nullable', 'string', 'max:30'],
              'representante_nombre' => ['required', 'string', 'max:150'],
              'representante_cargo' => ['nullable', 'string', 'max:150'],
              'es_firmante' => ['boolean'],
              'firmo_en' => ['nullable', 'date'],
          ], [
              'parte_id.required_without' => 'Elegí una institución o cargá una nueva.',
              'parte.cuit.unique' => 'Ya hay una institución con ese CUIT: buscala en la lista.',
              'representante_nombre.required' => 'Indicá quién la representa.',
          ]);

          $parte = isset($datos['parte_id']) ? Parte::find($datos['parte_id']) : Parte::create($datos['parte']);
          if ($convenio->partes()->whereKey($parte->id)->exists()) {
              return response()->json(['message' => 'Esa institución ya es parte del convenio.', 'errors' => ['parte_id' => ['Esa institución ya es parte del convenio.']]], 422);
          }

          $convenio->partes()->attach($parte->id, [
              'representante_nombre' => $datos['representante_nombre'],
              'representante_cargo' => $datos['representante_cargo'] ?? null,
              'es_firmante' => $datos['es_firmante'] ?? true,
              'firmo_en' => $datos['firmo_en'] ?? null,
          ]);

          return response()->json(['data' => $convenio->partes()->whereKey($parte->id)->first()], 201);
      }

      #[OA\Delete(path: '/api/convenios/{id}/partes/{parte}', summary: 'Quitar una parte del convenio', tags: ['Partes'],
          parameters: [
              new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'parte', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
          ],
          responses: [new OA\Response(response: 204, description: 'Quitada'), new OA\Response(response: 403, description: 'Sin permiso')])]
      public function quitarParte(Request $request, int $id, int $parte)
      {
          $this->editable($request, $id)->partes()->detach($parte);
          return response()->noContent();
      }

      // ---------------------------------------------------------------- personas y pasantías

      #[OA\Post(path: '/api/convenios/{id}/personas', summary: 'Vincular una persona (pasante, tutor, responsable...)', tags: ['Personas'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['rol'], properties: [
              new OA\Property(property: 'persona_id', type: 'integer', description: 'Persona existente (o mandar "persona")'),
              new OA\Property(property: 'persona', type: 'object', properties: [
                  new OA\Property(property: 'nombre', type: 'string', example: 'Lucía'),
                  new OA\Property(property: 'apellido', type: 'string', example: 'Gómez'),
                  new OA\Property(property: 'email', type: 'string', example: 'lucia.gomez@ejemplo.test'),
              ]),
              new OA\Property(property: 'rol', type: 'string', example: 'pasante'),
              new OA\Property(property: 'fecha_desde', type: 'string', format: 'date'),
              new OA\Property(property: 'fecha_hasta', type: 'string', format: 'date'),
              new OA\Property(property: 'pasantia', type: 'object', description: 'Solo para el pasante de un específico de pasantía', properties: [
                  new OA\Property(property: 'carrera', type: 'string', example: 'Ingeniería en Sistemas'),
                  new OA\Property(property: 'horas_semanales', type: 'integer', example: 20),
                  new OA\Property(property: 'asignacion_estimulo', type: 'number', example: 350000),
                  new OA\Property(property: 'seguro', type: 'string', example: 'ART Ficticia S.A.'),
                  new OA\Property(property: 'obra_social', type: 'string'),
                  new OA\Property(property: 'plan_trabajo', type: 'string'),
              ]),
          ])),
          responses: [
              new OA\Response(response: 201, description: 'Persona vinculada'),
              new OA\Response(response: 403, description: 'Sin permiso o el convenio no está en borrador'),
              new OA\Response(response: 422, description: 'Datos inválidos'),
          ])]
      public function agregarPersona(Request $request, int $id)
      {
          $convenio = $this->editable($request, $id);
          $datos = $request->validate([
              'persona_id' => ['nullable', 'required_without:persona', 'exists:personas,id'],
              'persona' => ['nullable', 'required_without:persona_id', 'array'],
              'persona.nombre' => ['required_with:persona', 'string', 'max:100'],
              'persona.apellido' => ['required_with:persona', 'string', 'max:100'],
              'persona.documento' => ['nullable', 'string', 'max:20', 'unique:personas,documento'],
              'persona.email' => ['nullable', 'email'],
              'persona.telefono' => ['nullable', 'string', 'max:30'],
              'rol' => ['required', 'in:pasante,tutor_docente,tutor_institucional,responsable,coordinador,otro'],
              'fecha_desde' => ['nullable', 'date'],
              'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
              'pasantia' => ['nullable', 'array'],
              'pasantia.carrera' => ['required_with:pasantia', 'string', 'max:150'],
              // Ley 26.427 de pasantías educativas: hasta 20 horas semanales
              'pasantia.horas_semanales' => ['required_with:pasantia', 'integer', 'min:1', 'max:20'],
              'pasantia.asignacion_estimulo' => ['nullable', 'numeric', 'min:0'],
              'pasantia.seguro' => ['nullable', 'string', 'max:150'],
              'pasantia.obra_social' => ['nullable', 'string', 'max:150'],
              'pasantia.plan_trabajo' => ['nullable', 'string'],
          ], [
              'persona_id.required_without' => 'Elegí una persona o cargá una nueva.',
              'rol.in' => 'Elegí un rol válido.',
              'pasantia.horas_semanales.max' => 'Una pasantía puede tener hasta 20 horas semanales (Ley 26.427).',
              'fecha_hasta.after_or_equal' => 'La fecha de fin no puede ser anterior a la de inicio.',
          ]);

          if (! empty($datos['pasantia']) && ($convenio->tipo !== 'especifico_pasantia' || $datos['rol'] !== 'pasante')) {
              return response()->json(['message' => 'Los datos de pasantía van solo en el pasante de un específico de pasantía.',
                  'errors' => ['pasantia' => ['Los datos de pasantía van solo en el pasante de un específico de pasantía.']]], 422);
          }

          $vinculo = DB::transaction(function () use ($convenio, $datos) {
              $persona = isset($datos['persona_id']) ? Persona::find($datos['persona_id']) : Persona::create($datos['persona']);
              $vinculo = ConvenioPersona::create([
                  'convenio_id' => $convenio->id,
                  'persona_id' => $persona->id,
                  'rol' => $datos['rol'],
                  'fecha_desde' => $datos['fecha_desde'] ?? null,
                  'fecha_hasta' => $datos['fecha_hasta'] ?? null,
              ]);
              if (! empty($datos['pasantia'])) {
                  $vinculo->datosPasantia()->create($datos['pasantia']);
              }
              return $vinculo;
          });

          return response()->json(['data' => $vinculo->load('persona', 'datosPasantia')], 201);
      }

      #[OA\Delete(path: '/api/convenios/{id}/personas/{vinculo}', summary: 'Quitar una persona del convenio', tags: ['Personas'],
          parameters: [
              new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'vinculo', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), description: 'id de convenio_persona'),
          ],
          responses: [new OA\Response(response: 204, description: 'Quitada'), new OA\Response(response: 403, description: 'Sin permiso')])]
      public function quitarPersona(Request $request, int $id, int $vinculo)
      {
          $this->editable($request, $id)->personas()->whereKey($vinculo)->firstOrFail()->delete(); // los datos de pasantía se borran en cascada
          return response()->noContent();
      }

      // ---------------------------------------------------------------- vínculos entre convenios

      #[OA\Post(path: '/api/convenios/{id}/vinculos', summary: 'Vincular con su antecedente (marco, convenio que modifica, renueva o sustituye)', tags: ['Vínculos'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['destino_id', 'tipo'], properties: [
              new OA\Property(property: 'destino_id', type: 'integer', description: 'El antecedente'),
              new OA\Property(property: 'tipo', type: 'string', example: 'especifico_de', description: 'especifico_de, adenda_de, renueva_a o sustituye_a'),
          ])),
          responses: [
              new OA\Response(response: 201, description: 'Vínculo creado'),
              new OA\Response(response: 403, description: 'Sin permiso'),
              new OA\Response(response: 422, description: 'Tipos incompatibles o vínculo repetido'),
          ])]
      public function agregarVinculo(Request $request, int $id)
      {
          $convenio = $this->editable($request, $id);
          $datos = $request->validate([
              'destino_id' => ['required', 'integer', 'exists:convenios,id', 'not_in:'.$id],
              'tipo' => ['required', 'in:especifico_de,adenda_de,renueva_a,sustituye_a'],
          ], ['destino_id.not_in' => 'Un convenio no se puede vincular consigo mismo.']);

          $destino = $this->convenios->ver($request->user(), $datos['destino_id']); // tiene que poder verlo
          if ($error = $this->incompatibilidad($convenio, $destino, $datos['tipo'])) {
              return response()->json(['message' => $error, 'errors' => ['destino_id' => [$error]]], 422);
          }
          if (VinculoConvenio::where(['convenio_origen_id' => $convenio->id, 'convenio_destino_id' => $destino->id, 'tipo' => $datos['tipo']])->exists()) {
              return response()->json(['message' => 'Ese vínculo ya existe.', 'errors' => ['destino_id' => ['Ese vínculo ya existe.']]], 422);
          }

          $vinculo = VinculoConvenio::create([
              'convenio_origen_id' => $convenio->id,
              'convenio_destino_id' => $destino->id,
              'tipo' => $datos['tipo'],
              'creado_por' => $request->user()->id,
              'created_at' => now(),
          ]);
          return response()->json(['data' => $vinculo], 201);
      }

      // Enunciado: "vincular un específico con uno o más marcos compatibles; vincular una adenda con el
      // instrumento que modifica; y relacionar renovaciones o sustituciones con sus antecedentes"
      private function incompatibilidad(Convenio $origen, Convenio $destino, string $tipo): ?string
      {
          $marcoDe = ['especifico_colaboracion' => 'marco_colaboracion', 'especifico_pasantia' => 'marco_pasantia'];
          return match ($tipo) {
              'especifico_de' => ! isset($marcoDe[$origen->tipo])
                  ? 'Solo un convenio específico puede depender de un marco.'
                  : ($destino->tipo !== $marcoDe[$origen->tipo] ? 'El marco tiene que ser del mismo tipo (colaboración o pasantía).' : null),
              'adenda_de' => $origen->tipo !== 'adenda'
                  ? 'Solo una adenda puede modificar a otro convenio.'
                  : ($destino->tipo === 'adenda' ? 'Una adenda modifica a un convenio, no a otra adenda.' : null),
              'renueva_a', 'sustituye_a' => $origen->tipo !== $destino->tipo
                  ? 'Una renovación o sustitución tiene que ser del mismo tipo que su antecedente.' : null,
          };
      }

      #[OA\Delete(path: '/api/convenios/{id}/vinculos/{vinculo}', summary: 'Quitar un vínculo', tags: ['Vínculos'],
          parameters: [
              new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'vinculo', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
          ],
          responses: [new OA\Response(response: 204, description: 'Quitado'), new OA\Response(response: 403, description: 'Sin permiso')])]
      public function quitarVinculo(Request $request, int $id, int $vinculo)
      {
          $this->editable($request, $id);
          VinculoConvenio::where('convenio_origen_id', $id)->whereKey($vinculo)->firstOrFail()->delete();
          return response()->noContent();
      }

      // ---------------------------------------------------------------- observaciones de revisión

      #[OA\Post(path: '/api/convenios/{id}/observaciones/{observacion}/responder', summary: 'El gestor responde y resuelve una observación', tags: ['Circuito'],
          parameters: [
              new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
              new OA\Parameter(name: 'observacion', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
          ],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['respuesta'], properties: [
              new OA\Property(property: 'respuesta', type: 'string', example: 'Se corrigió la cláusula de rescisión.'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Observación resuelta'),
              new OA\Response(response: 403, description: 'Sin permiso'),
          ])]
      public function responderObservacion(Request $request, int $id, int $observacion)
      {
          $convenio = $this->editable($request, $id);
          $datos = $request->validate(['respuesta' => ['required', 'string', 'max:1000']], ['respuesta.required' => 'Escribí qué se corrigió.']);

          // Enunciado: "conservar responsable, fecha, contenido y resolución de cada observación,
          // junto con la respuesta o corrección del equipo gestor"
          $obs = Comentario::where('convenio_id', $convenio->id)->where('tipo', 'observacion')->whereKey($observacion)->firstOrFail();
          $obs->update([
              'respuesta' => $datos['respuesta'],
              'estado' => 'resuelta',
              'resuelto_por' => $request->user()->id,
              'resuelto_en' => now(),
          ]);
          return response()->json(['data' => $obs->load('autor:id,name,rol', 'resueltoPor:id,name,rol')]);
      }
  }
