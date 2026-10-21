<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Firma registrada (no es firma digital) */
class Firma extends Model
{
    protected $table = 'firmas';

    protected $guarded = ['id'];

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'firmado_en' => 'datetime',
            'biometria_ok' => 'boolean',
            'latitud' => 'float',
            'longitud' => 'float',
        ];
    }

    public function convenio(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
