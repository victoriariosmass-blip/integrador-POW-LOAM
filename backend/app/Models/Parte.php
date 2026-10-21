<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** Institución firmante (UNLPam, empresa, organismo, etc.) */
class Parte extends Model
{
    protected $table = 'partes';

    protected $guarded = ['id'];

    public function convenios(): BelongsToMany
    {
        return $this->belongsToMany(Convenio::class, 'convenio_parte', 'parte_id', 'convenio_id')
            ->withPivot(['representante_nombre', 'representante_cargo', 'es_firmante']);
    }
}
