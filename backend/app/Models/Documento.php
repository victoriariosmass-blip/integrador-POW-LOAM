<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** PDF asociado a un convenio. Nunca se borra: cada carga es una versión. */
class Documento extends Model
{
    protected $table = 'documentos';

    protected $guarded = ['id'];

    // la ruta en el disco no sale en el JSON
    protected $hidden = ['ruta'];

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'marca' => 'array',
        ];
    }

    public function convenio(): BelongsTo
    {
        return $this->belongsTo(Convenio::class, 'convenio_id');
    }

    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por');
    }
}
