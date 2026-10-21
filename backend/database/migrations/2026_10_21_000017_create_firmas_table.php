<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Firma registrada (NO es firma digital)
    public function up(): void
    {
        Schema::create('firmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('firma_ruta')->comment('Imagen de la firma a mano');
            $table->dateTime('firmado_en');
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->boolean('biometria_ok')->default(false);
            $table->char('sha256_documento', 64)->nullable()->comment('Hash del PDF principal firmado');
            $table->timestamp('created_at')->nullable();
            $table->unique(['convenio_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('firmas');
    }
};
