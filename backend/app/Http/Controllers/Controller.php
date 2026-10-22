<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(version: '1.0.0', title: 'API Gestión de Convenios UNLPam')]
// Botón "Authorize" de Swagger: se pega el token que devuelve POST /api/token
#[OA\SecurityScheme(securityScheme: 'sanctum', type: 'http', scheme: 'bearer', description: 'Token de POST /api/token')]
#[OA\OpenApi(security: [['sanctum' => []]])]
abstract class Controller
{
    //
}