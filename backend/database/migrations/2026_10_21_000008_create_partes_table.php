<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Instituciones firmantes
    public function up(): void
    {
        Schema::create('partes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->enum('tipo', ['universidad', 'unidad_academica', 'empresa', 'organismo_publico', 'ong', 'otro']);
            $table->string('cuit', 13)->nullable()->unique()->comment('Ficticio');
            $table->string('domicilio')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partes');
    }
};
