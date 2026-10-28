import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/componentes/animated-icon';
import AppTabs from '@/componentes/app-tabs';
import { ProveedorPreferencias, usarPreferencias } from '../contexto/ContextoPreferencias';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ProveedorPreferencias>
      <ContenidoConTema />
    </ProveedorPreferencias>
  );
}

function ContenidoConTema() {
  const { esModoOscuro, colores } = usarPreferencias();
  const temaBase = esModoOscuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...temaBase,
    colors: {
      ...temaBase.colors,
      primary: colores.acento,
      background: colores.fondo,
      card: colores.tarjeta,
      text: colores.textoPrincipal,
      border: colores.borde,
      notification: colores.acento,
    },
  };

  return (
    <ThemeProvider value={tema}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
