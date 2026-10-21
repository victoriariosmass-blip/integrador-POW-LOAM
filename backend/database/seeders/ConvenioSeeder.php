<?php

namespace Database\Seeders;

use App\Models\AsignacionRevision;
use App\Models\Comentario;
use App\Models\Convenio;
use App\Models\ConvenioPersona;
use App\Models\DatosPasantia;
use App\Models\Parte;
use App\Models\Persona;
use App\Models\TransicionEstado;
use App\Models\Unidad;
use App\Models\User;
use App\Models\VinculoConvenio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * ~30 convenios FICTICIOS en todos los estados, con dos árboles completos:
 *  - Árbol 1 (FI, colaboración): marco -> 2 específicos -> adenda + renovación
 *  - Árbol 2 (FI, pasantías): marco -> 3 específicos de pasantía con pasantes
 * Las fechas son relativas a hoy, así siempre hay convenios vencidos,
 * próximos a vencer y vigentes.
 */
class ConvenioSeeder extends Seeder
{
    private const PREFIJOS = [
        'marco_colaboracion' => 'MC',
        'especifico_colaboracion' => 'EC',
        'marco_pasantia' => 'MP',
        'especifico_pasantia' => 'EP',
        'adenda' => 'AD',
    ];

    /** Camino normal del circuito */
    private const CAMINO = ['borrador', 'revision', 'aprobado', 'firmado'];

    private array $contadores = [];

    private User $gestorFi;
    private User $gestorFceyn;
    private User $revisor;
    private User $autoridad;
    private User $admin;
    private Parte $unlpam;

    public function run(): void
    {
        $this->gestorFi = User::where('email', 'gestor.fi@convenios.test')->firstOrFail();
        $this->gestorFceyn = User::where('email', 'gestor.fceyn@convenios.test')->firstOrFail();
        $this->revisor = User::where('email', 'revisor@convenios.test')->firstOrFail();
        $this->autoridad = User::where('email', 'autoridad@convenios.test')->firstOrFail();
        $this->admin = User::where('email', 'admin@convenios.test')->firstOrFail();
        $this->unlpam = Parte::where('tipo', 'universidad')->orderBy('id')->firstOrFail();

        $u = Unidad::pluck('id', 'sigla');
        $p = Parte::pluck('id', 'nombre');
        $hoy = today();

        // =============================================================
        // Árbol 1: colaboración FI con la Municipalidad
        // =============================================================
        $muni = Parte::find($p['Municipalidad de Villa Caldén']);

        $marco1 = $this->crear([
            'titulo' => 'Convenio marco de cooperación con la Municipalidad de Villa Caldén',
            'tipo' => 'marco_colaboracion',
            'unidad_id' => $u['FI'],
            'objeto' => 'Establecer un marco general de cooperación en docencia, investigación y extensión.',
            'estado' => 'firmado',
            'fecha_firma' => $hoy->copy()->subYears(2),
            'fecha_inicio' => $hoy->copy()->subYears(2),
            'fecha_vencimiento' => $hoy->copy()->addYears(2),
            'dias_preaviso' => 180,
            'renovacion_automatica' => true,
            'condiciones_rescision' => 'Cualquiera de las partes podrá rescindirlo con 6 meses de preaviso fehaciente.',
            'resolucion' => '101/' . $hoy->copy()->subYears(2)->year,
            'expediente' => '2001/' . $hoy->copy()->subYears(2)->year,
        ], $this->gestorFi, $muni, 'Intendente/a');

        $esp1 = $this->crear([
            'titulo' => 'Específico: relevamiento del alumbrado público con sensores',
            'tipo' => 'especifico_colaboracion',
            'unidad_id' => $u['FI'],
            'objeto' => 'Diseñar e instalar una red de sensores para medir el consumo del alumbrado público.',
            'obligaciones' => 'FI: diseño y pruebas. Municipalidad: acceso a la red y materiales.',
            'estado' => 'firmado',
            'fecha_firma' => $hoy->copy()->subYear(),
            'fecha_inicio' => $hoy->copy()->subYear(),
            'fecha_vencimiento' => $hoy->copy()->addDays(40), // próximo a vencer
            'dias_preaviso' => 60,
        ], $this->gestorFi, $muni, 'Secretario/a de Obras Públicas');
        $this->vincular($esp1, $marco1, 'especifico_de');

        $esp2 = $this->crear([
            'titulo' => 'Específico: capacitación en programación para agentes municipales',
            'tipo' => 'especifico_colaboracion',
            'unidad_id' => $u['FI'],
            'objeto' => 'Dictar cursos de programación básica para personal municipal.',
            'estado' => 'firmado',
            'fecha_firma' => $hoy->copy()->subYears(2)->addMonths(2),
            'fecha_inicio' => $hoy->copy()->subYears(2)->addMonths(2),
            'fecha_vencimiento' => $hoy->copy()->subMonths(3), // vencido
            'dias_preaviso' => 30,
        ], $this->gestorFi, $muni, 'Secretario/a de Gobierno');
        $this->vincular($esp2, $marco1, 'especifico_de');

        $adenda = $this->crear([
            'titulo' => 'Adenda I al específico de alumbrado: amplía a dos barrios más',
            'tipo' => 'adenda',
            'unidad_id' => $u['FI'],
            'objeto' => 'Ampliar el relevamiento a los barrios Norte y Las Acacias.',
            'estado' => 'aprobado', // por firmar
        ], $this->gestorFi, $muni, 'Secretario/a de Obras Públicas');
        $this->vincular($adenda, $esp1, 'adenda_de');

        $renov = $this->crear([
            'titulo' => 'Renovación del específico de capacitación para agentes municipales',
            'tipo' => 'especifico_colaboracion',
            'unidad_id' => $u['FI'],
            'objeto' => 'Continuar los cursos de programación con un segundo nivel.',
            'estado' => 'revision',
        ], $this->gestorFi, $muni, 'Secretario/a de Gobierno');
        $this->vincular($renov, $esp2, 'renueva_a');
        $this->vincular($renov, $marco1, 'especifico_de');
        $this->asignarRevision($renov);
        $this->observar($renov, 'Falta adjuntar el plan de cursos del segundo nivel.');

        // =============================================================
        // Árbol 2: pasantías FI con una empresa de software
        // =============================================================
        $soft = Parte::find($p['Software del Oeste S.R.L.']);

        $marco2 = $this->crear([
            'titulo' => 'Convenio marco de pasantías educativas con Software del Oeste',
            'tipo' => 'marco_pasantia',
            'unidad_id' => $u['FI'],
            'objeto' => 'Pasantías educativas para estudiantes de Ingeniería en Sistemas (Ley 26.427).',
            'estado' => 'firmado',
            'fecha_firma' => $hoy->copy()->subMonths(18),
            'fecha_inicio' => $hoy->copy()->subMonths(18),
            'fecha_vencimiento' => $hoy->copy()->addMonths(18),
            'dias_preaviso' => 90,
        ], $this->gestorFi, $soft, 'Socio gerente');

        $personas = Persona::orderBy('id')->get();
        $tutorDocente = $personas[0];
        $tutorEmpresa = $personas[1];

        $estadosPasantia = ['firmado', 'firmado', 'borrador'];
        foreach ($estadosPasantia as $i => $estado) {
            $pasante = $personas[2 + $i];
            $firmado = $estado === 'firmado';

            $ep = $this->crear([
                'titulo' => "Pasantía de {$pasante->nombre} {$pasante->apellido} en Software del Oeste",
                'tipo' => 'especifico_pasantia',
                'unidad_id' => $u['FI'],
                'objeto' => 'Práctica en desarrollo web dentro del equipo de producto.',
                'estado' => $estado,
                'fecha_firma' => $firmado ? $hoy->copy()->subMonths(4 - $i) : null,
                'fecha_inicio' => $firmado ? $hoy->copy()->subMonths(4 - $i) : null,
                'fecha_vencimiento' => $firmado ? $hoy->copy()->addMonths(2 + $i) : null,
                'dias_preaviso' => 15,
            ], $this->gestorFi, $soft, 'Socio gerente');
            $this->vincular($ep, $marco2, 'especifico_de');

            $vinculo = ConvenioPersona::create([
                'convenio_id' => $ep->id,
                'persona_id' => $pasante->id,
                'rol' => 'pasante',
                'fecha_desde' => $ep->fecha_inicio,
                'fecha_hasta' => $ep->fecha_vencimiento,
            ]);
            DatosPasantia::create([
                'convenio_persona_id' => $vinculo->id,
                'carrera' => 'Ingeniería en Sistemas',
                'tutor_docente_id' => $tutorDocente->id,
                'tutor_institucional_id' => $tutorEmpresa->id,
                'horas_semanales' => 20,
                'asignacion_estimulo' => 350000,
                'seguro' => 'ART Ficticia S.A.',
                'obra_social' => 'Obra Social Ficticia',
                'plan_trabajo' => 'Desarrollo de componentes web y pruebas automatizadas.',
            ]);
            foreach ([[$tutorDocente, 'tutor_docente'], [$tutorEmpresa, 'tutor_institucional']] as [$persona, $rol]) {
                ConvenioPersona::create([
                    'convenio_id' => $ep->id,
                    'persona_id' => $persona->id,
                    'rol' => $rol,
                    'fecha_desde' => $ep->fecha_inicio,
                    'fecha_hasta' => $ep->fecha_vencimiento,
                ]);
            }
        }

        // =============================================================
        // Resto: variedad de unidades, tipos y estados (sin árbol)
        // =============================================================
        $extras = [
            ['FCEyN', 'marco_colaboracion', 'firmado', 'Universidad Nacional del Sur Ficticio', 'Marco de cooperación académica e intercambio docente', -3, 2],
            ['FCEyN', 'marco_colaboracion', 'firmado', 'Fundación Horizonte Pampeano', 'Marco de cooperación en educación ambiental', -1, null],
            ['FCEyN', 'especifico_colaboracion', 'revision', 'Fundación Horizonte Pampeano', 'Monitoreo de calidad de agua en lagunas', null, null],
            ['FCEyN', 'especifico_colaboracion', 'borrador', 'Universidad Nacional del Sur Ficticio', 'Movilidad de estudiantes de Biología', null, null],
            ['FA', 'marco_colaboracion', 'firmado', 'AgroPampa Servicios S.A.', 'Marco de cooperación en innovación agropecuaria', -2, 3],
            ['FA', 'especifico_colaboracion', 'firmado', 'AgroPampa Servicios S.A.', 'Ensayos de rendimiento de cultivos de cobertura', -1, 0],
            ['FA', 'marco_pasantia', 'aprobado', 'AgroPampa Servicios S.A.', 'Marco de pasantías para Ingeniería Agronómica', null, null],
            ['FCV', 'marco_colaboracion', 'rescindido', 'Laboratorio Veterinario Médanos', 'Marco de cooperación en diagnóstico veterinario', -4, 1],
            ['FCV', 'especifico_colaboracion', 'archivado', 'Laboratorio Veterinario Médanos', 'Campaña de vacunación antirrábica', -5, -3],
            ['FCV', 'marco_pasantia', 'firmado', 'Laboratorio Veterinario Médanos', 'Marco de pasantías para Ciencias Veterinarias', -1, 2],
            ['FCEyJ', 'marco_colaboracion', 'firmado', 'Ministerio de Producción Pampeano (ficticio)', 'Marco de asistencia técnica en economía regional', -2, 1],
            ['FCEyJ', 'especifico_colaboracion', 'aprobado', 'Ministerio de Producción Pampeano (ficticio)', 'Informe de coyuntura económica provincial', null, null],
            ['FCH', 'marco_colaboracion', 'revision', 'Municipalidad de Villa Caldén', 'Marco de cooperación cultural y educativa', null, null],
            ['FCH', 'especifico_colaboracion', 'borrador', 'Fundación Horizonte Pampeano', 'Talleres de alfabetización digital para adultos', null, null],
            ['FCS', 'marco_pasantia', 'firmado', 'Hospital Regional Caldenal', 'Marco de prácticas en servicios de salud', -1, 1],
            ['FCS', 'especifico_colaboracion', 'firmado', 'Hospital Regional Caldenal', 'Capacitación en registro clínico electrónico', 0, 0],
            ['RECT', 'marco_colaboracion', 'firmado', 'Cooperativa Eléctrica Llanura', 'Marco de cooperación en eficiencia energética', -3, 3],
            ['RECT', 'especifico_colaboracion', 'revision', 'Cooperativa Eléctrica Llanura', 'Auditoría energética de edificios universitarios', null, null],
            ['FI', 'marco_colaboracion', 'borrador', 'Cooperativa Eléctrica Llanura', 'Marco de cooperación en redes eléctricas inteligentes', null, null],
        ];

        foreach ($extras as $i => [$sigla, $tipo, $estado, $parteNombre, $titulo, $aniosFirma, $aniosVence]) {
            $tieneFirma = in_array($estado, ['firmado', 'rescindido', 'archivado'], true);
            $firma = $tieneFirma ? $hoy->copy()->addYears($aniosFirma ?? 0)->subDays(10 + $i) : null;

            // Para FCS específico (0, 0): vence en 20 días -> dispara preaviso
            $vence = null;
            if ($tieneFirma && $aniosVence !== null) {
                $vence = $aniosVence === 0
                    ? $hoy->copy()->addDays(20 + $i)
                    : $hoy->copy()->addYears($aniosVence)->subDays($i);
            }

            $gestor = $sigla === 'FCEyN' ? $this->gestorFceyn : $this->gestorFi;

            $convenio = $this->crear([
                'titulo' => $titulo,
                'tipo' => $tipo,
                'unidad_id' => $u[$sigla],
                'objeto' => $titulo . '.',
                'estado' => $estado,
                'fecha_firma' => $firma,
                'fecha_inicio' => $firma,
                'fecha_vencimiento' => $vence,
                'dias_preaviso' => $vence ? 60 : null,
            ], $gestor, Parte::find($p[$parteNombre]), 'Representante legal');

            if ($estado === 'revision') {
                $this->asignarRevision($convenio);
            }
        }

        // Un comentario normal y uno detectado como ofensivo (LDMOV)
        Comentario::create([
            'convenio_id' => $esp1->id,
            'user_id' => $this->gestorFi->id,
            'tipo' => 'comentario',
            'contenido' => '¿Alguien tiene el informe de avance del segundo trimestre?',
        ]);
        Comentario::create([
            'convenio_id' => $esp1->id,
            'user_id' => $this->revisor->id,
            'tipo' => 'comentario',
            'contenido' => '[contenido removido]',
            'es_ofensivo' => true,
        ]);
    }

    // =================================================================
    // Helpers
    // =================================================================

    private function crear(array $datos, User $autor, Parte $contraparte, string $cargo): Convenio
    {
        $anio = isset($datos['fecha_firma']) && $datos['fecha_firma']
            ? Carbon::parse($datos['fecha_firma'])->year
            : today()->year;

        $convenio = Convenio::create($datos + [
            'codigo' => $this->siguienteCodigo($datos['tipo'], $anio),
            'creado_por' => $autor->id,
        ]);

        // Siempre dos partes: UNLPam + contraparte
        $convenio->partes()->attach($this->unlpam->id, [
            'representante_nombre' => 'Rita Rectora',
            'representante_cargo' => 'Rector/a',
            'es_firmante' => true,
        ]);
        $convenio->partes()->attach($contraparte->id, [
            'representante_nombre' => 'Representante de ' . $contraparte->nombre,
            'representante_cargo' => $cargo,
            'es_firmante' => true,
        ]);

        $this->registrarTransiciones($convenio, $autor);

        return $convenio;
    }

    private function siguienteCodigo(string $tipo, int $anio): string
    {
        $prefijo = self::PREFIJOS[$tipo];
        $clave = "{$prefijo}-{$anio}";
        $this->contadores[$clave] = ($this->contadores[$clave] ?? 0) + 1;

        return sprintf('%s-%d-%04d', $prefijo, $anio, $this->contadores[$clave]);
    }

    /** Genera el historial de estados coherente con el estado actual */
    private function registrarTransiciones(Convenio $convenio, User $autor): void
    {
        $destino = $convenio->estado;
        $camino = in_array($destino, ['rescindido', 'archivado'], true)
            ? [...self::CAMINO, $destino]
            : array_slice(self::CAMINO, 0, array_search($destino, self::CAMINO, true) + 1);

        $responsables = [
            'borrador' => $autor,
            'revision' => $autor,
            'aprobado' => $this->revisor,
            'firmado' => $this->autoridad,
            'rescindido' => $this->admin,
            'archivado' => $this->admin,
        ];
        $fundamentos = [
            'borrador' => 'Alta del instrumento',
            'revision' => 'Enviado a revisión',
            'aprobado' => 'Revisión administrativa sin observaciones',
            'firmado' => 'Firma registrada por las partes',
            'rescindido' => 'Rescisión comunicada por la contraparte',
            'archivado' => 'Archivado por cumplimiento del objeto',
        ];

        $anterior = null;
        foreach ($camino as $estado) {
            TransicionEstado::create([
                'convenio_id' => $convenio->id,
                'estado_desde' => $anterior,
                'estado_hasta' => $estado,
                'fundamento' => $fundamentos[$estado],
                'user_id' => $responsables[$estado]->id,
            ]);
            $anterior = $estado;
        }
    }

    private function vincular(Convenio $nuevo, Convenio $antecedente, string $tipo): void
    {
        VinculoConvenio::create([
            'convenio_origen_id' => $nuevo->id,
            'convenio_destino_id' => $antecedente->id,
            'tipo' => $tipo,
            'creado_por' => $nuevo->creado_por,
        ]);
    }

    private function asignarRevision(Convenio $convenio): void
    {
        AsignacionRevision::create([
            'convenio_id' => $convenio->id,
            'revisor_id' => $this->revisor->id,
            'asignado_por' => $this->admin->id,
            'asignado_en' => now(),
        ]);
    }

    private function observar(Convenio $convenio, string $texto): void
    {
        Comentario::create([
            'convenio_id' => $convenio->id,
            'user_id' => $this->revisor->id,
            'tipo' => 'observacion',
            'contenido' => $texto,
            'estado' => 'pendiente',
        ]);
    }
}
