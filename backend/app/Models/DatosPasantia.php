<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Datos complementarios de un pasante (Ley 26.427) */
class DatosPasantia extends Model
{
    protected $table = 'datos_pasantia';

    protected $guarded = ['id'];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'asignacion_estimulo' => 'decimal:2',
        ];
    }

    public function convenioPersona(): BelongsTo
    {
        return $this->belongsTo(ConvenioPersona::class, 'convenio_persona_id');
    }

    public function tutorDocente(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'tutor_docente_id');
    }

    public function tutorInstitucional(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'tutor_institucional_id');
    }
}
