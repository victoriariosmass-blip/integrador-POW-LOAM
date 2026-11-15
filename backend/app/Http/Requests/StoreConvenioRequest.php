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
            'tipo' => ['required', 'in:' . implode(',', \App\Models\Convenio::TIPOS)],
            'objeto' => ['required', 'string'],
            'unidad_id' => ['nullable', 'exists:unidades,id'],
            // resto de la ficha (enunciado: "Ficha del convenio: incluir ... alcance, obligaciones,
            // condiciones de rescisión, marco legal, resolución, expediente o referencia, condiciones de
            // renovación, confidencialidad, notas y fechas de firma, inicio, vencimiento y preaviso")
            'alcance' => ['nullable', 'string'],
            'obligaciones' => ['nullable', 'string'],
            'condiciones_rescision' => ['nullable', 'string'],
            'marco_legal' => ['nullable', 'string'],
            'resolucion' => ['nullable', 'string', 'max:50'],
            'expediente' => ['nullable', 'string', 'max:50'],
            'condiciones_renovacion' => ['nullable', 'string'],
            'renovacion_automatica' => ['boolean'],
            'confidencial' => ['boolean'],
            'notas' => ['nullable', 'string'],
            'fecha_firma' => ['nullable', 'date'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_vencimiento' => ['nullable', 'date', 'after:fecha_firma'],
            'dias_preaviso' => ['nullable', 'integer', 'min:0'],
        ];
    }
}