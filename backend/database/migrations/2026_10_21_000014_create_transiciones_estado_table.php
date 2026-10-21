<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Historial del circuito de estados con su fundamento
    public function up(): void
    {
        Schema::create('transiciones_estado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->enum('estado_desde', ['borrador', 'revision', 'aprobado', 'firmado', 'rescindido', 'archivado'])->nullable();
            $table->enum('estado_hasta', ['borrador', 'revision', 'aprobado', 'firmado', 'rescindido', 'archivado']);
            $table->text('fundamento');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transiciones_estado');
    }
};
