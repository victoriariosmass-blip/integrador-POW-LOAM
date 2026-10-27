<?php
  namespace App\Services;

  use App\Models\AsignacionRevision;
  use App\Models\Comentario;
  use App\Models\Convenio;
  use App\Models\TransicionEstado;
  use App\Models\User;
  use Illuminate\Support\Facades\DB;
  use Illuminate\Support\Facades\Gate;

  /**
   * Circuito de estados del convenio:
   * borrador -> revision -> aprobado -> firmado -> rescindido / archivado
   * Cada cambio controla el permiso con ConvenioPolicy y queda en transiciones_estado.
   */
  class EstadoConvenioService
  {
      public function enviarARevision(User $usuario, Convenio $convenio): Convenio
      {
          Gate::forUser($usuario)->authorize('enviarARevision', $convenio);
          return $this->cambiar($usuario, $convenio, 'revision', 'Enviado a revisión');
      }

      public function aprobar(User $usuario, Convenio $convenio, ?string $fundamento): Convenio
      {
          Gate::forUser($usuario)->authorize('revisar', $convenio);

          return DB::transaction(function () use ($usuario, $convenio, $fundamento) {
              $this->cerrarAsignacion($convenio);
              return $this->cambiar($usuario, $convenio, 'aprobado', $fundamento ?: 'Aprobado en revisión');
          });
      }

      // Vuelve a borrador con las observaciones del revisor (quedan como comentario tipo observacion)
      public function devolver(User $usuario, Convenio $convenio, string $observaciones): Convenio
      {
          Gate::forUser($usuario)->authorize('revisar', $convenio);

          return DB::transaction(function () use ($usuario, $convenio, $observaciones) {
              Comentario::create([
                  'convenio_id' => $convenio->id,
                  'user_id' => $usuario->id,
                  'tipo' => 'observacion',
                  'contenido' => $observaciones,
                  'estado' => 'pendiente',
              ]);
              $this->cerrarAsignacion($convenio);
              return $this->cambiar($usuario, $convenio, 'borrador', $observaciones);
          });
      }

      public function rescindir(User $usuario, Convenio $convenio, string $fundamento): Convenio
      {
          Gate::forUser($usuario)->authorize('rescindir', $convenio);
          return $this->cambiar($usuario, $convenio, 'rescindido', $fundamento);
      }

      public function archivar(User $usuario, Convenio $convenio, ?string $fundamento): Convenio
      {
          Gate::forUser($usuario)->authorize('archivar', $convenio);
          return $this->cambiar($usuario, $convenio, 'archivado', $fundamento ?: 'Archivado');
      }

      // El admin le asigna el convenio a un revisor (el revisor solo ve lo asignado)
      public function asignarRevisor(User $usuario, Convenio $convenio, int $revisorId): Convenio
      {
          Gate::forUser($usuario)->authorize('asignarRevisor', $convenio);

          $revisor = User::find($revisorId);
          if (! $revisor || $revisor->rol !== 'revisor') {
              abort(422, 'El usuario elegido no es revisor');
          }

          AsignacionRevision::create([
              'convenio_id' => $convenio->id,
              'revisor_id' => $revisor->id,
              'asignado_por' => $usuario->id,
              'asignado_en' => now(),
          ]);

          return $convenio->fresh();
      }

      private function cambiar(User $usuario, Convenio $convenio, string $hasta, string $fundamento): Convenio
      {
          return DB::transaction(function () use ($usuario, $convenio, $hasta, $fundamento) {
              TransicionEstado::create([
                  'convenio_id' => $convenio->id,
                  'estado_desde' => $convenio->estado,
                  'estado_hasta' => $hasta,
                  'fundamento' => $fundamento,
                  'user_id' => $usuario->id,
              ]);

              $convenio->update([
                  'estado' => $hasta,
                  'version' => $convenio->version + 1,
              ]);

              return $convenio->fresh();
          });
      }

      private function cerrarAsignacion(Convenio $convenio): void
      {
          $convenio->asignaciones()->whereNull('completado_en')->update(['completado_en' => now()]);
      }
  }
