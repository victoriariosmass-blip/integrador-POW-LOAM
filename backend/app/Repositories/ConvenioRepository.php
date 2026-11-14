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
              // estado puede venir de a uno (firmado) o varios separados por coma (borrador,revision)
              ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->whereIn('estado', explode(',', $v)))
              // vigentes = firmados sin vencimiento o que vencen hoy o después (igual que el panel)
              ->when(! empty($filtros['vigentes']), fn ($q) => $q->where('estado', 'firmado')
                ->where(fn ($w) => $w->whereNull('fecha_vencimiento')->orWhereDate('fecha_vencimiento', '>=', now())))
              ->when($filtros['tipo'] ?? null, fn ($q, $v) => $q->where('tipo', $v))
              ->when($filtros['unidad_id'] ?? null, fn ($q, $v) => $q->where('unidad_id', $v))
              ->when($filtros['firma_desde'] ?? null, fn ($q, $v) => $q->whereDate('fecha_firma', '>=', $v))
              ->when($filtros['firma_hasta'] ?? null, fn ($q, $v) => $q->whereDate('fecha_firma', '<=', $v))
              ->when($filtros['vence_desde'] ?? null, fn ($q, $v) => $q->whereDate('fecha_vencimiento', '>=', $v))
              ->when($filtros['vence_hasta'] ?? null, fn ($q, $v) => $q->whereDate('fecha_vencimiento', '<=', $v))
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
              // árbol: el marco o convenio que modifica, y los específicos/adendas que cuelgan de este
              'antecedentes' => fn ($q) => $q->select('convenios.id', 'convenios.codigo', 'convenios.titulo', 'convenios.tipo', 'convenios.estado'),
              'derivados' => fn ($q) => $q->select('convenios.id', 'convenios.codigo', 'convenios.titulo', 'convenios.tipo', 'convenios.estado'),
          ])->findOrFail($id);
      }

      public function crear(array $datos): Convenio
      {
          return Convenio::create($datos);
      }
  }
