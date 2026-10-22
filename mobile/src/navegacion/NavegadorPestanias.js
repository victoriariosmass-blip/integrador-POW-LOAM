//configuracion de las pestañas fijas (inicio, buscar, escanear, pendientes, perfil)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PantallaInicio from '../pantallas/PantallaInicio';
import PantallaPendientes from '../pantallas/PantallaPendientes';
import PantallaPerfil from '../pantallas/PantallaPerfil';

const Pestanias = createBottomTabNavigator();

export const NavegadorPestanias = () => {
  return (
    <Pestanias.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2D3748',
        tabBarInactiveTintColor: '#A0AEC0',
      }}
    >
      <Pestanias.Screen name="Inicio" component={PantallaInicio} />
      <Pestanias.Screen name="Pendientes" component={PantallaPendientes} />
      <Pestanias.Screen name="Perfil" component={PantallaPerfil} />
    </Pestanias.Navigator>
  );
};