//pantalla para comentarios con el detector automatico de lenguaje ofensivo (reemplaza "comentario ofensivo") al detectar
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { BotonPersonalizado } from '../componentes/atomos/BotonPersonalizado';
import { usarPreferencias } from '../contexto/ContextoPreferencias';

const PALABRAS_OFENSIVAS = ['inoperante', 'estafa', 'fraude', 'odio', 'corrupto'];

export default function PantallaComentarios({ idConvenio }) {
  const { colores, esModoOscuro } = usarPreferencias();
  const [comentarios, setComentarios] = useState([
    { id: '1', autor: 'Rectorado', texto: 'Revisión técnica aprobada.', hora: '1h' },
  ]);
  const [nuevoTexto, setNuevoTexto] = useState('');

  const agregarComentario = () => {
    if (!nuevoTexto.trim()) return;

    // Regla de detección de comentario ofensivo
    const contieneOfensas = PALABRAS_OFENSIVAS.some((palabra) =>
      nuevoTexto.toLowerCase().includes(palabra)
    );

    const comentarioFinal = contieneOfensas ? 'comentario ofensivo' : nuevoTexto;

    const elemento = {
      id: Date.now().toString(),
      autor: 'Mi Usuario',
      texto: comentarioFinal,
      esBloqueado: contieneOfensas,
      hora: 'Ahora',
    };

    setComentarios([...comentarios, elemento]);
    setNuevoTexto('');
  };

  const obtenerFondoComentario = (esBloqueado) => {
    if (!esBloqueado) return colores.tarjeta;
    return esModoOscuro ? '#451A1A' : '#FED7D7';
  };

  return (
    <View style={[estilos.contenedor, { backgroundColor: colores.fondo }]}>
      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              estilos.burbuja,
              item.esBloqueado && estilos.burbujaOfensiva,
              {
                backgroundColor: obtenerFondoComentario(item.esBloqueado),
                borderColor: item.esBloqueado ? colores.error : colores.borde,
              },
            ]}
          >
            <Text style={[estilos.autor, { color: colores.textoSecundario }]}>{item.autor} • {item.hora}</Text>
            <Text style={{ color: item.esBloqueado ? colores.error : colores.textoPrincipal }}>
              {item.texto}
            </Text>
          </View>
        )}
      />

      <View style={estilos.filaEntrada}>
        <TextInput
          style={[
            estilos.input,
            { backgroundColor: colores.tarjeta, borderColor: colores.borde, color: colores.textoPrincipal },
          ]}
          placeholder="Escribí un comentario interno..."
          placeholderTextColor={colores.textoSecundario}
          value={nuevoTexto}
          onChangeText={setNuevoTexto}
        />
        <BotonPersonalizado titulo="Enviar" alPresionar={agregarComentario} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, paddingVertical: 10 },
  burbuja: { padding: 12, borderRadius: 8, marginVertical: 4, borderWidth: 1 },
  burbujaOfensiva: { borderWidth: 1 },
  autor: { fontSize: 11, marginBottom: 4, fontWeight: 'bold' },
  filaEntrada: { marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 6 },
});