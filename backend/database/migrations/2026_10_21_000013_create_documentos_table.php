<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // PDFs. Nunca se borran: cada carga es una versión nueva.
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->enum('categoria', ['principal', 'anexo', 'dictamen', 'resolucion', 'otro']);
            $table->string('nombre_original');
            $table->string('ruta')->comment('storage/app/private/...');
            $table->unsignedInteger('tamano_bytes')->comment('Máximo 20 MB');
            $table->char('sha256', 64);
            $table->unsignedInteger('numero_version')->default(1);
            $table->json('marca')->nullable()->comment('Metadatos estampados por la API');
            $table->foreignId('subido_por')->constrained('users');
            $table->timestamp('created_at')->nullable();
            $table->index(['convenio_id', 'categoria']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
