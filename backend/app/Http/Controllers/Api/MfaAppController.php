<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\User;
  use App\Services\MfaService;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Cache;
  use OpenApi\Attributes as OA;

  // Segundo paso del login de la APP (la web usa MfaController, con la sesión).
  // La app no tiene sesión: POST /api/token le devuelve un "mfa_token" (un texto al azar que
  // identifica ese intento de ingreso) y con él + el código de 6 números pide el token de verdad.
  // El intento se guarda en el cache de Laravel 10 minutos: { user_id, dispositivo, intentos }.
  class MfaAppController extends Controller
  {
      private const MAX_INTENTOS = 5;

      public function __construct(private MfaService $mfa) {}

      #[OA\Post(path: '/api/token/verificar', summary: 'App: segundo paso, código de verificación', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['mfa_token', 'codigo'],
              properties: [
                  new OA\Property(property: 'mfa_token', type: 'string', description: 'El que devolvió POST /api/token'),
                  new OA\Property(property: 'codigo', type: 'string', example: '123456', description: 'Está en storage/logs/laravel.log'),
              ])),
          responses: [
              new OA\Response(response: 200, description: 'Token y usuario'),
              new OA\Response(response: 401, description: 'El ingreso venció o hubo demasiados intentos'),
              new OA\Response(response: 422, description: 'Código incorrecto o vencido'),
          ])]
      public function verificar(Request $request)
      {
          $datos = $request->validate([
              'mfa_token' => ['required', 'string'],
              'codigo' => ['required', 'digits:6'],
          ], [
              'codigo.required' => 'Ingresá el código.',
              'codigo.digits' => 'El código tiene 6 números.',
          ]);

          [$clave, $pendiente, $usuario] = $this->pendiente($datos['mfa_token']);

          if (! $this->mfa->verificar($usuario, $datos['codigo'])) {
              $pendiente['intentos']++;
              if ($pendiente['intentos'] >= self::MAX_INTENTOS) {
                  Cache::forget($clave);
                  abort(401, 'Demasiados intentos. Volvé a iniciar sesión.');
              }
              Cache::put($clave, $pendiente, $pendiente['vence']);
              return response()->json(['message' => 'El código no es correcto o venció'], 422);
          }

          Cache::forget($clave); // el mfa_token sirve una sola vez

          return response()->json([
              'token' => $usuario->createToken($pendiente['dispositivo'])->plainTextToken,
              'usuario' => $usuario,
          ]);
      }

      #[OA\Post(path: '/api/token/reenviar', summary: 'App: mandar otro código', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['mfa_token'],
              properties: [
                  new OA\Property(property: 'mfa_token', type: 'string'),
                  new OA\Property(property: 'canal', type: 'string', example: 'mail', description: 'mail o sms'),
              ])),
          responses: [
              new OA\Response(response: 200, description: 'Código reenviado'),
              new OA\Response(response: 401, description: 'El ingreso venció'),
              new OA\Response(response: 429, description: 'Hay que esperar 30 segundos entre envíos'),
          ])]
      public function reenviar(Request $request)
      {
          $datos = $request->validate([
              'mfa_token' => ['required', 'string'],
              'canal' => ['nullable', 'in:mail,sms'],
          ]);

          [, , $usuario] = $this->pendiente($datos['mfa_token']);

          if (! $this->mfa->puedeReenviar($usuario)) {
              return response()->json(['message' => 'Esperá unos segundos antes de pedir otro código'], 429);
          }

          $canal = $datos['canal'] ?? 'mail';
          $this->mfa->enviarCodigo($usuario, $canal);

          return response()->json(['enviado' => true, 'canal' => $canal]);
      }

      // Busca el intento de ingreso; si venció (10 min) o no existe, hay que volver a empezar
      private function pendiente(string $mfaToken): array
      {
          $clave = 'mfa_app:'.hash('sha256', $mfaToken);
          $pendiente = Cache::get($clave);
          $usuario = $pendiente ? User::find($pendiente['user_id']) : null;
          if (! $usuario) {
              abort(401, 'El ingreso venció. Volvé a iniciar sesión.');
          }
          return [$clave, $pendiente, $usuario];
      }
  }