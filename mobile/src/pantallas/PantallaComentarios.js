//comentarios del convenio (GET y POST /api/convenios/{id}/comentarios).
//El filtro de lenguaje ofensivo lo hace la API: si un comentario es ofensivo,
//se guarda igual pero se muestra "Comentario ofensivo" en lugar del texto.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';
import { listarComentarios, comentar, fecha } from '../servicios/convenios';

export default function PantallaComentarios({ id, puedeComentar }) {
  const { colores, factorActual } = usarPreferencias();
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try {
      setComentarios(await listarComentarios(id));
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los comentarios');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const enviar = async () => {
    const texto = nuevoTexto.trim();
    if (!texto) return;
    setEnviando(true);
    setError('');
    try {
      const nuevo = await comentar(id, texto);
      setComentarios((lista) => [...lista, nuevo]);
      setNuevoTexto('');
    } catch (e) {
      setError(e.message || 'No se pudo enviar el comentario');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <ActivityIndicator color={colores.acento} style={{ marginTop: 16 }} />;

  return (
    <View style={estilos.contenedor}>
      {comentarios.length === 0 && (
        <Text style={{ color: colores.textoSecundario, fontSize: 14 * factorActual }}>Todavía no hay comentarios.</Text>
      )}

      {/* map y no FlatList: la ficha ya está dentro de un ScrollView */}
      {comentarios.map((item) => (
        <View
          key={item.id}
          style={[
            estilos.burbuja,
            {
              backgroundColor: item.es_ofensivo ? colores.errorFondo : colores.tarjeta,
              borderColor: item.es_ofensivo ? colores.error : colores.borde,
            },
          ]}
        >
          <Text style={[estilos.autor, { color: colores.textoSecundario }]}>
            {item.autor?.name} • {fecha(item.created_at)}
          </Text>
          <Text style={{ color: item.es_ofensivo ? colores.error : colores.textoPrincipal, fontSize: 14 * factorActual, fontStyle: item.es_ofensivo ? 'italic' : 'normal' }}>
            {item.contenido}
          </Text>
        </View>
      ))}

      {error ? <Text style={[estilos.error, { color: colores.error }]}>{error}</Text> : null}

      {puedeComentar ? (
        <View style={estilos.filaEntrada}>
          <TextInput
            style={[estilos.input, { backgroundColor: colores.tarjeta, borderColor: colores.borde, color: colores.textoPrincipal, fontSize: 14 * factorActual }]}
            placeholder="Escribí un comentario..."
            placeholderTextColor={colores.textoSecundario}
            value={nuevoTexto}
            onChangeText={setNuevoTexto}
            multiline
            maxLength={2000}
            accessibilityLabel="Nuevo comentario"
          />
          <BotonPersonalizado titulo={enviando ? 'Enviando…' : 'Enviar'} alPresionar={enviar} deshabilitado={enviando || !nuevoTexto.trim()} />
        </View>
      ) : (
        <Text style={{ color: colores.textoSecundario, marginTop: 10 }}>Tu rol puede leer los comentarios pero no escribir.</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { paddingVertical: 10 },
  burbuja: { padding: 12, borderRadius: 8, marginVertical: 4, borderWidth: 1 },
  autor: { fontSize: 11, marginBottom: 4, fontWeight: 'bold' },
  error: { marginTop: 8 },
  filaEntrada: { marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 6, minHeight: 44 },
});