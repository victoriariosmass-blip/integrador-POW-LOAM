<?php

namespace App\Http\Requests;

use App\Models\Convenio;
use Illuminate\Foundation\Http\FormRequest;

class UpdateConvenioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el permiso lo controla ConvenioPolicy en el servicio
    }

    public function rules(): array
    {
        return [
            // version: la que tenía el convenio cuando el usuario lo abrió (control de concurrencia)
            'version' => ['required', 'integer'],
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'tipo' => ['sometimes', 'required', 'in:' . implode(',', Convenio::TIPOS)],
            'objeto' => ['sometimes', 'required', 'string'],
            'alcance' => ['sometimes', 'nullable', 'string'],
            'obligaciones' => ['sometimes', 'nullable', 'string'],
            'condiciones_rescision' => ['sometimes', 'nullable', 'string'],
            'marco_legal' => ['sometimes', 'nullable', 'string'],
            'resolucion' => ['sometimes', 'nullable', 'string', 'max:50'],
            'expediente' => ['sometimes', 'nullable', 'string', 'max:50'],
            'condiciones_renovacion' => ['sometimes', 'nullable', 'string'],
            'renovacion_automatica' => ['sometimes', 'boolean'],
            'confidencial' => ['sometimes', 'boolean'],
            'notas' => ['sometimes', 'nullable', 'string'],
            'fecha_firma' => ['sometimes', 'nullable', 'date'],
            'fecha_inicio' => ['sometimes', 'nullable', 'date'],
            'fecha_vencimiento' => ['sometimes', 'nullable', 'date', 'after:fecha_inicio'],
            'dias_preaviso' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
