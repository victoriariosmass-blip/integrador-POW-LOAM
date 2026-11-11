<?php
  namespace App\Services;

  use App\Models\Convenio;
  use App\Models\Documento;
  use App\Models\User;
  use Illuminate\Http\UploadedFile;
  use Illuminate\Support\Facades\Gate;
  use Illuminate\Support\Str;

  /**
   * PDF y anexos de un convenio. Nunca se borran ni se pisan: cada carga
   * es una versión nueva de su categoría, con el hash SHA-256 del archivo
   * para poder comprobar después que no se modificó.
   */
  class DocumentoService
  {
      public function subir(User $usuario, Convenio $convenio, UploadedFile $archivo, string $categoria): Documento
      {
          Gate::forUser($usuario)->authorize('update', $convenio); // borrador + admin o gestor de la unidad

          // Además de la extensión, se mira el contenido: un PDF empieza con "%PDF"
          if (file_get_contents($archivo->getRealPath(), false, null, 0, 4) !== '%PDF') {
              abort(422, 'El archivo no es un PDF válido');
          }

          $version = Documento::where('convenio_id', $convenio->id)->where('categoria', $categoria)->max('numero_version') + 1;
          $ruta = $archivo->storeAs("documentos/{$convenio->id}", Str::uuid() . '.pdf', 'local');

          return Documento::create([
              'convenio_id' => $convenio->id,
              'categoria' => $categoria,
              'nombre_original' => $archivo->getClientOriginalName(),
              'ruta' => $ruta,
              'tamano_bytes' => $archivo->getSize(),
              'sha256' => hash_file('sha256', $archivo->getRealPath()),
              'numero_version' => $version,
              'marca' => ['subido_por' => $usuario->name, 'subido_en' => now()->toIso8601String(), 'convenio' => $convenio->codigo],
              'subido_por' => $usuario->id,
              'created_at' => now(),
          ]);
      }
  }
