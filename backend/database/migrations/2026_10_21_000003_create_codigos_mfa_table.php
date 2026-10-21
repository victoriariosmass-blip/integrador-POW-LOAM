<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('codigos_mfa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('codigo_hash')->comment('Nunca el código en texto plano');
            $table->enum('canal', ['email', 'sms', 'push'])->default('email');
            $table->dateTime('expira_en');
            $table->dateTime('usado_en')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codigos_mfa');
    }
};
