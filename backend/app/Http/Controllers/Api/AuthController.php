<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\User;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Auth;
  use Illuminate\Support\Facades\Hash;
  use Laravel\Sanctum\PersonalAccessToken;
  use OpenApi\Attributes as OA;

  class AuthController extends Controller
  {
      // Login por sesión (cookie): lo usa la web
      #[OA\Post(path: '/api/login', summary: 'Iniciar sesión (web, por cookie)', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['email', 'password'],
              properties: [
                  new OA\Property(property: 'email', type: 'string', example: 'gestor.fi@convenios.test'),
                  new OA\Property(property: 'password', type: 'string', example: 'password'),
              ])),
          responses: [
              new OA\Response(response: 200, description: 'Logueado'),
              new OA\Response(response: 422, description: 'Credenciales incorrectas'),
          ])]
      public function login(Request $request)
      {
          $datos = $request->validate([
              'email' => ['required', 'email'],
              'password' => ['required'],
          ]);

          if (! Auth::guard('web')->attempt($datos)) {
              return response()->json(['message' => 'Email o contraseña incorrectos'], 422);
          }

          $request->session()->regenerate();

          return response()->json([
              'requiere_mfa' => false, // cuando esté el MFA, pasa a true
              'usuario' => $request->user(),
          ]);
      }

      // Login por token: lo usa la app y sirve para probar en Swagger
      #[OA\Post(path: '/api/token', summary: 'Obtener token (app y Swagger)', tags: ['Auth'],
          requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
              required: ['email', 'password'],
              properties: [
                  new OA\Property(property: 'email', type: 'string', example: 'gestor.fi@convenios.test'),
                  new OA\Property(property: 'password', type: 'string', example: 'password'),
                  new OA\Property(property: 'dispositivo', type: 'string', example: 'swagger'),
              ])),
          responses: [
              new OA\Response(response: 200, description: 'Token y usuario'),
              new OA\Response(response: 422, description: 'Credenciales incorrectas'),
          ])]
      public function token(Request $request)
      {
          $datos = $request->validate([
              'email' => ['required', 'email'],
              'password' => ['required'],
              'dispositivo' => ['nullable', 'string', 'max:100'],
          ]);

          $usuario = User::where('email', $datos['email'])->first();
          if (! $usuario || ! Hash::check($datos['password'], $usuario->password)) {
              return response()->json(['message' => 'Email o contraseña incorrectos'], 422);
          }

          return response()->json([
              'requiere_mfa' => false, // cuando esté el MFA, pasa a true
              'token' => $usuario->createToken($datos['dispositivo'] ?? 'app')->plainTextToken,
              'usuario' => $usuario,
          ]);
      }

      #[OA\Post(path: '/api/logout', summary: 'Cerrar sesión', tags: ['Auth'],
          responses: [new OA\Response(response: 204, description: 'Sesión cerrada')])]
      public function logout(Request $request)
      {
          $token = $request->user()->currentAccessToken();

          if ($token instanceof PersonalAccessToken) {
              $token->delete(); // entró con token: se borra ese token
          } else {
              Auth::guard('web')->logout(); // entró con cookie: se cierra la sesión
              $request->session()->invalidate();
              $request->session()->regenerateToken();
          }

          return response()->noContent();
      }

      #[OA\Get(path: '/api/user', summary: 'Usuario logueado', tags: ['Auth'],
          responses: [
              new OA\Response(response: 200, description: 'Usuario'),
              new OA\Response(response: 401, description: 'No autenticado'),
          ])]
      public function user(Request $request)
      {
          return $request->user();
      }
  }