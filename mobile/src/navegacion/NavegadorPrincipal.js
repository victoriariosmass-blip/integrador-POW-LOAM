//navegador general tipo pila que contiene a NavegadorPestanias y permite abrir las pantallas que se superponen
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavegadorPestanias } from './NavegadorPestanias';
import PantallaDetalleConvenio from '../pantallas/PantallaDetalleConvenio';
import PantallaFirmaConvenio from '../pantallas/PantallaFirmaConvenio';
import PantallaSubirAnexo from '../pantallas/PantallaSubirAnexo';
import PantallaSostenibilidad from '../pantallas/PantallaSostenibilidad';
import { ProveedorPreferencias } from '../contexto/ContextoPreferencias';

const Pila = createNativeStackNavigator();

export default function NavegadorPrincipal() {
  return (
    <ProveedorPreferencias>
      <NavigationContainer>
        <Pila.Navigator screenOptions={{ headerShown: true }}>
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
        </Pila.Navigator>
      </NavigationContainer>
    </ProveedorPreferencias>
  );
}