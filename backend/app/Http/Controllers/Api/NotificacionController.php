<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Avisos del usuario logueado (tabla notificaciones). Los genera EstadoConvenioService:
 * revisión asignada (al revisor) y cambios de estado, como "devuelto con observaciones"
 * (a quien cargó el convenio). La web los muestra en Alertas y en la campanita.
 * Enunciado: "Disparadores: generar un aviso cuando se asigne una revisión, cambie el estado de un instrumento…"
 * Se devuelven los de los últimos 30 días (no se marcan como leídos).
 */
class NotificacionController extends Controller
{
    private const DIAS = 30;

    #[OA\Get(path: '/api/notificaciones', summary: 'Avisos del usuario de los últimos 30 días', tags: ['Avisos'],
        responses: [
            new OA\Response(response: 200, description: 'Lista de avisos: código y título en "titulo", tipo y estado en "cuerpo", enlace a la ficha y el convenio'),
            new OA\Response(response: 401, description: 'Sin sesión'),
        ])]
    public function __invoke(Request $request)
    {
        $avisos = $request->user()->notificaciones()
            ->where('created_at', '>=', now()->subDays(self::DIAS))
            ->with('convenio:id,codigo,titulo,tipo,estado')
            ->latest('created_at')->latest('id')
            ->limit(50)
            ->get(['id', 'convenio_id', 'tipo', 'titulo', 'cuerpo', 'enlace', 'created_at']);

        return response()->json(['data' => $avisos]);
    }
}
