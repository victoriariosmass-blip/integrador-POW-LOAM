import { registerRootComponent } from 'expo';
import React from 'react';
import NavegadorPrincipal from './src/navegacion/NavegadorPrincipal';
import { ProveedorPreferencias } from './src/contexto/ContextoPreferencias';
import { ProveedorConexion } from './src/contexto/ContextoConexion';

function App() {
  return (
    <ProveedorConexion>
      <ProveedorPreferencias>
        <NavegadorPrincipal />
      </ProveedorPreferencias>
    </ProveedorConexion>
  );
}

export default registerRootComponent(App);