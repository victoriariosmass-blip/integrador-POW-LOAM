<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Relación entre instrumentos: origen = nuevo, destino = antecedente */
class VinculoConvenio extends Model
{
    protected $table = 'vinculos_convenio';

    protected $guarded = ['id'];

    const UPDATED_AT = null;

    public function origen(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_origen_id');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_destino_id');
    }
}
