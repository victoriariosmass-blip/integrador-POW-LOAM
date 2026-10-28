/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { usarPreferencias } from '../contexto/ContextoPreferencias';

export function useTheme() {
  const { colores } = usarPreferencias();

  return {
    text: colores.textoPrincipal,
    background: colores.fondo,
    backgroundElement: colores.tarjeta,
    backgroundSelected: colores.tarjetaElevada,
    textSecondary: colores.textoSecundario,
  };
}
