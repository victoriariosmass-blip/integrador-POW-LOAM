<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Ficha del convenio. Marcos, específicos, adendas, renovaciones y sustituciones son todos filas de esta tabla.
    public function up(): void
    {
        Schema::create('convenios', function (Blueprint $table) {
            $table->id();
            $table->uuid('ref_publica')->unique()->comment('UUID para el QR (no expone datos)');
            $table->string('codigo', 20)->unique()->comment('Ej: MC-2026-0001');
            $table->string('titulo');
            $table->enum('tipo', [
                'marco_colaboracion', 'especifico_colaboracion',
                'marco_pasantia', 'especifico_pasantia', 'adenda',
            ])->index();
            $table->foreignId('unidad_id')->comment('Unidad responsable')->constrained('unidades');
            $table->text('objeto');
            $table->text('alcance')->nullable();
            $table->text('obligaciones')->nullable();
            $table->text('condiciones_rescision')->nullable();
            $table->text('marco_legal')->nullable();
            $table->string('resolucion', 50)->nullable()->comment('Ej: 123/2026');
            $table->string('expediente', 50)->nullable()->comment('Ej: 1754/2026');
            $table->text('condiciones_renovacion')->nullable();
            $table->boolean('renovacion_automatica')->default(false);
            $table->boolean('confidencial')->default(false);
            $table->text('notas')->nullable();
            $table->date('fecha_firma')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_vencimiento')->nullable()->index()->comment('NULL = sin vencimiento registrado');
            $table->unsignedSmallInteger('dias_preaviso')->nullable();
            $table->enum('estado', ['borrador', 'revision', 'aprobado', 'firmado', 'rescindido', 'archivado'])->default('borrador')->index();
            $table->unsignedInteger('version')->default(1)->comment('Control de concurrencia');
            $table->foreignId('creado_por')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convenios');
    }
};
