<?php
  namespace App\Services;

  use App\Models\Convenio;
  use App\Models\User;
  use App\Repositories\ConvenioRepository;

  class ConvenioService
  {
      public function __construct(private ConvenioRepository $repo) {}

      public function listar(User $usuario, array $filtros)
      {
          // Alcance por unidad: si el usuario tiene unidad, solo ve la suya
          if ($usuario->unidad_id) {
              $filtros['unidad_id'] = $usuario->unidad_id;
          }
          return $this->repo->listar($filtros);
      }

      public function ver(User $usuario, int $id): Convenio
      {
          $convenio = $this->repo->buscar($id);
          if ($usuario->unidad_id && $convenio->unidad_id !== $usuario->unidad_id) {
              abort(403, 'No tenés permiso para ver este convenio');
          }
          return $convenio;
      }

      public function crear(User $usuario, array $datos): Convenio
      {
          if (! in_array($usuario->rol, ['gestion', 'administracion'])) {
              abort(403, 'Tu rol no puede cargar convenios');
          }
          $datos['estado'] = 'borrador';
          $datos['unidad_id'] = $usuario->unidad_id ?? $datos['unidad_id'];
          // Acá también va la generación del código (MC-2026-0001, etc.)
          return $this->repo->crear($datos);
      }
  }

  