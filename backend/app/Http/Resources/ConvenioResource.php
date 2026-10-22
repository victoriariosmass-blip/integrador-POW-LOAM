<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConvenioResource extends JsonResource
{
    /**
     * Datos del convenio + qué puede hacer el usuario logueado con él.
     * La web y la app usan "permisos" para mostrar u ocultar botones,
     * así las reglas quedan solo en la API (ConvenioPolicy).
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::toArray($request),
            'permisos' => [
                'editar' => $user->can('update', $this->resource),
                'enviar_revision' => $user->can('enviarARevision', $this->resource),
                'revisar' => $user->can('revisar', $this->resource),
                'firmar' => $user->can('firmar', $this->resource),
                'rescindir' => $user->can('rescindir', $this->resource),
                'archivar' => $user->can('archivar', $this->resource),
                'comentar' => $user->can('comentar', $this->resource),
            ],
        ];
    }
}
