<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Datos de prueba FICTICIOS. Correr con:
     *   php artisan migrate:fresh --seed
     */
    public function run(): void
    {
        $this->call([
            UnidadSeeder::class,
            UserSeeder::class,
            ParteSeeder::class,
            PersonaSeeder::class,
            ConvenioSeeder::class,
        ]);
    }
}
