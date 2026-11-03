<?php
  namespace App\Services;

  use App\Models\CodigoMfa;
  use App\Models\User;
  use Illuminate\Support\Facades\Hash;
  use Illuminate\Support\Facades\Log;

  /**
   * Verificación en dos pasos SIMULADA (aceptada por la cátedra):
   * el código se genera y se guarda con hash como si se mandara por mail o SMS,
   * pero en lugar de enviarse se escribe en storage/logs/laravel.log.
   */
  class MfaService
  {
      private const MINUTOS_VALIDEZ = 10;
      private const SEGUNDOS_ENTRE_ENVIOS = 30;

      // 'mail' (lo que manda la web) se guarda como 'email' (lo que acepta la tabla)
      private const CANALES = ['mail' => 'email', 'email' => 'email', 'sms' => 'sms'];

      public function enviarCodigo(User $usuario, string $canal = 'mail'): void
      {
          // Los códigos anteriores sin usar dejan de servir
          CodigoMfa::where('user_id', $usuario->id)->whereNull('usado_en')
              ->where('expira_en', '>', now())->update(['expira_en' => now()]);

          $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

          CodigoMfa::create([
              'user_id' => $usuario->id,
              'codigo_hash' => Hash::make($codigo),
              'canal' => self::CANALES[$canal] ?? 'email',
              'expira_en' => now()->addMinutes(self::MINUTOS_VALIDEZ),
          ]);

          // Simulación del envío
          Log::info("[MFA simulado] Código para {$usuario->email} por {$canal}: {$codigo}");
      }

      public function puedeReenviar(User $usuario): bool
      {
          $ultimo = CodigoMfa::where('user_id', $usuario->id)->latest('created_at')->latest('id')->first();
          return ! $ultimo || $ultimo->created_at->diffInSeconds(now()) >= self::SEGUNDOS_ENTRE_ENVIOS;
      }

      // true si el código es el último vigente; lo marca como usado
      public function verificar(User $usuario, string $codigo): bool
      {
          $vigente = CodigoMfa::where('user_id', $usuario->id)
              ->whereNull('usado_en')
              ->where('expira_en', '>', now())
              ->latest('created_at')->latest('id')
              ->first();

          if (! $vigente || ! Hash::check($codigo, $vigente->codigo_hash)) {
              return false;
          }

          $vigente->update(['usado_en' => now()]);
          return true;
      }
  }