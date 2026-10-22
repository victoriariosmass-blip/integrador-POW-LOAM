<?php
  namespace App\Repositories;

  use App\Models\Convenio;
  use App\Models\User;

  class ConvenioRepository
  {
      public function listar(User $usuario, array $filtros, int $porPagina = 15)
      {
          return Convenio::query()
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
          return Convenio::with(['partes', 'documentos'])->findOrFail($id);
      }

      public function crear(array $datos): Convenio
      {
          return Convenio::create($datos);
      }
  }
