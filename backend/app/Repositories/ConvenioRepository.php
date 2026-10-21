<?php
  namespace App\Repositories;

  use App\Models\Convenio;

  class ConvenioRepository
  {
      public function listar(array $filtros, int $porPagina = 15)
      {
          return Convenio::query()
              ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->where('estado', $v))
              ->when($filtros['tipo'] ?? null, fn ($q, $v) => $q->where('tipo', $v))
              ->when($filtros['unidad_id'] ?? null, fn ($q, $v) => $q->where('unidad_id', $v))
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