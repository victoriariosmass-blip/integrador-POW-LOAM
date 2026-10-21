<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Auth;
  use OpenApi\Attributes as OA;

  class AuthController extends Controller
  {
      #[OA\Post(path: '/api/login', summary: 'Iniciar sesión', tags: ['Auth'],
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

      #[OA\Post(path: '/api/logout', summary: 'Cerrar sesión', tags: ['Auth'],
          responses: [new OA\Response(response: 204, description: 'Sesión cerrada')])]
      public function logout(Request $request)
      {
          Auth::guard('web')->logout();
          $request->session()->invalidate();
          $request->session()->regenerateToken();
          return response()->noContent();
      }

      #[OA\Get(path: '/api/user', summary: 'Usuario logueado', tags: ['Auth'],
          responses: [new OA\Response(response: 200, description: 'Usuario')])]
      public function user(Request $request)
      {
          return $request->user();
      }
  }
