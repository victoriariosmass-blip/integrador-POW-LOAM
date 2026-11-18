// Foto de perfil en miniatura (o la inicial si no hay foto).
// Enunciado de LOAM: "mi foto de perfil, la misma debe ser mostrada en miniatura en la app".
import React from 'react';
import { View, Image, Text } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

export const FotoPerfil = ({ uri, nombre = '', tamanio = 32 }) => {
  const { colores } = usarPreferencias();
  const redondo = { width: tamanio, height: tamanio, borderRadius: tamanio / 2 };
  if (uri) return <Image source={{ uri }} style={redondo} accessibilityLabel="Su foto de perfil" />;
  return (
    <View style={[redondo, { backgroundColor: colores.botonPrimario, alignItems: 'center', justifyContent: 'center' }]} accessibilityLabel="Sin foto de perfil">
      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: tamanio * 0.45 }}>{nombre.charAt(0).toUpperCase()}</Text>
    </View>
  );
};