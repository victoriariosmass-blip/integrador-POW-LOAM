import { registerRootComponent } from 'expo';
import React from 'react';
import NavegadorPrincipal from './src/navegacion/NavegadorPrincipal';
import { ProveedorPreferencias } from './src/contexto/ContextoPreferencias';

function App() {
  return (
    <ProveedorPreferencias>
      <NavegadorPrincipal />
    </ProveedorPreferencias>
  );
}

export default registerRootComponent(App);