//navegador general tipo pila que contiene a NavegadorPestanias y permite abrir las pantallas que se superponen
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavegadorPestanias } from './NavegadorPestanias';
import PantallaDetalleConvenio from '../pantallas/PantallaDetalleConvenio';
import PantallaFirmaConvenio from '../pantallas/PantallaFirmaConvenio';
import PantallaSubirAnexo from '../pantallas/PantallaSubirAnexo';
import PantallaSostenibilidad from '../pantallas/PantallaSostenibilidad';
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaCodigoMfa from '../pantallas/PantallaCodigoMfa';
import PantallaEscanear from '../pantallas/PantallaEscanear';
import PantallaDesbloqueo from '../pantallas/PantallaDesbloqueo';
import PantallaBloqueo from '../pantallas/PantallaBloqueo';
import PantallaConveniosUnidad from '../pantallas/PantallaConveniosUnidad';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { ProveedorSesion, usarSesion } from '../contexto/ContextoSesion';

const Pila = createNativeStackNavigator();
const navegacion = createNavigationContainerRef(); // para abrir la ficha al tocar una notificación

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

  // Al tocar un aviso se abre la ficha de ese convenio. Si la app estaba cerrada o bloqueada,
  // queda pendiente y se abre apenas haya sesión y esté desbloqueada. (En la web no hay avisos.)
  const { usuario, bloqueada } = usarSesion();
  const [avisoTocado, setAvisoTocado] = useState(null); // { id, codigo }
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const guardar = (respuesta) => {
      const datos = respuesta?.notification.request.content.data;
      if (datos?.id) setAvisoTocado(datos);
    };
    guardar(Notifications.getLastNotificationResponse()); // la app se abrió tocando el aviso
    const sub = Notifications.addNotificationResponseReceivedListener(guardar); // la app ya estaba abierta
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (avisoTocado && usuario && !bloqueada && navegacion.isReady()) {
      navegacion.navigate('DetalleConvenio', { id: avisoTocado.id, idConvenio: avisoTocado.codigo });
      setAvisoTocado(null);
      Notifications.clearLastNotificationResponse();
    }
  }, [avisoTocado, usuario, bloqueada]);

  return (
    <NavigationContainer theme={tema} ref={navegacion}>
      <Pantallas />
    </NavigationContainer>
  );
}

// Sin sesión solo existe el login; con sesión, el resto de la app
function Pantallas() {
  const { usuario, cargando, bloqueada, pendienteMfa } = usarSesion();
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
        pendienteMfa ? (
          <Pila.Screen name="CodigoMfa" component={PantallaCodigoMfa} options={{ headerShown: false }} />
        ) : (
          <Pila.Screen name="Login" component={PantallaLogin} options={{ headerShown: false }} />
        )
      ) : bloqueada ? (
        <Pila.Screen name="Desbloqueo" component={PantallaDesbloqueo} options={{ headerShown: false }} />
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
            name="Escanear"
            component={PantallaEscanear}
            options={{ title: 'Escanear QR' }}
          />
          <Pila.Screen
            name="SubirAnexo"
            component={PantallaSubirAnexo}
            options={{ title: 'Subir Anexo PDF' }}
          />
          <Pila.Screen
            name="Bloqueo"
            component={PantallaBloqueo}
            options={{ title: 'Bloqueo de la app' }}
          />
          <Pila.Screen
            name="ConveniosUnidad"
            component={PantallaConveniosUnidad}
            options={{ title: 'Convenios de la sede' }}
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
