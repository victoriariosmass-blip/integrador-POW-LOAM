// Acceso rápido desde la sede: los convenios de esa unidad que el usuario puede ver
// (GET /api/convenios?unidad_id=...). La API ya filtra por rol y alcance.
import React, { useEffect, useState } from 'react';
import { Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ElementoConvenio } from '../componentes/moleculas/ElementoConvenio';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { listarConvenios, textoEstado } from '../servicios/convenios';

export default function PantallaConveniosUnidad({ route, navigation }) {
  const { unidad } = route.params;
  const { colores, factorActual } = usarPreferencias();
  const [convenios, setConvenios] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: `Convenios de ${unidad.sigla}` });
    listarConvenios({ unidad_id: unidad.id })
      .then(setConvenios)
      .catch((e) => setError(e.message || 'No se pudieron cargar los convenios'));
  }, [unidad.id]);

  if (error) return <Text style={[estilos.mensaje, { color: colores.error, fontSize: 15 * factorActual }]}>{error}</Text>;
  if (!convenios) return <ActivityIndicator size="large" color={colores.acento} style={{ marginTop: 32 }} />;

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={{ padding: 16 }}
      data={convenios}
      keyExtractor={(c) => String(c.id)}
      ListEmptyComponent={
        <Text style={[estilos.mensaje, { color: colores.textoSecundario, fontSize: 15 * factorActual }]}>
          No tenés convenios visibles de {unidad.nombre}.
        </Text>
      }
      renderItem={({ item }) => (
        <ElementoConvenio
          codigo={item.codigo}
          descripcion={item.titulo}
          estado={textoEstado(item)}
          alPresionar={() => navigation.navigate('DetalleConvenio', { id: item.id, idConvenio: item.codigo })}
        />
      )}
    />
  );
}

const estilos = StyleSheet.create({
  mensaje: { textAlign: 'center', marginTop: 32, paddingHorizontal: 16 },
});