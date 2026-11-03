<?php
  namespace App\Services;

  use App\Models\AsignacionRevision;
  use App\Models\Comentario;
  use App\Models\Convenio;
  use App\Models\TransicionEstado;
  use App\Models\User;
  use Illuminate\Support\Facades\DB;
  use Illuminate\Support\Facades\Gate;
  use App\Models\Documento;
  use App\Models\Firma;
  use Illuminate\Support\Facades\Storage;


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

      /**
       * Firma registrada desde la app (NO es firma digital): guarda la imagen del
       * trazo, la ubicación, la fecha y hora, si se validó con huella o rostro y
       * el hash del PDF principal. El convenio pasa de aprobado a firmado.
       */
      public function firmar(User $usuario, Convenio $convenio, array $datos): Convenio
      {
          Gate::forUser($usuario)->authorize('firmar', $convenio);

          // "data:image/png;base64,AAAA..." -> bytes del PNG
          $base64 = preg_replace('#^data:image/png;base64,#', '', $datos['firma_imagen']);
          $png = base64_decode($base64, true);
          if ($png === false || substr($png, 0, 8) !== "\x89PNG\r\n\x1a\n") {
              abort(422, 'La imagen de la firma no es un PNG válido');
          }

          $ruta = "firmas/convenio-{$convenio->id}-usuario-{$usuario->id}-" . now()->format('YmdHis') . '.png';
          Storage::disk('local')->put($ruta, $png);

          $principal = Documento::where('convenio_id', $convenio->id)
              ->where('categoria', 'principal')
              ->orderByDesc('numero_version')
              ->first();

          return DB::transaction(function () use ($usuario, $convenio, $datos, $ruta, $principal) {
              Firma::create([
                  'convenio_id' => $convenio->id,
                  'user_id' => $usuario->id,
                  'firma_ruta' => $ruta,
                  'firmado_en' => now(),
                  'latitud' => $datos['latitud'] ?? null,
                  'longitud' => $datos['longitud'] ?? null,
                  'biometria_ok' => (bool) ($datos['biometria_ok'] ?? false),
                  'sha256_documento' => $principal?->sha256,
              ]);

              if (! $convenio->fecha_firma) {
                  $convenio->update(['fecha_firma' => now()->toDateString()]);
              }

              return $this->cambiar($usuario, $convenio, 'firmado', "Firmado por {$usuario->name}");
          });
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
