<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\Convenio;
  use App\Models\TransicionEstado;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  // Números para la pantalla de inicio (app y panel de la web)
  class ResumenController extends Controller
  {
      #[OA\Get(path: '/api/resumen', summary: 'Métricas de inicio y últimos 10 movimientos', tags: ['Convenios'],
          responses: [
              new OA\Response(response: 200, description: 'Métricas'),
              new OA\Response(response: 401, description: 'No autenticado'),
          ])]
      public function __invoke(Request $request)
      {
          $usuario = $request->user();
          $visibles = fn () => Convenio::query()->visiblesPara($usuario); // cada rol cuenta solo lo que puede ver

          return response()->json([
              'firmados_ultimo_anio' => $visibles()->where('estado', 'firmado')
                  ->whereDate('fecha_firma', '>=', now()->subYear())->count(),
              'vigentes' => $visibles()->where('estado', 'firmado')
                  ->where(fn ($q) => $q->whereNull('fecha_vencimiento')->orWhereDate('fecha_vencimiento', '>=', now()))->count(),
              'en_tramite' => $visibles()->whereIn('estado', ['borrador', 'revision'])->count(),
              'por_firmar' => $visibles()->where('estado', 'aprobado')->count(),
              'ultimos_movimientos' => TransicionEstado::query()
                  ->whereIn('convenio_id', $visibles()->select('id'))
                  ->with(['convenio:id,codigo,titulo,estado', 'usuario:id,name'])
                  ->latest('created_at')->latest('id')
                  ->limit(10)
                  ->get(),
          ]);
      }
  }
