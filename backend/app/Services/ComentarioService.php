<?php
  namespace App\Services;

  use App\Models\Comentario;
  use App\Models\Convenio;
  use App\Models\User;
  use Illuminate\Support\Facades\Gate;
  use Illuminate\Support\Str;

  /**
   * Comentarios entre usuarios sobre un convenio (app).
   * Si el texto tiene lenguaje ofensivo se guarda igual, marcado con es_ofensivo,
   * y al listarlo se muestra "Comentario ofensivo" en lugar del texto.
   */
  class ComentarioService
  {
      public function listar(User $usuario, Convenio $convenio): array
      {
          Gate::forUser($usuario)->authorize('view', $convenio);

          return $convenio->comentarios()
              ->where('tipo', 'comentario')
              ->with('autor:id,name,rol')
              ->orderBy('created_at')->orderBy('id')
              ->get()
              ->map(fn (Comentario $c) => $this->paraMostrar($c))
              ->all();
      }

      public function crear(User $usuario, Convenio $convenio, string $contenido): array
      {
          Gate::forUser($usuario)->authorize('comentar', $convenio); // consulta no comenta

          $comentario = Comentario::create([
              'convenio_id' => $convenio->id,
              'user_id' => $usuario->id,
              'tipo' => 'comentario',
              'contenido' => $contenido,
              'es_ofensivo' => $this->esOfensivo($contenido),
          ]);

          return $this->paraMostrar($comentario->load('autor:id,name,rol'));
      }

      public function esOfensivo(string $texto): bool
      {
          // Sin tildes, en minúscula y solo letras: "¡IDIOTA!" -> "idiota"
          $normal = Str::lower(Str::ascii($texto));
          $palabras = preg_split('/[^a-z]+/', $normal, -1, PREG_SPLIT_NO_EMPTY);

          return count(array_intersect($palabras, config('ofensivas.palabras'))) > 0;
      }

      private function paraMostrar(Comentario $c): array
      {
          return [
              'id' => $c->id,
              'contenido' => $c->es_ofensivo ? 'Comentario ofensivo' : $c->contenido,
              'es_ofensivo' => $c->es_ofensivo,
              'autor' => $c->autor,
              'created_at' => $c->created_at,
          ];
      }
  }