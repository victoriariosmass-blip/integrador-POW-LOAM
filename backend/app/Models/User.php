<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'unidad_id',
        'puede_firmar',
        'tamano_letra',
        'tema',
        'foto_ruta',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'puede_firmar' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    // ---------------------------------------------------------------
    // Relaciones
    // ---------------------------------------------------------------

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function identidad(): HasOne
    {
        return $this->hasOne(IdentidadUsuario::class, 'user_id');
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class, 'user_id');
    }

    public function dispositivos(): HasMany
    {
        return $this->hasMany(Dispositivo::class, 'user_id');
    }

    // ---------------------------------------------------------------
    // Alcance: un usuario sin unidad ve todo; con unidad, solo la suya
    // ---------------------------------------------------------------

    public function esGlobal(): bool
    {
        return $this->unidad_id === null;
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'admin';
    }
}
