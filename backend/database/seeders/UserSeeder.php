<?php

namespace Database\Seeders;

use App\Models\Unidad;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Un usuario por rol. Contraseña de todos: password
     * (solo para desarrollo; documentarlo en el README).
     */
    public function run(): void
    {
        $fi = Unidad::where('sigla', 'FI')->value('id');
        $fceyn = Unidad::where('sigla', 'FCEyN')->value('id');

        $usuarios = [
            ['name' => 'Ana Admin', 'email' => 'admin@convenios.test', 'rol' => 'admin', 'unidad_id' => null],
            ['name' => 'Rita Rectora', 'email' => 'autoridad@convenios.test', 'rol' => 'consulta', 'unidad_id' => null, 'puede_firmar' => true],
            ['name' => 'Gabriel Gestor', 'email' => 'gestor.fi@convenios.test', 'rol' => 'gestor', 'unidad_id' => $fi],
            ['name' => 'Gisela Gestora', 'email' => 'gestor.fceyn@convenios.test', 'rol' => 'gestor', 'unidad_id' => $fceyn],
            ['name' => 'Raúl Revisor', 'email' => 'revisor@convenios.test', 'rol' => 'revisor', 'unidad_id' => null],
            ['name' => 'Carla Consulta', 'email' => 'consulta.fi@convenios.test', 'rol' => 'consulta', 'unidad_id' => $fi],
        ];

        foreach ($usuarios as $usuario) {
            User::create($usuario + [
                'password' => 'password',
            ]);
        }
    }
}
