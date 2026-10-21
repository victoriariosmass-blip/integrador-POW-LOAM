<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Persona vinculada a convenios (datos ficticios) */
class Persona extends Model
{
    protected $table = 'personas';

    protected $guarded = ['id'];

    public function vinculaciones(): HasMany
    {
        return $this->hasMany(ConvenioPersona::class, 'persona_id');
    }

    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombre} {$this->apellido}";
    }
}
