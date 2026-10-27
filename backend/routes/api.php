<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConvenioController;
use App\Http\Controllers\Api\EstadoConvenioController;
use App\Http\Controllers\Api\ResumenController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/token', [AuthController::class, 'token']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/resumen', ResumenController::class);
    Route::get('/convenios', [ConvenioController::class, 'index']);
    Route::get('/convenios/{id}', [ConvenioController::class, 'show']);
    Route::post('/convenios', [ConvenioController::class, 'store']);
    Route::put('/convenios/{id}', [ConvenioController::class, 'update']);

    // Circuito de estados
    Route::post('/convenios/{id}/enviar-revision', [EstadoConvenioController::class, 'enviarRevision']);
    Route::post('/convenios/{id}/aprobar', [EstadoConvenioController::class, 'aprobar']);
    Route::post('/convenios/{id}/devolver', [EstadoConvenioController::class, 'devolver']);
    Route::post('/convenios/{id}/rescindir', [EstadoConvenioController::class, 'rescindir']);
    Route::post('/convenios/{id}/archivar', [EstadoConvenioController::class, 'archivar']);
    Route::post('/convenios/{id}/asignar-revisor', [EstadoConvenioController::class, 'asignarRevisor']);
});
