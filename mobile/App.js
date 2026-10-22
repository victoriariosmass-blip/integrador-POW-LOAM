import { registerRootComponent } from 'expo';
import React from 'react';
import NavegadorPrincipal from './src/navegacion/NavegadorPrincipal';

function App() {
  return <NavegadorPrincipal />;
}

export default registerRootComponent(App);