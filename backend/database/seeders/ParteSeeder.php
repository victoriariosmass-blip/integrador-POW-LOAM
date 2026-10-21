<?php

namespace Database\Seeders;

use App\Models\Parte;
use Illuminate\Database\Seeder;

class ParteSeeder extends Seeder
{
    /** Contrapartes FICTICIAS (nombres y CUIT inventados) */
    public function run(): void
    {
        $partes = [
            ['nombre' => 'Universidad Nacional de La Pampa', 'tipo' => 'universidad', 'cuit' => null],
            ['nombre' => 'Municipalidad de Villa Caldén', 'tipo' => 'organismo_publico', 'cuit' => '30-99000001-1'],
            ['nombre' => 'Ministerio de Producción Pampeano (ficticio)', 'tipo' => 'organismo_publico', 'cuit' => '30-99000002-2'],
            ['nombre' => 'AgroPampa Servicios S.A.', 'tipo' => 'empresa', 'cuit' => '30-99000003-3'],
            ['nombre' => 'Software del Oeste S.R.L.', 'tipo' => 'empresa', 'cuit' => '30-99000004-4'],
            ['nombre' => 'Cooperativa Eléctrica Llanura', 'tipo' => 'empresa', 'cuit' => '30-99000005-5'],
            ['nombre' => 'Laboratorio Veterinario Médanos', 'tipo' => 'empresa', 'cuit' => '30-99000006-6'],
            ['nombre' => 'Universidad Nacional del Sur Ficticio', 'tipo' => 'universidad', 'cuit' => '30-99000007-7'],
            ['nombre' => 'Fundación Horizonte Pampeano', 'tipo' => 'ong', 'cuit' => '30-99000008-8'],
            ['nombre' => 'Hospital Regional Caldenal', 'tipo' => 'organismo_publico', 'cuit' => '30-99000009-9'],
        ];

        foreach ($partes as $parte) {
            Parte::create($parte);
        }
    }
}
