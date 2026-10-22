<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // La autoridad firmante pasa de ser un permiso (puede_firmar) a un rol propio
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY rol ENUM('admin','gestor','revisor','consulta','autoridad') NOT NULL DEFAULT 'consulta'");

        DB::table('users')->where('puede_firmar', true)->update(['rol' => 'autoridad']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('puede_firmar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('puede_firmar')->default(false)->after('unidad_id');
        });

        DB::table('users')->where('rol', 'autoridad')->update(['rol' => 'consulta', 'puede_firmar' => true]);

        DB::statement("ALTER TABLE users MODIFY rol ENUM('admin','gestor','revisor','consulta') NOT NULL DEFAULT 'consulta'");
    }
};