<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('accion', 50)->comment('crear, editar, cambiar_estado, descargar...');
            $table->string('entidad', 50)->comment('convenio, documento, usuario...');
            $table->unsignedBigInteger('entidad_id')->nullable();
            $table->string('ip', 45)->nullable();
            $table->json('detalle')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['entidad', 'entidad_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
    }
};
