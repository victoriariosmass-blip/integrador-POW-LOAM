<?php
  namespace App\Services;

  use App\Models\CodigoMfa;
  use App\Models\User;
  use Illuminate\Support\Facades\Hash;
  use Illuminate\Support\Facades\Log;
  use Illuminate\Support\Facades\Mail;

  /**
   * Verificación en dos pasos (aceptada por la cátedra): el código se guarda con hash y
   * - se escribe en storage/logs/laravel.log (como siempre);
   * - se manda por mail al usuario. Con MAIL_MAILER=smtp y Mailtrap llega a la bandeja de prueba
   *   de Mailtrap (sugerido por el profe); con MAIL_MAILER=log el mail también queda en el log;
   * - en modo demo (MFA_MOSTRAR_CODIGO=true) vuelve en la respuesta como "codigo_demo" (ver datosDemo).
   * El "SMS" no se manda: queda en el log.
   */
  class MfaService
  {
      private const MINUTOS_VALIDEZ = 10;
      private const SEGUNDOS_ENTRE_ENVIOS = 30;

      // 'mail' (lo que manda la web) se guarda como 'email' (lo que acepta la tabla)
      private const CANALES = ['mail' => 'email', 'email' => 'email', 'sms' => 'sms'];

      // Genera el código, lo guarda, lo manda y lo devuelve (para el modo demo)
      public function enviarCodigo(User $usuario, string $canal = 'mail'): string
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

          // Mail (Mailtrap). Si falla (mal configurado, sin internet), el login sigue igual.
          try {
              Mail::raw(
                  "Su código de verificación es {$codigo}.\n\nVence en " . self::MINUTOS_VALIDEZ . " minutos.",
                  fn ($mensaje) => $mensaje->to($usuario->email)->subject('Su código de verificación - Convenios UNLPam'),
              );
          } catch (\Throwable $e) {
              Log::warning("[MFA] No se pudo mandar el mail a {$usuario->email}: {$e->getMessage()}");
          }

          return $codigo;
      }

      // Lo que se suma a la respuesta en modo demo: ['codigo_demo' => '123456'] o nada
      public function datosDemo(string $codigo): array
      {
          return config('mfa.mostrar_codigo') ? ['codigo_demo' => $codigo] : [];
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