<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Se mantiene la tabla "users" de Laravel (login, sesiones y tokens dependen de ella)
    // y se le agregan las columnas del proyecto.
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['admin', 'gestor', 'revisor', 'consulta'])->default('consulta')->after('password');
            $table->foreignId('unidad_id')->nullable()->after('rol')
                ->comment('NULL = alcance global')
                ->constrained('unidades')->nullOnDelete();
            $table->boolean('puede_firmar')->default(false)->after('unidad_id')->comment('Autoridad firmante');
            $table->enum('tamano_letra', ['chica', 'mediana', 'grande'])->default('mediana')->after('puede_firmar');
            $table->enum('tema', ['claro', 'oscuro', 'sistema'])->default('sistema')->after('tamano_letra');
            $table->string('foto_ruta')->nullable()->after('tema');
            $table->boolean('activo')->default(true)->after('foto_ruta');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('unidad_id');
            $table->dropColumn(['rol', 'puede_firmar', 'tamano_letra', 'tema', 'foto_ruta', 'activo']);
        });
    }
};
