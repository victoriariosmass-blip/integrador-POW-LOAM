<?php
  namespace App\Repositories;

  use App\Models\Convenio;
  use App\Models\User;

  class ConvenioRepository
  {
      public function listar(User $usuario, array $filtros, int $porPagina = 15)
      {
          return Convenio::query()
              ->with('unidad:id,nombre,sigla')
              ->visiblesPara($usuario) // cada rol ve lo suyo (matriz de permisos)
              ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->where('estado', $v))
              ->when($filtros['tipo'] ?? null, fn ($q, $v) => $q->where('tipo', $v))
              ->when($filtros['q'] ?? null, fn ($q, $v) => $q->where(fn ($w) =>
                  $w->where('titulo', 'like', "%$v%")->orWhere('codigo', 'like', "%$v%")))
              ->orderByDesc('created_at')
              ->paginate($porPagina);
      }

      public function buscar(int $id): Convenio
      {
          return Convenio::with([
              'unidad:id,nombre,sigla',
              'partes',
              'documentos',
              'transiciones' => fn ($q) => $q->orderBy('created_at')->orderBy('id'),
              'transiciones.usuario:id,name,rol',
              'observaciones' => fn ($q) => $q->latest(),
              'observaciones.autor:id,name,rol',
          ])->findOrFail($id);
      }

      public function crear(array $datos): Convenio
      {
          return Convenio::create($datos);
      }
  }
