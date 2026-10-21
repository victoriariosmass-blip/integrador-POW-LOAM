<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Unidades académicas / dependencias de la UNLPam
    public function up(): void
    {
        Schema::create('unidades', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('sigla', 15)->unique();
            $table->decimal('latitud', 10, 7)->nullable()->comment('Sede, para detectar ingreso (app)');
            $table->decimal('longitud', 10, 7)->nullable();
            $table->unsignedSmallInteger('radio_metros')->nullable()->default(200);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unidades');
    }
};
