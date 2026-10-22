'use client';
import { useRef } from 'react';
 
// codigo de N digitos en casillas separadas.
// pasa solo a la casilla siguiente, backspace vuelve a la anterior y se puede pegar el código entero.
export default function CodeInput({ largo = 6, valor, onChange, invalido = false, idError }) {
  const refs = useRef([]);
  const digitos = Array.from({ length: largo }, (_, i) => valor[i] ?? '');
 
  function cambiar(i, texto) {
    const solo = texto.replace(/\D/g, '');
    if (!solo) {
      const nuevo = [...digitos];
      nuevo[i] = '';
      onChange(nuevo.join(''));
      return;
    }
    const nuevo = [...digitos];
    for (let j = 0; j < solo.length && i + j < largo; j++) nuevo[i + j] = solo[j];
    onChange(nuevo.join(''));
    refs.current[Math.min(i + solo.length, largo - 1)]?.focus();
  }
 
  function teclaAbajo(i, ev) {
    if (ev.key === 'Backspace' && !digitos[i] && i > 0) refs.current[i - 1]?.focus();
  }
 
  return (
    <div className="d-flex gap-2 justify-content-between" role="group" aria-label={`Código de ${largo} dígitos`}>
      {digitos.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`form-control text-center fs-4 px-0 ${invalido ? 'is-invalid' : ''}`}
          style={{ width: 48, height: 56, backgroundImage: 'none', paddingRight: 0 }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={largo}
          value={d}
          aria-label={`Dígito ${i + 1}`}
          aria-invalid={invalido || undefined}
          aria-describedby={invalido ? idError : undefined}
          onChange={(e) => cambiar(i, e.target.value)}
          onKeyDown={(e) => teclaAbajo(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}