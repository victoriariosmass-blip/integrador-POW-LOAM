<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Observaciones de revisión (TPI) y comentarios entre usuarios (LDMOV)
    public function up(): void
    {
        Schema::create('comentarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->enum('tipo', ['observacion', 'comentario']);
            $table->text('contenido');
            $table->boolean('es_ofensivo')->default(false)->comment('Si es true se muestra "comentario ofensivo"');
            $table->enum('estado', ['pendiente', 'resuelta'])->nullable()->comment('Solo para observaciones');
            $table->text('respuesta')->nullable()->comment('Respuesta/corrección del equipo gestor');
            $table->foreignId('resuelto_por')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('resuelto_en')->nullable();
            $table->timestamps();
            $table->index(['convenio_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comentarios');
    }
};
