<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Árbol de instrumentos. origen = instrumento nuevo; destino = su antecedente.
    public function up(): void
    {
        Schema::create('vinculos_convenio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_origen_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('convenio_destino_id')->constrained('convenios')->cascadeOnDelete();
            $table->enum('tipo', ['especifico_de', 'adenda_de', 'renueva_a', 'sustituye_a']);
            $table->foreignId('creado_por')->constrained('users');
            $table->timestamp('created_at')->nullable();
            $table->unique(['convenio_origen_id', 'convenio_destino_id', 'tipo'], 'uq_vinculo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vinculos_convenio');
    }
};
