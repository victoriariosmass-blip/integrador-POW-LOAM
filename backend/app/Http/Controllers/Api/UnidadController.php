<?php
       namespace App\Http\Controllers\Api;
 
       use App\Http\Controllers\Controller;
       use App\Models\Unidad;
       use OpenApi\Attributes as OA;
 
       // Lista de unidades (rectorado y facultades) para los formularios
       class UnidadController extends Controller
       {
           #[OA\Get(path: '/api/unidades', summary: 'Unidades (para elegir en el alta de convenio)', tags: ['Convenios'],
               responses: [new OA\Response(response: 200, description: 'Lista de unidades')])]
           public function __invoke()
           {
               return response()->json(['data' => Unidad::orderBy('nombre')->get(['id', 'nombre', 'sigla'])]);
           }
       }