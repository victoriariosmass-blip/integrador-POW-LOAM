<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Observación de revisión (tipo = observacion) o comentario entre usuarios */
class Comentario extends Model
{
    protected $table = 'comentarios';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'es_ofensivo' => 'boolean',
            'resuelto_en' => 'datetime',
        ];
    }

    public function convenio(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resueltoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resuelto_por');
    }
}
