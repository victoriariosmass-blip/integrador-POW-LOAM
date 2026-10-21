<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Registrar mi identidad (LDMOV)
    public function up(): void
    {
        Schema::create('identidades_usuario', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->string('firma_ruta')->nullable()->comment('Imagen de la firma registrada');
            $table->dateTime('rostro_registrado_en')->nullable();
            $table->dateTime('huella_registrada_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identidades_usuario');
    }
};
