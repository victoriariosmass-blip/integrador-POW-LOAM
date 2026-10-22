<?php

namespace App\Policies;

use App\Models\Convenio;
use App\Models\User;

/**
 * Matriz de permisos sobre convenios (ver el documento del proyecto).
 * Laravel la encuentra sola por el nombre: ConvenioPolicy -> Convenio.
 * Uso: Gate::forUser($user)->authorize('firmar', $convenio)
 */
class ConvenioPolicy
{
    /** Ver la ficha y descargar sus PDF: lo mismo que el listado */
    public function view(User $user, Convenio $convenio): bool
    {
        return Convenio::visiblesPara($user)->whereKey($convenio->id)->exists();
    }

    /** Dar de alta un convenio */
    public function create(User $user): bool
    {
        return $user->tieneRol('admin', 'gestor');
    }

    /** Editar el borrador y subir PDF o anexos */
    public function update(User $user, Convenio $convenio): bool
    {
        return $user->tieneRol('admin', 'gestor')
            && $convenio->estado === 'borrador'
            && $this->view($user, $convenio);
    }

    /** Pasar de borrador a revisión */
    public function enviarARevision(User $user, Convenio $convenio): bool
    {
        return $this->update($user, $convenio);
    }

    /** Aprobar o devolver con observaciones */
    public function revisar(User $user, Convenio $convenio): bool
    {
        if ($convenio->estado !== 'revision') {
            return false;
        }
        if ($user->esAdmin()) {
            return true;
        }
        return $user->rol === 'revisor'
            && $convenio->asignaciones()->where('revisor_id', $user->id)->exists();
    }

    /** Firmar (solo autoridad, solo aprobados, solo los que puede ver) */
    public function firmar(User $user, Convenio $convenio): bool
    {
        return $user->esAutoridad()
            && $convenio->estado === 'aprobado'
            && $this->view($user, $convenio);
    }

    /** Rescindir un convenio firmado */
    public function rescindir(User $user, Convenio $convenio): bool
    {
        return $user->esAdmin() && $convenio->estado === 'firmado';
    }

    /** Archivar un convenio firmado o rescindido */
    public function archivar(User $user, Convenio $convenio): bool
    {
        return $user->esAdmin() && in_array($convenio->estado, ['firmado', 'rescindido'], true);
    }

    /** Comentar (consulta no comenta) */
    public function comentar(User $user, Convenio $convenio): bool
    {
        return $user->rol !== 'consulta' && $this->view($user, $convenio);
    }
}