<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Ficha del convenio. Marcos, específicos, adendas, renovaciones y
 * sustituciones son todos instrumentos de esta tabla, unidos por vinculos_convenio.
 */
class Convenio extends Model
{
    protected $table = 'convenios';

    protected $guarded = ['id'];

    public const TIPOS = [
        'marco_colaboracion',
        'especifico_colaboracion',
        'marco_pasantia',
        'especifico_pasantia',
        'adenda',
    ];

    public const ESTADOS = [
        'borrador',
        'revision',
        'aprobado',
        'firmado',
        'rescindido',
        'archivado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_firma' => 'date',
            'fecha_inicio' => 'date',
            'fecha_vencimiento' => 'date',
            'confidencial' => 'boolean',
            'renovacion_automatica' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Referencia opaca para el QR, generada automáticamente
        static::creating(function (Convenio $convenio) {
            if (empty($convenio->ref_publica)) {
                $convenio->ref_publica = (string) Str::uuid();
            }
        });
    }

    // ---------------------------------------------------------------
    // Relaciones
    // ---------------------------------------------------------------

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function partes(): BelongsToMany
    {
        return $this->belongsToMany(Parte::class, 'convenio_parte', 'convenio_id', 'parte_id')
            ->withPivot(['representante_nombre', 'representante_cargo', 'es_firmante']);
    }

    public function personas(): HasMany
    {
        return $this->hasMany(ConvenioPersona::class, 'convenio_id');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'convenio_id');
    }

    public function transiciones(): HasMany
    {
        return $this->hasMany(TransicionEstado::class, 'convenio_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'convenio_id');
    }

    public function firmas(): HasMany
    {
        return $this->hasMany(Firma::class, 'convenio_id');
    }

    /** Instrumentos de los que este depende (su marco, el convenio que modifica, etc.) */
    public function antecedentes(): BelongsToMany
    {
        return $this->belongsToMany(Convenio::class, 'vinculos_convenio', 'convenio_origen_id', 'convenio_destino_id')
            ->withPivot('tipo');
    }

    /** Instrumentos que dependen de este (específicos, adendas, renovaciones) */
    public function derivados(): BelongsToMany
    {
        return $this->belongsToMany(Convenio::class, 'vinculos_convenio', 'convenio_destino_id', 'convenio_origen_id')
            ->withPivot('tipo');
    }

    // ---------------------------------------------------------------
    // Plazos
    // ---------------------------------------------------------------

    public function fechaPreaviso(): ?Carbon
    {
        if (! $this->fecha_vencimiento || ! $this->dias_preaviso) {
            return null;
        }

        return $this->fecha_vencimiento->copy()->subDays($this->dias_preaviso);
    }

    public function estaVigente(): bool
    {
        return $this->estado === 'firmado'
            && ($this->fecha_vencimiento === null || $this->fecha_vencimiento->gte(today()));
    }

    public function textoVencimiento(): string
    {
        return $this->fecha_vencimiento?->format('d/m/Y') ?? 'Sin vencimiento registrado';
    }

    // ---------------------------------------------------------------
    // Alcance por unidad: Convenio::visiblesPara($user)->get()
    // ---------------------------------------------------------------

    public function scopeVisiblesPara(Builder $query, User $user): Builder
    {
        return $user->esGlobal() ? $query : $query->where('unidad_id', $user->unidad_id);
    }
}
