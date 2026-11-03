<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\User;
  use App\Services\MfaService;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Auth;
  use OpenApi\Attributes as OA;

  // Segundo paso del login de la web. El usuario "pendiente" queda en la sesión
  // después de POST /api/login y recién acá se inicia la sesión de verdad.
  class MfaController extends Controller
  {
      private const MAX_INTENTOS = 5;

      public function __construct(private MfaService $mfa) {}

      #[OA\Post(path: '/api/mfa/verificar', summary: 'Verificar el código de 6 dígitos (web)', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['codigo'], properties: [
              new OA\Property(property: 'codigo', type: 'string', example: '123456'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Sesión iniciada; devuelve el usuario'),
              new OA\Response(response: 401, description: 'No hay un inicio de sesión pendiente o se agotaron los intentos'),
              new OA\Response(response: 422, description: 'Código incorrecto o vencido'),
          ])]
      public function verificar(Request $request)
      {
          $datos = $request->validate(['codigo' => ['required', 'digits:6']]);
          $usuario = $this->pendiente($request);

          if (! $this->mfa->verificar($usuario, $datos['codigo'])) {
              $intentos = $request->session()->increment('mfa_intentos');
              if ($intentos >= self::MAX_INTENTOS) {
                  $request->session()->forget(['mfa_user_id', 'mfa_intentos']);
                  abort(401, 'Demasiados intentos. Volvé a iniciar sesión.');
              }
              return response()->json(['message' => 'El código no es correcto o venció'], 422);
          }

          $request->session()->forget(['mfa_user_id', 'mfa_intentos']);
          Auth::guard('web')->login($usuario);
          $request->session()->regenerate();

          return response()->json(['usuario' => $usuario]);
      }

      #[OA\Post(path: '/api/mfa/reenviar', summary: 'Reenviar el código (simulado: queda en el log)', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(properties: [
              new OA\Property(property: 'canal', type: 'string', enum: ['mail', 'sms'], example: 'sms'),
          ])),
          responses: [
              new OA\Response(response: 200, description: 'Código reenviado'),
              new OA\Response(response: 401, description: 'No hay un inicio de sesión pendiente'),
              new OA\Response(response: 429, description: 'Hay que esperar 30 segundos entre envíos'),
          ])]
      public function reenviar(Request $request)
      {
          $datos = $request->validate(['canal' => ['nullable', 'in:mail,sms']]);
          $usuario = $this->pendiente($request);

          if (! $this->mfa->puedeReenviar($usuario)) {
              return response()->json(['message' => 'Esperá unos segundos antes de pedir otro código'], 429);
          }

          $canal = $datos['canal'] ?? 'mail';
          $this->mfa->enviarCodigo($usuario, $canal);

          return response()->json(['enviado' => true, 'canal' => $canal]);
      }

      private function pendiente(Request $request): User
      {
          $id = $request->session()->get('mfa_user_id');
          $usuario = $id ? User::find($id) : null;
          if (! $usuario) {
              abort(401, 'La sesión venció. Volvé a iniciar sesión.');
          }
          return $usuario;
      }
  }
