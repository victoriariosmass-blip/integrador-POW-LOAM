<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Partes de cada convenio con su representante. Regla (en la API): >= 2 partes para aprobar.
    public function up(): void
    {
        Schema::create('convenio_parte', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('parte_id')->constrained('partes');
            $table->string('representante_nombre', 150);
            $table->string('representante_cargo', 150)->nullable()->comment('Ej: Rector/a, Decano/a');
            $table->boolean('es_firmante')->default(true);
            $table->unique(['convenio_id', 'parte_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convenio_parte');
    }
};
