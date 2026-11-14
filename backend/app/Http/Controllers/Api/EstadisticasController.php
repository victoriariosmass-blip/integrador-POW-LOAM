<?php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Models\Convenio;
  use App\Models\ConvenioPersona;
  use App\Models\Unidad;
  use Illuminate\Http\Request;
  use OpenApi\Attributes as OA;

  // Panel de estadísticas: todo se cuenta sobre los convenios que el usuario puede ver
  class EstadisticasController extends Controller
  {
      #[OA\Get(path: '/api/estadisticas', summary: 'Estadísticas del panel (dentro del alcance del usuario)', tags: ['Convenios'],
          responses: [
              new OA\Response(response: 200, description: 'Cantidades por estado, tipo, unidad y año de firma, y personas únicas'),
              new OA\Response(response: 401, description: 'No autenticado'),
          ])]
      public function __invoke(Request $request)
      {
          $visibles = fn () => Convenio::query()->visiblesPara($request->user());

          // { "borrador": 3, "firmado": 12, ... }
          $porEstado = $visibles()->selectRaw('estado, count(*) as total')->groupBy('estado')->pluck('total', 'estado');
          $porTipo = $visibles()->selectRaw('tipo, count(*) as total')->groupBy('tipo')->pluck('total', 'tipo');

          // [ { "unidad": "Facultad de Ingeniería", "sigla": "FI", "total": 10 }, ... ]
          $nombres = Unidad::pluck('nombre', 'id');
          $siglas = Unidad::pluck('sigla', 'id');
          $porUnidad = $visibles()->selectRaw('unidad_id, count(*) as total')->groupBy('unidad_id')
              ->orderByDesc('total')->get()
              ->map(fn ($f) => ['unidad' => $nombres[$f->unidad_id] ?? '—', 'sigla' => $siglas[$f->unidad_id] ?? '—', 'total' => (int) $f->total]);

          // Solo los que tienen fecha de firma: [ { "anio": 2025, "total": 6 }, ... ]
          $porAnio = $visibles()->whereNotNull('fecha_firma')
              ->selectRaw('YEAR(fecha_firma) as anio, count(*) as total')->groupBy('anio')->orderBy('anio')->get()
              ->map(fn ($f) => ['anio' => (int) $f->anio, 'total' => (int) $f->total]);

          return response()->json([
              'total' => $visibles()->count(),
              'firmados' => (int) ($porEstado['firmado'] ?? 0),
              'vigentes' => $visibles()->where('estado', 'firmado')
                  ->where(fn ($q) => $q->whereNull('fecha_vencimiento')->orWhereDate('fecha_vencimiento', '>=', now()))->count(),
              'por_estado' => $porEstado,
              'por_tipo' => $porTipo,
              'por_unidad' => $porUnidad,
              'por_anio_firma' => $porAnio,
              // una persona que está en varios convenios cuenta una sola vez
              'personas_unicas' => ConvenioPersona::whereIn('convenio_id', $visibles()->select('id'))
                  ->distinct()->count('persona_id'),
          ]);
      }
  }