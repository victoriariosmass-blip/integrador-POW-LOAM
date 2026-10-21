<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Registro de cada cambio de estado con su fundamento */
class TransicionEstado extends Model
{
    protected $table = 'transiciones_estado';

    protected $guarded = ['id'];

    const UPDATED_AT = null;

    public function convenio(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
