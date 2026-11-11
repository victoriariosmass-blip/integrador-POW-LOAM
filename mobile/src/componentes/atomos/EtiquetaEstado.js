//Para indicar el estado: Vigente, Por firmar, En trámite...
//Mismos colores que las etiquetas de la web: fondo suave, borde y texto oscuro (buen contraste).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usarPreferencias } from '../../contexto/ContextoPreferencias';

// [fondo, texto, borde] en modo claro y en modo oscuro
const COLORES = {
  vigente:      { claro: ['#E6F6EC', '#1C6B3A', '#ACDDBE'], oscuro: ['#123322', '#A7F3C0', '#1F5C38'] },
  en_tramite:   { claro: ['#FFF7E0', '#7A5300', '#F2D98F'], oscuro: ['#3A2C08', '#FCD982', '#6B5214'] },
  por_firmar:   { claro: ['#EEF0FF', '#3730A3', '#C9CBF7'], oscuro: ['#2A2654', '#C7C4FB', '#4A44A0'] },
  vencido:      { claro: ['#FDECEC', '#9B1C1C', '#F3B9B9'], oscuro: ['#3F1A24', '#FCA5A5', '#7A2A36'] },
  cancelado:    { claro: ['#FDECEC', '#9B1C1C', '#F3B9B9'], oscuro: ['#3F1A24', '#FCA5A5', '#7A2A36'] },
  sin_conexion: { claro: ['#FDECEC', '#9B1C1C', '#F3B9B9'], oscuro: ['#3F1A24', '#FCA5A5', '#7A2A36'] },
  archivado:    { claro: ['#ECEBF2', '#3D3A52', '#D3D1E0'], oscuro: ['#2A2840', '#D3D1E0', '#45425E'] },
  por_defecto:  { claro: ['#F3F3F7', '#44415C', '#DCDAE8'], oscuro: ['#26224A', '#D3D1E0', '#3D3966'] },
};

export const EtiquetaEstado = ({ texto, variante = 'por_defecto' }) => {
  const { factorActual, esModoOscuro } = usarPreferencias();
  const tono = (COLORES[variante] ?? COLORES.por_defecto)[esModoOscuro ? 'oscuro' : 'claro'];
  const [fondo, color, borde] = tono;

  return (
    <View style={[estilos.etiqueta, { backgroundColor: fondo, borderColor: borde }]}>
      <Text style={[estilos.texto, { color, fontSize: 12 * factorActual }]}>{texto}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  texto: {
    fontWeight: '600',
  },
});