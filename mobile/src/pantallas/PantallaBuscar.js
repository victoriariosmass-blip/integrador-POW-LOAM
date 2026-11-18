// Buscador avanzado: texto (código o título) + filtros por año de firma, tipo y estado.
// Enunciado de LOAM: "A parte debe ser una screen con un buscador avanzado, que permita filtros,
// como por ejemplo por año" y "el resultado ... debe figurar como un árbol" (ver ArbolConvenio).
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ArbolConvenio } from '../componentes/organismos/ArbolConvenio';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { buscarConvenios, TIPOS, ESTADOS } from '../servicios/convenios';
import { usarConexion } from '../contexto/ContextoConexion';
import { BannerSinConexion } from '../componentes/organismos/BannerSinConexion';
import { AyudaPuntual } from '../componentes/moleculas/AyudaPuntual';

const ANIO = new Date().getFullYear();
const ANIOS = [ANIO, ANIO - 1, ANIO - 2, ANIO - 3, ANIO - 4];

export default function PantallaBuscar({ navigation }) {
  const { colores, factorActual } = usarPreferencias();
  const [q, setQ] = useState('');
  const [filtros, setFiltros] = useState({ anio: '', tipo: '', estado: '' });
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState('');
  const { enLinea } = usarConexion();

  // Busca solo, medio segundo después de dejar de escribir o al cambiar un filtro
  useEffect(() => {
    if (!enLinea) return undefined; // sin conexión no se busca (se avisa arriba)
    const espera = setTimeout(() => {
      setError('');
      buscarConvenios({ q, ...filtros })
        .then(setResultados)
        .catch((e) => setError(e.message || 'No se pudo buscar'));
    }, 500);
    return () => clearTimeout(espera);
  }, [q, filtros, enLinea]);

  const cambiar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: f[campo] === valor ? '' : valor })); // tocar de nuevo lo saca

  const chips = (campo, opciones) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
      {opciones.map(([valor, etiqueta]) => {
        const activo = filtros[campo] === valor;
        return (
          <TouchableOpacity key={valor} onPress={() => cambiar(campo, valor)} accessibilityRole="button" accessibilityState={{ selected: activo }}
            style={[estilos.chip, { borderColor: activo ? colores.botonPrimario : colores.borde, backgroundColor: activo ? colores.botonPrimario : colores.tarjeta }]}>
            <Text style={{ color: activo ? '#FFFFFF' : colores.textoPrincipal, fontSize: 13 * factorActual, fontWeight: '600' }}>{etiqueta}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const etiqueta = (t) => <Text style={[estilos.etiqueta, { color: colores.textoSecundario, fontSize: 12 * factorActual }]}>{t}</Text>;

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
      {!enLinea && <BannerSinConexion mensaje="Sin conexión • El buscador no está disponible. Puede ver sus pendientes." />}
      <AyudaPuntual texto="Escriba parte del código o del título y, si lo desea, seleccione año de firma, tipo o estado. Presione ▸ en un resultado para ver su convenio padre, sus hijos, la resolución y los documentos; presione el código para abrir la ficha." />
      <TextInput
        style={[estilos.campo, { backgroundColor: colores.tarjeta, borderColor: colores.borde, color: colores.textoPrincipal, fontSize: 16 * factorActual }]}
        placeholder="Código o título (ej: MC-2024, pasantía…)" placeholderTextColor={colores.textoSecundario}
        value={q} onChangeText={setQ} autoFocus returnKeyType="search" accessibilityLabel="Buscar convenios por código o título"
      />
      {etiqueta('AÑO DE FIRMA')}
      {chips('anio', ANIOS.map((a) => [String(a), String(a)]))}
      {etiqueta('TIPO')}
      {chips('tipo', Object.entries(TIPOS))}
      {etiqueta('ESTADO')}
      {chips('estado', Object.entries(ESTADOS))}

      {error ? <Text style={{ color: colores.error, marginVertical: 8 }}>{error}</Text> : null}
      {enLinea && resultados === null && !error && <ActivityIndicator color={colores.acento} style={{ marginTop: 16 }} />}
      {resultados?.length === 0 && <Text style={{ color: colores.textoSecundario, marginTop: 12 }}>No hay convenios con esos filtros.</Text>}
      {resultados?.length > 0 && (
        <Text style={{ color: colores.textoSecundario, fontSize: 12 * factorActual, marginVertical: 8 }}>
          {resultados.length} resultado{resultados.length > 1 ? 's' : ''} · presione ▸ para ver padre, hijos, resolución y documentos
        </Text>
      )}
      {resultados?.map((c) => <ArbolConvenio key={c.id} convenio={c} navigation={navigation} />)}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 32 },
  campo: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  etiqueta: { fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 },
});