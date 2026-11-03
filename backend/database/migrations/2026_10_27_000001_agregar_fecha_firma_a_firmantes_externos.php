<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Firmantes que NO son usuarios del sistema (lo acordado con la cátedra):
    // en el sistema solo firma la autoridad; de los demás se registra la fecha
    // en que firmaron en papel.
    //   - convenio_persona: pasante, tutor de la facultad, tutor de la empresa
    //   - convenio_parte: representante de la empresa (dueño, titular, gerente)
    public function up(): void
    {
        Schema::table('convenio_persona', function (Blueprint $table) {
            $table->date('firmo_en')->nullable()->after('fecha_hasta')->comment('Fecha en que firmó (registro, no firma en el sistema)');
        });

        Schema::table('convenio_parte', function (Blueprint $table) {
            $table->date('firmo_en')->nullable()->after('es_firmante')->comment('Fecha en que firmó el representante');
        });
    }

    public function down(): void
    {
        Schema::table('convenio_persona', function (Blueprint $table) {
            $table->dropColumn('firmo_en');
        });

        Schema::table('convenio_parte', function (Blueprint $table) {
            $table->dropColumn('firmo_en');
        });
    }
};