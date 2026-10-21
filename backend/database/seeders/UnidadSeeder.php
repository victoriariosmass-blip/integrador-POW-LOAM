<?php

namespace Database\Seeders;

use App\Models\Unidad;
use Illuminate\Database\Seeder;

class UnidadSeeder extends Seeder
{
    public function run(): void
    {
        // Coordenadas APROXIMADAS de las sedes (ajustarlas si hace falta)
        $unidades = [
            ['nombre' => 'Rectorado', 'sigla' => 'RECT', 'latitud' => -36.6167, 'longitud' => -64.2869],
            ['nombre' => 'Facultad de Agronomía', 'sigla' => 'FA', 'latitud' => -36.5480, 'longitud' => -64.2990],
            ['nombre' => 'Facultad de Ciencias Económicas y Jurídicas', 'sigla' => 'FCEyJ', 'latitud' => -36.6194, 'longitud' => -64.2903],
            ['nombre' => 'Facultad de Ciencias Exactas y Naturales', 'sigla' => 'FCEyN', 'latitud' => -36.5495, 'longitud' => -64.2975],
            ['nombre' => 'Facultad de Ciencias Humanas', 'sigla' => 'FCH', 'latitud' => -36.6208, 'longitud' => -64.2958],
            ['nombre' => 'Facultad de Ciencias Veterinarias', 'sigla' => 'FCV', 'latitud' => -35.6588, 'longitud' => -63.7569],
            ['nombre' => 'Facultad de Ingeniería', 'sigla' => 'FI', 'latitud' => -35.6633, 'longitud' => -63.7564],
            ['nombre' => 'Facultad de Ciencias de la Salud', 'sigla' => 'FCS', 'latitud' => -36.6250, 'longitud' => -64.2950],
        ];

        foreach ($unidades as $unidad) {
            Unidad::create($unidad + ['radio_metros' => 200]);
        }
    }
}
