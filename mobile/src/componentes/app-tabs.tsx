import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

export default function AppTabs() {
  const { colores } = usarPreferencias();

  return (
    <NativeTabs
      backgroundColor={colores.tarjeta}
      indicatorColor={colores.tarjetaElevada}
      labelStyle={{
        default: { color: colores.textoSecundario },
        selected: { color: colores.acento },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
