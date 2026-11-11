<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConvenioPublicoResource extends JsonResource
{
    /**
     * Lo que ve cualquier persona sin iniciar sesión.
     * Solo datos públicos: nada de notas, versión, usuarios ni documentos.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // la app lo usa para abrir la ficha completa al escanear el QR
            'ref' => $this->ref_publica,
            'codigo' => $this->codigo,
            'titulo' => $this->titulo,
            'tipo' => $this->tipo,
            'objeto' => $this->objeto,
            'unidad' => $this->unidad?->nombre,
            'contrapartes' => $this->partes->where('tipo', '!=', 'universidad')->pluck('nombre')->values(),
            'fecha_firma' => $this->fecha_firma?->toDateString(),
            'fecha_vencimiento' => $this->fecha_vencimiento?->toDateString(),
            'vigente' => $this->estaVigente(),
            // en el detalle: los convenios relacionados que también son públicos
            'relacionados' => $this->when($this->relationLoaded('antecedentes'), fn () => $this->antecedentes
                ->concat($this->derivados)
                ->filter(fn ($c) => $c->estado === 'firmado' && ! $c->confidencial)
                ->map(fn ($c) => ['ref' => $c->ref_publica, 'codigo' => $c->codigo, 'titulo' => $c->titulo, 'tipo' => $c->tipo])
                ->values()),
        ];
    }
}