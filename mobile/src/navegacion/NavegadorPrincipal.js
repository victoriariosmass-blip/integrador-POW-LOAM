//navegador general tipo pila que contiene a NavegadorPestanias y permite abrir las pantallas que se superponen
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavegadorPestanias } from './NavegadorPestanias';
import PantallaDetalleConvenio from '../pantallas/PantallaDetalleConvenio';
import PantallaFirmaConvenio from '../pantallas/PantallaFirmaConvenio';
import PantallaSubirAnexo from '../pantallas/PantallaSubirAnexo';
import PantallaSostenibilidad from '../pantallas/PantallaSostenibilidad';
import PantallaLogin from '../pantallas/PantallaLogin';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { ProveedorSesion, usarSesion } from '../contexto/ContextoSesion';

const Pila = createNativeStackNavigator();

export default function NavegadorPrincipal() {
  return (
    <ProveedorSesion>
      <NavegacionConTema />
    </ProveedorSesion>
  );
}

function NavegacionConTema() {
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
    <NavigationContainer theme={tema}>
      <Pantallas />
    </NavigationContainer>
  );
}

// Sin sesión solo existe el login; con sesión, el resto de la app
function Pantallas() {
  const { usuario, cargando } = usarSesion();
  const { colores } = usarPreferencias();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.acento} />
      </View>
    );
  }

  return (
    <Pila.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colores.tarjeta },
        headerTintColor: colores.textoPrincipal,
        headerTitleStyle: { color: colores.textoPrincipal },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      {!usuario ? (
        <Pila.Screen name="Login" component={PantallaLogin} options={{ headerShown: false }} />
      ) : (
        <>
          <Pila.Screen
            name="Principal"
            component={NavegadorPestanias}
            options={{ headerShown: false }}
          />
          <Pila.Screen
            name="DetalleConvenio"
            component={PantallaDetalleConvenio}
            options={{ title: 'Ficha del Convenio' }}
          />
          <Pila.Screen
            name="FirmaConvenio"
            component={PantallaFirmaConvenio}
            options={{ title: 'Firmar Convenio' }}
          />
          <Pila.Screen
            name="SubirAnexo"
            component={PantallaSubirAnexo}
            options={{ title: 'Subir Anexo PDF' }}
          />
          <Pila.Screen
            name="Sostenibilidad"
            component={PantallaSostenibilidad}
            options={{ title: 'Impacto y Sostenibilidad' }}
          />
        </>
      )}
    </Pila.Navigator>
  );
}