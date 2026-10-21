<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Solo para filas de convenio_persona con rol = pasante
    public function up(): void
    {
        Schema::create('datos_pasantia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_persona_id')->unique()->constrained('convenio_persona')->cascadeOnDelete();
            $table->string('carrera', 150);
            $table->foreignId('tutor_docente_id')->nullable()->constrained('personas')->nullOnDelete();
            $table->foreignId('tutor_institucional_id')->nullable()->constrained('personas')->nullOnDelete();
            $table->unsignedTinyInteger('horas_semanales')->comment('Máximo 20 (Ley 26.427)');
            $table->decimal('asignacion_estimulo', 12, 2)->nullable();
            $table->string('seguro', 150)->nullable()->comment('ART / aseguradora');
            $table->string('obra_social', 150)->nullable();
            $table->text('plan_trabajo')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('datos_pasantia');
    }
};
