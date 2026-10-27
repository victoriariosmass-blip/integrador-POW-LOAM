<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
      $middleware->statefulApi();
      // Sin sesión en /api: responder 401 en lugar de redirigir a una ruta "login" que no existe
      $middleware->redirectGuestsTo(fn ($request) => $request->is('api/*') ? null : '/');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // En /api siempre responder JSON (401, 403, 404, 422...) y no redirigir a un login web
        $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*'));

        // Mensaje en castellano cuando una Policy niega el permiso
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*') && $e->getMessage() === 'This action is unauthorized.') {
                return response()->json(['message' => 'No tenés permiso para hacer esto con este convenio.'], 403);
            }
        });
    })->create();