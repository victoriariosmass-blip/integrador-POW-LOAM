<?php

namespace Database\Seeders;

use App\Models\Persona;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PersonaSeeder extends Seeder
{
    /** Personas FICTICIAS */
    public function run(): void
    {
        $nombres = [
            ['Lucía', 'Benítez'], ['Tomás', 'Aguirre'], ['Valentina', 'Correa'], ['Mateo', 'Funes'],
            ['Julieta', 'Iriarte'], ['Santiago', 'Lucero'], ['Camila', 'Medina'], ['Joaquín', 'Ortiz'],
            ['Florencia', 'Paz'], ['Nicolás', 'Quiroga'], ['Martina', 'Rivas'], ['Bruno', 'Sosa'],
            ['Agustina', 'Torres'], ['Facundo', 'Vera'], ['Paula', 'Zárate'], ['Ignacio', 'Arce'],
            ['Sofía', 'Bustos'], ['Lautaro', 'Cabral'], ['Micaela', 'Domínguez'], ['Diego', 'Escudero'],
        ];

        foreach ($nombres as $i => [$nombre, $apellido]) {
            Persona::create([
                'nombre' => $nombre,
                'apellido' => $apellido,
                'documento' => (string) (90000001 + $i),
                'email' => Str::lower(Str::ascii($nombre) . '.' . Str::ascii($apellido)) . '@ejemplo.test',
            ]);
        }
    }
}
