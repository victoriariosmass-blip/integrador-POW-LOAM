//navegador general tipo pila que contiene a NavegadorPestanias y permite abrir las pantallas que se superponen
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavegadorPestanias } from './NavegadorPestanias';
import PantallaDetalleConvenio from '../pantallas/PantallaDetalleConvenio';
import PantallaFirmaConvenio from '../pantallas/PantallaFirmaConvenio';
import PantallaSubirAnexo from '../pantallas/PantallaSubirAnexo';
import PantallaSostenibilidad from '../pantallas/PantallaSostenibilidad';
import PantallaLogin from '../pantallas/PantallaLogin';
import { ProveedorPreferencias } from '../contexto/ContextoPreferencias';
import { ProveedorSesion, usarSesion } from '../contexto/ContextoSesion';

const Pila = createNativeStackNavigator();

export default function NavegadorPrincipal() {
  return (
    <ProveedorPreferencias>
      <ProveedorSesion>
        <NavigationContainer>
          <Pantallas />
        </NavigationContainer>
      </ProveedorSesion>
    </ProveedorPreferencias>
  );
}

// Sin sesión solo existe el login; con sesión, el resto de la app
function Pantallas() {
  const { usuario, cargando } = usarSesion();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Pila.Navigator screenOptions={{ headerShown: true }}>
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