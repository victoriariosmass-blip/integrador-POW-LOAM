<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones_revision', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('revisor_id')->constrained('users');
            $table->foreignId('asignado_por')->constrained('users');
            $table->dateTime('asignado_en');
            $table->dateTime('completado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones_revision');
    }
};
