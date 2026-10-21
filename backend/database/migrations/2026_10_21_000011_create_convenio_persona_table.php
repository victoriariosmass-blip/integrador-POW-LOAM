<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Personas vinculadas a un convenio, con rol y período
    public function up(): void
    {
        Schema::create('convenio_persona', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('persona_id')->constrained('personas');
            $table->enum('rol', ['pasante', 'tutor_docente', 'tutor_institucional', 'responsable', 'coordinador', 'otro']);
            $table->date('fecha_desde')->nullable();
            $table->date('fecha_hasta')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convenio_persona');
    }
};
