<?php

// Verificación en dos pasos (ver App\Services\MfaService).
return [

    // Modo demo: si es true, el código de verificación también vuelve en la respuesta del login y
    // del reenvío ("codigo_demo"), y la web y la app lo muestran en un cartel. Solo para mostrar el
    // sistema sin abrir laravel.log ni el mail; en un sistema real va en false.
    'mostrar_codigo' => (bool) env('MFA_MOSTRAR_CODIGO', false),

];
