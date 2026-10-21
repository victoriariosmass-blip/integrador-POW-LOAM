<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Unidad académica o dependencia de la UNLPam */
class Unidad extends Model
{
    protected $table = 'unidades';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'latitud' => 'float',
            'longitud' => 'float',
        ];
    }

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'unidad_id');
    }

    public function convenios(): HasMany
    {
        return $this->hasMany(Convenio::class, 'unidad_id');
    }
}
