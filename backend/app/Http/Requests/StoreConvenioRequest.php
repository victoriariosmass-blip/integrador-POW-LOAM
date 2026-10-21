<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConvenioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string'],
            'unidad_id' => ['nullable', 'exists:unidades,id'],
            'fecha_firma' => ['nullable', 'date'],
            'fecha_vencimiento' => ['nullable', 'date', 'after:fecha_firma'],
        ];
    }
}
