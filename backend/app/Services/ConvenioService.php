<?php
  namespace App\Services;

  use App\Models\Convenio;
  use App\Models\TransicionEstado;
  use App\Models\User;
  use App\Repositories\ConvenioRepository;
  use Illuminate\Support\Facades\Gate;

  class ConvenioService
  {
      public function __construct(private ConvenioRepository $repo) {}

      public function listar(User $usuario, array $filtros)
      {
          return $this->repo->listar($usuario, $filtros);
      }

      public function ver(User $usuario, int $id): Convenio
      {
          $convenio = $this->repo->buscar($id);
          Gate::forUser($usuario)->authorize('view', $convenio); // 403 si no lo puede ver
          return $convenio;
      }

      public function crear(User $usuario, array $datos): Convenio
      {
          Gate::forUser($usuario)->authorize('create', Convenio::class); // solo gestor y admin

          // Un gestor carga en su unidad; un usuario global tiene que elegirla
          $datos['unidad_id'] = $usuario->unidad_id ?? ($datos['unidad_id'] ?? null);
          if (! $datos['unidad_id']) {
              abort(422, 'Indicá la unidad del convenio');
          }

          $datos['estado'] = 'borrador';
          $datos['creado_por'] = $usuario->id;
          $datos['codigo'] = $this->siguienteCodigo($datos['tipo']);

          $convenio = $this->repo->crear($datos);

          // Primer registro del historial de estados
          TransicionEstado::create([
              'convenio_id' => $convenio->id,
              'estado_desde' => null,
              'estado_hasta' => 'borrador',
              'fundamento' => 'Alta del convenio',
              'user_id' => $usuario->id,
          ]);

          return $convenio;
      }

      // Edita un borrador. "version" es la que tenía cuando el usuario lo abrió:
      // si alguien lo guardó en el medio, responde 409 y no pisa esos cambios.
      public function editar(User $usuario, int $id, array $datos): Convenio
      {
          $convenio = $this->repo->buscar($id);
          Gate::forUser($usuario)->authorize('update', $convenio);

          if ((int) $datos['version'] !== $convenio->version) {
              abort(409, 'El convenio cambió mientras lo editabas. Recargalo para ver los cambios.');
          }

          unset($datos['version']);
          $convenio->update($datos + ['version' => $convenio->version + 1]);

          return $this->repo->buscar($id);
      }

      // Código legible: PREFIJO-AÑO-NÚMERO, por ejemplo MC-2026-0001
      private function siguienteCodigo(string $tipo): string
      {
          $prefijos = [
              'marco_colaboracion' => 'MC',
              'especifico_colaboracion' => 'EC',
              'marco_pasantia' => 'MP',
              'especifico_pasantia' => 'EP',
              'adenda' => 'AD',
          ];
          $base = $prefijos[$tipo] . '-' . now()->year . '-';

          $ultimo = Convenio::where('codigo', 'like', $base . '%')->max('codigo');
          $numero = $ultimo ? ((int) substr($ultimo, -4)) + 1 : 1;

          return $base . str_pad($numero, 4, '0', STR_PAD_LEFT);
      }
  }