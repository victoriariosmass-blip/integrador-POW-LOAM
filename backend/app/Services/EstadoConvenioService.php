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
  use App\Models\Notificacion;
  use Illuminate\Support\Facades\Storage;
  use Illuminate\Support\Str;


  /**
   * Circuito de estados del convenio:
   * borrador -> revision -> aprobado -> firmado -> rescindido / archivado
   * Cada cambio controla el permiso con ConvenioPolicy y queda en transiciones_estado.
   */
  class EstadoConvenioService
  {
      /**
       * Pasa a revisión y la asigna sola a un revisor con alcance sobre la unidad del convenio
       * (si no hay de la unidad, uno global). Enunciado: "Disparadores: generar un aviso cuando
       * se asigne una revisión". Si no hay ningún revisor activo, queda sin asignar y la revisa admin.
       */
      public function enviarARevision(User $usuario, Convenio $convenio): Convenio
      {
          Gate::forUser($usuario)->authorize('enviarARevision', $convenio);
          $this->exigirDosPartes($convenio);

          return DB::transaction(function () use ($usuario, $convenio) {
              $convenio = $this->cambiar($usuario, $convenio, 'revision', 'Enviado a revisión');

              $revisor = $this->revisorPara($convenio);
              if ($revisor) {
                  AsignacionRevision::create([
                      'convenio_id' => $convenio->id,
                      'revisor_id' => $revisor->id,
                      'asignado_por' => $usuario->id,
                      'asignado_en' => now(),
                  ]);
                  $this->avisar($revisor, $convenio, 'revision_asignada', 'Revisión asignada',
                      'Se te asignó para revisar: aprobalo o devolvelo con observaciones.');
              }

              return $convenio;
          });
      }

      public function aprobar(User $usuario, Convenio $convenio, ?string $fundamento): Convenio
      {
          Gate::forUser($usuario)->authorize('revisar', $convenio);
          $this->exigirDosPartes($convenio);

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
      // El admin le asigna el convenio a otro revisor (al enviarlo a revisión ya se asigna uno solo).
      // Aprobar y devolver: solo el revisor asignado o admin (ConvenioPolicy::revisar).
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

              $desde = $convenio->estado;
              $convenio->update([
                  'estado' => $hasta,
                  'version' => $convenio->version + 1,
              ]);
              $convenio = $convenio->fresh();

              // Enunciado: "Disparadores: generar un aviso cuando ... cambie el estado de un instrumento".
              // Le llega a quien cargó el convenio (si no fue quien hizo el cambio).
              $creador = $convenio->creador;
              if ($creador && $creador->activo && $creador->id !== $usuario->id) {
                  $devuelto = $desde === 'revision' && $hasta === 'borrador';
                  $this->avisar(
                      $creador,
                      $convenio,
                      $hasta === 'rescindido' ? 'convenio_rescindido' : 'cambio_estado',
                      $devuelto ? 'Devuelto con observaciones' : 'Pasó a ' . (self::ESTADOS[$hasta] ?? $hasta),
                      $devuelto ? 'Observaciones: ' . Str::limit($fundamento, 200) : null,
                  );
              }

              return $convenio;
          });
      }

      /** Revisor activo de la unidad del convenio; si no hay, uno global (sin unidad) */
      private function revisorPara(Convenio $convenio): ?User
      {
          $revisores = fn () => User::where('rol', 'revisor')->where('activo', true)->orderBy('id');

          return $revisores()->where('unidad_id', $convenio->unidad_id)->first()
              ?? $revisores()->whereNull('unidad_id')->first();
      }

      /**
       * Guarda el aviso en notificaciones (la web lo muestra en Alertas y en la campanita).
       * Enunciado: "Contenido mínimo del aviso: código y título del convenio, tipo, estado o fecha
       * relevante y una acción o enlace que conduzca a la pantalla autorizada correspondiente."
       */
      private function avisar(User $destino, Convenio $convenio, string $tipo, string $evento, ?string $detalle = null): void
      {
          $cuerpo = $convenio->titulo
              . ' · ' . (self::TIPOS[$convenio->tipo] ?? $convenio->tipo)
              . ' · Estado: ' . (self::ESTADOS[$convenio->estado] ?? $convenio->estado)
              . ($detalle ? ". {$detalle}" : '');

          Notificacion::create([
              'user_id' => $destino->id,
              'convenio_id' => $convenio->id,
              'tipo' => $tipo,
              'titulo' => "{$convenio->codigo} · {$evento}",
              'cuerpo' => $cuerpo,
              'enlace' => "/convenios/{$convenio->id}",
              'created_at' => now(),
          ]);
      }

      private const TIPOS = [
          'marco_colaboracion' => 'Marco de colaboración',
          'especifico_colaboracion' => 'Específico de colaboración',
          'marco_pasantia' => 'Marco de pasantías',
          'especifico_pasantia' => 'Específico de pasantía',
          'adenda' => 'Adenda',
      ];

      private const ESTADOS = [
          'borrador' => 'Borrador',
          'revision' => 'En revisión',
          'aprobado' => 'Aprobado',
          'firmado' => 'Firmado',
          'rescindido' => 'Rescindido',
          'archivado' => 'Archivado',
      ];
    // Enunciado: "Antes de aprobar un convenio deben existir al menos dos partes."
      // Se controla también al enviarlo a revisión, para que el gestor lo sepa antes.
      private function exigirDosPartes(Convenio $convenio): void
      {
          if ($convenio->partes()->count() < 2) {
              abort(422, 'El convenio necesita al menos dos partes (por ejemplo, la UNLPam o la unidad académica y la contraparte) antes de enviarse a revisión o aprobarse.');
          }
      }
      private function cerrarAsignacion(Convenio $convenio): void
      {
          $convenio->asignaciones()->whereNull('completado_en')->update(['completado_en' => now()]);
      }
  }
