<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\User;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Gate;
  use Illuminate\Validation\Rule;
  use OpenApi\Attributes as OA;

  // Administración de usuarios: solo admin (Gate "administrar").
  // Los usuarios no se borran: se desactivan, así su historial sigue apuntando a alguien.
  class UsuarioController extends Controller
  {
      private const ROLES = ['admin', 'gestor', 'revisor', 'autoridad', 'consulta'];

      #[OA\Get(path: '/api/usuarios', summary: 'Listado de usuarios (solo admin)', tags: ['Usuarios'],
          parameters: [
              new OA\Parameter(name: 'q', in: 'query', required: false, description: 'Busca en nombre y email', schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'rol', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
              new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
          ],
          responses: [
              new OA\Response(response: 200, description: 'Usuarios paginados'),
              new OA\Response(response: 403, description: 'No es admin'),
          ])]
      public function index(Request $request)
      {
          $this->soloAdmin();

          return User::query()
              ->with('unidad:id,nombre,sigla')
              ->when($request->query('rol'), fn ($q, $v) => $q->where('rol', $v))
              ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w
                  ->where('name', 'like', "%$v%")
                  ->orWhere('email', 'like', "%$v%")))
              ->orderBy('name')
              ->paginate(15, ['id', 'name', 'email', 'rol', 'unidad_id', 'activo']);
      }

      #[OA\Post(path: '/api/usuarios', summary: 'Alta de usuario (solo admin)', tags: ['Usuarios'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['name', 'email', 'rol', 'password'], properties: [
              new OA\Property(property: 'name', type: 'string', example: 'Laura Gestora'),
              new OA\Property(property: 'email', type: 'string', example: 'laura@convenios.test'),
              new OA\Property(property: 'rol', type: 'string', example: 'gestor', description: 'admin, gestor, revisor, autoridad o consulta'),
              new OA\Property(property: 'unidad_id', type: 'integer', nullable: true, example: 7, description: 'Vacío = alcance global'),
              new OA\Property(property: 'password', type: 'string', example: 'password123', description: 'Mínimo 8 caracteres'),
          ])),
          responses: [
              new OA\Response(response: 201, description: 'Usuario creado'),
              new OA\Response(response: 403, description: 'No es admin'),
              new OA\Response(response: 422, description: 'Datos inválidos o email repetido'),
          ])]
      public function store(Request $request)
      {
          $this->soloAdmin();

          $datos = $request->validate([
              'name' => ['required', 'string', 'max:150'],
              'email' => ['required', 'email', 'max:150', 'unique:users,email'],
              'rol' => ['required', Rule::in(self::ROLES)],
              'unidad_id' => ['nullable', 'integer', 'exists:unidades,id'],
              'password' => ['required', 'string', 'min:8'],
          ], $this->mensajes());

          $usuario = User::create($datos + ['activo' => true]); // el modelo guarda la contraseña como hash

          return response()->json(['data' => $usuario->load('unidad:id,nombre,sigla')], 201);
      }

      #[OA\Put(path: '/api/usuarios/{id}', summary: 'Editar o desactivar un usuario (solo admin)', tags: ['Usuarios'],
          parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(properties: [
              new OA\Property(property: 'name', type: 'string'),
              new OA\Property(property: 'email', type: 'string'),
              new OA\Property(property: 'rol', type: 'string'),
              new OA\Property(property: 'unidad_id', type: 'integer', nullable: true),
              new OA\Property(property: 'activo', type: 'boolean', example: false),
              new OA\Property(property: 'password', type: 'string', description: 'Solo si se quiere cambiar'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Usuario actualizado'),
              new OA\Response(response: 403, description: 'No es admin'),
              new OA\Response(response: 422, description: 'Datos inválidos, o el admin intenta quitarse su propio rol o desactivarse'),
          ])]
      public function update(Request $request, int $id)
      {
          $this->soloAdmin();
          $usuario = User::findOrFail($id);

          $datos = $request->validate([
              'name' => ['sometimes', 'required', 'string', 'max:150'],
              'email' => ['sometimes', 'required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($usuario->id)],
              'rol' => ['sometimes', 'required', Rule::in(self::ROLES)],
              'unidad_id' => ['sometimes', 'nullable', 'integer', 'exists:unidades,id'],
              'activo' => ['sometimes', 'boolean'],
              'password' => ['sometimes', 'nullable', 'string', 'min:8'],
          ], $this->mensajes());

          // Que el admin no se deje afuera a sí mismo
          if ($usuario->id === $request->user()->id) {
              if (($datos['activo'] ?? true) === false) {
                  abort(422, 'No podés desactivar tu propio usuario.');
              }
              if (isset($datos['rol']) && $datos['rol'] !== 'admin') {
                  abort(422, 'No podés quitarte el rol de administración.');
              }
          }

          if (empty($datos['password'])) {
              unset($datos['password']); // vacío = no se cambia
          }

          $usuario->update($datos);

          // Desactivado: se cierran sus sesiones en la app (se borran sus tokens)
          if ($usuario->activo === false) {
              $usuario->tokens()->delete();
          }

          return response()->json(['data' => $usuario->load('unidad:id,nombre,sigla')]);
      }

      private function soloAdmin(): void
      {
          abort_unless(Gate::allows('administrar'), 403, 'Solo el rol de administración puede gestionar usuarios.');
      }

      private function mensajes(): array
      {
          return [
              'name.required' => 'El nombre es obligatorio.',
              'email.required' => 'El email es obligatorio.',
              'email.email' => 'El email no es válido.',
              'email.unique' => 'Ya hay un usuario con ese email.',
              'rol.in' => 'Elegí un rol válido.',
              'unidad_id.exists' => 'La unidad no existe.',
              'password.required' => 'La contraseña es obligatoria.',
              'password.min' => 'La contraseña tiene que tener al menos 8 caracteres.',
          ];
      }
  }